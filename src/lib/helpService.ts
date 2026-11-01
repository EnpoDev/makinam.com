import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, cleanFirestoreDoc } from './firebase';

export interface FAQItem {
  id: string;
  category: 'ilan' | 'odeme' | 'uyelik' | 'lojistik' | 'guvenlik' | string;
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
}

export interface QuickCard {
  id: string;
  title: string;
  description: string;
  category: string;
  buttonText: string;
  iconType: 'shield' | 'file' | 'building' | 'truck';
  color: 'blue' | 'orange' | 'green' | 'indigo';
}

export interface HelpCategory {
  id: string;
  label: string;
  iconName?: string;
}

export interface HelpSettings {
  badgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  phone: string;
  phoneHours: string;
  email: string;
  contactTitle: string;
  contactDescription: string;
  quickCards: QuickCard[];
  categories?: HelpCategory[];
}

export const DEFAULT_HELP_SETTINGS: HelpSettings = {
  badgeText: 'Makinam.com Yardım & Destek Merkezi',
  heroTitle: 'Size Nasıl Yardımcı Olabiliriz?',
  heroSubtitle: 'Makine ilanı verme, Makinam Güvende ödeme koruması, ekspertiz ve kurumsal mağaza konularında en çok sorulan soruların yanıtları.',
  phone: '0 850 123 45 67',
  phoneHours: 'Hafta içi 09:00 - 18:00',
  email: 'destek@makinam.com',
  contactTitle: 'Canlı Destek Hattı',
  contactDescription: 'Sorunuza yanıt bulamadınız mı? Müşteri destek uzmanlarımız hafta içi 09:00 - 18:00 saatleri arasında yardıma hazırdır.',
  categories: [
    { id: 'all', label: 'Tüm Konular', iconName: 'help' },
    { id: 'ilan', label: 'İlan İşlemleri', iconName: 'file' },
    { id: 'odeme', label: 'Makinam Güvende & Ödeme', iconName: 'card' },
    { id: 'uyelik', label: 'Üyelik & Kurumsal Mağaza', iconName: 'building' },
    { id: 'lojistik', label: 'Ekspertiz & Nakliye', iconName: 'truck' },
    { id: 'guvenlik', label: 'Güvenlik & Kurallar', iconName: 'shield' }
  ],
  quickCards: [
    {
      id: 'card-guvende',
      title: 'Makinam Güvende',
      description: 'Satıcı ve alıcıyı koruyan güvenli havuz hesabı ödeme koruması nasıl işler?',
      category: 'odeme',
      buttonText: 'Detayları İncele',
      iconType: 'shield',
      color: 'blue'
    },
    {
      id: 'card-ilan',
      title: 'İlan Verme Rehberi',
      description: 'Makinenizi en doğru fiyata ve en hızlı şekilde satmanın püf noktaları.',
      category: 'ilan',
      buttonText: 'Adım Adım Öğren',
      iconType: 'file',
      color: 'orange'
    },
    {
      id: 'card-magaza',
      title: 'Kurumsal Mağaza',
      description: 'Makine galerileri, üreticiler ve bayiler için toplu satış ve vitrin ayrıcalıkları.',
      category: 'uyelik',
      buttonText: 'Mağaza Avantajları',
      iconType: 'building',
      color: 'green'
    },
    {
      id: 'card-lojistik',
      title: 'Ekspertiz & Nakliye',
      description: 'Ağır sanayi makineleri için yerinde ekspertiz ve sigortalı lowbed taşımacılığı.',
      category: 'lojistik',
      buttonText: 'Hizmet Bilgisi',
      iconType: 'truck',
      color: 'indigo'
    }
  ]
};

export const DEFAULT_FAQS: FAQItem[] = [
  // İLAN İŞLEMLERİ
  {
    id: 'ilan-nasil-verilir',
    category: 'ilan',
    question: 'Makinam.com üzerinde nasıl makine ilanı verebilirim?',
    answer: 'Üst menüdeki turuncu "+ Ücretsiz İlan Ver" butonuna tıklayarak ilan verme sihirbazına ulaşabilirsiniz. 5 adımlı süreçte önce makinanızın kategorisini belirleyin, teknik özelliklerini (marka, model, çalışma saati vb.) doldurun, cihazınızdan fotoğrafları yükleyin ve konum/iletişim bilgilerinizi onaylayarak ilanınızı anında yayına alabilirsiniz.',
    order: 1,
    isActive: true
  },
  {
    id: 'ilan-ucretli-mi',
    category: 'ilan',
    question: 'İlan vermek ücretli mi?',
    answer: 'Bireysel üyelerimiz için standart makine ilanı vermek tamamen ÜCRETSİZDİR. İlanınızı daha hızlı satmak isterseniz "Acil Acil Vitrini" veya "Anasayfa Vitrini" gibi ek doping paketlerinden faydalanabilirsiniz. Kurumsal üyelerimiz ise seçtikleri mağaza paketine göre aylık toplu ilan yayınlama hakkına sahip olurlar.',
    order: 2,
    isActive: true
  },
  {
    id: 'foto-yukleme-limiti',
    category: 'ilan',
    question: 'Bir ilana en fazla kaç adet fotoğraf yükleyebilirim?',
    answer: 'Her ilan için en fazla 15 adet yüksek çözünürlüklü fotoğraf yükleyebilirsiniz. Yüklediğiniz fotoğraflar sistemimiz tarafından otomatik olarak optimize edilir ve vitrin kapak fotoğrafınızı dilediğiniz gibi seçebilirsiniz.',
    order: 3,
    isActive: true
  },
  {
    id: 'ilan-onay-suresi',
    category: 'ilan',
    question: 'İlanımın onaylanması ne kadar sürer?',
    answer: 'Makinam.com kalite standartları gereği ilanlar editörlerimiz tarafından incelenir. İlanınızın kurallara uygun olması halinde genellikle 5 ila 15 dakika içerisinde otomatik onaylanarak yayına alınır.',
    order: 4,
    isActive: true
  },
  {
    id: 'ilan-duzenleme-silme',
    category: 'ilan',
    question: 'Yayındaki ilanımı nasıl güncellerim veya silerim?',
    answer: 'Sağ üstteki profil menünüzden "İlanlarım" sayfasına giderek yayındaki ilanlarınızı görebilir, durumunu (Yayında, Pasif, Satıldı) tek tıkla değiştirebilir veya "İlanı Sil" butonuyla kalıcı olarak sistemden kaldırabilirsiniz.',
    order: 5,
    isActive: true
  },

  // MAKİNAM GÜVENDE & ÖDEME
  {
    id: 'makinam-guvende-nedir',
    category: 'odeme',
    question: '"Makinam Güvende" havuz hesabı ödeme koruması nedir?',
    answer: 'Makinam Güvende, yüksek bedelli makine alım-satımlarında alıcı ve satıcıyı koruyan güvenceli ödeme sistemidir. Alıcı ödemeyi Makinam.com güvenceli havuz hesabına yatırır. Makine teslim alınıp fiziki ekspertiz onayı verilene kadar para satıcıya aktarılmaz, bloke altında tutulur. Onay verildiğinde tutar satıcının IBAN adresine kesintisiz aktarılır.',
    order: 6,
    isActive: true
  },
  {
    id: 'iban-tanimlama',
    category: 'odeme',
    question: 'IBAN bilgilerimi sisteme nasıl kaydederim?',
    answer: 'Profil sayfanızdaki "Banka ve IBAN Bilgileri" sekmesinden Türkiye\'deki herhangi bir bankaya ait IBAN adresinizi tanımlayabilirsiniz. Sistemimiz girdiğiniz IBAN\'ın hangi bankaya ait olduğunu otomatik olarak tespit eder ve doğrular. Yasal güvenlik gereği IBAN hesap sahibi adı ile Makinam.com üye adınızın uyuşması gerekmektedir.',
    order: 7,
    isActive: true
  },
  {
    id: 'para-ne-zaman-gonderilir',
    category: 'odeme',
    question: 'Satış bedeli satıcı hesabına ne zaman aktarılır?',
    answer: 'Alıcı makineyi teslim aldığında ve sistem üzerinden "Teslim Aldım / Onaylıyorum" butonuna bastığında, satış bedeli 7/24 FAST veya Havale/EFT ile en geç 1 iş saati içerisinde satıcının tanımlı IBAN adresine gönderilir.',
    order: 8,
    isActive: true
  },

  // ÜYELİK & KURUMSAL MAĞAZA
  {
    id: 'bireysel-kurumsal-fark',
    category: 'uyelik',
    question: 'Bireysel ve Kurumsal üyelik arasındaki farklar nelerdir?',
    answer: 'Bireysel üyelik kendi makinesini satmak veya makine satın almak isteyen şahıslar içindir. Kurumsal üyelik ise makine galerileri, yetkili bayiler ve üretici sanayi firmaları içindir. Kurumsal üyeler; özel kurumsal mağaza sayfası (makinam.com/magaza/firma-adi), sınırsız ilan yükleme, toplu envanter yönetimi ve öncelikli destek imkanına sahip olurlar.',
    order: 9,
    isActive: true
  },
  {
    id: 'magaza-nasil-acilir',
    category: 'uyelik',
    question: 'Kurumsal mağaza nasıl açılır?',
    answer: 'Üst menüdeki "Kurumsal Mağaza Aç" butonuna tıklayarak veya /kurumsal-magaza-ac adresinden şirket ve vergi levhası bilgilerinizi içeren başvuru formunu doldurabilirsiniz. Başvurunuz veritabanına kaydedilir ve kurumsal müşteri temsilcimiz belgelerinizi inceleyip onayladıktan sonra kurumsal mağaza üyeliğiniz aktif edilir.',
    order: 10,
    isActive: true
  },
  {
    id: 'sifre-sifirlama',
    category: 'uyelik',
    question: 'Şifremi unuttum, hesabıma nasıl erişebilirim?',
    answer: 'Giriş Yap ekranındaki "Şifremi Unuttum" bağlantısına tıklayarak kayıtlı e-posta adresinizi giriniz. E-posta adresinize birkaç saniye içerisinde güvenli şifre sıfırlama bağlantısı iletilecektir.',
    order: 11,
    isActive: true
  },

  // LOJİSTİK & EKSPERTİZ
  {
    id: 'ekspertiz-nasil-yapilir',
    category: 'lojistik',
    question: 'Ağır iş ve sanayi makinelerinde ekspertiz desteği nasıl alınır?',
    answer: 'Makinam.com, Türkiye genelinde anlaşmalı bağımsız ekspertiz firmalarıyla çalışır. İlan detay sayfasındaki "Ekspertiz Talep Et" butonuyla makinenin bulunduğu ilde yerinde motor, hidrolik, şanzıman ve mekanik ekspertiz raporu talep edebilirsiniz.',
    order: 12,
    isActive: true
  },
  {
    id: 'nakliye-lowbed',
    category: 'lojistik',
    question: 'Satın aldığım makinenin nakliyesi (Lowbed/Tır) nasıl sağlanır?',
    answer: 'CNC, torna, ekskavatör veya vinç gibi ağır tonajlı makineler için Makinam.com lojistik partnerleri üzerinden uygun fiyatlı sigortalı lowbed ve vinçli nakliye teklifi alabilir, makinenizi atölyenizden veya şantiyenizden kapınıza kadar teslim alabilirsiniz.',
    order: 13,
    isActive: true
  },

  // GÜVENLİK
  {
    id: 'supheli-ilan-bildir',
    category: 'guvenlik',
    question: 'Şüpheli bir ilanı veya satıcıyı nasıl şikayet edebilirim?',
    answer: 'İlan detay sayfasında yer alan "İlan ile İlgili Şikayetim Var" butonuna tıklayarak veya doğrudan 0850 123 45 67 numaralı hattımızı arayarak şüpheli durumları bildirebilirsiniz. Güvenlik ekibimiz şikayetleri ortalama 30 dakika içinde inceler.',
    order: 14,
    isActive: true
  },
  {
    id: 'kapora-dolandiriciligi',
    category: 'guvenlik',
    question: 'Kapora dolandırıcılığına karşı nasıl korunabilirim?',
    answer: 'Makinayı fiziki olarak görmeden veya Makinam Güvende havuz sistemini kullanmadan satıcıların şahsi hesaplarına kesinlikle kapora veya ön ödeme göndermeyiniz. Resmi sözleşme ve güvenli havuz hesabı harici yapılan ödemelerden Makinam.com sorumlu tutulamaz.',
    order: 15,
    isActive: true
  }
];

/**
 * Seeds initial FAQs and settings into Firestore if not present.
 */
export async function seedHelpDataIfEmpty(): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'help_page');
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, cleanFirestoreDoc(DEFAULT_HELP_SETTINGS));
      console.log("Firestore 'settings/help_page' başarıyla oluşturuldu.");
    }

    const faqsCol = collection(db, 'faqs');
    const faqsSnap = await getDocs(faqsCol);

    if (faqsSnap.empty) {
      for (const faq of DEFAULT_FAQS) {
        await setDoc(doc(faqsCol, faq.id), cleanFirestoreDoc(faq));
      }
      console.log(`Firestore 'faqs' koleksiyonuna ${DEFAULT_FAQS.length} adet varsayılan soru eklendi.`);
    }
  } catch (err) {
    console.warn('Firestore yardım verisi senkronizasyon uyarısı:', err);
  }
}

/**
 * Subscribes to real-time updates for FAQs.
 */
export function subscribeToFAQs(callback: (faqs: FAQItem[]) => void) {
  const faqsCol = collection(db, 'faqs');
  return onSnapshot(
    faqsCol,
    (snapshot) => {
      const items: FAQItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          ...data,
          id: d.id,
          order: typeof data.order === 'number' ? data.order : 99,
          isActive: data.isActive !== false
        } as FAQItem);
      });
      // Sort by order ascending
      items.sort((a, b) => (a.order || 99) - (b.order || 99));
      callback(items);
    },
    (err) => {
      console.warn('Firestore faqs listener hatası:', err);
    }
  );
}

/**
 * Subscribes to real-time updates for Help Page settings.
 */
export function subscribeToHelpSettings(callback: (settings: HelpSettings) => void) {
  const settingsRef = doc(db, 'settings', 'help_page');
  return onSnapshot(
    settingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({
          ...DEFAULT_HELP_SETTINGS,
          ...snapshot.data()
        } as HelpSettings);
      } else {
        callback(DEFAULT_HELP_SETTINGS);
      }
    },
    (err) => {
      console.warn('Firestore help_page settings listener hatası:', err);
    }
  );
}

/**
 * Adds or updates an FAQ item in Firestore.
 */
export async function saveFAQToFirestore(faq: FAQItem): Promise<void> {
  const docRef = doc(db, 'faqs', faq.id);
  await setDoc(docRef, cleanFirestoreDoc({
    ...faq,
    updatedAt: new Date().toISOString()
  }), { merge: true });
}

/**
 * Deletes an FAQ item from Firestore.
 */
export async function deleteFAQFromFirestore(faqId: string): Promise<void> {
  const docRef = doc(db, 'faqs', faqId);
  await deleteDoc(docRef);
}

/**
 * Updates Help Page settings in Firestore.
 */
export async function saveHelpSettingsToFirestore(settings: Partial<HelpSettings>): Promise<void> {
  const settingsRef = doc(db, 'settings', 'help_page');
  await setDoc(settingsRef, cleanFirestoreDoc({
    ...settings,
    updatedAt: new Date().toISOString()
  }), { merge: true });
}
