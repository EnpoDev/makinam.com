import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  ShieldCheck, 
  Building2, 
  Lock, 
  CheckCircle2, 
  Search,
  ExternalLink 
} from 'lucide-react';
import { LEGAL_AGREEMENTS, LegalAgreement } from '../data/legalAgreements';

interface LegalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAgreementSlug?: string;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const LegalAgreementModal: React.FC<LegalAgreementModalProps> = ({
  isOpen,
  onClose,
  defaultAgreementSlug = 'kurumsal-magaza-sozlesmesi',
  onAccept,
  showAcceptButton = false
}) => {
  const [activeSlug, setActiveSlug] = useState<string>(defaultAgreementSlug);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const currentAgreement: LegalAgreement =
    LEGAL_AGREEMENTS[activeSlug] || LEGAL_AGREEMENTS['kurumsal-magaza-sozlesmesi'];

  // Filter sections by search query if typed
  const filteredSections = currentAgreement.sections.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.content.some((c) => c.toLowerCase().includes(q))
    );
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div 
        className="bg-white w-full max-w-[880px] h-[92vh] max-h-[780px] rounded-[4px] shadow-2xl flex flex-col overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. MODAL TOP HEADER */}
        <div className="bg-[#19324d] text-white px-4 py-3 flex items-center justify-between border-b border-[#0f1f33] shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#ea580c]" />
            <h2 className="text-[13.5px] font-bold tracking-wide">
              Makinam.com Hukuki Sözleşmeler & Aydınlatma Metinleri
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              type="button"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Yazdır"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Kapat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. TABS BAR */}
        <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-3 pt-2 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
          {Object.values(LEGAL_AGREEMENTS).map((ag) => {
            const isActive = ag.slug === activeSlug;
            return (
              <button
                key={ag.slug}
                onClick={() => {
                  setActiveSlug(ag.slug);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 text-[11px] font-bold whitespace-nowrap rounded-t-[3px] border-t-2 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white border-t-[#ea580c] border-x border-x-[#cbd5e1] text-[#1e293b] shadow-xs'
                    : 'border-t-transparent text-[#64748b] hover:text-[#1e293b] hover:bg-[#edf2f7]'
                }`}
              >
                <span>{ag.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* 3. SEARCH & INFO BAR */}
        <div className="bg-white px-4 py-2 border-b border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
            <span className="font-bold text-[#1e293b]">{currentAgreement.version}</span>
            <span>•</span>
            <span>Son Güncelleme: {currentAgreement.lastUpdated}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold border border-emerald-200 text-[10px]">
              <ShieldCheck size={11} /> Resmi Metin
            </span>
          </div>

          <div className="relative w-full sm:w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Madde veya kelime ara..."
              className="w-full h-[28px] pl-7 pr-2 text-[11px] bg-[#f8fafc] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c]"
            />
            <Search size={12} className="absolute left-2.5 top-2 text-[#94a3b8]" />
          </div>
        </div>

        {/* 4. SCROLLABLE DOCUMENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-[#334155] leading-relaxed">
          {/* Document Header */}
          <div className="border-b border-[#e2e8f0] pb-3">
            <h1 className="text-[17px] sm:text-[19px] font-black text-[#1e293b] leading-snug mb-1.5">
              {currentAgreement.title}
            </h1>
            <p className="text-[12px] text-[#64748b] bg-[#f8fafc] p-2.5 rounded-[3px] border border-[#e2e8f0]">
              {currentAgreement.summary}
            </p>
          </div>

          {/* Sections List */}
          {filteredSections.length > 0 ? (
            filteredSections.map((sec) => (
              <div key={sec.id} className="space-y-1.5">
                <h3 className="text-[13px] font-bold text-[#1e293b] bg-slate-50 px-2.5 py-1 rounded-[2px] border-l-3 border-[#ea580c]">
                  {sec.title}
                </h3>
                <div className="space-y-1.5 text-[12px] px-1">
                  {sec.content.map((p, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-[12px] text-[#94a3b8]">
              "{searchQuery}" aramasıyla eşleşen bir madde bulunamadı.
            </div>
          )}

          {/* Document Footer Note */}
          <div className="pt-4 border-t border-[#e2e8f0] text-[11px] text-[#94a3b8] flex items-center justify-between">
            <span>© Makinam.com Bilişim ve Teknoloji A.Ş. Tüm hakları saklıdır.</span>
            <span>Mersis No: 0612089456100018</span>
          </div>
        </div>

        {/* 5. MODAL BOTTOM ACTIONS */}
        <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#64748b] hidden sm:flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Sözleşmeyi dilediğiniz zaman profil sayfanızdan veya bu ekrandan inceleyebilirsiniz.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-1.5 text-[12px] font-bold text-[#475569] hover:bg-[#e2e8f0] rounded-[3px] border border-[#cbd5e1] transition-colors"
            >
              Kapat
            </button>
            {showAcceptButton && onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                type="button"
                className="px-5 py-1.5 text-[12px] font-bold text-white bg-[#ea580c] hover:bg-[#c2410c] rounded-[3px] transition-colors flex items-center gap-1 shadow-xs"
              >
                <CheckCircle2 size={13} />
                <span>Okudum ve Kabul Ediyorum</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
