import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category } from '../types';
import { categories as fallbackCategories } from '../data/mockData';
import { subscribeToCategories, seedCategoriesIfEmpty } from '../lib/categoryService';

interface CategoryContextType {
  categories: Category[];
  isLoadingCategories: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // Check & seed if DB is empty
    seedCategoriesIfEmpty();

    // Subscribe to real-time live Firestore changes on 'categories' collection
    const unsubscribe = subscribeToCategories((liveCategories) => {
      if (isMounted) {
        if (liveCategories && liveCategories.length > 0) {
          setCategories(liveCategories);
        }
        setIsLoadingCategories(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoadingCategories
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
