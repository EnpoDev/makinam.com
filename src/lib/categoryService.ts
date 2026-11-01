import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, cleanFirestoreDoc } from './firebase';
import { Category } from '../types';
import { categories as defaultCategories } from '../data/mockData';

/**
 * Seeds default categories into Firestore if collection is empty.
 */
export async function seedCategoriesIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, 'categories');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log("Firestore 'categories' koleksiyonu boş, varsayılan kategoriler yükleniyor...");
      for (let i = 0; i < defaultCategories.length; i++) {
        const cat = defaultCategories[i];
        await setDoc(doc(colRef, cat.id), cleanFirestoreDoc({
          ...cat,
          order: i + 1,
          updatedAt: new Date().toISOString()
        }));
      }
      console.log(`Firestore 'categories' koleksiyonuna ${defaultCategories.length} kategori başarıyla kaydedildi.`);
    }
  } catch (err) {
    console.warn('Kategoriler Firestore senkronizasyon uyarısı:', err);
  }
}

/**
 * Subscribes to real-time category updates from Firestore.
 */
export function subscribeToCategories(callback: (cats: Category[]) => void) {
  const colRef = collection(db, 'categories');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        callback(defaultCategories);
        return;
      }

      const items: (Category & { order?: number })[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.name) {
          items.push({
            ...data,
            id: d.id,
            slug: data.slug || d.id,
            iconName: data.iconName || 'Cog',
            count: typeof data.count === 'number' ? data.count : 0,
            subcategories: Array.isArray(data.subcategories) ? data.subcategories : [],
            order: typeof data.order === 'number' ? data.order : 99
          } as Category & { order?: number });
        }
      });

      // Sort by order ascending
      items.sort((a, b) => (a.order || 99) - (b.order || 99));
      callback(items);
    },
    (err) => {
      console.warn('Firestore categories live listener hatası:', err);
      callback(defaultCategories);
    }
  );
}

/**
 * Adds or updates a category in Firestore.
 */
export async function saveCategoryToFirestore(category: Category & { order?: number }): Promise<void> {
  const docRef = doc(db, 'categories', category.id);
  await setDoc(docRef, cleanFirestoreDoc({
    ...category,
    updatedAt: new Date().toISOString()
  }), { merge: true });
}

/**
 * Deletes a category from Firestore.
 */
export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  const docRef = doc(db, 'categories', categoryId);
  await deleteDoc(docRef);
}
