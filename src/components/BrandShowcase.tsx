import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing } from '../types';
import { subscribeToPopularBrands, PopularBrandItem, DEFAULT_POPULAR_BRANDS } from '../lib/portalService';

interface BrandShowcaseProps {
  listings?: Listing[];
}

export const BrandShowcase: React.FC<BrandShowcaseProps> = ({ listings = [] }) => {
  const navigate = useNavigate();
  const [dbBrands, setDbBrands] = useState<PopularBrandItem[]>(DEFAULT_POPULAR_BRANDS);

  // Subscribe to live brands from Firestore settings
  useEffect(() => {
    const unsubscribe = subscribeToPopularBrands((brands) => {
      if (brands && brands.length > 0) {
        setDbBrands(brands);
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute live counts if real listings are available
  const displayBrands = useMemo(() => {
    // Brand frequency map from real active Firestore listings
    const listingCounts: Record<string, number> = {};
    listings.forEach((item) => {
      if (item.brand) {
        const key = item.brand.trim();
        listingCounts[key.toLowerCase()] = (listingCounts[key.toLowerCase()] || 0) + 1;
      }
    });

    return dbBrands.map((b) => {
      const liveCount = listingCounts[b.name.toLowerCase()];
      return {
        name: b.name,
        count: liveCount ? `${liveCount} İlan` : b.count
      };
    });
  }, [dbBrands, listings]);

  return (
    <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-3 shadow-xs mb-3 font-sans">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 mb-2.5">
        <h2 className="text-[12px] font-bold text-[#1e293b] uppercase tracking-wide">
          Popüler Makine Markaları
        </h2>
        <span
          className="text-[11px] text-[#0284c7] hover:text-[#ea580c] font-semibold cursor-pointer hover:underline"
          onClick={() => navigate('/ilanlar')}
        >
          Tüm Markalar »
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {displayBrands.map((brand, idx) => (
          <div
            key={idx}
            onClick={() => navigate(`/ilanlar?brand=${encodeURIComponent(brand.name)}`)}
            className="flex items-center justify-between p-2 rounded-[2px] border border-[#e2e8f0] hover:border-[#0284c7] hover:bg-[#f8fafc] cursor-pointer transition-colors"
          >
            <div className="overflow-hidden">
              <span className="text-[11px] font-bold text-[#1e293b] hover:text-[#0284c7] block truncate">
                {brand.name}
              </span>
              <span className="text-[10px] text-[#94a3b8] block mt-0.5">{brand.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
