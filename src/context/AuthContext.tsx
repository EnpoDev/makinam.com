import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (
    email: string, 
    pass: string, 
    displayName: string, 
    accountType: 'bireysel' | 'kurumsal',
    phone?: string,
    companyName?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getFriendlyErrorMessage: (errorCode: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setUserProfile(data);
        console.log('Firestore kullanıcı profili yüklendi:', data);
      } else {
        const initialProfile: UserProfile = {
          uid,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || 'Kullanıcı',
          accountType: 'bireysel'
        };
        await setDoc(userDocRef, initialProfile);
        setUserProfile(initialProfile);
      }
    } catch (err) {
      console.warn('Kullanıcı profili getirilirken hata oluştu:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await fetchUserProfile(cred.user.uid);
  };

  const register = async (
    email: string, 
    pass: string, 
    displayName: string, 
    accountType: 'bireysel' | 'kurumsal',
    phone?: string,
    companyName?: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName });

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName,
      accountType,
      phoneNumber: phone || '',
      companyName: companyName || '',
      createdAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUserProfile(newProfile);
    } catch (err) {
      console.warn("Firestore'a kullanıcı profili yazılırken hata:", err);
      setUserProfile(newProfile);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    
    // Check if user already has a firestore doc, if not create default
    const userDocRef = doc(db, 'users', cred.user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || '',
        displayName: cred.user.displayName || 'Kullanıcı',
        accountType: 'bireysel',
        phoneNumber: cred.user.phoneNumber || '',
        createdAt: serverTimestamp()
      };
      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);
    } else {
      setUserProfile(userDoc.data() as UserProfile);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    // Sanitize updates to prevent Firestore undefined errors
    const cleanedUpdates: Record<string, any> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) {
        cleanedUpdates[key] = val;
      }
    }

    if (!user) {
      // Offline/Demo fallback: update local state so changes persist in memory
      setUserProfile((prev) =>
        prev
          ? { ...prev, ...cleanedUpdates }
          : ({
              uid: 'demo-user',
              email: 'enespoyraz380@gmail.com',
              displayName: cleanedUpdates.displayName || 'Enes Poyraz',
              accountType: cleanedUpdates.accountType || 'bireysel',
              ...cleanedUpdates
            } as UserProfile)
      );
      return;
    }

    try {
      if (cleanedUpdates.displayName && cleanedUpdates.displayName !== user.displayName) {
        await updateProfile(user, { displayName: cleanedUpdates.displayName });
      }

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, cleanedUpdates, { merge: true });

      setUserProfile((prev) => (prev ? { ...prev, ...cleanedUpdates } : (cleanedUpdates as UserProfile)));
      console.log('Kullanıcı profili ve IBAN Firestore veritabanına kaydedildi:', cleanedUpdates);
    } catch (err) {
      console.error('Firestore profil güncellemesinde hata:', err);
      setUserProfile((prev) => (prev ? { ...prev, ...cleanedUpdates } : (cleanedUpdates as UserProfile)));
      throw err;
    }
  };

  const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Geçersiz bir e-posta adresi girdiniz.';
      case 'auth/user-disabled':
        return 'Bu hesap devre dışı bırakılmıştır.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'E-posta veya şifre hatalı. Lütfen kontrol ediniz.';
      case 'auth/wrong-password':
        return 'Hatalı şifre girdiniz.';
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresiyle zaten kayıtlı bir hesap bulunmaktadır.';
      case 'auth/weak-password':
        return 'Şifre çok zayıf. Lütfen en az 6 karakter giriniz.';
      case 'auth/popup-closed-by-user':
        return 'Google giriş penceresi kapatıldı.';
      case 'auth/network-request-failed':
        return 'İnternet bağlantınızı kontrol ediniz.';
      default:
        return 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz.';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        updateUserProfile,
        getFriendlyErrorMessage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
