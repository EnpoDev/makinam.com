import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Error writing favorites to localStorage', e);
    }
  }, [favorites]);

  const toggleFavorite = (listingId: string) => {
    setFavorites((prev) => {
      if (prev.includes(listingId)) {
        return prev.filter((id) => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  const isFavorite = (listingId: string) => {
    return favorites.includes(listingId);
  };

  const removeFavorite = (listingId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== listingId));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const cleanOrphanFavorites = (existingIds: string[]) => {
    if (!existingIds || existingIds.length === 0) return;
    const existingSet = new Set(existingIds);
    setFavorites((prev) => {
      const valid = prev.filter((id) => existingSet.has(id));
      if (valid.length !== prev.length) {
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
