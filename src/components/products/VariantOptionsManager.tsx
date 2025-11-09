import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputField,
  Button,
  ButtonText,
  Pressable,
  Badge,
  BadgeText,
} from '@gluestack-ui/themed';
import { useTheme } from '@/store/themeStore';
import { Plus, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react-native';
import { haptics } from '@/utils/haptics';

interface VariantOption {
  name: string; // e.g., "Size", "Color"
  values: string[]; // e.g., ["S", "M", "L"]
}

export interface Variant {
  id?: string;
  name: string;
  nameAr?: string;
  sku?: string;
  price?: number;
  quantity: number;
  attributes: Record<string, string>;
  isActive?: boolean;
  image?: string;
}

interface VariantOptionsManagerProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  productPrice?: number;
  productQuantity?: number;
  variantsRequired?: boolean;
  onVariantsRequiredChange?: (required: boolean) => void;
  productSKU?: string;
}

export default function VariantOptionsManager({
  variants,
  onChange,
  productPrice,
  productQuantity = 0,
  variantsRequired = false,
  onVariantsRequiredChange,
  productSKU = '',
}: VariantOptionsManagerProps) {
  const { t, i18n } = useTranslation('products');
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  const [options, setOptions] = useState<VariantOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});

  // Get default option names based on language
  const getDefaultOptionName = (index: number) => {
    const arabicNames = ['المقاس', 'اللون', 'الخامة', 'النمط'];
    const englishNames = ['Size', 'Color', 'Material', 'Style'];
    return isRTL ? arabicNames[index] : englishNames[index];
  };

  // Initialize with first option on mount
  useEffect(() => {
    if (options.length === 0 && variants.length === 0) {
      setOptions([{ name: getDefaultOptionName(0), values: [] }]);
    }
  }, []);

  // Parse existing variants to extract options
  useEffect(() => {
    if (variants.length > 0 && options.length === 0) {
      const extractedOptions: Map<string, Set<string>> = new Map();

      variants.forEach((variant) => {
        Object.entries(variant.attributes).forEach(([key, value]) => {
          if (!extractedOptions.has(key)) {
            extractedOptions.set(key, new Set());
          }
          extractedOptions.get(key)?.add(value);
        });
      });

      const parsedOptions: VariantOption[] = Array.from(extractedOptions.entries()).map(
        ([name, values]) => ({
          name,
          values: Array.from(values),
        })
      );

      if (parsedOptions.length > 0) {
        setOptions(parsedOptions);
      }
    }
  }, [variants]);

  // Add new option
  const addOption = () => {
    haptics.light();
    if (options.length >= 4) {
      Alert.alert(
        t('error'),
        isRTL ? 'الحد الأقصى 4 خيارات' : 'Maximum 4 options allowed'
      );
      return;
    }
    setOptions([...options, { name: getDefaultOptionName(options.length), values: [] }]);
  };

  // Remove option
  const removeOption = (index: number) => {
    haptics.light();
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  // Update option name
  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index].name = name;
    setOptions(newOptions);
  };

  // Add value to option
  const addValue = (optionIndex: number) => {
    haptics.light();
    const value = inputValues[optionIndex]?.trim();
    if (!value) {
      Alert.alert(t('error'), isRTL ? 'أدخل قيمة أولاً' : 'Enter a value first');
      return;
    }

    const option = options[optionIndex];
    if (option.values.includes(value)) {
      Alert.alert(t('error'), isRTL ? 'القيمة موجودة مسبقاً' : 'Value already exists');
      return;
    }

    const newOptions = [...options];
    newOptions[optionIndex].values.push(value);
    setOptions(newOptions);

    // Clear input
    setInputValues({ ...inputValues, [optionIndex]: '' });
  };

  // Remove value from option
  const removeValue = (optionIndex: number, valueIndex: number) => {
    haptics.light();
    const newOptions = [...options];
    newOptions[optionIndex].values = newOptions[optionIndex].values.filter(
      (_, i) => i !== valueIndex
    );
    setOptions(newOptions);
  };

  // Generate all possible variant combinations
  const generateVariants = () => {
    haptics.medium();

    if (options.length === 0) return;

    // Validate that all options have at least one value
    const invalidOption = options.find((opt) => !opt.name.trim() || opt.values.length === 0);
    if (invalidOption) {
      Alert.alert(
        t('error'),
        isRTL
          ? 'الرجاء إضافة اسم وقيم لجميع الخيارات'
          : 'Please add name and values for all options'
      );
      return;
    }

    // Generate cartesian product of all option values
    let combinations: string[][] = options[0].values.map((v) => [v]);

    for (let i = 1; i < options.length; i++) {
      const newCombinations: string[][] = [];
      combinations.forEach((combo) => {
        options[i].values.forEach((value) => {
          newCombinations.push([...combo, value]);
        });
      });
      combinations = newCombinations;
    }

    // Create variants from combinations
    const newVariants: Variant[] = combinations.map((combo) => {
      const attributes: Record<string, string> = {};
      combo.forEach((value, i) => {
        attributes[options[i].name] = value;
      });

      const variantName = combo.join(' / ');

      // Generate SKU automatically based on product SKU
      let generatedSKU = '';
      if (productSKU && productSKU.trim()) {
        const skuSuffix = combo
          .map((val) => val.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''))
          .join('-');
        generatedSKU = `${productSKU.trim()}-${skuSuffix}`;
      }

      return {
        name: variantName,
        nameAr: variantName,
        sku: generatedSKU,
        price: productPrice,
        quantity: 0,
        attributes,
        isActive: true,
      };
    });

    onChange(newVariants);
    haptics.success();
    Alert.alert(
      t('success'),
      isRTL
        ? `تم توليد ${newVariants.length} متغير`
        : `Generated ${newVariants.length} variants`
    );
  };

  // Calculate total variants quantity
  const getTotalVariantsQuantity = () => {
    return variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
  };

  const totalVariantsQty = getTotalVariantsQuantity();
  const stockExceeded = productQuantity > 0 && totalVariantsQty > productQuantity;

  // Update variant field
  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    onChange(newVariants);
  };

  // Delete variant
  const deleteVariant = (index: number) => {
    haptics.light();
    const newVariants = variants.filter((_, i) => i !== index);
    onChange(newVariants);
  };

  return (
    <VStack space="md">
      {/* Header */}
      <Pressable
        onPress={() => {
          haptics.light();
          setShowOptions(!showOptions);
        }}
        bg="$surfaceLight"
        $dark-bg="$surfaceDark"
        borderRadius="$xl"
        p="$4"
        $active-opacity={0.7}
      >
        <HStack
          alignItems="center"
          justifyContent="space-between"
          flexDirection={isRTL ? 'row-reverse' : 'row'}
        >
          <HStack alignItems="center" space="sm" flexDirection={isRTL ? 'row-reverse' : 'row'}>
            <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark">
              {isRTL ? 'المتغيرات (Variants)' : 'Variants'}
            </Text>
            {variants.length > 0 && (
              <Badge action="success" variant="solid" size="sm" borderRadius="$full">
                <BadgeText fontSize="$xs">{variants.length}</BadgeText>
              </Badge>
            )}
          </HStack>
          {showOptions ? (
            <ChevronUp size={20} color={colors.text} />
          ) : (
            <ChevronDown size={20} color={colors.text} />
          )}
        </HStack>
      </Pressable>

      {/* Options Editor */}
      {showOptions && (
        <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$xl" p="$4">
          <VStack space="md">
            {/* Options */}
            {options.map((option, optionIndex) => (
              <VStack
                key={optionIndex}
                space="sm"
                p="$3"
                bg="$backgroundLight"
                $dark-bg="$backgroundDark"
                borderRadius="$lg"
              >
                {/* Option Name */}
                <HStack
                  alignItems="center"
                  space="sm"
                  flexDirection={isRTL ? 'row-reverse' : 'row'}
                >
                  <Input
                    flex={1}
                    size="md"
                    borderRadius="$lg"
                    bg="$surfaceLight"
                    $dark-bg="$surfaceDark"
                  >
                    <InputField
                      value={option.name}
                      onChangeText={(text) => updateOptionName(optionIndex, text)}
                      placeholder={isRTL ? 'اسم الخيار' : 'Option name'}
                      color="$textLight"
                      $dark-color="$textDark"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </Input>
                  {options.length > 1 && (
                    <Pressable
                      onPress={() => removeOption(optionIndex)}
                      w={36}
                      h={36}
                      borderRadius="$lg"
                      bg="$error500"
                      opacity={0.9}
                      alignItems="center"
                      justifyContent="center"
                      $active-opacity={0.7}
                    >
                      <X size={18} color="#FFFFFF" strokeWidth={2.5} />
                    </Pressable>
                  )}
                </HStack>

                {/* Add Value Input */}
                <HStack
                  alignItems="center"
                  space="sm"
                  flexDirection={isRTL ? 'row-reverse' : 'row'}
                >
                  <Input
                    flex={1}
                    size="md"
                    borderRadius="$lg"
                    bg="$surfaceLight"
                    $dark-bg="$surfaceDark"
                  >
                    <InputField
                      value={inputValues[optionIndex] || ''}
                      onChangeText={(text) =>
                        setInputValues({ ...inputValues, [optionIndex]: text })
                      }
                      placeholder={isRTL ? 'أضف قيمة (مثال: S, M, L)' : 'Add value (e.g., S, M, L)'}
                      color="$textLight"
                      $dark-color="$textDark"
                      placeholderTextColor={colors.textSecondary}
                      onSubmitEditing={() => addValue(optionIndex)}
                      returnKeyType="done"
                    />
                  </Input>
                  <Pressable
                    onPress={() => addValue(optionIndex)}
                    w={36}
                    h={36}
                    borderRadius="$lg"
                    bg="$primary500"
                    alignItems="center"
                    justifyContent="center"
                    $active-opacity={0.7}
                  >
                    <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                  </Pressable>
                </HStack>

                {/* Values */}
                {option.values.length > 0 && (
                  <HStack
                    flexWrap="wrap"
                    gap="$2"
                    flexDirection={isRTL ? 'row-reverse' : 'row'}
                  >
                    {option.values.map((value, valueIndex) => (
                      <Pressable
                        key={valueIndex}
                        onPress={() => removeValue(optionIndex, valueIndex)}
                        px="$3"
                        py="$2"
                        bg="$primary100"
                        $dark-bg="$primary900"
                        borderRadius="$lg"
                        $active-opacity={0.7}
                      >
                        <HStack
                          alignItems="center"
                          space="xs"
                          flexDirection={isRTL ? 'row-reverse' : 'row'}
                        >
                          <Text
                            fontSize="$sm"
                            color="$primary500"
                            $dark-color="$primary400"
                          >
                            {value}
                          </Text>
                          <X size={14} color={colors.primary} strokeWidth={2} />
                        </HStack>
                      </Pressable>
                    ))}
                  </HStack>
                )}
              </VStack>
            ))}

            {/* Add Option Button */}
            {options.length < 4 && (
              <Button
                onPress={addOption}
                size="md"
                variant="outline"
                action="secondary"
                borderRadius="$lg"
              >
                <HStack
                  alignItems="center"
                  space="xs"
                  flexDirection={isRTL ? 'row-reverse' : 'row'}
                >
                  <Plus size={16} color={colors.primary} strokeWidth={2.5} />
                  <ButtonText color="$primary500">
                    {isRTL ? 'إضافة خيار' : 'Add Option'}
                  </ButtonText>
                </HStack>
              </Button>
            )}

            {/* Generate Variants Button */}
            <Button
              onPress={generateVariants}
              size="lg"
              bg="$primary500"
              borderRadius="$lg"
              $active-opacity={0.8}
            >
              <HStack
                alignItems="center"
                space="xs"
                flexDirection={isRTL ? 'row-reverse' : 'row'}
              >
                <RefreshCw size={18} color="#FFFFFF" strokeWidth={2.5} />
                <ButtonText fontWeight="$bold">
                  {isRTL ? 'توليد المتغيرات' : 'Generate Variants'}
                </ButtonText>
              </HStack>
            </Button>
          </VStack>
        </Box>
      )}

      {/* Generated Variants List */}
      {variants.length > 0 && (
        <VStack space="sm">
          {/* Stock Warning */}
          {stockExceeded && (
            <Box
              bg="$error100"
              $dark-bg="$error900"
              p="$3"
              borderRadius="$lg"
            >
              <Text fontSize="$sm" color="$error500" textAlign={isRTL ? 'right' : 'left'}>
                {isRTL
                  ? `⚠️ إجمالي كميات المتغيرات (${totalVariantsQty}) يتجاوز مخزون المنتج (${productQuantity})`
                  : `⚠️ Total variant quantities (${totalVariantsQty}) exceed product stock (${productQuantity})`}
              </Text>
            </Box>
          )}

          {/* Variants */}
          {variants.map((variant, index) => (
            <Box
              key={index}
              bg="$surfaceLight"
              $dark-bg="$surfaceDark"
              p="$3"
              borderRadius="$lg"
            >
              <VStack space="sm">
                {/* Variant Name */}
                <HStack
                  alignItems="center"
                  justifyContent="space-between"
                  flexDirection={isRTL ? 'row-reverse' : 'row'}
                >
                  <Text
                    fontSize="$sm"
                    fontWeight="$semibold"
                    color="$textLight"
                    $dark-color="$textDark"
                  >
                    {variant.name}
                  </Text>
                  <Pressable
                    onPress={() => deleteVariant(index)}
                    w={32}
                    h={32}
                    borderRadius="$lg"
                    bg="$error100"
                    $dark-bg="$error900"
                    alignItems="center"
                    justifyContent="center"
                    $active-opacity={0.7}
                  >
                    <X size={16} color={colors.error} strokeWidth={2.5} />
                  </Pressable>
                </HStack>

                {/* Price and Quantity */}
                <HStack space="sm">
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      {isRTL ? 'السعر' : 'Price'}
                    </Text>
                    <Input size="md" borderRadius="$lg">
                      <InputField
                        value={variant.price?.toString() || ''}
                        onChangeText={(text) => updateVariant(index, 'price', parseFloat(text) || 0)}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        color="$textLight"
                        $dark-color="$textDark"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </Input>
                  </VStack>
                  <VStack flex={1} space="xs">
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      {isRTL ? 'الكمية' : 'Quantity'}
                    </Text>
                    <Input size="md" borderRadius="$lg">
                      <InputField
                        value={variant.quantity?.toString() || '0'}
                        onChangeText={(text) => updateVariant(index, 'quantity', parseInt(text) || 0)}
                        keyboardType="number-pad"
                        placeholder="0"
                        color="$textLight"
                        $dark-color="$textDark"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </Input>
                  </VStack>
                </HStack>

                {/* SKU (Optional) */}
                {variant.sku && (
                  <VStack space="xs">
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      SKU
                    </Text>
                    <Input size="md" borderRadius="$lg">
                      <InputField
                        value={variant.sku}
                        onChangeText={(text) => updateVariant(index, 'sku', text)}
                        placeholder="SKU"
                        color="$textLight"
                        $dark-color="$textDark"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </Input>
                  </VStack>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
