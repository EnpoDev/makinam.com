import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing } from '../types';
import { PlusCircle, Clock, Sparkles, Heart, ShieldCheck } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { handleImageFallback, DEFAULT_MACHINE_IMAGE } from '../utils/image';

interface VitrinGridProps {
  listings: Listing[];
  onOpenPostAd: () => void;
}

export const VitrinGrid: React.FC<VitrinGridProps> = ({ listings, onOpenPostAd }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'new'>('all');
  const { toggleFavorite, isFavorite } = useFavorites();

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('tr-TR')} ${currency === 'TL' ? 'TL' : currency}`;
  };

  const displayedListings = listings.filter((item) => {
    // Only display active listings in the vitrin
    if (item.status && item.status !== 'active') return false;
    if (activeTab === 'urgent') return item.isUrgent;
    return true;
  });

  return (
    <section className="bg-white border border-[#cbd5e1] rounded-[3px] p-3 shadow-xs mb-3 font-sans">
      {/* 1. VITRIN TAB HEADER */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#e2e8f0] pb-2 mb-3 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-[12px] font-bold rounded-[2px] transition-colors ${
              activeTab === 'all'
                ? 'bg-[#19324d] text-white'
                : 'text-[#475569] hover:bg-[#f1f5f9]'
            }`}
          >
            Anasayfa Vitrini
          </button>
          <button
            onClick={() => setActiveTab('urgent')}
            className={`px-3 py-1 text-[12px] font-bold rounded-[2px] transition-colors flex items-center gap-1 ${
              activeTab === 'urgent'
                ? 'bg-[#b91c1c] text-white'
                : 'text-[#b91c1c] hover:bg-[#fef2f2]'
            }`}
          >
            <Clock size={12} />
            Acil Satılıklar
          </button>
        </div>

        <a
          href="/ilanlar"
          onClick={(e) => {
            e.preventDefault();
            navigate('/ilanlar');
          }}
          className="text-[11px] text-[#0284c7] hover:text-[#ea580c] font-semibold hover:underline"
        >
          Tüm vitrin ilanlarını göster ({listings.length}) »
        </a>
      </div>

      {/* 2. DENSE 6-COLUMN LISTINGS GRID - Traditional High Information Density */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {displayedListings.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/ilan/${item.id}`)}
            className="group cursor-pointer flex flex-col bg-white border border-[#e2e8f0] hover:border-[#0284c7] rounded-[2px] p-1.5 transition-colors"
          >
            {/* Thumbnail Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-[#f8fafc] mb-1.5 border border-[#f1f5f9]">
              <img
                src={item.images?.[0] || DEFAULT_MACHINE_IMAGE}
                alt={item.title}
                onError={handleImageFallback}
                className="w-full h-full object-cover group-hover:opacity-95"
                loading="lazy"
              />

              {/* Realistic Badges */}
              {item.isUrgent && (
                <span className="absolute top-1 left-1 bg-[#b91c1c] text-white text-[9px] font-bold px-1 py-0.2 rounded-[1px]">
                  ACİL
                </span>
              )}
              {item.category === 'gida-endustriyel-mutfak' && !item.isUrgent && (
                <span className="absolute top-1 left-1 bg-[#d97706] text-white text-[8px] font-bold px-1 py-0.2 rounded-[1px]">
                  MUTFAK
                </span>
              )}
              {item.isGuvende && (
                <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-[1px] flex items-center gap-0.5 shadow-xs">
                  <ShieldCheck size={9} /> GÜVENDE
                </span>
              )}

              {/* Favorite Quick Button */}
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
                  size={12}
                  className={isFavorite(item.id) ? "fill-[#ea580c] text-[#ea580c]" : "text-gray-400"}
                />
              </button>

              {/* Year / Condition badge */}
              <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-mono px-1 py-0.2 rounded-[1px]">
                {item.year}
              </span>
            </div>

            {/* 2-Line Title */}
            <h3
              title={item.title}
              className="text-[11px] font-normal text-[#1e293b] group-hover:text-[#0284c7] group-hover:underline leading-[14px] line-clamp-2 min-h-[28px]"
            >
              {item.title}
            </h3>

            {/* Price & Location - Real Marketplace Styling */}
            <div className="mt-1.5 pt-1 border-t border-[#f1f5f9] flex flex-col">
              <span className="font-bold text-[#b91c1c] text-[12px] truncate">
                {formatPrice(item.price, item.currency)}
              </span>
              <div className="flex items-center justify-between text-[10px] text-[#64748b] mt-0.5">
                <span className="truncate">{item.city}</span>
                <span className="shrink-0">{item.seller?.type === 'Sahibinden' ? 'Sahibinden' : 'Mağaza'}</span>
              </div>
            </div>
          </div>
        ))}

        {/* 3. SHOWCASE TILE PROMO (Burada Sizin İlanınız Olsun) */}
        <div
          onClick={onOpenPostAd}
          className="cursor-pointer flex flex-col justify-center items-center text-center bg-[#fffbeb] border border-dashed border-[#fcd34d] hover:border-[#f59e0b] rounded-[2px] p-2 transition-colors group aspect-[4/3] sm:aspect-auto"
        >
          <div className="w-8 h-8 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <PlusCircle size={18} />
          </div>
          <span className="text-[11px] font-bold text-[#b45309]">
            Vitrinde Yer Alın!
          </span>
          <span className="text-[9px] text-[#92400e] mt-0.5 leading-tight">
            Makinanızı vitrine taşıyın, binlerce alıcıya hemen ulaşın.
          </span>
        </div>
      </div>
    </section>
  );
};
