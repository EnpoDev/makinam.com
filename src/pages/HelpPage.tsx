import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CreditCard,
  Truck,
  Building2,
  FileText,
  Phone,
  Mail,
  AlertCircle,
  ChevronRight,
  Headphones
} from 'lucide-react';
import {
  FAQItem,
  HelpSettings,
  DEFAULT_HELP_SETTINGS,
  DEFAULT_FAQS,
  seedHelpDataIfEmpty,
  subscribeToFAQs,
  subscribeToHelpSettings
} from '../lib/helpService';

export const HelpPage: React.FC = () => {
  // Real-time Firestore state
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQS);
  const [settings, setSettings] = useState<HelpSettings>(DEFAULT_HELP_SETTINGS);

  // Dynamic Categories from Firestore Settings
  const categoriesList = useMemo(() => {
    const list =
      settings.categories && settings.categories.length > 0
        ? settings.categories
        : DEFAULT_HELP_SETTINGS.categories || [];

    return list.map((cat) => {
      let icon = HelpCircle;
      if (cat.iconName === 'file' || cat.id === 'ilan') icon = FileText;
      else if (cat.iconName === 'card' || cat.id === 'odeme') icon = CreditCard;
      else if (cat.iconName === 'building' || cat.id === 'uyelik') icon = Building2;
      else if (cat.iconName === 'truck' || cat.id === 'lojistik') icon = Truck;
      else if (cat.iconName === 'shield' || cat.id === 'guvenlik') icon = ShieldCheck;

      return {
        ...cat,
        icon
      };
    });
  }, [settings.categories]);

  // Search & Filter state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'makinam-guvende-nedir': true,
    'ilan-nasil-verilir': true
  });

  // Initial Seed & Real-time Listeners
  useEffect(() => {
    let unsubscribeFAQs: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;

    const initData = async () => {
      // 1. Seed initial database data if Firestore collection is empty
      await seedHelpDataIfEmpty();

      // 2. Real-time live listener for FAQs from Firestore (collection: faqs)
      unsubscribeFAQs = subscribeToFAQs((liveFaqs) => {
        if (liveFaqs && liveFaqs.length > 0) {
          setFaqs(liveFaqs);
        }
      });

      // 3. Real-time live listener for Help Page Settings from Firestore (document: settings/help_page)
      unsubscribeSettings = subscribeToHelpSettings((liveSettings) => {
        if (liveSettings) {
          setSettings(liveSettings);
        }
      });
    };

    initData();

    return () => {
      if (unsubscribeFAQs) unsubscribeFAQs();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, []);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter FAQs by Category and Search Query
  const filteredFAQs = useMemo(() => {
    return faqs.filter((item) => {
      if (!item.isActive) return false;
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  // Helper Icon Renderer for Quick Cards
  const renderCardIcon = (iconType: string) => {
    switch (iconType) {
      case 'shield':
        return <ShieldCheck size={22} />;
      case 'file':
        return <FileText size={22} />;
      case 'building':
        return <Building2 size={22} />;
      case 'truck':
      default:
        return <Truck size={22} />;
    }
  };

  const getCardColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50 text-[#0284c7]',
          border: 'hover:border-[#0284c7]',
          btn: 'text-[#0284c7]'
        };
      case 'orange':
        return {
          bg: 'bg-orange-50 text-[#ea580c]',
          border: 'hover:border-[#ea580c]',
          btn: 'text-[#ea580c]'
        };
      case 'green':
        return {
          bg: 'bg-emerald-50 text-emerald-600',
          border: 'hover:border-emerald-600',
          btn: 'text-emerald-700'
        };
      case 'indigo':
      default:
        return {
          bg: 'bg-indigo-50 text-indigo-600',
          border: 'hover:border-indigo-600',
          btn: 'text-indigo-600'
        };
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-3 py-4 font-sans text-[#1e293b]">
      {/* 1. BREADCRUMBS */}
      <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-4">
        <Link to="/" className="text-[#0284c7] hover:underline">
          Anasayfa
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#334155] font-semibold">Yardım & SSS</span>
      </div>

      {/* 2. HERO SEARCH BANNER (Drawn from Firestore Settings) */}
      <div className="relative rounded-[4px] overflow-hidden bg-gradient-to-r from-[#19324d] via-[#1e3a5f] to-[#0f2338] text-white p-6 sm:p-8 mb-6 shadow-xs border border-[#122438]">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-[#ea580c] border border-orange-500/30 px-3 py-1 rounded-full text-[11.5px] font-bold mb-3">
            <HelpCircle size={14} className="text-[#ea580c]" />
            <span>{settings.badgeText}</span>
          </div>

          <h1 className="text-[22px] sm:text-[28px] font-black tracking-tight mb-2">
            {settings.heroTitle}
          </h1>
          <p className="text-[13px] text-[#94a3b8] mb-6 leading-relaxed">
            {settings.heroSubtitle}
          </p>

          {/* Instant Search Input */}
          <div className="relative max-w-[560px] mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Soru veya anahtar kelime arayın (Örn: İlan verme, IBAN, Makinam Güvende, Nakliye)..."
              className="w-full h-[46px] pl-11 pr-10 text-[13px] bg-white text-[#1e293b] rounded-[3px] shadow-md focus:outline-none focus:ring-2 focus:ring-[#ea580c] placeholder:text-gray-400 font-normal"
            />
            <Search size={18} className="absolute left-3.5 top-3.5 text-[#64748b]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-[11px] font-bold text-gray-400 hover:text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded"
              >
                Temizle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTION HIGHLIGHT CARDS (Drawn from Firestore Settings) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
        {(settings.quickCards || DEFAULT_HELP_SETTINGS.quickCards).map((card) => {
          const colors = getCardColorClasses(card.color);
          return (
            <div
              key={card.id}
              className={`bg-white border border-[#cbd5e1] rounded-[3px] p-4 shadow-2xs ${colors.border} transition-colors flex flex-col justify-between`}
            >
              <div>
                <div className={`w-10 h-10 rounded-[2px] ${colors.bg} flex items-center justify-center mb-3`}>
                  {renderCardIcon(card.iconType)}
                </div>
                <h3 className="font-bold text-[13.5px] text-[#1e293b] mb-1">{card.title}</h3>
                <p className="text-[11.5px] text-[#64748b] leading-relaxed">{card.description}</p>
              </div>
              <button
                onClick={() => {
                  setActiveCategory(card.category);
                  const firstMatch = faqs.find((f) => f.category === card.category);
                  if (firstMatch) {
                    setOpenItems((prev) => ({ ...prev, [firstMatch.id]: true }));
                  }
                }}
                className={`mt-3 text-[11px] font-bold ${colors.btn} hover:underline flex items-center gap-1 self-start`}
              >
                <span>{card.buttonText}</span>
                <ChevronRight size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* 4. MAIN FAQ CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Sidebar: Categories & Live Contact Box */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-[3px] p-2">
            <div className="text-[11px] font-black text-[#64748b] uppercase tracking-wider px-2 py-1 mb-1">
              Yardım Konuları
            </div>

            <div className="space-y-0.5">
              {categoriesList.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const count =
                  cat.id === 'all'
                    ? faqs.length
                    : faqs.filter((item) => item.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[2px] text-[12px] font-semibold transition-colors text-left ${
                      isActive
                        ? 'bg-[#ea580c] text-white shadow-xs'
                        : 'text-[#334155] hover:bg-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon size={14} className={isActive ? 'text-white' : 'text-[#64748b]'} />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span
                      className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-[#475569]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Contact Box (Drawn from Firestore Settings) */}
          <div className="bg-[#19324d] text-white rounded-[3px] p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#ea580c]">
              <Headphones size={20} />
              <span className="text-[13px] font-bold text-white">{settings.contactTitle}</span>
            </div>
            <p className="text-[11.5px] text-[#94a3b8] leading-relaxed">
              {settings.contactDescription}
            </p>
            <div className="pt-2 border-t border-white/10 space-y-2">
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2 text-[12.5px] font-bold text-white hover:text-[#ea580c] transition-colors"
              >
                <Phone size={14} className="text-[#ea580c]" />
                <span>{settings.phone}</span>
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 text-[12px] text-[#cbd5e1] hover:text-white transition-colors"
              >
                <Mail size={14} className="text-[#ea580c]" />
                <span>{settings.email}</span>
              </a>
              <div className="text-[10px] text-[#94a3b8] pl-5">
                {settings.phoneHours}
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: FAQ Accordion List */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-[16px] font-black text-[#1e293b]">
                  {categoriesList.find((c) => c.id === activeCategory)?.label || 'Tüm Konular'}
                </h2>
                <p className="text-[11.5px] text-[#64748b]">
                  {filteredFAQs.length} soru listeleniyor
                  {searchQuery && ` ("${searchQuery}" araması için)`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const allOpen: Record<string, boolean> = {};
                    filteredFAQs.forEach((item) => (allOpen[item.id] = true));
                    setOpenItems(allOpen);
                  }}
                  className="text-[11px] font-bold text-[#0284c7] hover:underline"
                >
                  Tümünü Aç
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setOpenItems({})}
                  className="text-[11px] font-bold text-[#64748b] hover:underline"
                >
                  Tümünü Kapat
                </button>
              </div>
            </div>

            {/* Accordion Items */}
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-[14px] font-bold text-[#1e293b]">Eşleşen soru bulunamadı</h3>
                <p className="text-[12px] text-[#64748b] mt-1">
                  Aradığınız kriterlere uygun sonuç bulunamadı. Lütfen farklı anahtar kelimeler deneyin veya müşteri hizmetlerimizle iletişime geçin.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-3 bg-[#ea580c] hover:bg-[#d94e08] text-white text-[11.5px] font-bold px-3 py-1.5 rounded-[2px]"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#f1f5f9]">
                {filteredFAQs.map((item) => {
                  const isOpen = !!openItems[item.id];
                  return (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 group/faq">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-start justify-between gap-3 text-left py-1"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-orange-50 text-[#ea580c] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 border border-orange-200">
                            ?
                          </span>
                          <span
                            className={`text-[13px] font-bold transition-colors ${
                              isOpen ? 'text-[#ea580c]' : 'text-[#1e293b] hover:text-[#0284c7]'
                            }`}
                          >
                            {item.question}
                          </span>
                        </div>

                        <div className="text-[#64748b] hover:text-[#1e293b] p-1 shrink-0">
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="mt-2.5 ml-7 text-[12.5px] text-[#475569] leading-relaxed bg-[#f8fafc] border border-[#e2e8f0] rounded-[3px] p-3.5 animate-in fade-in duration-200">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
