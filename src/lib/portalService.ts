import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

export interface PopularBrandItem {
  name: string;
  count: string;
}

export interface ServiceBoxItem {
  id: string;
  title: string;
  desc: string;
  tag: string;
  iconName: string;
  color: string;
  bg: string;
  link: string;
}

export interface PresetPhotoItem {
  title: string;
  tag: string;
  badge: string;
  images: string[];
}

export interface MakinamGuvendeData {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  supportPhone: string;
  faqs: { q: string; a: string }[];
}

// Default initial seeds to push to Firestore
export const DEFAULT_POPULAR_BRANDS: PopularBrandItem[] = [
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

export const DEFAULT_POPULAR_SEARCHES: string[] = [
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

export const DEFAULT_SERVICES: ServiceBoxItem[] = [
  {
    id: 'makinam-guvende',
    title: 'Makinam Güvende',
    desc: 'Ödemeniz teslim alıp test edene kadar havuz hesapta bloke edilir.',
    tag: 'GÜVENLİ ÖDEME',
    iconName: 'ShieldCheck',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    link: '/makinam-guvende'
  },
  {
    id: 'ekspertiz',
    title: 'Bağımsız Makine Ekspertizi',
    desc: 'İş makinesi, torna ve mutfak ekipmanları için yerinde durum tespiti.',
    tag: 'EKSPERTİZ',
    iconName: 'FileCheck',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    link: '/makinam-guvende'
  },
  {
    id: 'nakliye',
    title: '81 İle Anlaşmalı Nakliye',
    desc: 'Küçük aletlere anlaşmalı kargo, ağır tonajlı makinelere özel vinçli taşıma.',
    tag: 'LOJİSTİK',
    iconName: 'Truck',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    link: '/makinam-guvende'
  },
  {
    id: 'degerleme',
    title: 'Piyasa Değerleme & Takas',
    desc: 'Makinenizin güncel piyasa değerini öğrenin, yeni makineyle takas edin.',
    tag: 'DEĞERLEME',
    iconName: 'Calculator',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    link: '/ilan-ver'
  }
];

export const DEFAULT_PRESET_PHOTOS: PresetPhotoItem[] = [
  {
    title: 'Sanayi Tipi Tost Makinesi',
    tag: 'Gıda / Mutfak',
    badge: 'Döküm Pleyt',
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    title: 'Ev Tipi Granit Tost & Izgara',
    tag: 'Ev Aletleri',
    badge: 'Çıkarılabilir Plaka',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    title: 'CNC Torna & İşleme Merkezi',
    tag: 'Sanayi & İmalat',
    badge: 'Siemens Kontrol',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    title: 'Paletli Ekskavatör',
    tag: 'İş & İnşaat',
    badge: '22 Ton',
    images: [
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    title: '3 Ton Dizel Forklift',
    tag: 'İstif & Taşıma',
    badge: 'Tripleks Asansör',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    title: 'Otomatik Hamur Yoğurma',
    tag: 'Fırın & Pasta',
    badge: '50 Kg Spiral',
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

export const DEFAULT_MAKINAM_GUVENDE: MakinamGuvendeData = {
  heroBadge: 'Resmi Güvenli Ticaret Protokolü',
  heroTitle: 'Sanayiden Eve, Her Türlü Makinede Sıfır Riskli Alışveriş',
  heroDescription: 'Makinam Güvende; sanayi tezgahlarından tarım traktörlerine, dikiş makinelerinden ev tipi fırın ve tost makinelerine kadar tüm alım-satım süreçlerinde paranızı lisanslı havuz hesapta korur. Ürünü teslim alıp ekspertiz kontrolünden geçirmeden paranız satıcıya aktarılmaz.',
  supportPhone: '0850 123 45 67',
  faqs: [
    {
      q: 'Makinam Güvende havuz hesabı sistemi nasıl çalışır?',
      a: 'Makinam Güvende, yüksek bedelli makine alım-satımlarında alıcı ve satıcıyı koruyan güvenceli ödeme modelidir. Alıcı ödemeyi Makinam.com güvenceli havuz hesabına yatırır. Makine teslim alınıp fiziki ekspertiz onayı verilene kadar para satıcıya aktarılmaz, bloke altında tutulur. Onay verildiğinde tutar satıcının IBAN adresine kesintisiz aktarılır.'
    },
    {
      q: 'Alıcı ürünü beğenmez veya makine arızalı/farklı çıkarsa ne olur?',
      a: 'Makine alıcının adresine ulaştığında 2 iş günü (48 saat) inceleme süresi başlar. Eğer makine ilandaki teknik özelliklerle uyuşmuyorsa veya çalışmıyorsa alıcı panelden iade talebi oluşturur. Havuzdaki para satıcıya ödenmez; makine anlaşmalı lojistikle satıcıya geri gönderildiğinde alıcının parası eksiksiz iade edilir.'
    },
    {
      q: 'Satıcı olarak param ne zaman ve nasıl ödenir?',
      a: 'Alıcı makineyi teslim alıp panelden "Onayla" butonuna bastığı an veya 48 saatlik yasal inceleme süresi dolduğunda havuzdaki bloke çözülür ve satış tutarı satıcının sistemde kayıtlı IBAN hesabına 7/24 FAST/EFT ile anında aktarılır.'
    },
    {
      q: 'Ağır sanayi makinelerinin nakliyesi ve vinç işlemleri nasıl yapılıyor?',
      a: 'Makinam.com, 81 ilde anlaşmalı ağır nakliye filoları ve mobil vinç operatörleri ile entegredir. Satıcının fabrikasından vinçle yüklenip alıcının atölyesine kadar sigortalı kasko güvencesiyle sevk edilir. Yol boyunca oluşabilecek her türlü devrilme ve hasar poliçe teminatı altındadır.'
    },
    {
      q: '101 Nokta Ekspertiz raporu zorunlu mu?',
      a: '101 Nokta Ekspertiz, alıcının veya satıcının isteğine bağlı olarak sunulan opsiyonel bir güvence hizmetidir. Ekspertiz talep edildiğinde bağımsız makine mühendislerimiz ve teknisyenlerimiz sahaya giderek motor, hidrolik, şasi ve PLC otomasyon testlerini gerçekleştirip resmi rapor üretir.'
    },
    {
      q: 'Sistem komisyonu veya ücretlendirme nasıldır?',
      a: 'Satıcıdan herhangi bir ilan verme veya gizli kesinti alınmaz; satıcı belirlediği satış fiyatını net olarak IBAN hesabına alır. Güvenli havuz ödeme altyapısı ve sigortalı takip hizmet bedeli şeffaf olarak alıcı faturasında gösterilir.'
    }
  ]
};

// Seed function ensuring everything exists in Firestore `settings` collection
export const seedPortalDataIfEmpty = async (): Promise<void> => {
  try {
    // 1. Popular Brands
    const brandsRef = doc(db, 'settings', 'popular_brands');
    const brandsSnap = await getDoc(brandsRef);
    if (!brandsSnap.exists()) {
      await setDoc(brandsRef, { items: DEFAULT_POPULAR_BRANDS, updatedAt: new Date().toISOString() });
      console.log("Firestore'a varsayılan popüler markalar kaydedildi.");
    }

    // 2. Popular Searches
    const searchesRef = doc(db, 'settings', 'popular_searches');
    const searchesSnap = await getDoc(searchesRef);
    if (!searchesSnap.exists()) {
      await setDoc(searchesRef, { queries: DEFAULT_POPULAR_SEARCHES, updatedAt: new Date().toISOString() });
      console.log("Firestore'a varsayılan popüler aramalar kaydedildi.");
    }

    // 3. Service Boxes
    const servicesRef = doc(db, 'settings', 'service_boxes');
    const servicesSnap = await getDoc(servicesRef);
    if (!servicesSnap.exists()) {
      await setDoc(servicesRef, { items: DEFAULT_SERVICES, updatedAt: new Date().toISOString() });
      console.log("Firestore'a varsayılan hizmet kutuları kaydedildi.");
    }

    // 4. Preset Photos
    const photosRef = doc(db, 'settings', 'preset_photos');
    const photosSnap = await getDoc(photosRef);
    if (!photosSnap.exists()) {
      await setDoc(photosRef, { items: DEFAULT_PRESET_PHOTOS, updatedAt: new Date().toISOString() });
      console.log("Firestore'a varsayılan örnek ilan fotoğrafları kaydedildi.");
    }

    // 5. Makinam Güvende Settings
    const guvendeRef = doc(db, 'settings', 'makinam_guvende');
    const guvendeSnap = await getDoc(guvendeRef);
    if (!guvendeSnap.exists()) {
      await setDoc(guvendeRef, { ...DEFAULT_MAKINAM_GUVENDE, updatedAt: new Date().toISOString() });
      console.log("Firestore'a varsayılan Makinam Güvende verileri kaydedildi.");
    }
  } catch (error) {
    console.warn("Portal verileri Firestore'a aktarılırken hata:", error);
  }
};

// Live Subscriptions / Getters

export const subscribeToPopularBrands = (callback: (brands: PopularBrandItem[]) => void) => {
  const ref = doc(db, 'settings', 'popular_brands');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists() && Array.isArray(snap.data().items)) {
        callback(snap.data().items);
      } else {
        callback(DEFAULT_POPULAR_BRANDS);
      }
    },
    (err) => {
      console.warn("Popüler markalar çekilemedi, varsayılan kullanılıyor:", err);
      callback(DEFAULT_POPULAR_BRANDS);
    }
  );
};

export const subscribeToPopularSearches = (callback: (searches: string[]) => void) => {
  const ref = doc(db, 'settings', 'popular_searches');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists() && Array.isArray(snap.data().queries)) {
        callback(snap.data().queries);
      } else {
        callback(DEFAULT_POPULAR_SEARCHES);
      }
    },
    (err) => {
      console.warn("Popüler aramalar çekilemedi, varsayılan kullanılıyor:", err);
      callback(DEFAULT_POPULAR_SEARCHES);
    }
  );
};

export const subscribeToServices = (callback: (services: ServiceBoxItem[]) => void) => {
  const ref = doc(db, 'settings', 'service_boxes');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists() && Array.isArray(snap.data().items)) {
        callback(snap.data().items);
      } else {
        callback(DEFAULT_SERVICES);
      }
    },
    (err) => {
      console.warn("Hizmetler çekilemedi, varsayılan kullanılıyor:", err);
      callback(DEFAULT_SERVICES);
    }
  );
};

export const subscribeToPresetPhotos = (callback: (photos: PresetPhotoItem[]) => void) => {
  const ref = doc(db, 'settings', 'preset_photos');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists() && Array.isArray(snap.data().items)) {
        callback(snap.data().items);
      } else {
        callback(DEFAULT_PRESET_PHOTOS);
      }
    },
    (err) => {
      console.warn("Örnek fotoğraflar çekilemedi, varsayılan kullanılıyor:", err);
      callback(DEFAULT_PRESET_PHOTOS);
    }
  );
};

export const subscribeToMakinamGuvende = (callback: (data: MakinamGuvendeData) => void) => {
  const ref = doc(db, 'settings', 'makinam_guvende');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists() && snap.data()) {
        callback(snap.data() as MakinamGuvendeData);
      } else {
        callback(DEFAULT_MAKINAM_GUVENDE);
      }
    },
    (err) => {
      console.warn("Makinam Güvende ayarları çekilemedi, varsayılan kullanılıyor:", err);
      callback(DEFAULT_MAKINAM_GUVENDE);
    }
  );
};
