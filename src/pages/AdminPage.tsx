import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Layers,
  Users,
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Check,
  Star,
  Flame,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  FileText,
  BadgeCheck,
  RefreshCw,
  LogOut,
  Save,
  Plus,
  X,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  Tag,
  AlertTriangle,
  ShieldAlert,
  Wrench,
  CheckSquare,
  Square,
  Key,
  Shield,
  Lock,
  Sliders,
  Download,
  FolderTree,
  CheckCheck,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Listing, UserProfile, StoreApplication, Category } from '../types';
import {
  PERMISSION_CATEGORIES,
  ALL_PERMISSION_IDS,
  ROLE_PRESETS,
  RolePreset,
  hasPermission
} from '../data/adminPermissions';
import {
  subscribeToStoreApplications,
  approveAndCreateCorporateUser,
  rejectStoreApplication,
  deleteStoreApplication
} from '../lib/storeApplicationService';
import {
  getAllUsersFromFirestore,
  adminUpdateUserProfile,
  adminDeleteUser,
  adminUpdateListingFlags,
  adminUpdateFullListing,
  adminUpdateSetting
} from '../lib/adminService';
import { deleteListingFromFirestore } from '../lib/firebase';
import {
  subscribeToCategories,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore
} from '../lib/categoryService';
import {
  logAdminAction,
  subscribeToAuditLogs,
  AuditLog
} from '../lib/auditService';
import { exportToCSV } from '../utils/csvExport';
import {
  subscribeToPopularBrands,
  subscribeToPopularSearches,
  PopularBrandItem
} from '../lib/portalService';
import { DEFAULT_MACHINE_IMAGE } from '../utils/image';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface AdminPageProps {
  listings: Listing[];
  onDeleteListing?: (id: string, images?: string[]) => Promise<void>;
}

type AdminTab = 'dashboard' | 'applications' | 'listings' | 'users' | 'categories' | 'settings';

export const AdminPage: React.FC<AdminPageProps> = ({ listings = [] }) => {
  useDocumentTitle('Yönetim Konsolu | makinam.com');
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();

  // Primary Navigation
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Applications State
  const [applications, setApplications] = useState<StoreApplication[]>([]);
  const [appFilter, setAppFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [appSearch, setAppSearch] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<StoreApplication | null>(null);
  const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState<boolean>(false);
  const [rejectAppId, setRejectAppId] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('Evraklar eksik veya şirket faal değil.');

  // Listings Management State & Quick Filters
  const [listingSearch, setListingSearch] = useState<string>('');
  const [listingStatusFilter, setListingStatusFilter] = useState<string>('all');
  const [listingCategoryFilter, setListingCategoryFilter] = useState<string>('all');
  const [listingCityFilter, setListingCityFilter] = useState<string>('all');
  const [listingFlagFilter, setListingFlagFilter] = useState<string>('all');
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Users Management State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Category CMS State
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [newCatModalOpen, setNewCatModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatSlug, setNewCatSlug] = useState<string>('');
  const [newCatIcon, setNewCatIcon] = useState<string>('Layers');
  const [selectedCatForSub, setSelectedCatForSub] = useState<Category | null>(null);
  const [newSubCatName, setNewSubCatName] = useState<string>('');

  // Operational Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Settings CMS State
  const [brands, setBrands] = useState<PopularBrandItem[]>([]);
  const [searches, setSearches] = useState<string[]>([]);
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [newBrandCount, setNewBrandCount] = useState<string>('1.000 İlan');
  const [newSearchTag, setNewSearchTag] = useState<string>('');

  // Processing indicators
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const operatorName = userProfile?.displayName || user?.displayName || user?.email || 'Admin Operatör';

  // 1. Subscribe to Store Applications in real-time
  useEffect(() => {
    const unsubscribe = subscribeToStoreApplications((data) => {
      setApplications(data);
    });
    return () => unsubscribe();
  }, []);

  // 2. Load users
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    const data = await getAllUsersFromFirestore();
    setUsersList(data);
    setIsLoadingUsers(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 3. Subscribe to Categories
  useEffect(() => {
    const unsubscribe = subscribeToCategories(setCategoriesList);
    return () => unsubscribe();
  }, []);

  // 4. Subscribe to Audit Logs
  useEffect(() => {
    const unsubscribe = subscribeToAuditLogs(setAuditLogs, 15);
    return () => unsubscribe();
  }, []);

  // 5. Subscribe to portal settings
  useEffect(() => {
    const unsubBrands = subscribeToPopularBrands(setBrands);
    const unsubSearches = subscribeToPopularSearches(setSearches);
    return () => {
      unsubBrands();
      unsubSearches();
    };
  }, []);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (appFilter !== 'all' && app.status !== appFilter) return false;
      if (appSearch.trim()) {
        const q = appSearch.toLowerCase().trim();
        const matchTitle = app.companyName.toLowerCase().includes(q);
        const matchContact = app.contactName.toLowerCase().includes(q);
        const matchNo = app.applicationNo.toLowerCase().includes(q);
        const matchPhone = app.phone.toLowerCase().includes(q);
        const matchEmail = app.email.toLowerCase().includes(q);
        const matchCity = app.city.toLowerCase().includes(q);
        return matchTitle || matchContact || matchNo || matchPhone || matchEmail || matchCity;
      }
      return true;
    });
  }, [applications, appFilter, appSearch]);

  // Filtered listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (listingStatusFilter !== 'all' && (l.status || 'active') !== listingStatusFilter) return false;
      if (listingCategoryFilter !== 'all' && l.category !== listingCategoryFilter) return false;
      if (listingCityFilter !== 'all' && l.city !== listingCityFilter) return false;
      if (listingFlagFilter === 'vitrin' && !l.isVitrin) return false;
      if (listingFlagFilter === 'guvende' && !l.isGuvende) return false;
      if (listingFlagFilter === 'urgent' && !l.isUrgent) return false;

      if (listingSearch.trim()) {
        const q = listingSearch.toLowerCase().trim();
        const matchTitle = l.title.toLowerCase().includes(q);
        const matchBrand = l.brand.toLowerCase().includes(q);
        const matchModel = l.model.toLowerCase().includes(q);
        const matchCity = l.city.toLowerCase().includes(q);
        const matchId = l.id.toLowerCase().includes(q);
        const matchAdNo = (l.adNo || '').toLowerCase().includes(q);
        return matchTitle || matchBrand || matchModel || matchCity || matchId || matchAdNo;
      }
      return true;
    });
  }, [listings, listingStatusFilter, listingCategoryFilter, listingCityFilter, listingFlagFilter, listingSearch]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (userRoleFilter !== 'all') {
        if (userRoleFilter === 'admin' && u.role !== 'admin') return false;
        if (userRoleFilter === 'support' && u.role !== 'support') return false;
        if (userRoleFilter === 'user' && (u.role === 'admin' || u.role === 'support')) return false;
        if (userRoleFilter === 'has_perms' && (!u.permissions || u.permissions.length === 0)) return false;
      }
      if (userTypeFilter !== 'all' && (u.accountType || 'bireysel') !== userTypeFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase().trim();
        const matchName = (u.displayName || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchPhone = (u.phoneNumber || '').toLowerCase().includes(q);
        const matchComp = (u.companyName || '').toLowerCase().includes(q);
        const matchUid = (u.uid || '').toLowerCase().includes(q);
        return matchName || matchEmail || matchPhone || matchComp || matchUid;
      }
      return true;
    });
  }, [usersList, userRoleFilter, userTypeFilter, userSearch]);

  // Application actions
  const handleApproveApplication = async (app: StoreApplication) => {
    if (!app.id) return;
    setIsProcessing(true);
    const reviewerName = userProfile?.displayName || user?.displayName || user?.email || 'Makinam Temsilcisi';
    const res = await approveAndCreateCorporateUser(app, reviewerName);
    setIsProcessing(false);

    if (res.success) {
      showToast(`Kurumsal mağaza başvurusu (${app.applicationNo}) onaylandı ve kullanıcı hesabı oluşturuldu.`, 'success');
      setSelectedApp(null);
      fetchUsers();
    } else {
      showToast(`Hata: ${res.error || 'Onaylanamadı'}`, 'error');
    }
  };

  const handleOpenRejectModal = (appId: string) => {
    setRejectAppId(appId);
    setRejectReason('Evraklar eksik veya şirket faal değil.');
    setRejectReasonModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectAppId) return;
    setIsProcessing(true);
    const reviewerName = userProfile?.displayName || user?.displayName || user?.email || 'Makinam Temsilcisi';
    const res = await rejectStoreApplication(rejectAppId, rejectReason, reviewerName);
    setIsProcessing(false);
    setRejectReasonModalOpen(false);

    if (res.success) {
      showToast('Başvuru reddedildi olarak işaretlendi.', 'success');
      if (selectedApp && selectedApp.id === rejectAppId) {
        setSelectedApp(null);
      }
    } else {
      showToast(`Hata: ${res.error || 'İşlem başarısız'}`, 'error');
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!window.confirm('Bu kurumsal mağaza başvuru kaydını kalıcı olarak silmek istediğinize emin misiniz?')) {
      return;
    }
    const success = await deleteStoreApplication(appId);
    if (success) {
      showToast('Başvuru kaydı silindi.', 'success');
      if (selectedApp?.id === appId) setSelectedApp(null);
    } else {
      showToast('Kayıt silinemedi.', 'error');
    }
  };

  // Quick Listing flag toggle
  const handleToggleListingFlag = async (listingId: string, flag: 'isVitrin' | 'isUrgent' | 'isGuvende', currentVal: boolean) => {
    const res = await adminUpdateListingFlags(listingId, { [flag]: !currentVal });
    if (res.success) {
      showToast(`İlan özelliği güncellendi.`, 'success');
    } else {
      showToast(`Güncelleme hatası: ${res.error}`, 'error');
    }
  };

  // Quick status toggle
  const handleChangeListingStatus = async (listingId: string, newStatus: 'active' | 'passive' | 'sold') => {
    const res = await adminUpdateListingFlags(listingId, { status: newStatus });
    if (res.success) {
      showToast(`İlan durumu "${newStatus}" olarak güncellendi.`, 'success');
    } else {
      showToast(`Güncelleme hatası: ${res.error}`, 'error');
    }
  };

  // Delete listing
  const handleDeleteListing = async (listing: Listing) => {
    if (!window.confirm(`"${listing.title}" başlıklı ilanı sistemden tamamen silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await deleteListingFromFirestore(listing.id, listing.images || []);
      showToast('İlan başarıyla veritabanından kaldırıldı.', 'success');
      if (editingListing?.id === listing.id) setEditingListing(null);
    } catch (err: any) {
      showToast(`İlan silinirken hata: ${err?.message}`, 'error');
    }
  };

  // Save Full Listing Edits
  const handleSaveListingDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    setIsProcessing(true);
    const res = await adminUpdateFullListing(editingListing.id, editingListing);
    setIsProcessing(false);

    if (res.success) {
      await logAdminAction(
        'LISTING_UPDATE',
        `İlan güncellendi: "${editingListing.title}" (İlan No: ${editingListing.adNo || editingListing.id})`,
        operatorName,
        'listing',
        editingListing.id
      );
      showToast('İlan tüm detaylarıyla başarıyla güncellendi.', 'success');
      setEditingListing(null);
    } else {
      showToast(`Güncelleme hatası: ${res.error}`, 'error');
    }
  };

  // BULK LISTING ACTIONS
  const handleSelectAllListings = () => {
    if (selectedListingIds.length === filteredListings.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(filteredListings.map((l) => l.id));
    }
  };

  const handleToggleSelectListing = (id: string) => {
    setSelectedListingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkToggleFlag = async (flag: 'isVitrin' | 'isUrgent' | 'isGuvende', value: boolean) => {
    if (selectedListingIds.length === 0) return;
    setIsProcessing(true);
    let successCount = 0;
    for (const id of selectedListingIds) {
      const res = await adminUpdateListingFlags(id, { [flag]: value });
      if (res.success) successCount++;
    }
    setIsProcessing(false);
    await logAdminAction(
      'BULK_FLAG_UPDATE',
      `${selectedListingIds.length} ilanın ${flag} özelliği ${value ? 'aktif' : 'pasif'} yapıldı.`,
      operatorName,
      'listing'
    );
    showToast(`${successCount} ilan toplu olarak güncellendi.`, 'success');
    setSelectedListingIds([]);
  };

  const handleBulkChangeStatus = async (status: 'active' | 'passive' | 'sold') => {
    if (selectedListingIds.length === 0) return;
    setIsProcessing(true);
    let successCount = 0;
    for (const id of selectedListingIds) {
      const res = await adminUpdateListingFlags(id, { status });
      if (res.success) successCount++;
    }
    setIsProcessing(false);
    await logAdminAction(
      'BULK_STATUS_UPDATE',
      `${selectedListingIds.length} ilanın durumu "${status}" yapıldı.`,
      operatorName,
      'listing'
    );
    showToast(`${successCount} ilanın durumu "${status}" yapıldı.`, 'success');
    setSelectedListingIds([]);
  };

  const handleBulkDeleteListings = async () => {
    if (selectedListingIds.length === 0) return;
    if (!window.confirm(`Seçili ${selectedListingIds.length} adet ilanı kalıcı olarak silmek istediğinize emin misiniz?`)) {
      return;
    }
    setIsProcessing(true);
    let successCount = 0;
    for (const id of selectedListingIds) {
      const target = listings.find((l) => l.id === id);
      try {
        await deleteListingFromFirestore(id, target?.images || []);
        successCount++;
      } catch (err) {
        console.warn('Silme hatası:', err);
      }
    }
    setIsProcessing(false);
    await logAdminAction(
      'BULK_DELETE',
      `${successCount} adet ilan veritabanından kalıcı olarak silindi.`,
      operatorName,
      'listing'
    );
    showToast(`${successCount} ilan başarıyla silindi.`, 'success');
    setSelectedListingIds([]);
  };

  // CSV EXPORT HANDLERS
  const handleExportListingsCSV = () => {
    const headers = [
      'İlan ID',
      'İlan No',
      'Başlık',
      'Kategori',
      'Alt Kategori',
      'Marka',
      'Model',
      'Yıl',
      'Çalışma Saati',
      'Fiyat',
      'Para Birimi',
      'İl',
      'İlçe',
      'Durum',
      'Vitrin',
      'Makinam Güvende',
      'Acil',
      'Satıcı Adı',
      'Satıcı Tipi',
      'Satıcı Telefonu'
    ];

    const rows = filteredListings.map((l) => [
      l.id,
      l.adNo || l.id,
      l.title,
      l.category,
      l.subCategory,
      l.brand,
      l.model,
      l.year,
      l.hours,
      l.price,
      l.currency,
      l.city,
      l.district,
      l.status || 'active',
      l.isVitrin ? 'Evet' : 'Hayır',
      l.isGuvende ? 'Evet' : 'Hayır',
      l.isUrgent ? 'Evet' : 'Hayır',
      l.seller?.companyName || l.seller?.name || '',
      l.seller?.type || '',
      l.seller?.phone || ''
    ]);

    exportToCSV('makinam_ilan_raporu', headers, rows);
    showToast(`${filteredListings.length} ilan CSV olarak dışa aktarıldı.`, 'success');
  };

  const handleExportApplicationsCSV = () => {
    const headers = [
      'Başvuru No',
      'Mağaza Adı',
      'Resmi Ticari Unvan',
      'Vergi Dairesi',
      'VKN / TCKN',
      'Yetkili Adı',
      'Telefon',
      'E-posta',
      'İl',
      'İlçe',
      'Durum',
      'Temsilci Notu'
    ];

    const rows = filteredApplications.map((app) => [
      app.applicationNo,
      app.companyName,
      app.legalTitle,
      app.taxOffice,
      app.taxNumber,
      app.contactName,
      app.phone,
      app.email,
      app.city,
      app.district,
      app.status === 'approved' ? 'Onaylandı' : app.status === 'rejected' ? 'Reddedildi' : 'İnceleniyor',
      app.reviewNotes || ''
    ]);

    exportToCSV('kurumsal_magaza_basvurulari', headers, rows);
    showToast(`${filteredApplications.length} başvuru CSV olarak dışa aktarıldı.`, 'success');
  };

  const handleExportUsersCSV = () => {
    const headers = [
      'Kullanıcı UID',
      'Ad Soyad',
      'E-posta',
      'Telefon',
      'Hesap Türü',
      'Yetki Rolü',
      'Firma Adı',
      'Vergi No',
      'İl',
      'İlçe',
      'IBAN'
    ];

    const rows = filteredUsers.map((u) => [
      u.uid,
      u.displayName || '',
      u.email,
      u.phoneNumber || '',
      u.accountType || 'bireysel',
      u.role || 'user',
      u.companyName || '',
      u.taxNumber || '',
      u.city || '',
      u.district || '',
      u.iban || ''
    ]);

    exportToCSV('makinam_kullanicilar', headers, rows);
    showToast(`${filteredUsers.length} kullanıcı CSV olarak dışa aktarıldı.`, 'success');
  };

  // CATEGORY CMS HANDLERS
  const handleSaveNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast('Kategori adı zorunludur.', 'error');
      return;
    }
    const slug = newCatSlug.trim() || newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setIsProcessing(true);
    try {
      await saveCategoryToFirestore({
        id: slug,
        name: newCatName.trim(),
        slug,
        iconName: newCatIcon || 'Layers',
        count: 0,
        subcategories: [],
        order: categoriesList.length + 1
      });
      await logAdminAction(
        'CATEGORY_CREATE',
        `Yeni kategori eklendi: "${newCatName.trim()}"`,
        operatorName,
        'category',
        slug
      );
      showToast(`"${newCatName}" kategorisi başarıyla eklendi.`, 'success');
      setNewCatModalOpen(false);
      setNewCatName('');
      setNewCatSlug('');
    } catch (err: any) {
      showToast(`Kategori eklenemedi: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddSubcategory = async (category: Category) => {
    if (!newSubCatName.trim()) {
      showToast('Alt kategori adı zorunludur.', 'error');
      return;
    }
    const subSlug = newSubCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const updatedSubcategories = [
      ...(category.subcategories || []),
      {
        id: subSlug,
        slug: subSlug,
        name: newSubCatName.trim(),
        count: 0
      }
    ];

    setIsProcessing(true);
    try {
      await saveCategoryToFirestore({
        ...category,
        subcategories: updatedSubcategories
      });
      await logAdminAction(
        'SUBCATEGORY_CREATE',
        `"${category.name}" kategorisine alt kategori eklendi: "${newSubCatName.trim()}"`,
        operatorName,
        'category',
        category.id
      );
      showToast(`"${newSubCatName}" alt kategorisi eklendi.`, 'success');
      setNewSubCatName('');
      setSelectedCatForSub(null);
    } catch (err: any) {
      showToast(`Alt kategori eklenemedi: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`"${category.name}" kategorisini ve tüm alt kategorilerini silmek istediğinize emin misiniz?`)) {
      return;
    }
    setIsProcessing(true);
    try {
      await deleteCategoryFromFirestore(category.id);
      await logAdminAction(
        'CATEGORY_DELETE',
        `Kategori silindi: "${category.name}"`,
        operatorName,
        'category',
        category.id
      );
      showToast(`"${category.name}" kategorisi silindi.`, 'success');
    } catch (err: any) {
      showToast(`Kategori silinemedi: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Permission Matrix Handlers
  const handleTogglePermission = (permId: string) => {
    if (!editingUser) return;
    const current = editingUser.permissions || [];
    const has = current.includes(permId);
    let next: string[];
    if (has) {
      next = current.filter((p) => p !== permId);
    } else {
      next = [...current, permId];
    }
    setEditingUser({ ...editingUser, permissions: next });
  };

  const handleToggleCategoryPermissions = (perms: { id: string }[]) => {
    if (!editingUser) return;
    const current = editingUser.permissions || [];
    const allCatIds = perms.map((p) => p.id);
    const hasAll = allCatIds.every((id) => current.includes(id));

    let next: string[];
    if (hasAll) {
      next = current.filter((id) => !allCatIds.includes(id));
    } else {
      const set = new Set([...current, ...allCatIds]);
      next = Array.from(set);
    }
    setEditingUser({ ...editingUser, permissions: next });
  };

  const handleApplyPreset = (preset: RolePreset) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      role: preset.role,
      permissions: [...preset.permissions]
    });
    showToast(`"${preset.name}" rol şablonu uygulandı.`, 'success');
  };

  const handleSelectAllPermissions = () => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      role: 'admin',
      permissions: [...ALL_PERMISSION_IDS]
    });
    showToast('Tüm modül yetkileri tanımlandı.', 'success');
  };

  const handleClearAllPermissions = () => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      role: 'user',
      permissions: []
    });
    showToast('Tüm yetkiler temizlendi.', 'success');
  };

  // Save Full User Edits
  const handleSaveUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsProcessing(true);
    const userToSave = {
      ...editingUser,
      permissions: editingUser.permissions || []
    };
    const res = await adminUpdateUserProfile(editingUser.uid, userToSave);
    setIsProcessing(false);

    if (res.success) {
      showToast(`Kullanıcı (${editingUser.displayName || editingUser.email}) başarıyla güncellendi.`, 'success');
      setUsersList((prev) => prev.map((u) => (u.uid === editingUser.uid ? { ...u, ...userToSave } : u)));
      setEditingUser(null);
    } else {
      showToast(`Kullanıcı güncellenemedi: ${res.error}`, 'error');
    }
  };

  // Delete User
  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm('Bu kullanıcıyı ve profil kaydını veritabanından silmek istediğinize emin misiniz?')) {
      return;
    }
    const success = await adminDeleteUser(uid);
    if (success) {
      showToast('Kullanıcı profili silindi.', 'success');
      setUsersList((prev) => prev.filter((u) => u.uid !== uid));
      if (editingUser?.uid === uid) setEditingUser(null);
    } else {
      showToast('Kullanıcı silinemedi.', 'error');
    }
  };

  // Settings CMS
  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    const updated = [...brands, { name: newBrandName.trim(), count: newBrandCount.trim() || '1.000 İlan' }];
    const res = await adminUpdateSetting('popular_brands', { items: updated });
    if (res.success) {
      setNewBrandName('');
      showToast('Marka listeye eklendi.', 'success');
    }
  };

  const handleRemoveBrand = async (brandName: string) => {
    const updated = brands.filter((b) => b.name !== brandName);
    const res = await adminUpdateSetting('popular_brands', { items: updated });
    if (res.success) {
      showToast('Marka silindi.', 'success');
    }
  };

  const handleAddSearchTag = async () => {
    if (!newSearchTag.trim()) return;
    const updated = [...searches, newSearchTag.trim()];
    const res = await adminUpdateSetting('popular_searches', { items: updated });
    if (res.success) {
      setNewSearchTag('');
      showToast('Arama etiketi eklendi.', 'success');
    }
  };

  const handleRemoveSearchTag = async (tag: string) => {
    const updated = searches.filter((t) => t !== tag);
    const res = await adminUpdateSetting('popular_searches', { items: updated });
    if (res.success) {
      showToast('Arama etiketi silindi.', 'success');
    }
  };

  // Metrics
  const pendingAppsCount = useMemo(() => applications.filter((a) => a.status === 'pending').length, [applications]);
  const activeListingsCount = useMemo(() => listings.filter((l) => (l.status || 'active') === 'active').length, [listings]);
  const corporateUsersCount = useMemo(() => usersList.filter((u) => u.accountType === 'kurumsal').length, [usersList]);
  const vitrinListingsCount = useMemo(() => listings.filter((l) => l.isVitrin).length, [listings]);

  // Authorization checks
  const isAuthorized =
    user?.email === 'enespoyraz380@gmail.com' ||
    userProfile?.role === 'admin' ||
    userProfile?.role === 'support' ||
    (userProfile?.permissions && userProfile.permissions.length > 0);

  const canViewApplications = hasPermission(userProfile, 'applications:view');
  const canViewListings = hasPermission(userProfile, 'listings:view');
  const canViewUsers = hasPermission(userProfile, 'users:view');
  const canViewSettings = hasPermission(userProfile, 'settings:view');

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
        <div className="bg-white border border-[#cbd5e1] rounded p-6 max-w-md w-full text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto border border-slate-200">
            <Lock size={20} />
          </div>
          <h2 className="text-[16px] font-bold text-[#0f172a]">Yönetim Konsolu Girişi</h2>
          <p className="text-[12px] text-[#64748b]">
            Bu alana erişmek için yetkili yönetici veya temsilci hesabınızla giriş yapmalısınız.
          </p>
          <div className="pt-2">
            <Link
              to="/giris-yap"
              className="px-4 py-2 bg-[#0f172a] hover:bg-slate-800 text-white text-[12px] font-bold rounded inline-block transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
        <div className="bg-white border border-[#cbd5e1] rounded p-6 max-w-md w-full text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert size={22} />
          </div>
          <h2 className="text-[16px] font-bold text-[#0f172a]">Yetkisiz Erişim</h2>
          <p className="text-[12px] text-[#64748b]">
            Hesabınızın bu yönetim paneline erişim yetkisi bulunmamaktadır. Yetki tanımlaması için lütfen sistem yöneticinizle irtibat kurunuz.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="px-4 py-2 bg-[#0f172a] hover:bg-slate-800 text-white text-[12px] font-bold rounded inline-block transition-colors"
            >
              Pazaryerine Geri Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0f172a] font-sans flex flex-col antialiased">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-[4px] shadow-lg text-[12px] font-semibold flex items-center gap-2 border animate-in slide-in-from-bottom duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-rose-900 text-white border-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={15} className="text-emerald-400" />
          ) : (
            <AlertCircle size={15} className="text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TOP CORPORATE NAVIGATION BAR */}
      <header className="bg-[#0f172a] text-white border-b border-[#1e293b] sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2 select-none group">
              <span className="text-[17px] font-black tracking-tight text-white">
                makinam<span className="text-[#f97316]">.com</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Yönetim Konsolu
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="text-[11.5px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ExternalLink size={13} />
              <span>Siteyi Görüntüle</span>
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center text-[11px] font-bold">
                {(userProfile?.displayName || user?.displayName || user?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[11.5px] font-semibold text-white leading-tight">
                  {userProfile?.displayName || user?.displayName || 'Yönetici'}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">Sistem Yöneticisi</div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors ml-1"
              title="Güvenli Çıkış"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-[1440px] w-full mx-auto px-4 py-5 flex-1 flex flex-col md:flex-row gap-5">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-[230px] shrink-0">
          <nav className="bg-white border border-[#cbd5e1] rounded-[4px] p-2 space-y-1 shadow-xs">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setEditingListing(null);
                setEditingUser(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-[12px] font-medium transition-colors ${
                activeTab === 'dashboard' && !editingListing && !editingUser
                  ? 'bg-[#0f172a] text-white'
                  : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard size={15} />
                <span>Genel Bakış</span>
              </div>
            </button>

            {canViewApplications && (
              <button
                onClick={() => {
                  setActiveTab('applications');
                  setEditingListing(null);
                  setEditingUser(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-[12px] font-medium transition-colors ${
                  activeTab === 'applications' && !editingListing && !editingUser
                    ? 'bg-[#0f172a] text-white'
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 size={15} />
                  <span>Mağaza Başvuruları</span>
                </div>
                {pendingAppsCount > 0 && (
                  <span className="bg-[#f97316] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {pendingAppsCount}
                  </span>
                )}
              </button>
            )}

            {canViewListings && (
              <button
                onClick={() => {
                  setActiveTab('listings');
                  setEditingUser(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-[12px] font-medium transition-colors ${
                  activeTab === 'listings'
                    ? 'bg-[#0f172a] text-white'
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers size={15} />
                  <span>İlan Yönetimi</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {listings.length}
                </span>
              </button>
            )}

            {canViewUsers && (
              <button
                onClick={() => {
                  setActiveTab('users');
                  setEditingListing(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-[12px] font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-[#0f172a] text-white'
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users size={15} />
                  <span>Kullanıcı Yönetimi</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {usersList.length}
                </span>
              </button>
            )}

            {canViewSettings && (
              <button
                onClick={() => {
                  setActiveTab('categories');
                  setEditingListing(null);
                  setEditingUser(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-[12px] font-medium transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-[#0f172a] text-white'
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree size={15} />
                  <span>Kategori Yönetimi</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {categoriesList.length}
                </span>
              </button>
            )}

            {canViewSettings && (
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setEditingListing(null);
                  setEditingUser(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-[12px] font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-[#0f172a] text-white'
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings size={15} />
                  <span>Portal Ayarları</span>
                </div>
              </button>
            )}
          </nav>

          {/* SYSTEM SUMMARY BOX */}
          <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-3 mt-3 shadow-xs text-[11px] text-[#64748b] space-y-1.5">
            <div className="text-[11.5px] font-bold text-[#0f172a] pb-1 border-b border-[#e2e8f0]">
              Sistem Durumu
            </div>
            <div className="flex justify-between items-center">
              <span>Veritabanı:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} /> Canlı (Firestore)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Depolama:</span>
              <span className="text-slate-700 font-mono">Cloudflare R2</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Erişim Rolü:</span>
              <span className="text-indigo-700 font-bold">Admin (Root)</span>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {/* ========================================================
              SUB-VIEW: DEDICATED USER DETAIL & EDIT SCREEN
          ======================================================== */}
          {editingUser ? (
            <div className="space-y-4">
              {/* Header / Breadcrumb */}
              <div className="flex items-center justify-between bg-white border border-[#cbd5e1] p-3 rounded-[4px] shadow-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                    title="Listeye Geri Dön"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <div className="text-[10.5px] text-[#64748b] uppercase tracking-wider font-semibold">
                      Kullanıcı Yönetimi / Kullanıcı Profil & Yetki Düzenleyici
                    </div>
                    <h1 className="text-[16px] font-black text-[#0f172a]">
                      {editingUser.displayName || editingUser.email}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="px-3 py-1.5 text-[11.5px] font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => handleDeleteUser(editingUser.uid)}
                    className="px-3 py-1.5 text-[11.5px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                    <span>Kullanıcıyı Sil</span>
                  </button>
                  <button
                    onClick={handleSaveUserDetails}
                    disabled={isProcessing}
                    className="px-4 py-1.5 text-[11.5px] font-bold text-white bg-[#0f172a] hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Save size={14} />
                    <span>{isProcessing ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                  </button>
                </div>
              </div>

              {/* Form Panels */}
              <form onSubmit={handleSaveUserDetails} className="space-y-4">
                {/* 1. YETKİ VE HESAP YÖNETİMİ PANELİ */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                  <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#e2e8f0]">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    <h2 className="text-[13px] font-bold text-[#0f172a]">
                      Hesap Yetkileri, Rol ve Moderasyon Durumu
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-[12px]">
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">
                        Sistem Erişim Yetki Rolü
                      </label>
                      <select
                        value={editingUser.role || 'user'}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            role: e.target.value as 'admin' | 'support' | 'user'
                          })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-white text-[#0f172a] font-semibold focus:outline-none focus:border-indigo-600"
                      >
                        <option value="user">Standart Kullanıcı</option>
                        <option value="support">Müşteri Temsilcisi (Destek)</option>
                        <option value="admin">Sistem Yöneticisi (Admin Root)</option>
                      </select>
                      <span className="text-[10px] text-[#64748b] mt-1 block">
                        Admin rolü tüm silme ve güncelleme işlemlerini yapabilir.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">
                        Hesap Türü
                      </label>
                      <select
                        value={editingUser.accountType || 'bireysel'}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            accountType: e.target.value as 'bireysel' | 'kurumsal'
                          })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-white text-[#0f172a] font-semibold focus:outline-none focus:border-indigo-600"
                      >
                        <option value="bireysel">Bireysel Hesap</option>
                        <option value="kurumsal">Kurumsal Mağaza</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">
                        Hesap Durumu
                      </label>
                      <select
                        value={editingUser.status || 'active'}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            status: e.target.value as 'active' | 'suspended'
                          })
                        }
                        className={`w-full h-[34px] px-2.5 border rounded font-semibold focus:outline-none ${
                          editingUser.status === 'suspended'
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : 'bg-white border-[#cbd5e1] text-[#0f172a]'
                        }`}
                      >
                        <option value="active">Aktif (Kullanımda)</option>
                        <option value="suspended">Askıya Alındı (Bloke)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">
                        İlan Yayınlama Kotası
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingUser.listingLimit !== undefined ? editingUser.listingLimit : 50}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            listingLimit: parseInt(e.target.value, 10) || 0
                          })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-indigo-600 font-mono"
                      />
                      <span className="text-[10px] text-[#64748b] mt-1 block">
                        Aynı anda aktif bulundurabileceği maksimum ilan sayısı.
                      </span>
                    </div>

                    <div className="sm:col-span-2 flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!editingUser.isApprovedStore}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              isApprovedStore: e.target.checked
                            })
                          }
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-[12px] font-bold text-[#0f172a] block">
                            Kurumsal Mağaza Doğrulandı Rozeti (Onaylı Mağaza)
                          </span>
                          <span className="text-[10.5px] text-[#64748b]">
                            İlan kartlarında ve mağaza profilinde mavi onay rozeti gösterilir.
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="col-span-full">
                      <label className="block text-[#475569] font-bold mb-1">
                        Temsilci & Admin Dahili Notları (Müşteri Göremez)
                      </label>
                      <textarea
                        rows={2}
                        value={editingUser.notes || ''}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            notes: e.target.value
                          })
                        }
                        placeholder="Müşteri geçmişi, özel anlaşmalar veya moderasyon notları ekleyin..."
                        className="w-full p-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-indigo-600 text-[11.5px]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. DETAYLI YETKİLENDİRME & İZİN MATRİSİ (RBAC) */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e2e8f0] gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-amber-50 border border-amber-200 text-[#ea580c] flex items-center justify-center">
                        <Key size={18} />
                      </div>
                      <div>
                        <h2 className="text-[13.5px] font-bold text-[#0f172a] flex items-center gap-2">
                          <span>Detaylı Yetkilendirme & İzin Matrisi (Granular RBAC Permissions)</span>
                        </h2>
                        <p className="text-[11px] text-[#64748b]">
                          Kullanıcının admin panelinde ve sistem modüllerinde yapabileceği işlemleri bağımsız olarak yetkilendirin.
                        </p>
                      </div>
                    </div>

                    {/* Stats & Badge */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded bg-slate-100 text-[#0f172a] border border-slate-300">
                        {(editingUser.permissions || []).length} / {ALL_PERMISSION_IDS.length} Yetki Tanımlı
                      </span>
                      {editingUser.role === 'admin' && (
                        <span className="text-[10.5px] font-bold text-indigo-800 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 flex items-center gap-1">
                          <ShieldCheck size={12} className="text-indigo-600" />
                          <span>Süper Admin (Root)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* HIZLI ROL ŞABLONLARI (PRESETS) */}
                  <div className="bg-[#f8fafc] p-3 rounded border border-[#e2e8f0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders size={13} className="text-[#0284c7]" />
                        <span>Hızlı Rol ve Yetki Paketleri (Tek Tıkla Uygula):</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleSelectAllPermissions}
                          className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors"
                        >
                          Tümünü Seç
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllPermissions}
                          className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors"
                        >
                          Sıfırla
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {ROLE_PRESETS.map((preset) => {
                        const isActive =
                          editingUser.role === preset.role &&
                          preset.permissions.length > 0 &&
                          preset.permissions.length === (editingUser.permissions || []).length &&
                          preset.permissions.every((p) => (editingUser.permissions || []).includes(p));

                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className={`p-2 rounded text-left border transition-all flex flex-col justify-between ${
                              isActive
                                ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[11px] font-bold truncate ${isActive ? 'text-white' : 'text-[#0f172a]'}`}>
                                {preset.name}
                              </span>
                              {preset.role === 'admin' ? (
                                <ShieldCheck size={13} className={isActive ? 'text-indigo-400' : 'text-indigo-600'} />
                              ) : preset.role === 'support' ? (
                                <Wrench size={13} className={isActive ? 'text-emerald-400' : 'text-emerald-600'} />
                              ) : (
                                <Users size={13} className="text-slate-400" />
                              )}
                            </div>
                            <span className={`text-[9.5px] leading-tight line-clamp-2 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                              {preset.description}
                            </span>
                            <div className="mt-1.5 pt-1 border-t border-slate-200/40 text-[9px] font-mono text-right">
                              {preset.permissions.length} Yetki
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* KATEGORİ BAZLI İZİN MATRİSİ */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-1">
                    {PERMISSION_CATEGORIES.map((cat) => {
                      const activeCount = cat.permissions.filter((p) =>
                        (editingUser.permissions || []).includes(p.id)
                      ).length;
                      const isAllSelected = activeCount === cat.permissions.length;

                      return (
                        <div
                          key={cat.id}
                          className="border border-[#cbd5e1] rounded-[4px] bg-[#fafbfc] overflow-hidden flex flex-col"
                        >
                          {/* Category Header */}
                          <div className="p-2.5 bg-white border-b border-[#e2e8f0] flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[12px] text-[#0f172a]">
                                  {cat.title}
                                </span>
                                <span
                                  className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                    activeCount > 0
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  {activeCount} / {cat.permissions.length} Aktif
                                </span>
                              </div>
                              <p className="text-[10px] text-[#64748b] mt-0.5">
                                {cat.description}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleCategoryPermissions(cat.permissions)}
                              className="text-[10.5px] font-bold text-[#0284c7] hover:underline whitespace-nowrap ml-2 px-2 py-1 rounded hover:bg-sky-50 transition-colors"
                            >
                              {isAllSelected ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                            </button>
                          </div>

                          {/* Permissions List */}
                          <div className="p-2 space-y-1.5 flex-1">
                            {cat.permissions.map((perm) => {
                              const isChecked = (editingUser.permissions || []).includes(perm.id);

                              return (
                                <div
                                  key={perm.id}
                                  onClick={() => handleTogglePermission(perm.id)}
                                  className={`p-2 rounded cursor-pointer transition-all flex items-start gap-2.5 select-none border ${
                                    isChecked
                                      ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                                      : 'bg-white hover:bg-slate-50 border-slate-200'
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {isChecked ? (
                                      <CheckSquare size={16} className="text-[#0284c7]" />
                                    ) : (
                                      <Square size={16} className="text-slate-300" />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className={`text-[11.5px] font-bold ${isChecked ? 'text-[#0f172a]' : 'text-slate-700'}`}>
                                        {perm.label}
                                      </span>
                                      <code className="text-[9px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1 py-0.2 rounded shrink-0">
                                        {perm.id}
                                      </code>
                                    </div>
                                    <p className="text-[10.5px] text-[#64748b] leading-tight mt-0.5">
                                      {perm.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. MÜŞTERİ & İLETİŞİM BİLGİLERİ */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                  <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#e2e8f0]">
                    <Users size={16} className="text-[#0284c7]" />
                    <h2 className="text-[13px] font-bold text-[#0f172a]">
                      Müşteri & İletişim Bilgileri
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-[12px]">
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Ad Soyad</label>
                      <input
                        type="text"
                        value={editingUser.displayName || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, displayName: e.target.value })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">E-Posta Adresi</label>
                      <input
                        type="email"
                        value={editingUser.email || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, email: e.target.value })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-[#0284c7] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Telefon Numarası</label>
                      <input
                        type="text"
                        value={editingUser.phoneNumber || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, phoneNumber: e.target.value })
                        }
                        placeholder="05xxxxxxxxx"
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-[#0284c7] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Kullanıcı UID (Benzersiz)</label>
                      <input
                        type="text"
                        readOnly
                        value={editingUser.uid}
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-slate-100 text-[#64748b] font-mono text-[11px] cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. ŞİRKET & VERGİ BİLGİLERİ */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                  <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#e2e8f0]">
                    <Building2 size={16} className="text-[#f97316]" />
                    <h2 className="text-[13px] font-bold text-[#0f172a]">
                      Kurumsal Şirket & Fatura Bilgileri
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
                    <div className="sm:col-span-2">
                      <label className="block text-[#475569] font-bold mb-1">Şirket / Mağaza Adı</label>
                      <input
                        type="text"
                        value={editingUser.companyName || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, companyName: e.target.value })
                        }
                        placeholder="Örn: Anadolu Makina San. Tic."
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-[#f97316]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[#475569] font-bold mb-1">Resmi Ticari Ünvan</label>
                      <input
                        type="text"
                        value={editingUser.legalTitle || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, legalTitle: e.target.value })
                        }
                        placeholder="Örn: Anadolu Makina Sanayi ve Ticaret Limited Şirketi"
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-[#f97316]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Vergi Dairesi</label>
                      <input
                        type="text"
                        value={editingUser.taxOffice || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, taxOffice: e.target.value })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-[#f97316]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Vergi Kimlik No / TCKN</label>
                      <input
                        type="text"
                        value={editingUser.taxNumber || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, taxNumber: e.target.value })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-[#f97316] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. ADRES & KONUM */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                  <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#e2e8f0]">
                    <MapPin size={16} className="text-emerald-600" />
                    <h2 className="text-[13px] font-bold text-[#0f172a]">
                      Adres ve Lokasyon Bilgileri
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-[12px]">
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">İl (Şehir)</label>
                      <input
                        type="text"
                        value={editingUser.city || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, city: e.target.value })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">İlçe</label>
                      <input
                        type="text"
                        value={editingUser.district || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, district: e.target.value })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="block text-[#475569] font-bold mb-1">Açık Adres</label>
                      <textarea
                        rows={2}
                        value={editingUser.address || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, address: e.target.value })
                        }
                        className="w-full p-2 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-emerald-600 text-[11.5px]"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. BANKA & IBAN KAYITLARI */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                  <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#e2e8f0]">
                    <DollarSign size={16} className="text-teal-600" />
                    <h2 className="text-[13px] font-bold text-[#0f172a]">
                      Finans & Banka Hesap Kayıtları (Makinam Güvende Havuz Blokesi)
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Banka Adı</label>
                      <input
                        type="text"
                        value={editingUser.bankName || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, bankName: e.target.value })
                        }
                        placeholder="Örn: Garanti BBVA"
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Hesap Sahibi Adı</label>
                      <input
                        type="text"
                        value={editingUser.accountHolder || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, accountHolder: e.target.value })
                        }
                        placeholder="Hesap Sahibi Adı Soyadı veya Ünvanı"
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">IBAN Numarası</label>
                      <input
                        type="text"
                        value={editingUser.iban || ''}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, iban: e.target.value })
                        }
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-teal-600 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. BU KULLANICIYA AİT İLANLAR */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-[#0f172a]" />
                      <h2 className="text-[13px] font-bold text-[#0f172a]">
                        Bu Kullanıcıya Ait Yayındaki İlanlar
                      </h2>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      {listings.filter((l) => l.userId === editingUser.uid || l.seller?.phone === editingUser.phoneNumber).length} İlan Bulundu
                    </span>
                  </div>

                  <div className="space-y-2">
                    {listings
                      .filter((l) => l.userId === editingUser.uid || l.seller?.phone === editingUser.phoneNumber)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded text-[11.5px]"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.images?.[0] || DEFAULT_MACHINE_IMAGE}
                              alt={item.title}
                              className="w-10 h-8 object-cover rounded border border-[#cbd5e1]"
                            />
                            <div>
                              <span className="font-bold text-[#0f172a] block">{item.title}</span>
                              <span className="text-[10.5px] text-[#64748b]">
                                İlan No: <strong className="font-mono text-[#0284c7]">{item.adNo || item.id}</strong> • {item.price.toLocaleString('tr-TR')} {item.currency}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingListing(item);
                                setEditingUser(null);
                                setActiveTab('listings');
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1"
                            >
                              <Edit size={12} />
                              <span>İlanı Düzenle</span>
                            </button>
                            <Link
                              to={`/ilan/${item.id}`}
                              target="_blank"
                              className="p-1 text-slate-500 hover:text-slate-800"
                            >
                              <ExternalLink size={13} />
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-[12px] font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-2 text-[12px] font-bold text-white bg-[#0f172a] hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Save size={15} />
                    <span>{isProcessing ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : editingListing ? (
            /* ========================================================
               SUB-VIEW: DEDICATED LISTING DETAIL & EDIT SCREEN
            ======================================================== */
            <div className="space-y-4">
              {/* Header / Breadcrumb */}
              <div className="flex items-center justify-between bg-white border border-[#cbd5e1] p-3 rounded-[4px] shadow-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingListing(null)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                    title="İlan Listesine Geri Dön"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <div className="text-[10.5px] text-[#64748b] uppercase tracking-wider font-semibold">
                      İlan Yönetimi / Detaylı İlan & Fiyat Düzenleyici
                    </div>
                    <h1 className="text-[16px] font-black text-[#0f172a] flex items-center gap-2">
                      <span>{editingListing.title}</span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        İlan No: {editingListing.adNo || editingListing.id}
                      </span>
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/ilan/${editingListing.id}`}
                    target="_blank"
                    className="px-3 py-1.5 text-[11.5px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded hover:bg-sky-100 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink size={13} />
                    <span>Canlı İlanda Gör</span>
                  </Link>
                  <button
                    onClick={() => setEditingListing(null)}
                    className="px-3 py-1.5 text-[11.5px] font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => handleDeleteListing(editingListing)}
                    className="px-3 py-1.5 text-[11.5px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                    <span>İlanı Sil</span>
                  </button>
                  <button
                    onClick={handleSaveListingDetails}
                    disabled={isProcessing}
                    className="px-4 py-1.5 text-[11.5px] font-bold text-white bg-[#0f172a] hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Save size={14} />
                    <span>{isProcessing ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                  </button>
                </div>
              </div>

              {/* Form Panels */}
              <form onSubmit={handleSaveListingDetails} className="space-y-4">
                {/* 1. MODERASYON, DURUM VE ROZETLER */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                  <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#e2e8f0]">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    <h2 className="text-[13px] font-bold text-[#0f172a]">
                      İlan Durumu, Vitrin ve Moderasyon Rozetleri
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">
                        Yayınlanma Durumu
                      </label>
                      <select
                        value={editingListing.status || 'active'}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            status: e.target.value as 'active' | 'passive' | 'sold'
                          })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-white text-[#0f172a] font-semibold focus:outline-none focus:border-indigo-600"
                      >
                        <option value="active">Aktif (Yayında)</option>
                        <option value="passive">Pasif (Gizlendi)</option>
                        <option value="sold">Satıldı (Arşiv)</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!editingListing.isVitrin}
                          onChange={(e) =>
                            setEditingListing({ ...editingListing, isVitrin: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-[12px] font-bold text-[#0f172a] flex items-center gap-1">
                            <Star size={13} className={editingListing.isVitrin ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} />
                            <span>Ana Sayfa Vitrini</span>
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!editingListing.isUrgent}
                          onChange={(e) =>
                            setEditingListing({ ...editingListing, isUrgent: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-rose-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-[12px] font-bold text-[#0f172a] flex items-center gap-1">
                            <Clock size={13} className={editingListing.isUrgent ? 'text-rose-600' : 'text-slate-400'} />
                            <span>Acil Satılık Rozeti</span>
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!editingListing.isGuvende}
                          onChange={(e) =>
                            setEditingListing({ ...editingListing, isGuvende: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-[12px] font-bold text-[#0f172a] flex items-center gap-1">
                            <ShieldCheck size={13} className={editingListing.isGuvende ? 'text-emerald-600' : 'text-slate-400'} />
                            <span>Makinam Güvende</span>
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 2. TEMEL BİLGİLER & FİYAT */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                  <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#e2e8f0]">
                    <FileText size={16} className="text-[#0284c7]" />
                    <h2 className="text-[13px] font-bold text-[#0f172a]">
                      Temel İlan Bilgileri & Fiyatlandırma
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-[12px]">
                    <div className="sm:col-span-2 md:col-span-2">
                      <label className="block text-[#475569] font-bold mb-1">İlan Başlığı</label>
                      <input
                        type="text"
                        value={editingListing.title}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, title: e.target.value })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-[#0284c7] font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Satış Fiyatı</label>
                      <input
                        type="number"
                        min="0"
                        value={editingListing.price}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            price: parseFloat(e.target.value) || 0
                          })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-[#0284c7] font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Para Birimi</label>
                      <select
                        value={editingListing.currency}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            currency: e.target.value as 'TL' | 'EUR' | 'USD'
                          })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-white font-bold"
                      >
                        <option value="TL">TL (Türk Lirası)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>

                    <div className="col-span-full">
                      <label className="block text-[#475569] font-bold mb-1">Detaylı İlan Açıklaması</label>
                      <textarea
                        rows={4}
                        value={editingListing.description || ''}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, description: e.target.value })
                        }
                        className="w-full p-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] focus:outline-none focus:border-[#0284c7] text-[12px] leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. KATEGORİ & TEKNİK ÖZELLİKLER */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                  <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#e2e8f0]">
                    <Tag size={16} className="text-[#f97316]" />
                    <h2 className="text-[13px] font-bold text-[#0f172a]">
                      Kategori & Teknik Özellikler
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Ana Kategori Slug</label>
                      <input
                        type="text"
                        value={editingListing.category}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, category: e.target.value })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Alt Kategori Slug</label>
                      <input
                        type="text"
                        value={editingListing.subCategory}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, subCategory: e.target.value })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Marka</label>
                      <input
                        type="text"
                        value={editingListing.brand}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, brand: e.target.value })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Model</label>
                      <input
                        type="text"
                        value={editingListing.model}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, model: e.target.value })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Üretim Yılı</label>
                      <input
                        type="number"
                        value={editingListing.year}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, year: parseInt(e.target.value, 10) || 2020 })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Çalışma Saati (Saat)</label>
                      <input
                        type="number"
                        value={editingListing.hours}
                        onChange={(e) =>
                          setEditingListing({ ...editingListing, hours: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. SATICI & LOKASYON BİLGİLERİ */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                  <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#e2e8f0]">
                    <Users size={16} className="text-emerald-600" />
                    <h2 className="text-[13px] font-bold text-[#0f172a]">
                      Satıcı & İletişim Bilgileri
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Satıcı Adı / Yetkili</label>
                      <input
                        type="text"
                        value={editingListing.seller?.name || ''}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            seller: { ...editingListing.seller, name: e.target.value }
                          })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">İletişim Telefonu</label>
                      <input
                        type="text"
                        value={editingListing.seller?.phone || ''}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            seller: { ...editingListing.seller, phone: e.target.value }
                          })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-[#fafbfc] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Satıcı Türü</label>
                      <select
                        value={editingListing.seller?.type || 'Sahibinden'}
                        onChange={(e) =>
                          setEditingListing({
                            ...editingListing,
                            seller: { ...editingListing.seller, type: e.target.value as any }
                          })
                        }
                        className="w-full h-[34px] px-2.5 border border-[#cbd5e1] rounded bg-white"
                      >
                        <option value="Sahibinden">Sahibinden</option>
                        <option value="Galeriden">Galeriden / Mağazadan</option>
                        <option value="Yetkili Bayi">Yetkili Bayi</option>
                        <option value="Üreticiden">Üreticiden</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#475569] font-bold mb-1">Şehir & İlçe</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingListing.city}
                          onChange={(e) =>
                            setEditingListing({ ...editingListing, city: e.target.value })
                          }
                          placeholder="İl"
                          className="w-1/2 h-[34px] px-2 border border-[#cbd5e1] rounded bg-[#fafbfc]"
                        />
                        <input
                          type="text"
                          value={editingListing.district}
                          onChange={(e) =>
                            setEditingListing({ ...editingListing, district: e.target.value })
                          }
                          placeholder="İlçe"
                          className="w-1/2 h-[34px] px-2 border border-[#cbd5e1] rounded bg-[#fafbfc]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. FOTOĞRAF GALERİSİ */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} className="text-purple-600" />
                      <h2 className="text-[13px] font-bold text-[#0f172a]">
                        İlan Fotoğrafları ({editingListing.images?.length || 0} Adet)
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {editingListing.images?.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative group border border-slate-200 rounded overflow-hidden bg-slate-50 aspect-4/3"
                      >
                        <img
                          src={imgUrl}
                          alt={`İlan ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 bg-[#0f172a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                            Kapak Fotoğrafı
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...editingListing.images];
                                const [selected] = newImages.splice(index, 1);
                                newImages.unshift(selected);
                                setEditingListing({ ...editingListing, images: newImages });
                              }}
                              className="p-1 bg-white text-slate-800 rounded hover:bg-slate-100 text-[10px] font-bold"
                              title="Kapak Yap"
                            >
                              Kapak Yap
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = editingListing.images.filter((_, i) => i !== index);
                              setEditingListing({ ...editingListing, images: newImages });
                            }}
                            className="p-1 bg-rose-600 text-white rounded hover:bg-rose-700"
                            title="Fotoğrafı Kaldır"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingListing(null)}
                    className="px-4 py-2 text-[12px] font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-2 text-[12px] font-bold text-white bg-[#0f172a] hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Save size={15} />
                    <span>{isProcessing ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* ========================================================
                  TAB 1: DASHBOARD (GENEL BAKIŞ)
              ======================================================== */}
              {activeTab === 'dashboard' && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-[18px] font-black text-[#0f172a]">Yönetim Konsolu</h1>
                    <p className="text-[12px] text-[#64748b]">
                      Makinam.com kurumsal operasyon, mağaza onayları ve moderasyon merkezi.
                    </p>
                  </div>

                  {/* KPI CARDS */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-[4px] border border-[#cbd5e1] shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#64748b] uppercase">Bekleyen Başvurular</span>
                        <Building2 size={16} className="text-[#f97316]" />
                      </div>
                      <div className="text-[22px] font-black text-[#0f172a] mt-1 font-mono">
                        {pendingAppsCount}
                      </div>
                      <div className="text-[10px] text-[#64748b] mt-1">İnceleme bekleyen kurumsal mağaza</div>
                    </div>

                    <div className="bg-white p-3.5 rounded-[4px] border border-[#cbd5e1] shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#64748b] uppercase">Aktif Makine İlanı</span>
                        <Layers size={16} className="text-[#0284c7]" />
                      </div>
                      <div className="text-[22px] font-black text-[#0f172a] mt-1 font-mono">
                        {activeListingsCount}
                      </div>
                      <div className="text-[10px] text-[#64748b] mt-1">Veritabanında canlı yayında</div>
                    </div>

                    <div className="bg-white p-3.5 rounded-[4px] border border-[#cbd5e1] shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#64748b] uppercase">Kurumsal Mağazalar</span>
                        <BadgeCheck size={16} className="text-emerald-600" />
                      </div>
                      <div className="text-[22px] font-black text-[#0f172a] mt-1 font-mono">
                        {corporateUsersCount}
                      </div>
                      <div className="text-[10px] text-[#64748b] mt-1">Onaylı kurumsal satıcı üye</div>
                    </div>

                    <div className="bg-white p-3.5 rounded-[4px] border border-[#cbd5e1] shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#64748b] uppercase">Vitrin İlanları</span>
                        <Star size={16} className="text-amber-500 fill-amber-500" />
                      </div>
                      <div className="text-[22px] font-black text-[#0f172a] mt-1 font-mono">
                        {vitrinListingsCount}
                      </div>
                      <div className="text-[10px] text-[#64748b] mt-1">Ana sayfa vitrininde öne çıkan</div>
                    </div>
                  </div>

                  {/* QUICK ACCESS TABLES */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Recent Store Applications */}
                    <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-3.5 shadow-xs">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e8f0]">
                        <h2 className="text-[13px] font-bold text-[#0f172a] flex items-center gap-1.5">
                          <Building2 size={15} className="text-[#f97316]" />
                          <span>Son Kurumsal Mağaza Başvuruları</span>
                        </h2>
                        <button
                          onClick={() => setActiveTab('applications')}
                          className="text-[11px] text-[#0284c7] font-semibold hover:underline"
                        >
                          Tümünü Gör
                        </button>
                      </div>

                      {applications.slice(0, 4).length > 0 ? (
                        <div className="divide-y divide-[#f1f5f9]">
                          {applications.slice(0, 4).map((app) => (
                            <div key={app.id} className="py-2 flex items-center justify-between text-[11.5px]">
                              <div>
                                <span className="font-bold text-[#0f172a] block">{app.companyName}</span>
                                <span className="text-[10px] text-[#64748b]">
                                  {app.contactName} • {app.city} • Başvuru: {app.applicationNo}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                                    app.status === 'pending'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : app.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}
                                >
                                  {app.status === 'pending'
                                    ? 'Onay Bekliyor'
                                    : app.status === 'approved'
                                    ? 'Onaylandı'
                                    : 'Reddedildi'}
                                </span>
                                <button
                                  onClick={() => setSelectedApp(app)}
                                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-0.5 bg-slate-100 rounded"
                                >
                                  İncele
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-[#94a3b8] text-[11px]">
                          Henüz kurumsal başvuru bulunmuyor.
                        </div>
                      )}
                    </div>

                    {/* Recent Listings */}
                    <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-3.5 shadow-xs">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e8f0]">
                        <h2 className="text-[13px] font-bold text-[#0f172a] flex items-center gap-1.5">
                          <Layers size={15} className="text-[#0284c7]" />
                          <span>Son Yayına Giren İlanlar</span>
                        </h2>
                        <button
                          onClick={() => setActiveTab('listings')}
                          className="text-[11px] text-[#0284c7] font-semibold hover:underline"
                        >
                          Tümünü Gör
                        </button>
                      </div>

                      {listings.slice(0, 4).length > 0 ? (
                        <div className="divide-y divide-[#f1f5f9]">
                          {listings.slice(0, 4).map((item) => (
                            <div key={item.id} className="py-2 flex items-center justify-between text-[11.5px]">
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.images?.[0] || DEFAULT_MACHINE_IMAGE}
                                  alt={item.title}
                                  className="w-8 h-6 object-cover rounded border border-[#cbd5e1]"
                                />
                                <div>
                                  <span className="font-bold text-[#0f172a] block truncate max-w-[200px]">
                                    {item.title}
                                  </span>
                                  <span className="text-[10px] text-[#64748b]">
                                    {item.brand} • {item.price.toLocaleString('tr-TR')} {item.currency}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setEditingListing(item)}
                                  className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 px-2 py-0.5 bg-slate-100 rounded"
                                >
                                  Düzenle
                                </button>
                                <Link
                                  to={`/ilan/${item.id}`}
                                  target="_blank"
                                  className="p-1 text-slate-500 hover:text-slate-800"
                                >
                                  <ExternalLink size={13} />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-[#94a3b8] text-[11px]">
                          Henüz ilan bulunmuyor.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AUDIT LOG: RECENT OPERATIONAL ACTIONS */}
                  <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-3.5 shadow-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e8f0]">
                      <h2 className="text-[13px] font-bold text-[#0f172a] flex items-center gap-1.5">
                        <Activity size={15} className="text-[#ea580c]" />
                        <span>Son Temsilci & Moderasyon İşlem Günlüğü</span>
                      </h2>
                      <span className="text-[10px] text-[#64748b] bg-slate-100 px-2 py-0.5 rounded font-mono">
                        Canlı Takip ({auditLogs.length})
                      </span>
                    </div>

                    {auditLogs.length > 0 ? (
                      <div className="divide-y divide-[#f1f5f9]">
                        {auditLogs.map((log) => (
                          <div key={log.id} className="py-2 flex items-center justify-between text-[11.5px]">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                                log.action.includes('DELETE') ? 'bg-red-100 text-red-700' :
                                log.action.includes('CREATE') || log.action.includes('APPROVE') ? 'bg-emerald-100 text-emerald-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {log.action.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[#1e293b] font-medium truncate">
                                {log.description}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-3 text-[10.5px] text-[#64748b]">
                              <span className="font-semibold text-slate-700">{log.performedBy}</span>
                              <span>{log.createdAtIso ? new Date(log.createdAtIso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-[#94a3b8] text-[11px]">
                        Henüz kayıtlı operasyon günlüğü bulunmuyor.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 2: STORE APPLICATIONS (MAĞAZA BAŞVURULARI)
              ======================================================== */}
              {activeTab === 'applications' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-[18px] font-black text-[#0f172a]">Kurumsal Mağaza Başvuruları</h1>
                      <p className="text-[12px] text-[#64748b]">
                        Kurumsal mağaza açılış taleplerini inceleyin, onaylayarak kullanıcı hesabını otomatik oluşturun.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleExportApplicationsCSV}
                        className="px-3 py-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-slate-700 rounded text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                        title="Tüm başvuruları CSV formatında indir"
                      >
                        <Download size={13} className="text-[#0284c7]" />
                        <span>CSV / Excel</span>
                      </button>

                      <div className="flex items-center gap-1.5 bg-white p-1 rounded border border-[#cbd5e1] text-[11px] font-semibold">
                      {(['all', 'pending', 'approved', 'rejected'] as const).map((filterKey) => (
                        <button
                          key={filterKey}
                          onClick={() => setAppFilter(filterKey)}
                          className={`px-2.5 py-1 rounded transition-colors ${
                            appFilter === filterKey
                              ? 'bg-[#0f172a] text-white'
                              : 'text-[#475569] hover:bg-[#f1f5f9]'
                          }`}
                        >
                          {filterKey === 'all'
                            ? 'Tümü'
                            : filterKey === 'pending'
                            ? `Onay Bekleyen (${pendingAppsCount})`
                            : filterKey === 'approved'
                            ? 'Onaylananlar'
                            : 'Reddedilenler'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                  {/* SEARCH */}
                  <div className="bg-white p-2.5 rounded-[3px] border border-[#cbd5e1] flex items-center gap-2 shadow-xs">
                    <Search size={15} className="text-[#94a3b8]" />
                    <input
                      type="text"
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      placeholder="Şirket adı, başvuru no, yetkili adı, telefon veya e-posta ile ara..."
                      className="w-full text-[12px] focus:outline-none bg-transparent"
                    />
                    {appSearch && (
                      <button onClick={() => setAppSearch('')} className="text-[#94a3b8] hover:text-[#0f172a]">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* TABLE */}
                  <div className="bg-white border border-[#cbd5e1] rounded-[4px] shadow-xs overflow-hidden">
                    {filteredApplications.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11.5px] border-collapse">
                          <thead>
                            <tr className="bg-[#f8fafc] text-[#64748b] border-b border-[#cbd5e1] font-bold">
                              <th className="py-2.5 px-3">Başvuru No & Tarih</th>
                              <th className="py-2.5 px-3">Şirket / Mağaza Ünvanı</th>
                              <th className="py-2.5 px-3">Yetkili & İletişim</th>
                              <th className="py-2.5 px-3">Vergi Dairesi / No</th>
                              <th className="py-2.5 px-3">Konum</th>
                              <th className="py-2.5 px-3">Durum</th>
                              <th className="py-2.5 px-3 text-right">İşlem</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f1f5f9]">
                            {filteredApplications.map((app) => (
                              <tr key={app.id} className="hover:bg-[#f8fafc] transition-colors">
                                <td className="py-2.5 px-3">
                                  <div className="font-mono font-bold text-[#0284c7]">{app.applicationNo}</div>
                                  <div className="text-[10px] text-[#94a3b8]">
                                    {app.createdAt ? new Date(app.createdAt.seconds ? app.createdAt.seconds * 1000 : app.createdAt).toLocaleDateString('tr-TR') : 'Bugün'}
                                  </div>
                                </td>

                                <td className="py-2.5 px-3">
                                  <div className="font-bold text-[#0f172a]">{app.companyName}</div>
                                  <div className="text-[10px] text-[#64748b]">{app.legalTitle}</div>
                                </td>

                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-[#0f172a]">{app.contactName}</div>
                                  <div className="text-[10px] text-[#64748b]">{app.phone} • {app.email}</div>
                                </td>

                                <td className="py-2.5 px-3 font-mono text-[11px]">
                                  {app.taxOffice} / {app.taxNumber}
                                </td>

                                <td className="py-2.5 px-3">
                                  {app.city} / {app.district}
                                </td>

                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      app.status === 'pending'
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : app.status === 'approved'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-rose-50 text-rose-800 border-rose-200'
                                    }`}
                                  >
                                    {app.status === 'pending'
                                      ? 'Onay Bekliyor'
                                      : app.status === 'approved'
                                      ? 'Onaylandı'
                                      : 'Reddedildi'}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => setSelectedApp(app)}
                                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                                    >
                                      İncele
                                    </button>
                                    <button
                                      onClick={() => handleDeleteApplication(app.id!)}
                                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                      title="Başvuru Kaydını Sil"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-[12px] text-[#94a3b8]">
                        Filtreye uygun kurumsal mağaza başvurusu bulunamadı.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 3: LISTINGS MANAGEMENT (İLAN YÖNETİMİ TABLO)
              ======================================================== */}
              {activeTab === 'listings' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-[18px] font-black text-[#0f172a]">İlan Yönetimi & Moderasyon</h1>
                      <p className="text-[12px] text-[#64748b]">
                        Yayındaki makine ilanlarını denetleyin, vitrin / acil rozetlerini yönetin veya detaylarını güncelleyin.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleExportListingsCSV}
                        className="px-3 py-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-slate-700 rounded text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                        title="Tüm ilanları CSV formatında indir"
                      >
                        <Download size={13} className="text-[#0284c7]" />
                        <span>CSV / Excel</span>
                      </button>

                      <div className="flex items-center gap-1.5 bg-white p-1 rounded border border-[#cbd5e1] text-[11px] font-semibold">
                      {(['all', 'active', 'passive', 'sold'] as const).map((statusKey) => (
                        <button
                          key={statusKey}
                          onClick={() => setListingStatusFilter(statusKey)}
                          className={`px-2.5 py-1 rounded transition-colors ${
                            listingStatusFilter === statusKey
                              ? 'bg-[#0f172a] text-white'
                              : 'text-[#475569] hover:bg-[#f1f5f9]'
                          }`}
                        >
                          {statusKey === 'all'
                            ? `Tümü (${listings.length})`
                            : statusKey === 'active'
                            ? 'Aktif'
                            : statusKey === 'passive'
                            ? 'Pasif'
                            : 'Satıldı'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SEARCH & QUICK FILTERS */}
                <div className="bg-white p-2.5 rounded-[3px] border border-[#cbd5e1] flex flex-wrap items-center gap-2 shadow-xs">
                  <div className="flex-1 min-w-[220px] flex items-center gap-2">
                    <Search size={15} className="text-[#94a3b8]" />
                    <input
                      type="text"
                      value={listingSearch}
                      onChange={(e) => setListingSearch(e.target.value)}
                      placeholder="İlan başlığı, ilan no, marka, model veya şehir ara..."
                      className="w-full text-[12px] focus:outline-none bg-transparent"
                    />
                    {listingSearch && (
                      <button onClick={() => setListingSearch('')} className="text-[#94a3b8] hover:text-[#0f172a]">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <select
                    value={listingCategoryFilter}
                    onChange={(e) => setListingCategoryFilter(e.target.value)}
                    className="h-[32px] px-2 bg-slate-50 border border-[#cbd5e1] rounded text-[11px] font-semibold text-[#475569]"
                  >
                    <option value="all">Tüm Kategoriler</option>
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Flag Filter */}
                  <select
                    value={listingFlagFilter}
                    onChange={(e) => setListingFlagFilter(e.target.value)}
                    className="h-[32px] px-2 bg-slate-50 border border-[#cbd5e1] rounded text-[11px] font-semibold text-[#475569]"
                  >
                    <option value="all">Tüm Rozetler</option>
                    <option value="vitrin">Vitrin İlanları</option>
                    <option value="guvende">Makinam Güvende</option>
                    <option value="urgent">Acil İlanlar</option>
                  </select>

                  {(listingCategoryFilter !== 'all' || listingFlagFilter !== 'all' || listingSearch) && (
                    <button
                      onClick={() => {
                        setListingSearch('');
                        setListingCategoryFilter('all');
                        setListingFlagFilter('all');
                      }}
                      className="text-[11px] text-[#ea580c] font-bold hover:underline px-1"
                    >
                      Filtreleri Sıfırla
                    </button>
                  )}
                </div>

                {/* BULK ACTIONS TOOLBAR */}
                {selectedListingIds.length > 0 && (
                  <div className="bg-[#0f172a] text-white p-2.5 rounded-[4px] flex flex-wrap items-center justify-between gap-2 shadow-md animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-[12px] font-bold">
                      <CheckCheck size={16} className="text-[#38bdf8]" />
                      <span>{selectedListingIds.length} ilan seçildi</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <button
                        onClick={() => handleBulkToggleFlag('isVitrin', true)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded flex items-center gap-1 transition-colors"
                      >
                        <Star size={12} /> Vitrin Yap
                      </button>
                      <button
                        onClick={() => handleBulkToggleFlag('isGuvende', true)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1 transition-colors"
                      >
                        <ShieldCheck size={12} /> Güvende Yap
                      </button>
                      <button
                        onClick={() => handleBulkChangeStatus('active')}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                      >
                        Aktif
                      </button>
                      <button
                        onClick={() => handleBulkChangeStatus('passive')}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                      >
                        Pasif
                      </button>
                      <button
                        onClick={() => handleBulkChangeStatus('sold')}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                      >
                        Satıldı
                      </button>
                      <button
                        onClick={handleBulkDeleteListings}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={12} /> Sil
                      </button>
                      <button
                        onClick={() => setSelectedListingIds([])}
                        className="px-2 py-1 text-slate-400 hover:text-white transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* TABLE */}
                <div className="bg-white border border-[#cbd5e1] rounded-[4px] shadow-xs overflow-hidden">
                  {filteredListings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11.5px] border-collapse">
                        <thead>
                          <tr className="bg-[#f8fafc] text-[#64748b] border-b border-[#cbd5e1] font-bold">
                            <th className="py-2.5 px-3 w-8">
                              <input
                                type="checkbox"
                                checked={selectedListingIds.length > 0 && selectedListingIds.length === filteredListings.length}
                                onChange={handleSelectAllListings}
                                className="rounded cursor-pointer"
                                title="Tümünü Seç / Kaldır"
                              />
                            </th>
                            <th className="py-2.5 px-3">Görsel / İlan No</th>
                            <th className="py-2.5 px-3">İlan Başlığı & Detay</th>
                            <th className="py-2.5 px-3">Fiyat</th>
                            <th className="py-2.5 px-3">Satıcı</th>
                            <th className="py-2.5 px-3">Rozetler</th>
                            <th className="py-2.5 px-3">Durum</th>
                            <th className="py-2.5 px-3 text-right">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f1f5f9]">
                          {filteredListings.map((item) => {
                            const thumb = item.images?.[0] || DEFAULT_MACHINE_IMAGE;
                            const status = item.status || 'active';
                            const isSelected = selectedListingIds.includes(item.id);
                            return (
                              <tr key={item.id} className={`hover:bg-[#f8fafc] transition-colors ${isSelected ? 'bg-sky-50/60' : ''}`}>
                                <td className="py-2.5 px-3 w-8" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectListing(item.id)}
                                    className="rounded cursor-pointer"
                                  />
                                </td>
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2">
                                      <img
                                        src={thumb}
                                        alt={item.title}
                                        className="w-12 h-9 object-cover rounded-[2px] border border-[#cbd5e1]"
                                      />
                                      <div>
                                        <div className="font-mono text-[10.5px] font-bold text-[#0284c7]">
                                          {item.adNo || item.id}
                                        </div>
                                        <div className="text-[10px] text-[#94a3b8]">{item.date}</div>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <button
                                      onClick={() => setEditingListing(item)}
                                      className="font-bold text-[#0f172a] hover:text-[#f97316] line-clamp-1 block text-left"
                                    >
                                      {item.title}
                                    </button>
                                    <div className="text-[10px] text-[#64748b]">
                                      {item.brand} • {item.model} • {item.year} • {item.city}
                                    </div>
                                  </td>

                                  <td className="py-2.5 px-3 font-bold text-[#0f172a] font-mono">
                                    {item.price.toLocaleString('tr-TR')} {item.currency}
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <div className="font-semibold">{item.seller?.name}</div>
                                    <div className="text-[10px] text-[#64748b]">{item.seller?.phone}</div>
                                  </td>

                                  {/* Quick Flag Toggles */}
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleToggleListingFlag(item.id, 'isVitrin', !!item.isVitrin)}
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                                          item.isVitrin
                                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                                        }`}
                                        title="Ana Sayfa Vitrini"
                                      >
                                        <Star size={11} className={item.isVitrin ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} />
                                        <span>Vitrin</span>
                                      </button>
                                      <button
                                        onClick={() => handleToggleListingFlag(item.id, 'isUrgent', !!item.isUrgent)}
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                                          item.isUrgent
                                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                                        }`}
                                        title="Acil Satılık Rozeti"
                                      >
                                        <Clock size={11} className={item.isUrgent ? 'text-rose-600' : 'text-slate-400'} />
                                        <span>Acil</span>
                                      </button>
                                      <button
                                        onClick={() => handleToggleListingFlag(item.id, 'isGuvende', !!item.isGuvende)}
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                                          item.isGuvende
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                                        }`}
                                        title="Makinam Güvende Havuz Blokesi"
                                      >
                                        <ShieldCheck size={11} className={item.isGuvende ? 'text-emerald-600' : 'text-slate-400'} />
                                        <span>Güvende</span>
                                      </button>
                                    </div>
                                  </td>

                                  {/* Status Select */}
                                  <td className="py-2.5 px-3">
                                    <select
                                      value={status}
                                      onChange={(e) =>
                                        handleChangeListingStatus(
                                          item.id,
                                          e.target.value as 'active' | 'passive' | 'sold'
                                        )
                                      }
                                      className={`text-[10px] font-bold rounded px-1.5 py-1 border ${
                                        status === 'active'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          : status === 'sold'
                                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                                          : 'bg-slate-50 text-slate-700 border-slate-300'
                                      }`}
                                    >
                                      <option value="active">Aktif</option>
                                      <option value="passive">Pasif</option>
                                      <option value="sold">Satıldı</option>
                                    </select>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-2.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => setEditingListing(item)}
                                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1"
                                        title="Detaylı Düzenle"
                                      >
                                        <Edit size={12} />
                                        <span>Düzenle</span>
                                      </button>
                                      <Link
                                        to={`/ilan/${item.id}`}
                                        target="_blank"
                                        className="p-1 text-[#0284c7] hover:bg-sky-50 rounded"
                                        title="İlanı Görüntüle"
                                      >
                                        <ExternalLink size={13} />
                                      </Link>
                                      <button
                                        onClick={() => handleDeleteListing(item)}
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                                        title="İlanı Sil"
                                      >
                                        <Trash2 size={13} />
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
                      <div className="p-8 text-center text-[12px] text-[#94a3b8]">
                        Arama kriterlerine uygun makine ilanı bulunamadı.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 4: USERS MANAGEMENT (KULLANICI YÖNETİMİ TABLO)
              ======================================================== */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-[18px] font-black text-[#0f172a]">Kullanıcı & Müşteri Yönetimi</h1>
                      <p className="text-[12px] text-[#64748b]">
                        Bireysel ve kurumsal kullanıcıların yetkilerini, müşteri detaylarını ve hesap parametrelerini yönetin.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportUsersCSV}
                        className="px-3 py-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-slate-700 rounded text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                        title="Tüm kullanıcıları CSV formatında indir"
                      >
                        <Download size={13} className="text-[#0284c7]" />
                        <span>CSV / Excel</span>
                      </button>

                      <button
                        onClick={fetchUsers}
                        disabled={isLoadingUsers}
                        className="px-3 py-1.5 bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] text-[11.5px] font-semibold rounded flex items-center gap-1.5"
                      >
                        <RefreshCw size={13} className={isLoadingUsers ? 'animate-spin' : ''} />
                        <span>Listeyi Yenile</span>
                      </button>
                    </div>
                  </div>

                  {/* FILTERS & SEARCH */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 bg-white p-2.5 rounded-[3px] border border-[#cbd5e1] flex items-center gap-2 shadow-xs">
                      <Search size={15} className="text-[#94a3b8]" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="İsim, e-posta, telefon, şirket adı veya UID ara..."
                        className="w-full text-[12px] focus:outline-none bg-transparent"
                      />
                      {userSearch && (
                        <button onClick={() => setUserSearch('')} className="text-[#94a3b8] hover:text-[#0f172a]">
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="h-[38px] px-2.5 bg-white border border-[#cbd5e1] rounded text-[11.5px] font-semibold text-[#475569]"
                      >
                        <option value="all">Tüm Yetkiler</option>
                        <option value="admin">Süper Admin (Root)</option>
                        <option value="support">Temsilci / Destek</option>
                        <option value="has_perms">Özel Yetkisi Olanlar</option>
                        <option value="user">Standart Üyeler</option>
                      </select>

                      <select
                        value={userTypeFilter}
                        onChange={(e) => setUserTypeFilter(e.target.value)}
                        className="h-[38px] px-2.5 bg-white border border-[#cbd5e1] rounded text-[11.5px] font-semibold text-[#475569]"
                      >
                        <option value="all">Tüm Hesap Türleri</option>
                        <option value="kurumsal">Kurumsal Mağaza</option>
                        <option value="bireysel">Bireysel Hesap</option>
                      </select>
                    </div>
                  </div>

                  {/* USERS TABLE */}
                  <div className="bg-white border border-[#cbd5e1] rounded-[4px] shadow-xs overflow-hidden">
                    {filteredUsers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11.5px] border-collapse">
                          <thead>
                            <tr className="bg-[#f8fafc] text-[#64748b] border-b border-[#cbd5e1] font-bold">
                              <th className="py-2.5 px-3">Müşteri Bilgisi</th>
                              <th className="py-2.5 px-3">İletişim</th>
                              <th className="py-2.5 px-3">Hesap Türü</th>
                              <th className="py-2.5 px-3">Yetki Rolü</th>
                              <th className="py-2.5 px-3">Durum</th>
                              <th className="py-2.5 px-3">Finans / IBAN</th>
                              <th className="py-2.5 px-3 text-right">İşlem</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f1f5f9]">
                            {filteredUsers.map((u) => (
                              <tr key={u.uid} className="hover:bg-[#f8fafc] transition-colors">
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded bg-slate-800 text-white flex items-center justify-center text-[10.5px] font-bold shrink-0">
                                      {(u.displayName || u.email || 'K').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-bold text-[#0f172a]">{u.displayName || 'İsimsiz Kullanıcı'}</div>
                                      {u.companyName && (
                                        <div className="text-[10px] text-[#64748b]">
                                          {u.companyName}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="py-2.5 px-3">
                                  <div className="font-mono text-[#0284c7]">{u.email}</div>
                                  <div className="text-[10px] text-[#64748b] font-mono">{u.phoneNumber || '-'}</div>
                                </td>

                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${
                                      u.accountType === 'kurumsal'
                                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {u.accountType === 'kurumsal' ? (
                                      <>
                                        <Building2 size={11} className="text-sky-700" />
                                        <span>Kurumsal</span>
                                      </>
                                    ) : (
                                      <>
                                        <Users size={11} className="text-slate-600" />
                                        <span>Bireysel</span>
                                      </>
                                    )}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3">
                                  <div className="flex flex-col gap-1 items-start">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${
                                        u.role === 'admin'
                                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                          : u.role === 'support'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          : 'bg-slate-50 text-slate-600 border-slate-200'
                                      }`}
                                    >
                                      {u.role === 'admin' ? (
                                        <>
                                          <ShieldCheck size={11} className="text-indigo-700" />
                                          <span>Admin (Root)</span>
                                        </>
                                      ) : u.role === 'support' ? (
                                        <>
                                          <Wrench size={11} className="text-emerald-700" />
                                          <span>Destek</span>
                                        </>
                                      ) : (
                                        <span>Kullanıcı</span>
                                      )}
                                    </span>

                                    {u.permissions && u.permissions.length > 0 && (
                                      <span
                                        className="font-mono text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 inline-flex items-center gap-1"
                                        title={`${u.permissions.length} yetki tanımlı`}
                                      >
                                        <Key size={9} className="text-amber-700" />
                                        <span>{u.permissions.length} Yetki</span>
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                      u.status === 'suspended'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {u.status === 'suspended' ? 'Askıda' : 'Aktif'}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3">
                                  {u.iban ? (
                                    <div className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                                      <CheckCircle2 size={10} />
                                      <span>{u.bankName || 'Kayıtlı'}</span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">IBAN Yok</span>
                                  )}
                                </td>

                                <td className="py-2.5 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => setEditingUser(u)}
                                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                                      title="Detaylı Müşteri & Yetki Ekranını Aç"
                                    >
                                      <Edit size={12} />
                                      <span>Yönet & Düzenle</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-[12px] text-[#94a3b8]">
                        Arama kriterlerine uygun kullanıcı bulunamadı.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB: CATEGORY CMS (KATEGORİ VE ALT KATEGORİ YÖNETİMİ)
              ======================================================== */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-[18px] font-black text-[#0f172a]">Kategori & Sektör Yönetimi</h1>
                      <p className="text-[12px] text-[#64748b]">
                        Pazaryerinde listelenen ana makine kategorilerini ve alt dallarını canlı yönetin.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setNewCatName('');
                        setNewCatSlug('');
                        setNewCatIcon('Layers');
                        setNewCatModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-[12px] font-bold rounded flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Plus size={15} />
                      <span>Yeni Kategori Ekle</span>
                    </button>
                  </div>

                  {/* CATEGORIES GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {categoriesList.map((cat) => (
                      <div
                        key={cat.id}
                        className="bg-white border border-[#cbd5e1] rounded-[4px] p-3.5 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded bg-orange-50 text-[#ea580c] flex items-center justify-center font-bold text-[12px] border border-orange-200">
                                <FolderTree size={15} />
                              </div>
                              <div>
                                <h3 className="font-bold text-[13px] text-[#0f172a]">{cat.name}</h3>
                                <span className="font-mono text-[10px] text-[#64748b]">/{cat.slug}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Kategoriyi Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Subcategories list */}
                          <div className="mt-3">
                            <div className="text-[11px] font-bold text-[#64748b] mb-1.5 flex items-center justify-between">
                              <span>Alt Kategoriler ({cat.subcategories?.length || 0})</span>
                              <button
                                onClick={() => {
                                  setSelectedCatForSub(cat);
                                  setNewSubCatName('');
                                }}
                                className="text-[#0284c7] hover:underline font-bold text-[10.5px] flex items-center gap-1"
                              >
                                <Plus size={11} /> Alt Kategori Ekle
                              </button>
                            </div>

                            {/* Subcategories pill chips */}
                            <div className="flex flex-wrap gap-1.5">
                              {cat.subcategories && cat.subcategories.length > 0 ? (
                                cat.subcategories.map((sub) => (
                                  <span
                                    key={sub.id}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 font-medium"
                                  >
                                    <span>{sub.name}</span>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const updated = cat.subcategories.filter((s) => s.id !== sub.id);
                                        await saveCategoryToFirestore({ ...cat, subcategories: updated });
                                        showToast(`"${sub.name}" alt kategorisi silindi.`, 'success');
                                      }}
                                      className="text-slate-400 hover:text-red-600 font-bold"
                                      title="Alt kategoriyi sil"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Henüz alt kategori eklenmemiş.</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Inline subcategory creation drawer if selected */}
                        {selectedCatForSub?.id === cat.id && (
                          <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center gap-2">
                            <input
                              type="text"
                              value={newSubCatName}
                              onChange={(e) => setNewSubCatName(e.target.value)}
                              placeholder="Alt kategori adı (Örn: Paletli Ekskavatör)"
                              className="flex-1 h-[30px] px-2 text-[11px] border border-[#cbd5e1] rounded focus:outline-none focus:border-[#ea580c]"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSubcategory(cat)}
                              className="px-3 h-[30px] bg-[#0f172a] hover:bg-slate-800 text-white text-[11px] font-bold rounded"
                            >
                              Ekle
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedCatForSub(null)}
                              className="px-2 h-[30px] text-slate-500 hover:text-slate-800 text-[11px]"
                            >
                              İptal
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* MODAL: CREATE NEW CATEGORY */}
                  {newCatModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-[4px] max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <h3 className="font-bold text-[14px] text-slate-900 flex items-center gap-1.5">
                            <FolderTree size={16} className="text-[#ea580c]" />
                            <span>Yeni Ana Makine Kategorisi Ekle</span>
                          </h3>
                          <button onClick={() => setNewCatModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                            <X size={16} />
                          </button>
                        </div>

                        <form onSubmit={handleSaveNewCategory} className="space-y-3">
                          <div>
                            <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                              Kategori Adı *
                            </label>
                            <input
                              type="text"
                              value={newCatName}
                              onChange={(e) => {
                                setNewCatName(e.target.value);
                                if (!newCatSlug) {
                                  setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                                }
                              }}
                              placeholder="Örn: Forklift & İstif Makineleri"
                              className="w-full h-[32px] px-2.5 text-[12px] border border-slate-300 rounded focus:outline-none focus:border-[#ea580c]"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                              URL Kısaltması (Slug)
                            </label>
                            <input
                              type="text"
                              value={newCatSlug}
                              onChange={(e) => setNewCatSlug(e.target.value)}
                              placeholder="forklift-ve-istif"
                              className="w-full h-[32px] px-2.5 text-[12px] font-mono border border-slate-300 rounded focus:outline-none focus:border-[#ea580c]"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setNewCatModalOpen(false)}
                              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded text-[11.5px] font-semibold hover:bg-slate-50"
                            >
                              İptal
                            </button>
                            <button
                              type="submit"
                              disabled={isProcessing}
                              className="px-4 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded text-[11.5px] font-bold shadow-xs"
                            >
                              {isProcessing ? 'Ekleniyor...' : 'Kategoriyi Oluştur'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================
                  TAB 5: PORTAL SETTINGS (CMS)
              ======================================================== */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-[18px] font-black text-[#0f172a]">Portal & İçerik Yönetimi</h1>
                    <p className="text-[12px] text-[#64748b]">
                      Firestore'da depolanan popüler markaları, arama etiketlerini ve site parametrelerini canlı güncelleyin.
                    </p>
                  </div>

                  {/* POPÜLER MARKALAR */}
                  <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-[#f97316]" />
                        <h2 className="text-[13px] font-bold text-[#0f172a]">Popüler Makine Markaları</h2>
                      </div>
                      <span className="text-[11px] text-[#64748b]">{brands.length} Marka Listeleniyor</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder="Yeni Marka Adı (Örn: Komatsu)"
                        className="h-[34px] px-3 text-[12px] border border-[#cbd5e1] rounded focus:outline-none focus:border-[#f97316] flex-1 bg-[#fafbfc]"
                      />
                      <input
                        type="text"
                        value={newBrandCount}
                        onChange={(e) => setNewBrandCount(e.target.value)}
                        placeholder="Sayaç (Örn: 2.500 İlan)"
                        className="h-[34px] px-3 text-[12px] border border-[#cbd5e1] rounded focus:outline-none focus:border-[#f97316] sm:w-[160px] bg-[#fafbfc]"
                      />
                      <button
                        onClick={handleAddBrand}
                        className="h-[34px] px-4 bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-[12px] rounded flex items-center justify-center gap-1.5 transition-colors shrink-0"
                      >
                        <Plus size={15} />
                        <span>Marka Ekle</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2">
                      {brands.map((b, idx) => (
                        <div
                          key={idx}
                          className="p-2 border border-[#e2e8f0] rounded bg-[#fafbfc] flex items-center justify-between group"
                        >
                          <div className="overflow-hidden">
                            <span className="text-[11.5px] font-bold text-[#0f172a] block truncate">
                              {b.name}
                            </span>
                            <span className="text-[10px] text-[#94a3b8] block">{b.count}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveBrand(b.name)}
                            className="text-[#94a3b8] hover:text-rose-600 p-1 transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* POPÜLER ARAMALAR */}
                  <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                      <div className="flex items-center gap-2">
                        <Search size={16} className="text-[#0284c7]" />
                        <h2 className="text-[13px] font-bold text-[#0f172a]">Popüler Arama Etiketleri</h2>
                      </div>
                      <span className="text-[11px] text-[#64748b]">{searches.length} Etiket</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSearchTag}
                        onChange={(e) => setNewSearchTag(e.target.value)}
                        placeholder="Yeni Arama Etiketi (Örn: Lazer Kaynak Makinesi)"
                        className="h-[34px] px-3 text-[12px] border border-[#cbd5e1] rounded focus:outline-none focus:border-[#0284c7] flex-1 bg-[#fafbfc]"
                      />
                      <button
                        onClick={handleAddSearchTag}
                        className="h-[34px] px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[12px] rounded flex items-center justify-center gap-1.5 transition-colors shrink-0"
                      >
                        <Plus size={15} />
                        <span>Etiket Ekle</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {searches.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-[#f1f5f9] border border-[#cbd5e1] px-2.5 py-1 rounded text-[11px] text-[#334155] flex items-center gap-1.5"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => handleRemoveSearchTag(tag)}
                            className="text-[#94a3b8] hover:text-rose-600 ml-1"
                            title="Kaldır"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ========================================================
          APPLICATION DETAIL MODAL
      ======================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white w-full max-w-[680px] max-h-[90vh] rounded-[4px] shadow-2xl flex flex-col overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0f172a] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-[#f97316]" />
                <span className="font-bold text-[13px]">
                  Kurumsal Mağaza Başvuru Dosyası: {selectedApp.applicationNo}
                </span>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-300 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-[12px] text-[#334155]">
              {/* Status Banner */}
              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase block font-bold">Mevcut Durum</span>
                  <div className="text-[13px] font-black">
                    {selectedApp.status === 'pending' && <span className="text-amber-600">İncelemede / Temsilci Onayı Bekliyor</span>}
                    {selectedApp.status === 'approved' && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14} /> Onaylandı (Kurumsal Mağaza Aktif)</span>}
                    {selectedApp.status === 'rejected' && <span className="text-rose-600 flex items-center gap-1"><XCircle size={14} /> Reddedildi</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#64748b] uppercase block font-bold">Tercih Edilen Paket</span>
                  <span className="text-[12px] font-black uppercase text-[#0284c7]">
                    {selectedApp.preferredPackage || 'Standart'} Kurumsal Paket
                  </span>
                </div>
              </div>

              {/* Company Info */}
              <div className="border border-[#e2e8f0] rounded p-3 space-y-2">
                <h4 className="font-bold text-[#0f172a] text-[12.5px] border-b pb-1">Şirket Resmi Bilgileri</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#64748b] block text-[10.5px]">Ticari Şirket Ünvanı:</span>
                    <strong>{selectedApp.companyName}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10.5px]">Resmi Ünvan:</span>
                    <span>{selectedApp.legalTitle}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10.5px]">Vergi Dairesi & Numarası:</span>
                    <strong className="font-mono text-[#0284c7]">{selectedApp.taxOffice} / {selectedApp.taxNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10.5px]">Şirket Türü:</span>
                    <span className="capitalize">{selectedApp.companyType || 'Limited Şirket'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="border border-[#e2e8f0] rounded p-3 space-y-2">
                <h4 className="font-bold text-[#0f172a] text-[12.5px] border-b pb-1">Yetkili & İletişim Bilgileri</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#64748b] block text-[10.5px]">Yetkili Adı Soyadı:</span>
                    <strong>{selectedApp.contactName}</strong> {selectedApp.contactTitle && `(${selectedApp.contactTitle})`}
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10.5px]">Cep Telefonu:</span>
                    <strong className="text-[#0284c7] font-mono">{selectedApp.phone}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10.5px]">Kurumsal E-posta:</span>
                    <span className="font-mono">{selectedApp.email}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10.5px]">Şehir / İlçe:</span>
                    <span>{selectedApp.city} / {selectedApp.district}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#64748b] block text-[10.5px]">Açık Adres:</span>
                    <span className="text-[#475569]">{selectedApp.address}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedApp.notes && (
                <div className="p-2.5 bg-yellow-50/60 border border-yellow-200 rounded text-[11.5px]">
                  <span className="font-bold text-[#0f172a] block mb-0.5">Başvuru Sahibi Notu:</span>
                  <p className="text-[#64748b]">{selectedApp.notes}</p>
                </div>
              )}

              {/* Representative Review Notes */}
              {selectedApp.reviewNotes && (
                <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded text-[11.5px]">
                  <span className="font-bold text-[#0284c7] block mb-0.5">Temsilci Notu / İnceleme Açıklaması:</span>
                  <p className="text-[#475569]">{selectedApp.reviewNotes}</p>
                  {selectedApp.reviewedBy && (
                    <span className="text-[10px] text-[#94a3b8] block mt-1">İnceleyen: {selectedApp.reviewedBy}</span>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-3 py-1.5 text-[11.5px] font-bold text-[#64748b] hover:bg-[#e2e8f0] rounded border border-[#cbd5e1]"
              >
                Kapat
              </button>

              <div className="flex items-center gap-2">
                {selectedApp.status === 'pending' && (
                  <>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleOpenRejectModal(selectedApp.id!)}
                      className="px-3 py-1.5 text-[11.5px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                    >
                      Başvuruyu Reddet
                    </button>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleApproveApplication(selectedApp)}
                      className="px-4 py-1.5 text-[11.5px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 size={14} />
                      <span>Onayla & Kurumsal Mağaza Aç</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          REJECT REASON MODAL
      ======================================================== */}
      {rejectReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white w-full max-w-[440px] rounded-[4px] shadow-2xl p-4 border border-[#cbd5e1] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
              <h3 className="font-bold text-[13px] text-rose-700 flex items-center gap-1.5">
                <XCircle size={16} />
                <span>Başvuruyu Reddet</span>
              </h3>
              <button onClick={() => setRejectReasonModalOpen(false)} className="text-[#94a3b8] hover:text-[#0f172a]">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                Ret Gerekçesi (Başvuru sahibine ve panele işlenecektir):
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 text-[12px] border border-[#cbd5e1] rounded focus:outline-none focus:border-rose-500 bg-[#fafbfc]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                onClick={() => setRejectReasonModalOpen(false)}
                className="px-3 py-1 text-[11.5px] font-bold text-[#64748b] hover:bg-[#f1f5f9] rounded border border-[#cbd5e1]"
              >
                Vazgeç
              </button>
              <button
                disabled={isProcessing}
                onClick={handleConfirmReject}
                className="px-4 py-1 text-[11.5px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors shadow-2xs"
              >
                {isProcessing ? 'İşleniyor...' : 'Reddi Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
