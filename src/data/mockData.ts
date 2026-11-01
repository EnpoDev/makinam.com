import { Category, Listing } from '../types';

export const categories: Category[] = [
  {
    id: 'is-insaat-makineleri',
    name: 'İş & İnşaat Makineleri',
    iconName: 'HardHat',
    count: 38450,
    slug: 'is-insaat-makineleri',
    subcategories: [
      { id: 'ekskavator', name: 'Ekskavatör (Paletli/Lastikli)', count: 12430, slug: 'ekskavator' },
      { id: 'beko-loder', name: 'Beko Loder (Kazıcı Yükleyici)', count: 9120, slug: 'beko-loder' },
      { id: 'forklift-istif', name: 'Forklift, Vinç & Manlift', count: 8250, slug: 'forklift-istif' },
      { id: 'silindir-dozer', name: 'Silindir, Dozer & Greyder', count: 4890, slug: 'silindir-dozer' },
      { id: 'beton-santrali', name: 'Beton Pompası & Mikser', count: 3760, slug: 'beton-santrali' },
    ]
  },
  {
    id: 'sanayi-imalat-makineleri',
    name: 'Sanayi & İmalat Makineleri',
    iconName: 'Factory',
    count: 42100,
    slug: 'sanayi-imalat-makineleri',
    subcategories: [
      { id: 'cnc-torna-freze', name: 'CNC Torna, Freze & İşleme Merkezi', count: 14200, slug: 'cnc-torna-freze' },
      { id: 'lazer-abkant-pres', name: 'Fiber Lazer, Abkant & Pres', count: 11300, slug: 'lazer-abkant-pres' },
      { id: 'plastik-enjeksiyon', name: 'Plastik Enjeksiyon & Şişirme', count: 6800, slug: 'plastik-enjeksiyon' },
      { id: 'kompresor-jenerator', name: 'Kompresör & Jeneratör Sistemleri', count: 5400, slug: 'kompresor-jenerator' },
      { id: 'kaynak-makineleri', name: 'Gazaltı & Lazer Kaynak Makineleri', count: 4400, slug: 'kaynak-makineleri' },
    ]
  },
  {
    id: 'gida-endustriyel-mutfak',
    name: 'Gıda & Endüstriyel Mutfak',
    iconName: 'UtensilsCrossed',
    count: 28900,
    slug: 'gida-endustriyel-mutfak',
    subcategories: [
      { id: 'sanayi-tost-makineleri', name: 'Sanayi Tipi Tost & Izgara Makineleri', count: 6400, slug: 'sanayi-tost-makineleri' },
      { id: 'hamur-mikser-makarna', name: 'Hamur Yoğurma, Mikser & Makarna', count: 5900, slug: 'hamur-mikser-makarna' },
      { id: 'endustriyel-firinlar', name: 'Konveksiyonel & Taş Fırınlar', count: 4800, slug: 'endustriyel-firinlar' },
      { id: 'et-kiyma-kemik-testere', name: 'Kıyma & Kemik Testere Makineleri', count: 4200, slug: 'et-kiyma-kemik-testere' },
      { id: 'kahve-cay-otomatlari', name: 'Barista Espresso & Çay Otomatları', count: 4100, slug: 'kahve-cay-otomatlari' },
      { id: 'bulasik-yikama', name: 'Giyotin & Tezgahaltı Bulaşık Makineleri', count: 3500, slug: 'bulasik-yikama' },
    ]
  },
  {
    id: 'elektrikli-ev-aletleri',
    name: 'Elektrikli Ev & Küçük Aletler',
    iconName: 'Home',
    count: 34500,
    slug: 'elektrikli-ev-aletleri',
    subcategories: [
      { id: 'ev-tipi-tost-makinesi', name: 'Ev Tipi Tost & Waffle Makineleri', count: 8200, slug: 'ev-tipi-tost-makinesi' },
      { id: 'kahve-cay-makineleri', name: 'Kahve & Çay Hazırlama Makineleri', count: 9100, slug: 'kahve-cay-makineleri' },
      { id: 'supurge-robot', name: 'Elektrikli Süpürge & Robot Süpürgeler', count: 7400, slug: 'supurge-robot' },
      { id: 'ev-tipi-dikis-makinesi', name: 'Ev Tipi Dikiş & Nakış Makineleri', count: 4600, slug: 'ev-tipi-dikis-makinesi' },
      { id: 'ekmek-mutfak-robotu', name: 'Ekmek Yapma & Mutfak Robotları', count: 5200, slug: 'ekmek-mutfak-robotu' },
    ]
  },
  {
    id: 'tekstil-konfeksiyon',
    name: 'Tekstil & Konfeksiyon',
    iconName: 'Scissors',
    count: 31200,
    slug: 'tekstil-konfeksiyon',
    subcategories: [
      { id: 'sanayi-dikis-overlok', name: 'Sanayi Dikiş, Overlok & Reçme', count: 12800, slug: 'sanayi-dikis-overlok' },
      { id: 'orme-dokuma-makineleri', name: 'Örme & Dokuma Tezgahları', count: 8400, slug: 'orme-dokuma-makineleri' },
      { id: 'kumas-kesim-cutter', name: 'CNC Kumaş Kesim Motorları (Cutter)', count: 4100, slug: 'kumas-kesim-cutter' },
      { id: 'nakis-baski-otomatlari', name: 'Çok Kafalı Nakış & Baskı Makineleri', count: 3900, slug: 'nakis-baski-otomatlari' },
      { id: 'utu-tela-pres', name: 'Paskara Ütü Masası & Tela Presleri', count: 2000, slug: 'utu-tela-pres' },
    ]
  },
  {
    id: 'tarim-bahce-makineleri',
    name: 'Tarım & Bahçe Makineleri',
    iconName: 'Tractor',
    count: 27800,
    slug: 'tarim-bahce-makineleri',
    subcategories: [
      { id: 'traktor-ekipman', name: 'Traktörler & Taşıma Römorkları', count: 14200, slug: 'traktor-ekipman' },
      { id: 'bicerdover-balya', name: 'Biçerdöver & Balya Makineleri', count: 4600, slug: 'bicerdover-balya' },
      { id: 'capa-cim-bicme', name: 'Motorlu Çapa & Çim Biçme Makineleri', count: 5100, slug: 'capa-cim-bicme' },
      { id: 'sut-sagim-yem', name: 'Süt Sağım & Yem Karma Makineleri', count: 3900, slug: 'sut-sagim-yem' },
    ]
  },
  {
    id: 'ahsap-metal-marangozluk',
    name: 'Ahşap, Metal & Marangozluk',
    iconName: 'Wrench',
    count: 19400,
    slug: 'ahsap-metal-marangozluk',
    subcategories: [
      { id: 'agac-kesim-hizar', name: 'Yatar Daire & Hızar Kesim Makineleri', count: 6800, slug: 'agac-kesim-hizar' },
      { id: 'kenar-bantlama-cizici', name: 'Kenar Bantlama & Çizicili Yatar', count: 5200, slug: 'kenar-bantlama-cizici' },
      { id: 'planya-kalinlik', name: 'Planya & Kalınlık Makineleri', count: 4100, slug: 'planya-kalinlik' },
      { id: 'matkap-zimpara', name: 'Sütunlu Matkap & Zımpara Makineleri', count: 3300, slug: 'matkap-zimpara' },
    ]
  },
  {
    id: 'temizlik-yikama-makineleri',
    name: 'Temizlik & Yıkama Makineleri',
    iconName: 'Sparkles',
    count: 15300,
    slug: 'temizlik-yikama-makineleri',
    subcategories: [
      { id: 'basincli-oto-yikama', name: 'Basınçlı Oto Yıkama & Sıcak Sulu Yıkama', count: 5800, slug: 'basincli-oto-yikama' },
      { id: 'zemin-yikama-otomatlari', name: 'Binicili / İtmeli Zemin Yıkama Otomatı', count: 3900, slug: 'zemin-yikama-otomatlari' },
      { id: 'hali-yikama-sikma', name: 'Otomatik Halı Yıkama & Sıkma Makineleri', count: 3400, slug: 'hali-yikama-sikma' },
      { id: 'koltuk-yikama-sanayi-supurge', name: 'Buharlı Koltuk Yıkama & Sanayi Süpürgesi', count: 2200, slug: 'koltuk-yikama-sanayi-supurge' },
    ]
  },
  {
    id: 'paketleme-dolum-etiket',
    name: 'Paketleme, Dolum & Etiketleme',
    iconName: 'Boxes',
    count: 11800,
    slug: 'paketleme-dolum-etiket',
    subcategories: [
      { id: 'otomatik-dolum', name: 'Sıvı & Toz Dolum Makineleri', count: 3900, slug: 'otomatik-dolum' },
      { id: 'vakum-paketleme', name: 'Termoform & Vakum Paketleme', count: 3600, slug: 'vakum-paketleme' },
      { id: 'shrink-koli-bantlama', name: 'Shrink & Koli Bantlama Makineleri', count: 2500, slug: 'shrink-koli-bantlama' },
      { id: 'etiketleme-kodlama', name: 'Tarih Kodlama & Otomatik Etiketleme', count: 1800, slug: 'etiketleme-kodlama' },
    ]
  },
  {
    id: 'yedek-parca-motorlar',
    name: 'Yedek Parça, Motor & Aksam',
    iconName: 'Cog',
    count: 48900,
    slug: 'yedek-parca-motorlar',
    subcategories: [
      { id: 'elektrik-motoru-reduktor', name: 'Elektrik Motorları & Redüktörler', count: 16800, slug: 'elektrik-motoru-reduktor' },
      { id: 'hidrolik-pnomatik', name: 'Hidrolik Pompa, Piston & Valfler', count: 13400, slug: 'hidrolik-pnomatik' },
      { id: 'rezistans-termostat', name: 'Tost / Fırın Rezistansları & Termostatlar', count: 9800, slug: 'rezistans-termostat' },
      { id: 'kayis-zincir-rulman', name: 'Rulman, Kayış & Dişli Grupları', count: 8900, slug: 'kayis-zincir-rulman' },
    ]
  }
];

// Mock listings are cleared. Real listings are loaded from Firestore.
export const mockListings: Listing[] = [];

export const popularSearches = [
  'Sanayi Tipi Tost Makinesi',
  'Ev Tipi Döküm Tost Makinesi',
  'JCB Beko Loder Kazıcı',
  'Juki Düz Dikiş Makinesi',
  'CNC Torna Tezgahı',
  'Hamur Yoğurma Makinesi 50kg',
  '3 Ton Dizel Forklift',
  'Basınçlı Oto Yıkama Makinesi',
  'New Holland Traktör',
  'DeLonghi Kahve Makinesi',
  'Kärcher Halı Yıkama Makinesi',
  'Fiber Lazer Kesim',
  'Ahşap Yatar Daire Hızar',
  'Vakum Paketleme Makinesi',
  'Elektrik Motoru 11 kW'
];

export const popularBrands = [
  { name: 'Öztiryakiler', count: '4.150 İlan' },
  { name: 'Hidromek', count: '6.450 İlan' },
  { name: 'Tefal / Arzum', count: '8.920 İlan' },
  { name: 'Juki', count: '9.420 İlan' },
  { name: 'Caterpillar', count: '5.120 İlan' },
  { name: 'Mazak', count: '1.240 İlan' },
  { name: 'Kärcher', count: '3.890 İlan' },
  { name: 'New Holland', count: '8.340 İlan' },
  { name: 'Toyota Forklift', count: '2.450 İlan' },
  { name: 'DeLonghi', count: '2.100 İlan' },
  { name: 'Durma', count: '1.450 İlan' },
  { name: 'Boğaziçi Mutfak', count: '1.870 İlan' }
];
