import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  PauseCircle, 
  PlayCircle, 
  Flame, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Clock,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Settings,
  X,
  Save
} from 'lucide-react';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { handleImageFallback, DEFAULT_MACHINE_IMAGE } from '../utils/image';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface MyListingsPageProps {
  listings: Listing[];
  isLoading?: boolean;
  onOpenPostAd: () => void;
  onUpdateListingStatus?: (listingId: string, newStatus: 'active' | 'passive' | 'sold') => void;
  onUpdateListing?: (listingId: string, updates: Partial<Listing>) => void;
  onDeleteListing?: (listingId: string) => void;
}

export const MyListingsPage: React.FC<MyListingsPageProps> = ({
  listings,
  isLoading = false,
  onOpenPostAd,
  onUpdateListingStatus,
  onUpdateListing,
  onDeleteListing
}) => {
  useDocumentTitle('İlanlarım | makinam.com');
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'passive'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Edit Listing State
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    price: 0,
    currency: 'TL' as 'TL' | 'USD' | 'EUR',
    year: 2020,
    hours: 0,
    city: '',
    district: '',
    description: '',
    status: 'active' as 'active' | 'passive'
  });

  const handleStartEdit = (listing: Listing) => {
    setEditingListing(listing);
    setEditFormData({
      title: listing.title || '',
      price: listing.price || 0,
      currency: (listing.currency as any) || 'TL',
      year: listing.year || 2020,
      hours: listing.hours || 0,
      city: listing.city || '',
      district: listing.district || '',
      description: listing.description || '',
      status: (listing.status as any) || 'active',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    setIsSaving(true);
    setEditErrorMessage(null);
    try {
      if (onUpdateListing) {
        await onUpdateListing(editingListing.id, editFormData);
      }
      setStatusMessage(`"${editFormData.title}" ilanı başarıyla güncellendi.`);
      setEditingListing(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error: any) {
      console.error('İlan güncellenirken hata oluştu:', error);
      setEditErrorMessage('İlan güncellenirken bir hata oluştu: ' + (error?.message || 'Lütfen tekrar deneyiniz.'));
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || '';
  const email = user?.email || userProfile?.email || '';
  const accountType = userProfile?.accountType || 'bireysel';

  // Filter listings belonging to the user
  const userListings = listings.filter((l) => {
    // 1. Direct match by User UID
    if (user?.uid && l.userId === user.uid) return true;
    // 2. Direct match by User Email
    if (user?.email && l.userId === user.email) return true;
    // 3. Match by User Phone Number
    if (userProfile?.phoneNumber && l.seller?.phone && l.seller.phone === userProfile.phoneNumber) return true;
    // 4. Match by logged-in Seller Name
    if (displayName && l.seller?.name && l.seller.name.toLowerCase() === displayName.toLowerCase()) return true;
    // 5. Special fallback ONLY for Super Admin account
    if (user?.email === 'enespoyraz380@gmail.com') {
      if (l.seller?.name?.toLowerCase().includes('enes') || l.userId?.includes('enes')) return true;
    }
    return false;
  });

  const filteredListings = userListings.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase());

    const itemStatus = item.status || 'active';

    if (activeTab === 'active') return matchesSearch && itemStatus === 'active';
    if (activeTab === 'passive') return matchesSearch && itemStatus === 'passive';
    return matchesSearch;
  });

  const activeCount = userListings.filter((l) => (l.status || 'active') === 'active').length;
  const passiveCount = userListings.filter((l) => l.status === 'passive').length;
  const totalViews = userListings.reduce((acc, curr) => acc + (curr.viewsCount || 48), 0);

  const handleToggleStatus = (listingId: string, currentStatus?: 'active' | 'passive' | 'sold') => {
    const newStatus = (currentStatus || 'active') === 'active' ? 'passive' : 'active';
    if (onUpdateListingStatus) {
      onUpdateListingStatus(listingId, newStatus);
    }
    setStatusMessage(`İlan durumu güncellendi: ${newStatus === 'active' ? 'Yayında' : 'Pasife Alındı'}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDelete = (listingId: string, title: string) => {
    if (window.confirm(`"${title}" başlıklı ilanı silmek istediğinize emin misiniz?`)) {
      if (onDeleteListing) {
        onDeleteListing(listingId);
      }
      setStatusMessage('İlan başarıyla silindi.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('tr-TR')} ${currency === 'TL' ? 'TL' : currency}`;
  };

  if (!user && !authLoading) {
    return (
      <div className="max-w-[1240px] mx-auto px-3 py-16 font-sans text-center">
        <div className="max-w-md mx-auto bg-white border border-[#e2e8f0] p-8 rounded-[4px] shadow-2xs">
          <div className="w-14 h-14 bg-orange-50 text-[#ea580c] rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-200">
            <Settings size={26} className="text-[#ea580c]" />
          </div>
          <h2 className="text-[18px] font-black text-[#1e293b]">İlanlarınızı Yönetmek İçin Giriş Yapın</h2>
          <p className="text-[12.5px] text-[#64748b] mt-1.5 mb-6 leading-relaxed">
            Makinam.com'da yayınladığınız ilanlarınızı görüntülemek, fiyat ve açıklamalarını güncellemek veya yayından kaldırmak için lütfen üye girişi yapınız.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/giris-yap?redirect=/hesabim/ilanlarim"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-[12.5px] font-bold rounded-[3px] transition-colors shadow-xs"
            >
              Giriş Yap / Üye Ol
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 border border-[#cbd5e1] hover:bg-slate-50 text-[#475569] text-[12.5px] font-bold rounded-[3px] transition-colors"
            >
              Pazaryerine Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto px-3 py-5 font-sans">
      {/* 1. BREADCRUMBS */}
      <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-4">
        <Link to="/" className="hover:text-[#ea580c]">Ana Sayfa</Link>
        <ChevronRight size={12} />
        <span className="text-[#334155] font-semibold">Bana Özel</span>
        <ChevronRight size={12} />
        <span className="text-[#ea580c] font-bold">İlanlarım</span>
      </div>

      {/* 2. USER HEADER PROFILE BAR */}
      <div className="bg-white border border-[#e2e8f0] rounded-[4px] p-5 mb-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#19324d] text-white flex items-center justify-center font-black text-[22px] border-2 border-orange-500 shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-black text-[#1e293b]">{displayName}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[3px] uppercase tracking-wide ${
                accountType === 'kurumsal' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-orange-100 text-[#ea580c]'
              }`}>
                {accountType === 'kurumsal' ? 'KURUMSAL MAĞAZA' : 'BİREYSEL ÜYE'}
              </span>
            </div>
            <p className="text-[12px] text-[#64748b] mt-0.5">{email}</p>
          </div>
        </div>

        {/* Quick Post Ad Action Button & Profile Link */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Link
            to="/hesabim/profil"
            className="h-[38px] px-3.5 border border-[#cbd5e1] hover:bg-gray-50 text-[#475569] text-[12px] font-bold rounded-[3px] flex items-center justify-center gap-1.5 transition-colors"
          >
            <Settings size={14} />
            <span>Hesap & IBAN Ayarları</span>
          </Link>

          <button
            onClick={onOpenPostAd}
            className="flex-1 md:flex-initial h-[38px] px-4 bg-[#ea580c] hover:bg-[#d94e08] active:bg-[#c2410c] text-white text-[12.5px] font-bold rounded-[3px] shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Yeni İlan Ver</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-[4px] text-[12px] font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 3. METRIC CARDS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white border border-[#e2e8f0] p-3.5 rounded-[4px] shadow-2xs">
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={13} className="text-[#0284c7]" />
            Toplam İlan
          </div>
          <div className="text-[20px] font-black text-[#1e293b] mt-1">
            {isLoading || authLoading ? (
              <span className="inline-block w-8 h-5 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              userListings.length
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] p-3.5 rounded-[4px] shadow-2xs">
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Yayında Olan
          </div>
          <div className="text-[20px] font-black text-emerald-600 mt-1">
            {isLoading || authLoading ? (
              <span className="inline-block w-8 h-5 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              activeCount
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] p-3.5 rounded-[4px] shadow-2xs">
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
            <PauseCircle size={13} className="text-amber-600" />
            Pasif / Kapalı
          </div>
          <div className="text-[20px] font-black text-amber-600 mt-1">
            {isLoading || authLoading ? (
              <span className="inline-block w-8 h-5 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              passiveCount
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] p-3.5 rounded-[4px] shadow-2xs">
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
            <Eye size={13} className="text-indigo-600" />
            Toplam Görüntülenme
          </div>
          <div className="text-[20px] font-black text-indigo-600 mt-1">
            {isLoading || authLoading ? (
              <span className="inline-block w-8 h-5 bg-gray-200 animate-pulse rounded"></span>
            ) : (
              totalViews
            )}
          </div>
        </div>
      </div>

      {/* 4. MAIN LISTINGS CONTAINER */}
      <div className="bg-white border border-[#e2e8f0] rounded-[4px] shadow-2xs overflow-hidden">
        
        {/* Tabs & Search Bar */}
        <div className="p-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#edf2f7] p-1 rounded-[3px] text-[12px] font-bold">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-[2px] transition-colors ${
                activeTab === 'active'
                  ? 'bg-white text-[#ea580c] shadow-2xs'
                  : 'text-[#475569] hover:text-[#1e293b]'
              }`}
            >
              Yayında Olanlar ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab('passive')}
              className={`px-3 py-1.5 rounded-[2px] transition-colors ${
                activeTab === 'passive'
                  ? 'bg-white text-[#ea580c] shadow-2xs'
                  : 'text-[#475569] hover:text-[#1e293b]'
              }`}
            >
              Pasif İlanlar ({passiveCount})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-[2px] transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-[#ea580c] shadow-2xs'
                  : 'text-[#475569] hover:text-[#1e293b]'
              }`}
            >
              Tümü ({userListings.length})
            </button>
          </div>

          {/* Search inside own listings */}
          <div className="relative w-full sm:w-[260px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İlanlarımda ara (Başlık, model)..."
              className="w-full h-[32px] pl-8 pr-3 text-[11.5px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-white"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-[#94a3b8]" />
          </div>
        </div>

        {/* Listings Table View */}
        {isLoading || authLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#ea580c] border-t-transparent rounded-full animate-spin mb-3"></div>
            <div className="text-[13px] font-bold text-[#1e293b]">İlanlarınız Veritabanından Yükleniyor...</div>
            <div className="text-[11px] text-[#64748b] mt-1">Lütfen bekleyiniz.</div>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="bg-[#f1f5f9] text-[#475569] font-bold text-[11px] border-b border-[#e2e8f0]">
                  <th className="py-2.5 px-3 w-[80px]">Fotoğraf</th>
                  <th className="py-2.5 px-3 min-w-[280px]">İlan Başlığı & Detay</th>
                  <th className="py-2.5 px-3 w-[130px]">Fiyat</th>
                  <th className="py-2.5 px-3 w-[100px]">İlan Tarihi</th>
                  <th className="py-2.5 px-3 w-[90px] text-center">Görüntülenme</th>
                  <th className="py-2.5 px-3 w-[100px]">Durum</th>
                  <th className="py-2.5 px-3 w-[180px] text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredListings.map((item) => {
                  const isItemActive = (item.status || 'active') === 'active';
                  const views = item.viewsCount || 54;

                  return (
                    <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="py-2.5 px-3">
                        <Link to={`/ilan/${item.id}`} className="block relative group">
                          <img
                            src={item.images?.[0] || DEFAULT_MACHINE_IMAGE}
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

                      {/* Title & Info */}
                      <td className="py-2.5 px-3">
                        <Link
                          to={`/ilan/${item.id}`}
                          className="font-bold text-[#1e293b] hover:text-[#ea580c] text-[12.5px] line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-[#64748b] mt-0.5">
                          <span>İlan No: <strong className="text-[#334155]">{item.id}</strong></span>
                          <span>•</span>
                          <span>{item.brand} {item.model} ({item.year})</span>
                          <span>•</span>
                          <span>{item.city}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-3 font-bold text-[#1e293b] whitespace-nowrap">
                        {formatPrice(item.price, item.currency)}
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3 text-[#64748b] text-[11.5px] whitespace-nowrap">
                        {item.date}
                      </td>

                      {/* Views */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-[#475569] text-[11.5px] bg-[#f1f5f9] px-2 py-0.5 rounded-[3px]">
                          <Eye size={12} className="text-[#0284c7]" />
                          {views}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isItemActive ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10.5px] font-bold px-2 py-0.5 rounded-[3px] border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Yayında
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[10.5px] font-bold px-2 py-0.5 rounded-[3px] border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Pasif
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail */}
                          <Link
                            to={`/ilan/${item.id}`}
                            title="İlanı Görüntüle"
                            className="p-1.5 text-[#64748b] hover:text-[#0284c7] hover:bg-[#f1f5f9] rounded-[3px] transition-colors"
                          >
                            <ExternalLink size={14} />
                          </Link>

                          {/* Edit Listing */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            title="İlanı Düzenle"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-[3px] transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Toggle Active / Passive */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            title={isItemActive ? 'Yayından Kaldır (Pasife Al)' : 'Yeniden Yayına Al'}
                            className={`p-1.5 rounded-[3px] transition-colors ${
                              isItemActive
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {isItemActive ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.title)}
                            title="İlanı Sil"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-[3px] transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#f1f5f9] text-[#94a3b8] flex items-center justify-center mx-auto mb-3">
              <FileText size={24} />
            </div>
            <h3 className="text-[15px] font-bold text-[#1e293b]">
              {activeTab === 'passive'
                ? 'Pasif ilanınız bulunmuyor'
                : 'Bu kriterde ilanınız bulunmuyor'}
            </h3>
            <p className="text-[12px] text-[#64748b] max-w-[360px] mx-auto mt-1 mb-4">
              Makinam.com'da yeni bir makine ilanı vererek Türkiye genelindeki yüz binlerce alıcıya hemen ulaşabilirsiniz.
            </p>
            <button
              onClick={onOpenPostAd}
              className="inline-flex items-center gap-1.5 h-[36px] px-4 bg-[#ea580c] hover:bg-[#d94e08] text-white text-[12px] font-bold rounded-[3px] transition-colors shadow-xs"
            >
              <Plus size={15} strokeWidth={3} />
              <span>Hemen Ücretsiz İlan Ver</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. EDIT LISTING MODAL */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in">
          <div className="bg-white rounded-[6px] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#19324d] text-white flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold">İlanı Düzenle</h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  İlan No: #{editingListing.id} • {editingListing.brand} {editingListing.model}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingListing(null)}
                className="text-slate-300 hover:text-white p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4">
              {editErrorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded text-[12px] flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>{editErrorMessage}</span>
                </div>
              )}
              {/* Title */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  İlan Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-slate-300 rounded focus:border-[#ea580c] focus:outline-none"
                  placeholder="Örn: 2021 Model Temiz Hidromek 102B Kazıcı Yükleyici"
                />
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Fiyat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-[13px] border border-slate-300 rounded focus:border-[#ea580c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Para Birimi
                  </label>
                  <select
                    value={editFormData.currency}
                    onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value as any })}
                    className="w-full px-3 py-2 text-[13px] border border-slate-300 rounded focus:border-[#ea580c] focus:outline-none bg-white"
                  >
                    <option value="TL">TL (₺)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              {/* Year & Working Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Model Yılı
                  </label>
                  <input
                    type="number"
                    min={1970}
                    max={2030}
                    value={editFormData.year}
                    onChange={(e) => setEditFormData({ ...editFormData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-[13px] border border-slate-300 rounded focus:border-[#ea580c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Çalışma Saati (Saat)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.hours}
                    onChange={(e) => setEditFormData({ ...editFormData, hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-[13px] border border-slate-300 rounded focus:border-[#ea580c] focus:outline-none"
                  />
                </div>
              </div>

              {/* City & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Şehir
                  </label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] border border-slate-300 rounded focus:border-[#ea580c] focus:outline-none"
                    placeholder="Örn: İstanbul"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    İlçe
                  </label>
                  <input
                    type="text"
                    value={editFormData.district}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] border border-slate-300 rounded focus:border-[#ea580c] focus:outline-none"
                    placeholder="Örn: Tuzla"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  Yayın Durumu
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-[13px] border border-slate-300 rounded focus:border-[#ea580c] focus:outline-none bg-white"
                >
                  <option value="active">Yayında (Aktif)</option>
                  <option value="passive">Pasif (Gizli)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  Açıklama & Detaylar
                </label>
                <textarea
                  rows={5}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 text-[12.5px] border border-slate-300 rounded focus:border-[#ea580c] focus:outline-none resize-y"
                  placeholder="Makinenin durumu, bakımları, aksesuarları hakkında bilgi veriniz..."
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-[12.5px] font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded text-[12.5px] font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Save size={15} />
                  <span>{isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};