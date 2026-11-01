import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  Lock,
  Truck,
  FileCheck,
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { sendListingMessage } from '../lib/messageService';
import { handleImageFallback } from '../utils/image';

interface MakinamGuvendePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
}

export const MakinamGuvendePurchaseModal: React.FC<MakinamGuvendePurchaseModalProps> = ({
  isOpen,
  onClose,
  listing
}) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [buyerName, setBuyerName] = useState(
    userProfile?.displayName || user?.displayName || ''
  );
  const [buyerPhone, setBuyerPhone] = useState(
    userProfile?.phoneNumber || ''
  );
  const [deliveryCity, setDeliveryCity] = useState(
    userProfile?.city || 'İstanbul'
  );
  const [offerPrice, setOfferPrice] = useState<string>(
    listing ? String(listing.price) : ''
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!buyerName.trim() || !buyerPhone.trim()) {
      setErrorMsg('Lütfen ad soyad ve iletişim telefonu alanlarını doldurunuz.');
      return;
    }

    if (user && listing.userId && (user.uid === listing.userId || user.email === listing.userId)) {
      setErrorMsg('Kendi ilanınızı satın alamazsınız.');
      return;
    }

    setIsSubmitting(true);

    const buyerId = user ? user.uid : `guest_${Date.now()}`;
    const priceFormatted = Number(offerPrice).toLocaleString('tr-TR');

    const escrowMessageText = 
      `🛡️ [MAKINAM GÜVENDE SATIN ALMA TALEBİ]\n\n` +
      `Alıcı: ${buyerName.trim()} (${buyerPhone.trim()})\n` +
      `Teslimat İli: ${deliveryCity}\n` +
      `Teklif Edilen Bedel: ${priceFormatted} ${listing.currency}\n` +
      (notes.trim() ? `Alıcı Notu: ${notes.trim()}\n\n` : `\n`) +
      `Bu makineyi Makinam Güvende lisanslı havuz hesap protokolü ile satın almak istiyorum. Lütfen ödeme ve nakliye planını başlatmak için talebimi onaylayınız.`;

    try {
      await sendListingMessage({
        listing,
        sender: {
          id: buyerId,
          name: buyerName.trim(),
          phone: buyerPhone.trim(),
          email: user?.email || undefined
        },
        text: escrowMessageText
      });

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Makinam Güvende talebi gönderilemedi:', err);
      setErrorMsg('Talebiniz iletilirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in">
      <div className="bg-white rounded-[6px] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#122438] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#ea580c] flex items-center justify-center text-white shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-black leading-tight">Makinam Güvende ile Satın Al</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                %100 Havuz Hesap Blokesi ve Ekspertiz Koruması
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-300 hover:text-white p-1 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-4 overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h4 className="font-black text-[17px] text-[#1e293b]">
                Talebiniz Satıcıya İletildi!
              </h4>
              <p className="text-[12px] text-[#64748b] mt-1.5 leading-relaxed max-w-[400px] mx-auto">
                Makinam Güvende güvenceli satın alma talebiniz satıcı <strong className="text-[#1e293b]">{listing.seller?.name}</strong> tarafına bildirilmiştir. Süreci mesajlar panelinizden takip edebilirsiniz.
              </p>
            </div>

            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] text-left text-[11.5px] space-y-1">
              <div className="font-bold text-[#1e293b] truncate">{listing.title}</div>
              <div className="text-emerald-700 font-bold">
                Tutar: {Number(offerPrice).toLocaleString('tr-TR')} {listing.currency}
              </div>
              <div className="text-[#64748b] text-[11px]">
                Teslimat İli: {deliveryCity}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-[#cbd5e1] hover:bg-slate-50 text-slate-700 text-[12px] font-bold rounded-[3px] transition-colors"
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
          /* Form & Protocol Screen */
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-[12px]">
            {/* Protocol Steps Box */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-[4px] text-center">
              <div className="space-y-1">
                <Lock size={16} className="text-emerald-700 mx-auto" />
                <div className="font-bold text-[10.5px] text-emerald-900">1. Havuz Bloke</div>
                <div className="text-[9.5px] text-emerald-700 leading-tight">Paranız lisanslı hesapta güvencede</div>
              </div>
              <div className="space-y-1 border-x border-emerald-200 px-1">
                <Truck size={16} className="text-emerald-700 mx-auto" />
                <div className="font-bold text-[10.5px] text-emerald-900">2. Nakliye</div>
                <div className="text-[9.5px] text-emerald-700 leading-tight">Sigortalı ağır taşımacılık</div>
              </div>
              <div className="space-y-1">
                <FileCheck size={16} className="text-emerald-700 mx-auto" />
                <div className="font-bold text-[10.5px] text-emerald-900">3. Ekspertiz & Onay</div>
                <div className="text-[9.5px] text-emerald-700 leading-tight">Onaylamadan para satıcıya geçmez</div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded text-[11.5px] flex items-center gap-2">
                <AlertCircle size={15} className="text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                  Adınız & Soyadınız *
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] border border-slate-300 rounded focus:border-emerald-600 focus:outline-none"
                  placeholder="Örn: Ahmet Yılmaz"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                  İletişim Telefonu *
                </label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] border border-slate-300 rounded focus:border-emerald-600 focus:outline-none"
                  placeholder="0532 000 00 00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                  Teslimat İli
                </label>
                <input
                  type="text"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] border border-slate-300 rounded focus:border-emerald-600 focus:outline-none"
                  placeholder="Örn: Ankara"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                  Teklif / Satın Alma Fiyatı ({listing.currency})
                </label>
                <input
                  type="number"
                  min={1}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] border border-slate-300 rounded focus:border-emerald-600 focus:outline-none font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                Satıcıya İletmek İstediğiniz Not (Opsiyonel)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Örn: Makineyi Çarşamba günü sahada ekspertiz kontrolünden geçirmek istiyoruz..."
                className="w-full px-3 py-2 text-[12px] border border-slate-300 rounded focus:border-emerald-600 focus:outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded text-[12px] transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#15803d] hover:bg-[#166534] text-white font-bold rounded text-[12px] flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Talebiniz İletiliyor...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Güvenli Talebi Başlat</span>
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
