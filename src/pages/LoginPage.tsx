import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  PhoneCall, 
  HelpCircle, 
  ShieldCheck, 
  ArrowLeft,
  ArrowRight,
  Wrench,
  Check,
  Building2,
  User as UserIcon,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  const { login, register, loginWithGoogle, resetPassword, getFriendlyErrorMessage } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [accountType, setAccountType] = useState<'bireysel' | 'kurumsal'>('bireysel');

  useDocumentTitle(
    mode === 'register'
      ? 'Hesap Aç & Kayıt Ol | makinam.com'
      : mode === 'forgot'
      ? 'Şifremi Unuttum | makinam.com'
      : 'Giriş Yap | makinam.com'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!acceptTerms) {
      setErrorMessage('Lütfen üyelik sözleşmesini ve KVKK aydınlatma metnini onaylayınız.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      await register(
        email,
        password,
        displayName,
        accountType,
        phone,
        accountType === 'kurumsal' ? companyName : undefined
      );
      navigate('/');
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(getFriendlyErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Lütfen e-posta adresinizi giriniz.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccessMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.');
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col justify-between font-sans text-[#1e293b]">
      {/* 1. TOP HEADER - Makinam.com Brand Navigation */}
      <header className="bg-[#19324d] border-b border-[#122438] py-3.5 px-4">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center group select-none">
            <div className="flex flex-col">
              <div className="text-[21px] font-black tracking-tight leading-none text-white">
                makinam<span className="text-[#ea580c]">.com</span>
              </div>
              <span className="text-[8.5px] font-bold text-[#94a3b8] tracking-widest uppercase mt-0.5">
                TÜRKİYE'NİN MAKİNE PAZARI
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="text-[12px] text-[#cbd5e1] hover:text-white flex items-center gap-1.5 transition-colors font-medium bg-[#214266] px-3 py-1.5 rounded-[3px] border border-[#2b517d]"
          >
            <ArrowLeft size={14} />
            <span>Pazaryerine Dön</span>
          </Link>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 py-8 md:py-12 flex flex-col justify-center">
        <div className="bg-white border border-[#e2e8f0] rounded-[6px] shadow-[0_2px_8px_rgba(15,23,42,0.06)] overflow-hidden">
          
          {/* Card Header Tabs */}
          <div className="border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between px-6 pt-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  handleResetMessages();
                }}
                className={`pb-3 px-3 text-[14px] font-bold border-b-2 transition-all ${
                  mode === 'login'
                    ? 'border-[#ea580c] text-[#ea580c]'
                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  handleResetMessages();
                }}
                className={`pb-3 px-3 text-[14px] font-bold border-b-2 transition-all ${
                  mode === 'register'
                    ? 'border-[#ea580c] text-[#ea580c]'
                    : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                Ücretsiz Hesap Aç
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#64748b] font-medium pb-3">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>256-Bit SSL Güvenli Giriş</span>
            </div>
          </div>

          {/* Card Body - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 p-6 md:p-8 gap-8">
            
            {/* LEFT COLUMN: FORM */}
            <div className="lg:col-span-7">
              {/* Alert Messages */}
              {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-[4px] flex items-center gap-2.5 text-[12px] font-medium">
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-[4px] flex items-center gap-2.5 text-[12px] font-medium">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Quick Google Sign In */}
              {mode !== 'forgot' && (
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full h-[40px] bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] active:bg-[#f1f5f9] rounded-[4px] text-[12.5px] font-semibold text-[#334155] flex items-center justify-center gap-2.5 transition-colors shadow-2xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Google ile Hızlı Devam Et</span>
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#e2e8f0]"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
                      <span className="bg-white px-2.5">veya e-posta ile</span>
                    </div>
                  </div>
                </div>
              )}

              {/* --- LOGIN FORM --- */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">
                      E-posta Adresi
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adiniz@sirketiniz.com"
                      className="w-full h-[40px] px-3.5 text-[13px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all bg-[#fafbfc]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[12px] font-bold text-[#334155]">
                        Şifre
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          handleResetMessages();
                        }}
                        className="text-[11.5px] text-[#ea580c] hover:underline font-semibold"
                      >
                        Şifremi unuttum?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-[40px] pl-3.5 pr-10 text-[13px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all bg-[#fafbfc]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[#94a3b8] hover:text-[#64748b]"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#475569]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-[#ea580c] rounded border-[#cbd5e1] focus:ring-[#ea580c]"
                      />
                      <span>Oturum açık kalsın</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[42px] bg-[#ea580c] hover:bg-[#d94e08] active:bg-[#c2410c] text-white font-bold text-[13.5px] rounded-[4px] transition-colors shadow-xs flex items-center justify-center"
                  >
                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                  </button>

                  <div className="pt-3 text-center text-[12px] text-[#64748b]">
                    Hesabınız yok mu?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        handleResetMessages();
                      }}
                      className="text-[#ea580c] font-bold hover:underline"
                    >
                      Hemen Ücretsiz Hesap Açın
                    </button>
                  </div>
                </form>
              )}

              {/* --- REGISTER FORM --- */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Account Type Selection */}
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#64748b] mb-1.5 uppercase tracking-wide">
                      Hesap Türü Seçin
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAccountType('bireysel')}
                        className={`p-2.5 rounded-[4px] border text-left flex items-center gap-2.5 transition-all ${
                          accountType === 'bireysel'
                            ? 'border-[#ea580c] bg-orange-50/50 text-[#1e293b] ring-1 ring-[#ea580c]'
                            : 'border-[#cbd5e1] hover:bg-[#f8fafc] text-[#64748b]'
                        }`}
                      >
                        <UserIcon size={16} className={accountType === 'bireysel' ? 'text-[#ea580c]' : 'text-[#94a3b8]'} />
                        <div>
                          <div className="text-[12px] font-bold">Bireysel Üyelik</div>
                          <div className="text-[10px] text-[#64748b]">Kendi makinesini alan veya satanlar</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/kurumsal-magaza-ac')}
                        className="p-2.5 rounded-[4px] border border-[#cbd5e1] hover:border-[#ea580c] hover:bg-orange-50/40 text-left flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 size={16} className="text-[#ea580c] group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="text-[12px] font-bold text-[#1e293b] group-hover:text-[#ea580c]">Kurumsal Mağaza Aç »</div>
                            <div className="text-[10px] text-[#64748b]">Firma & bayi açılış formu için tıklayın</div>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[#ea580c]" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-bold text-[#334155] mb-1">
                        {accountType === 'kurumsal' ? 'Yetkili Adı Soyadı *' : 'Ad Soyad *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Adınız Soyadınız"
                        className="w-full h-[38px] px-3.5 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
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
                        placeholder="0532 000 00 00"
                        className="w-full h-[38px] px-3.5 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">
                      E-posta Adresi *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adiniz@ornek.com"
                      className="w-full h-[38px] px-3.5 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">
                      Şifre Belirleyin * (En az 6 karakter)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-[38px] pl-3.5 pr-10 text-[12.5px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#94a3b8] hover:text-[#64748b]"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer text-[11.5px] text-[#475569] pt-1">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#ea580c] rounded border-[#cbd5e1] focus:ring-[#ea580c]"
                    />
                    <span>
                      <Link to="/sozlesmeler/uyelik-sozlesmesi" target="_blank" className="text-[#ea580c] font-semibold hover:underline">Makinam.com Üyelik Sözleşmesi</Link> ve{' '}
                      <Link to="/sozlesmeler/kvkk-aydinlatma-metni" target="_blank" className="text-[#ea580c] font-semibold hover:underline">KVKK Aydınlatma Metni</Link>'ni okudum, kabul ediyorum.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[42px] bg-[#ea580c] hover:bg-[#d94e08] text-white font-bold text-[13.5px] rounded-[4px] transition-colors shadow-xs mt-2"
                  >
                    {loading ? 'Hesap Açılıyor...' : 'Hesap Aç'}
                  </button>

                  <div className="pt-2 text-center text-[12px] text-[#64748b]">
                    Zaten bir hesabınız var mı?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        handleResetMessages();
                      }}
                      className="text-[#ea580c] font-bold hover:underline"
                    >
                      Giriş Yapın
                    </button>
                  </div>
                </form>
              )}

              {/* --- FORGOT PASSWORD FORM --- */}
              {mode === 'forgot' && (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-[4px] text-[12px] text-blue-800 leading-relaxed">
                    Kayıtlı e-posta adresinizi girdiğinizde, size şifrenizi güvenle yenilemeniz için bir doğrulama bağlantısı ileteceğiz.
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#334155] mb-1">
                      Kayıtlı E-posta Adresi
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adiniz@ornek.com"
                      className="w-full h-[40px] px-3.5 text-[13px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[42px] bg-[#ea580c] hover:bg-[#d94e08] text-white font-bold text-[13.5px] rounded-[4px] transition-colors"
                  >
                    {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        handleResetMessages();
                      }}
                      className="text-[12px] text-[#ea580c] font-bold hover:underline"
                    >
                      « Giriş Yap Ekranına Dön
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* RIGHT COLUMN: MAKINAM.COM PORTAL AVANTAJLARI & QR SYNC */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-6">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#e2e8f0]">
                  <Wrench size={18} className="text-[#ea580c]" />
                  <h3 className="text-[14px] font-bold text-[#1e293b]">
                    Makinam.com ile Neler Yapabilirsiniz?
                  </h3>
                </div>

                <ul className="space-y-3.5 text-[12px] text-[#475569]">
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <strong className="text-[#1e293b] block">280.000+ Makine İlanı</strong>
                      Tost makinesinden ekskavatöre, tekstil dikiş otomatlarından CNC tezgahlara kadar tüm makineler.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <strong className="text-[#1e293b] block">Makinam Güvende Koruması</strong>
                      Havuz hesap sistemiyle güvenli ödeme ve ekspertiz onaylı teslimat.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <strong className="text-[#1e293b] block">Ücretsiz İlan Yayınlama</strong>
                      Bireysel kullanıcılar için ücretsiz ve anında vitrinde yayınlama avantajı.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <strong className="text-[#1e293b] block">Kurumsal Mağaza Portalı</strong>
                      Üreticiler ve bayiler için toplu ilan yönetimi, faturalandırma ve mağaza sayfası.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Mobile QR Login Box */}
              <div className="mt-6 pt-5 border-t border-[#e2e8f0] bg-white p-4 rounded-[4px] border border-[#cbd5e1] flex items-center gap-3.5">
                <div className="p-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded shrink-0">
                  <svg className="w-[62px] h-[62px]" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" />
                    <rect x="5" y="5" width="28" height="28" fill="#19324d" />
                    <rect x="9" y="9" width="20" height="20" fill="white" />
                    <rect x="13" y="13" width="12" height="12" fill="#ea580c" />
                    <rect x="67" y="5" width="28" height="28" fill="#19324d" />
                    <rect x="71" y="9" width="20" height="20" fill="white" />
                    <rect x="75" y="13" width="12" height="12" fill="#ea580c" />
                    <rect x="5" y="67" width="28" height="28" fill="#19324d" />
                    <rect x="9" y="71" width="20" height="20" fill="white" />
                    <rect x="13" y="75" width="12" height="12" fill="#ea580c" />
                    <rect x="38" y="10" width="6" height="6" fill="#19324d" />
                    <rect x="48" y="10" width="6" height="6" fill="#19324d" />
                    <rect x="42" y="22" width="6" height="6" fill="#19324d" />
                    <rect x="12" y="45" width="6" height="6" fill="#19324d" />
                    <rect x="25" y="45" width="6" height="6" fill="#19324d" />
                    <rect x="40" y="42" width="6" height="6" fill="#19324d" />
                    <rect x="52" y="42" width="6" height="6" fill="#19324d" />
                    <rect x="68" y="45" width="6" height="6" fill="#19324d" />
                    <rect x="80" y="45" width="6" height="6" fill="#19324d" />
                    <rect x="45" y="65" width="8" height="8" fill="#19324d" />
                    <rect x="65" y="65" width="8" height="8" fill="#19324d" />
                    <rect x="80" y="75" width="10" height="10" fill="#19324d" />
                  </svg>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#1e293b] flex items-center gap-1.5">
                    <QrCode size={14} className="text-[#ea580c]" />
                    <span>Makinam Mobil Giriş</span>
                  </div>
                  <p className="text-[10.5px] text-[#64748b] leading-tight mt-0.5">
                    Mobil uygulamamızdan kameranızla QR kodu taratarak tek dokunuşla giriş yapabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* 3. FOOTER - Makinam.com Identity */}
      <footer className="border-t border-[#e2e8f0] bg-white py-6 text-[11px] text-[#64748b]">
        <div className="max-w-[1000px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-[#f1f5f9]">
            {/* Call Center */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#19324d] text-white flex items-center justify-center shrink-0">
                <PhoneCall size={13} className="text-[#ea580c]" />
              </div>
              <div>
                <div className="text-[9.5px] text-[#94a3b8] font-bold uppercase tracking-wider">Müşteri Destek Hattı</div>
                <div className="text-[12.5px] font-bold text-[#1e293b]">0850 123 45 67</div>
              </div>
            </div>

            {/* Help / Support Email */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#19324d] text-white flex items-center justify-center shrink-0">
                <HelpCircle size={13} className="text-[#ea580c]" />
              </div>
              <div>
                <div className="text-[9.5px] text-[#94a3b8] font-bold uppercase tracking-wider">Yardım & Destek</div>
                <div className="text-[12px] font-bold text-[#ea580c]">destek@makinam.com</div>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-3 text-[11px] text-[#64748b]">
              <Link to="/sozlesmeler/uyelik-sozlesmesi" className="hover:text-[#1e293b] hover:underline">Kullanıcı Sözleşmesi</Link>
              <span>•</span>
              <Link to="/sozlesmeler/kvkk-aydinlatma-metni" className="hover:text-[#1e293b] hover:underline">KVKK Politikası</Link>
              <span>•</span>
              <Link to="/makinam-guvende" className="hover:text-[#1e293b] hover:underline">Güvenli Ticaret</Link>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px] text-[#94a3b8]">
            <div>Makinam.com Elektronik Hizmetler ve Ticaret A.Ş. Tüm hakları saklıdır.</div>
            <div>ETBİS'e Kayıtlı Güvenli Pazar Yeri • 2026</div>
          </div>
        </div>
      </footer>
    </div>
  );
};