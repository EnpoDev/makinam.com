import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { CategoryProvider } from './context/CategoryContext';
import { Listing } from './types';
import { seedPortalDataIfEmpty } from './lib/portalService';
import { 
  fetchListingsFromFirestore, 
  addListingToFirestore, 
  subscribeToListings,
  deleteListingFromFirestore,
  updateListingStatusInFirestore,
  updateListingInFirestore
} from './lib/firebase';

// Lazy-loaded routes for code-splitting and rapid initial bundle loading
const ListingPage = lazy(() => import('./pages/ListingPage').then(m => ({ default: m.ListingPage })));
const DetailPage = lazy(() => import('./pages/DetailPage').then(m => ({ default: m.DetailPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const MyListingsPage = lazy(() => import('./pages/MyListingsPage').then(m => ({ default: m.MyListingsPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const MessagesPage = lazy(() => import('./pages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const PostAdPage = lazy(() => import('./pages/PostAdPage').then(m => ({ default: m.PostAdPage })));
const HelpPage = lazy(() => import('./pages/HelpPage').then(m => ({ default: m.HelpPage })));
const MakinamGuvendePage = lazy(() => import('./pages/MakinamGuvendePage').then(m => ({ default: m.MakinamGuvendePage })));
const CorporateStoreApplicationPage = lazy(() => import('./pages/CorporateStoreApplicationPage').then(m => ({ default: m.CorporateStoreApplicationPage })));
const LegalAgreementsPage = lazy(() => import('./pages/LegalAgreementsPage').then(m => ({ default: m.LegalAgreementsPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const SaasPage = lazy(() => import('./pages/SaasPage').then(m => ({ default: m.SaasPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const RouteLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
    <div className="w-8 h-8 border-3 border-[#ea580c] border-t-transparent rounded-full animate-spin mb-3"></div>
    <div className="text-[12px] font-bold text-[#1e293b]">Yükleniyor...</div>
  </div>
);

export const AppContent: React.FC = () => {
  const { cleanOrphanFavorites, removeFavorite } = useFavorites();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(true);
  const navigate = useNavigate();

  // Sync exclusively with Firestore real-time database
  useEffect(() => {
    let isMounted = true;

    const loadFirebaseListings = async () => {
      try {
        const firestoreListings = await fetchListingsFromFirestore();
        if (isMounted) {
          setListings(firestoreListings || []);
        }
      } catch (err) {
        console.warn("Firestore bağlantı uyarısı:", err);
      } finally {
        if (isMounted) {
          setIsLoadingListings(false);
        }
      }
    };

    // Seed portal settings if not yet existing in Firestore
    seedPortalDataIfEmpty();

    loadFirebaseListings();

    // Real-time live Firestore listener
    const unsubscribe = subscribeToListings((liveListings) => {
      if (isMounted) {
        setListings(liveListings || []);
        setIsLoadingListings(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Synchronize favorites with real existing listings to eliminate ghost/orphan counts
  useEffect(() => {
    if (!isLoadingListings && listings.length > 0) {
      cleanOrphanFavorites(listings.map((l) => l.id));
    }
  }, [listings, isLoadingListings, cleanOrphanFavorites]);

  const handleAddListing = async (newListing: Listing) => {
    // Optimistic UI update
    setListings((prev) => [newListing, ...prev]);

    // Persist to Firebase Firestore
    try {
      await addListingToFirestore(newListing);
      console.log("İlan Firebase Firestore veritabanına başarıyla yazıldı.");
    } catch (error) {
      console.error("Firebase Firestore'a yazılırken hata:", error);
    }
  };

  const handleUpdateListingStatus = async (listingId: string, newStatus: 'active' | 'passive' | 'sold') => {
    // Optimistic local update
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
    );

    // Persist status change to Firestore
    try {
      await updateListingStatusInFirestore(listingId, newStatus);
    } catch (err) {
      console.error("Firestore'da ilan durumu güncellenirken hata:", err);
    }
  };

  const handleUpdateListing = async (listingId: string, updates: Partial<Listing>) => {
    // Optimistic local update
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, ...updates } : l))
    );

    // Persist updates to Firestore
    try {
      await updateListingInFirestore(listingId, updates);
    } catch (err) {
      console.error("Firestore'da ilan güncellenirken hata:", err);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    // Get target images to ensure cleanup from Cloudflare R2
    const targetListing = listings.find((l) => l.id === listingId);
    const targetImages = targetListing?.images || [];

    // Optimistic local update
    setListings((prev) => prev.filter((l) => l.id !== listingId));
    removeFavorite(listingId);

    // Persist deletion to Firestore and clean up images from Cloudflare R2
    try {
      await deleteListingFromFirestore(listingId, targetImages);
    } catch (err) {
      console.error("Firestore'dan ilan silinirken hata:", err);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    navigate(`/giris-yap${mode === 'register' ? '?mode=register' : ''}`);
  };

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* 1. STANDALONE LOGIN & REGISTER PAGE */}
        <Route path="/giris-yap" element={<LoginPage />} />
      <Route path="/giris" element={<LoginPage />} />
      <Route path="/hesap-ac" element={<LoginPage />} />

      {/* 2. DEDICATED ADMIN & REPRESENTATIVE PANEL */}
      <Route path="/admin" element={<AdminPage listings={listings} />} />
      <Route path="/admin/*" element={<AdminPage listings={listings} />} />

      {/* 3. DEDICATED SAAS & CORPORATE BILLING PORTAL */}
      <Route path="/saas" element={<SaasPage />} />
      <Route path="/saas/*" element={<SaasPage />} />
      <Route path="/saas/giris" element={<SaasPage />} />
      <Route path="/saas/faturalama" element={<SaasPage />} />

      {/* 2. REGULAR MARKETPLACE PAGES (Header & Footer) */}
      <Route
        path="/*"
        element={
          <div className="min-h-screen flex flex-col bg-[#f1f4f8] text-[#1e293b]">
            <Header 
              listings={listings}
              onOpenPostAd={() => navigate('/ilan-ver')}
              onOpenAuth={handleOpenAuth}
            />

            <div className="flex-1">
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      listings={listings}
                      onOpenPostAd={() => navigate('/ilan-ver')}
                    />
                  }
                />
                <Route
                  path="/ilanlar"
                  element={<ListingPage listings={listings} />}
                />
                <Route
                  path="/ilan/:id"
                  element={<DetailPage listings={listings} />}
                />
                
                {/* Dedicated Multi-Step Post Ad Flow */}
                <Route
                  path="/ilan-ver"
                  element={<PostAdPage onAddListing={handleAddListing} />}
                />
                <Route
                  path="/ucretsiz-ilan-ver"
                  element={<PostAdPage onAddListing={handleAddListing} />}
                />

                {/* Account / Bana Özel Pages */}
                <Route
                  path="/hesabim/ilanlarim"
                  element={
                    <MyListingsPage
                      listings={listings}
                      isLoading={isLoadingListings}
                      onOpenPostAd={() => navigate('/ilan-ver')}
                      onUpdateListingStatus={handleUpdateListingStatus}
                      onUpdateListing={handleUpdateListing}
                      onDeleteListing={handleDeleteListing}
                    />
                  }
                />
                <Route
                  path="/ilanlarim"
                  element={
                    <MyListingsPage
                      listings={listings}
                      isLoading={isLoadingListings}
                      onOpenPostAd={() => navigate('/ilan-ver')}
                      onUpdateListingStatus={handleUpdateListingStatus}
                      onUpdateListing={handleUpdateListing}
                      onDeleteListing={handleDeleteListing}
                    />
                  }
                />
                <Route
                  path="/hesabim/favorilerim"
                  element={<FavoritesPage listings={listings} />}
                />
                <Route
                  path="/favorilerim"
                  element={<FavoritesPage listings={listings} />}
                />

                {/* Messages / In-App Messaging */}
                <Route
                  path="/hesabim/mesajlarim"
                  element={<MessagesPage />}
                />
                <Route
                  path="/mesajlarim"
                  element={<MessagesPage />}
                />

                {/* Profile & Settings Page */}
                <Route
                  path="/hesabim/profil"
                  element={<ProfilePage />}
                />
                <Route
                  path="/hesabim/ayarlar"
                  element={<ProfilePage />}
                />
                <Route
                  path="/profil"
                  element={<ProfilePage />}
                />

                {/* Help & Support Center / SSS */}
                <Route
                  path="/yardim"
                  element={<HelpPage />}
                />
                <Route
                  path="/sss"
                  element={<HelpPage />}
                />
                <Route
                  path="/yardim-merkezi"
                  element={<HelpPage />}
                />

                {/* Makinam Güvende Güvenli Ticaret */}
                <Route
                  path="/makinam-guvende"
                  element={<MakinamGuvendePage />}
                />
                <Route
                  path="/guvende"
                  element={<MakinamGuvendePage />}
                />

                {/* Kurumsal Mağaza Açılış Başvurusu */}
                <Route
                  path="/kurumsal-magaza-ac"
                  element={<CorporateStoreApplicationPage />}
                />
                <Route
                  path="/magaza-ac"
                  element={<CorporateStoreApplicationPage />}
                />
                <Route
                  path="/kurumsal-basvuru"
                  element={<CorporateStoreApplicationPage />}
                />

                {/* Hukuki Sözleşmeler & Aydınlatma Metinleri */}
                <Route
                  path="/sozlesmeler"
                  element={<LegalAgreementsPage />}
                />
                <Route
                  path="/sozlesmeler/:slug"
                  element={<LegalAgreementsPage />}
                />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>

            <Footer />
          </div>
        }
      />
    </Routes>
    </Suspense>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CategoryProvider>
            <FavoritesProvider>
              <AppContent />
            </FavoritesProvider>
          </CategoryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
