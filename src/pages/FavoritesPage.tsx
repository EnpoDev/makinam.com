import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  Search, 
  ExternalLink, 
  MapPin, 
  Phone, 
  ChevronRight, 
  ArrowUpDown, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { Listing } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { handleImageFallback } from '../utils/image';

interface FavoritesPageProps {
  listings: Listing[];
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ listings }) => {
  const navigate = useNavigate();
  const { favorites, removeFavorite, clearFavorites } = useFavorites();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'price_asc' | 'price_desc'>('date_desc');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filter listings that are favorited
  const favoriteListings = listings.filter((l) => favorites.includes(l.id));

  // Search filter
  const filteredListings = favoriteListings.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0; // Default order
  });

  const handleRemove = (id: string, title: string) => {
    removeFavorite(id);
    setFeedbackMessage(`"${title}" favorilerden çıkarıldı.`);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const handleClearAll = () => {
    if (window.confirm('Tüm favori ilanlarınızı temizlemek istediğinize emin misiniz?')) {
      clearFavorites();
      setFeedbackMessage('Tüm favoriler temizlendi.');
      setTimeout(() => setFeedbackMessage(null), 2500);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('tr-TR')} ${currency === 'TL' ? 'TL' : currency}`;
  };

  return (
    <div className="max-w-[1240px] mx-auto px-3 py-5 font-sans">
      {/* 1. BREADCRUMBS */}
      <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-4">
        <Link to="/" className="hover:text-[#ea580c]">Ana Sayfa</Link>
        <ChevronRight size={12} />
        <span className="text-[#334155] font-semibold">Bana Özel</span>
        <ChevronRight size={12} />
        <span className="text-[#ea580c] font-bold">Favori İlanlarım</span>
      </div>

      {/* 2. HEADER BAR */}
      <div className="bg-white border border-[#e2e8f0] rounded-[4px] p-5 mb-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-orange-50 text-[#ea580c] border border-orange-200 flex items-center justify-center shrink-0">
            <Heart size={22} className="fill-[#ea580c]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-black text-[#1e293b]">Favori İlanlarım</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ea580c] text-white">
                {favoriteListings.length}
              </span>
            </div>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Kaydettiğiniz ve takip ettiğiniz makineler burada listelenir.
            </p>
          </div>
        </div>

        {favoriteListings.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-[11.5px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-[3px] border border-red-200 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={13} />
            <span>Tüm Favorileri Temizle</span>
          </button>
        )}
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-[4px] text-[12px] font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* 3. LISTINGS CARD */}
      <div className="bg-white border border-[#e2e8f0] rounded-[4px] shadow-2xs overflow-hidden">
        {/* Filters and Search Strip */}
        {favoriteListings.length > 0 && (
          <div className="p-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] text-[#475569]">
              <span className="font-bold">Sıralama:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-[32px] px-2.5 text-[11.5px] border border-[#cbd5e1] rounded-[3px] bg-white font-medium focus:outline-none focus:border-[#ea580c]"
              >
                <option value="date_desc">Eklenme Tarihine Göre</option>
                <option value="price_asc">Fiyat (Önce En Düşük)</option>
                <option value="price_desc">Fiyat (Önce En Yüksek)</option>
              </select>
            </div>

            <div className="relative w-full sm:w-[260px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Favorilerimde ara..."
                className="w-full h-[32px] pl-8 pr-3 text-[11.5px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-white"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-[#94a3b8]" />
            </div>
          </div>
        )}

        {/* Content */}
        {sortedListings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="bg-[#f1f5f9] text-[#475569] font-bold text-[11px] border-b border-[#e2e8f0]">
                  <th className="py-2.5 px-3 w-[80px]">Fotoğraf</th>
                  <th className="py-2.5 px-3 min-w-[280px]">İlan Başlığı & Özellikler</th>
                  <th className="py-2.5 px-3 w-[140px]">Fiyat</th>
                  <th className="py-2.5 px-3 w-[120px]">Şehir / İlçe</th>
                  <th className="py-2.5 px-3 w-[140px]">Satıcı Bilgisi</th>
                  <th className="py-2.5 px-3 w-[110px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {sortedListings.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                    {/* Thumbnail */}
                    <td className="py-2.5 px-3">
                      <Link to={`/ilan/${item.id}`} className="block relative group">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          onError={handleImageFallback}
                          className="w-[72px] h-[52px] object-cover rounded-[3px] border border-[#cbd5e1] group-hover:opacity-90"
                        />
                        {item.isVitrin && (
                          <span className="absolute top-0 left-0 bg-[#ea580c] text-white text-[8.5px] font-black px-1 rounded-br-[3px]">
                            VİTRİN
                          </span>
                        )}
                      </Link>
                    </td>

                    {/* Title & Specs */}
                    <td className="py-2.5 px-3">
                      <Link
                        to={`/ilan/${item.id}`}
                        className="font-bold text-[#1e293b] hover:text-[#ea580c] text-[12.5px] line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-[#64748b] mt-0.5">
                        <span className="font-semibold text-[#334155]">{item.brand} {item.model}</span>
                        <span>•</span>
                        <span>Yıl: {item.year}</span>
                        <span>•</span>
                        <span>{item.hours > 0 ? `${item.hours} Saat` : 'Sıfır Ürün'}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-[#1e293b] text-[13px]">
                        {formatPrice(item.price, item.currency)}
                      </div>
                    </td>

                    {/* City / District */}
                    <td className="py-2.5 px-3 text-[#475569] text-[11.5px] whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#94a3b8]" />
                        <span>{item.city}, {item.district}</span>
                      </div>
                    </td>

                    {/* Seller */}
                    <td className="py-2.5 px-3 text-[11.5px] whitespace-nowrap">
                      <div className="font-semibold text-[#334155]">{item.seller.name}</div>
                      <div className="text-[10.5px] text-[#64748b]">{item.seller.type}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/ilan/${item.id}`}
                          title="İlanı İncele"
                          className="h-[28px] px-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-[11px] font-bold rounded-[2px] inline-flex items-center gap-1 transition-colors"
                        >
                          <span>İncele</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.id, item.title)}
                          title="Favorilerden Çıkar"
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-[3px] transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="py-14 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-orange-50 text-[#ea580c] flex items-center justify-center mx-auto mb-3 border border-orange-200">
              <Heart size={26} className="text-[#ea580c]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#1e293b]">
              Henüz favori ilanınız bulunmuyor
            </h3>
            <p className="text-[12px] text-[#64748b] max-w-[380px] mx-auto mt-1 mb-5">
              İlan listelerinde yer alan kalp butonlarına tıklayarak ilgilendiğiniz makineleri favorilerinize ekleyebilir, fiyatlarını kolayca takip edebilirsiniz.
            </p>
            <button
              onClick={() => navigate('/ilanlar')}
              className="inline-flex items-center gap-2 h-[38px] px-5 bg-[#ea580c] hover:bg-[#d94e08] text-white text-[12.5px] font-bold rounded-[3px] transition-colors shadow-xs"
            >
              <Search size={14} />
              <span>İlanları Keşfetmeye Başla</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};