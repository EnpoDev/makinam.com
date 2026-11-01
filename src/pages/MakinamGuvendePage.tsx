import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  Clock,
  Sparkles,
  HelpCircle,
  Building2,
  Lock,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CreditCard,
  FileText,
  BadgeCheck,
  PhoneCall
} from 'lucide-react';
import { subscribeToMakinamGuvende, DEFAULT_MAKINAM_GUVENDE, MakinamGuvendeData } from '../lib/portalService';

export const MakinamGuvendePage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [content, setContent] = useState<MakinamGuvendeData>(DEFAULT_MAKINAM_GUVENDE);

  useEffect(() => {
    const unsubscribe = subscribeToMakinamGuvende((data) => {
      if (data) {
        setContent(data);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="min-h-screen bg-[#f1f4f8] py-4 font-sans text-[#1e293b]">
      <div className="max-w-[1240px] mx-auto px-3">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-3">
          <Link to="/" className="hover:text-[#ea580c]">Ana Sayfa</Link>
          <ChevronRight size={12} className="text-[#94a3b8]" />
          <span className="text-[#1e293b] font-bold">Makinam Güvende</span>
        </div>

        {/* 1. HERO SECTION */}
        <div className="bg-[#122438] text-white rounded-[4px] border border-[#0f1f33] p-6 sm:p-8 mb-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none hidden md:flex items-center pr-8">
            <ShieldCheck size={260} strokeWidth={1.2} />
          </div>

          <div className="relative z-10 max-w-[760px]">
            <div className="inline-flex items-center gap-2 bg-[#ea580c] text-white text-[10.5px] font-black px-2.5 py-1 rounded-[2px] uppercase tracking-wider mb-3 shadow-xs">
              <ShieldCheck size={14} strokeWidth={2.4} />
              <span>Resmi Güvenli Ticaret Protokolü</span>
            </div>

            <h1 className="text-[22px] sm:text-[30px] font-black leading-tight text-white mb-3">
              Sanayiden Eve, Her Türlü Makinede Sıfır Riskli Alışveriş
            </h1>

            <p className="text-[13px] sm:text-[14px] text-slate-300 leading-relaxed mb-6">
              Makinam Güvende; sanayi tezgahlarından tarım traktörlerine, dikiş makinelerinden ev tipi fırın ve tost makinelerine kadar tüm alım-satım süreçlerinde paranızı lisanslı havuz hesapta korur. Ürünü teslim alıp ekspertiz kontrolünden geçirmeden paranız satıcıya aktarılmaz.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/ilanlar"
                className="bg-[#ea580c] hover:bg-[#c2410c] text-white text-[12.5px] font-bold px-5 py-2.5 rounded-[3px] flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Güvenli İlanları İncele</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/ilan-ver"
                className="bg-white/10 hover:bg-white/20 text-white text-[12.5px] font-bold px-5 py-2.5 rounded-[3px] border border-white/20 flex items-center gap-1.5 transition-colors"
              >
                <span>Güvenceli İlan Ver</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. STATS / TRUST METRICS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-3.5 shadow-2xs text-center">
            <div className="text-[20px] font-black text-[#ea580c]">%100</div>
            <div className="text-[11.5px] font-bold text-[#1e293b] mt-0.5">Havuz Hesap Blokesi</div>
            <div className="text-[10px] text-[#64748b]">Onaysız para çıkışı yapılmaz</div>
          </div>
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-3.5 shadow-2xs text-center">
            <div className="text-[20px] font-black text-emerald-700">81 İl</div>
            <div className="text-[11.5px] font-bold text-[#1e293b] mt-0.5">Sigortalı Ağır Nakliye</div>
            <div className="text-[10px] text-[#64748b]">Vinç ve kasko teminatlı</div>
          </div>
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-3.5 shadow-2xs text-center">
            <div className="text-[20px] font-black text-[#0284c7]">101 Nokta</div>
            <div className="text-[11.5px] font-bold text-[#1e293b] mt-0.5">Mühendis Ekspertizi</div>
            <div className="text-[10px] text-[#64748b]">Motor, hidrolik ve PLC raporu</div>
          </div>
          <div className="bg-white border border-[#cbd5e1] rounded-[3px] p-3.5 shadow-2xs text-center">
            <div className="text-[20px] font-black text-amber-700">48 Saat</div>
            <div className="text-[11.5px] font-bold text-[#1e293b] mt-0.5">Test ve İnceleme Süresi</div>
            <div className="text-[10px] text-[#64748b]">Koşulsuz iade güvencesi</div>
          </div>
        </div>

        {/* 3. STEP BY STEP: NASIL ÇALIŞIR? */}
        <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-6 mb-6 shadow-2xs">
          <div className="text-center max-w-[650px] mx-auto mb-8">
            <span className="text-[11px] font-black text-[#ea580c] uppercase tracking-wider">
              Adım Adım Güvenli Ticaret
            </span>
            <h2 className="text-[18px] sm:text-[22px] font-black text-[#1e293b] mt-1">
              Makinam Güvende Nasıl Çalışır?
            </h2>
            <p className="text-[12px] text-[#64748b] mt-1">
              Hem alıcıyı hem de satıcıyı koruyan 4 aşamalı kurumsal güvence süreci:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="border border-[#cbd5e1] rounded-[4px] p-4 bg-[#f8fafc] relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-[#122438] text-white font-black text-[13px] flex items-center justify-center mb-3">
                  1
                </div>
                <h3 className="text-[13px] font-bold text-[#1e293b] mb-1.5">
                  Ödeme Havuzda Bloke Edilir
                </h3>
                <p className="text-[11.5px] text-[#64748b] leading-relaxed">
                  Alıcı bedeli Makinam.com lisanslı havuz hesabına yatırır. Para satıcıya hemen aktarılmaz, bloke edilir.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#e2e8f0] text-[10.5px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Para havuzda güvende
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-[#cbd5e1] rounded-[4px] p-4 bg-[#f8fafc] relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-[#122438] text-white font-black text-[13px] flex items-center justify-center mb-3">
                  2
                </div>
                <h3 className="text-[13px] font-bold text-[#1e293b] mb-1.5">
                  Sigortalı Nakliye Sevk Edilir
                </h3>
                <p className="text-[11.5px] text-[#64748b] leading-relaxed">
                  Paranın bloke olduğunu gören satıcı, makineyi anlaşmalı sigortalı lojistikle alıcının adresine sevk eder.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#e2e8f0] text-[10.5px] text-[#0284c7] font-semibold flex items-center gap-1">
                <Truck size={12} /> Tam kasko teminatlı
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-[#cbd5e1] rounded-[4px] p-4 bg-[#f8fafc] relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-[#122438] text-white font-black text-[13px] flex items-center justify-center mb-3">
                  3
                </div>
                <h3 className="text-[13px] font-bold text-[#1e293b] mb-1.5">
                  101 Nokta Test & Kontrol
                </h3>
                <p className="text-[11.5px] text-[#64748b] leading-relaxed">
                  Makine fabrikaya/adrese indiğinde alıcı 48 saat boyunca çalıştırır, ekspertiz incelemesini yapar.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#e2e8f0] text-[10.5px] text-amber-700 font-semibold flex items-center gap-1">
                <Clock size={12} /> 48 saat test süresi
              </div>
            </div>

            {/* Step 4 */}
            <div className="border border-[#cbd5e1] rounded-[4px] p-4 bg-[#f8fafc] relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black text-[13px] flex items-center justify-center mb-3">
                  4
                </div>
                <h3 className="text-[13px] font-bold text-emerald-800 mb-1.5">
                  Onay & Net IBAN Aktarımı
                </h3>
                <p className="text-[11.5px] text-[#64748b] leading-relaxed">
                  Alıcı onay verdiğinde bloke anında çözülür ve satış bedeli satıcının IBAN adresine kesintisiz aktarılır.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#e2e8f0] text-[10.5px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Kesintisiz net aktarım
              </div>
            </div>
          </div>
        </div>

        {/* 4. ALICI VS SATICI KORUMA TABLOSU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Alıcı */}
          <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-5 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#e2e8f0]">
              <div className="w-8 h-8 rounded-[3px] bg-blue-100 text-[#0284c7] flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[14px] text-[#1e293b]">Alıcılar Neden Makinam Güvende Kullanmalı?</h3>
                <span className="text-[11px] text-[#64748b]">Sıfır risk, tam garanti</span>
              </div>
            </div>

            <div className="space-y-3 text-[12px] text-[#334155]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1e293b] block">Sahte Kapora Tuzağına Son:</strong>
                  Görmediğiniz makine için satıcıya şahsi kapora göndermezsiniz; tüm bakiye tarafsız havuzda bekler.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1e293b] block">Kusurlu/Farklı Üründe %100 İade:</strong>
                  Makine kırık, motoru arızalı veya ilandaki teknik özelliklerden farklı çıkarsa paranız kuruşu kuruşuna iade edilir.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1e293b] block">Yolda Oluşabilecek Hasara Karşı Kasko:</strong>
                  Nakliye esnasında meydana gelebilecek devrilme, ıslanma ve mekanik zararlar lojistik sigortamızca karşılanır.
                </div>
              </div>
            </div>
          </div>

          {/* Satıcı */}
          <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-5 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#e2e8f0]">
              <div className="w-8 h-8 rounded-[3px] bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[14px] text-[#1e293b]">Satıcılar Neden Makinam Güvende Kullanmalı?</h3>
                <span className="text-[11px] text-[#64748b]">Garantili tahsilat, hızlı satış</span>
              </div>
            </div>

            <div className="space-y-3 text-[12px] text-[#334155]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1e293b] block">Karşılıksız Çek / Sahte Senet Yok:</strong>
                  Makinanızı göndermeden önce paranın havuzda bloke olduğunu görür, tahsilat riski almazsınız.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1e293b] block">Anında ve Kesintisiz IBAN Ödemesi:</strong>
                  Alıcı onay verdiği an satış bedeli net olarak doğrulanmış banka IBAN hesabınıza 7/24 FAST ile aktarılır.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1e293b] block">Türkiye Geneli Kurumsal Güvenilirlik:</strong>
                  Makinam Güvende logolu ilanlar alıcılar tarafından 5 kat daha fazla incelenir ve hızlı satılır.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. 101 NOKTA EKSPERTİZ DETAYI */}
        <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-6 mb-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#e2e8f0]">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#ea580c] text-white text-[10px] font-black px-2 py-0.5 rounded-[2px] uppercase">
                  Teknik Standart
                </span>
                <h3 className="text-[16px] font-black text-[#1e293b]">
                  101 Nokta Bağımsız Ekspertiz Standartları
                </h3>
              </div>
              <p className="text-[11.5px] text-[#64748b] mt-0.5">
                Makinanızın mekanik, hidrolik, elektriksel ve otomasyon durumunu inceleyen kapsamlı muayene protokolü.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 self-start md:self-auto">
              ✓ Bağımsız Mühendis Onaylı
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-[11.5px]">
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[3px]">
              <strong className="text-[#1e293b] block mb-1 font-bold">1. Şasi & Mekanik Yapı</strong>
              <p className="text-[#64748b]">Şasi çatlak kontrolü, kaynak deformasyonları, korozyon, yatak ve bilya boşlukları, kızak ve ray aşınma payı.</p>
            </div>
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[3px]">
              <strong className="text-[#1e293b] block mb-1 font-bold">2. Motor & Aktarma Organları</strong>
              <p className="text-[#64748b]">Motor kompresyon testi, şanzıman dişli durumu, debriyaj, kayış/kasnak gerginlikleri ve yağ kaçak analizleri.</p>
            </div>
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[3px]">
              <strong className="text-[#1e293b] block mb-1 font-bold">3. Hidrolik & Pnömatik</strong>
              <p className="text-[#64748b]">Pompa çalışma basınçları, silindir keçeleri, hidrolik hortum sızdırmazlıkları ve valf blok kaçak kontrolleri.</p>
            </div>
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[3px]">
              <strong className="text-[#1e293b] block mb-1 font-bold">4. PLC, Pano & Elektronik</strong>
              <p className="text-[#64748b]">İnvertör/sürücü durumları, PLC giriş-çıkışları, HMI dokunmatik paneli, acil stop ve iş güvenliği sensörleri.</p>
            </div>
          </div>
        </div>

        {/* 6. SIKÇA SORULAN SORULAR AKORDEONU */}
        <div className="bg-white border border-[#cbd5e1] rounded-[4px] p-6 mb-6 shadow-2xs">
          <div className="mb-4 pb-3 border-b border-[#e2e8f0]">
            <h3 className="text-[16px] font-black text-[#1e293b] flex items-center gap-2">
              <HelpCircle size={18} className="text-[#ea580c]" />
              <span>Makinam Güvende Hakkında Sıkça Sorulan Sorular</span>
            </h3>
            <p className="text-[11.5px] text-[#64748b] mt-0.5">
              Alım-satım süreci, ödeme blokesi ve nakliye hakkında en çok merak edilenler.
            </p>
          </div>

          <div className="divide-y divide-[#e2e8f0]">
            {(content.faqs || []).map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-3">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left flex items-center justify-between gap-3 text-[13px] font-bold text-[#1e293b] hover:text-[#ea580c] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-[#64748b] shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#ea580c]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-2 text-[12px] text-[#475569] leading-relaxed pl-1 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. BOTTOM CTA BANNER */}
        <div className="bg-[#19324d] text-white rounded-[4px] p-6 text-center border border-[#0f1f33] shadow-md">
          <div className="w-12 h-12 rounded-full bg-[#ea580c] text-white flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={28} strokeWidth={2.4} />
          </div>
          <h2 className="text-[18px] sm:text-[22px] font-black mb-1.5">
            Makinanızı Sıfır Riskle Hemen Alın veya Satın
          </h2>
          <p className="text-[12.5px] text-slate-300 max-w-[600px] mx-auto mb-5 leading-relaxed">
            Türkiye'nin ilk ve tek makineye özel güvenceli ticaret platformunda yüzlerce onaylı ilanı keşfedin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/ilanlar"
              className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-[12.5px] px-6 py-2.5 rounded-[3px] transition-colors shadow-sm"
            >
              Makinam Güvende İlanlarını Gör
            </Link>
            <Link
              to="/ilan-ver"
              className="bg-white hover:bg-gray-100 text-[#122438] font-bold text-[12.5px] px-6 py-2.5 rounded-[3px] transition-colors"
            >
              Ücretsiz Güvenli İlan Ver
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
