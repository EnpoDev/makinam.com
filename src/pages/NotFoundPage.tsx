import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, HelpCircle, ArrowLeft, Layers } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('404 Sayfa Bulunamadı | makinam.com');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/ilanlar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 font-sans text-[#1e293b]">
      <div className="max-w-lg w-full bg-white border border-[#cbd5e1] rounded-[6px] p-8 text-center shadow-xs">
        {/* 404 Visual */}
        <div className="inline-block px-3.5 py-1 bg-orange-100 text-[#ea580c] text-[13px] font-black rounded uppercase tracking-wider mb-3">
          Hata Kodu: 404
        </div>

        <h1 className="text-[26px] font-black text-[#0f172a] tracking-tight">
          Aradığınız Sayfa Bulunamadı
        </h1>

        <p className="text-[13px] text-[#64748b] mt-2 mb-6 leading-relaxed">
          Ulaşmaya çalıştığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı kalmış olabilir.
        </p>

        {/* Quick Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-1.5 mb-6 max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Makine modeli, marka veya ilan no ara..."
            className="flex-1 h-[40px] px-3.5 text-[12.5px] border border-[#cbd5e1] rounded-[3px] focus:outline-none focus:border-[#ea580c] bg-[#fafbfc]"
          />
          <button
            type="submit"
            className="h-[40px] px-4 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-[12.5px] rounded-[3px] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Search size={15} />
            <span>Ara</span>
          </button>
        </form>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3 border-t border-slate-100">
          <Link
            to="/"
            className="h-[36px] px-4 bg-[#19324d] hover:bg-[#122438] text-white text-[12px] font-bold rounded-[3px] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Home size={14} />
            <span>Ana Sayfa</span>
          </Link>

          <Link
            to="/ilanlar"
            className="h-[36px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold rounded-[3px] flex items-center gap-1.5 transition-colors"
          >
            <Layers size={14} className="text-[#0284c7]" />
            <span>Tüm İlanlar</span>
          </Link>

          <Link
            to="/yardim"
            className="h-[36px] px-4 border border-[#cbd5e1] hover:bg-slate-50 text-slate-700 text-[12px] font-bold rounded-[3px] flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle size={14} />
            <span>Yardım & Destek</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
