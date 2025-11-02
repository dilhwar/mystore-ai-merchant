/**
 * Currency Constants
 * Complete list of 64 supported currencies with native names and symbols
 */

export interface Currency {
  code: string;
  name: string;
  nativeName: string;
  symbol: string;
  flag?: string;
}

// Default currency for the platform
export const DEFAULT_CURRENCY = 'SAR';

/**
 * Currencies with zero decimal places (no cents/fractions)
 */
export const ZERO_DECIMAL_CURRENCIES = ['JPY', 'KRW', 'VND', 'CLP', 'ISK'];

/**
 * Currencies with three decimal places
 */
export const THREE_DECIMAL_CURRENCIES = ['BHD', 'KWD', 'OMR', 'JOD', 'TND'];

/**
 * All supported currencies (64 currencies)
 */
export const CURRENCIES: Currency[] = [
  // Major Global Currencies
  { code: 'USD', name: 'US Dollar', nativeName: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', nativeName: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', nativeName: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', nativeName: '日本円', symbol: '¥', flag: '🇯🇵' },
  { code: 'CHF', name: 'Swiss Franc', nativeName: 'Schweizer Franken', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CAD', name: 'Canadian Dollar', nativeName: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', nativeName: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'NZD', name: 'New Zealand Dollar', nativeName: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'CNY', name: 'Chinese Yuan', nativeName: '人民币', symbol: '¥', flag: '🇨🇳' },

  // Middle East & Gulf
  { code: 'SAR', name: 'Saudi Riyal', nativeName: 'ريال سعودي', symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'AED', name: 'UAE Dirham', nativeName: 'درهم إماراتي', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'QAR', name: 'Qatari Riyal', nativeName: 'ريال قطري', symbol: 'ر.ق', flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', nativeName: 'دينار كويتي', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'BHD', name: 'Bahraini Dinar', nativeName: 'دينار بحريني', symbol: 'د.ب', flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', nativeName: 'ريال عماني', symbol: 'ر.ع.', flag: '🇴🇲' },
  { code: 'IQD', name: 'Iraqi Dinar', nativeName: 'دينار عراقي', symbol: 'د.ع', flag: '🇮🇶' },
  { code: 'JOD', name: 'Jordanian Dinar', nativeName: 'دينار أردني', symbol: 'د.ا', flag: '🇯🇴' },
  { code: 'EGP', name: 'Egyptian Pound', nativeName: 'جنيه مصري', symbol: 'ج.م', flag: '🇪🇬' },
  { code: 'ILS', name: 'Israeli Shekel', nativeName: 'شيكل', symbol: '₪', flag: '🇮🇱' },

  // South Asia
  { code: 'INR', name: 'Indian Rupee', nativeName: 'भारतीय रुपया', symbol: '₹', flag: '🇮🇳' },
  { code: 'PKR', name: 'Pakistani Rupee', nativeName: 'پاکستانی روپیہ', symbol: '₨', flag: '🇵🇰' },
  { code: 'BDT', name: 'Bangladeshi Taka', nativeName: 'টাকা', symbol: '৳', flag: '🇧🇩' },
  { code: 'LKR', name: 'Sri Lankan Rupee', nativeName: 'ශ්‍රී ලංකා රුපියල', symbol: 'Rs', flag: '🇱🇰' },
  { code: 'NPR', name: 'Nepalese Rupee', nativeName: 'नेपाली रुपैयाँ', symbol: 'Rs', flag: '🇳🇵' },

  // Southeast Asia
  { code: 'IDR', name: 'Indonesian Rupiah', nativeName: 'Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian Ringgit', nativeName: 'Ringgit Malaysia', symbol: 'RM', flag: '🇲🇾' },
  { code: 'THB', name: 'Thai Baht', nativeName: 'บาท', symbol: '฿', flag: '🇹🇭' },
  { code: 'SGD', name: 'Singapore Dollar', nativeName: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'PHP', name: 'Philippine Peso', nativeName: 'Piso', symbol: '₱', flag: '🇵🇭' },
  { code: 'VND', name: 'Vietnamese Dong', nativeName: 'Đồng', symbol: '₫', flag: '🇻🇳' },

  // East Asia
  { code: 'KRW', name: 'South Korean Won', nativeName: '대한민국 원', symbol: '₩', flag: '🇰🇷' },
  { code: 'TWD', name: 'Taiwan Dollar', nativeName: '新台幣', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'HKD', name: 'Hong Kong Dollar', nativeName: '港元', symbol: 'HK$', flag: '🇭🇰' },

  // Europe (Non-Euro)
  { code: 'SEK', name: 'Swedish Krona', nativeName: 'Svensk krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', nativeName: 'Norsk krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', nativeName: 'Dansk krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Zloty', nativeName: 'Złoty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', nativeName: 'Koruna česká', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', nativeName: 'Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'RON', name: 'Romanian Leu', nativeName: 'Leu românesc', symbol: 'lei', flag: '🇷🇴' },
  { code: 'BGN', name: 'Bulgarian Lev', nativeName: 'Лев', symbol: 'лв', flag: '🇧🇬' },
  { code: 'RUB', name: 'Russian Ruble', nativeName: 'Российский рубль', symbol: '₽', flag: '🇷🇺' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', nativeName: 'Гривня', symbol: '₴', flag: '🇺🇦' },
  { code: 'TRY', name: 'Turkish Lira', nativeName: 'Türk Lirası', symbol: '₺', flag: '🇹🇷' },

  // Latin America
  { code: 'BRL', name: 'Brazilian Real', nativeName: 'Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', nativeName: 'Peso mexicano', symbol: 'Mex$', flag: '🇲🇽' },
  { code: 'ARS', name: 'Argentine Peso', nativeName: 'Peso argentino', symbol: '$', flag: '🇦🇷' },
  { code: 'CLP', name: 'Chilean Peso', nativeName: 'Peso chileno', symbol: '$', flag: '🇨🇱' },
  { code: 'COP', name: 'Colombian Peso', nativeName: 'Peso colombiano', symbol: '$', flag: '🇨🇴' },
  { code: 'PEN', name: 'Peruvian Sol', nativeName: 'Sol', symbol: 'S/', flag: '🇵🇪' },

  // Africa
  { code: 'ZAR', name: 'South African Rand', nativeName: 'Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'NGN', name: 'Nigerian Naira', nativeName: 'Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'KES', name: 'Kenyan Shilling', nativeName: 'Shilingi', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi', nativeName: 'Cedi', symbol: 'GH₵', flag: '🇬🇭' },
  { code: 'MAD', name: 'Moroccan Dirham', nativeName: 'درهم مغربي', symbol: 'د.م.', flag: '🇲🇦' },

  // Others
  { code: 'ISK', name: 'Icelandic Króna', nativeName: 'Íslensk króna', symbol: 'kr', flag: '🇮🇸' },
  { code: 'GEL', name: 'Georgian Lari', nativeName: 'ლარი', symbol: '₾', flag: '🇬🇪' },
  { code: 'TND', name: 'Tunisian Dinar', nativeName: 'دينار تونسي', symbol: 'د.ت', flag: '🇹🇳' },
];

/**
 * Get currency by code
 */
export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find((c) => c.code === code);
};

/**
 * Validate if a currency code is supported
 */
export const isValidCurrency = (code: string): boolean => {
  return CURRENCIES.some((c) => c.code === code);
};
