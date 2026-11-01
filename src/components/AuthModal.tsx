import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, User, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LegalAgreementModal } from './LegalAgreementModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, resetPassword, getFriendlyErrorMessage } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [accountType, setAccountType] = useState<'bireysel' | 'kurumsal'>('bireysel');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Legal agreement modal state
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalSlug, setLegalSlug] = useState('uyelik-sozlesmesi');

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
      onClose();
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
      onClose();
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
      onClose();
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
      setSuccessMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[480px] rounded-[6px] border border-[#cbd5e1] shadow-xl overflow-hidden relative">
        
        {/* Modal Top Bar */}
        <div className="bg-[#19324d] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#ea580c] text-white flex items-center justify-center font-black text-[13px]">
              M
            </div>
            <span className="font-bold text-[14px] tracking-tight">
              makinam<span className="text-[#ea580c]">.com</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              handleResetMessages();
            }}
            className={`flex-1 py-2.5 text-[13px] font-bold border-b-2 transition-all ${
              mode === 'login'
                ? 'border-[#ea580c] text-[#ea580c] bg-white'
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
            className={`flex-1 py-2.5 text-[13px] font-bold border-b-2 transition-all ${
              mode === 'register'
                ? 'border-[#ea580c] text-[#ea580c] bg-white'
                : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            Ücretsiz Kayıt Ol
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-[4px] flex items-center gap-2 text-[12px]">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-[4px] flex items-center gap-2 text-[12px]">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Google Sign In */}
          {mode !== 'forgot' && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full h-[38px] bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] rounded-[4px] text-[12px] font-semibold text-[#334155] flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google ile Devam Et</span>
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e2e8f0]"></div>
                </div>
                <div className="relative flex justify-center text-[10.5px] uppercase tracking-wider font-semibold text-[#94a3b8]">
                  <span className="bg-white px-2">veya e-posta ile</span>
                </div>
              </div>
            </div>
          )}

          {/* LOGIN VIEW */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[38px] px-3 text-[13px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                  placeholder="ornek@mail.com"
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
                    className="text-[11px] text-[#ea580c] hover:underline font-semibold"
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
                    className="w-full h-[38px] pl-3 pr-9 text-[13px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer text-[11.5px] text-[#475569]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#ea580c] rounded border-[#cbd5e1]"
                  />
                  <span>Oturum açık kalsın</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[40px] bg-[#ea580c] hover:bg-[#d94e08] text-white font-bold text-[13px] rounded-[4px] transition-colors shadow-xs"
              >
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
          )}

          {/* REGISTER VIEW */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Account type pills */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('bireysel')}
                  className={`py-1.5 px-2 rounded-[4px] border text-center text-[11.5px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    accountType === 'bireysel'
                      ? 'border-[#ea580c] bg-orange-50/50 text-[#ea580c]'
                      : 'border-[#cbd5e1] text-[#64748b]'
                  }`}
                >
                  <User size={13} />
                  <span>Bireysel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/kurumsal-magaza-ac');
                  }}
                  className="py-1.5 px-2 rounded-[4px] border border-[#cbd5e1] hover:border-[#ea580c] hover:bg-orange-50/50 text-[#64748b] hover:text-[#ea580c] text-center text-[11.5px] font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Building2 size={13} className="text-[#ea580c]" />
                  <span>Kurumsal Mağaza Aç »</span>
                </button>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Cep Telefonu
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0532 000 00 00"
                  className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  E-posta *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  className="w-full h-[36px] px-3 text-[12px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#334155] mb-1">
                  Şifre * (En az 6 karakter)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[36px] pl-3 pr-9 text-[12px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-[#475569] pt-1">
                <input
                  type="checkbox"
                  id="authAcceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 text-[#ea580c] rounded cursor-pointer"
                />
                <label htmlFor="authAcceptTerms" className="cursor-pointer select-none">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setLegalSlug('uyelik-sozlesmesi');
                      setLegalOpen(true);
                    }}
                    className="text-[#0284c7] hover:underline font-bold"
                  >
                    Üyelik Sözleşmesi
                  </button>{' '}
                  ve{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setLegalSlug('kvkk-aydinlatma-metni');
                      setLegalOpen(true);
                    }}
                    className="text-[#0284c7] hover:underline font-bold"
                  >
                    KVKK Metni
                  </button>
                  'ni kabul ediyorum.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[38px] bg-[#ea580c] hover:bg-[#d94e08] text-white font-bold text-[13px] rounded-[4px] transition-colors mt-2"
              >
                {loading ? 'Hesap Açılıyor...' : 'Hesap Aç'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
              <p className="text-[12px] text-[#475569] leading-relaxed">
                Kayıtlı e-posta adresinizi giriniz. Şifrenizi yenilemeniz için bağlantı göndereceğiz.
              </p>

              <div>
                <label className="block text-[12px] font-bold text-[#334155] mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[38px] px-3 text-[13px] border border-[#cbd5e1] rounded-[4px] focus:outline-none focus:border-[#ea580c]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[38px] bg-[#ea580c] hover:bg-[#d94e08] text-white font-bold text-[13px] rounded-[4px] transition-colors"
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
                  className="text-[12px] text-[#ea580c] hover:underline font-semibold"
                >
                  « Giriş yap ekranına dön
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-[#f8fafc] px-6 py-2.5 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#94a3b8]">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-600" />
            256-Bit SSL Koruma
          </span>
          <span>makinam.com</span>
        </div>
      </div>

      {/* Embedded Legal Agreement Modal */}
      <LegalAgreementModal
        isOpen={legalOpen}
        onClose={() => setLegalOpen(false)}
        defaultAgreementSlug={legalSlug}
        showAcceptButton={true}
        onAccept={() => setAcceptTerms(true)}
      />
    </div>
  );
};