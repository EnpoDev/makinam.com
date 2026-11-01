import React from 'react';
import { Banner } from '../components/Banner';
import { SidebarCategories } from '../components/SidebarCategories';
import { VitrinGrid } from '../components/VitrinGrid';
import { ServiceBoxes } from '../components/ServiceBoxes';
import { BrandShowcase } from '../components/BrandShowcase';
import { PopularSearches } from '../components/PopularSearches';
import { Listing } from '../types';

interface HomePageProps {
  listings: Listing[];
  onOpenPostAd: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ listings, onOpenPostAd }) => {
  return (
    <main className="min-h-screen">
      {/* 1. TOP PROMO BANNER */}
      <Banner />

      {/* 2. MAIN 2-COLUMN CLASSIFIEDS SECTION */}
      <div className="max-w-[1240px] mx-auto px-3 py-2 flex flex-col md:flex-row gap-3">
        {/* Left Directory Tree */}
        <SidebarCategories listings={listings} />

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {/* Anasayfa Vitrini */}
          <VitrinGrid listings={listings} onOpenPostAd={onOpenPostAd} />

          {/* Makinam Hizmetleri */}
          <ServiceBoxes />

          {/* Popüler Markalar */}
          <BrandShowcase listings={listings} />

          {/* Popüler Makine Aramaları */}
          <PopularSearches />
        </div>
      </div>
    </main>
  );
};
