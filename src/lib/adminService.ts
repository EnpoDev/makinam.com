import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db, cleanFirestoreDoc } from './firebase';
import { UserProfile, Listing, StoreApplication } from '../types';

/**
 * Fetches all registered users from Firestore `users` collection.
 */
export async function getAllUsersFromFirestore(): Promise<UserProfile[]> {
  try {
    const colRef = collection(db, 'users');
    const snapshot = await getDocs(colRef);
    const users: UserProfile[] = [];
    snapshot.forEach((d) => {
      users.push({ ...d.data(), uid: d.id } as UserProfile);
    });
    return users;
  } catch (error) {
    console.warn('Kullanıcılar alınamadı:', error);
    return [];
  }
}

/**
 * Updates a user profile from the Admin Panel.
 */
export async function adminUpdateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const cleaned = cleanFirestoreDoc({ ...updates, updatedAt: serverTimestamp() });
    await updateDoc(userDocRef, cleaned);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Kullanıcı güncellenemedi.' };
  }
}

/**
 * Deletes a user profile document from Firestore.
 */
export async function adminDeleteUser(uid: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await deleteDoc(userDocRef);
    return true;
  } catch (error) {
    console.error('Kullanıcı silinemedi:', error);
    return false;
  }
}

/**
 * Quick toggle for listing features from Admin Panel (isVitrin, isUrgent, isGuvende, status).
 */
export async function adminUpdateListingFlags(
  listingId: string,
  flags: {
    status?: 'active' | 'passive' | 'sold';
    isVitrin?: boolean;
    isUrgent?: boolean;
    isGuvende?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(listingRef, {
      ...flags,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Updates full listing details from the Admin Panel.
 */
export async function adminUpdateFullListing(
  listingId: string,
  data: Partial<Listing>
): Promise<{ success: boolean; error?: string }> {
  try {
    const listingRef = doc(db, 'listings', listingId);
    const cleaned = cleanFirestoreDoc({
      ...data,
      updatedAt: serverTimestamp()
    });
    await updateDoc(listingRef, cleaned);
    return { success: true };
  } catch (err: any) {
    console.error('İlan güncellenirken hata:', err);
    return { success: false, error: err?.message || 'İlan güncellenemedi.' };
  }
}

/**
 * Updates portal settings document in Firestore (e.g. popular_brands, popular_searches, etc.).
 */
export async function adminUpdateSetting(
  settingKey: string,
  data: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'settings', settingKey);
    const cleaned = cleanFirestoreDoc({ ...data, updatedAt: new Date().toISOString() });
    await setDoc(docRef, cleaned, { merge: true });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
