/**
 * Language Helper Functions for Dynamic Language System
 *
 * IMPORTANT: Field naming is position-based, NOT language-specific!
 * - languages[0] → base fields (name, description)
 * - languages[1] → capitalized suffix fields (name{Lang}, description{Lang})
 *
 * Example:
 * - languages = ["fr", "es"] → name (French), nameEs (Spanish)
 * - languages = ["ar", "en"] → name (Arabic), nameEn (English)
 */

/**
 * Get field name based on language index and base field
 * @param languageIndex - Index in languages array (0 or 1)
 * @param baseField - Base field name (e.g., 'name', 'description')
 * @param languageCode - Language code (e.g., 'ar', 'en', 'fr')
 * @returns Field name (e.g., 'name', 'nameAr', 'nameEs')
 */
export function getFieldName(
  languageIndex: number,
  baseField: string,
  languageCode: string
): string {
  if (languageIndex === 0) {
    // First language → base field
    return baseField; // 'name', 'description'
  } else {
    // Second language → capitalized suffix
    const capitalizedLang = languageCode.charAt(0).toUpperCase() + languageCode.slice(1);
    return `${baseField}${capitalizedLang}`; // 'nameEs', 'nameFr', 'nameAr'
  }
}

/**
 * Get translated field value from an object
 * @param item - Object containing translated fields
 * @param fieldName - Base field name (e.g., 'name', 'description')
 * @param languages - Array of store languages
 * @param currentLanguage - Current display language
 * @returns Translated value or fallback to primary language
 */
export function getTranslatedField(
  item: any,
  fieldName: string,
  languages: string[],
  currentLanguage: string
): string {
  if (!item) return '';

  // Get current language index
  const langIndex = languages.indexOf(currentLanguage);

  if (langIndex === 0) {
    // Primary language → base field
    return item[fieldName] || '';
  } else if (langIndex > 0) {
    // Secondary language → capitalized field
    const lang = languages[langIndex];
    const capitalizedLang = lang.charAt(0).toUpperCase() + lang.slice(1);
    const translatedFieldName = `${fieldName}${capitalizedLang}`;

    // Return translated field or fallback to base field
    return item[translatedFieldName] || item[fieldName] || '';
  }

  // Fallback to base field
  return item[fieldName] || '';
}

/**
 * Get product/category name in current language
 * @param item - Product or Category object
 * @param languages - Array of store languages
 * @param currentLanguage - Current display language
 * @returns Translated name
 */
export function getTranslatedName(
  item: any,
  languages: string[],
  currentLanguage: string
): string {
  return getTranslatedField(item, 'name', languages, currentLanguage);
}

/**
 * Get product/category description in current language
 * @param item - Product or Category object
 * @param languages - Array of store languages
 * @param currentLanguage - Current display language
 * @returns Translated description
 */
export function getTranslatedDescription(
  item: any,
  languages: string[],
  currentLanguage: string
): string {
  return getTranslatedField(item, 'description', languages, currentLanguage);
}

/**
 * Capitalize language code
 * @param langCode - Language code (e.g., 'ar', 'en', 'fr')
 * @returns Capitalized language code (e.g., 'Ar', 'En', 'Fr')
 */
export function capitalizeLanguageCode(langCode: string): string {
  return langCode.charAt(0).toUpperCase() + langCode.slice(1);
}

/**
 * Get all field names for all languages
 * @param baseField - Base field name (e.g., 'name')
 * @param languages - Array of store languages
 * @returns Object with field names for each language
 *
 * Example:
 * getLanguageFields('name', ['en', 'ar'])
 * → { en: 'name', ar: 'nameAr' }
 */
export function getLanguageFields(
  baseField: string,
  languages: string[]
): Record<string, string> {
  const fields: Record<string, string> = {};

  languages.forEach((lang, index) => {
    fields[lang] = getFieldName(index, baseField, lang);
  });

  return fields;
}

/**
 * Map object with language fields to flat object
 * @param translations - Object with language keys { en: { name: '...' }, ar: { name: '...' } }
 * @param languages - Array of store languages
 * @param fields - Array of field names to map
 * @returns Flat object with language-suffixed fields
 *
 * Example:
 * mapTranslationsToFields(
 *   { en: { name: 'Watch' }, ar: { name: 'ساعة' } },
 *   ['en', 'ar'],
 *   ['name', 'description']
 * )
 * → { name: 'Watch', nameAr: 'ساعة', description: '', descriptionAr: '' }
 */
export function mapTranslationsToFields(
  translations: Record<string, any>,
  languages: string[],
  fields: string[]
): Record<string, any> {
  const result: Record<string, any> = {};

  languages.forEach((lang, index) => {
    const langData = translations[lang] || {};

    fields.forEach((field) => {
      const fieldName = getFieldName(index, field, lang);
      result[fieldName] = langData[field] || '';
    });
  });

  return result;
}

/**
 * Map flat object with language fields to translations object
 * @param data - Flat object with language-suffixed fields
 * @param languages - Array of store languages
 * @param fields - Array of field names to extract
 * @returns Object with language keys
 *
 * Example:
 * mapFieldsToTranslations(
 *   { name: 'Watch', nameAr: 'ساعة' },
 *   ['en', 'ar'],
 *   ['name', 'description']
 * )
 * → { en: { name: 'Watch', description: '' }, ar: { name: 'ساعة', description: '' } }
 */
export function mapFieldsToTranslations(
  data: any,
  languages: string[],
  fields: string[]
): Record<string, any> {
  const translations: Record<string, any> = {};

  languages.forEach((lang, index) => {
    const langData: Record<string, any> = {};

    fields.forEach((field) => {
      const fieldName = getFieldName(index, field, lang);
      langData[field] = data[fieldName] || '';
    });

    translations[lang] = langData;
  });

  return translations;
}
