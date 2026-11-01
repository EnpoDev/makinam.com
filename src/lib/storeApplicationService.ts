import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, cleanFirestoreDoc } from './firebase';
import { StoreApplication, UserProfile } from '../types';

export interface StoreApplicationFormData {
  companyName: string;
  legalTitle: string;
  companyType: 'limited' | 'anonim' | 'sahis' | 'diger';
  taxOffice: string;
  taxNumber: string;
  contactName: string;
  contactTitle?: string;
  email: string;
  phone: string;
  landlinePhone?: string;
  city: string;
  district: string;
  address: string;
  mainCategory: string;
  estimatedMonthlyListings?: string;
  preferredPackage?: 'standart' | 'gold' | 'platin';
  notes?: string;
}

/**
 * Creates a new corporate store application in Firestore `store_applications` collection.
 */
export async function submitStoreApplication(
  formData: StoreApplicationFormData
): Promise<{ success: boolean; applicationNo: string; applicationId: string; error?: string }> {
  try {
    const colRef = collection(db, 'store_applications');
    const newDocRef = doc(colRef);
    const applicationId = newDocRef.id;

    // Generate readable application tracking number e.g. BAS-2026-492104
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const applicationNo = `BAS-${new Date().getFullYear()}-${randomDigits}`;

    const applicationPayload: StoreApplication = {
      id: applicationId,
      applicationNo,
      status: 'pending',
      companyName: formData.companyName.trim(),
      legalTitle: formData.legalTitle.trim(),
      companyType: formData.companyType,
      taxOffice: formData.taxOffice.trim(),
      taxNumber: formData.taxNumber.trim(),
      contactName: formData.contactName.trim(),
      contactTitle: formData.contactTitle?.trim() || '',
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      landlinePhone: formData.landlinePhone?.trim() || '',
      city: formData.city.trim(),
      district: formData.district.trim(),
      address: formData.address.trim(),
      mainCategory: formData.mainCategory,
      estimatedMonthlyListings: formData.estimatedMonthlyListings || '1-10',
      preferredPackage: formData.preferredPackage || 'standart',
      notes: formData.notes?.trim() || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const cleaned = cleanFirestoreDoc(applicationPayload);
    await setDoc(newDocRef, cleaned);

    console.log(`Kurumsal mağaza başvurusu alındı: ${applicationNo} (${applicationId})`);
    return { success: true, applicationNo, applicationId };
  } catch (err: any) {
    console.error('Kurumsal mağaza başvurusu kaydedilemedi:', err);
    return {
      success: false,
      applicationNo: '',
      applicationId: '',
      error: err?.message || 'Başvuru kaydedilirken bir hata oluştu.'
    };
  }
}

/**
 * Fetches all store applications from Firestore, optionally filtered by status.
 * Used for admin panel and representative reviews.
 */
export async function getStoreApplications(
  filterStatus?: 'pending' | 'reviewing' | 'approved' | 'rejected'
): Promise<StoreApplication[]> {
  try {
    const colRef = collection(db, 'store_applications');
    let q = query(colRef, orderBy('createdAt', 'desc'));

    if (filterStatus) {
      q = query(colRef, where('status', '==', filterStatus), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const list: StoreApplication[] = [];
    snapshot.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as StoreApplication);
    });
    return list;
  } catch (err) {
    console.warn('Kurumsal başvurular yüklenemedi:', err);
    return [];
  }
}

/**
 * Gets a single store application by its ID.
 */
export async function getStoreApplicationById(applicationId: string): Promise<StoreApplication | null> {
  try {
    const docRef = doc(db, 'store_applications', applicationId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as StoreApplication;
  } catch (err) {
    console.error('Başvuru detayı çekilemedi:', err);
    return null;
  }
}

/**
 * Approves a corporate store application by a representative or admin.
 * Sets status to 'approved' and marks who approved it.
 */
export async function approveStoreApplication(
  applicationId: string,
  reviewedBy: string = 'Temsilci / Admin',
  reviewNotes: string = 'Belgeler incelendi ve onaylandı.',
  createdUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'store_applications', applicationId);
    await updateDoc(docRef, {
      status: 'approved',
      reviewedBy,
      reviewNotes,
      createdUserId: createdUserId || null,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Subscribes to real-time live updates of store applications.
 */
export function subscribeToStoreApplications(
  callback: (applications: StoreApplication[]) => void
) {
  const colRef = collection(db, 'store_applications');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: StoreApplication[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as StoreApplication);
      });
      callback(list);
    },
    (err) => {
      console.warn('Kurumsal başvurular canlı dinlenirken hata:', err);
    }
  );
}

/**
 * Approves a store application and creates/upgrades corporate user membership in Firestore.
 */
export async function approveAndCreateCorporateUser(
  application: StoreApplication,
  reviewedBy: string = 'Temsilci / Admin',
  reviewNotes: string = 'Evraklar ve vergi levhası doğrulandı. Kurumsal mağaza üyeliği aktif edildi.'
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    if (!application.id) {
      return { success: false, error: 'Geçersiz başvuru kimliği.' };
    }

    // 1. Check if user already exists in `users` collection by email
    const usersCol = collection(db, 'users');
    const userQuery = query(usersCol, where('email', '==', application.email.toLowerCase().trim()));
    const existingSnap = await getDocs(userQuery);

    let targetUserId = '';

    if (!existingSnap.empty) {
      // User exists: upgrade to Kurumsal Mağaza
      const existingDoc = existingSnap.docs[0];
      targetUserId = existingDoc.id;

      await updateDoc(doc(db, 'users', targetUserId), {
        accountType: 'kurumsal',
        isApprovedStore: true,
        companyName: application.companyName,
        taxOffice: application.taxOffice,
        taxNumber: application.taxNumber,
        city: application.city,
        district: application.district,
        address: application.address,
        phoneNumber: application.phone,
        preferredPackage: application.preferredPackage || 'standart',
        updatedAt: serverTimestamp()
      });
    } else {
      // Create a new pre-approved corporate profile doc in `users`
      const newCorporateUserDoc = doc(collection(db, 'users'));
      targetUserId = newCorporateUserDoc.id;

      const newProfile: UserProfile = {
        uid: targetUserId,
        email: application.email.toLowerCase().trim(),
        displayName: application.contactName,
        phoneNumber: application.phone,
        accountType: 'kurumsal',
        isApprovedStore: true,
        companyName: application.companyName,
        taxOffice: application.taxOffice,
        taxNumber: application.taxNumber,
        city: application.city,
        district: application.district,
        address: application.address,
        createdAt: serverTimestamp()
      };

      await setDoc(newCorporateUserDoc, cleanFirestoreDoc(newProfile));
    }

    // 2. Mark application as approved
    const appDocRef = doc(db, 'store_applications', application.id);
    await updateDoc(appDocRef, {
      status: 'approved',
      reviewedBy,
      reviewNotes,
      createdUserId: targetUserId,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`Kurumsal mağaza başvurusu onaylandı ve üyelik oluşturuldu: ${application.applicationNo} -> User ID: ${targetUserId}`);
    return { success: true, userId: targetUserId };
  } catch (err: any) {
    console.error('Başvuru onaylanırken hata:', err);
    return { success: false, error: err?.message || 'Onay işlemi tamamlanamadı.' };
  }
}

/**
 * Rejects a corporate store application with a reason.
 */
export async function rejectStoreApplication(
  applicationId: string,
  reviewedBy: string = 'Temsilci / Admin',
  reviewNotes: string = 'Eksik veya hatalı vergi levhası / evrak bilgisi.'
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'store_applications', applicationId);
    await updateDoc(docRef, {
      status: 'rejected',
      reviewedBy,
      reviewNotes,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Permanently deletes a store application from Firestore.
 */
export async function deleteStoreApplication(applicationId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'store_applications', applicationId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Başvuru silinemedi:', err);
    return false;
  }
}

