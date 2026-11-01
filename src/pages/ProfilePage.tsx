import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ChevronRight,
  Landmark,
  FileText,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { detectTurkishBankFromIBAN, formatTurkishIBAN, TURKISH_BANKS } from '../utils/iban';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const TURKISH_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale',
  'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum',
  'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin',
  'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli',
  'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas',
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak',
  'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan',
  'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

export const ProfilePage: React.FC = () => {
  useDocumentTitle('Hesap ve Profil Ayarları | makinam.com');
  const navigate = useNavigate();
  const { user, userProfile, updateUserProfile } = useAuth();

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [accountType, setAccountType] = useState<'bireysel' | 'kurumsal'>('bireysel');
  const [companyName, setCompanyName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [taxOffice, setTaxOffice] = useState('');

  // IBAN & Bank states
  const [iban, setIban] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);

  // Initialize from user / userProfile
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || user?.displayName || '');
      setEmail(userProfile.email || user?.email || '');
      setPhone(userProfile.phoneNumber || '');
      setCity(userProfile.city || '');
      setDistrict(userProfile.district || '');
      setAddress(userProfile.address || '');
      setAccountType(userProfile.accountType || 'bireysel');
      setCompanyName(userProfile.companyName || '');
      setTaxNumber(userProfile.taxNumber || '');
      setTaxOffice(userProfile.taxOffice || '');
      setIban(userProfile.iban || '');
      setAccountHolder(userProfile.accountHolder || userProfile.displayName || user?.displayName || '');
    } else if (user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || '');
      setEmail(user.email || '');
      setAccountHolder(user.displayName || '');
    }
  }, [user, userProfile]);

  // IBAN detection result
  const ibanDetection = detectTurkishBankFromIBAN(iban);

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTurkishIBAN(e.target.value);
    setIban(formatted);
  };

  const handleCopyIban = () => {
    if (!iban) return;
    navigator.clipboard?.writeText(iban);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        phoneNumber: phone.trim(),
        city: city.trim(),
        district: district.trim(),
        address: address.trim(),
        accountType,
        companyName: accountType === 'kurumsal' ? companyName.trim() : '',
        taxNumber: accountType === 'kurumsal' ? taxNumber.trim() : '',
        taxOffice: accountType === 'kurumsal' ? taxOffice.trim() : '',
        iban: iban.trim(),
        bankName: ibanDetection.bank ? ibanDetection.bank.name : '',
        bankCode: ibanDetection.bankCode || '',
        accountHolder: accountHolder.trim()
      });

      setSuccessMessage('Banka, IBAN ve profil bilgileriniz veritabanına başarıyla kaydedildi.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Kaydetme hatası:', err);
      setErrorMessage('Profil veritabanına kaydedilirken bir hata oluştu: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-3 py-6 font-sans">
      {/* 1. BREADCRUMBS */}
      <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-4">
        <Link to="/" className="hover:text-[#ea580c]">Ana Sayfa</Link>
        <ChevronRight size={12} />
        <span className="text-[#334155] font-semibold">Bana Özel</span>
        <ChevronRight size={12} />
        <span className="text-[#ea580c] font-bold">Hesap ve Profil Ayarları</span>
      </div>

      {/* 2. PAGE HEADER */}
      <div className="bg-white border border-[#e2e8f0] rounded-[4px] p-5 mb-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

        <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-[3px] font-medium">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>E-posta Doğrulanmış Hesap</span>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-[4px] text-[12.5px] font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-[4px] text-[12.5px] font-medium flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. MAIN FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: PERSONAL & CONTACT INFORMATION */}
        <div className="bg-white border border-[#e2e8f0] rounded-[4px] p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#f1f5f9]">
            <User size={17} className="text-[#ea580c]" />
            <h2 className="text-[14px] font-bold text-[#1e293b]">
              Kişisel ve İletişim Bilgileri
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#334155] mb-1">
                Ad Soyad *
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#334155] mb-1">
                E-posta Adresi (Değiştirilemez)
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full h-[38px] pl-3 pr-8 text-[12.5px] border border-[#cbd5e1] rounded-[4px] bg-gray-100 text-[#64748b] cursor-not-allowed"
                />
                <Lock size={13} className="absolute right-3 top-3 text-[#94a3b8]" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#334155] mb-1">
                Cep Telefonu Numarası *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xx xxx xx xx"
                className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
              />
              <span className="text-[10px] text-[#64748b] mt-0.5 block">
                İlanlarınızda ve güvenli alım-satım bilgilendirmelerinde kullanılır.
              </span>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#334155] mb-1">
                Hesap Türü
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('bireysel')}
                  className={`h-[38px] rounded-[4px] border text-[12px] font-bold transition-all ${
                    accountType === 'bireysel'
                      ? 'border-[#ea580c] bg-orange-50/50 text-[#ea580c]'
                      : 'border-[#cbd5e1] text-[#64748b]'
                  }`}
                >
                  Bireysel Üyelik
                </button>
                {accountType === 'kurumsal' ? (
                  <div className="h-[38px] rounded-[4px] border border-emerald-300 bg-emerald-50 text-emerald-800 text-[12px] font-bold flex items-center justify-center gap-1.5">
                    <Building2 size={14} className="text-emerald-600" />
                    <span>Kurumsal Mağaza (Aktif)</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/kurumsal-magaza-ac')}
                    className="h-[38px] rounded-[4px] border border-[#cbd5e1] hover:border-[#ea580c] hover:bg-orange-50/50 text-[#64748b] hover:text-[#ea580c] text-[12px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Building2 size={14} className="text-[#ea580c]" />
                    <span>Kurumsal Mağaza Açılış Başvurusu »</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ADDRESS INFORMATION */}
        <div className="bg-white border border-[#e2e8f0] rounded-[4px] p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#f1f5f9]">
            <MapPin size={17} className="text-[#ea580c]" />
            <h2 className="text-[14px] font-bold text-[#1e293b]">
              Adres ve Konum Bilgileri
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[12px] font-bold text-[#334155] mb-1">
                Bulunduğunuz İl *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-white"
              >
                <option value="">İl Seçiniz</option>
                {TURKISH_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#334155] mb-1">
                İlçe / Sanayi Bölgesi *
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Örn: İkitelli OSB, Nilüfer, Torbalı"
                className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#334155] mb-1">
              Açık Adres (Lojistik, Makine Teslimatı ve Fatura İçin)
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Mahalle, Cadde, Sokak, No, Dükkan / Fabrika Bilgisi..."
              className="w-full p-3 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
            />
          </div>
        </div>

        {/* SECTION 3: BANK & IBAN DETAILS (WITH REAL-TIME BANK DETECTION) */}
        <div className="bg-white border-2 border-orange-200/80 rounded-[4px] p-5 shadow-xs relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#ea580c]"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#f1f5f9] gap-2">
            <div className="flex items-center gap-2">
              <Landmark size={18} className="text-[#ea580c]" />
              <h2 className="text-[14px] font-bold text-[#1e293b]">
                Banka ve IBAN Bilgileri (Makinam Güvende Havuz Hesabı)
              </h2>
            </div>

            <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-[3px] border border-emerald-200 flex items-center gap-1.5 self-start">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>7/24 FAST & Havale Destekli</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* IBAN Input with Real-time Detection */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[12px] font-bold text-[#334155]">
                  IBAN Numarası *
                </label>
                <span className="text-[11px] font-mono text-[#64748b]">
                  {iban.replace(/\s/g, '').length}/26 karakter
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={iban}
                  onChange={handleIbanChange}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  maxLength={32}
                  className="w-full h-[42px] pl-3.5 pr-28 text-[14px] font-mono font-bold tracking-wide border-2 border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc] text-[#1e293b]"
                />
                
                <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
                  {iban && (
                    <button
                      type="button"
                      onClick={() => setIban('')}
                      className="px-2 py-1 text-[11px] font-semibold text-gray-500 hover:text-red-600 bg-white border border-[#cbd5e1] rounded-[3px] transition-colors"
                      title="IBAN Alanını Temizle"
                    >
                      Temizle
                    </button>
                  )}

                  {/* Copy button */}
                  <button
                    type="button"
                    onClick={handleCopyIban}
                    className="px-2 py-1 text-[11px] font-semibold text-[#475569] hover:text-[#1e293b] bg-white border border-[#cbd5e1] rounded-[3px] flex items-center gap-1 transition-colors"
                  >
                    {copiedIban ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-600">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* REAL-TIME BANK DETECTION INFO */}
              <div className="mt-2 min-h-[26px] flex items-center">
                {ibanDetection.bank ? (
                  <div className="flex items-center gap-2 text-[12px] text-[#1e293b] font-medium animate-in fade-in">
                    <span className="text-[#64748b]">Banka:</span>
                    <span className="font-bold text-[#0f172a]">{ibanDetection.bank.name}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-[2px]">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span>Tespit Edildi</span>
                    </span>
                  </div>
                ) : iban.replace(/\s/g, '').length >= 9 ? (
                  /* Unknown Bank */
                  <div className="flex items-center gap-1.5 text-[11.5px] text-amber-700">
                    <AlertCircle size={14} className="shrink-0 text-amber-600" />
                    <span>
                      Banka kodu tespit edilemedi ({ibanDetection.bankCode}). Lütfen IBAN'ı kontrol ediniz.
                    </span>
                  </div>
                ) : (
                  /* Prompt */
                  <div className="text-[11px] text-[#64748b] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]"></span>
                    <span>
                      IBAN girildiğinde ait olduğu banka otomatik tespit edilir.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-[12px] font-bold text-[#334155] mb-1">
                Hesap Sahibi Ad Soyad / Şirket Unvanı *
              </label>
              <input
                type="text"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Banka hesabında kayıtlı adınız"
                className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
              />
              <span className="text-[10.5px] text-[#64748b] mt-0.5 block">
                Yasal güvenlik gereği, banka hesap sahibi ile Makinam.com üye adı aynı olmalıdır.
              </span>
            </div>

            {/* Security Disclosure */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-[4px] text-[11.5px] text-blue-900 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong>Makinam Güvende Ödeme Koruması:</strong> Makine alım-satım işlemlerinde alıcının ödediği para Makinam.com güvenceli havuz hesabında bloke edilir. Makine alıcı tarafından teslim alınıp ekspertiz onayı verildiğinde satış bedeli <strong>kesintisiz olarak yukarıdaki IBAN adresinize aktarılır.</strong>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: CORPORATE / STORE DETAILS (IF KURUMSAL) */}
        {accountType === 'kurumsal' && (
          <div className="bg-white border border-[#e2e8f0] rounded-[4px] p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#f1f5f9]">
              <Building2 size={17} className="text-[#ea580c]" />
              <h2 className="text-[14px] font-bold text-[#1e293b]">
                Kurumsal Mağaza ve Fatura Bilgileri
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-[12px] font-bold text-[#334155] mb-1">
                  Resmi Şirket Unvanı *
                </label>
                <input
                  type="text"
                  required={accountType === 'kurumsal'}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Örn: ABC Makina Sanayi ve Ticaret Anonim Şirketi"
                  className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">
                  Vergi Dairesi *
                </label>
                <input
                  type="text"
                  required={accountType === 'kurumsal'}
                  value={taxOffice}
                  onChange={(e) => setTaxOffice(e.target.value)}
                  placeholder="Örn: Maslak V.D."
                  className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[12px] font-bold text-[#334155] mb-1">
                  Vergi Numarası / TCKN *
                </label>
                <input
                  type="text"
                  required={accountType === 'kurumsal'}
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  placeholder="10 Haneli Vergi No veya 11 Haneli TCKN"
                  maxLength={11}
                  className="w-full h-[38px] px-3 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/hesabim/ilanlarim"
            className="h-[42px] px-5 border border-[#cbd5e1] hover:bg-gray-100 rounded-[4px] text-[13px] font-bold text-[#475569] transition-colors flex items-center"
          >
            Vazgeç
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="h-[42px] px-7 bg-[#ea580c] hover:bg-[#d94e08] active:bg-[#c2410c] text-white text-[13px] font-bold rounded-[4px] transition-colors shadow-xs flex items-center gap-2"
          >
            <Save size={16} />
            <span>{loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};