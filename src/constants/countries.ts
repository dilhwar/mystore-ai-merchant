export interface Country {
  name: string;
  nameAr: string;
  code: string;
  phoneCode: string;
  currency: string;
  language: string;
}

export const COUNTRIES: Country[] = [
  // Middle East & Gulf
  { name: 'Saudi Arabia', nameAr: 'السعودية', code: 'SA', phoneCode: '+966', currency: 'SAR', language: 'ar' },
  { name: 'United Arab Emirates', nameAr: 'الإمارات', code: 'AE', phoneCode: '+971', currency: 'AED', language: 'ar' },
  { name: 'Kuwait', nameAr: 'الكويت', code: 'KW', phoneCode: '+965', currency: 'KWD', language: 'ar' },
  { name: 'Qatar', nameAr: 'قطر', code: 'QA', phoneCode: '+974', currency: 'QAR', language: 'ar' },
  { name: 'Bahrain', nameAr: 'البحرين', code: 'BH', phoneCode: '+973', currency: 'BHD', language: 'ar' },
  { name: 'Oman', nameAr: 'عمان', code: 'OM', phoneCode: '+968', currency: 'OMR', language: 'ar' },
  { name: 'Jordan', nameAr: 'الأردن', code: 'JO', phoneCode: '+962', currency: 'JOD', language: 'ar' },
  { name: 'Lebanon', nameAr: 'لبنان', code: 'LB', phoneCode: '+961', currency: 'LBP', language: 'ar' },
  { name: 'Syria', nameAr: 'سوريا', code: 'SY', phoneCode: '+963', currency: 'SYP', language: 'ar' },
  { name: 'Iraq', nameAr: 'العراق', code: 'IQ', phoneCode: '+964', currency: 'IQD', language: 'ar' },
  { name: 'Yemen', nameAr: 'اليمن', code: 'YE', phoneCode: '+967', currency: 'YER', language: 'ar' },
  { name: 'Palestine', nameAr: 'فلسطين', code: 'PS', phoneCode: '+970', currency: 'ILS', language: 'ar' },

  // North Africa
  { name: 'Egypt', nameAr: 'مصر', code: 'EG', phoneCode: '+20', currency: 'EGP', language: 'ar' },
  { name: 'Morocco', nameAr: 'المغرب', code: 'MA', phoneCode: '+212', currency: 'MAD', language: 'ar' },
  { name: 'Algeria', nameAr: 'الجزائر', code: 'DZ', phoneCode: '+213', currency: 'DZD', language: 'ar' },
  { name: 'Tunisia', nameAr: 'تونس', code: 'TN', phoneCode: '+216', currency: 'TND', language: 'ar' },
  { name: 'Libya', nameAr: 'ليبيا', code: 'LY', phoneCode: '+218', currency: 'LYD', language: 'ar' },
  { name: 'Sudan', nameAr: 'السودان', code: 'SD', phoneCode: '+249', currency: 'SDG', language: 'ar' },

  // Americas
  { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US', phoneCode: '+1', currency: 'USD', language: 'en' },
  { name: 'Canada', nameAr: 'كندا', code: 'CA', phoneCode: '+1', currency: 'CAD', language: 'en' },
  { name: 'Mexico', nameAr: 'المكسيك', code: 'MX', phoneCode: '+52', currency: 'MXN', language: 'es' },
  { name: 'Brazil', nameAr: 'البرازيل', code: 'BR', phoneCode: '+55', currency: 'BRL', language: 'pt' },

  // Europe
  { name: 'United Kingdom', nameAr: 'المملكة المتحدة', code: 'GB', phoneCode: '+44', currency: 'GBP', language: 'en' },
  { name: 'France', nameAr: 'فرنسا', code: 'FR', phoneCode: '+33', currency: 'EUR', language: 'fr' },
  { name: 'Germany', nameAr: 'ألمانيا', code: 'DE', phoneCode: '+49', currency: 'EUR', language: 'de' },
  { name: 'Spain', nameAr: 'إسبانيا', code: 'ES', phoneCode: '+34', currency: 'EUR', language: 'es' },
  { name: 'Italy', nameAr: 'إيطاليا', code: 'IT', phoneCode: '+39', currency: 'EUR', language: 'it' },
  { name: 'Netherlands', nameAr: 'هولندا', code: 'NL', phoneCode: '+31', currency: 'EUR', language: 'nl' },
  { name: 'Turkey', nameAr: 'تركيا', code: 'TR', phoneCode: '+90', currency: 'TRY', language: 'tr' },

  // Asia
  { name: 'India', nameAr: 'الهند', code: 'IN', phoneCode: '+91', currency: 'INR', language: 'hi' },
  { name: 'Pakistan', nameAr: 'باكستان', code: 'PK', phoneCode: '+92', currency: 'PKR', language: 'ur' },
  { name: 'China', nameAr: 'الصين', code: 'CN', phoneCode: '+86', currency: 'CNY', language: 'zh' },
  { name: 'Japan', nameAr: 'اليابان', code: 'JP', phoneCode: '+81', currency: 'JPY', language: 'ja' },
  { name: 'South Korea', nameAr: 'كوريا الجنوبية', code: 'KR', phoneCode: '+82', currency: 'KRW', language: 'ko' },
  { name: 'Singapore', nameAr: 'سنغافورة', code: 'SG', phoneCode: '+65', currency: 'SGD', language: 'en' },
  { name: 'Malaysia', nameAr: 'ماليزيا', code: 'MY', phoneCode: '+60', currency: 'MYR', language: 'ms' },
  { name: 'Indonesia', nameAr: 'إندونيسيا', code: 'ID', phoneCode: '+62', currency: 'IDR', language: 'id' },
  { name: 'Thailand', nameAr: 'تايلاند', code: 'TH', phoneCode: '+66', currency: 'THB', language: 'th' },
  { name: 'Philippines', nameAr: 'الفلبين', code: 'PH', phoneCode: '+63', currency: 'PHP', language: 'tl' },

  // Africa
  { name: 'South Africa', nameAr: 'جنوب أفريقيا', code: 'ZA', phoneCode: '+27', currency: 'ZAR', language: 'en' },
  { name: 'Nigeria', nameAr: 'نيجيريا', code: 'NG', phoneCode: '+234', currency: 'NGN', language: 'en' },
  { name: 'Kenya', nameAr: 'كينيا', code: 'KE', phoneCode: '+254', currency: 'KES', language: 'sw' },

  // Oceania
  { name: 'Australia', nameAr: 'أستراليا', code: 'AU', phoneCode: '+61', currency: 'AUD', language: 'en' },
  { name: 'New Zealand', nameAr: 'نيوزيلندا', code: 'NZ', phoneCode: '+64', currency: 'NZD', language: 'en' },
];

// Helper to detect country from device locale
export const detectCountryFromLocale = async (): Promise<Country | null> => {
  try {
    const locales = await import('expo-localization');
    const locale = locales.getLocales()[0];

    if (locale?.regionCode) {
      const country = COUNTRIES.find(c => c.code === locale.regionCode);
      if (country) return country;
    }

    // Default to Saudi Arabia for Arabic speakers
    if (locale?.languageCode === 'ar') {
      return COUNTRIES.find(c => c.code === 'SA') || null;
    }

    // Default to USA for English speakers
    if (locale?.languageCode === 'en') {
      return COUNTRIES.find(c => c.code === 'US') || null;
    }
  } catch (error) {
    console.error('Error detecting country:', error);
  }

  return null;
};
