import React, { useState } from 'react';
import { ShieldCheck, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MakinamGuvendeModal } from './MakinamGuvendeModal';

export const Banner: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'steps' | 'ekspertiz' | 'nakliye' | 'protection'>('steps');

  const openWithTab = (tab: 'steps' | 'ekspertiz' | 'nakliye' | 'protection') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="max-w-[1240px] mx-auto px-3 my-2.5 font-sans">
        <div className="bg-[#ffffff] border border-[#cbd5e1] rounded-[3px] p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
          
          {/* Left Side: Solid Value Proposition */}
          <div
            onClick={() => openWithTab('steps')}
            className="flex items-center gap-3 cursor-pointer group"
            title="Makinam Güvende Detaylarını Gör"
          >
            <div className="w-[42px] h-[42px] rounded-[3px] bg-[#19324d] group-hover:bg-[#122438] text-[#f97316] flex items-center justify-center shrink-0 border border-[#0f1f33] transition-colors">
              <ShieldCheck size={26} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#ea580c] group-hover:bg-[#c2410c] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-[2px] tracking-wide uppercase transition-colors">
                  Makinam Güvende
                </span>
                <span className="text-[12px] font-bold text-[#1e293b] group-hover:text-[#ea580c] transition-colors">
                  Sanayiden Eve, Her Türlü Makinede Sıfır Riskli Alışveriş
                </span>
              </div>
              <p className="text-[11px] text-[#64748b] mt-0.5">
                Ödemeniz ürün elinize ulaşıp onaylayana kadar havuz hesapta bloke edilir. 81 ile anlaşmalı nakliye & kargo desteği.
              </p>
            </div>
          </div>

          {/* Right Side: Trust points & button */}
          <div className="flex items-center gap-3 shrink-0 text-[11px]">
            <div className="hidden lg:flex items-center gap-3 text-[#475569] border-r border-[#e2e8f0] pr-3">
              <button
                type="button"
                onClick={() => openWithTab('ekspertiz')}
                className="flex items-center gap-1 hover:text-[#ea580c] transition-colors cursor-pointer"
                title="101 Nokta Ekspertiz Kapsamı"
              >
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>101 Nokta Ekspertiz</span>
              </button>
              <button
                type="button"
                onClick={() => openWithTab('nakliye')}
                className="flex items-center gap-1 hover:text-[#0284c7] transition-colors cursor-pointer"
                title="Sigortalı Nakliye Detayları"
              >
                <Truck size={13} className="text-[#0284c7]" />
                <span>Sigortalı Nakliye</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => openWithTab('steps')}
              className="bg-[#19324d] hover:bg-[#122438] text-white font-bold text-[11px] px-3 py-1.5 rounded-[3px] flex items-center gap-1 transition-colors shadow-2xs"
            >
              <span>Nasıl Çalışır?</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </div>
      </div>

      {/* Makinam Güvende Modal */}
      <MakinamGuvendeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
      />
    </>
  );
};
