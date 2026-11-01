import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp, 
  onSnapshot 
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Listing } from "../types";
import { deleteImagesFromR2 } from "./r2";

// Makinam.com Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC5JK7uQ8_9cfR7OLrnCjjKVSI4F07YCto",
  authDomain: "makinam-com.firebaseapp.com",
  projectId: "makinam-com",
  storageBucket: "makinam-com.firebasestorage.app",
  messagingSenderId: "510083944754",
  appId: "1:510083944754:web:1abb1e5bfc9fac80a0872b"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Recursively cleans any object to remove `undefined` fields which cause Firestore write crashes.
 */
export function cleanFirestoreDoc<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestoreDoc).filter((x) => x !== undefined) as any;
  }
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        res[k] = cleanFirestoreDoc(v);
      }
    }
    return res as any;
  }
  return obj;
}

// Helper: Save new listing to Firestore
export const addListingToFirestore = async (listing: Listing): Promise<string> => {
  try {
    const listingId = listing.id || `mak-${Date.now().toString().slice(-4)}`;
    const docRef = doc(db, "listings", listingId);

    const cleanedData = cleanFirestoreDoc({
      ...listing,
      id: listingId,
      createdAt: serverTimestamp()
    });

    await setDoc(docRef, cleanedData);
    console.log("İlan Firebase Firestore veritabanına başarıyla kaydedildi! ID:", listingId);
    return listingId;
  } catch (error) {
    console.error("Firebase'e ilan eklenirken hata oluştu:", error);
    throw error;
  }
};

// Helper: Fetch all listings from Firestore
export const fetchListingsFromFirestore = async (): Promise<Listing[]> => {
  try {
    const colRef = collection(db, "listings");
    const snapshot = await getDocs(colRef);
    const listings: Listing[] = [];
    
    snapshot.forEach((d) => {
      const data = d.data();
      // Exclude simple test dummy documents if any
      if (data.title && data.title !== 'Deneme Ilan') {
        const adNoFromFeatures = Array.isArray(data.features)
          ? data.features.find((f: any) =>
              String(f.label || '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().includes('ilan')
            )?.value
          : undefined;

        listings.push({
          ...data,
          id: d.id,
          adNo: data.adNo || adNoFromFeatures || d.id
        } as Listing);
      }
    });

    console.log(`Firestore'dan ${listings.length} adet ilan başarıyla yüklendi.`);
    return listings;
  } catch (error) {
    console.warn("Firestore verileri alınamadı. Yerel veriler kullanılıyor:", error);
    return [];
  }
};

// Helper: Real-time listener for live sync across devices
export const subscribeToListings = (callback: (listings: Listing[]) => void) => {
  const colRef = collection(db, "listings");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const listings: Listing[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.title && data.title !== 'Deneme Ilan') {
          const adNoFromFeatures = Array.isArray(data.features)
            ? data.features.find((f: any) =>
                String(f.label || '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase().includes('ilan')
              )?.value
            : undefined;

          listings.push({
            ...data,
            id: d.id,
            adNo: data.adNo || adNoFromFeatures || d.id
          } as Listing);
        }
      });
      callback(listings);
    },
    (error) => {
      console.warn("Firestore live listener hatası:", error);
    }
  );
};

// Helper: Delete listing from Firestore and clean up photos from Cloudflare R2
export const deleteListingFromFirestore = async (
  listingId: string,
  imageURLs?: string[]
): Promise<void> => {
  try {
    const docRef = doc(db, "listings", listingId);
    let imagesToDelete = imageURLs;

    // If images weren't provided directly, retrieve them from Firestore document before deleting
    if (!imagesToDelete || imagesToDelete.length === 0) {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.images) && data.images.length > 0) {
          imagesToDelete = data.images;
        }
      }
    }

    // Delete document from Firestore
    await deleteDoc(docRef);
    console.log("İlan Firestore veritabanından kalıcı olarak silindi. ID:", listingId);

    // Delete associated photos from Cloudflare R2
    if (imagesToDelete && imagesToDelete.length > 0) {
      await deleteImagesFromR2(imagesToDelete);
    }
  } catch (error) {
    console.error("Firestore'dan ilan silinirken hata:", error);
    throw error;
  }
};

// Helper: Update listing status (active / passive / sold) in Firestore
export const updateListingStatusInFirestore = async (
  listingId: string, 
  status: 'active' | 'passive' | 'sold'
): Promise<void> => {
  try {
    const docRef = doc(db, "listings", listingId);
    await updateDoc(docRef, { status });
    console.log("İlan durumu Firestore'da güncellendi:", listingId, status);
  } catch (error) {
    console.error("Firestore'da ilan durumu güncellenirken hata:", error);
    throw error;
  }
};
