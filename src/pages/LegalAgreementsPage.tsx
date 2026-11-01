import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ShieldCheck, 
  Printer, 
  Search, 
  ChevronRight, 
  Building2, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { LEGAL_AGREEMENTS, LegalAgreement } from '../data/legalAgreements';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const LegalAgreementsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const activeSlug = slug && LEGAL_AGREEMENTS[slug] ? slug : 'kurumsal-magaza-sozlesmesi';
  const currentAgreement: LegalAgreement =
    LEGAL_AGREEMENTS[activeSlug] || LEGAL_AGREEMENTS['kurumsal-magaza-sozlesmesi'];

  useDocumentTitle(`${currentAgreement.title} | makinam.com`);

  const [searchQuery, setSearchQuery] = useState<string>('');

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
    <div className="min-h-screen bg-[#f1f4f8] py-4 font-sans text-[#1e293b]">
      <div className="max-w-[1240px] mx-auto px-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-3">
          <Link to="/" className="hover:text-[#ea580c]">
            Ana Sayfa
          </Link>
          <ChevronRight size={12} className="text-[#94a3b8]" />
          <span className="text-[#64748b]">Yasal Bilgiler & Sözleşmeler</span>
          <ChevronRight size={12} className="text-[#94a3b8]" />
          <span className="text-[#1e293b] font-bold">{currentAgreement.shortTitle}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Left Navigation Bar */}
          <aside className="w-full md:w-[260px] shrink-0 space-y-2.5">
            <div className="bg-white border border-[#cbd5e1] rounded-[3px] overflow-hidden shadow-xs">
              <div className="bg-[#19324d] text-white px-3 py-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={13} className="text-[#ea580c]" />
                  <span>Sözleşmeler & Metinler</span>
                </span>
              </div>

              <div className="p-1 divide-y divide-[#f1f5f9] text-[11.5px]">
                {Object.values(LEGAL_AGREEMENTS).map((ag) => {
                  const isActive = ag.slug === activeSlug;
                  return (
                    <button
                      key={ag.slug}
                      onClick={() => {
                        navigate(`/sozlesmeler/${ag.slug}`);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-[2px] transition-colors flex items-center justify-between group ${
                        isActive
                          ? 'bg-[#f0f9ff] text-[#0284c7] font-bold border-l-3 border-[#0284c7]'
                          : 'text-[#334155] hover:bg-[#f8fafc] hover:text-[#0284c7]'
                      }`}
                    >
                      <span className="truncate">{ag.shortTitle}</span>
                      <ChevronRight
                        size={12}
                        className={isActive ? 'text-[#0284c7]' : 'text-transparent group-hover:text-[#94a3b8]'}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Box */}
            <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-3 text-center space-y-2">
              <Building2 size={24} className="text-[#ea580c] mx-auto" />
              <div className="text-[11px] font-bold text-[#1e293b]">Kurumsal Mağaza Açmak İster misiniz?</div>
              <p className="text-[10px] text-[#64748b]">
                Sanayi ve iş makinesi pazarında Türkiye geneli satış ağına katılın.
              </p>
              <Link
                to="/kurumsal-magaza-ac"
                className="inline-flex items-center justify-center gap-1 w-full bg-[#ea580c] hover:bg-[#c2410c] text-white text-[11px] font-bold py-1.5 rounded-[2px] transition-colors"
              >
                <span>Hemen Başvurun</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </aside>

          {/* Right Document Display Area */}
          <main className="flex-1 min-w-0 bg-white border border-[#cbd5e1] rounded-[3px] shadow-xs p-5 sm:p-7 space-y-5">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e2e8f0] gap-2">
              <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
                <span className="font-bold text-[#1e293b]">{currentAgreement.version}</span>
                <span>•</span>
                <span>Son Güncelleme: {currentAgreement.lastUpdated}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold border border-emerald-200 text-[10px]">
                  <ShieldCheck size={11} /> Resmi Metin
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-[220px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Madde veya kelime ara..."
                    className="w-full h-[30px] pl-7 pr-2 text-[11.5px] bg-[#f8fafc] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c]"
                  />
                  <Search size={13} className="absolute left-2.5 top-2.5 text-[#94a3b8]" />
                </div>
                <button
                  onClick={handlePrint}
                  type="button"
                  className="h-[30px] px-3 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] rounded-[3px] text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                  title="Yazdır"
                >
                  <Printer size={13} />
                  <span>Yazdır</span>
                </button>
              </div>
            </div>

            {/* Title & Summary */}
            <div>
              <h1 className="text-[20px] sm:text-[22px] font-black text-[#1e293b] mb-2 leading-tight">
                {currentAgreement.title}
              </h1>
              <p className="text-[12.5px] text-[#475569] bg-[#f8fafc] p-3 rounded-[3px] border border-[#e2e8f0] leading-relaxed">
                {currentAgreement.summary}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-5 pt-2">
              {filteredSections.length > 0 ? (
                filteredSections.map((sec) => (
                  <div key={sec.id} className="space-y-2">
                    <h2 className="text-[13.5px] font-bold text-[#1e293b] bg-slate-50 px-3 py-1.5 rounded-[2px] border-l-4 border-[#ea580c]">
                      {sec.title}
                    </h2>
                    <div className="space-y-2 text-[12.5px] text-[#334155] px-1">
                      {sec.content.map((p, pIdx) => (
                        <p key={pIdx} className="leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-[12px] text-[#94a3b8]">
                  "{searchQuery}" aramasıyla eşleşen bir madde bulunamadı.
                </div>
              )}
            </div>

            {/* Legal Notice Footer */}
            <div className="pt-6 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#94a3b8] gap-2">
              <span>© Makinam.com Bilişim ve Teknoloji A.Ş.</span>
              <span>İstanbul Ticaret Sicili: 340982-5 • Mersis: 0612089456100018</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
