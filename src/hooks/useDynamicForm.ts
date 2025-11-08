import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getFieldName } from '@/utils/language';

/**
 * Hook for managing dynamic form data based on store languages
 * @param fields - Array of field names (e.g., ['name', 'description'])
 * @param initialData - Optional initial data to populate form
 * @returns formData state and setter, plus helper functions
 */
export function useDynamicForm(fields: string[], initialData?: any) {
  const { storeLanguages } = useAuthStore();
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Initialize form data for all language fields
  useEffect(() => {
    const initialFormData: Record<string, string> = {};

    fields.forEach((field) => {
      storeLanguages.forEach((lang, index) => {
        const fieldName = getFieldName(index, field, lang);
        // Use initialData if provided, otherwise empty string
        initialFormData[fieldName] = initialData?.[fieldName] || '';
      });
    });

    setFormData(initialFormData);
  }, [storeLanguages, initialData, fields.join(',')]);

  /**
   * Build API payload from form data
   * Only includes fields with non-empty values
   */
  const buildPayload = (): Record<string, any> => {
    const payload: Record<string, any> = {};

    storeLanguages.forEach((lang, index) => {
      fields.forEach((field) => {
        const fieldName = getFieldName(index, field, lang);
        const value = formData[fieldName]?.trim();
        if (value) {
          payload[fieldName] = value;
        }
      });
    });

    return payload;
  };

  /**
   * Validate that required fields are filled
   * First language of each field is required
   */
  const validateRequiredFields = (): boolean => {
    for (const field of fields) {
      const primaryFieldName = getFieldName(0, field, storeLanguages[0]);
      if (!formData[primaryFieldName]?.trim()) {
        return false;
      }
    }
    return true;
  };

  /**
   * Get the value of a specific field in a specific language
   */
  const getFieldValue = (field: string, langIndex: number): string => {
    const fieldName = getFieldName(langIndex, field, storeLanguages[langIndex]);
    return formData[fieldName] || '';
  };

  /**
   * Update form data
   */
  const updateFormData = (updates: Record<string, string>) => {
    setFormData({ ...formData, ...updates });
  };

  return {
    formData,
    setFormData,
    updateFormData,
    buildPayload,
    validateRequiredFields,
    getFieldValue,
    storeLanguages,
  };
}
