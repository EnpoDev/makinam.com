import { UserProfile } from '../types';

export interface PermissionDefinition {
  id: string;
  label: string;
  description: string;
}

export interface PermissionCategory {
  id: string;
  title: string;
  description: string;
  permissions: PermissionDefinition[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'listings',
    title: 'İlan Yönetimi & Moderasyon',
    description: 'Makinelerin yayına alınması, düzenlenmesi ve vitrin rozetlerinin denetimi',
    permissions: [
      {
        id: 'listings:view',
        label: 'İlanları İnceleme & Listeleme',
        description: 'Tüm aktif, pasif ve arşivlenmiş ilan kayıtlarını listeleyebilir ve inceleyebilir.'
      },
      {
        id: 'listings:edit',
        label: 'İlan Bilgilerini & Fiyatı Düzenleme',
        description: 'İlan başlığı, fiyatı, teknik özellikleri, kategorisi ve açıklamalarını güncelleyebilir.'
      },
      {
        id: 'listings:approve',
        label: 'İlan Yayın Durumu Değiştirme',
        description: 'İlanları aktif yayına alabilir, pasife çekebilir veya satıldı olarak işaretleyebilir.'
      },
      {
        id: 'listings:badges',
        label: 'Vitrin & Rozet Yönetimi',
        description: 'Ana Sayfa Vitrini, Acil Satılık ve Makinam Güvende rozetlerini açıp kapatabilir.'
      },
      {
        id: 'listings:delete',
        label: 'İlanı Kalıcı Olarak Silme',
        description: 'İlanı ve Cloudflare R2 üzerindeki görsellerini sistemden kalıcı olarak silebilir.'
      },
      {
        id: 'listings:export',
        label: 'İlan Verilerini Dışa Aktarma',
        description: 'İlan listesini ve raporları Excel / CSV biçiminde dışa aktarabilir.'
      }
    ]
  },
  {
    id: 'applications',
    title: 'Kurumsal Mağaza Başvuruları',
    description: 'Şirketlerin kurumsal mağaza evraklarının ve taleplerinin onay süreci',
    permissions: [
      {
        id: 'applications:view',
        label: 'Başvuru Dosyalarını İnceleme',
        description: 'Kurumsal mağaza başvurularını, vergi dairesi ve yetkili bilgilerini görüntüleyebilir.'
      },
      {
        id: 'applications:approve',
        label: 'Mağaza Onayı & Otomatik Hesap Açılışı',
        description: 'Başvuruyu onaylayarak kullanıcıya otomatik kurumsal mağaza hesabı ve şifresi oluşturabilir.'
      },
      {
        id: 'applications:reject',
        label: 'Başvuruyu Gerekçeli Reddetme',
        description: 'Eksik evrak veya uygunsuzluk sebebiyle başvuruyu gerekçeli olarak reddedebilir.'
      },
      {
        id: 'applications:delete',
        label: 'Başvuru Kaydını Kalıcı Silme',
        description: 'Geçersiz veya mükerrer başvuru kayıtlarını sistemden tamamen silebilir.'
      }
    ]
  },
  {
    id: 'users',
    title: 'Kullanıcı & Müşteri Yönetimi',
    description: 'Bireysel ve kurumsal üyelerin hesap, kimlik ve güvenlik denetimi',
    permissions: [
      {
        id: 'users:view',
        label: 'Kullanıcı Listesi & Profil İnceleme',
        description: 'Kayıtlı kullanıcıları, üyelik detaylarını ve iletişim bilgilerini görüntüleyebilir.'
      },
      {
        id: 'users:edit',
        label: 'Müşteri Bilgilerini Güncelleme',
        description: 'Kullanıcı adını, telefonunu, şirket ünvanını ve adres bilgilerini düzenleyebilir.'
      },
      {
        id: 'users:permissions',
        label: 'Rol & Yetki (Perm) Atama',
        description: 'Kullanıcılara admin, destek rolleri tanımlayabilir ve modül bazlı izinleri değiştirebilir.'
      },
      {
        id: 'users:suspend',
        label: 'Hesap Dondurma & Blokaj Koyma',
        description: 'Kullanıcı hesabını askıya alabilir veya blokajı kaldırarak erişimini açabilir.'
      },
      {
        id: 'users:quota',
        label: 'İlan Yayınlama Kotasını Belirleme',
        description: 'Kullanıcının sisteme ekleyebileceği maksimum aktif ilan limitini güncelleyebilir.'
      },
      {
        id: 'users:delete',
        label: 'Kullanıcıyı Sistemden Kalıcı Silme',
        description: 'Kullanıcı profilini ve veritabanı kaydını geri döndürülemez şekilde silebilir.'
      }
    ]
  },
  {
    id: 'finance',
    title: 'Finans & Güvenli Ödemeler',
    description: 'Makinam Güvende havuz blokesi, IBAN kayıtları ve muhasebe parametreleri',
    permissions: [
      {
        id: 'finance:view',
        label: 'IBAN & Finansal Kayıtları Görüntüleme',
        description: 'Kullanıcıların kayıtlı banka adı, hesap sahibi ve IBAN numaralarını inceleyebilir.'
      },
      {
        id: 'finance:edit',
        label: 'IBAN & Hesap Bilgilerini Güncelleme',
        description: 'Kullanıcıların banka ve IBAN bilgilerini doğrulayabilir veya değiştirebilir.'
      },
      {
        id: 'finance:escrow',
        label: 'Makinam Güvende Havuz Bloke Onayı',
        description: 'Alıcı-satıcı arasındaki havuz ödeme transferlerini denetleyip onaylayabilir.'
      }
    ]
  },
  {
    id: 'settings',
    title: 'Portal CMS & Site Ayarları',
    description: 'Ana sayfa içerikleri, popüler markalar ve arama etiketlerinin yönetimi',
    permissions: [
      {
        id: 'settings:view',
        label: 'Portal Parametrelerini Görüntüleme',
        description: 'Canlı Firestore ayarlarını, popüler markaları ve etiket listesini görüntüleyebilir.'
      },
      {
        id: 'settings:edit',
        label: 'Marka & Arama Etiketi CMS Yönetimi',
        description: 'Yeni popüler marka veya arama etiketi ekleyebilir, mevcutları silebilir.'
      }
    ]
  },
  {
    id: 'system',
    title: 'Sistem & Güvenlik Denetimi',
    description: 'Root seviyesi sistem ayarları ve audit denetimleri',
    permissions: [
      {
        id: 'system:logs',
        label: 'Denetim & İşlem Geçmişi (Audit Logs)',
        description: 'Yöneticiler tarafından gerçekleştirilen onay, silme ve düzenleme kayıtlarını inceler.'
      },
      {
        id: 'system:superadmin',
        label: 'Tam Yetkili Süper Yönetici (Master Root)',
        description: 'Sistemdeki tüm modüllere, kısıtlama olmaksızın doğrudan tam erişim sağlar.'
      }
    ]
  }
];

export const ALL_PERMISSION_IDS: string[] = PERMISSION_CATEGORIES.flatMap((c) =>
  c.permissions.map((p) => p.id)
);

export interface RolePreset {
  id: string;
  name: string;
  description: string;
  role: 'admin' | 'support' | 'user';
  permissions: string[];
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'superadmin',
    name: 'Süper Admin (Root)',
    description: 'Sistemdeki tüm modüllere, kullanıcı yetkilendirmelerine ve verilere tam erişim.',
    role: 'admin',
    permissions: [...ALL_PERMISSION_IDS]
  },
  {
    id: 'moderator',
    name: 'İlan & Başvuru Moderatörü',
    description: 'İlanları denetler, vitrin ve acil rozetlerini yönetir, kurumsal başvuruları onaylar.',
    role: 'support',
    permissions: [
      'listings:view',
      'listings:edit',
      'listings:approve',
      'listings:badges',
      'listings:export',
      'applications:view',
      'applications:approve',
      'applications:reject',
      'users:view',
      'users:quota',
      'settings:view'
    ]
  },
  {
    id: 'support_agent',
    name: 'Müşteri Destek Temsilcisi',
    description: 'Müşteri profillerini, ilanları ve başvuruları inceler; destek sağlar ancak kalıcı silme yapamaz.',
    role: 'support',
    permissions: [
      'listings:view',
      'listings:edit',
      'applications:view',
      'users:view',
      'users:edit',
      'finance:view'
    ]
  },
  {
    id: 'finance_officer',
    name: 'Finans & Güvenli Ödeme Sorumlusu',
    description: 'Müşterilerin banka/IBAN kayıtlarını, Makinam Güvende havuz transferlerini ve finansal durumları yönetir.',
    role: 'support',
    permissions: [
      'finance:view',
      'finance:edit',
      'finance:escrow',
      'users:view',
      'listings:view'
    ]
  },
  {
    id: 'cms_editor',
    name: 'İçerik & SEO Editörü',
    description: 'Ana sayfa popüler marka ve etiket listesini yönetir, ilanları görüntüler.',
    role: 'support',
    permissions: [
      'settings:view',
      'settings:edit',
      'listings:view'
    ]
  },
  {
    id: 'standard_user',
    name: 'Standart Üye (Yetkisiz)',
    description: 'Admin paneline erişimi yoktur; yalnızca genel pazaryeri özelliklerini kullanabilir.',
    role: 'user',
    permissions: []
  }
];

/**
 * Checks whether a given user has a specific permission.
 * Super Admin (role === 'admin' with 'system:superadmin' or enespoyraz380@gmail.com) has all permissions automatically.
 */
export function hasPermission(user: UserProfile | null | undefined, permissionId: string): boolean {
  if (!user) return false;
  if (user.email === 'enespoyraz380@gmail.com') return true;
  if (user.role === 'admin' && (!user.permissions || user.permissions.includes('system:superadmin'))) {
    return true;
  }
  const perms = user.permissions || [];
  if (perms.includes('system:superadmin')) return true;
  return perms.includes(permissionId);
}
