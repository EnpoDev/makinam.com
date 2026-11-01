import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileCheck, Truck, Calculator, Wrench, RefreshCw, Sparkles, CheckCircle, LucideIcon } from 'lucide-react';
import { subscribeToServices, ServiceBoxItem, DEFAULT_SERVICES } from '../lib/portalService';

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  FileCheck,
  Truck,
  Calculator,
  Wrench,
  RefreshCw,
  Sparkles,
  CheckCircle
};

export const ServiceBoxes: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceBoxItem[]>(DEFAULT_SERVICES);

  useEffect(() => {
    const unsubscribe = subscribeToServices((items) => {
      if (items && items.length > 0) {
        setServices(items);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-3 shadow-xs mb-3 font-sans">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 mb-2.5">
        <h2 className="text-[12px] font-bold text-[#1e293b] uppercase tracking-wide">
          Makinam.com Hizmetleri & Güvenli Ticaret
        </h2>
        <span className="text-[11px] text-[#64748b]">Tüm Türkiye Geneli Çözümler</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {services.map((srv) => {
          const Icon = ICON_MAP[srv.iconName] || ShieldCheck;
          return (
            <div
              key={srv.id}
              onClick={() => navigate(srv.link)}
              className="flex items-start gap-3 p-2.5 rounded-[3px] border border-[#e2e8f0] hover:border-[#0284c7] hover:bg-[#f8fafc] cursor-pointer transition-all group"
            >
              <div className={`p-2 rounded-[3px] ${srv.bg} shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon size={20} className={srv.color} />
              </div>
              <div className="overflow-hidden">
                <span className="text-[9px] font-bold text-[#0284c7] uppercase tracking-wider block mb-0.5">
                  {srv.tag}
                </span>
                <h3 className="text-[12px] font-bold text-[#1e293b] group-hover:text-[#0284c7] transition-colors leading-tight mb-1 truncate">
                  {srv.title}
                </h3>
                <p className="text-[11px] text-[#64748b] leading-tight line-clamp-2">
                  {srv.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
