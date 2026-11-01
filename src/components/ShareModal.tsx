import React, { useState } from 'react';
import { X, Copy, Check, Mail, Share2 } from 'lucide-react';
import { Listing } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, listing }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const priceText = `${listing.price.toLocaleString('tr-TR')} ${listing.currency === 'TL' ? 'TL' : listing.currency}`;
  const shareText = `Makinam.com'da bulduğum ilan: "${listing.title}" - ${priceText}`;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Bağlantı kopyalanamadı:', err);
    }
  };

  const shareChannels = [
    {
      name: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#20ba5a] text-white',
      textColor: 'text-[#128C7E]',
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`
    },
    {
      name: 'Telegram',
      color: 'bg-[#0088cc] hover:bg-[#0077b5] text-white',
      textColor: 'text-[#0088cc]',
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z" />
        </svg>
      ),
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
    },
    {
      name: 'X (Twitter)',
      color: 'bg-black hover:bg-neutral-800 text-white',
      textColor: 'text-black',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    },
    {
      name: 'Facebook',
      color: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      textColor: 'text-[#1877F2]',
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'E-Posta',
      color: 'bg-[#475569] hover:bg-[#334155] text-white',
      textColor: 'text-[#475569]',
      icon: <Mail size={22} />,
      url: `mailto:?subject=${encodeURIComponent(listing.title + ' - Makinam.com')}&body=${encodeURIComponent(shareText + '\n\nİlanı İncelemek İçin:\n' + currentUrl)}`
    }
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[4px] max-w-[460px] w-full p-5 shadow-2xl border border-gray-200 relative animate-in zoom-in-95 duration-150 font-sans"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4">
          <div className="flex items-center gap-2 text-[#1e293b]">
            <div className="w-7 h-7 rounded-[3px] bg-orange-50 text-[#ea580c] border border-orange-200 flex items-center justify-center">
              <Share2 size={15} />
            </div>
            <h3 className="text-[15px] font-bold">İlanı Paylaş</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
            title="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Listing Mini Card Preview */}
        <div className="flex items-center gap-3 p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[3px] mb-4">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-14 h-11 object-cover rounded-[2px] border border-[#cbd5e1] shrink-0"
            />
          ) : (
            <div className="w-14 h-11 bg-gray-200 rounded-[2px] shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-[12px] font-bold text-[#1e293b] truncate" title={listing.title}>
              {listing.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-[11px]">
              <span className="font-bold text-[#b91c1c]">{priceText}</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#64748b] truncate">{listing.city}</span>
            </div>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2.5">
            Sosyal Medya ve Mesajlaşma
          </label>
          <div className="grid grid-cols-5 gap-2">
            {shareChannels.map((ch) => (
              <a
                key={ch.name}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-[3px] transition-all transform hover:-translate-y-0.5 shadow-xs ${ch.color}`}
                title={`${ch.name} ile paylaş`}
              >
                {ch.icon}
                <span className="text-[10px] font-bold tracking-tight">{ch.name.split(' ')[0]}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Copy Link Section */}
        <div>
          <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5">
            İlan Bağlantısını Kopyala
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              readOnly
              value={currentUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 h-9 px-2.5 text-[11.5px] border border-[#cbd5e1] rounded-[2px] bg-[#f8fafc] text-[#334155] focus:outline-none focus:border-[#0284c7] font-mono select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`h-9 px-3.5 rounded-[2px] text-[11.5px] font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#ea580c] hover:bg-[#d94e08] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Kopyala</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-[#f1f5f9] text-center text-[10.5px] text-[#94a3b8]">
          Bağlantıyı paylaşarak potansiyel alıcıların ilana doğrudan ulaşmasını sağlayabilirsiniz.
        </div>
      </div>
    </div>
  );
};
