import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HardHat,
  Factory,
  UtensilsCrossed,
  Home,
  Scissors,
  Tractor,
  Wrench,
  Sparkles,
  Boxes,
  Cog,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Tag,
  Flame,
  CheckCircle,
  Clock,
  Percent
} from 'lucide-react';
import { useCategories } from '../context/CategoryContext';
import { Listing } from '../types';

interface SidebarCategoriesProps {
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
  listings?: Listing[];
}

export const SidebarCategories: React.FC<SidebarCategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
  listings = []
}) => {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    'gida-endustriyel-mutfak': true,
    'is-insaat-makineleri': true,
    'sanayi-imalat-makineleri': true
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const sahibindenCount = useMemo(() => {
    if (!listings || listings.length === 0) return 0;
    return listings.filter((l) => l.seller?.type === 'Sahibinden').length;
  }, [listings]);

  const guvendeCount = useMemo(() => {
    if (!listings || listings.length === 0) return 0;
    return listings.filter((l) => l.isGuvende).length;
  }, [listings]);

  const getCategoryCount = (catId: string, fallbackCount: number) => {
    if (!listings || listings.length === 0) return fallbackCount;
    return listings.filter((l) => l.category === catId).length;
  };

  const getSubCategoryCount = (catId: string, subId: string, fallbackCount: number) => {
    if (!listings || listings.length === 0) return fallbackCount;
    return listings.filter((l) => l.category === catId && (l.subCategory === subId || l.subCategory?.toLowerCase() === subId.toLowerCase())).length;
  };

  const getCategoryIcon = (iconName: string) => {
    const props = { size: 14, className: 'text-[#19324d]' };
    switch (iconName) {
      case 'HardHat':
        return <HardHat {...props} />;
      case 'Factory':
        return <Factory {...props} />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed {...props} />;
      case 'Home':
        return <Home {...props} />;
      case 'Scissors':
        return <Scissors {...props} />;
      case 'Tractor':
        return <Tractor {...props} />;
      case 'Wrench':
        return <Wrench {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'Boxes':
        return <Boxes {...props} />;
      case 'Cog':
        return <Cog {...props} />;
      default:
        return <Tag {...props} />;
    }
  };

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    navigate(`/ilanlar?cat=${catId}`);
  };

  const handleSubCategoryClick = (catId: string, subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/ilanlar?cat=${catId}&sub=${subId}`);
  };

  return (
    <aside className="w-full md:w-[240px] shrink-0 font-sans space-y-2.5">
      {/* Mobile Accordion Toggle Header */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full bg-[#19324d] hover:bg-[#122438] text-white px-3 py-2.5 rounded-[3px] flex items-center justify-between shadow-xs font-bold text-[12px] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-[#ea580c]" />
            <span>Kategoriler & Hızlı Menü</span>
            <span className="text-[10px] bg-[#214266] text-[#cbd5e1] px-1.5 py-0.2 rounded font-normal">
              {categories.length} Kategori
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${mobileOpen ? 'rotate-180 text-[#ea580c]' : 'text-slate-300'}`}
          />
        </button>
      </div>

      {/* Main Category Body - Visible on desktop always, toggleable on mobile */}
      <div className={`${mobileOpen ? 'block' : 'hidden'} md:block space-y-2.5`}>
        {/* 1. QUICK DIRECTORY SHORTCUTS */}
        <div className="bg-white border border-[#cbd5e1] rounded-[3px] overflow-hidden shadow-xs">
        <div className="bg-[#f8fafc] px-3 py-1.5 border-b border-[#e2e8f0] flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#1e293b] uppercase tracking-wide">
            Hızlı Menü
          </span>
          <span className="w-2 h-2 rounded-full bg-[#ea580c]"></span>
        </div>
        <ul className="p-1.5 space-y-0.5 text-[11px]">
          <li>
            <a
              href="#tost"
              onClick={(e) => {
                e.preventDefault();
                navigate('/ilanlar?q=tost');
              }}
              className="px-2 py-1.5 rounded-[2px] text-[#0284c7] hover:bg-[#f1f5f9] hover:text-[#ea580c] flex items-center justify-between font-semibold"
            >
              <span className="flex items-center gap-1.5">
                <UtensilsCrossed size={13} className="text-[#ea580c]" />
                Tost Makineleri Vitrini
              </span>
              <span className="text-[9px] bg-orange-100 text-[#ea580c] px-1 py-0.2 rounded font-bold">
                POPÜLER
              </span>
            </a>
          </li>
          <li>
            <a
              href="#acil"
              onClick={(e) => {
                e.preventDefault();
                navigate('/ilanlar?urgent=true');
              }}
              className="px-2 py-1.5 rounded-[2px] text-[#b91c1c] hover:bg-[#fef2f2] flex items-center justify-between font-semibold"
            >
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#b91c1c]" />
                Acil Satılık İlanlar
              </span>
              <span className="text-[9px] bg-red-100 text-[#b91c1c] px-1 py-0.2 rounded font-bold">
                FIRSAT
              </span>
            </a>
          </li>
          <li>
            <a
              href="#sahibinden"
              onClick={(e) => {
                e.preventDefault();
                navigate('/ilanlar?seller=Sahibinden');
              }}
              className="px-2 py-1.5 rounded-[2px] text-[#334155] hover:bg-[#f1f5f9] hover:text-[#0284c7] flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-emerald-600" />
                Sahibinden Satılıklar
              </span>
              <span className="text-[10px] text-[#94a3b8]">
                {sahibindenCount.toLocaleString('tr-TR')}
              </span>
            </a>
          </li>
          <li>
            <Link
              to="/makinam-guvende"
              className="px-2 py-1.5 rounded-[2px] text-[#334155] hover:bg-[#f1f5f9] hover:text-[#0284c7] flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#0284c7]" />
                Makinam Güvende İlanları
              </span>
              <span className="text-[10px] text-[#94a3b8]">
                {guvendeCount.toLocaleString('tr-TR')}
              </span>
            </Link>
          </li>
        </ul>
      </div>

      {/* 2. MAIN CATEGORY TREE - Classic Classifieds Navigation */}
      <div className="bg-white border border-[#cbd5e1] rounded-[3px] overflow-hidden shadow-xs divide-y divide-[#f1f5f9]">
        <div className="bg-[#19324d] text-white px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Tüm Kategoriler
          </span>
          <span className="text-[10px] text-[#94a3b8]">{categories.length} Ana Kategori</span>
        </div>

        {categories.map((category) => {
          const isExpanded = expandedCategories[category.id];
          const isSelected = selectedCategory === category.id;

          return (
            <div key={category.id} className="text-[12px]">
              {/* Category Title Row */}
              <div
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center justify-between cursor-pointer px-2.5 py-2 hover:bg-[#f8fafc] group select-none ${
                  isSelected ? 'bg-[#f0f9ff] text-[#0284c7] font-bold border-l-2 border-[#0284c7]' : 'text-[#1e293b]'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-[18px] flex items-center justify-center shrink-0">
                    {getCategoryIcon(category.iconName)}
                  </div>
                  <span className="truncate group-hover:text-[#0284c7] font-medium text-[11.5px]">
                    {category.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-[#94a3b8]">
                    ({getCategoryCount(category.id, category.count).toLocaleString('tr-TR')})
                  </span>
                  <button
                    onClick={(e) => toggleExpand(category.id, e)}
                    className="p-0.5 text-[#94a3b8] hover:text-[#1e293b]"
                    title={isExpanded ? 'Kapat' : 'Aç'}
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {isExpanded && (
                <ul className="bg-[#fafbfc] border-t border-[#f1f5f9] py-1 pl-7 pr-2 space-y-0.5 text-[11px]">
                  {category.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <a
                        href={`/ilanlar?cat=${category.id}&sub=${sub.id}`}
                        onClick={(e) => handleSubCategoryClick(category.id, sub.id, e)}
                        className="text-[#475569] hover:text-[#ea580c] flex items-center justify-between py-1 transition-colors"
                      >
                        <span className="truncate hover:underline">{sub.name}</span>
                        <span className="text-[10px] text-[#94a3b8] shrink-0 ml-1">
                          {getSubCategoryCount(category.id, sub.id, sub.count).toLocaleString('tr-TR')}
                        </span>
                      </a>
                    </li>
                  ))}
                  <li className="pt-0.5 pb-1">
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className="text-[10px] text-[#0284c7] font-semibold hover:underline"
                    >
                      Tümünü Gör ({getCategoryCount(category.id, category.count).toLocaleString('tr-TR')}) »
                    </button>
                  </li>
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. STORE PROMO BOX */}
      <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-[3px] p-2.5 text-center">
        <div className="text-[11px] font-bold text-[#1e293b]">Makine Üreticisi veya Satıcısı mısınız?</div>
        <p className="text-[10px] text-[#64748b] mt-0.5">
          Kurumsal mağazanızı açın, her gün binlerce doğrulanmış alıcıya doğrudan ulaşın.
        </p>
        <button
          onClick={() => navigate('/kurumsal-magaza-ac')}
          className="mt-2 w-full bg-[#19324d] hover:bg-[#122438] text-white text-[11px] font-semibold py-1.5 rounded-[2px] transition-colors shadow-xs"
        >
          Mağaza Açılış Başvurusu »
        </button>
      </div>
      </div>
    </aside>
  );
};
