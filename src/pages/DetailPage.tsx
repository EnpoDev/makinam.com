import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleImageFallback, DEFAULT_MACHINE_IMAGE } from '../utils/image';
import { ShareModal } from '../components/ShareModal';
import { SendMessageModal } from '../components/SendMessageModal';
import { MakinamGuvendePurchaseModal } from '../components/MakinamGuvendePurchaseModal';
import { normalizeSearchText, extractDigits } from '../utils/search';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  ChevronRight,
  ChevronLeft,
  Heart,
  Share2,
  AlertTriangle,
  Phone,
  MessageSquare,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  Eye,
  Award,
  Truck,
  FileText,
  Camera,
  Edit3,
  XCircle
} from 'lucide-react';

interface DetailPageProps {
  listings: Listing[];
  isLoading?: boolean;
}

// SKELETON COMPONENT FOR DETAIL PAGE
const DetailPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1240px] mx-auto px-3 py-3 font-sans animate-pulse">
      {/* 1. Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
        <div className="h-3 w-3 bg-gray-200 rounded"></div>
        <div className="h-3 w-28 bg-gray-200 rounded"></div>
        <div className="h-3 w-3 bg-gray-200 rounded"></div>
        <div className="h-3 w-36 bg-gray-200 rounded"></div>
      </div>

      {/* 2. Title Bar Skeleton */}
      <div className="border-b border-[#cbd5e1] pb-3 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="h-6 w-3/4 max-w-[500px] bg-gray-200 rounded"></div>
          <div className="h-3.5 w-40 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-28 bg-gray-200 rounded"></div>
          <div className="h-7 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* 3. Main 2-Column Classified Detail Layout */}
      <div className="flex flex-col lg:flex-row gap-3.5">
        {/* Left Column: Gallery & Description */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-2 mb-3 shadow-xs">
            {/* Main Big Photo Box */}
            <div className="aspect-[16/10] bg-gray-200 rounded-[2px] flex items-center justify-center text-gray-400">
              <Camera size={38} className="text-gray-300" />
            </div>
            {/* Thumbnail Strip */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-16 h-12 bg-gray-200 rounded-[2px]"></div>
              <div className="w-16 h-12 bg-gray-200 rounded-[2px]"></div>
              <div className="w-16 h-12 bg-gray-200 rounded-[2px]"></div>
              <div className="w-16 h-12 bg-gray-200 rounded-[2px]"></div>
            </div>
          </div>

          {/* Description & Tabs Skeleton */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-4 shadow-xs space-y-2.5">
            <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
            <div className="h-3.5 w-full bg-gray-200 rounded"></div>
            <div className="h-3.5 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-3.5 w-4/6 bg-gray-200 rounded"></div>
            <div className="h-3.5 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Right Column: Price, Specs Table, Seller Box */}
        <div className="w-full lg:w-[350px] shrink-0 space-y-2.5">
          {/* Price Box Skeleton */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-4 shadow-xs space-y-2">
            <div className="h-8 w-44 bg-gray-200 rounded"></div>
            <div className="h-3.5 w-32 bg-gray-200 rounded"></div>
          </div>

          {/* Technical Specs Table Skeleton */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] overflow-hidden shadow-xs">
            <div className="bg-[#f8fafc] px-3 py-2 border-b border-[#cbd5e1]">
              <div className="h-3.5 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="divide-y divide-[#f1f5f9]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="py-2 px-3 flex justify-between items-center">
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  <div className="h-3 w-28 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Seller Card Skeleton */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-3.5 shadow-xs space-y-3">
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-gray-200 rounded"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-9 w-full bg-gray-200 rounded"></div>
            <div className="h-9 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DetailPage: React.FC<DetailPageProps> = ({ listings, isLoading = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [directDoc, setDirectDoc] = useState<Listing | null>(null);
  const [isFetchingDirect, setIsFetchingDirect] = useState<boolean>(true);

  // Check in-memory listings by ID or "İlan No" feature
  const inMemoryListing = listings.find((item) => {
    if (!id) return false;
    if (item.id === id) return true;
    if (item.adNo && item.adNo === id) return true;
    const adNo = item.features?.find((f) => normalizeSearchText(f.label).includes('ilan'))?.value;
    if (adNo === id) return true;
    if (extractDigits(item.id) === extractDigits(id)) return true;
    return false;
  });

  // Fetch directly from Firestore if not present in in-memory listings
  useEffect(() => {
    let isCancelled = false;

    if (inMemoryListing) {
      setIsFetchingDirect(false);
      return;
    }

    if (!id) {
      setIsFetchingDirect(false);
      return;
    }

    const fetchDirectListing = async () => {
      setIsFetchingDirect(true);
      try {
        const docRef = doc(db, 'listings', id);
        let snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
          // Check by adNo if id was numeric
          const qSnap = await getDocs(query(collection(db, 'listings'), where('adNo', '==', id)));
          if (!qSnap.empty) {
            snapshot = qSnap.docs[0] as any;
          }
        }

        if (!isCancelled) {
          if (snapshot.exists()) {
            setDirectDoc({
              ...snapshot.data(),
              id: snapshot.id
            } as Listing);
          } else {
            setDirectDoc(null);
          }
        }
      } catch (err) {
        console.warn('Direkt ilan getirme hatası:', err);
      } finally {
        if (!isCancelled) {
          setIsFetchingDirect(false);
        }
      }
    };

    fetchDirectListing();

    return () => {
      isCancelled = true;
    };
  }, [id, inMemoryListing]);

  const listing = inMemoryListing || directDoc;
  const isPageLoading = (isLoading && !listing) || (isFetchingDirect && !listing);

  // Increment real-time view count in Firestore (once per user session)
  useEffect(() => {
    if (!listing?.id) return;
    const sessionKey = `viewed_ad_${listing.id}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    const incrementViews = async () => {
      try {
        const docRef = doc(db, 'listings', listing.id);
        await updateDoc(docRef, {
          viewsCount: increment(1)
        });
      } catch (e) {
        // Silently continue if rules/network fail
      }
    };
    incrementViews();
  }, [listing?.id]);

  const { toggleFavorite, isFavorite } = useFavorites();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isGuvendeModalOpen, setIsGuvendeModalOpen] = useState(false);
  const isItemFavorite = listing ? isFavorite(listing.id) : false;
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'location' | 'safety'>('desc');

  // While database is loading or direct fetch is pending, display the skeleton
  if (isPageLoading) {
    return <DetailPageSkeleton />;
  }

  // Only if completely done loading and listing does not exist anywhere
  if (!listing) {
    return (
      <div className="max-w-[1240px] mx-auto px-3 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-200">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-lg font-bold text-[#1e293b]">İlan bulunamadı!</h2>
        <p className="text-[#64748b] mt-1 text-xs">Aradığınız ilan yayından kaldırılmış veya satılmış olabilir.</p>
        <button
          onClick={() => navigate('/ilanlar')}
          className="mt-4 bg-[#ea580c] hover:bg-[#d94e08] text-white px-4 py-2 rounded-[2px] text-xs font-bold transition-colors"
        >
          Tüm İlanlara Dön
        </button>
      </div>
    );
  }

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('tr-TR')} ${currency === 'TL' ? 'TL' : currency}`;
  };

  const isSold = listing.status === 'sold';
  const isPassive = listing.status === 'passive';
  const isInactive = isSold || isPassive;

  const isOwner = Boolean(
    user && (
      (listing.userId && user.uid === listing.userId) ||
      (listing.userId && user.email === listing.userId) ||
      (userProfile?.phoneNumber && listing.seller?.phone && listing.seller.phone === userProfile.phoneNumber) ||
      (userProfile?.displayName && listing.seller?.name && listing.seller.name.toLowerCase() === userProfile.displayName.toLowerCase())
    )
  );

  const rawPhone = listing.seller?.phone?.replace(/\*\*/g, '45') || '';
  const hasHiddenPhone = !rawPhone || rawPhone.toLowerCase().includes('mesaj') || rawPhone.toLowerCase().includes('ulaş');
  const fullPhone = hasHiddenPhone ? '' : rawPhone;
  const cleanPhoneDigits = fullPhone.replace(/[^0-9]/g, '');
  const isValidPhone = cleanPhoneDigits.length >= 10;
  const isMobile = cleanPhoneDigits.startsWith('05') || cleanPhoneDigits.startsWith('5') || (cleanPhoneDigits.startsWith('905') && cleanPhoneDigits.length === 12);

  const waPhone = cleanPhoneDigits.startsWith('90')
    ? cleanPhoneDigits
    : cleanPhoneDigits.startsWith('0')
    ? '9' + cleanPhoneDigits
    : '90' + cleanPhoneDigits;

  const waMessage = `Merhaba, makinam.com'daki "${listing.title}" (İlan No: ${listing.adNo || listing.id}) ilanınız hakkında bilgi almak istiyorum.`;
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`;

  useDocumentTitle(
    listing
      ? `${isSold ? '[SATILDI] ' : isPassive ? '[PASİF] ' : ''}${listing.title} (${listing.year}) - ${formatPrice(listing.price, listing.currency)} | makinam.com`
      : 'İlan Detayı | makinam.com'
  );

  return (
    <div className="max-w-[1240px] mx-auto px-3 py-3 font-sans">
      {/* 1. BREADCRUMBS */}
      <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-2 flex-wrap">
        <Link to="/" className="text-[#0284c7] hover:underline">
          Ana Sayfa
        </Link>
        <ChevronRight size={12} className="text-[#94a3b8]" />
        <Link to={`/ilanlar?cat=${listing.category}`} className="text-[#0284c7] hover:underline capitalize">
          {listing.category?.replace('-', ' ') || 'Kategori'}
        </Link>
        <ChevronRight size={12} className="text-[#94a3b8]" />
        <Link
          to={`/ilanlar?cat=${listing.category}&sub=${listing.subCategory}`}
          className="text-[#0284c7] hover:underline capitalize"
        >
          {listing.subCategory?.replace('-', ' ') || 'Alt Kategori'}
        </Link>
        <ChevronRight size={12} className="text-[#94a3b8]" />
        <span className="text-[#1e293b] font-bold">{listing.brand}</span>
      </div>

      {/* 2. TITLE BAR & ACTIONS */}
      <div className="border-b border-[#cbd5e1] pb-2 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-[17px] sm:text-[19px] font-bold text-[#1e293b] leading-tight">
            {listing.title}
          </h1>
          <div className="text-[11px] text-[#64748b] mt-0.5 flex items-center gap-2 flex-wrap">
            <span>
              İlan No:{' '}
              <strong className="text-[#1e293b]">
                {listing.features?.find((f) => f.label.toLowerCase().includes('ilan no'))?.value || listing.id}
              </strong>
            </span>
            <span>•</span>
            <span>Tarih: {listing.date}</span>
            {listing.isGuvende && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.2 rounded-[2px]">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  Makinam Güvende Aktif
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#475569] shrink-0">
          <button
            onClick={() => listing && toggleFavorite(listing.id)}
            className={`flex items-center gap-1 hover:text-[#ea580c] transition-colors ${
              isItemFavorite ? 'text-[#ea580c] font-bold' : ''
            }`}
          >
            <Heart size={14} className={isItemFavorite ? 'fill-[#ea580c] text-[#ea580c]' : ''} />
            <span>{isItemFavorite ? 'Favorilerinizde' : 'Favorilere Ekle'}</span>
          </button>
          <span className="text-[#cbd5e1]">|</span>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1 hover:text-[#0284c7] transition-colors"
            title="İlanı Paylaş"
          >
            <Share2 size={14} /> Paylaş
          </button>
        </div>
      </div>

      {/* INACTIVE / SOLD STATUS ALERT BANNER */}
      {isSold && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-[3px] flex items-center gap-2.5 text-red-900 shadow-xs">
          <XCircle size={20} className="text-red-600 shrink-0" />
          <div>
            <div className="font-bold text-[13px]">Bu İlan Satılmıştır</div>
            <div className="text-[11.5px] text-red-700">
              Bu makine ilanı satıcı tarafından satıldı olarak işaretlenmiştir. İlan sadece arşiv ve referans amaçlı görüntülenmektedir.
            </div>
          </div>
        </div>
      )}

      {isPassive && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-[3px] flex items-center gap-2.5 text-amber-900 shadow-xs">
          <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-[13px]">Bu İlan Yayından Kaldırılmıştır</div>
            <div className="text-[11.5px] text-amber-700">
              Satıcı bu ilanı geçici veya kalıcı olarak yayından kaldırmıştır.
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN 2-COLUMN CLASSIFIED DETAIL LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-3.5">
        {/* LEFT COLUMN: Large Gallery & Description */}
        <div className="flex-1 min-w-0">
          {/* Main Photo Gallery */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-2 mb-3 shadow-xs">
            <div className="relative aspect-[16/10] bg-[#122438] rounded-[2px] overflow-hidden flex items-center justify-center">
              <img
                src={listing.images?.[activeImageIndex] || listing.images?.[0] || DEFAULT_MACHINE_IMAGE}
                alt={listing.title}
                onError={handleImageFallback}
                className="max-h-full max-w-full object-contain"
              />

              {(listing.images?.length || 0) > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? (listing.images?.length || 1) - 1 : prev - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-1.5 rounded-[2px] transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === (listing.images?.length || 1) - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-1.5 rounded-[2px] transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Photo Counter */}
              <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded-[2px]">
                {activeImageIndex + 1} / {listing.images?.length || 1}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {(listing.images?.length || 0) > 1 && (
              <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
                {listing.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 rounded-[2px] overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#0284c7]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" onError={handleImageFallback} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description & Specs Tabs */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] shadow-xs overflow-hidden">
            <div className="flex border-b border-[#cbd5e1] bg-[#f8fafc] text-[12px] font-bold">
              <button
                onClick={() => setActiveTab('desc')}
                className={`px-4 py-2 border-r border-[#cbd5e1] transition-colors ${
                  activeTab === 'desc'
                    ? 'bg-white text-[#19324d] border-t-2 border-t-[#ea580c]'
                    : 'text-[#64748b] hover:bg-[#f1f5f9]'
                }`}
              >
                İlan Açıklaması
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 border-r border-[#cbd5e1] lg:hidden transition-colors ${
                  activeTab === 'specs'
                    ? 'bg-white text-[#19324d] border-t-2 border-t-[#ea580c]'
                    : 'text-[#64748b] hover:bg-[#f1f5f9]'
                }`}
              >
                Teknik Bilgiler
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`px-4 py-2 border-r border-[#cbd5e1] transition-colors ${
                  activeTab === 'location'
                    ? 'bg-white text-[#19324d] border-t-2 border-t-[#ea580c]'
                    : 'text-[#64748b] hover:bg-[#f1f5f9]'
                }`}
              >
                Konumu
              </button>
              <button
                onClick={() => setActiveTab('safety')}
                className={`px-4 py-2 transition-colors ${
                  activeTab === 'safety'
                    ? 'bg-white text-[#19324d] border-t-2 border-t-[#ea580c]'
                    : 'text-[#64748b] hover:bg-[#f1f5f9]'
                }`}
              >
                Makinam Güvende Bilgisi
              </button>
            </div>

            <div className="p-4 text-[12px] text-[#1e293b] leading-relaxed">
              {activeTab === 'desc' && (
                <div className="space-y-3 whitespace-pre-line font-normal text-[#334155]">
                  {listing.description}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="divide-y divide-[#f1f5f9]">
                  {listing.features?.map((f, i) => (
                    <div key={i} className="py-1.5 flex justify-between text-[11px]">
                      <span className="font-bold text-[#64748b]">{f.label}</span>
                      <span className="text-[#1e293b]">{f.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'location' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#334155]">
                    <MapPin className="text-[#ea580c]" size={16} />
                    <span className="font-bold">{listing.city} / {listing.district}</span>
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    Makinanın tam konumu ve adresi için satıcı ile iletişime geçiniz.
                  </div>
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-[2px] space-y-2 text-[11.5px] text-blue-900">
                  <div className="font-bold flex items-center gap-1.5 text-blue-800 text-[12px]">
                    <ShieldCheck size={16} /> Makinam Güvende ile Korunuyorsunuz
                  </div>
                  <p>
                    Bu ilanda güvenli ticaret sistemimiz aktiftir. Makineyi ekspertiz kontrolünden geçirmeden veya teslim almadan paranız satıcıya aktarılmaz.
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/makinam-guvende"
                      className="text-[#ea580c] font-bold text-[11px] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Makinam Güvende Havuz ve Ekspertiz Sistemini İncele &rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Price, Specs Table, Seller Box */}
        <div className="w-full lg:w-[350px] shrink-0 space-y-2.5">
          {/* Price Box */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-3 shadow-xs">
            <div className="text-[26px] font-black text-[#b91c1c] tracking-tight">
              {formatPrice(listing.price, listing.currency)}
            </div>
            <div className="text-[11px] text-[#64748b] mt-0.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-[#94a3b8]" />
                {listing.city} / {listing.district}
              </span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded-[2px] border border-emerald-200">
                Pazarlık Payı Var
              </span>
            </div>
          </div>

          {/* Technical Specifications Table */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] overflow-hidden shadow-xs">
            <div className="bg-[#f8fafc] px-3 py-1.5 font-bold text-[11px] text-[#1e293b] border-b border-[#cbd5e1] uppercase tracking-wide">
              İlan Bilgileri
            </div>
            <table className="w-full text-[11px]">
              <tbody>
                {listing.features?.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-[#f1f5f9] ${
                      idx % 2 === 1 ? 'bg-[#fafbfc]' : 'bg-white'
                    }`}
                  >
                    <td className="py-1.5 px-3 font-bold text-[#64748b] w-[130px] border-r border-[#f1f5f9]">
                      {item.label}
                    </td>
                    <td className="py-1.5 px-3 text-[#1e293b] font-medium">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Seller Profile Card */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-3 shadow-xs space-y-2.5">
            <div>
              <div className="text-[13px] font-bold text-[#1e293b]">
                {listing.seller?.companyName || listing.seller?.name || 'Satıcı'}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-[#f1f5f9] text-[#1e293b] text-[10px] font-bold px-1.5 py-0.2 rounded-[2px] border border-[#cbd5e1]">
                  {listing.seller?.type || 'Bireysel'}
                </span>
                <span className="text-[10px] text-[#64748b]">
                  Üyelik: {listing.seller?.memberSince || '2026'}
                </span>
              </div>
            </div>

            {/* OWNER ACTIONS vs BUYER ACTIONS */}
            {isOwner ? (
              <div className="bg-amber-50 border border-amber-200 rounded-[3px] p-3 text-center space-y-2">
                <div className="font-bold text-[12.5px] text-amber-900 flex items-center justify-center gap-1.5">
                  <Edit3 size={15} /> Bu Sizin İlanınız
                </div>
                <p className="text-[11px] text-amber-700 leading-snug">
                  İlanınızı güncellemek, fiyatını değiştirmek veya durumunu yönetmek için ilanlar sayfanıza gidebilirsiniz.
                </p>
                <Link
                  to="/hesabim/ilanlarim"
                  className="w-full bg-[#19324d] hover:bg-[#122438] text-white py-2 rounded-[2px] text-center font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Edit3 size={14} />
                  <span>İlanımı Yönet & Düzenle</span>
                </Link>
              </div>
            ) : isInactive ? (
              <div className="bg-gray-100 border border-gray-300 rounded-[3px] p-3 text-center space-y-1">
                <div className="font-bold text-[12px] text-gray-700">
                  {isSold ? 'İlan Satılmıştır' : 'İlan Yayında Değildir'}
                </div>
                <p className="text-[11px] text-gray-500">
                  Bu ilan için mesajlaşma ve satın alma işlemleri kapatılmıştır.
                </p>
              </div>
            ) : (
              <>
                {/* Makinam Güvende Secure Buy CTA */}
                {listing.isGuvende && (
                  <button
                    type="button"
                    onClick={() => setIsGuvendeModalOpen(true)}
                    className="w-full bg-[#15803d] hover:bg-[#166534] text-white py-2.5 rounded-[2px] text-center font-bold text-[12.5px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <ShieldCheck size={16} />
                    <span>Makinam Güvende ile Satın Al</span>
                  </button>
                )}

                {/* Direct WhatsApp Action for Mobile Phone Numbers */}
                {isMobile && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 rounded-[2px] text-center font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp ile İletişime Geç</span>
                  </a>
                )}

                {/* Phone Number Reveal */}
                {isValidPhone ? (
                  <div>
                    {phoneRevealed ? (
                      <a
                        href={`tel:${cleanPhoneDigits}`}
                        className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-2 rounded-[2px] text-center font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Phone size={14} />
                        <span>{fullPhone}</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => setPhoneRevealed(true)}
                        className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white py-2 rounded-[2px] text-center font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Phone size={14} />
                        <span>Telefon Numarasını Göster</span>
                      </button>
                    )}
                  </div>
                ) : hasHiddenPhone ? (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-[2px] text-[10.5px] text-[#64748b] text-center">
                    Satıcı telefon numarasını gizlemiştir. Mesaj göndererek ulaşabilirsiniz.
                  </div>
                ) : null}

                {/* In-App Message Button */}
                <button
                  onClick={() => setIsMessageModalOpen(true)}
                  className="w-full border border-[#cbd5e1] hover:border-[#ea580c] hover:bg-orange-50/40 hover:text-[#ea580c] text-[#334155] py-2 rounded-[2px] text-center font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <MessageSquare size={14} className="text-[#ea580c]" />
                  <span>Site İçi Mesaj Gönder</span>
                </button>
              </>
            )}
          </div>

          {/* Secure Trade Badge */}
          <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-[3px] p-3 text-[11px] text-[#475569] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#1e293b]">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Güvenli Alışveriş İpuçları</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-[#64748b]">
              <li>Makinayı görmeden veya ekspertiz yaptırmadan kapora göndermeyiniz.</li>
              <li>Ödemelerinizi Makinam Güvende havuz hesabı üzerinden gerçekleştiriniz.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listing={listing}
      />

      {/* Send Message to Seller Modal */}
      <SendMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        listing={listing}
      />

      {/* Makinam Güvende Escrow Purchase Modal */}
      <MakinamGuvendePurchaseModal
        isOpen={isGuvendeModalOpen}
        onClose={() => setIsGuvendeModalOpen(false)}
        listing={listing}
      />
    </div>
  );
};
