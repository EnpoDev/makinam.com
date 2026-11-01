import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  removeFavorite: (listingId: string) => void;
  clearFavorites: () => void;
  cleanOrphanFavorites: (existingIds: string[]) => void;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'makinam_favorites';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading favorites from localStorage', e);
    }
    return [];
  });

  const currentUserIdRef = useRef<string | null>(null);

  // Sync with Firestore when user logs in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      currentUserIdRef.current = currentUser ? currentUser.uid : null;
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            const cloudFavs = Array.isArray(data.favorites) ? data.favorites : [];
            setFavorites((prev) => {
              const combined = Array.from(new Set([...prev, ...cloudFavs]));
              // If new favorites were found in localStorage not yet in cloud, sync up
              if (combined.length !== cloudFavs.length) {
                setDoc(userDocRef, { favorites: combined }, { merge: true }).catch(() => {});
              }
              return combined;
            });
          }
        } catch (err) {
          console.warn('Firestore favoriler senkronizasyon hatası:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Error writing favorites to localStorage', e);
    }
  }, [favorites]);

  // Helper to persist to Firestore if logged in
  const syncToCloud = (newFavs: string[]) => {
    const uid = currentUserIdRef.current;
    if (uid) {
      try {
        const userDocRef = doc(db, 'users', uid);
        setDoc(userDocRef, { favorites: newFavs }, { merge: true }).catch((err) => {
          console.warn('Firestore favori güncelleme hatası:', err);
        });
      } catch (err) {
        console.warn('Firestore favori güncelleme hatası:', err);
      }
    }
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId];
      syncToCloud(next);
      return next;
    });
  };

  const isFavorite = (listingId: string) => {
    return favorites.includes(listingId);
  };

  const removeFavorite = (listingId: string) => {
    setFavorites((prev) => {
      const next = prev.filter((id) => id !== listingId);
      syncToCloud(next);
      return next;
    });
  };

  const clearFavorites = () => {
    setFavorites([]);
    syncToCloud([]);
  };

  const cleanOrphanFavorites = (existingIds: string[]) => {
    if (!existingIds || existingIds.length === 0) return;
    const existingSet = new Set(existingIds);
    setFavorites((prev) => {
      const valid = prev.filter((id) => existingSet.has(id));
      if (valid.length !== prev.length) {
        syncToCloud(valid);
        return valid;
      }
      return prev;
    });
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        removeFavorite,
        clearFavorites,
        cleanOrphanFavorites,
        favoritesCount: favorites.length
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
