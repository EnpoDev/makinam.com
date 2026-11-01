import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Listing } from '../types';
import { useCategories } from '../context/CategoryContext';
import { useFavorites } from '../context/FavoritesContext';
import { handleImageFallback } from '../utils/image';
import { matchesListingSearch } from '../utils/search';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  List,
  LayoutGrid,
  ChevronRight,
  Filter,
  RotateCcw,
  Camera,
  MapPin,
  Calendar,
  Clock,
  Heart,
  ShieldCheck
} from 'lucide-react';

interface ListingPageProps {
  listings: Listing[];
}

export const ListingPage: React.FC<ListingPageProps> = ({ listings }) => {
  const { categories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const categoryParam = searchParams.get('cat') || '';
  const subCategoryParam = searchParams.get('sub') || '';
  const queryParam = searchParams.get('q') || '';
  const brandParam = searchParams.get('brand') || '';
  const urgentParam = searchParams.get('urgent') === 'true';
  const guvendeParam = searchParams.get('guvende') === 'true' || searchParams.get('guvende') === '1';
  const sellerParam = searchParams.get('seller') || '';

  // Local filter states
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minYear, setMinYear] = useState<string>('');
  const [maxYear, setMaxYear] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>(brandParam);
  const [sellerType, setSellerType] = useState<string>(sellerParam || 'all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
  const { toggleFavorite, isFavorite } = useFavorites();

  // Find active category
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === categoryParam);
  }, [categoryParam]);

  useDocumentTitle(
    activeCategory
      ? `${activeCategory.name} İlanları | makinam.com`
      : queryParam
      ? `"${queryParam}" Arama Sonuçları | makinam.com`
      : 'Tüm Makine İlanları | makinam.com'
  );

  const activeSubCategory = useMemo(() => {
    if (!activeCategory || !subCategoryParam) return null;
    return activeCategory.subcategories.find((s) => s.id === subCategoryParam);
  }, [activeCategory, subCategoryParam]);

  // Unique brands & cities from listings
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => set.add(l.brand));
    return Array.from(set).sort();
  }, [listings]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => set.add(l.city));
    return Array.from(set).sort();
  }, [listings]);

  const getCategoryCount = (catId: string, fallbackCount: number) => {
    if (!listings || listings.length === 0) return fallbackCount;
    return listings.filter((l) => l.category === catId).length;
  };

  const getSubCategoryCount = (catId: string, subId: string, fallbackCount: number) => {
    if (!listings || listings.length === 0) return fallbackCount;
    return listings.filter((l) => l.category === catId && l.subCategory === subId).length;
  };

  // Filtering logic
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Category filter
      if (categoryParam && item.category !== categoryParam) return false;
      if (subCategoryParam && item.subCategory !== subCategoryParam) return false;

      // Search query (Supports Title, Brand, Model, City, Description, and Listing Number / Ad No / ID)
      if (queryParam && !matchesListingSearch(item, queryParam)) {
        return false;
      }

      // Brand filter
      if (selectedBrand && item.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // City filter
      if (selectedCity && item.city !== selectedCity) return false;

      // Price filter
      if (minPrice && item.price < Number(minPrice)) return false;
      if (maxPrice && item.price > Number(maxPrice)) return false;

      // Year filter
      if (minYear && item.year < Number(minYear)) return false;
      if (maxYear && item.year > Number(maxYear)) return false;

      // Seller type
      if (sellerType !== 'all' && item.seller.type !== sellerType) return false;

      // Urgent
      if (urgentParam && !item.isUrgent) return false;

      // Makinam Güvende
      if (guvendeParam && !item.isGuvende) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'year_desc') return b.year - a.year;
      if (sortBy === 'hours_asc') return a.hours - b.hours;
      // Default: date_desc
      return 0;
    });
  }, [
    listings,
    categoryParam,
    subCategoryParam,
    queryParam,
    selectedBrand,
    selectedCity,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    sellerType,
    urgentParam,
    sortBy
  ]);

  const resetFilters = () => {
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinYear('');
    setMaxYear('');
    setSelectedBrand('');
    setSellerType('all');
    setSearchParams({});
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('tr-TR')} ${currency === 'TL' ? 'TL' : currency}`;
  };

  return (
    <div className="max-w-[1240px] mx-auto px-3 py-3 font-sans">
      {/* 1. BREADCRUMB NAVIGATION */}
      <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-2.5">
        <Link to="/" className="text-[#0284c7] hover:underline">
          Ana Sayfa
        </Link>
        <ChevronRight size={12} className="text-[#94a3b8]" />
        {activeCategory ? (
          <>
            <Link
              to={`/ilanlar?cat=${activeCategory.id}`}
              className="text-[#0284c7] hover:underline"
            >
              {activeCategory.name}
            </Link>
            {activeSubCategory && (
              <>
                <ChevronRight size={12} className="text-[#94a3b8]" />
                <span className="text-[#1e293b] font-bold">{activeSubCategory.name}</span>
              </>
            )}
          </>
        ) : queryParam ? (
          <span className="text-[#1e293b] font-semibold">
            "{queryParam}" Arama Sonuçları
          </span>
        ) : (
          <span className="text-[#1e293b] font-bold">Tüm Makine İlanları</span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        {/* 2. LEFT FILTER SIDEBAR */}
        <aside className="w-full md:w-[240px] shrink-0 space-y-2.5">
          {/* Category Tree inside Filter */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-2.5">
            <h3 className="font-bold text-[11px] text-[#1e293b] uppercase tracking-wide mb-2 pb-1 border-b border-[#e2e8f0]">
              Kategori Seçimi
            </h3>
            <ul className="space-y-1 text-[11px]">
              {categories.map((c) => {
                const isActive = c.id === categoryParam;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => navigate(`/ilanlar?cat=${c.id}`)}
                      className={`text-left w-full hover:text-[#0284c7] flex items-center justify-between py-0.5 ${
                        isActive ? 'font-bold text-[#0284c7]' : 'text-[#334155]'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="text-[10px] text-[#94a3b8]">
                        ({getCategoryCount(c.id, c.count).toLocaleString('tr-TR')})
                      </span>
                    </button>
                    {isActive && (
                      <ul className="pl-3 mt-1 space-y-1 border-l-2 border-[#0284c7]/40 ml-1">
                        {c.subcategories.map((sub) => (
                          <li key={sub.id}>
                            <button
                              onClick={() =>
                                navigate(`/ilanlar?cat=${c.id}&sub=${sub.id}`)
                              }
                              className={`text-left w-full hover:underline text-[10px] flex items-center justify-between ${
                                subCategoryParam === sub.id
                                  ? 'font-bold text-[#0284c7]'
                                  : 'text-[#64748b]'
                              }`}
                            >
                              <span className="truncate">{sub.name}</span>
                              <span className="text-[9px] text-[#94a3b8] shrink-0">
                                ({getSubCategoryCount(c.id, sub.id, sub.count)})
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Detailed Filters Box */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-2.5 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
              <span className="font-bold text-[11px] text-[#1e293b] uppercase tracking-wide flex items-center gap-1">
                <Filter size={12} /> Filtreler
              </span>
              <button
                onClick={resetFilters}
                className="text-[10px] text-[#0284c7] hover:underline flex items-center gap-0.5"
              >
                <RotateCcw size={10} /> Temizle
              </button>
            </div>

            {/* City */}
            <div>
              <label className="block text-[11px] font-bold text-[#334155] mb-1">İl</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-[28px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2 bg-white focus:outline-none focus:border-[#ea580c]"
              >
                <option value="">Tüm İller</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-[11px] font-bold text-[#334155] mb-1">Marka</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full h-[28px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2 bg-white focus:outline-none focus:border-[#ea580c]"
              >
                <option value="">Tüm Markalar</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Price (Min - Max) */}
            <div>
              <label className="block text-[11px] font-bold text-[#334155] mb-1">
                Fiyat Aralığı (TL)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 h-[28px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2 focus:outline-none focus:border-[#ea580c]"
                />
                <span className="text-[#94a3b8]">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 h-[28px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2 focus:outline-none focus:border-[#ea580c]"
                />
              </div>
            </div>

            {/* Year (Min - Max) */}
            <div>
              <label className="block text-[11px] font-bold text-[#334155] mb-1">Yıl Aralığı</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  className="w-1/2 h-[28px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2 focus:outline-none focus:border-[#ea580c]"
                />
                <span className="text-[#94a3b8]">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  className="w-1/2 h-[28px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2 focus:outline-none focus:border-[#ea580c]"
                />
              </div>
            </div>

            {/* Seller Type */}
            <div>
              <label className="block text-[11px] font-bold text-[#334155] mb-1">
                Kimden
              </label>
              <div className="space-y-1 text-[11px] text-[#475569]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="seller"
                    checked={sellerType === 'all'}
                    onChange={() => setSellerType('all')}
                  />
                  <span>Tümü</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="seller"
                    checked={sellerType === 'Sahibinden'}
                    onChange={() => setSellerType('Sahibinden')}
                  />
                  <span>Sahibinden</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="seller"
                    checked={sellerType === 'Galeriden'}
                    onChange={() => setSellerType('Galeriden')}
                  />
                  <span>Galeriden / Mağazadan</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="seller"
                    checked={sellerType === 'Yetkili Bayi'}
                    onChange={() => setSellerType('Yetkili Bayi')}
                  />
                  <span>Yetkili Bayi</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. RIGHT LISTING COLUMN */}
        <div className="flex-1 min-w-0">
          {/* Top Controls Bar */}
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-2.5 mb-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
            <div>
              <h1 className="text-[13px] font-bold text-[#1e293b]">
                {queryParam
                  ? `"${queryParam}" Arama Sonuçları`
                  : activeSubCategory
                  ? activeSubCategory.name
                  : activeCategory
                  ? activeCategory.name
                  : 'Tüm Makine İlanları'}
              </h1>
              <span className="text-[11px] text-[#64748b]">
                Kriterlerinize uygun <strong className="text-[#1e293b]">{filteredListings.length}</strong> ilan listeleniyor
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort selector */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-[#64748b] hidden sm:inline">Sıralama:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-[28px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2 bg-white focus:outline-none focus:border-[#ea580c]"
                >
                  <option value="date_desc">Tarihe Göre (En Yeni)</option>
                  <option value="price_asc">Fiyata Göre (Önce En Düşük)</option>
                  <option value="price_desc">Fiyata Göre (Önce En Yüksek)</option>
                  <option value="year_desc">Yıla Göre (Önce En Yeni Model)</option>
                </select>
              </div>

              {/* View Switcher: List vs Gallery */}
              <div className="flex border border-[#cbd5e1] rounded-[2px] overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${
                    viewMode === 'list'
                      ? 'bg-[#19324d] text-white'
                      : 'bg-white text-[#475569] hover:bg-[#f1f5f9]'
                  }`}
                  title="Liste Görünümü"
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => setViewMode('gallery')}
                  className={`p-1.5 ${
                    viewMode === 'gallery'
                      ? 'bg-[#19324d] text-white'
                      : 'bg-white text-[#475569] hover:bg-[#f1f5f9]'
                  }`}
                  title="Galeri Görünümü"
                >
                  <LayoutGrid size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* LISTINGS DISPLAY */}
          {filteredListings.length === 0 ? (
            <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-8 text-center">
              <p className="text-[13px] font-bold text-[#334155]">
                Arama kriterlerinize uygun ilan bulunamadı.
              </p>
              <p className="text-[11px] text-[#64748b] mt-1">
                Filtreleri temizleyerek veya farklı bir arama kelimesi yazarak tekrar deneyebilirsiniz.
              </p>
              <button
                onClick={resetFilters}
                className="mt-3 bg-[#ea580c] hover:bg-[#c2410c] text-white px-3.5 py-1.5 rounded-[2px] text-[11px] font-bold"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* CLASSIC HIGH-DENSITY CLASSIFIEDS TABLE */
            <div className="bg-white border border-[#cbd5e1] rounded-[3px] overflow-x-auto shadow-xs">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#475569] font-bold border-b border-[#cbd5e1] select-none text-[10.5px]">
                    <th className="py-2 px-1.5 w-[28px] text-center"></th>
                    <th className="py-2 px-2 w-[65px]">Fotoğraf</th>
                    <th className="py-2 px-2">İlan Başlığı</th>
                    <th className="py-2 px-2 w-[120px] hidden sm:table-cell">Marka / Model</th>
                    <th className="py-2 px-2 w-[55px] text-center hidden md:table-cell">Yıl</th>
                    <th className="py-2 px-2 w-[85px] text-center hidden md:table-cell">Durum</th>
                    <th className="py-2 px-2.5 w-[110px] text-right">Fiyat</th>
                    <th className="py-2 px-2 w-[90px] text-center hidden sm:table-cell">Tarih</th>
                    <th className="py-2 px-2.5 w-[100px] text-right hidden sm:table-cell">İl / İlçe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredListings.map((item, index) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/ilan/${item.id}`)}
                      className={`cursor-pointer hover:bg-[#fffbeb] transition-colors ${
                        index % 2 === 1 ? 'bg-[#fafbfc]' : 'bg-white'
                      }`}
                    >
                      {/* Favorite Button */}
                      <td className="py-2 px-1.5 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item.id)}
                          title={isFavorite(item.id) ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                          className="p-1 text-gray-400 hover:text-[#ea580c] transition-colors"
                        >
                          <Heart
                            size={14}
                            className={isFavorite(item.id) ? "fill-[#ea580c] text-[#ea580c]" : ""}
                          />
                        </button>
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="py-2 px-2 align-middle">
                        <div className="w-[56px] h-[42px] rounded-[2px] overflow-hidden bg-gray-100 relative shrink-0 border border-[#cbd5e1]">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            onError={handleImageFallback}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {item.images.length > 1 && (
                            <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[8px] px-1 rounded-tl flex items-center gap-0.5">
                              <Camera size={8} /> {item.images.length}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-2 px-2 align-middle">
                        <div className="font-semibold text-[#0284c7] hover:text-[#ea580c] hover:underline line-clamp-2">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          {item.isGuvende && (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8.5px] font-bold px-1 py-0.2 rounded-[1px]">
                              <ShieldCheck size={9} /> Makinam Güvende
                            </span>
                          )}
                          {item.isUrgent && (
                            <span className="inline-block bg-[#b91c1c] text-white text-[9px] font-bold px-1 rounded-[1px]">
                              ACİL
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Brand / Model */}
                      <td className="py-2 px-2 align-middle text-[#334155] hidden sm:table-cell">
                        <span className="font-bold block truncate">{item.brand}</span>
                        <span className="text-[10px] text-[#64748b] block truncate">{item.model}</span>
                      </td>

                      {/* Year */}
                      <td className="py-2 px-2 align-middle text-center font-medium text-[#1e293b] hidden md:table-cell font-mono">
                        {item.year}
                      </td>

                      {/* Condition / Status */}
                      <td className="py-2 px-2 align-middle text-center text-[#475569] hidden md:table-cell">
                        <span className="bg-[#f1f5f9] text-[#334155] text-[10px] px-1.5 py-0.5 rounded-[2px] border border-[#e2e8f0]">
                          {item.features.find(f => f.label === 'Durumu' || f.label === 'Durum')?.value || 'Çalışır'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-2 px-2.5 align-middle text-right whitespace-nowrap">
                        <span className="font-bold text-[#b91c1c] text-[12px]">
                          {formatPrice(item.price, item.currency)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-2 px-2 align-middle text-center text-[#64748b] text-[10px] hidden sm:table-cell whitespace-nowrap">
                        {item.date}
                      </td>

                      {/* Location */}
                      <td className="py-2 px-2.5 align-middle text-right text-[#475569] text-[10px] hidden sm:table-cell">
                        <div className="font-medium">{item.city}</div>
                        <div className="text-[#94a3b8]">{item.district}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* GALLERY MODE */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/ilan/${item.id}`)}
                  className="bg-white border border-[#cbd5e1] hover:border-[#0284c7] rounded-[2px] p-2 cursor-pointer transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden bg-gray-100 mb-1.5 border border-[#f1f5f9]">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        onError={handleImageFallback}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        title={isFavorite(item.id) ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                        className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-white rounded-full shadow-xs transition-colors z-10"
                      >
                        <Heart
                          size={13}
                          className={isFavorite(item.id) ? "fill-[#ea580c] text-[#ea580c]" : "text-gray-500"}
                        />
                      </button>
                      {item.isGuvende && (
                        <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[8px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow-xs">
                          <ShieldCheck size={9} /> GÜVENDE
                        </span>
                      )}
                      <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] px-1 rounded font-mono">
                        {item.year}
                      </span>
                    </div>
                    <h3 className="text-[11px] font-semibold text-[#0284c7] hover:underline line-clamp-2 min-h-[28px]">
                      {item.title}
                    </h3>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span className="font-bold text-[#b91c1c] text-[12px]">
                      {formatPrice(item.price, item.currency)}
                    </span>
                    <span className="text-[10px] text-[#64748b]">{item.city}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
