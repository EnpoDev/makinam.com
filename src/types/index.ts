export interface Category {
  id: string;
  name: string;
  iconName: string;
  count: number;
  slug: string;
  subcategories: {
    id: string;
    name: string;
    count: number;
    slug: string;
  }[];
}

export interface Listing {
  id: string;
  adNo?: string;
  userId?: string;
  status?: 'active' | 'passive' | 'sold';
  viewsCount?: number;
  title: string;
  category: string;
  subCategory: string;
  brand: string;
  model: string;
  year: number;
  hours: number;
  price: number;
  currency: 'TL' | 'EUR' | 'USD';
  city: string;
  district: string;
  date: string;
  images: string[];
  seller: {
    name: string;
    type: 'Sahibinden' | 'Galeriden' | 'Yetkili Bayi' | 'Üreticiden';
    memberSince: string;
    phone: string;
    rating?: number;
    companyName?: string;
  };
  features: {
    label: string;
    value: string;
  }[];
  description: string;
  isVitrin?: boolean;
  isUrgent?: boolean;
  isGuvende?: boolean;
}

export interface FilterState {
  category?: string;
  subCategory?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minHours?: number;
  maxHours?: number;
  brand?: string;
  sellerType?: string;
  searchQuery?: string;
  sortBy?: 'date_desc' | 'price_asc' | 'price_desc' | 'year_desc' | 'hours_asc';
  viewMode?: 'list' | 'gallery';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role?: 'admin' | 'support' | 'user';
  permissions?: string[];
  status?: 'active' | 'suspended';
  listingLimit?: number;
  notes?: string;
  phoneNumber?: string;
  accountType: 'bireysel' | 'kurumsal';
  isApprovedStore?: boolean;
  companyName?: string;
  legalTitle?: string;
  taxNumber?: string;
  taxOffice?: string;
  city?: string;
  district?: string;
  address?: string;
  iban?: string;
  bankName?: string;
  bankCode?: string;
  accountHolder?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface StoreApplication {
  id?: string;
  applicationNo: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  
  // Şirket & Mağaza Bilgileri
  companyName: string;
  legalTitle: string;
  companyType: 'limited' | 'anonim' | 'sahis' | 'diger';
  taxOffice: string;
  taxNumber: string;
  
  // Yetkili Bilgileri
  contactName: string;
  contactTitle?: string;
  email: string;
  phone: string;
  landlinePhone?: string;

  // Konum
  city: string;
  district: string;
  address: string;

  // Faaliyet & Tercihler
  mainCategory: string;
  estimatedMonthlyListings?: string;
  preferredPackage?: 'standart' | 'gold' | 'platin';
  notes?: string;

  // Meta & Onay Takip
  createdAt?: any;
  updatedAt?: any;
  reviewedBy?: string;
  reviewedAt?: any;
  reviewNotes?: string;
  createdUserId?: string;
}
