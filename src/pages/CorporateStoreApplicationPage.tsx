import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  FileText,
  BadgeCheck,
  Headphones,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Loader2,
  Check,
  Copy
} from 'lucide-react';
import { useCategories } from '../context/CategoryContext';
import { submitStoreApplication, StoreApplicationFormData } from '../lib/storeApplicationService';
import { LegalAgreementModal } from '../components/LegalAgreementModal';

const TURKISH_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
  'Kocaeli', 'Mersin', 'Kayseri', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli',
  'Şanlıurfa', 'Sakarya', 'Tekirdağ', 'Manisa', 'Balıkesir', 'Trabzon', 'Kahramanmaraş',
  'Aydın', 'Hatay', 'Malatya', 'Çorum', 'Afyonkarahisar', 'Kütahya', 'Sivas', 'Elazığ'
];

export const CorporateStoreApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories } = useCategories();

  // Form State
  const [formData, setFormData] = useState<StoreApplicationFormData>({
    companyName: '',
    legalTitle: '',
    companyType: 'limited',
    taxOffice: '',
    taxNumber: '',
    contactName: '',
    contactTitle: '',
    email: '',
    phone: '',
    landlinePhone: '',
    city: 'İstanbul',
    district: '',
    address: '',
    mainCategory: categories[0]?.id || 'sanayi-imalat-makineleri',
    estimatedMonthlyListings: '10-50',
    preferredPackage: 'gold',
    notes: ''
  });

  const [acceptTerms, setAcceptTerms] = useState<boolean>(true);
  const [acceptKvkk, setAcceptKvkk] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Legal modal state
  const [legalModalOpen, setLegalModalOpen] = useState<boolean>(false);
  const [selectedLegalSlug, setSelectedLegalSlug] = useState<string>('kurumsal-magaza-sozlesmesi');

  const openLegalModal = (slug: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedLegalSlug(slug);
    setLegalModalOpen(true);
  };

  // Success state
  const [submittedApplication, setSubmittedApplication] = useState<{
    applicationNo: string;
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
  } | null>(null);

  const [copiedNo, setCopiedNo] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!acceptTerms || !acceptKvkk) {
      setErrorMessage('Lütfen kurumsal mağaza sözleşmesini ve KVKK aydınlatma metnini onaylayınız.');
      return;
    }

    if (!formData.companyName.trim() || !formData.legalTitle.trim()) {
      setErrorMessage('Lütfen mağaza adınızı ve resmi ticari unvanınızı giriniz.');
      return;
    }

    if (!formData.taxOffice.trim() || !formData.taxNumber.trim()) {
      setErrorMessage('Lütfen vergi dairesi ve vergi kimlik numaranızı eksiksiz giriniz.');
      return;
    }

    if (!formData.contactName.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setErrorMessage('Lütfen yetkili adı, telefon ve e-posta bilgilerini eksiksiz doldurunuz.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitStoreApplication(formData);
      if (res.success) {
        setSubmittedApplication({
          applicationNo: res.applicationNo,
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(res.error || 'Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      setErrorMessage('Beklenmeyen bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyNo = () => {
    if (!submittedApplication?.applicationNo) return;
    navigator.clipboard.writeText(submittedApplication.applicationNo);
    setCopiedNo(true);
    setTimeout(() => setCopiedNo(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f1f4f8] py-4 font-sans text-[#1e293b]">
      <div className="max-w-[1240px] mx-auto px-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-3">
          <Link to="/" className="hover:text-[#ea580c]">
            Ana Sayfa
          </Link>
          <ChevronRight size={12} className="text-[#94a3b8]" />
          <span className="text-[#1e293b] font-bold">Kurumsal Mağaza Başvuru Formu</span>
        </div>

        {/* ================= SUCCESS BANNER / SCREEN ================= */}
        {submittedApplication ? (
          <div className="max-w-[800px] mx-auto bg-white rounded-[4px] border border-[#cbd5e1] shadow-md p-6 sm:p-8 text-center my-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 size={36} strokeWidth={2.4} />
            </div>

            <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-3 py-1 rounded-[2px] mb-2 uppercase tracking-wide">
              Başvurunuz Başarıyla Alındı
            </span>

            <h1 className="text-[22px] sm:text-[26px] font-bold text-[#1e293b] mb-2">
              Kurumsal Mağaza Başvurunuz İncelemeye Alındı!
            </h1>

            <p className="text-[13px] text-[#64748b] max-w-[620px] mx-auto mb-6 leading-relaxed">
              Sayın <strong>{submittedApplication.contactName}</strong>,{' '}
              <strong>{submittedApplication.companyName}</strong> adına oluşturduğunuz mağaza açılış
              başvurusu başarıyla veritabanımıza işlenmiştir. Temsilcimiz bilgilerinizi ve vergi
              levhanızı inceledikten sonra mağaza üyeliğinizi onaylayacaktır.
            </p>

            {/* Tracking Card */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] p-4 max-w-[500px] mx-auto mb-6 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-3">
                <span className="text-[11.5px] font-bold text-[#64748b]">Başvuru Takip Numarası:</span>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-black font-mono text-[#0284c7]">
                    {submittedApplication.applicationNo}
                  </span>
                  <button
                    onClick={handleCopyNo}
                    type="button"
                    className="p-1 text-[#64748b] hover:text-[#0284c7] transition-colors"
                    title="Kopyala"
                  >
                    {copiedNo ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-[11.5px] text-[#475569]">
                <div className="flex justify-between">
                  <span>Başvuru Durumu:</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Temsilci Onayı Bekliyor
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Yetkili İletişim:</span>
                  <span className="font-medium text-[#1e293b]">{submittedApplication.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kayıtlı E-posta:</span>
                  <span className="font-medium text-[#1e293b]">{submittedApplication.email}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[700px] mx-auto text-left mb-6">
              <div className="p-3 bg-[#fafbfc] border border-[#e2e8f0] rounded-[3px]">
                <div className="text-[12px] font-black text-[#ea580c] mb-1">1. İnceleme</div>
                <p className="text-[11px] text-[#64748b] leading-snug">
                  Kurumsal temsilcimiz vergi levhanızı ve şirket bilgilerinizi doğrular.
                </p>
              </div>
              <div className="p-3 bg-[#fafbfc] border border-[#e2e8f0] rounded-[3px]">
                <div className="text-[12px] font-black text-[#0284c7] mb-1">2. Temsilci Araması</div>
                <p className="text-[11px] text-[#64748b] leading-snug">
                  24 saat içinde telefonla aranarak mağaza paketiniz ve şartlarınız netleştirilir.
                </p>
              </div>
              <div className="p-3 bg-[#fafbfc] border border-[#e2e8f0] rounded-[3px]">
                <div className="text-[12px] font-black text-emerald-600 mb-1">3. Mağaza Aktivasyonu</div>
                <p className="text-[11px] text-[#64748b] leading-snug">
                  Onay sonrası kurumsal mağaza paneli şifreniz SMS ve e-posta ile iletilir.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-[12px] px-6 py-2.5 rounded-[3px] transition-colors"
              >
                Ana Sayfaya Dön
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] text-[#334155] font-bold text-[12px] px-5 py-2.5 rounded-[3px] transition-colors"
              >
                Başvuru Özetini Yazdır
              </button>
            </div>
          </div>
        ) : (
          /* ================= MAIN APPLICATION FORM ================= */
          <div className="space-y-4">
            {/* 1. HERO HEADER */}
            <div className="bg-[#19324d] text-white rounded-[4px] border border-[#14283d] p-5 sm:p-7 shadow-sm relative overflow-hidden">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
                <Building2 size={240} strokeWidth={1.2} />
              </div>

              <div className="relative z-10 max-w-[760px]">
                <div className="inline-flex items-center gap-1.5 bg-[#ea580c] text-white text-[10px] font-black px-2 py-0.5 rounded-[2px] uppercase tracking-wider mb-2">
                  <BadgeCheck size={13} />
                  <span>Makinam.com Kurumsal İş Ortaklığı</span>
                </div>
                <h1 className="text-[20px] sm:text-[26px] font-black leading-tight text-white mb-2">
                  Türkiye'nin Makine Pazarında Kurumsal Mağazanızı Açın
                </h1>
                <p className="text-[12.5px] sm:text-[13.5px] text-slate-300 leading-relaxed mb-4">
                  İş makinelerinden CNC tezgahlara, sanayi mutfak ekipmanlarından tekstil ve tarım
                  makinelerine kadar 81 ilde yüz binlerce alıcıya doğrudan ulaşın. Başvurunuz
                  temsilcimiz tarafından incelendikten sonra üyeliğiniz onaylanıp mağazanız aktif
                  edilir.
                </p>

                {/* 4 Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-200">
                    <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                    <span>Makinam Güvende</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-200">
                    <TrendingUp size={14} className="text-amber-400 shrink-0" />
                    <span>Öncelikli Vitrin</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-200">
                    <Building2 size={14} className="text-blue-400 shrink-0" />
                    <span>Özel Mağaza URL'si</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-200">
                    <Headphones size={14} className="text-purple-400 shrink-0" />
                    <span>Özel Portföy Yöneticisi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-[3px] text-[12px] flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM CONTAINER */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SECTION 1: ŞİRKET BİLGİLERİ */}
              <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3.5 border-b border-[#e2e8f0]">
                  <div className="w-6 h-6 rounded-full bg-[#19324d] text-white flex items-center justify-center text-[11px] font-bold">
                    1
                  </div>
                  <h2 className="text-[13px] font-bold text-[#1e293b] uppercase tracking-wide">
                    Firma & Mağaza Bilgileri
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Mağaza / Marka Adı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Örn: Yılmaz Makina Sanayi"
                      className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                    <span className="text-[10px] text-[#94a3b8] mt-0.5 block">
                      İlanlarınızda ve mağaza başlığınızda görünecek tabela adınız.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Resmi Ticari Unvan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="legalTitle"
                      required
                      value={formData.legalTitle}
                      onChange={handleChange}
                      placeholder="Örn: Yılmaz İş Makineleri İth. İhr. San. ve Tic. Ltd. Şti."
                      className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                    <span className="text-[10px] text-[#94a3b8] mt-0.5 block">
                      Vergi levhasında kayıtlı tam tüzel kişi unvanı.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Şirket Türü <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleChange}
                      className="w-full h-[36px] px-2.5 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    >
                      <option value="limited">Limited Şirket (Ltd. Şti.)</option>
                      <option value="anonim">Anonim Şirket (A.Ş.)</option>
                      <option value="sahis">Şahıs Şirketi</option>
                      <option value="diger">Kollektif / Komandit / Diğer</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Vergi Dairesi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="taxOffice"
                        required
                        value={formData.taxOffice}
                        onChange={handleChange}
                        placeholder="Örn: İkitelli"
                        className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        Vergi No / TC <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="taxNumber"
                        required
                        value={formData.taxNumber}
                        onChange={handleChange}
                        placeholder="10 veya 11 hane"
                        className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: YETKİLİ & İLETİŞİM BİLGİLERİ */}
              <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3.5 border-b border-[#e2e8f0]">
                  <div className="w-6 h-6 rounded-full bg-[#19324d] text-white flex items-center justify-center text-[11px] font-bold">
                    2
                  </div>
                  <h2 className="text-[13px] font-bold text-[#1e293b] uppercase tracking-wide">
                    Yetkili Temsilci & İletişim Bilgileri
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Yetkili Adı Soyadı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      required
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Görevi / Unvanı
                    </label>
                    <input
                      type="text"
                      name="contactTitle"
                      value={formData.contactTitle}
                      onChange={handleChange}
                      placeholder="Örn: Şirket Sahibi / Satış Müdürü"
                      className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Yetkili Cep Telefonu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0532 123 45 67"
                      className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                    <span className="text-[10px] text-[#94a3b8] mt-0.5 block">
                      Temsilcimiz onay öncesi bu numara üzerinden teyit araması yapacaktır.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Kurumsal E-posta Adresi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="bilgi@sirketiniz.com"
                      className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                    <span className="text-[10px] text-[#94a3b8] mt-0.5 block">
                      Aktivasyon sonrası mağaza giriş bilgileriniz buraya iletilecektir.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Şirket Sabit Telefonu (Opsiyonel)
                    </label>
                    <input
                      type="tel"
                      name="landlinePhone"
                      value={formData.landlinePhone}
                      onChange={handleChange}
                      placeholder="0212 000 00 00"
                      className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        İl <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full h-[36px] px-2.5 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                      >
                        {TURKISH_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                        İlçe <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="district"
                        required
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="Örn: Başakşehir"
                        className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Şirket Açık Adresi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Sanayi Sitesi, Mahalle, Cadde/Sokak, Kapı No"
                      className="w-full p-2.5 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: FAALİYET & MAĞAZA TERCİHLERİ */}
              <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 mb-3.5 border-b border-[#e2e8f0]">
                  <div className="w-6 h-6 rounded-full bg-[#19324d] text-white flex items-center justify-center text-[11px] font-bold">
                    3
                  </div>
                  <h2 className="text-[13px] font-bold text-[#1e293b] uppercase tracking-wide">
                    Faaliyet Alanı & Mağaza Paketi Tercihi
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Ana Makine Kategoriniz <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="mainCategory"
                      value={formData.mainCategory}
                      onChange={handleChange}
                      className="w-full h-[36px] px-2.5 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                      Tahmini Aylık İlan Sayınız
                    </label>
                    <select
                      name="estimatedMonthlyListings"
                      value={formData.estimatedMonthlyListings}
                      onChange={handleChange}
                      className="w-full h-[36px] px-2.5 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    >
                      <option value="1-10">1 - 10 İlan (Başlangıç)</option>
                      <option value="10-50">10 - 50 İlan (Orta Ölçekli Galeri)</option>
                      <option value="50-100">50 - 100 İlan (Büyük Makine Satıcısı)</option>
                      <option value="100+">100+ İlan (Üretici / Distribütör)</option>
                    </select>
                  </div>
                </div>

                {/* Package Options */}
                <div className="mb-4">
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-2">
                    Tercih Ettiğiniz Mağaza Modeli
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label
                      className={`border rounded-[3px] p-3 cursor-pointer transition-all flex flex-col justify-between ${
                        formData.preferredPackage === 'standart'
                          ? 'border-[#0284c7] bg-[#f0f9ff] ring-1 ring-[#0284c7]'
                          : 'border-[#cbd5e1] bg-[#fafbfc] hover:border-[#94a3b8]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-bold text-[#1e293b]">Standart Mağaza</span>
                          <input
                            type="radio"
                            name="preferredPackage"
                            value="standart"
                            checked={formData.preferredPackage === 'standart'}
                            onChange={handleChange}
                            className="text-[#0284c7]"
                          />
                        </div>
                        <p className="text-[10.5px] text-[#64748b] leading-tight mb-2">
                          Temel kurumsal profil, 25 ilana kadar yayın ve standart listeleme desteği.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-[#0284c7]">Küçük İşletmeler İçin</span>
                    </label>

                    <label
                      className={`border rounded-[3px] p-3 cursor-pointer transition-all flex flex-col justify-between relative ${
                        formData.preferredPackage === 'gold'
                          ? 'border-[#ea580c] bg-orange-50/50 ring-1 ring-[#ea580c]'
                          : 'border-[#cbd5e1] bg-[#fafbfc] hover:border-[#94a3b8]'
                      }`}
                    >
                      <span className="absolute -top-2 right-2 bg-[#ea580c] text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                        EN ÇOK TERCİH EDİLEN
                      </span>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-bold text-[#1e293b]">Gold Mağaza</span>
                          <input
                            type="radio"
                            name="preferredPackage"
                            value="gold"
                            checked={formData.preferredPackage === 'gold'}
                            onChange={handleChange}
                            className="text-[#ea580c]"
                          />
                        </div>
                        <p className="text-[10.5px] text-[#64748b] leading-tight mb-2">
                          100 ilana kadar yayın, aramalarda 3 kat öncelik ve özel portföy yöneticisi.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-[#ea580c]">Makine Galerileri İçin</span>
                    </label>

                    <label
                      className={`border rounded-[3px] p-3 cursor-pointer transition-all flex flex-col justify-between ${
                        formData.preferredPackage === 'platin'
                          ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                          : 'border-[#cbd5e1] bg-[#fafbfc] hover:border-[#94a3b8]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-bold text-[#1e293b]">Platin Mağaza</span>
                          <input
                            type="radio"
                            name="preferredPackage"
                            value="platin"
                            checked={formData.preferredPackage === 'platin'}
                            onChange={handleChange}
                            className="text-purple-600"
                          />
                        </div>
                        <p className="text-[10.5px] text-[#64748b] leading-tight mb-2">
                          Sınırsız ilan, ana sayfa vitrin desteği, API entegrasyonu ve 7/24 VIP temsilci.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700">Üretici & Distribütörler</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                    İlave Talepler veya Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Mevcut makine parkınız, özel entegrasyon veya nakliye talepleriniz varsa belirtebilirsiniz."
                    className="w-full p-2.5 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                  />
                </div>
              </div>

              {/* AGREEMENT & SUBMIT BUTTON */}
              <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-4 sm:p-5 shadow-xs">
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start gap-2 text-[11.5px] text-[#475569]">
                    <input
                      type="checkbox"
                      id="acceptTermsCheckbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 rounded text-[#ea580c] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="acceptTermsCheckbox" className="cursor-pointer select-none">
                      <button
                        type="button"
                        onClick={(e) => openLegalModal('kurumsal-magaza-sozlesmesi', e)}
                        className="text-[#0284c7] hover:text-[#ea580c] font-bold underline hover:no-underline text-left inline mr-1"
                      >
                        Makinam.com Kurumsal Mağaza Açılış Sözleşmesi
                      </button>
                      <span>'ni ve şartlarını okudum, kabul ediyorum.</span>
                    </label>
                  </div>

                  <div className="flex items-start gap-2 text-[11.5px] text-[#475569]">
                    <input
                      type="checkbox"
                      id="acceptKvkkCheckbox"
                      checked={acceptKvkk}
                      onChange={(e) => setAcceptKvkk(e.target.checked)}
                      className="mt-0.5 rounded text-[#ea580c] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="acceptKvkkCheckbox" className="cursor-pointer select-none">
                      <span>Şirket ve yetkili iletişim bilgilerimin doğrulama amacıyla işlenmesine ilişkin </span>
                      <button
                        type="button"
                        onClick={(e) => openLegalModal('kvkk-aydinlatma-metni', e)}
                        className="text-[#0284c7] hover:text-[#ea580c] font-bold underline hover:no-underline text-left inline"
                      >
                        KVKK Aydınlatma Metni
                      </button>
                      <span>'ni onaylıyorum.</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#e2e8f0]">
                  <div className="text-[11px] text-[#64748b] flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>Başvurunuz 256-bit SSL korumalı altyapıyla temsilci havuzuna iletilir.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#ea580c] hover:bg-[#c2410c] disabled:bg-orange-300 text-white font-bold text-[13px] px-8 py-2.5 rounded-[3px] flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Başvuru İletiliyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Başvuruyu Tamamla & Gönder</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Legal Agreement Modal */}
        <LegalAgreementModal
          isOpen={legalModalOpen}
          onClose={() => setLegalModalOpen(false)}
          defaultAgreementSlug={selectedLegalSlug}
          showAcceptButton={true}
          onAccept={() => {
            if (selectedLegalSlug === 'kurumsal-magaza-sozlesmesi') {
              setAcceptTerms(true);
            } else if (selectedLegalSlug === 'kvkk-aydinlatma-metni') {
              setAcceptKvkk(true);
            }
          }}
        />
      </div>
    </div>
  );
};
