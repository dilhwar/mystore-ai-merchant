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
 * First language field is marked as required
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

  return (
    <>
      {storeLanguages.map((lang, index) => {
        const field = getFieldName(index, fieldName, lang);
        const isRequired = index === 0; // First language is required
        const isRTLLang = lang === 'ar';

        return (
          <VStack key={lang} space="xs">
            <Text
              fontSize="$sm"
              fontWeight="$medium"
              color="$textLight"
              $dark-color="$textDark"
              textAlign={isRTL ? 'right' : 'left'}
            >
              {t(fieldName)} ({lang.toUpperCase()}) {isRequired && '*'}
            </Text>
            {multiline ? (
              <Textarea
                borderRadius="$xl"
                borderColor="$borderLight"
                $dark-borderColor="$borderDark"
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
                  textAlign={isRTLLang ? 'right' : (isRTL ? 'right' : 'left')}
                  isDisabled={disabled}
                />
              </Textarea>
            ) : (
              <Input
                borderRadius="$xl"
                borderColor="$borderLight"
                $dark-borderColor="$borderDark"
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
                  textAlign={isRTLLang ? 'right' : (isRTL ? 'right' : 'left')}
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
