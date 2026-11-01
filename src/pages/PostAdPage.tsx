import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, 
  Camera, 
  Trash2, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Layers, 
  MapPin, 
  DollarSign, 
  Phone, 
  User, 
  Check, 
  ShieldCheck,
  Eye,
  Info,
  X,
  Cloud,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useCategories } from '../context/CategoryContext';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { compressImage, compressImageToBlob, handleImageFallback, DEFAULT_MACHINE_IMAGE } from '../utils/image';
import { isR2Configured, uploadImageToR2 } from '../lib/r2';
import { subscribeToPresetPhotos, PresetPhotoItem } from '../lib/portalService';

interface PostAdPageProps {
  onAddListing: (newListing: Listing) => Promise<void> | void;
}

const TURKISH_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
  'Kocaeli', 'Mersin', 'Kayseri', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli',
  'Şanlıurfa', 'Sakarya', 'Tekirdağ', 'Manisa', 'Balıkesir', 'Trabzon', 'Kahramanmaraş',
  'Aydın', 'Hatay', 'Malatya', 'Çorum', 'Afyonkarahisar', 'Kütahya', 'Sivas', 'Elazığ'
];

export const PostAdPage: React.FC<PostAdPageProps> = ({ onAddListing }) => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { categories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper: 1 = Kategori, 2 = Detaylar, 3 = Fotoğraflar, 4 = Konum & İletişim, 5 = Başarılı
  const [step, setStep] = useState<number>(1);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');

  // Specs
  const [title, setTitle] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<number>(2023);
  const [hours, setHours] = useState<number>(0);
  const [condition, setCondition] = useState<string>('Çalışır / İkinci El');
  const [warranty, setWarranty] = useState<string>('Yok');
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<'TL' | 'EUR' | 'USD'>('TL');
  const [negotiable, setNegotiable] = useState<boolean>(true);
  const [swapAvailable, setSwapAvailable] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');

  // Photos
  const [images, setImages] = useState<string[]>([]);
  const [isVitrin, setIsVitrin] = useState<boolean>(true);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [isGuvende, setIsGuvende] = useState<boolean>(true);
  const [presetPhotos, setPresetPhotos] = useState<PresetPhotoItem[]>([]);

  // Contact & Location
  const [city, setCity] = useState<string>('İstanbul');
  const [district, setDistrict] = useState<string>('İkitelli OSB');
  const [sellerName, setSellerName] = useState<string>('Enes Poyraz');
  const [phone, setPhone] = useState<string>('0532 000 00 00');
  const [sellerType, setSellerType] = useState<'Sahibinden' | 'Galeriden' | 'Yetkili Bayi' | 'Üreticiden'>('Sahibinden');
  const [showPhone, setShowPhone] = useState<boolean>(true);

  // Generated listing ID after publish
  const [publishedListingId, setPublishedListingId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState<boolean>(false);

  // Subscribe to live preset photos from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToPresetPhotos((items) => {
      if (items && items.length > 0) {
        setPresetPhotos(items);
      }
    });
    return () => unsubscribe();
  }, []);

  const photoList = useMemo(() => {
    const list: { title: string; url: string }[] = [];
    presetPhotos.forEach((p) => {
      if (Array.isArray(p.images)) {
        p.images.forEach((imgUrl, i) => {
          list.push({ title: `${p.title} (${i + 1})`, url: imgUrl });
        });
      }
    });
    return list;
  }, [presetPhotos]);

  // Sync user profile data on load
  useEffect(() => {
    if (userProfile || user) {
      setSellerName(userProfile?.companyName || userProfile?.displayName || user?.displayName || 'Enes Poyraz');
      setPhone(userProfile?.phoneNumber || '0532 000 00 00');
      setCity(userProfile?.city || 'İstanbul');
      setDistrict(userProfile?.district || 'İkitelli OSB');
      setSellerType(userProfile?.accountType === 'kurumsal' ? 'Galeriden' : 'Sahibinden');
    }
  }, [user, userProfile]);

  // Current category object
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);
  const currentSubCategoryObj = currentCategoryObj?.subcategories.find((s) => s.id === selectedSubCategory);

  // Category search filter
  const matchingCategories = categorySearchQuery.trim()
    ? categories.flatMap((cat) =>
        cat.subcategories
          .filter(
            (sub) =>
              sub.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
              cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
          )
          .map((sub) => ({
            catId: cat.id,
            catName: cat.name,
            subId: sub.id,
            subName: sub.name
          }))
      )
    : [];

  // Handle Photo Upload with Automatic Canvas Compression & Cloudflare R2 Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhotos(true);
    const fileList = Array.from(files);

    for (const file of fileList) {
      try {
        // Her zaman anında ve kusursuz önizleme için optimize edilmiş yerel görseli hazırla
        const compressed = await compressImage(file, 1200, 900, 0.75);

        if (isR2Configured) {
          try {
            // Özel domain bağlı Cloudflare R2'ye yükle
            const blob = await compressImageToBlob(file, 1600, 1200, 0.82);
            const r2Url = await uploadImageToR2(blob);
            setImages((prev) => [...prev, r2Url]);
          } catch (r2Err) {
            console.warn('R2 yükleme hatası, yerel görsele dönülüyor:', r2Err);
            setImages((prev) => [...prev, compressed]);
          }
        } else {
          // Cloudflare'de özel domain tanımlanana kadar doğrudan hafif Base64 kullan
          setImages((prev) => [...prev, compressed]);
        }
      } catch (err) {
        console.error('Fotoğraf işlenemedi:', err);
      }
    }

    setIsUploadingPhotos(false);
    // Reset input value so same files can be re-selected if deleted
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCoverImage = (indexToCover: number) => {
    setImages((prev) => {
      const chosen = prev[indexToCover];
      const remaining = prev.filter((_, idx) => idx !== indexToCover);
      return [chosen, ...remaining];
    });
  };

  // Submit Listing
  const handlePublishListing = async () => {
    if (!title || !selectedCategory || !selectedSubCategory || !price) {
      alert('Lütfen zorunlu alanları doldurunuz.');
      return;
    }

    setIsSubmitting(true);

    const generatedId = `mak-${Date.now().toString().slice(-4)}`;
    const randomAdNo = `1098${Math.floor(Math.random() * 900000 + 100000)}`;

    const finalImages =
      images.length > 0
        ? images
        : [DEFAULT_MACHINE_IMAGE];

    const newAd: Listing = {
      id: generatedId,
      adNo: randomAdNo,
      userId: user?.uid || 'bireysel-kullanici',
      status: 'active',
      viewsCount: 1,
      title: title.trim(),
      category: selectedCategory,
      subCategory: selectedSubCategory,
      brand: brand.trim() || 'Standart',
      model: model.trim() || brand.trim() || 'Model Belirtilmemiş',
      year: Number(year) || 2023,
      hours: Number(hours) || 0,
      price: Number(price.replace(/[^0-9]/g, '')) || 0,
      currency,
      city,
      district,
      date: 'Yeni İlan',
      images: finalImages,
      seller: {
        name: sellerName.trim(),
        type: sellerType,
        memberSince: '2026',
        phone: showPhone ? phone.trim() : 'Mesaj ile Ulaşınız',
        companyName: userProfile?.companyName || ''
      },
      features: [
        { label: 'İlan No', value: randomAdNo },
        { label: 'İlan Tarihi', value: 'Bugün' },
        { label: 'Kategori', value: currentCategoryObj?.name || 'Makine' },
        { label: 'Alt Kategori', value: currentSubCategoryObj?.name || 'Genel' },
        { label: 'Marka', value: brand || 'Standart' },
        { label: 'Model', value: model || 'Model Belirtilmemiş' },
        { label: 'Üretim Yılı', value: String(year) },
        { label: 'Çalışma Saati', value: hours > 0 ? `${hours} Saat` : 'Sıfır Ürün' },
        { label: 'Durumu', value: condition },
        { label: 'Garanti', value: warranty },
        { label: 'Pazarlık', value: negotiable ? 'Var' : 'Yok' },
        { label: 'Takas', value: swapAvailable ? 'Evet' : 'Hayır' }
      ],
      description: description.trim() || `${title} temiz ve çalışır durumda. Detaylı bilgi için arayınız.`,
      isVitrin,
      isUrgent,
      isGuvende
    };

    try {
      await onAddListing(newAd);
      setPublishedListingId(generatedId);
      setStep(5); // Go to celebration screen
    } catch (err) {
      console.error('İlan yayınlanırken hata:', err);
      alert('İlan kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPricePreview = (val: string, cur: string) => {
    const num = Number(val.replace(/[^0-9]/g, ''));
    if (!num) return `0 ${cur}`;
    return `${num.toLocaleString('tr-TR')} ${cur}`;
  };

  return (
    <div className="min-h-screen bg-[#f1f4f8] py-6 font-sans text-[#1e293b]">
      <div className="max-w-[1000px] mx-auto px-4">
        
        {/* 1. TOP STEPPER BAR */}
        <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 mb-5 shadow-2xs">
          <div className="flex items-center justify-between text-[12px] font-bold">
            
            {/* Step 1 */}
            <button
              onClick={() => step > 1 && step < 5 && setStep(1)}
              className={`flex items-center gap-2 ${
                step === 1 ? 'text-[#ea580c]' : step > 1 ? 'text-emerald-600' : 'text-[#94a3b8]'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                step === 1 ? 'bg-[#ea580c] text-white' : step > 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span className="hidden sm:inline">Kategori Seçimi</span>
            </button>

            <ChevronRight size={14} className="text-[#cbd5e1]" />

            {/* Step 2 */}
            <button
              onClick={() => step > 2 && step < 5 && setStep(2)}
              className={`flex items-center gap-2 ${
                step === 2 ? 'text-[#ea580c]' : step > 2 ? 'text-emerald-600' : 'text-[#94a3b8]'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                step === 2 ? 'bg-[#ea580c] text-white' : step > 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span className="hidden sm:inline">İlan Detayları</span>
            </button>

            <ChevronRight size={14} className="text-[#cbd5e1]" />

            {/* Step 3 */}
            <button
              onClick={() => step > 3 && step < 5 && setStep(3)}
              className={`flex items-center gap-2 ${
                step === 3 ? 'text-[#ea580c]' : step > 3 ? 'text-emerald-600' : 'text-[#94a3b8]'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                step === 3 ? 'bg-[#ea580c] text-white' : step > 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > 3 ? '✓' : '3'}
              </span>
              <span className="hidden sm:inline">Fotoğraflar</span>
            </button>

            <ChevronRight size={14} className="text-[#cbd5e1]" />

            {/* Step 4 */}
            <button
              onClick={() => step > 4 && step < 5 && setStep(4)}
              className={`flex items-center gap-2 ${
                step === 4 ? 'text-[#ea580c]' : step > 4 ? 'text-emerald-600' : 'text-[#94a3b8]'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                step === 4 ? 'bg-[#ea580c] text-white' : step > 4 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > 4 ? '✓' : '4'}
              </span>
              <span className="hidden sm:inline">Konum & Önizleme</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* STEP 1: CASCADING CATEGORY SELECTION */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-6 shadow-2xs">
            <div className="mb-5 pb-3 border-b border-[#e2e8f0]">
              <h2 className="text-[17px] font-bold text-[#1e293b]">
                Adım 1: İlanınız İçin En Uygun Kategoriyi Seçin
              </h2>
              <p className="text-[12px] text-[#64748b] mt-0.5">
                Makinanızın doğru alıcı kitlesine ulaşabilmesi için ana ve alt kategorisini belirleyin.
              </p>
            </div>

            {/* Fast Search Filter */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Kategori veya makine türü ara (Örn: Tost makinesi, Ekskavatör, Torna, Overlok)..."
                  className="w-full h-[40px] pl-9 pr-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                />
                <Search size={16} className="absolute left-3 top-3 text-[#94a3b8]" />
              </div>

              {/* Instant Search Results if typing */}
              {categorySearchQuery.trim() && matchingCategories.length > 0 && (
                <div className="mt-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-[3px] p-2 max-h-[180px] overflow-y-auto space-y-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider px-2">
                    Arama Sonuçları:
                  </span>
                  {matchingCategories.map((item) => (
                    <button
                      key={item.subId}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(item.catId);
                        setSelectedSubCategory(item.subId);
                        setCategorySearchQuery('');
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-orange-50 hover:text-[#ea580c] rounded text-[12px] flex items-center justify-between"
                    >
                      <span className="font-semibold">{item.subName}</span>
                      <span className="text-[11px] text-[#94a3b8]">({item.catName})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2-Column Cascading Category Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-[#cbd5e1] rounded-[4px] overflow-hidden min-h-[340px]">
              {/* Column 1: Main Categories */}
              <div className="bg-[#f8fafc] border-b md:border-b-0 md:border-r border-[#cbd5e1] p-2 max-h-[360px] overflow-y-auto">
                <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider px-2 py-1 mb-1">
                  Ana Kategoriler
                </div>
                <div className="space-y-0.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubCategory(''); // Reset subcategory when main changes
                      }}
                      className={`w-full text-left px-3 py-2 rounded-[2px] text-[12.5px] font-medium flex items-center justify-between transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-[#19324d] text-white font-bold'
                          : 'text-[#334155] hover:bg-[#edf2f7]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ChevronRight size={14} className={selectedCategory === cat.id ? 'text-white' : 'text-[#94a3b8]'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 2: Subcategories */}
              <div className="bg-white p-2 max-h-[360px] overflow-y-auto">
                <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider px-2 py-1 mb-1">
                  {currentCategoryObj ? `${currentCategoryObj.name} Alt Dalları` : 'Lütfen Ana Kategori Seçin'}
                </div>
                {currentCategoryObj ? (
                  <div className="space-y-0.5">
                    {currentCategoryObj.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubCategory(sub.id)}
                        className={`w-full text-left px-3 py-2 rounded-[2px] text-[12.5px] font-medium flex items-center justify-between transition-colors ${
                          selectedSubCategory === sub.id
                            ? 'bg-orange-50 text-[#ea580c] font-bold border border-orange-200'
                            : 'text-[#334155] hover:bg-[#f8fafc]'
                        }`}
                      >
                        <span>{sub.name}</span>
                        {selectedSubCategory === sub.id && <Check size={14} className="text-[#ea580c]" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-[#94a3b8] text-[12px]">
                    Sol taraftaki listeden bir ana makine kategorisi seçiniz.
                  </div>
                )}
              </div>
            </div>

            {/* Breadcrumb Display of Selected Category */}
            {selectedCategory && selectedSubCategory && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-[3px] flex items-center gap-2 text-[12px] text-emerald-800 font-semibold animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Seçilen Kategori: <strong>{currentCategoryObj?.name}</strong> &gt; <strong>{currentSubCategoryObj?.name}</strong>
                </span>
              </div>
            )}

            {/* Stepper Buttons */}
            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
              <button
                type="button"
                disabled={!selectedCategory || !selectedSubCategory}
                onClick={() => setStep(2)}
                className={`h-[40px] px-6 text-[13px] font-bold rounded-[3px] flex items-center gap-1.5 transition-colors ${
                  selectedCategory && selectedSubCategory
                    ? 'bg-[#ea580c] hover:bg-[#d94e08] text-white shadow-xs'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Devam Et: İlan Detayları</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: SPECS, PRICING & DESCRIPTION */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-6 shadow-2xs">
            <div className="mb-5 pb-3 border-b border-[#e2e8f0]">
              <h2 className="text-[17px] font-bold text-[#1e293b]">
                Adım 2: Makine Detayları ve Fiyat Bilgileri
              </h2>
              <p className="text-[12px] text-[#64748b] mt-0.5">
                Kategori: <strong>{currentCategoryObj?.name} &gt; {currentSubCategoryObj?.name}</strong>
              </p>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[12px] font-bold text-[#334155]">
                    İlan Başlığı * (En az 10 karakter)
                  </label>
                  <span className="text-[11px] text-[#94a3b8]">{title.length}/80</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 2022 Model Döküm Çift Kapaklı Sanayi Tipi Tost Makinesi"
                  className="w-full h-[40px] px-3.5 text-[13px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                />
              </div>

              {/* Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#334155] mb-1">
                    Marka *
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Örn: Remta, CAT, Mazak, Juki, Massey Ferguson"
                    className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#334155] mb-1">
                    Model / Seri Kodu *
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Örn: R71 Lüks, 320D, Quick Turn 250"
                    className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                  />
                </div>
              </div>

              {/* Year & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#334155] mb-1">
                    Üretim Yılı *
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] bg-white focus:outline-none focus:border-[#ea580c]"
                  >
                    {Array.from({ length: 47 }, (_, i) => 2026 - i).map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#334155] mb-1">
                    Çalışma Saati (Varsa)
                  </label>
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    placeholder="0"
                    className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#334155] mb-1">
                    Garanti Durumu
                  </label>
                  <select
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] bg-white focus:outline-none focus:border-[#ea580c]"
                  >
                    <option value="Yok">Garantisi Yok</option>
                    <option value="Var (Yetkili Servis)">Var (Yetkili Servis)</option>
                    <option value="Var (İthalatçı)">Var (İthalatçı)</option>
                    <option value="1 Yıl Mağaza Garantili">1 Yıl Mağaza Garantili</option>
                  </select>
                </div>
              </div>

              {/* Condition Pills */}
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1.5">
                  Makine Durumu *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Sıfır / Kutusunda', 'Çalışır / İkinci El', 'Revizyonlu / Bakımlı', 'Yedek Parçalık'].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setCondition(cond)}
                      className={`h-[36px] rounded-[3px] border text-[12px] font-semibold transition-all ${
                        condition === cond
                          ? 'border-[#ea580c] bg-orange-50 text-[#ea580c]'
                          : 'border-[#cbd5e1] bg-white text-[#475569] hover:bg-[#f8fafc]'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing & Terms */}
              <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">
                      Fiyat *
                    </label>
                    <input
                      type="text"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Örn: 18.500"
                      className="w-full h-[40px] px-3.5 text-[14px] font-bold font-mono border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">
                      Para Birimi
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      className="w-full h-[40px] px-3 text-[13px] font-bold border border-[#cbd5e1] rounded-[3px] bg-white focus:outline-none focus:border-[#ea580c]"
                    >
                      <option value="TL">TL (Türk Lirası)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-[12px] text-[#475569]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={negotiable}
                      onChange={(e) => setNegotiable(e.target.checked)}
                      className="w-3.5 h-3.5 text-[#ea580c] rounded"
                    />
                    <span>Pazarlık Payı Var</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={swapAvailable}
                      onChange={(e) => setSwapAvailable(e.target.checked)}
                      className="w-3.5 h-3.5 text-[#ea580c] rounded"
                    />
                    <span>Takasa Uygun</span>
                  </label>
                </div>
              </div>

              {/* Makinam Güvende Güvenli Satış Seçeneği */}
              <div className={`p-3.5 rounded-[4px] border transition-all ${
                isGuvende
                  ? 'bg-orange-50/70 border-[#ea580c] ring-1 ring-orange-200'
                  : 'bg-[#f8fafc] border-[#cbd5e1]'
              }`}>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGuvende}
                    onChange={(e) => setIsGuvende(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#ea580c] rounded focus:ring-orange-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[12.5px] text-[#1e293b] flex items-center gap-1.5">
                        <ShieldCheck size={16} className="text-[#ea580c]" />
                        Bu İlanda "Makinam Güvende" Kullanmak İstiyorum
                      </span>
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                        Önerilen • Sıfır Risk
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b] mt-1 leading-relaxed">
                      Alıcının ödemesi resmi havuz hesapta bloke edilir. Ürün eline ulaşıp ekspertiz onayı verilene kadar para korunur; teslimat onaylandığında paranız kesintisiz olarak doğrudan IBAN adresinize aktarılır.
                    </p>
                  </div>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">
                  Detaylı Açıklama
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Makinenin bakım geçmişi, döküm durumu, yanında verilecek aksesuarlar, motor durumu vb. bilgileri yazınız..."
                  className="w-full p-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                />
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="mt-6 flex justify-between gap-3 pt-3 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-[40px] px-5 border border-[#cbd5e1] text-[#475569] text-[12.5px] font-bold rounded-[3px] hover:bg-gray-50 flex items-center gap-1.5"
              >
                <ChevronLeft size={15} />
                <span>Kategoriye Dön</span>
              </button>

              <button
                type="button"
                disabled={!title || !brand || !price}
                onClick={() => setStep(3)}
                className={`h-[40px] px-6 text-[13px] font-bold rounded-[3px] flex items-center gap-1.5 transition-colors ${
                  title && brand && price
                    ? 'bg-[#ea580c] hover:bg-[#d94e08] text-white shadow-xs'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Devam Et: Fotoğraf Yükle</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: PHOTO UPLOADING & MANAGEMENT */}
        {/* ============================================================== */}
        {step === 3 && (
          <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-6 shadow-2xs">
            <div className="mb-5 pb-3 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-[17px] font-bold text-[#1e293b]">
                  Adım 3: Makine Fotoğraflarını Yükleyin
                </h2>
                <p className="text-[12px] text-[#64748b] mt-0.5">
                  Fotoğraflı ilanlar ortalama 4 kat daha hızlı alıcı bulmaktadır (En fazla 15 fotoğraf).
                </p>
              </div>

              <div className="flex items-center gap-2 self-start flex-wrap">
                {isR2Configured ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Cloud size={13} className="text-emerald-600" />
                    Cloudflare R2 Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748b] bg-gray-50 px-2 py-0.5 rounded border border-gray-200" title="R2 API Token tanımlandığında R2 nesne depolama otomatik devreye girer">
                    <Cloud size={13} className="text-gray-400" />
                    R2 Entegrasyonu Hazır
                  </span>
                )}
                <div className="text-[12px] font-bold text-[#ea580c] bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">
                  {images.length}/15 Fotoğraf
                </div>
              </div>
            </div>

            {/* Hidden HTML5 File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              multiple
              accept="image/*"
              className="hidden"
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => !isUploadingPhotos && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[4px] p-8 text-center transition-all mb-6 group ${
                isUploadingPhotos 
                  ? 'border-orange-400 bg-orange-50/40 cursor-wait' 
                  : 'border-[#cbd5e1] hover:border-[#ea580c] cursor-pointer bg-[#fafbfc] hover:bg-orange-50/20'
              }`}
            >
              {isUploadingPhotos ? (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center mx-auto mb-3 animate-spin">
                    <Loader2 size={26} />
                  </div>
                  <h3 className="text-[14px] font-bold text-[#ea580c]">
                    Fotoğraflar {isR2Configured ? "Cloudflare R2'ye Yükleniyor..." : "İşleniyor..."}
                  </h3>
                  <p className="text-[11.5px] text-[#64748b] mt-1">
                    Lütfen bekleyiniz, optimize ediliyor...
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <Upload size={24} />
                  </div>
                  <h3 className="text-[14px] font-bold text-[#1e293b]">
                    Cihazınızdan Fotoğraf Seçmek İçin Tıklayın veya Sürükleyin
                  </h3>
                  <p className="text-[11.5px] text-[#64748b] mt-1">
                    JPG, PNG veya WEBP formatında çoklu fotoğraf yükleyebilirsiniz.
                  </p>
                </>
              )}
            </div>

            {/* Veya Test İçin Hazır Makine Fotoğraflarından Seçin */}
            <div className="mb-6 p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px]">
              <div className="text-[11.5px] font-bold text-[#334155] mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#ea580c]" />
                  Veya Test İçin Hazır Makine Fotoğraflarından Seçin:
                </span>
                <span className="text-[10.5px] text-[#94a3b8] font-normal">Tıklayarak ilanınıza ekleyin</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {photoList.map((preset: { title: string; url: string }, pIdx: number) => {
                  const isSelected = images.includes(preset.url);
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        if (images.length >= 15) {
                          alert('En fazla 15 fotoğraf ekleyebilirsiniz.');
                          return;
                        }
                        if (isSelected) {
                          setImages((prev) => prev.filter((img) => img !== preset.url));
                        } else {
                          setImages((prev) => [...prev, preset.url]);
                        }
                      }}
                      className={`relative group rounded overflow-hidden border aspect-[4/3] bg-gray-100 transition-all text-left ${
                        isSelected ? 'border-[#ea580c] ring-2 ring-orange-200' : 'border-[#cbd5e1] hover:border-[#ea580c]'
                      }`}
                      title={preset.title}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        onError={handleImageFallback}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold transition-opacity text-center p-1 ${
                        isSelected ? 'bg-orange-600/80 opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'
                      }`}>
                        {isSelected ? '✓ Eklendi' : '+ Ekle'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Uploaded Photos Grid */}
            {images.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11.5px] text-[#64748b]">
                  <span>Yüklenen Fotoğraflar (İlk fotoğraf vitrin kapak fotoğrafı olacaktır):</span>
                  <button
                    type="button"
                    onClick={() => setImages([])}
                    className="text-red-500 hover:underline font-bold"
                  >
                    Tümünü Temizle
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {images.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/3] rounded-[3px] overflow-hidden border-2 group bg-gray-100 shadow-2xs"
                      style={{ borderColor: index === 0 ? '#ea580c' : '#cbd5e1' }}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Makine Foto ${index + 1}`} 
                        onError={handleImageFallback}
                        className="w-full h-full object-cover" 
                      />

                      {/* Cover Badge */}
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-[#ea580c] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[2px] shadow-xs">
                          KAPAK
                        </span>
                      )}

                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetCoverImage(index)}
                            title="Kapak Fotoğrafı Yap"
                            className="p-1.5 bg-white text-[#ea580c] hover:bg-orange-50 rounded shadow"
                          >
                            <Star size={14} className="fill-[#ea580c]" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          title="Fotoğrafı Kaldır"
                          className="p-1.5 bg-white text-red-600 hover:bg-red-50 rounded shadow"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-[3px] text-[12px] text-amber-800 flex items-center gap-2">
                <Info size={16} className="shrink-0 text-amber-600" />
                <span>Henüz fotoğraf eklemediniz. En az bir fotoğraf eklemeniz tavsiye edilir.</span>
              </div>
            )}

            {/* Stepper Buttons */}
            <div className="mt-6 flex justify-between gap-3 pt-3 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-[40px] px-5 border border-[#cbd5e1] text-[#475569] text-[12.5px] font-bold rounded-[3px] hover:bg-gray-50 flex items-center gap-1.5"
              >
                <ChevronLeft size={15} />
                <span>Detaylara Dön</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="h-[40px] px-6 bg-[#ea580c] hover:bg-[#d94e08] text-white text-[13px] font-bold rounded-[3px] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Devam Et: Konum & İletişim</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: LOCATION, CONTACT & FINAL PREVIEW */}
        {/* ============================================================== */}
        {step === 4 && (
          <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-6 shadow-2xs">
            <div className="mb-5 pb-3 border-b border-[#e2e8f0]">
              <h2 className="text-[17px] font-bold text-[#1e293b]">
                Adım 4: Konum, İletişim ve Yayına Alma
              </h2>
              <p className="text-[12px] text-[#64748b] mt-0.5">
                Alıcıların size kolayca ulaşabilmesi için bilgileri kontrol edip onaylayınız.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Location & Contact */}
              <div className="md:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">
                      Makinenin Bulunduğu İl *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] bg-white focus:outline-none focus:border-[#ea580c]"
                    >
                      {TURKISH_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">
                      İlçe / Sanayi Sitesi *
                    </label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Örn: İkitelli OSB, Nilüfer, Torbalı"
                      className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">
                      İletişim Kişisi / Firma *
                    </label>
                    <input
                      type="text"
                      required
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">
                      Cep Telefonu *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">
                      Satıcı Türü
                    </label>
                    <select
                      value={sellerType}
                      onChange={(e) => setSellerType(e.target.value as any)}
                      className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[3px] bg-white focus:outline-none focus:border-[#ea580c]"
                    >
                      <option value="Sahibinden">Sahibinden</option>
                      <option value="Galeriden">Galeriden / Mağazadan</option>
                      <option value="Yetkili Bayi">Yetkili Bayi</option>
                      <option value="Üreticiden">Üreticiden</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#475569]">
                      <input
                        type="checkbox"
                        checked={showPhone}
                        onChange={(e) => setShowPhone(e.target.checked)}
                        className="w-4 h-4 text-[#ea580c] rounded"
                      />
                      <span>Telefon numaram ilanda görünsün</span>
                    </label>
                  </div>
                </div>

                {/* Optional Vitrin & Güvenlik Boost */}
                <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] space-y-2.5">
                  <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block">
                    Güvenli Ticaret & Öne Çıkarma Seçenekleri:
                  </span>
                  
                  {/* Makinam Güvende Checkbox */}
                  <label className="flex items-start gap-2 cursor-pointer p-2 rounded bg-orange-50/60 border border-orange-200">
                    <input
                      type="checkbox"
                      checked={isGuvende}
                      onChange={(e) => setIsGuvende(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#ea580c] rounded focus:ring-orange-500"
                    />
                    <div>
                      <span className="font-bold text-[12px] text-[#ea580c] flex items-center gap-1">
                        <ShieldCheck size={14} className="text-[#ea580c]" />
                        Makinam Güvende (Havuz Hesap Koruması)
                      </span>
                      <p className="text-[10.5px] text-[#64748b] mt-0.5">
                        Alıcı teslim alana kadar paranız havuzda korunur, satışta doğrudan IBAN'a aktarılır.
                      </p>
                    </div>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[12px]">
                      <input
                        type="checkbox"
                        checked={isVitrin}
                        onChange={(e) => setIsVitrin(e.target.checked)}
                        className="w-4 h-4 text-[#ea580c] rounded"
                      />
                      <span className="font-semibold text-[#1e293b]">Anasayfa Vitrininde Yayınla</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-[12px]">
                      <input
                        type="checkbox"
                        checked={isUrgent}
                        onChange={(e) => setIsUrgent(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded"
                      />
                      <span className="font-semibold text-red-700">Acil Satılık Etiketi Ekle</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Card Preview */}
              <div className="md:col-span-5 bg-[#f8fafc] border border-[#cbd5e1] p-4 rounded-[4px]">
                <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Eye size={13} className="text-[#ea580c]" />
                  <span>Canlı İlan Kartı Önizlemesi</span>
                </div>

                <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-2.5 shadow-2xs">
                  <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden bg-gray-100 mb-2 border border-[#e2e8f0]">
                    <img
                      src={
                        images[0] ||
                        DEFAULT_MACHINE_IMAGE
                      }
                      alt={title || 'Makine'}
                      className="w-full h-full object-cover"
                    />
                    {isUrgent && (
                      <span className="absolute top-1 left-1 bg-[#b91c1c] text-white text-[8px] font-bold px-1 rounded">
                        ACİL
                      </span>
                    )}
                    {isVitrin && (
                      <span className="absolute top-1 right-1 bg-[#ea580c] text-white text-[8px] font-bold px-1 rounded">
                        VİTRİN
                      </span>
                    )}
                    {isGuvende && (
                      <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[8px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 shadow-xs">
                        <ShieldCheck size={10} /> GÜVENDE
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-mono px-1 rounded">
                      {year}
                    </span>
                  </div>

                  <div className="font-bold text-[13px] text-[#1e293b] line-clamp-2">
                    {title || 'İlan Başlığı Buraya Gelecek'}
                  </div>

                  <div className="text-[11px] text-[#64748b] mt-1">
                    {brand || 'Marka'} {model ? `• ${model}` : ''}
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-[#f1f5f9] flex items-center justify-between">
                    <span className="font-bold text-[#b91c1c] text-[13px]">
                      {formatPricePreview(price, currency)}
                    </span>
                    <span className="text-[10.5px] text-[#64748b]">
                      {city}, {district}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="mt-6 flex justify-between gap-3 pt-3 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-[40px] px-5 border border-[#cbd5e1] text-[#475569] text-[12.5px] font-bold rounded-[3px] hover:bg-gray-50 flex items-center gap-1.5"
              >
                <ChevronLeft size={15} />
                <span>Fotoğraflara Dön</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePublishListing}
                className="h-[42px] px-8 bg-[#ea580c] hover:bg-[#d94e08] active:bg-[#c2410c] text-white text-[13.5px] font-black rounded-[3px] transition-colors shadow-xs flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>{isSubmitting ? 'İlan Yayınlanıyor...' : 'İlanı Ücretsiz Yayına Al'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 5: CELEBRATION / SUCCESS SCREEN */}
        {/* ============================================================== */}
        {step === 5 && (
          <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-8 text-center shadow-2xs animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-300">
              <CheckCircle2 size={32} />
            </div>

            <h1 className="text-[20px] font-black text-[#1e293b]">
              Tebrikler! İlanınız Başarıyla Yayına Alındı
            </h1>
            <p className="text-[12.5px] text-[#64748b] max-w-[450px] mx-auto mt-1.5">
              İlanınız Makinam.com vitrininde ve arama sonuçlarında tüm alıcıların erişimine açılmıştır.
            </p>

            <div className="my-5 p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] max-w-[340px] mx-auto text-[12px] text-[#334155]">
              <div className="font-bold text-[13px]">{title}</div>
              <div className="text-[11px] text-[#64748b] mt-0.5">
                Kategori: {currentCategoryObj?.name} &gt; {currentSubCategoryObj?.name}
              </div>
              <div className="mt-1 font-bold text-[#ea580c]">
                Fiyat: {formatPricePreview(price, currency)}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to={`/ilan/${publishedListingId}`}
                className="h-[40px] px-5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-[12.5px] font-bold rounded-[3px] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Eye size={15} />
                <span>İlanımı Görüntüle</span>
              </Link>

              <Link
                to="/hesabim/ilanlarim"
                className="h-[40px] px-5 bg-[#19324d] hover:bg-[#122438] text-white text-[12.5px] font-bold rounded-[3px] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>İlanlarımı Yönet</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setTitle('');
                  setBrand('');
                  setModel('');
                  setPrice('');
                  setImages([]);
                  setDescription('');
                }}
                className="h-[40px] px-5 border border-[#cbd5e1] hover:bg-gray-50 text-[#334155] text-[12.5px] font-bold rounded-[3px] transition-colors"
              >
                + Yeni İlan Ver
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};