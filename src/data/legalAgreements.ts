export interface LegalSection {
  id: string;
  title: string;
  content: string[];
}

export interface LegalAgreement {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  lastUpdated: string;
  version: string;
  summary: string;
  sections: LegalSection[];
}

export const LEGAL_AGREEMENTS: Record<string, LegalAgreement> = {
  'kurumsal-magaza-sozlesmesi': {
    id: 'kurumsal-magaza-sozlesmesi',
    slug: 'kurumsal-magaza-sozlesmesi',
    title: 'Makinam.com Kurumsal Mağaza Açılış ve Hizmet Sözleşmesi',
    shortTitle: 'Kurumsal Mağaza Sözleşmesi',
    lastUpdated: '1 Kasım 2026',
    version: 'v2.4',
    summary:
      'İşbu sözleşme; Makinam.com platformunda kurumsal mağaza açan, iş makinesi, sanayi tezgahı, tarım ve endüstriyel ekipman satışı/kiralama faaliyeti yürüten ticari işletmeler ile Makinam.com arasındaki hak, yükümlülük ve şartları düzenler.',
    sections: [
      {
        id: 'taraflar',
        title: 'Madde 1: Taraflar ve Tanımlar',
        content: [
          '1.1. İşbu sözleşme, bir tarafta Türkiye Cumhuriyeti kanunlarına uygun olarak faaliyet gösteren Makinam.com Bilişim ve Teknoloji A.Ş. (bundan böyle "Makinam.com" veya "Platform" olarak anılacaktır) ile diğer tarafta Makinam.com portalı üzerinde kurumsal mağaza açmak üzere başvuran ve başvurusu Makinam.com temsilcisi tarafından onaylanan tüzel kişi veya tacir gerçek kişi (bundan böyle "Kurumsal Mağaza" veya "Satıcı" olarak anılacaktır) arasında akdedilmiştir.',
          '1.2. Platform: Makinam.com alan adı, alt alan adları ve mobil uygulamaları üzerinden hizmet sunan elektronik ticaret ve ilan aracılık ortamını ifade eder.',
          '1.3. Alıcı: Platform üzerinde Kurumsal Mağaza tarafından listelenen makine ve teçhizatı satın almak veya kiralamak üzere inceleyen, teklif veren ya da sipariş oluşturan gerçek ve tüzel kişileri ifade eder.',
          '1.4. Makinam Güvende: Alıcı tarafından ödenen satış bedelinin, makine alıcıya teslim edilip fiziki/teknik uygunluk teyidi verilene kadar anlaşmalı lisanslı finans kuruluşu havuz hesabında bloke edildiği güvenli ticaret mekanizmasıdır.'
        ]
      },
      {
        id: 'sozlesmenin-konusu',
        title: 'Madde 2: Sözleşmenin Konusu ve Kapsamı',
        content: [
          '2.1. İşbu Sözleşme\'nin konusu; Satıcı\'nın Platform üzerinde sanayi makineleri, iş ve inşaat ekipmanları, endüstriyel mutfak, tekstil, tarım ve yedek parça kategorilerinde kurumsal mağaza açması, ürünlerini listelemesi, Makinam Güvende altyapısını kullanarak satış gerçekleştirmesi ve Makinam.com tarafından sunulan mağaza yönetim paneli hizmetlerinden faydalanmasına ilişkin usul ve esasların belirlenmesidir.',
          '2.2. Platform, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında "Aracı Hizmet Sağlayıcı" sıfatını haizdir. Satıcı tarafından yüklenen ilanların doğruluğundan, mülkiyet ve rehin durumlarından ve ayıplardan bizzat Satıcı sorumludur.'
        ]
      },
      {
        id: 'magaza-acilis-sartlari',
        title: 'Madde 3: Mağaza Açılış ve Evrak Doğrulama Şartları',
        content: [
          '3.1. Kurumsal mağaza açabilmek için başvuru formunda beyan edilen vergi kimlik numarası, vergi dairesi, resmi ticaret unvanı ve imza yetkili temsilci bilgilerinin doğrulanması zorunludur.',
          '3.2. Satıcı; başvuru esnasında son aya ait Vergi Levhası, Ticaret Sicil Gazetesi sureti, İmza Sirküleri ve Faaliyet Belgesi gibi evrakları Makinam.com kurumsal temsilcisinin talep etmesi halinde ibraz etmekle yükümlüdür.',
          '3.3. Başvuru, Makinam.com kurumsal portföy yöneticisi tarafından incelenir ve telefon/belge teyidi tamamlandıktan sonra onaylanır. Makinam.com, haklı gerekçe göstermeksizin şüpheli başvuruları reddetme veya ek teminat isteme hakkını saklı tutar.',
          '3.4. Başvurunun onaylanmasıyla birlikte Satıcı\'ya ait kurumsal mağaza paneli aktif edilir ve yetkili iletişim numarasına/e-postasına aktivasyon şifresi iletilir.'
        ]
      },
      {
        id: 'ilan-kurallari',
        title: 'Madde 4: İlan Verme, Fikri Mülkiyet ve Satış Kuralları',
        content: [
          '4.1. Satıcı, Platform\'a yüklediği tüm makinelerin mülkiyetinin kendisine ait olduğunu veya malik tarafından yetkilendirildiğini kabul ve taahhüt eder. Çalıntı, hacizli, rehinli veya kamu haczi bulunan makinelerin gizlenerek ilana koyulması kesinlikle yasaktır.',
          '4.2. İlan fotoğrafları ve teknik açıklamaları makinenin fiili ve güncel durumunu yansıtmalıdır. Çalışma saati (motor saati), üretim yılı, revizyon geçmişi ve kaza/hasar durumu şeffaf olarak belirtilmelidir.',
          '4.3. Satıcı, ilanda kullandığı fotoğrafların ve logoların üçüncü şahısların telif hakkını ihlal etmediğini garanti eder. Makinam.com, mevzuata veya etik kurallara aykırı ilanları önceden bildirmeksizin yayından kaldırma hakkına sahiptir.'
        ]
      },
      {
        id: 'makinam-guvende-protokolu',
        title: 'Madde 5: Makinam Güvende Havuz Hesabı ve Teslimat Protokolü',
        content: [
          '5.1. Makinam Güvende etiketli satışlarda alıcı, makine bedelini Makinam.com lisanslı havuz hesabına yatırır. Satıcı bedelin bloke edildiğine dair bildirim almadan makineyi sevk edemez.',
          '5.2. Makinenin nakliyesi ve sahada teslimi gerçekleştikten sonra Alıcı\'nın 2 iş günü (48 saat) fiziki muayene ve ekspertiz inceleme hakkı bulunmaktadır.',
          '5.3. Alıcı makinenin ilandaki özelliklerle birebir örtüştüğünü onayladığında veya 48 saatlik inceleme süresi itirazsız sona erdiğinde, havuzdaki bedel Satıcı\'nın onaylı banka IBAN hesabına kesintisiz olarak 7/24 FAST/EFT ile transfer edilir.',
          '5.4. Makinenin gizli ayıplı, çalışamaz durumda veya ilandan bariz farklı çıkması ve bağımsız ekspertiz raporuyla belgelenmesi halinde iade süreci başlatılır; makine satıcıya teslim edilene kadar havuz hesaptaki bloke korunur.'
        ]
      },
      {
        id: 'ucretlendirme-komisyon',
        title: 'Madde 6: Mağaza Paketleri ve Ücretlendirme',
        content: [
          '6.1. Kurumsal mağaza paket ücretleri (Standart, Gold, Platin) ve varsa ek vitrin/doping hizmetleri Makinam.com tarafından belirlenen güncel tarife üzerinden tahakkuk ettirilir.',
          '6.2. Satıcı\'nın Makinam Güvende ile gerçekleştirdiği satışlarda ilan veren satıcıdan herhangi bir ilan komisyonu kesilmez; Satıcı belirlediği tutarı net olarak tahsil eder. Güvenli ödeme ve lojistik takip altyapı bedeli şeffaf olarak alıcı faturasına yansıtılır.'
        ]
      },
      {
        id: 'gizlilik-kvkk',
        title: 'Madde 7: Gizlilik ve Kişisel Verilerin Korunması (KVKK)',
        content: [
          '7.1. Taraflar, ticari ilişki kapsamında edindikleri ticari sırları ve müşteri iletişim bilgilerini üçüncü şahıslarla paylaşamaz.',
          '7.2. Satıcı, Platform aracılığıyla eriştiği alıcı iletişim verilerini yalnızca satın alma ve nakliye organizasyonu amacıyla kullanabilir; bu verileri rıza hilafına pazarlama amaçlı kullanamaz veya üçüncü şahıslara aktaramaz.'
        ]
      },
      {
        id: 'fesih-uyusmazlik',
        title: 'Madde 8: Süre, Fesih ve Yetkili Mahkeme',
        content: [
          '8.1. İşbu sözleşme süresiz olarak akdedilmiş olup, taraflardan her biri 15 (on beş) gün önceden yazılı bildirimde bulunarak sözleşmeyi feshedebilir. Açıkta bulunan Makinam Güvende siparişleri fesih tarihinden sonra da bu sözleşme hükümlerine tabidir.',
          '8.2. İşbu Sözleşme\'nin uygulanmasından doğabilecek her türlü uyuşmazlığın çözümünde İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.'
        ]
      }
    ]
  },

  'uyelik-sozlesmesi': {
    id: 'uyelik-sozlesmesi',
    slug: 'uyelik-sozlesmesi',
    title: 'Makinam.com Bireysel ve Kurumsal Üyelik Sözleşmesi',
    shortTitle: 'Üyelik Sözleşmesi',
    lastUpdated: '1 Kasım 2026',
    version: 'v3.1',
    summary:
      'Makinam.com platformuna üye olan bireysel ve kurumsal tüm kullanıcıların sisteme giriş, ilan verme, mesajlaşma ve güvenli alışveriş şartlarını kapsayan genel üyelik sözleşmesidir.',
    sections: [
      {
        id: 'uyelik-tanim',
        title: 'Madde 1: Taraflar ve Giriş',
        content: [
          '1.1. İşbu Üyelik Sözleşmesi ("Sözleşme"), Makinam.com ile Platform\'a elektronik ortamda üye olan gerçek veya tüzel kişi ("Üye") arasında akdedilmiştir.',
          '1.2. Üye, Platform\'a kayıt olurken belirlediği e-posta ve şifre ile sisteme erişim sağlar ve bu bilgilerin gizliliğinden bizzat sorumludur.'
        ]
      },
      {
        id: 'hak-ve-yukumlulukler',
        title: 'Madde 2: Üyenin Hak ve Yükümlülükleri',
        content: [
          '2.1. Üye, Platform\'da gerçekleştirdiği tüm işlemlerde yürürlükteki mevzuata, kamu düzenine ve genel ahlak kurallarına uygun hareket edeceğini kabul eder.',
          '2.2. Üye, Platform üzerinden diğer satıcı veya alıcılarla yaptığı mesajlaşmalarda taciz edici, hakaretamiz, yanıltıcı veya haksız rekabete yol açacak ifadeler kullanamaz.',
          '2.3. Üye, Platform\'da yayınladığı ilanların doğruluğundan, güncelliğinden ve ilan konusu makinelerin hukuki durumundan münhasıran sorumludur.'
        ]
      },
      {
        id: 'guvenlik-mesajlasma',
        title: 'Madde 3: Makinam Güvende ve Güvenli İletişim',
        content: [
          '3.1. Makinam.com, kullanıcılar arasında güvenli ticareti teşvik etmek amacıyla "Makinam Güvende" havuz sistemini sunmaktadır. Makinam.com platformu dışından veya harici şahsi hesaplara gönderilen kapora ve ön ödemelerden Makinam.com hiçbir surette sorumlu değildir.',
          '3.2. Kullanıcılar arası yazılı mesajlaşmalar, sistem güvenliği ve uyuşmazlık çözümü amacıyla şifreli olarak kayıt altında tutulur.'
        ]
      },
      {
        id: 'sozlesme-degisikligi',
        title: 'Madde 4: Sözleşme Değişiklikleri ve Fesih',
        content: [
          '4.1. Makinam.com, tek taraflı olarak işbu Sözleşme hükümlerini güncelleyebilir. Güncellenen sözleşme Platform\'da yayınlandığı tarihte yürürlüğe girer.',
          '4.2. Üye, dilediği zaman Profil sayfasından veya müşteri hizmetleriyle iletişime geçerek üyeliğini sonlandırabilir.'
        ]
      }
    ]
  },

  'kvkk-aydinlatma-metni': {
    id: 'kvkk-aydinlatma-metni',
    slug: 'kvkk-aydinlatma-metni',
    title: '6698 Sayılı KVKK Uyarınca Kişisel Verilerin Korunması Aydınlatma Metni',
    shortTitle: 'KVKK Aydınlatma Metni',
    lastUpdated: '1 Kasım 2026',
    version: 'v2.0',
    summary:
      '6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, Makinam.com tarafından toplanan, işlenen ve aktarılan kişisel verilerinize ilişkin haklarınız ve aydınlatma bilgilendirmesidir.',
    sections: [
      {
        id: 'veri-sorumlusu',
        title: '1. Veri Sorumlusu',
        content: [
          '6698 sayılı Kanun uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla Makinam.com Bilişim ve Teknoloji A.Ş. tarafından aşağıda açıklanan kapsamda işlenmektedir.'
        ]
      },
      {
        id: 'islenen-veriler',
        title: '2. İşlenen Kişisel Verileriniz ve Toplama Yöntemi',
        content: [
          'Kimlik Bilgileri: Ad, soyad, TCKN (kurumsal şahıs işletmeleri için), imza sirküleri.',
          'İletişim Bilgileri: E-posta adresi, cep telefonu numarası, şirket sabit telefonu, teslimat ve fatura adresi.',
          'Finansal Bilgiler: Banka adı, IBAN numarası (satış bedeli aktarımı ve Makinam Güvende ödemeleri için).',
          'İşlem Güvenliği Verileri: IP adresi, çerez kayıtları, giriş-çıkış logları, cihaz bilgileri.',
          'Kişisel verileriniz; web sitemiz, mobil sitemiz, kurumsal başvuru formları ve müşteri hizmetleri kanallarıyla elektronik ortamda toplanmaktadır.'
        ]
      },
      {
        id: 'isleme-amaci',
        title: '3. Kişisel Verilerin İşlenme Amaçları',
        content: [
          'Kurumsal mağaza başvurularının doğrulanması ve sözleşme süreçlerinin yürütülmesi,',
          'İlan listeleme, alıcı-satıcı güvenli mesajlaşması ve Makinam Güvende havuz ödemelerinin gerçekleştirilmesi,',
          'Mevzuattan doğan yasal saklama ve bildirim yükümlülüklerinin (Elektronik Ticaret Kanunu, VUK, TCK) yerine getirilmesi,',
          'Platform güvenliğinin sağlanması, sahtecilik ve dolandırıcılık teşebbüslerinin önlenmesi.'
        ]
      },
      {
        id: 'veri-aktarimi',
        title: '4. Kişisel Verilerin Aktarılması',
        content: [
          'Kişisel verileriniz; Makinam Güvende ödemelerinin tamamlanabilmesi için anlaşmalı lisanslı ödeme ve bankacılık kuruluşlarına, nakliye/lojistik organizasyonu için anlaşmalı ağır nakliye operatörlerine ve kanunen yetkili adli/idari kamu kurumlarına yalnızca gerektiği ölçüde aktarılmaktadır.'
        ]
      },
      {
        id: 'ilgili-kisi-haklari',
        title: '5. İlgili Kişinin Kanun\'un 11. Maddesi Kapsamındaki Hakları',
        content: [
          'Herkes, veri sorumlusuna başvurarak kendisiyle ilgili kişisel veri işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, verilerin düzeltilmesini veya silinmesini isteme ve kanuna aykırı işleme sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme hakkına sahiptir.',
          'Taleplerinizi kvkk@makinam.com e-posta adresi üzerinden veya kayıtlı posta yoluyla tarafımıza iletebilirsiniz.'
        ]
      }
    ]
  },

  'makinam-guvende-protokolu': {
    id: 'makinam-guvende-protokolu',
    slug: 'makinam-guvende-protokolu',
    title: 'Makinam Güvende Havuz Hesabı ve Güvenli Ticaret Protokolü',
    shortTitle: 'Makinam Güvende Protokolü',
    lastUpdated: '1 Kasım 2026',
    version: 'v1.8',
    summary:
      'Sanayi ve iş makinelerinde alıcı ve satıcıyı koruyan, teslimat ve teknik ekspertiz teyidi tamamlanana kadar ödemeyi bloke eden resmi güvenlik protokolüdür.',
    sections: [
      {
        id: 'guvende-isleyis',
        title: '1. Sistemin İşleyiş Prensibi',
        content: [
          '1.1. Makinam Güvende, makine bedelinin doğrudan satıcıya değil, BDDK lisanslı aracı havuz hesabına aktarılması esasına dayanır.',
          '1.2. Alıcı bedeli yatırdıktan sonra satıcıya resmi "Sevkiyat Yetki Onayı" gönderilir. Makine satıcının tesisinden vinç veya anlaşmalı nakliye ile alınarak alıcının adresine sevk edilir.'
        ]
      },
      {
        id: 'guvende-inceleme',
        title: '2. 48 Saatlik Muayene ve 101 Nokta Ekspertiz',
        content: [
          '2.1. Makine alıcının fabrikasına/atölyesine ulaştığı andan itibaren 48 saatlik (2 iş günü) fiziki çalışma ve ekspertiz süresi başlar.',
          '2.2. Alıcı panel üzerinden "Onayla" butonuna bastığı an veya 48 saat içinde yazılı bir ayıp bildirimi yapılmadığında havuzdaki bloke kalkar ve bedel satıcının sistemde kayıtlı IBAN hesabına derhal aktarılır.'
        ]
      },
      {
        id: 'guvende-iade',
        title: '3. İtiraz ve İade Koşulları',
        content: [
          '3.1. Makine ilandaki çalışma saati, model yılı veya motor/hidrolik durumuyla örtüşmüyorsa alıcı 48 saat içinde itiraz eder.',
          '3.2. Makine satıcıya geri teslim edilene kadar havuz hesaptaki bloke korunur; teslimatın ardından alıcının ödediği para eksiksiz olarak hesabına iade edilir.'
        ]
      }
    ]
  },

  'kullanim-kosullari': {
    id: 'kullanim-kosullari',
    slug: 'kullanim-kosullari',
    title: 'Makinam.com Portal Kullanım Koşulları ve Çerez Politikası',
    shortTitle: 'Kullanım Koşulları',
    lastUpdated: '1 Kasım 2026',
    version: 'v2.2',
    summary:
      'Makinam.com web sitesini ve servislerini ziyaret eden tüm kullanıcıların uymakla yükümlü olduğu genel kurallar ve çerez kullanım prensipleridir.',
    sections: [
      {
        id: 'kullanim-genel',
        title: '1. Genel Kullanım Kuralları',
        content: [
          '1.1. Makinam.com sitesinde yer alan tüm görsel tasarımlar, ilan veritabanı, yazılım kodları ve marka hakları Makinam.com\'a aittir. Kısmen veya tamamen izinsiz kopyalanamaz, scraping/bot yazılımlarıyla çekilemez.',
          '1.2. Site üzerinden ilan veren her kullanıcı, yayınladığı içeriğin yürürlükteki mevzuata uygunluğundan şahsen sorumludur.'
        ]
      },
      {
        id: 'cerez-politikasi',
        title: '2. Çerez (Cookie) Kullanımı',
        content: [
          '2.1. Sitemizde oturum güvenliği, kullanıcı tercihlerinin hatırlanması (dil, filtreleme, favoriler) ve site performansının ölçümü amacıyla zorunlu ve analitik çerezler kullanılmaktadır.',
          '2.2. Tarayıcı ayarlarınızdan çerez tercihlerinizi dilediğiniz zaman değiştirebilir veya silebilirsiniz.'
        ]
      }
    ]
  }
};
