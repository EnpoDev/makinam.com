import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  Sparkles,
  Plus,
  ChevronDown,
  Check,
  Lock,
  User as UserIcon,
  Mail,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  DollarSign,
  TrendingUp,
  Receipt,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface Organization {
  id: string;
  name: string;
  taxNumber: string;
  taxOffice: string;
  role: 'owner' | 'admin' | 'billing_manager';
  plan: 'pro' | 'enterprise' | 'starter';
  planStatus: 'active' | 'past_due' | 'trial';
  renewalDate: string;
  monthlyFee: number;
  remainingListings: number;
  totalListingsQuota: number;
  remainingShowcases: number;
  totalShowcasesQuota: number;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

export const SaasPage: React.FC = () => {
  useDocumentTitle('Makinam SaaS | Kurumsal Faturalama ve Organizasyon Yönetimi');

  const { user, userProfile, login, register, loginWithGoogle, getFriendlyErrorMessage, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Authentication sub-view state (when not logged in)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // SaaS Portal State (when logged in)
  const [activeTab, setActiveTab] = useState<'billing' | 'plans' | 'invoices' | 'organization'>('billing');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mock initial organization matching user profile
  const userOrgName = userProfile?.companyName || (user?.displayName ? `${user.displayName} İş Ortaklığı` : 'Makinam Kurumsal Mağaza');
  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: 'org_primary',
      name: userOrgName,
      taxNumber: userProfile?.taxNumber || '1029384756',
      taxOffice: userProfile?.taxOffice || 'Anadolu Kurumlar V.D.',
      role: 'owner',
      plan: 'pro',
      planStatus: 'active',
      renewalDate: '15.12.2026',
      monthlyFee: 2450,
      remainingListings: 38,
      totalListingsQuota: 50,
      remainingShowcases: 3,
      totalShowcasesQuota: 5
    }
  ]);

  const [selectedOrgId, setSelectedOrgId] = useState<string>('org_primary');
  const activeOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0];

  // Invoices mock
  const [invoices] = useState<Invoice[]>([
    {
      id: 'inv_001',
      number: 'MKM-2026-00841',
      date: '15.10.2026',
      amount: 2450,
      currency: 'TL',
      description: 'Makinam PRO Kurumsal Mağaza Aboneliği (1 Aylık)',
      status: 'paid'
    },
    {
      id: 'inv_002',
      number: 'MKM-2026-00612',
      date: '15.09.2026',
      amount: 2450,
      currency: 'TL',
      description: 'Makinam PRO Kurumsal Mağaza Aboneliği (1 Aylık)',
      status: 'paid'
    },
    {
      id: 'inv_003',
      number: 'MKM-2026-00388',
      date: '15.08.2026',
      amount: 2450,
      currency: 'TL',
      description: 'Makinam PRO Kurumsal Mağaza Aboneliği (1 Aylık)',
      status: 'paid'
    }
  ]);

  // Handle Login for SaaS
  const handleSaaSLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmittingAuth(true);

    try {
      await login(loginEmail, loginPassword);
      showToast('Kurumsal hesabınıza başarıyla giriş yapıldı.');
    } catch (err: any) {
      setAuthError(getFriendlyErrorMessage(err.code));
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handle Register for SaaS
  const handleSaaSRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (loginPassword.length < 6) {
      setAuthError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      await register(
        loginEmail,
        loginPassword,
        regName,
        'kurumsal',
        regPhone,
        regCompany || regName
      );
      showToast('Kurumsal hesabınız oluşturuldu, SaaS paneline yönlendiriliyorsunuz.');
    } catch (err: any) {
      setAuthError(getFriendlyErrorMessage(err.code));
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Google Login for SaaS
  const handleGoogleSaaSLogin = async () => {
    setAuthError(null);
    setIsSubmittingAuth(true);
    try {
      await loginWithGoogle();
      showToast('Google ile kurumsal giriş başarılı.');
    } catch (err: any) {
      setAuthError(getFriendlyErrorMessage(err.code));
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // If Auth state is still resolving
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#091522] text-white p-6 font-sans">
        <div className="w-10 h-10 border-3 border-[#ea580c] border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-[13px] font-bold text-slate-200">Makinam SaaS Doğrulanıyor...</div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: AUTH REQUIRED LOGIN / REGISTER SCREEN FOR /saas
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#091522] text-slate-100 flex flex-col justify-between font-sans selection:bg-[#ea580c] selection:text-white">
        {/* Top Minimal Strip */}
        <header className="border-b border-slate-800/80 px-4 py-3 bg-[#0d1b2a]">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="text-[20px] font-black tracking-tight leading-none text-white">
                makinam<span className="text-[#ea580c]">.saas</span>
              </div>
              <span className="text-[9.5px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-700 uppercase tracking-wider">
                Kurumsal Portal
              </span>
            </Link>

            <Link
              to="/"
              className="text-[11.5px] text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Pazaryerine Dön</span>
            </Link>
          </div>
        </header>

        {/* Center Auth Card */}
        <main className="flex-1 flex items-center justify-center p-4 py-10">
          <div className="max-w-md w-full bg-[#102030] border border-slate-800 rounded-[6px] shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Header Badge & Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ea580c]/15 text-[#f97316] border border-[#ea580c]/30 text-[10.5px] font-bold uppercase tracking-wider mb-2.5">
                <Building2 size={13} />
                <span>Faturalama ve Organizasyon Yönetimi</span>
              </div>
              <h1 className="text-[20px] font-black text-white leading-snug">
                Makinam SaaS Kurumsal Girişi
              </h1>
              <p className="text-[12px] text-slate-400 mt-1.5 leading-relaxed">
                Planları görmek ve aboneliğinizi yönetmek için giriş yapıp bir organizasyon seçin.
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-700/50 rounded text-red-200 text-[12px] flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Mode Toggle Pills */}
            <div className="grid grid-cols-2 p-1 bg-[#091522] rounded border border-slate-800 text-[12px] font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`py-1.5 rounded transition-colors ${
                  authMode === 'login'
                    ? 'bg-[#ea580c] text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
                className={`py-1.5 rounded transition-colors ${
                  authMode === 'register'
                    ? 'bg-[#ea580c] text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Kurumsal Hesap Aç
              </button>
            </div>

            {/* Google Fast Auth */}
            <button
              type="button"
              disabled={isSubmittingAuth}
              onClick={handleGoogleSaaSLogin}
              className="w-full h-[40px] bg-[#1a2d42] hover:bg-[#223954] text-white border border-slate-700 rounded text-[12.5px] font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google ile Kurumsal Devam Et</span>
            </button>

            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
              <div className="flex-1 h-px bg-slate-800" />
              <span>VEYA E-POSTA İLE</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={authMode === 'login' ? handleSaaSLogin : handleSaaSRegister} className="space-y-3.5">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-300 mb-1">
                      Yetkili Ad Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ahmet Yılmaz"
                      className="w-full h-[38px] px-3 bg-[#091522] border border-slate-700 rounded text-[12.5px] text-white focus:outline-none focus:border-[#ea580c]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-300 mb-1">
                      Şirket / Organizasyon Ünvanı *
                    </label>
                    <input
                      type="text"
                      required
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      placeholder="Örn: Anadolu İş Makineleri A.Ş."
                      className="w-full h-[38px] px-3 bg-[#091522] border border-slate-700 rounded text-[12.5px] text-white focus:outline-none focus:border-[#ea580c]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-slate-300 mb-1">
                      İletişim Telefonu *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0532 123 45 67"
                      className="w-full h-[38px] px-3 bg-[#091522] border border-slate-700 rounded text-[12.5px] text-white focus:outline-none focus:border-[#ea580c]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11.5px] font-bold text-slate-300 mb-1">
                  Kurumsal E-posta Adresi *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="satis@sirketiniz.com"
                    className="w-full h-[38px] pl-9 pr-3 bg-[#091522] border border-slate-700 rounded text-[12.5px] text-white focus:outline-none focus:border-[#ea580c]"
                  />
                  <Mail size={15} className="absolute left-3 top-2.5 text-slate-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11.5px] font-bold text-slate-300">
                    Hesap Şifresi *
                  </label>
                  {authMode === 'login' && (
                    <Link
                      to="/giris-yap?mode=forgot"
                      className="text-[10.5px] text-[#f97316] hover:underline"
                    >
                      Şifremi Unuttum
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[38px] pl-9 pr-9 bg-[#091522] border border-slate-700 rounded text-[12.5px] text-white focus:outline-none focus:border-[#ea580c]"
                  />
                  <Lock size={15} className="absolute left-3 top-2.5 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full h-[40px] mt-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-[13px] rounded flex items-center justify-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmittingAuth ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Giriş Yap ve Portala Geç' : 'Organizasyon Hesabı Oluştur'}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 text-center text-[11px] text-slate-500">
              <ShieldCheck size={14} className="inline mr-1 text-emerald-500" />
              <span>256-Bit SSL ile uçtan uca şifrelenmiş güvenli kurumsal altyapı.</span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 px-4 py-3 bg-[#0d1b2a] text-center text-[11px] text-slate-500">
          © 2026 Makinam.com B2B SaaS • Kurumsal Faturalama ve Organizasyon Yönetim Modülü
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED SAAS PORTAL (User is logged in)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] font-sans selection:bg-[#ea580c] selection:text-white flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0f172a] text-white px-4 py-2.5 rounded-[4px] shadow-xl text-[12px] font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in duration-150">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Enterprise Header */}
      <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1320px] mx-auto px-4 h-[56px] flex items-center justify-between gap-3">
          {/* Brand & Organization Switcher */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 shrink-0">
              <div className="text-[19px] font-black tracking-tight text-white">
                makinam<span className="text-[#ea580c]">.saas</span>
              </div>
            </Link>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            {/* Organization Dropdown Pill */}
            <div className="relative flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-[4px] border border-slate-700 text-[11.5px]">
              <Building2 size={14} className="text-[#ea580c]" />
              <span className="font-bold text-slate-200 max-w-[160px] sm:max-w-[240px] truncate">
                {activeOrg.name}
              </span>
              <span className="text-[9.5px] bg-[#ea580c] text-white px-1.5 py-0.2 rounded font-bold uppercase">
                {activeOrg.plan.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-3 text-[11.5px]">
            <Link
              to="/"
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors hidden sm:flex"
            >
              <ExternalLink size={13} />
              <span>Pazaryerine Git</span>
            </Link>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#ea580c] text-white flex items-center justify-center font-bold text-[11px]">
                {(userProfile?.displayName || user.email || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-200 hidden md:inline">
                {userProfile?.displayName || user.email?.split('@')[0]}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main SaaS Container */}
      <div className="max-w-[1320px] w-full mx-auto px-4 py-6 flex-1 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-1.5 flex flex-wrap gap-1 shadow-xs text-[12px] font-bold">
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
              activeTab === 'billing'
                ? 'bg-[#0f172a] text-white shadow-2xs'
                : 'text-[#475569] hover:bg-slate-100'
            }`}
          >
            <CreditCard size={14} className={activeTab === 'billing' ? 'text-[#38bdf8]' : 'text-slate-500'} />
            <span>Faturalama ve Abonelik</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'bg-[#0f172a] text-white shadow-2xs'
                : 'text-[#475569] hover:bg-slate-100'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'plans' ? 'text-amber-400' : 'text-slate-500'} />
            <span>Planlar ve Yükseltme</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
              activeTab === 'invoices'
                ? 'bg-[#0f172a] text-white shadow-2xs'
                : 'text-[#475569] hover:bg-slate-100'
            }`}
          >
            <Receipt size={14} className={activeTab === 'invoices' ? 'text-emerald-400' : 'text-slate-500'} />
            <span>Fatura Geçmişi</span>
          </button>

          <button
            onClick={() => setActiveTab('organization')}
            className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
              activeTab === 'organization'
                ? 'bg-[#0f172a] text-white shadow-2xs'
                : 'text-[#475569] hover:bg-slate-100'
            }`}
          >
            <Building2 size={14} className={activeTab === 'organization' ? 'text-purple-400' : 'text-slate-500'} />
            <span>Organizasyon & Vergi Ayarları</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: BILLING & CURRENT SUBSCRIPTION OVERVIEW */}
        {/* ============================================================== */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Active Plan Banner */}
            <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white border border-slate-800 rounded-[6px] p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Aktif Abonelik
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Otomatik Yenileme Aktif
                  </span>
                </div>
                <h2 className="text-[22px] font-black text-white">
                  Makinam PRO Kurumsal Mağaza
                </h2>
                <p className="text-[12.5px] text-slate-300 max-w-[600px] leading-relaxed">
                  81 ilde öncelikli vitrin dopingi, 50 ilan kapasitesi, Makinam Güvende alıcı güven rozeti ve kurumsal portföy yöneticisi ayrıcalığı.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-[4px] border border-slate-700 text-right shrink-0 min-w-[200px]">
                <div className="text-[11px] text-slate-400 font-medium">Aylık Fatura Bedeli</div>
                <div className="text-[26px] font-black text-white font-mono mt-0.5">
                  2.450 <span className="text-[16px] font-sans font-bold text-amber-400">TL / ay</span>
                </div>
                <div className="text-[10.5px] text-slate-400 mt-1">
                  Sonraki fatura kesimi: <strong>{activeOrg.renewalDate}</strong>
                </div>
              </div>
            </div>

            {/* Quota & Usage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                <div className="flex items-center justify-between text-[#64748b] text-[11px] font-bold uppercase">
                  <span>İlan Yayınlama Kotası</span>
                  <Layers size={16} className="text-[#0284c7]" />
                </div>
                <div className="text-[22px] font-black text-[#0f172a] mt-2 font-mono">
                  {activeOrg.remainingListings} <span className="text-[13px] text-[#64748b] font-sans font-normal">/ {activeOrg.totalListingsQuota} Aktif</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-[#0284c7] h-2 rounded-full"
                    style={{ width: `${(activeOrg.remainingListings / activeOrg.totalListingsQuota) * 100}%` }}
                  />
                </div>
                <div className="text-[10.5px] text-[#64748b] mt-2">12 adet boş ilan kontenjanınız var</div>
              </div>

              <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                <div className="flex items-center justify-between text-[#64748b] text-[11px] font-bold uppercase">
                  <span>Vitrin Doping Hakları</span>
                  <Sparkles size={16} className="text-amber-500" />
                </div>
                <div className="text-[22px] font-black text-[#0f172a] mt-2 font-mono">
                  {activeOrg.remainingShowcases} <span className="text-[13px] text-[#64748b] font-sans font-normal">/ {activeOrg.totalShowcasesQuota} Kullanıldı</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${(activeOrg.remainingShowcases / activeOrg.totalShowcasesQuota) * 100}%` }}
                  />
                </div>
                <div className="text-[10.5px] text-[#64748b] mt-2">2 adet ana sayfa vitrin hakkınız mevcut</div>
              </div>

              <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs">
                <div className="flex items-center justify-between text-[#64748b] text-[11px] font-bold uppercase">
                  <span>Ödeme Yöntemi</span>
                  <CreditCard size={16} className="text-emerald-600" />
                </div>
                <div className="text-[14px] font-bold text-[#0f172a] mt-2 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px] rounded border border-slate-300">Mastercard</span>
                  <span>•••• 4192</span>
                </div>
                <div className="text-[11px] text-[#64748b] mt-1">Son kullanma: 08/29</div>
                <button
                  onClick={() => showToast('Kart güncelleme linki kayıtlı e-postanıza iletildi.')}
                  className="mt-2 text-[11px] text-[#0284c7] font-bold hover:underline block"
                >
                  Kartı Güncelle »
                </button>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[13px] text-[#0f172a]">Daha Fazla İlan ve Dopinge mi İhtiyacınız Var?</h3>
                <p className="text-[11.5px] text-[#64748b] mt-0.5">
                  Planınızı Enterprise paketine yükselterek sınırsız ilan ve özel API entegrasyonu elde edin.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('plans')}
                className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-[12px] font-bold rounded flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Planları Karşılaştır</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PRICING PLANS & UPGRADE */}
        {/* ============================================================== */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <h2 className="text-[20px] font-black text-[#0f172a]">
                Kurumsal Mağaza Abonelik Planları
              </h2>
              <p className="text-[12px] text-[#64748b]">
                Şirketinizin makine envanteri büyüklüğüne en uygun faturalama planını seçin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Plan 1: Starter */}
              <div className="bg-white border border-[#cbd5e1] rounded-[6px] p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[15px] text-[#0f172a]">Başlangıç Mağazası</h3>
                  <p className="text-[11px] text-[#64748b] mt-1">Tekil veya küçük atölye satıcıları için.</p>
                  <div className="text-[24px] font-black text-[#0f172a] font-mono my-3">
                    750 <span className="text-[13px] font-sans font-bold text-slate-500">TL / ay</span>
                  </div>

                  <ul className="space-y-2 text-[11.5px] text-[#334155] border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600 shrink-0" /> 10 Aktif İlan Kotası</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600 shrink-0" /> 1 Adet Vitrin Dopingi</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600 shrink-0" /> Kurumsal Mağaza Rozeti</li>
                    <li className="flex items-center gap-2 text-slate-400">× Özel Portföy Temsilcisi</li>
                    <li className="flex items-center gap-2 text-slate-400">× ERP / API Entegrasyonu</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Plan geçiş talebiniz onay için müşteri temsilcisine aktarıldı.')}
                  className="mt-5 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold rounded transition-colors"
                >
                  Bu Plana Geç
                </button>
              </div>

              {/* Plan 2: PRO (Current) */}
              <div className="bg-[#0f172a] text-white border-2 border-[#ea580c] rounded-[6px] p-5 shadow-xl flex flex-col justify-between relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ea580c] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Mevcut Planınız
                </span>

                <div>
                  <h3 className="font-bold text-[16px] text-white">Makinam PRO Kurumsal</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Büyüyen galeriler ve makine distribütörleri.</p>
                  <div className="text-[26px] font-black text-white font-mono my-3">
                    2.450 <span className="text-[13px] font-sans font-bold text-amber-400">TL / ay</span>
                  </div>

                  <ul className="space-y-2 text-[11.5px] text-slate-200 border-t border-slate-800 pt-3">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400 shrink-0" /> 50 Aktif İlan Kotası</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400 shrink-0" /> 5 Adet Vitrin Dopingi</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400 shrink-0" /> Makinam Güvende Güvenli Ticaret Rozeti</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400 shrink-0" /> Özel Portföy Müşteri Yöneticisi</li>
                    <li className="flex items-center gap-2 text-slate-500">× ERP / API Entegrasyonu</li>
                  </ul>
                </div>

                <button
                  disabled
                  className="mt-5 w-full py-2 bg-slate-800 text-slate-400 text-[12px] font-bold rounded cursor-not-allowed"
                >
                  Aktif Olarak Kullanılıyor
                </button>
              </div>

              {/* Plan 3: Enterprise */}
              <div className="bg-white border border-[#cbd5e1] rounded-[6px] p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[15px] text-[#0f172a]">Enterprise & Üretici</h3>
                  <p className="text-[11px] text-[#64748b] mt-1">Fabrikalar ve ulusal distribütörler için.</p>
                  <div className="text-[24px] font-black text-[#0f172a] font-mono my-3">
                    5.900 <span className="text-[13px] font-sans font-bold text-slate-500">TL / ay</span>
                  </div>

                  <ul className="space-y-2 text-[11.5px] text-[#334155] border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600 shrink-0" /> Sınırsız İlan Yayınlama</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600 shrink-0" /> 15 Adet Vitrin & Acil Dopingi</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600 shrink-0" /> Tam Kapsamlı ERP / XML API Entegrasyonu</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600 shrink-0" /> 7/24 Öncelikli Kurumsal Destek Hattı</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600 shrink-0" /> Sözleşmeli Cari Fatura Seçeneği</li>
                  </ul>
                </div>

                <button
                  onClick={() => showToast('Enterprise yükseltme başvurunuz alındı. Temsilcimiz sizi arayacak.')}
                  className="mt-5 w-full py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-[12px] font-bold rounded transition-colors shadow-xs"
                >
                  Enterprise'a Yükselt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: INVOICES & E-ARCHIVE */}
        {/* ============================================================== */}
        {activeTab === 'invoices' && (
          <div className="bg-white border border-[#cbd5e1] rounded-[4px] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#cbd5e1] flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[14px] text-[#0f172a]">Geçmiş Faturalar & E-Arşiv</h2>
                <p className="text-[11.5px] text-[#64748b]">Şirketiniz adına düzenlenen tüm yasal e-faturalar.</p>
              </div>
              <button
                onClick={() => showToast('Toplu fatura zip arşivi e-posta adresinize gönderildi.')}
                className="px-3 py-1.5 border border-[#cbd5e1] hover:bg-slate-50 text-[11.5px] font-bold text-slate-700 rounded flex items-center gap-1.5 shadow-2xs"
              >
                <Download size={13} />
                <span>Tümünü İndir (ZIP)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11.5px] border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#64748b] border-b border-[#cbd5e1] font-bold">
                    <th className="py-2.5 px-3">Fatura No</th>
                    <th className="py-2.5 px-3">Düzenleme Tarihi</th>
                    <th className="py-2.5 px-3">Hizmet Açıklaması</th>
                    <th className="py-2.5 px-3">Tutar</th>
                    <th className="py-2.5 px-3">Durum</th>
                    <th className="py-2.5 px-3 text-right">E-Fatura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#0284c7]">{inv.number}</td>
                      <td className="py-3 px-3 text-[#64748b]">{inv.date}</td>
                      <td className="py-3 px-3 font-semibold text-[#0f172a]">{inv.description}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#0f172a]">
                        {inv.amount.toLocaleString('tr-TR')} {inv.currency}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Ödendi
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => showToast(`"${inv.number}" numaralı e-fatura PDF formatında indiriliyor...`)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded inline-flex items-center gap-1 transition-colors"
                        >
                          <Download size={12} />
                          <span>PDF İndir</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: ORGANIZATION & TAX SETTINGS */}
        {/* ============================================================== */}
        {activeTab === 'organization' && (
          <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-5 shadow-xs space-y-4 max-w-2xl">
            <div className="border-b border-[#f1f5f9] pb-3">
              <h2 className="font-bold text-[14px] text-[#0f172a]">Organizasyon & Fatura Bilgileri</h2>
              <p className="text-[11.5px] text-[#64748b]">Faturalarınızın resmi muhasebe kayıtlarınıza işlenebilmesi için vergi bilgilerinizi güncel tutun.</p>
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">Şirket Resmi Ünvanı</label>
                <input
                  type="text"
                  defaultValue={activeOrg.name}
                  className="w-full h-[34px] px-3 border border-slate-300 rounded text-slate-800 font-semibold focus:outline-none focus:border-[#ea580c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-bold text-slate-700 mb-1">Vergi Dairesi</label>
                  <input
                    type="text"
                    defaultValue={activeOrg.taxOffice}
                    className="w-full h-[34px] px-3 border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-slate-700 mb-1">Vergi Numarası / TCKN</label>
                  <input
                    type="text"
                    defaultValue={activeOrg.taxNumber}
                    className="w-full h-[34px] px-3 font-mono border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">E-Fatura Bildirim E-postası</label>
                <input
                  type="email"
                  defaultValue={user.email || 'fatura@sirketiniz.com'}
                  className="w-full h-[34px] px-3 border border-slate-300 rounded text-slate-800 focus:outline-none focus:border-[#ea580c]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => showToast('Organizasyon ve fatura bilgileri başarıyla güncellendi.')}
                  className="px-4 py-2 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded text-[12px] transition-colors"
                >
                  Bilgileri Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
