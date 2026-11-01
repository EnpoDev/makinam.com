import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  ShieldCheck,
  User,
  Phone,
  Sparkles,
  Loader2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { sendListingMessage } from '../lib/messageService';
import { handleImageFallback } from '../utils/image';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

const QUICK_TEMPLATES = [
  'Merhaba, makine hala satılık mı?',
  'Son fiyatta pazarlık payınız var mıdır?',
  'Makineyi yerinde çalışırken görebilir miyiz?',
  'Makinam Güvende ile satın almak istiyorum.',
  'Fatura ve garanti durumu hakkında bilgi alabilir miyim?'
];

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  listing,
  onOpenAuth
}) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [messageText, setMessageText] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(
    userProfile?.displayName || user?.displayName || ''
  );
  const [senderPhone, setSenderPhone] = useState<string>(
    userProfile?.phoneNumber || ''
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdConvId, setCreatedConvId] = useState<string>('');

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!messageText.trim()) {
      setErrorMessage('Lütfen göndermek istediğiniz mesajı yazınız.');
      return;
    }

    const finalName = user
      ? userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Kullanıcı'
      : senderName.trim() || 'Ziyaretçi';

    const finalId = user ? user.uid : `guest_${Date.now()}`;

    setIsSending(true);

    try {
      const { conversationId } = await sendListingMessage({
        listing,
        sender: {
          id: finalId,
          name: finalName,
          phone: senderPhone.trim() || userProfile?.phoneNumber,
          email: user?.email || undefined
        },
        text: messageText.trim()
      });

      setCreatedConvId(conversationId);
      setIsSuccess(true);
    } catch (err) {
      console.error('Mesaj gönderme hatası:', err);
      setErrorMessage('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setMessageText('');
    onClose();
  };

  const sellerName = listing.seller?.name || 'Satıcı';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-[540px] bg-white rounded-[6px] shadow-2xl border border-[#cbd5e1] overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="bg-[#122438] text-white px-4 py-3 flex items-center justify-between border-b border-[#0f1f33]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[3px] bg-[#ea580c] text-white flex items-center justify-center shadow-xs">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="font-bold text-[13.5px] leading-tight text-white">
                Satıcıya Mesaj Gönder
              </h3>
              <p className="text-[10.5px] text-slate-300">
                {sellerName} • {listing.seller?.type || 'Bireysel'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {isSuccess ? (
          /* SUCCESS SCREEN */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h4 className="font-black text-[17px] text-[#1e293b]">
                Mesajınız Başarıyla İletildi!
              </h4>
              <p className="text-[12px] text-[#64748b] mt-1 max-w-[380px] mx-auto leading-relaxed">
                Mesajınız <strong className="text-[#1e293b]">{sellerName}</strong> adlı satıcıya ulaştırıldı. Satıcı yanıt verdiğinde mesajlar panelinizden takip edebilirsiniz.
              </p>
            </div>

            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] text-left flex items-center gap-3">
              <img
                src={listing.images[0]}
                alt={listing.title}
                onError={handleImageFallback}
                className="w-12 h-10 object-cover rounded-[2px] border border-[#cbd5e1] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[11.5px] text-[#1e293b] truncate">
                  {listing.title}
                </div>
                <div className="text-[11px] font-bold text-[#b91c1c]">
                  {listing.price.toLocaleString('tr-TR')} {listing.currency}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-[#cbd5e1] text-[#475569] text-[12px] font-bold rounded-[3px] hover:bg-gray-100 transition-colors"
              >
                Kapat
              </button>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  navigate('/hesabim/mesajlarim');
                }}
                className="px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-[12px] font-bold rounded-[3px] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Mesajlarıma Git</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* FORM SCREEN */
          <form onSubmit={handleSend} className="p-4 space-y-3.5">
            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-[3px] text-[11.5px] flex items-center gap-2">
                <AlertCircle size={15} className="text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {/* Mini Listing Card */}
            <div className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[3px] flex items-center gap-2.5">
              <img
                src={listing.images[0]}
                alt={listing.title}
                onError={handleImageFallback}
                className="w-14 h-11 object-cover rounded-[2px] border border-[#cbd5e1] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[12px] text-[#1e293b] truncate">
                  {listing.title}
                </div>
                <div className="text-[11px] font-bold text-[#b91c1c] mt-0.5">
                  {listing.price.toLocaleString('tr-TR')} {listing.currency}
                  <span className="text-[#64748b] font-normal ml-2">
                    {listing.city} / {listing.district}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Templates */}
            <div>
              <div className="text-[11px] font-bold text-[#64748b] mb-1.5 flex items-center gap-1">
                <Sparkles size={12} className="text-[#ea580c]" />
                <span>Hazır Mesaj Şablonları (Tıklayarak Ekleyin):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessageText(tmpl)}
                    className="text-[10.5px] bg-white border border-[#cbd5e1] hover:border-[#ea580c] hover:text-[#ea580c] px-2 py-1 rounded-[2px] text-[#475569] transition-all text-left"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Non-logged in buyer info inputs */}
            {!user && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-orange-50/50 border border-orange-200 rounded-[3px]">
                <div>
                  <label className="block text-[10.5px] font-bold text-[#334155] mb-1">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full h-[32px] px-2.5 text-[11.5px] border border-[#cbd5e1] rounded-[2px] bg-white focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-[#334155] mb-1">
                    Telefon Numaranız *
                  </label>
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full h-[32px] px-2.5 text-[11.5px] border border-[#cbd5e1] rounded-[2px] bg-white focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
              </div>
            )}

            {/* Message Textarea */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11.5px] font-bold text-[#334155]">
                  Mesajınız *
                </label>
                <span className="text-[10px] text-[#94a3b8]">
                  {messageText.length}/500 karakter
                </span>
              </div>
              <textarea
                rows={4}
                required
                maxLength={500}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Makinenin durumu, ekspertiz raporu veya pazarlık hakkında satıcıya sormak istediklerinizi yazınız..."
                className="w-full p-2.5 text-[12px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-orange-200"
              />
            </div>

            {/* Bottom Disclaimer */}
            <div className="text-[10px] text-[#64748b] bg-[#f8fafc] p-2 rounded border border-[#e2e8f0] flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>
                Güvenliğiniz için mesajlaşma esnasında IBAN'a doğrudan kapora göndermeyiniz; Makinam Güvende havuz sistemini kullanınız.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-1.5 border border-[#cbd5e1] text-[#475569] text-[11.5px] font-bold rounded-[2px] hover:bg-gray-50 transition-colors"
              >
                Vazgeç
              </button>

              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-[12px] font-bold rounded-[3px] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {isSending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>İletiliyor...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Satıcıya Gönder</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
