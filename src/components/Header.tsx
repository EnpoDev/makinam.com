import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, User, LogIn, Menu, X, Phone, SlidersHorizontal, ChevronDown, ChevronRight, LogOut, FileText, Heart, Building2, Settings, MessageSquare, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCategories } from '../context/CategoryContext';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { normalizeSearchText, extractDigits } from '../utils/search';
import { subscribeToUserConversations } from '../lib/messageService';

interface HeaderProps {
  listings?: Listing[];
  onOpenPostAd: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ listings, onOpenPostAd, onOpenAuth, onSearch }) => {
  const { categories } = useCategories();
  const { user, userProfile, logout } = useAuth();
  const { isFavorite, favoritesCount } = useFavorites();
  
  // Calculate exact favorited listings that exist in current listings
  const displayFavoritesCount = listings
    ? listings.filter((l) => isFavorite(l.id)).length
    : favoritesCount;

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Subscribe to real-time user conversations to calculate unread badge
  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
      return;
    }

    const unsubscribe = subscribeToUserConversations(user.uid, (conversations) => {
      const count = conversations.filter((c) => {
        if (c.sellerId === user.uid && c.unreadBySeller) return true;
        if (c.buyerId === user.uid && c.unreadByBuyer) return true;
        return false;
      }).length;
      setUnreadMessagesCount(count);
    });

    return () => unsubscribe();
  }, [user]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed);
    }

    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }

    const cleanDigits = extractDigits(trimmed);
    const normalized = normalizeSearchText(trimmed).replace(/["']/g, '');

    // Check if the query is an exact match for an existing listing ID or ad number
    if (listings && listings.length > 0) {
      const exactMatch = listings.find((item) => {
        const itemId = normalizeSearchText(item.id);
        const itemDigits = extractDigits(itemId);

        const adNoVal = String(
          item.adNo ||
          item.features?.find((f) => normalizeSearchText(f.label).includes('ilan'))?.value ||
          ''
        );
        const adNoNormalized = normalizeSearchText(adNoVal);
        const adNoDigits = extractDigits(adNoNormalized);

        if (itemId === normalized) return true;
        if (adNoNormalized && adNoNormalized === normalized) return true;
        if (cleanDigits && cleanDigits.length >= 4) {
          if (adNoDigits === cleanDigits) return true;
          if (itemDigits === cleanDigits) return true;
          if (itemId === `mak-${cleanDigits}`) return true;
        }
        return false;
      });

      if (exactMatch) {
        navigate(`/ilan/${exactMatch.id}`);
        return;
      }
    }

    const params = new URLSearchParams();
    params.set('q', trimmed);
    navigate(`/ilanlar?${params.toString()}`);
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Kullanıcı';

  return (
    <header className="bg-[#19324d] text-white border-b border-[#122438] sticky top-0 z-50 shadow-sm font-sans">
      {/* 1. TOP UTILITY STRIP */}
      <div className="bg-[#122438] text-[#94a3b8] text-[11px] border-b border-[#0e1d2e] hidden md:block">
        <div className="max-w-[1240px] mx-auto px-3 h-[28px] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-[#cbd5e1] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Türkiye'nin Makine Pazarı
            </span>
            <span className="text-[#334155]">|</span>
            <span className="text-[#94a3b8]">
              {listings && listings.length > 0 ? `Aktif ${listings.length} Makine İlanı` : "İş Makinelerinden Endüstriyel Mutfak Ekipmanlarına"}
            </span>
            <span className="text-[#334155]">|</span>
            <button
              type="button"
              onClick={() => navigate('/makinam-guvende')}
              className="text-[#f97316] hover:text-[#fb923c] font-semibold cursor-pointer"
            >
              ★ Makinam Güvende ile Al & Sat
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/kurumsal-magaza-ac"
              className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Building2 size={12} />
              <span>Kurumsal Mağaza Aç</span>
            </Link>
            <span className="text-[#334155]">|</span>
            <Link
              to="/yardim"
              className="hover:text-white"
            >
              Yardım / SSS
            </Link>
            <span className="text-[#334155]">|</span>
            <a
              href="tel:08501234567"
              className="flex items-center gap-1 text-[#cbd5e1] hover:text-white font-medium transition-colors"
              title="Müşteri Hizmetlerini Ara"
            >
              <Phone size={11} className="text-[#f97316]" />
              0850 123 45 67
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-[1240px] mx-auto px-3 py-2.5 flex items-center justify-between gap-3">
        {/* LOGO */}
        <div className="flex items-center shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="flex items-center group select-none py-1"
          >
            <div className="flex flex-col">
              <div className="text-[22px] font-black tracking-tight leading-none text-white">
                makinam<span className="text-[#ea580c]">.com</span>
              </div>
              <span className="text-[9px] font-bold text-[#94a3b8] tracking-widest uppercase mt-0.5">
                TÜRKİYE'NİN MAKİNE PAZARI
              </span>
            </div>
          </a>
        </div>

        {/* HIGH-UTILITY SEARCH BAR */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden lg:flex flex-1 max-w-[620px] items-center"
        >
          <div className="w-full flex items-center bg-white rounded-[3px] border border-[#cbd5e1] overflow-hidden focus-within:border-[#ea580c] focus-within:ring-1 focus-within:ring-[#ea580c] shadow-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kelime, ilan no veya model ara..."
              className="w-full h-[36px] px-3.5 text-[12px] text-[#1e293b] placeholder-[#94a3b8] bg-white focus:outline-none"
            />

            <button
              type="submit"
              className="h-[36px] px-4 bg-[#ea580c] hover:bg-[#c2410c] text-white flex items-center justify-center transition-colors font-bold text-[12px] gap-1 shrink-0"
              title="Ara"
            >
              <Search size={15} strokeWidth={2.5} />
              <span>Ara</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/ilanlar')}
            className="ml-2.5 text-[11px] text-[#cbd5e1] hover:text-white whitespace-nowrap flex items-center gap-1 hover:underline"
          >
            <SlidersHorizontal size={12} />
            Detaylı Arama
          </button>
        </form>

        {/* RIGHT SIDE USER ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* If Logged In */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="relative bg-[#214266] hover:bg-[#2b5482] text-white px-3 py-1.5 rounded-[3px] flex items-center gap-2 transition-colors border border-[#305e91] text-[12px]"
              >
                <div className="relative">
                  <div className="w-5 h-5 rounded-full bg-[#ea580c] text-white flex items-center justify-center font-bold text-[10px]">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#214266]"></span>
                  )}
                </div>
                <span className="font-semibold max-w-[120px] truncate">{displayName}</span>
                <ChevronDown size={13} className={`text-[#cbd5e1] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white text-[#1e293b] rounded-[3px] shadow-xl border border-[#cbd5e1] py-1 text-[11.5px] z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-[#f1f5f9] bg-[#f8fafc]">
                    <div className="font-bold text-[12px] truncate">{displayName}</div>
                    <div className="text-[10px] text-[#64748b] truncate">{user.email}</div>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-orange-100 text-[#ea580c]">
                      {userProfile?.accountType === 'kurumsal' ? 'Kurumsal Mağaza' : 'Bireysel Üye'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/hesabim/ilanlarim');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#f1f5f9] flex items-center justify-between text-[#334155]"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-[#0284c7]" />
                        <span>İlanlarım</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/hesabim/favorilerim');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#f1f5f9] flex items-center justify-between text-[#334155]"
                    >
                      <div className="flex items-center gap-2">
                        <Heart size={13} className="text-[#ea580c]" />
                        <span>Favori İlanlarım</span>
                      </div>
                      {displayFavoritesCount > 0 && (
                        <span className="bg-[#ea580c] text-white text-[9.5px] font-bold px-1.5 py-0.2 rounded-full">
                          {displayFavoritesCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        navigate('/hesabim/mesajlarim');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#f1f5f9] flex items-center justify-between text-[#334155]"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare size={13} className="text-[#0284c7]" />
                        <span>Mesajlarım</span>
                      </div>
                      {unreadMessagesCount > 0 && (
                        <span className="bg-[#ea580c] text-white text-[9.5px] font-bold px-1.5 py-0.2 rounded-full">
                          {unreadMessagesCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        navigate('/hesabim/profil');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#f1f5f9] flex items-center gap-2 text-[#334155]"
                    >
                      <Settings size={13} className="text-[#64748b]" />
                      <span>Hesap & IBAN Ayarları</span>
                    </button>

                    {(userProfile?.role === 'admin' || userProfile?.role === 'support' || (userProfile?.permissions && userProfile.permissions.length > 0) || user.email === 'enespoyraz380@gmail.com') && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-orange-50 flex items-center justify-between text-[#ea580c] font-bold border-y border-orange-100 bg-orange-50/40"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-[#ea580c]" />
                          <span>Yönetim Paneli (Admin)</span>
                        </div>
                        <ChevronRight size={12} />
                      </button>
                    )}
                    {userProfile?.accountType === 'kurumsal' && (
                      <button
                        onClick={() => {
                          navigate('/hesabim/ilanlarim');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-emerald-50/50 flex items-center justify-between text-emerald-800 font-semibold"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 size={13} className="text-emerald-600" />
                          <span>Kurumsal Mağazamı Yönet</span>
                        </div>
                        <ChevronRight size={12} className="text-emerald-500" />
                      </button>
                    )}
                  </div>

                  <div className="border-t border-[#f1f5f9] pt-1">
                    <button
                      onClick={async () => {
                        await logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium"
                    >
                      <LogOut size={13} />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* If Not Logged In */
            <div className="hidden sm:flex items-center gap-1.5 text-[12px]">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-[#cbd5e1] hover:text-white px-2 py-1.5 rounded-[3px] hover:bg-[#214266] flex items-center gap-1 transition-colors"
              >
                <LogIn size={14} className="text-[#cbd5e1]" />
                <span>Giriş Yap</span>
              </button>
              <span className="text-[#334155]">|</span>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-[#cbd5e1] hover:text-white px-2 py-1.5 rounded-[3px] hover:bg-[#214266] flex items-center gap-1 transition-colors"
              >
                <User size={14} className="text-[#cbd5e1]" />
                <span>Üye Ol</span>
              </button>
            </div>
          )}

          {/* SOLID POST AD CTA */}
          <button
            onClick={onOpenPostAd}
            className="bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white font-bold text-[12px] px-3.5 py-2 rounded-[3px] shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus size={15} strokeWidth={3} />
            <span>Ücretsiz İlan Ver</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#cbd5e1] hover:text-white rounded-[3px] hover:bg-[#214266]"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#122438] p-3 border-t border-[#1e3a5f] space-y-2.5">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kelime, ilan no veya model ara..."
              className="w-full h-[36px] px-3 text-[12px] text-[#1e293b] bg-white rounded-l-[3px] focus:outline-none"
            />
            <button
              type="submit"
              className="h-[36px] px-4 bg-[#ea580c] text-white font-bold rounded-r-[3px]"
            >
              <Search size={16} />
            </button>
          </form>

          {user ? (
            <div className="space-y-2">
              <div className="p-2.5 bg-[#19324d] rounded-[3px] text-xs text-white flex justify-between items-center">
                <div>
                  <div className="font-bold">{displayName}</div>
                  <div className="text-[10px] text-gray-300">{user.email}</div>
                </div>
                <button
                  onClick={() => logout()}
                  className="text-xs bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-[2px] text-white"
                >
                  Çıkış
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => {
                    navigate('/hesabim/ilanlarim');
                    setMobileMenuOpen(false);
                  }}
                  className="bg-[#214266] text-white py-2 px-2 rounded-[3px] font-semibold text-center flex items-center justify-center gap-1 text-[11px]"
                >
                  <FileText size={12} className="text-[#0284c7]" />
                  <span>İlanlarım</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/hesabim/favorilerim');
                    setMobileMenuOpen(false);
                  }}
                  className="bg-[#214266] text-white py-2 px-2 rounded-[3px] font-semibold text-center flex items-center justify-center gap-1 text-[11px]"
                >
                  <Heart size={12} className="text-[#ea580c]" />
                  <span>Favoriler</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/hesabim/mesajlarim');
                    setMobileMenuOpen(false);
                  }}
                  className="relative bg-[#214266] text-white py-2 px-2 rounded-[3px] font-semibold text-center flex items-center justify-center gap-1 text-[11px]"
                >
                  <MessageSquare size={12} className="text-[#0284c7]" />
                  <span>Mesajlarım</span>
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ea580c] text-white text-[8.5px] font-bold px-1 rounded-full">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={() => {
                  navigate('/hesabim/profil');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#1e3a5f] hover:bg-[#254774] text-[#cbd5e1] hover:text-white py-1.5 px-3 rounded-[3px] text-xs font-semibold text-center flex items-center justify-center gap-1.5"
              >
                <Settings size={13} />
                <span>Hesap ve IBAN Ayarlarım</span>
              </button>

              {(userProfile?.role === 'admin' || userProfile?.role === 'support' || (userProfile?.permissions && userProfile.permissions.length > 0) || user.email === 'enespoyraz380@gmail.com') && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white py-1.5 px-3 rounded-[3px] text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck size={14} />
                  <span>Yönetici Paneli (Admin) »</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 bg-[#19324d] text-white py-1.5 rounded text-xs font-semibold"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 bg-[#ea580c] text-white py-1.5 rounded text-xs font-semibold"
              >
                Üye Ol
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
            {categories.slice(0, 8).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  navigate(`/ilanlar?cat=${c.id}`);
                  setMobileMenuOpen(false);
                }}
                className="text-left text-[#cbd5e1] hover:text-white p-1.5 rounded hover:bg-[#19324d] truncate"
              >
                • {c.name}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px]">
            <Link
              to="/kurumsal-magaza-ac"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#ea580c] hover:underline font-bold flex items-center gap-1.5"
            >
              <Building2 size={13} />
              <span>Kurumsal Mağaza Açılış Başvurusu »</span>
            </Link>
            <div className="flex justify-between items-center">
              <Link
                to="/yardim"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#38bdf8] hover:underline font-semibold"
              >
                Yardım / SSS & Destek
              </Link>
              <span className="text-[#94a3b8]">0850 123 45 67</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
