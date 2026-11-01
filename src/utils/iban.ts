export interface BankInfo {
  code: string;
  name: string;
  shortName: string;
  color: string;
  bgLight: string;
  badgeText: string;
}

export const TURKISH_BANKS: Record<string, BankInfo> = {
  '00010': {
    code: '00010',
    name: 'T.C. Ziraat Bankası',
    shortName: 'Ziraat Bankası',
    color: '#e11d48',
    bgLight: '#ffe4e6',
    badgeText: 'ZİRAAT'
  },
  '00012': {
    code: '00012',
    name: 'Türkiye Halk Bankası',
    shortName: 'Halkbank',
    color: '#0284c7',
    bgLight: '#e0f2fe',
    badgeText: 'HALKBANK'
  },
  '00015': {
    code: '00015',
    name: 'Türkiye Vakıflar Bankası',
    shortName: 'VakıfBank',
    color: '#d97706',
    bgLight: '#fef3c7',
    badgeText: 'VAKIFBANK'
  },
  '00032': {
    code: '00032',
    name: 'Türk Ekonomi Bankası',
    shortName: 'TEB',
    color: '#059669',
    bgLight: '#d1fae5',
    badgeText: 'TEB'
  },
  '00046': {
    code: '00046',
    name: 'Akbank T.A.Ş.',
    shortName: 'Akbank',
    color: '#dc2626',
    bgLight: '#fee2e2',
    badgeText: 'AKBANK'
  },
  '00059': {
    code: '00059',
    name: 'Şekerbank T.A.Ş.',
    shortName: 'Şekerbank',
    color: '#16a34a',
    bgLight: '#dcfce7',
    badgeText: 'ŞEKERBANK'
  },
  '00062': {
    code: '00062',
    name: 'Türkiye Garanti Bankası',
    shortName: 'Garanti BBVA',
    color: '#15803d',
    bgLight: '#dcfce7',
    badgeText: 'GARANTİ BBVA'
  },
  '00064': {
    code: '00064',
    name: 'Türkiye İş Bankası',
    shortName: 'İş Bankası',
    color: '#1e40af',
    bgLight: '#dbeafe',
    badgeText: 'İŞ BANKASI'
  },
  '00067': {
    code: '00067',
    name: 'Yapı ve Kredi Bankası',
    shortName: 'Yapı Kredi',
    color: '#0369a1',
    bgLight: '#e0f2fe',
    badgeText: 'YAPI KREDİ'
  },
  '00099': {
    code: '00099',
    name: 'ING Bank A.Ş.',
    shortName: 'ING Bank',
    color: '#ea580c',
    bgLight: '#ffedd5',
    badgeText: 'ING'
  },
  '00103': {
    code: '00103',
    name: 'Fibabanka A.Ş.',
    shortName: 'Fibabanka',
    color: '#4f46e5',
    bgLight: '#e0e7ff',
    badgeText: 'FİBABANKA'
  },
  '00111': {
    code: '00111',
    name: 'QNB Finansbank',
    shortName: 'QNB',
    color: '#701a75',
    bgLight: '#fdf4ff',
    badgeText: 'QNB'
  },
  '00123': {
    code: '00123',
    name: 'HSBC Bank A.Ş.',
    shortName: 'HSBC',
    color: '#b91c1c',
    bgLight: '#fee2e2',
    badgeText: 'HSBC'
  },
  '00125': {
    code: '00125',
    name: 'Burgan Bank A.Ş.',
    shortName: 'Burgan Bank',
    color: '#0284c7',
    bgLight: '#e0f2fe',
    badgeText: 'BURGAN'
  },
  '00134': {
    code: '00134',
    name: 'DenizBank A.Ş.',
    shortName: 'DenizBank',
    color: '#0284c7',
    bgLight: '#e0f2fe',
    badgeText: 'DENİZBANK'
  },
  '00135': {
    code: '00135',
    name: 'Anadolubank A.Ş.',
    shortName: 'Anadolubank',
    color: '#b45309',
    bgLight: '#fef3c7',
    badgeText: 'ANADOLUBANK'
  },
  '00143': {
    code: '00143',
    name: 'Aktif Yatırım Bankası',
    shortName: 'Aktif Bank',
    color: '#b91c1c',
    bgLight: '#fee2e2',
    badgeText: 'AKTİF BANK'
  },
  '00146': {
    code: '00146',
    name: 'Odea Bank A.Ş.',
    shortName: 'Odeabank',
    color: '#ca8a04',
    bgLight: '#fef9c3',
    badgeText: 'ODEABANK'
  },
  '00157': {
    code: '00157',
    name: 'Enpara Bank A.Ş.',
    shortName: 'Enpara.com',
    color: '#7c3aed',
    bgLight: '#f3e8ff',
    badgeText: 'ENPARA'
  },
  '00203': {
    code: '00203',
    name: 'Albaraka Türk Katılım Bankası',
    shortName: 'Albaraka Türk',
    color: '#b45309',
    bgLight: '#fef3c7',
    badgeText: 'ALBARAKA'
  },
  '00205': {
    code: '00205',
    name: 'Kuveyt Türk Katılım Bankası',
    shortName: 'Kuveyt Türk',
    color: '#047857',
    bgLight: '#d1fae5',
    badgeText: 'KUVEYT TÜRK'
  },
  '00206': {
    code: '00206',
    name: 'Türkiye Finans Katılım Bankası',
    shortName: 'Türkiye Finans',
    color: '#0369a1',
    bgLight: '#e0f2fe',
    badgeText: 'TÜRKİYE FİNANS'
  },
  '00209': {
    code: '00209',
    name: 'Ziraat Katılım Bankası',
    shortName: 'Ziraat Katılım',
    color: '#b91c1c',
    bgLight: '#fee2e2',
    badgeText: 'ZİRAAT KATILIM'
  },
  '00210': {
    code: '00210',
    name: 'Vakıf Katılım Bankası',
    shortName: 'Vakıf Katılım',
    color: '#b45309',
    bgLight: '#fef3c7',
    badgeText: 'VAKIF KATILIM'
  },
  '00211': {
    code: '00211',
    name: 'Türkiye Emlak Katılım Bankası',
    shortName: 'Emlak Katılım',
    color: '#0f766e',
    bgLight: '#ccfbf1',
    badgeText: 'EMLAK KATILIM'
  },
  '00212': {
    code: '00212',
    name: 'Hayat Katılım Bankası A.Ş.',
    shortName: 'Hayat Finans',
    color: '#0284c7',
    bgLight: '#e0f2fe',
    badgeText: 'HAYAT FİNANS'
  },
  '00213': {
    code: '00213',
    name: 'T.O.M. Katılım Bankası A.Ş.',
    shortName: 'TOM Bank',
    color: '#f59e0b',
    bgLight: '#fef3c7',
    badgeText: 'TOM BANK'
  },
  '00801': {
    code: '00801',
    name: 'Papara Elektronik Para',
    shortName: 'Papara',
    color: '#1e293b',
    bgLight: '#f1f5f9',
    badgeText: 'PAPARA'
  }
};

/**
 * Formats user input as standard Turkish IBAN: TRxx xxxx xxxx xxxx xxxx xxxx xx
 */
export function formatTurkishIBAN(raw: string): string {
  // Strip non-alphanumeric
  let cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Auto-prepend TR if user started typing digits
  if (cleaned.length > 0 && !cleaned.startsWith('TR')) {
    cleaned = 'TR' + cleaned;
  }

  // Maximum 26 characters
  cleaned = cleaned.slice(0, 26);

  // Group by 4 characters
  const parts: string[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }

  return parts.join(' ');
}

export interface DetectedIBANResult {
  formatted: string;
  raw: string;
  isValidLength: boolean;
  bank: BankInfo | null;
  bankCode: string | null;
}

/**
 * Detects Turkish bank from given IBAN string
 */
export function detectTurkishBankFromIBAN(ibanInput: string): DetectedIBANResult {
  const cleaned = ibanInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const formatted = formatTurkishIBAN(ibanInput);
  const isValidLength = cleaned.length === 26;

  // In Turkish IBAN:
  // Indices 0-1: 'TR'
  // Indices 2-3: 2 control digits
  // Indices 4-8: 5-digit Bank Code
  if (cleaned.length >= 9 && cleaned.startsWith('TR')) {
    const bankCode = cleaned.substring(4, 9);
    const bank = TURKISH_BANKS[bankCode] || null;

    return {
      formatted,
      raw: cleaned,
      isValidLength,
      bank,
      bankCode
    };
  }

  return {
    formatted,
    raw: cleaned,
    isValidLength,
    bank: null,
    bankCode: null
  };
}
