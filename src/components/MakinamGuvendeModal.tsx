import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  X,
  CreditCard,
  Clock,
  Sparkles,
  HelpCircle,
  FileCheck,
  Building2,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';

interface MakinamGuvendeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'steps' | 'ekspertiz' | 'nakliye' | 'protection';
}

export const MakinamGuvendeModal: React.FC<MakinamGuvendeModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'steps'
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'ekspertiz' | 'nakliye' | 'protection'>(initialTab);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full sm:w-[840px] max-w-[840px] h-[580px] max-h-[90vh] bg-white rounded-[6px] shadow-2xl border border-[#cbd5e1] overflow-hidden z-10 flex flex-col font-sans transition-all">
        
        {/* Header */}
        <div className="bg-[#122438] text-white px-5 py-4 flex items-center justify-between border-b border-[#0f1f33] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#ea580c] text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck size={24} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] sm:text-[17px] font-black tracking-tight text-white">
                  Makinam Güvende™
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9.5px] font-bold px-1.5 py-0.2 rounded">
                  %100 Korumalı Havuz Sistemi
                </span>
              </div>
              <p className="text-[11.5px] text-slate-300">
                Sanayiden Eve, Her Türlü Makinede Sıfır Riskli Alışveriş Modeli
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
            title="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-4 pt-2 flex gap-1 sm:gap-2 shrink-0 overflow-x-auto text-[12px] font-bold">
          <button
            onClick={() => setActiveTab('steps')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'steps'
                ? 'border-[#ea580c] text-[#ea580c]'
                : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <Clock size={14} />
            <span>Nasıl Çalışır? (4 Adım)</span>
          </button>

          <button
            onClick={() => setActiveTab('protection')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'protection'
                ? 'border-[#ea580c] text-[#ea580c]'
                : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <Lock size={14} />
            <span>Alıcı & Satıcı Koruması</span>
          </button>

          <button
            onClick={() => setActiveTab('ekspertiz')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'ekspertiz'
                ? 'border-[#ea580c] text-[#ea580c]'
                : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>101 Nokta Ekspertiz</span>
          </button>

          <button
            onClick={() => setActiveTab('nakliye')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'nakliye'
                ? 'border-[#ea580c] text-[#ea580c]'
                : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <Truck size={14} />
            <span>Sigortalı Nakliye</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-[#334155]">
          
          {/* TAB 1: 4 ADIMDA NASIL ÇALIŞIR */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-[4px] text-[12px] text-orange-950 flex items-start gap-2.5">
                <Sparkles size={18} className="text-[#ea580c] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-[#ea580c] block">Para Doğrudan Satıcıya Gitmez:</strong>
                  Makinam Güvende ile alım-satım yaparken ödemeniz resmi lisanslı havuz hesapta bloke edilir. Makineyi teslim alıp çalıştırana kadar para satıcıya aktarılmaz.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Adım 1 */}
                <div className="border border-[#cbd5e1] rounded-[4px] p-3.5 bg-white relative hover:border-[#ea580c] transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#122438] text-white text-[12px] font-black flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-bold text-[13px] text-[#1e293b]">
                      Alıcı Güvenle Öder (Havuz Bloke)
                    </h4>
                  </div>
                  <p className="text-[11.5px] text-[#64748b] leading-relaxed">
                    Alıcı, Makinam Güvende havuz hesabına FAST, Havale veya Kredi Kartı ile ödeme yapar. Para satıcıya hemen aktarılmaz; Makinam.com güvencesinde bloke altında tutulur. Satıcıya güvenli sevkiyat bildirimi iletilir.
                  </p>
                </div>

                {/* Adım 2 */}
                <div className="border border-[#cbd5e1] rounded-[4px] p-3.5 bg-white relative hover:border-[#ea580c] transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#122438] text-white text-[12px] font-black flex items-center justify-center">
                      2
                    </span>
                    <h4 className="font-bold text-[13px] text-[#1e293b]">
                      Satıcı Sigortalı Nakliye ile Sevk Eder
                    </h4>
                  </div>
                  <p className="text-[11.5px] text-[#64748b] leading-relaxed">
                    Paranın havuzda hazır olduğunu gören satıcı, anlaşmalı ağır nakliye veya kargo ile makineyi sigortalı olarak alıcının adresine sevk eder. Takip numarası sisteme işlenir.
                  </p>
                </div>

                {/* Adım 3 */}
                <div className="border border-[#cbd5e1] rounded-[4px] p-3.5 bg-white relative hover:border-[#ea580c] transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#122438] text-white text-[12px] font-black flex items-center justify-center">
                      3
                    </span>
                    <h4 className="font-bold text-[13px] text-[#1e293b]">
                      Teslim Alma & Ekspertiz Onayı
                    </h4>
                  </div>
                  <p className="text-[11.5px] text-[#64748b] leading-relaxed">
                    Makine alıcının fabrikasına veya adresine ulaştığında alıcı ürünü inceler, elektrik/motor testini yapar. Alıcıya 2 iş günü (48 saat) kontrol ve onay süresi tanınır.
                  </p>
                </div>

                {/* Adım 4 */}
                <div className="border border-[#cbd5e1] rounded-[4px] p-3.5 bg-white relative hover:border-[#ea580c] transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-[12px] font-black flex items-center justify-center">
                      4
                    </span>
                    <h4 className="font-bold text-[13px] text-emerald-800">
                      Onay & Satıcıya Kesintisiz Aktarım
                    </h4>
                  </div>
                  <p className="text-[11.5px] text-[#64748b] leading-relaxed">
                    Alıcı ürünün ilandaki gibi olduğunu teyit edip panelden onay verdiğinde havuzdaki bloke anında çözülür. Satış bedeli satıcının sistemdeki IBAN adresine <strong>kesintisiz ve net</strong> olarak aktarılır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALICI VE SATICI KORUMASI */}
          {activeTab === 'protection' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Alıcı Koruması */}
              <div className="border border-blue-200 bg-blue-50/30 rounded-[4px] p-4">
                <div className="flex items-center gap-2 font-bold text-blue-900 text-[13.5px] mb-3 pb-2 border-b border-blue-200">
                  <ShieldCheck size={18} className="text-[#0284c7]" />
                  <span>Alıcılar İçin %100 Güvenlik</span>
                </div>
                <ul className="space-y-2.5 text-[11.5px] text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Kapora Dolandırıcılığına Son:</strong> Tanımadığınız satıcıların şahsi hesabına güvenip kapora gönderme devri kapandı.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Farklı Ürün Gelirse İade:</strong> Makine bozuk, revizyonlu veya ilanda belirtilen özelliklerden farklı çıkarsa iade hakkınız saklıdır.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>48 Saat Test & İnceleme:</strong> Makine indiğinde ustalarınıza gösterip motorunu, hidroliğini deneyebilirsiniz.</span>
                  </li>
                </ul>
              </div>

              {/* Satıcı Koruması */}
              <div className="border border-emerald-200 bg-emerald-50/30 rounded-[4px] p-4">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-[13.5px] mb-3 pb-2 border-b border-emerald-200">
                  <Building2 size={18} className="text-emerald-700" />
                  <span>Satıcılar İçin Garantili Tahsilat</span>
                </div>
                <ul className="space-y-2.5 text-[11.5px] text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Sahte Çek/Senet Riskine Son:</strong> Karşılıksız çek veya ertelenmiş senet riski yaşamadan, paranın havuzda bloke olduğunu görerek mal gönderirsiniz.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Garantili ve Net Ödeme:</strong> Alıcı onayladığı saniye satış bedeli IBAN adresinize hiçbir kesinti olmadan net yansır.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Gerçek & Ciddi Alıcılar:</strong> Parayı önceden havuza yatıran gerçek müşterilerle görüşür, zaman kaybetmezsiniz.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: 101 NOKTA EKSPERTİZ */}
          {activeTab === 'ekspertiz' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-[4px] text-[12px]">
                <h4 className="font-bold text-[#1e293b] mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  101 Nokta Endüstriyel & Ev Tipi Makine Ekspertiz Standardı
                </h4>
                <p className="text-[#64748b] text-[11.5px]">
                  Tüm yüksek bütçeli CNC, tekstil, tarım, iş makineleri ve sanayi tipi cihazlar anlaşmalı bağımsız ekspertiz merkezlerimizce kontrolden geçirilir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px]">
                <div className="p-3 border border-[#cbd5e1] rounded-[3px] bg-white">
                  <strong className="text-[#1e293b] block mb-1 font-bold">1. Mekanik & Gövde İncelemesi</strong>
                  <p className="text-[#64748b]">Şasi çatlak kontrolü, kaynak deformasyonları, korozyon, yatak ve bilya boşlukları, kızak aşınma payı.</p>
                </div>
                <div className="p-3 border border-[#cbd5e1] rounded-[3px] bg-white">
                  <strong className="text-[#1e293b] block mb-1 font-bold">2. Motor & Güç Aktarma Organları</strong>
                  <p className="text-[#64748b]">Motor kompresyon değerleri, şanzıman dişli boşluğu, debriyaj, kayış/kasnak gerginlikleri ve yağ kaçakları.</p>
                </div>
                <div className="p-3 border border-[#cbd5e1] rounded-[3px] bg-white">
                  <strong className="text-[#1e293b] block mb-1 font-bold">3. Hidrolik & Pnömatik Sistem</strong>
                  <p className="text-[#64748b]">Pompa çalışma basınçları, silindir keçeleri, hidrolik hortum sızdırmazlıkları ve valf blok testleri.</p>
                </div>
                <div className="p-3 border border-[#cbd5e1] rounded-[3px] bg-white">
                  <strong className="text-[#1e293b] block mb-1 font-bold">4. Elektrik, Pano & PLC Otomasyonu</strong>
                  <p className="text-[#64748b]">İnvertör/sürücü durumları, PLC giriş-çıkışları, ekran/HMI paneli, acil stop ve iş güvenliği sensörleri.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SİGORTALI NAKLİYE */}
          {activeTab === 'nakliye' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-[4px] text-[12px] text-blue-950 flex items-start gap-2.5">
                <Truck size={20} className="text-[#0284c7] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-blue-900 block">81 İle Anlaşmalı Ağır Nakliye & Kargo Desteği</strong>
                  Makinanız boyutuna göre ister kargo, ister vinçli TIR veya kamyon ile tam kasko sigortası kapsamında taşınır. Taşıma sırasında yaşanabilecek her türlü kaza veya hasar %100 sigorta teminatı altındadır.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11.5px]">
                <div className="p-3 border border-[#cbd5e1] rounded-[3px] bg-white text-center">
                  <strong className="text-[#1e293b] block mb-1">Vinç & Yükleme Desteği</strong>
                  <p className="text-[#64748b]">Fabrikadan atölyeye hidrolik vinçli yükleme ve indirme desteği.</p>
                </div>
                <div className="p-3 border border-[#cbd5e1] rounded-[3px] bg-white text-center">
                  <strong className="text-[#1e293b] block mb-1">Tam Değer Emtia Kaskosu</strong>
                  <p className="text-[#64748b]">Taşıma esnasındaki devrilme, çizilme veya hasara karşı tam değer sigortası.</p>
                </div>
                <div className="p-3 border border-[#cbd5e1] rounded-[3px] bg-white text-center">
                  <strong className="text-[#1e293b] block mb-1">Sabit & Şeffaf Fiyat</strong>
                  <p className="text-[#64748b]">Sürpriz ek maliyet olmadan şeffaf lojistik fiyatlandırması.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              navigate('/makinam-guvende');
            }}
            className="text-[12px] font-bold text-[#ea580c] hover:underline flex items-center gap-1 order-2 sm:order-1"
          >
            <span>Tüm Rehberi ve SSS Sayfasını Aç</span>
            <ChevronRight size={14} />
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-[#cbd5e1] text-[#475569] text-[12px] font-bold rounded-[3px] hover:bg-gray-100 transition-colors"
            >
              Kapat
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/ilanlar');
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-[12px] font-bold rounded-[3px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Güvenli İlanları İncele</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
