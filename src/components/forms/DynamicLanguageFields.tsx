import React from 'react';
import { VStack, Text, Input, InputField, Textarea, TextareaInput } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { getFieldName } from '@/utils/language';

interface DynamicLanguageFieldsProps {
  fieldName: string; // e.g., 'name', 'description', 'instructions'
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  placeholder?: string;
  multiline?: boolean;
  minHeight?: number;
  disabled?: boolean;
}

/**
 * Dynamic Language Fields Component
 * Renders input fields for all store languages dynamically
 * Fields are reordered based on current app language (current language first)
 */
export function DynamicLanguageFields({
  fieldName,
  formData,
  setFormData,
  placeholder,
  multiline = false,
  minHeight = 80,
  disabled = false,
}: DynamicLanguageFieldsProps) {
  const { t, i18n } = useTranslation('settings');
  const { storeLanguages } = useAuthStore();
  const isRTL = i18n.language === 'ar';

  // Reorder languages to put current language first
  const currentLangIndex = storeLanguages.indexOf(i18n.language);
  const orderedLanguages = currentLangIndex >= 0
    ? [
        storeLanguages[currentLangIndex],
        ...storeLanguages.filter((_, idx) => idx !== currentLangIndex)
      ]
    : storeLanguages;

  return (
    <>
      {orderedLanguages.map((lang) => {
        const index = storeLanguages.indexOf(lang);
        const field = getFieldName(index, fieldName, lang);
        const isCurrentLang = lang === i18n.language;
        const isRTLLang = lang === 'ar';

        // Get label based on language
        const label = lang === 'ar' ?
          (i18n.language === 'ar' ? t(fieldName) : `${t(fieldName)} (عربي)`) :
          (i18n.language === 'en' ? t(fieldName) : `${t(fieldName)} (English)`);

        return (
          <VStack key={lang} space="xs">
            <Text
              fontSize="$sm"
              fontWeight={isCurrentLang ? '$semibold' : '$medium'}
              color={isCurrentLang ? '$primary500' : '$textLight'}
              $dark-color={isCurrentLang ? '$primary500' : '$textDark'}
              textAlign={isRTL ? 'right' : 'left'}
            >
              {label}
            </Text>
            {multiline ? (
              <Textarea
                borderRadius="$xl"
                borderColor={isCurrentLang ? '$primary500' : '$borderLight'}
                $dark-borderColor={isCurrentLang ? '$primary500' : '$borderDark'}
                bg="$backgroundLight"
                $dark-bg="$backgroundDark"
                minHeight={minHeight}
                opacity={disabled ? 0.6 : 1}
              >
                <TextareaInput
                  value={formData[field] || ''}
                  onChangeText={(value) => setFormData({ ...formData, [field]: value })}
                  placeholder={placeholder}
                  color="$textLight"
                  $dark-color="$textDark"
                  textAlign={isRTLLang ? 'right' : 'left'}
                  isDisabled={disabled}
                />
              </Textarea>
            ) : (
              <Input
                borderRadius="$xl"
                borderColor={isCurrentLang ? '$primary500' : '$borderLight'}
                $dark-borderColor={isCurrentLang ? '$primary500' : '$borderDark'}
                bg="$backgroundLight"
                $dark-bg="$backgroundDark"
                opacity={disabled ? 0.6 : 1}
              >
                <InputField
                  value={formData[field] || ''}
                  onChangeText={(value) => setFormData({ ...formData, [field]: value })}
                  placeholder={placeholder}
                  color="$textLight"
                  $dark-color="$textDark"
                  textAlign={isRTLLang ? 'right' : 'left'}
                  isDisabled={disabled}
                />
              </Input>
            )}
          </VStack>
        );
      })}
    </>
  );
}
