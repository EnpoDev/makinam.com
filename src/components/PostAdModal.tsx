import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Upload, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCategories } from '../context/CategoryContext';
import { Listing } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddListing: (newListing: Listing) => void;
}

export const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  onAddListing
}) => {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { user, userProfile } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'gida-endustriyel-mutfak',
    subCategory: 'sanayi-tost-makineleri',
    brand: '',
    model: '',
    year: '2023',
    hours: '100',
    price: '',
    currency: 'TL' as 'TL' | 'EUR' | 'USD',
    city: 'İstanbul',
    district: 'Kadıköy',
    sellerName: 'Ahmet Yılmaz',
    sellerType: 'Sahibinden' as 'Sahibinden' | 'Galeriden' | 'Yetkili Bayi',
    phone: '0 (532) 000 00 00',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
    isGuvende: true
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user || userProfile) {
      setFormData((prev) => ({
        ...prev,
        sellerName: userProfile?.companyName || userProfile?.displayName || user?.displayName || prev.sellerName,
        phone: userProfile?.phoneNumber || prev.phone,
        sellerType: userProfile?.accountType === 'kurumsal' ? 'Galeriden' : 'Sahibinden'
      }));
    }
  }, [user, userProfile, isOpen]);

  if (!isOpen) return null;

  const selectedCategoryObj = categories.find((c) => c.id === formData.category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.brand || !formData.price) {
      alert('Lütfen zorunlu alanları (Başlık, Marka, Fiyat) doldurunuz.');
      return;
    }

    const randomAdNo = `1098${Math.floor(Math.random() * 900000 + 100000)}`;

    const newAd: Listing = {
      id: `mak-${Date.now().toString().slice(-4)}`,
      adNo: randomAdNo,
      userId: user?.uid,
      status: 'active',
      viewsCount: 1,
      title: formData.title,
      category: formData.category,
      subCategory: formData.subCategory,
      brand: formData.brand,
      model: formData.model || formData.brand,
      year: parseInt(formData.year) || 2023,
      hours: parseInt(formData.hours) || 0,
      price: parseInt(formData.price) || 0,
      currency: formData.currency,
      city: formData.city,
      district: formData.district,
      date: 'Yeni İlan',
      images: [
        formData.imageUrl ||
          'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80'
      ],
      seller: {
        name: formData.sellerName,
        type: formData.sellerType,
        memberSince: 'Yeni Üye',
        phone: formData.phone
      },
      features: [
        { label: 'İlan No', value: `1098${Math.floor(Math.random() * 900000 + 100000)}` },
        { label: 'İlan Tarihi', value: 'Bugün' },
        { label: 'Marka', value: formData.brand },
        { label: 'Model', value: formData.model || formData.brand },
        { label: 'Üretim Yılı', value: formData.year },
        { label: 'Kimden', value: formData.sellerType },
        { label: 'Durumu', value: 'Çalışır / Temiz' }
      ],
      description: formData.description || 'Detaylı bilgi için arayınız.',
      isVitrin: true,
      isGuvende: formData.isGuvende
    };

    onAddListing(newAd);
    onClose();
    navigate(`/ilan/${newAd.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-2xl rounded-[3px] shadow-xl overflow-hidden border border-[#cbd5e1] my-6">
        {/* Modal Header */}
        <div className="bg-[#19324d] text-white px-4 py-3 flex items-center justify-between border-b border-[#122438]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[2px] bg-[#ea580c] text-white font-black text-xs flex items-center justify-center">
              M
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[14px]">makinam.com</span>
              <span className="text-[#94a3b8] text-xs">|</span>
              <h2 className="text-[12px] font-medium text-[#cbd5e1]">Ücretsiz Makine İlanı Ver</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps Breadcrumb */}
        <div className="bg-[#f8fafc] px-4 py-2 border-b border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">
          <span className={step >= 1 ? 'font-bold text-[#0284c7]' : ''}>
            1. Kategori & Makine Özellikleri
          </span>
          <span>»</span>
          <span className={step >= 2 ? 'font-bold text-[#0284c7]' : ''}>
            2. Fiyat, Konum & Satıcı Bilgileri
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-[12px]">
          {step === 1 ? (
            <div className="space-y-3">
              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Ana Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const catObj = categories.find((c) => c.id === newCat);
                      setFormData({
                        ...formData,
                        category: newCat,
                        subCategory: catObj ? catObj.subcategories[0].id : ''
                      });
                    }}
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2 bg-white focus:outline-none focus:border-[#ea580c]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Alt Kategori *
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, subCategory: e.target.value })
                    }
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2 bg-white focus:outline-none focus:border-[#ea580c]"
                  >
                    {selectedCategoryObj?.subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  İlan Başlığı * (Örn: ÖZTİRYAKİLER 20 DİLİM DÖKÜM TOST MAKİNESİ / CAT 320 / JUKI DÜZ)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Makinenizin modelini ve durumunu içeren net bir başlık yazın"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2.5 focus:outline-none focus:border-[#ea580c]"
                />
              </div>

              {/* Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Marka *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Öztiryakiler, Tefal, Hidromek, Mazak, Juki, Kärcher"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2.5 focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: 20 Dilim Döküm, OptiGrill, 102B Alpha, QT 250"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2.5 focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
              </div>

              {/* Year & Working Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Üretim Yılı
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2.5 focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Çalışma Saati / Kullanım Durumu
                  </label>
                  <input
                    type="number"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2.5 focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.title || !formData.brand) {
                      alert('Lütfen başlık ve marka alanlarını doldurunuz.');
                      return;
                    }
                    setStep(2);
                  }}
                  className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-5 py-2 rounded-[2px] text-[11px] font-bold"
                >
                  Devam Et »
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Price & Currency */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Fiyat *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Örn: 14500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2.5 focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Para Birimi
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: e.target.value as 'TL' | 'EUR' | 'USD'
                      })
                    }
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2 bg-white focus:outline-none focus:border-[#ea580c]"
                  >
                    <option value="TL">TL</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* City & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    İl
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2.5 focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    İlçe
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2.5 focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
              </div>

              {/* Seller & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Kimden
                  </label>
                  <select
                    value={formData.sellerType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sellerType: e.target.value as any
                      })
                    }
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2 bg-white"
                  >
                    <option value="Sahibinden">Sahibinden</option>
                    <option value="Galeriden">Galeriden / Mağaza</option>
                    <option value="Yetkili Bayi">Yetkili Bayi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Ad Soyad / Firma
                  </label>
                  <input
                    type="text"
                    value={formData.sellerName}
                    onChange={(e) =>
                      setFormData({ ...formData, sellerName: e.target.value })
                    }
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Telefon No
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full h-[32px] text-[11px] border border-[#cbd5e1] rounded-[2px] px-2.5"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  İlan Açıklaması
                </label>
                <textarea
                  rows={3}
                  placeholder="Makinenin bakım geçmişi, donanımları, aksesuarları ve takas durumu hakkında bilgi veriniz..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full text-[11px] border border-[#cbd5e1] rounded-[2px] p-2 focus:outline-none focus:border-[#ea580c]"
                ></textarea>
              </div>

              {/* Makinam Güvende Güvenli Satış Seçeneği */}
              <div className={`p-2.5 rounded-[3px] border transition-all ${
                formData.isGuvende
                  ? 'bg-orange-50/70 border-[#ea580c]'
                  : 'bg-[#f8fafc] border-[#cbd5e1]'
              }`}>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isGuvende}
                    onChange={(e) =>
                      setFormData({ ...formData, isGuvende: e.target.checked })
                    }
                    className="w-4 h-4 mt-0.5 text-[#ea580c] rounded focus:ring-orange-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[11.5px] text-[#1e293b] flex items-center gap-1">
                      <ShieldCheck size={14} className="text-[#ea580c]" />
                      Bu İlanda "Makinam Güvende" Kullanmak İstiyorum
                    </span>
                    <p className="text-[10px] text-[#64748b] mt-0.5">
                      Alıcının parası resmi havuz hesapta bloke edilir, teslimatta kesintisiz IBAN'ınıza aktarılır.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] text-[#0284c7] hover:underline"
                >
                  « Geri Dön
                </button>
                <button
                  type="submit"
                  className="bg-[#16a34a] hover:bg-[#15803d] text-white px-6 py-2 rounded-[2px] text-[11px] font-bold shadow-xs"
                >
                  İlanı Yayına Al
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
