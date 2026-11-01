# Makinam.com - Türkiye'nin Makine Pazarı

Türkiye'nin iş makineleri, sanayi ekipmanları ve endüstriyel üretim teknolojileri için yeni nesil B2B / B2C e-ticaret ve ilan platformu.

---

## Özellikler

- **Gelişmiş İlan Yönetimi:** Sanayi, iş makinesi, tarım, elektrikli aletler ve yedek parça kategorilerinde detaylı teknik filtreler, çalışma saati ve durum sorgulama.
- **Çok Adımlı İlan Verme:** Fotoğraf yükleme, teknik özellikler ve lokasyon seçimiyle hızlı ve standart ilan girişi.
- **Cloudflare R2 Depolama:** S3 uyumlu Cloudflare R2 altyapısı ile yüksek hızlı, optimize edilmiş fotoğraf saklama ve silme senkronizasyonu.
- **Canlı Veritabanı:** Google Firebase Firestore ve Firebase Authentication ile gerçek zamanlı veri akışı ve anlık durum güncellemeleri.
- **Kurumsal Mağaza Başvuru Akışı:** Şirketlerin kurumsal mağaza açma talepleri, sözleşme onayları ve temsilci inceleme süreci.
- **Enterprise Admin & Moderasyon Konsolu:**
  - Zero-emoji, kurumsal tasarım standartları.
  - Granular RBAC (Modül bazlı yetkilendirme ve rol şablonları).
  - İlan ve vitrin moderasyonu (Ana Sayfa Vitrin, Acil Satılık, Makinam Güvende).
  - Detaylı müşteri ve mağaza profil yönetimi.
  - Portal CMS (Popüler markalar ve arama etiketleri canlı yönetimi).
- **Makinam Güvende & Hukuki Altyapı:** Havuz hesabı bloke güvencesi, Mesafeli Satış Sözleşmesi, KVKK ve Kurumsal Mağaza Sözleşmeleri.

---

## Teknoloji Yığını

- **Frontend:** React 18, TypeScript, Vite, React Router 6
- **Stil & Arayüz:** Tailwind CSS, Lucide React
- **Backend & Veritabanı:** Firebase Firestore, Firebase Authentication
- **Görsel Depolama:** Cloudflare R2 Object Storage (`@aws-sdk/client-s3`)

---

## Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Çevre Değişkenlerini Tanımlayın
`.env.example` dosyasını `.env` olarak kopyalayın ve Cloudflare R2 anahtarlarınızı girin:
```bash
cp .env.example .env
```

### 3. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

### 4. Üretim Derlemesi
```bash
npm run build
```

---

## Lisans
Tüm hakları saklıdır © Makinam.com
