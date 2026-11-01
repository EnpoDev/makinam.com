import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, HelpCircle, Globe, ShieldCheck, QrCode } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#cbd5e1] mt-8 text-[#475569] font-sans text-[11px]">
      {/* 5-Column Navigation Area - Sahibinden & Arabam exact portal architecture */}
      <div className="max-w-[1240px] mx-auto px-3 py-7">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {/* Kurumsal */}
          <div>
            <h4 className="font-bold text-[#1e293b] mb-2 uppercase text-[11px] tracking-wide border-b border-[#f1f5f9] pb-1">
              Kurumsal
            </h4>
            <ul className="space-y-1.5">
              <li><Link to="/yardim" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Hakkımızda</Link></li>
              <li><Link to="/yardim" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Basın & Medya</Link></li>
              <li><Link to="/kurumsal-magaza-ac" className="hover:underline text-[#64748b] hover:text-[#0284c7]">İnsan Kaynakları</Link></li>
              <li><Link to="/yardim" className="hover:underline text-[#64748b] hover:text-[#0284c7]">İletişim & Ofisler</Link></li>
              <li><Link to="/makinam-guvende" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Sosyal Sorumluluk</Link></li>
            </ul>
          </div>

          {/* Hizmetlerimiz */}
          <div>
            <h4 className="font-bold text-[#1e293b] mb-2 uppercase text-[11px] tracking-wide border-b border-[#f1f5f9] pb-1">
              Hizmetlerimiz
            </h4>
            <ul className="space-y-1.5">
              <li><Link to="/makinam-guvende" className="text-[#ea580c] hover:underline font-semibold">Makinam Güvende</Link></li>
              <li><Link to="/makinam-guvende" className="hover:underline text-[#64748b] hover:text-[#0284c7]">101 Nokta Ekspertiz</Link></li>
              <li><Link to="/makinam-guvende" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Ağır Nakliye & Kargo</Link></li>
              <li><Link to="/yardim" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Yardım & Destek</Link></li>
              <li><Link to="/yardim" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Güvenli Ticaret İpuçları</Link></li>
            </ul>
          </div>

          {/* Mağazalar */}
          <div>
            <h4 className="font-bold text-[#1e293b] mb-2 uppercase text-[11px] tracking-wide border-b border-[#f1f5f9] pb-1">
              Mağazalar
            </h4>
            <ul className="space-y-1.5">
              <li><Link to="/kurumsal-magaza-ac" className="hover:underline text-[#64748b] hover:text-[#ea580c] font-semibold">Mağaza Açmak İstiyorum</Link></li>
              <li><Link to="/giris" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Mağaza Girişi</Link></li>
              <li><Link to="/kurumsal-magaza-ac" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Kurumsal İlan Paketleri</Link></li>
              <li><Link to="/kurumsal-magaza-ac" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Makinam PRO Avantajları</Link></li>
            </ul>
          </div>

          {/* Gizlilik ve Kullanım */}
          <div>
            <h4 className="font-bold text-[#1e293b] mb-2 uppercase text-[11px] tracking-wide border-b border-[#f1f5f9] pb-1">
              Gizlilik ve Kullanım
            </h4>
            <ul className="space-y-1.5">
              <li><Link to="/makinam-guvende" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Güvenli Alışveriş İpuçları</Link></li>
              <li><Link to="/sozlesmeler/kullanim-kosullari" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Kullanım Koşulları</Link></li>
              <li><Link to="/sozlesmeler/uyelik-sozlesmesi" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Üyelik Sözleşmesi</Link></li>
              <li><Link to="/sozlesmeler/kurumsal-magaza-sozlesmesi" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Kurumsal Mağaza Sözleşmesi</Link></li>
              <li><Link to="/sozlesmeler/kvkk-aydinlatma-metni" className="hover:underline text-[#64748b] hover:text-[#0284c7]">KVKK Aydınlatma Metni</Link></li>
              <li><Link to="/sozlesmeler/kullanim-kosullari" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Çerez Politikası</Link></li>
            </ul>
          </div>

          {/* Bizi Takip Edin & ETBİS */}
          <div>
            <h4 className="font-bold text-[#1e293b] mb-2 uppercase text-[11px] tracking-wide border-b border-[#f1f5f9] pb-1">
              Bizi Takip Edin
            </h4>
            <ul className="space-y-1.5">
              <li><a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#64748b] hover:text-[#0284c7]">LinkedIn</a></li>
              <li><a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Instagram</a></li>
              <li><a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#64748b] hover:text-[#0284c7]">YouTube</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#64748b] hover:text-[#0284c7]">X (Twitter)</a></li>
              <li><a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#64748b] hover:text-[#0284c7]">Facebook</a></li>
            </ul>
          </div>
        </div>

        {/* Support & Helpline Row */}
        <div className="border-t border-[#e2e8f0] mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[2px] bg-[#f8fafc] border border-[#cbd5e1] text-[#ea580c] flex items-center justify-center">
                <PhoneCall size={14} />
              </div>
              <div>
                <div className="text-[10px] text-[#64748b] uppercase font-bold">Müşteri Hizmetleri (09:00 - 18:00)</div>
                <a
                  href="tel:08501234567"
                  className="font-bold text-[#1e293b] text-[12px] hover:text-[#ea580c] transition-colors"
                  title="Müşteri Hizmetlerini Ara"
                >
                  0 850 123 45 67
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[2px] bg-[#f8fafc] border border-[#cbd5e1] text-[#0284c7] flex items-center justify-center">
                <HelpCircle size={14} />
              </div>
              <div>
                <div className="text-[10px] text-[#64748b] uppercase font-bold">Destek & Çözüm</div>
                <Link to="/yardim" className="font-bold text-[#0284c7] hover:underline text-[11px]">
                  Yardım Merkezi & SSS
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-[#64748b]">
            <div className="flex items-center gap-1 border border-[#cbd5e1] rounded-[2px] px-2 py-0.5 bg-[#f8fafc]">
              <Globe size={11} className="text-[#64748b]" />
              <span>TR - Türkiye</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck size={13} />
              <span>256-Bit SSL Güvenli Altyapı</span>
            </div>
            <div className="flex items-center gap-1 border border-[#cbd5e1] rounded-[2px] px-2 py-0.5 bg-[#f8fafc]">
              <QrCode size={11} className="text-[#1e293b]" />
              <span className="font-semibold text-[#1e293b]">ETBİS Kayıtlıdır</span>
            </div>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="border-t border-[#f1f5f9] mt-4 pt-3 text-[10px] text-[#94a3b8] text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-1">
          <p>
            Makinam Elektronik Ticaret ve Bilişim Hizmetleri A.Ş. • makinam.com bir ilan ve makine pazar yeridir.
          </p>
          <p>
            Copyright © 2026 makinam.com. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};
