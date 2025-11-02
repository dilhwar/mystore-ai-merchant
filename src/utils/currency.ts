/**
 * Currency Utility Functions
 * Handles currency formatting, validation, and display
 */

import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  ZERO_DECIMAL_CURRENCIES,
  THREE_DECIMAL_CURRENCIES,
  getCurrencyByCode,
} from '@/constants/currencies';

export type CurrencyDisplayFormat = 'NATIVE' | 'ENGLISH' | 'CODE';

/**
 * Get the number of decimal places for a currency
 */
export const getDecimalPlaces = (currencyCode: string): number => {
  if (ZERO_DECIMAL_CURRENCIES.includes(currencyCode)) {
    return 0; // JPY: ¥1000, not ¥1000.00
  }
  if (THREE_DECIMAL_CURRENCIES.includes(currencyCode)) {
    return 3; // KWD: 1.250 د.ك
  }
  return 2; // Default: $10.99
};

/**
 * Get currency symbol from currency code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  return currency?.symbol || currencyCode;
};

/**
 * Get currency display name based on format setting
 * @param currencyCode - Currency code (e.g., 'IQD', 'SAR', 'USD')
 * @param format - Display format: 'NATIVE' (native language), 'ENGLISH' (English name), or 'CODE' (currency code)
 * @returns Formatted currency display name
 */
export const getCurrencyDisplayName = (
  currencyCode: string,
  format: CurrencyDisplayFormat = 'NATIVE'
): string => {
  const currency = getCurrencyByCode(currencyCode);

  if (!currency) {
    return currencyCode; // Fallback to code if currency not found
  }

  switch (format) {
    case 'NATIVE':
      return currency.nativeName || currency.name;
    case 'ENGLISH':
      return currency.name;
    case 'CODE':
      return currency.code;
    default:
      return currency.nativeName || currency.name;
  }
};

/**
 * Format amount with currency using Intl.NumberFormat (recommended)
 * This provides proper localization and formatting
 * @param amount - Amount to format
 * @param currencyCode - Currency code (e.g., 'USD', 'SAR', 'IQD')
 * @param locale - Locale for formatting (e.g., 'en-US', 'ar-SA'). If not provided, uses 'en-US' as default
 * @param useEnglishDigits - Force English digits (0-9) instead of Arabic/native digits. Default: true
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY,
  locale: string = 'en-US',
  useEnglishDigits: boolean = true
): string => {
  try {
    // Handle invalid amounts
    if (amount === null || amount === undefined || isNaN(amount)) {
      amount = 0;
    }

    const decimals = getDecimalPlaces(currencyCode);

    // Force English digits for consistency
    const formatterLocale = useEnglishDigits ? 'en-US' : locale;

    const formatter = new Intl.NumberFormat(formatterLocale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return formatter.format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    const symbol = getCurrencySymbol(currencyCode);
    const decimals = getDecimalPlaces(currencyCode);
    return `${symbol}${amount.toFixed(decimals)}`;
  }
};

/**
 * Simple format: "SAR 1,234.56" - Currency code first
 * Use this for consistency across dashboard
 * @param amount - Amount to format
 * @param currencyCode - Currency code (e.g., 'USD', 'SAR', 'IQD')
 * @param locale - Locale for number formatting (e.g., 'en-US', 'ar-SA'). If not provided, uses 'en-US' as default
 * @param useEnglishDigits - Force English digits (0-9) instead of Arabic/native digits. Default: true
 */
export const formatCurrencySimple = (
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY,
  locale: string = 'en-US',
  useEnglishDigits: boolean = true
): string => {
  // Handle invalid amounts
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }

  const decimals = getDecimalPlaces(currencyCode);
  // Force English digits for consistency
  const formatterLocale = useEnglishDigits ? 'en-US' : locale;

  return `${currencyCode} ${amount.toLocaleString(formatterLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

/**
 * Round currency value to appropriate decimal places
 * Most currencies use 2 decimal places, but some use 0 or 3
 */
export const roundCurrency = (value: number, currencyCode: string): number => {
  const decimals = getDecimalPlaces(currencyCode);

  if (decimals === 0) {
    return Math.round(value);
  }

  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

/**
 * Validate currency amount
 */
export const isValidAmount = (amount: number): boolean => {
  return (
    typeof amount === 'number' &&
    !isNaN(amount) &&
    isFinite(amount) &&
    amount >= 0
  );
};

/**
 * Parse string to currency amount
 */
export const parseCurrencyAmount = (
  value: string,
  currencyCode: string = DEFAULT_CURRENCY
): number => {
  // Remove currency symbols and whitespace
  const cleanValue = value.replace(/[^\d.,-]/g, '');

  // Parse the number
  const parsed = parseFloat(cleanValue);

  if (isNaN(parsed)) {
    return 0;
  }

  // Round to appropriate decimal places
  return roundCurrency(parsed, currencyCode);
};
