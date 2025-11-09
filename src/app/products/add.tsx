import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Alert as RNAlert, RefreshControl, Image as RNImage, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { haptics } from '@/utils/haptics';
import {
  Box,
  HStack,
  VStack,
  Text,
  Pressable,
  Spinner,
  Button,
  ButtonText,
  Input,
  InputField,
  Switch,
  Textarea,
  TextareaInput,
} from '@gluestack-ui/themed';
import {
  ImagePlus,
  Sparkles,
  Package,
  Tag,
  X,
  ChevronDown,
  Folder,
  CornerDownRight,
  Check,
} from 'lucide-react-native';
import { createProduct } from '@/services/products.service';
import { getCategories, Category } from '@/services/categories.service';
import { generateAllContentWithImage } from '@/services/ai.service';
import { getFieldName, getTranslatedName } from '@/utils/language';
import { getCurrencyByCode } from '@/constants/currencies';
import { getStoreSettings } from '@/services/store-settings.service';
import { uploadMultipleImages, validateImages } from '@/services/upload.service';
import VariantOptionsManager, { Variant } from '@/components/products/VariantOptionsManager';

export default function AddProductScreen() {
  const { t, i18n } = useTranslation('products');
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { storeLanguages, defaultLanguage, storeCurrency, setStoreSettings } = useAuthStore();

  const scrollViewRef = useRef<ScrollView>(null);
  const quantityInputRef = useRef<any>(null);
  const descriptionRefs = useRef<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    price: '',
    quantity: '0',
    categoryId: '',
    currency: storeCurrency,
    enabled: true,
  });
  const [images, setImages] = useState<any[]>([]);
  const [selectedAIImageIndex, setSelectedAIImageIndex] = useState<number>(0);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsRequired, setVariantsRequired] = useState(false);

  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';
  const currencyInfo = getCurrencyByCode(storeCurrency);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, currency: storeCurrency }));
  }, [storeCurrency]);

  const loadInitialData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      await Promise.all([loadCategories(), loadStoreSettings()]);
    } catch (error: any) {
      RNAlert.alert(t('error'), error.message || t('load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Load categories error:', error.message);
    }
  };

  const loadStoreSettings = async () => {
    try {
      const storeData: any = await getStoreSettings();
      const languages = (storeData.settings?.languages as string[]) || [defaultLanguage];
      const defaultLang = languages[0] || defaultLanguage;
      const currency = storeData.settings?.currency || storeCurrency;
      setStoreSettings(languages, defaultLang, currency);
    } catch (error: any) {
      console.error('Load store settings error:', error.message);
    }
  };

  const updateField = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const getFieldValue = (fieldName: string): string => {
    return formData[fieldName] || '';
  };

  const scrollToInput = (yOffset: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: yOffset,
        animated: true,
      });
    }, 300);
  };

  const pickImages = async () => {
    if (images.length >= 10) {
      RNAlert.alert(t('error'), t('max_images_reached'));
      return;
    }
    haptics.light();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - images.length,
    });
    if (!result.canceled && result.assets.length > 0) {
      const newImages = [...images, ...result.assets].slice(0, 10);
      setImages(newImages);
      haptics.success();
    }
  };

  const removeImage = (index: number) => {
    haptics.light();
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (selectedAIImageIndex === index) {
      setSelectedAIImageIndex(0);
    } else if (selectedAIImageIndex > index) {
      setSelectedAIImageIndex(selectedAIImageIndex - 1);
    }
  };

  const generateWithAI = async () => {
    if (images.length === 0) {
      RNAlert.alert(t('error'), t('image_required_for_ai'));
      return;
    }
    try {
      setAiLoading(true);
      setUploadStatus(t('uploading_image_for_ai') || 'Uploading image for AI...');
      const selectedImage = images[selectedAIImageIndex];
      const imageUris = [selectedImage.uri];
      const uploadedImages = await uploadMultipleImages(imageUris, 'products');
      if (!uploadedImages || uploadedImages.length === 0) {
        throw new Error('Failed to upload image for AI');
      }
      const s3ImageUrl = uploadedImages[0]?.sizes?.medium?.url || uploadedImages[0]?.sizes?.large?.url;
      if (!s3ImageUrl) {
        throw new Error('Failed to get image URL from upload response');
      }
      setUploadStatus(t('generating_content') || 'Generating content...');
      const response = await generateAllContentWithImage({
        imageUri: s3ImageUrl,
        category: formData.categoryId || undefined,
        storeLanguages,
        dashboardLanguage: currentLanguage,
      });
      const updatedFormData = { ...formData };
      storeLanguages.forEach((lang, index) => {
        const nameField = getFieldName(index, 'name', lang);
        const descField = getFieldName(index, 'description', lang);
        updatedFormData[nameField] = response[lang]?.name || '';
        updatedFormData[descField] = response[lang]?.description || '';
      });
      setFormData(updatedFormData);
      haptics.success();
      RNAlert.alert(t('success'), t('ai_content_generated'));
    } catch (error: any) {
      haptics.error();
      const errorMessage = error.message || t('ai_generation_failed');
      RNAlert.alert(t('error'), errorMessage);
    } finally {
      setAiLoading(false);
      setUploadStatus('');
    }
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      RNAlert.alert(t('error'), t('image_required'));
      return;
    }
    const primaryNameField = getFieldName(0, 'name', storeLanguages[0]);
    if (!formData[primaryNameField]?.trim()) {
      RNAlert.alert(t('error'), t('name_required'));
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      RNAlert.alert(t('error'), t('price_required'));
      return;
    }
    if (!formData.currency) {
      RNAlert.alert(t('error'), t('currency_required'));
      return;
    }
    try {
      setLoading(true);
      setUploadProgress(0);
      setUploadStatus(t('validating_images') || 'Validating images...');
      const imageUris = images.map((img) => img.uri);
      const validation = await validateImages(imageUris, {
        maxSizeMB: 5,
        maxWidth: 4000,
        maxHeight: 4000,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      });
      if (!validation.valid) {
        RNAlert.alert(t('error'), validation.errors.join('\n'));
        setLoading(false);
        setUploadStatus('');
        return;
      }
      setUploadStatus(t('uploading_images') || 'Uploading images...');
      const uploadedImages = await uploadMultipleImages(
        imageUris,
        'products',
        (index, progress) => {
          setUploadProgress(progress.percentage);
          setUploadStatus(`${t('uploading')} ${index + 1}/${imageUris.length} (${progress.percentage}%)`);
        }
      );
      if (!uploadedImages || uploadedImages.length === 0) {
        throw new Error('Failed to upload images');
      }
      setUploadStatus(t('creating_product') || 'Creating product...');
      setUploadProgress(100);

      // Get primary language fields (index 0)
      const primaryNameField = getFieldName(0, 'name', storeLanguages[0]);
      const primaryDescField = getFieldName(0, 'description', storeLanguages[0]);

      const productData: any = {
        name: formData[primaryNameField]?.trim() || '',
        description: formData[primaryDescField]?.trim() || '',
        price: parseFloat(formData.price),
        categoryId: formData.categoryId || undefined,
        quantity: parseInt(formData.quantity) || 0,
        enabled: formData.enabled,
        featured: false,
        images: uploadedImages
          .map((img) => img.sizes?.medium?.url || img.sizes?.large?.url || img.sizes?.thumbnail?.url)
          .filter((url) => url), // Filter out null/undefined
      };

      // Add secondary language fields if they exist
      if (storeLanguages.length > 1) {
        storeLanguages.slice(1).forEach((lang, idx) => {
          const index = idx + 1; // Skip first language
          const nameField = getFieldName(index, 'name', lang);
          const descField = getFieldName(index, 'description', lang);
          productData[nameField] = formData[nameField]?.trim() || '';
          productData[descField] = formData[descField]?.trim() || '';
        });
      }

      // Add variants if they exist
      if (variants && variants.length > 0) {
        productData.variants = variants;
        productData.variantsRequired = variantsRequired;
      }

      await createProduct(productData);
      haptics.success();
      RNAlert.alert(t('success'), t('product_created'), [
        {
          text: t('ok'),
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      haptics.error();
      RNAlert.alert(t('error'), error.message || t('create_error'));
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  const getLanguageDisplayName = (langCode: string): string => {
    const languageNames: Record<string, string> = {
      en: 'English',
      ar: 'العربية',
      fr: 'Français',
      es: 'Español',
      de: 'Deutsch',
      it: 'Italiano',
      pt: 'Português',
      ru: 'Русский',
      zh: '中文',
      ja: '日本語',
      ko: '한국어',
      tr: 'Türkçe',
      hi: 'हिन्दी',
    };
    return languageNames[langCode] || langCode.toUpperCase();
  };

  const isFormValid = (): boolean => {
    if (images.length === 0) return false;
    const primaryNameField = getFieldName(0, 'name', storeLanguages[0]);
    if (!formData[primaryNameField]?.trim()) return false;
    if (!formData.price || parseFloat(formData.price) < 0) return false;
    return true;
  };

  if (loading && !refreshing) {
    return (
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$primary500" />
        <Text mt="$4" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
          {t('loading')}
        </Text>
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 60, paddingBottom: 200, paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadInitialData(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <VStack space="md">
            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$xl" p="$4">
              {images.length > 0 ? (
                <VStack space="sm">
                  <HStack flexWrap="wrap" gap="$2">
                    {images.map((img, index) => (
                      <Box key={index} w="31%" aspectRatio={1} borderRadius="$lg" overflow="hidden" position="relative">
                        <RNImage source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        <Pressable onPress={() => { haptics.light(); setSelectedAIImageIndex(index); }} position="absolute" top={6} left={6} w={24} h={24} borderRadius="$full" bg={selectedAIImageIndex === index ? '$purple500' : 'rgba(0,0,0,0.6)'} alignItems="center" justifyContent="center">
                          <Sparkles size={10} color="#FFFFFF" strokeWidth={2.5} />
                        </Pressable>
                        <Pressable onPress={() => removeImage(index)} position="absolute" top={6} right={6} w={24} h={24} borderRadius="$full" bg="$error500" alignItems="center" justifyContent="center">
                          <X size={14} color="#FFFFFF" strokeWidth={2.5} />
                        </Pressable>
                        {index === 0 && (
                          <Box position="absolute" bottom={0} left={0} right={0} bg="$primary500" py="$0.5" alignItems="center">
                            <Text fontSize="$xs" fontWeight="$bold" color="$white">{t('main')}</Text>
                          </Box>
                        )}
                      </Box>
                    ))}
                    {images.length < 10 && (
                      <Pressable onPress={pickImages} w="31%" aspectRatio={1} borderRadius="$lg" borderWidth={2} borderStyle="dashed" borderColor="$borderLight" $dark-borderColor="$borderDark" alignItems="center" justifyContent="center" $active-opacity={0.7}>
                        <ImagePlus size={24} color={colors.textSecondary} strokeWidth={1.5} />
                      </Pressable>
                    )}
                  </HStack>
                  <Button size="md" bg="$purple500" borderRadius="$lg" onPress={generateWithAI} isDisabled={aiLoading}>
                    <HStack space="xs" alignItems="center">
                      {aiLoading ? <Spinner size="small" color="$white" /> : <Sparkles size={16} color="#FFFFFF" strokeWidth={2} />}
                      <ButtonText fontSize="$sm" fontWeight="$semibold" color="$white">{aiLoading ? (uploadStatus || t('generating')) : t('generate_with_ai')}</ButtonText>
                    </HStack>
                  </Button>
                </VStack>
              ) : (
                <Pressable onPress={pickImages} h={100} borderRadius="$lg" borderWidth={2} borderStyle="dashed" borderColor="$borderLight" $dark-borderColor="$borderDark" alignItems="center" justifyContent="center" $active-opacity={0.7}>
                  <ImagePlus size={28} color={colors.textSecondary} strokeWidth={1.5} />
                  <Text fontSize="$sm" fontWeight="$medium" color="$textSecondaryLight" $dark-color="$textSecondaryDark" mt="$2">{t('tap_to_add_images')}</Text>
                </Pressable>
              )}
            </Box>

            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$xl" p="$4">
              <VStack space="md">
                {storeLanguages.map((lang, index) => {
                  const isPrimaryLanguage = index === 0;
                  const nameField = getFieldName(index, 'name', lang);
                  const descField = getFieldName(index, 'description', lang);
                  const langDisplayName = getLanguageDisplayName(lang);
                  return (
                    <VStack key={lang} space="sm" pb={index < storeLanguages.length - 1 ? "$3" : "$0"} borderBottomWidth={index < storeLanguages.length - 1 ? 1 : 0} borderBottomColor="$borderLight" $dark-borderBottomColor="$borderDark">
                      {storeLanguages.length > 1 && (
                        <HStack alignItems="center" justifyContent="space-between" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                          <Text fontSize="$xs" fontWeight="$semibold" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textTransform="uppercase">
                            {langDisplayName}
                          </Text>
                          {isPrimaryLanguage && (
                            <Box px="$1.5" py="$0.5" borderRadius="$full" bg={isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'}>
                              <Text fontSize="$xs" fontWeight="$semibold" color="$primary500">{t('primary')}</Text>
                            </Box>
                          )}
                        </HStack>
                      )}
                      <Input size="lg" borderRadius="$lg" bg="$backgroundLight" $dark-bg="$backgroundDark" borderColor="$borderLight" $dark-borderColor="$borderDark" $focus-borderColor="$primary500">
                        <InputField
                          value={getFieldValue(nameField)}
                          onChangeText={(text) => updateField(nameField, text)}
                          onFocus={() => scrollToInput(200)}
                          onSubmitEditing={() => descriptionRefs.current[lang]?.focus()}
                          placeholder={`${t('product_name')}${isPrimaryLanguage ? ' *' : ''}`}
                          color="$textLight"
                          $dark-color="$textDark"
                          placeholderTextColor={colors.textSecondary}
                          returnKeyType="next"
                          blurOnSubmit={false}
                        />
                      </Input>
                      <Textarea size="md" borderRadius="$lg" bg="$backgroundLight" $dark-bg="$backgroundDark" borderColor="$borderLight" $dark-borderColor="$borderDark" $focus-borderColor="$primary500" h={70}>
                        <TextareaInput
                          ref={(ref) => descriptionRefs.current[lang] = ref}
                          value={getFieldValue(descField)}
                          onChangeText={(text) => updateField(descField, text)}
                          onFocus={() => scrollToInput(300)}
                          placeholder={t('description')}
                          color="$textLight"
                          $dark-color="$textDark"
                          placeholderTextColor={colors.textSecondary}
                          returnKeyType="done"
                          blurOnSubmit={true}
                        />
                      </Textarea>
                    </VStack>
                  );
                })}
              </VStack>
            </Box>

            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$xl" p="$4">
              <VStack space="sm">
                <HStack space="sm">
                  <VStack flex={1} space="xs">
                    <HStack alignItems="center" space="xs" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                      <Text fontSize="$sm" fontWeight="$medium" color="$textLight" $dark-color="$textDark">
                        {t('price')}
                      </Text>
                      <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                        ({currencyInfo?.symbol || storeCurrency})
                      </Text>
                    </HStack>
                    <Input size="lg" borderRadius="$lg" bg="$backgroundLight" $dark-bg="$backgroundDark" borderColor="$borderLight" $dark-borderColor="$borderDark" $focus-borderColor="$primary500">
                      <InputField
                        value={formData.price}
                        onChangeText={(text) => updateField('price', text)}
                        onFocus={() => scrollToInput(400)}
                        onSubmitEditing={() => quantityInputRef.current?.focus()}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        color="$textLight"
                        $dark-color="$textDark"
                        placeholderTextColor={colors.textSecondary}
                        returnKeyType="next"
                        blurOnSubmit={false}
                      />
                    </Input>
                  </VStack>
                  <VStack flex={1} space="xs">
                    <Text fontSize="$sm" fontWeight="$medium" color="$textLight" $dark-color="$textDark">
                      {t('quantity')}
                    </Text>
                    <Input size="lg" borderRadius="$lg" bg="$backgroundLight" $dark-bg="$backgroundDark" borderColor="$borderLight" $dark-borderColor="$borderDark" $focus-borderColor="$primary500">
                      <InputField
                        ref={quantityInputRef}
                        value={formData.quantity}
                        onChangeText={(text) => updateField('quantity', text)}
                        onFocus={() => {
                          scrollToInput(400);
                          if (formData.quantity === '0') {
                            updateField('quantity', '');
                          }
                        }}
                        placeholder="0"
                        keyboardType="number-pad"
                        color="$textLight"
                        $dark-color="$textDark"
                        placeholderTextColor={colors.textSecondary}
                        returnKeyType="done"
                        blurOnSubmit={true}
                      />
                    </Input>
                  </VStack>
                </HStack>

                <Pressable onPress={() => { haptics.light(); setCategoryMenuVisible(!categoryMenuVisible); }} px="$3" py="$3" borderRadius="$lg" bg="$backgroundLight" $dark-bg="$backgroundDark" borderWidth={1} borderColor={categoryMenuVisible ? '$primary500' : '$borderLight'} $dark-borderColor={categoryMenuVisible ? '$primary500' : '$borderDark'} $active-opacity={0.7}>
                  <HStack alignItems="center" justifyContent="space-between" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                    <HStack alignItems="center" space="xs" flex={1} flexDirection={isRTL ? 'row-reverse' : 'row'}>
                      <Tag size={16} color={formData.categoryId ? colors.primary : colors.textSecondary} strokeWidth={2} />
                      <Text fontSize="$sm" fontWeight={formData.categoryId ? '$medium' : '$normal'} color={formData.categoryId ? '$textLight' : '$textSecondaryLight'} $dark-color={formData.categoryId ? '$textDark' : '$textSecondaryDark'}>
                        {formData.categoryId
                          ? (() => {
                              const mainCat = categories.find(c => c.id === formData.categoryId);
                              if (mainCat) return getTranslatedName(mainCat, storeLanguages, currentLanguage);
                              const subCat = categories.flatMap(c => c.children || []).find(sub => sub.id === formData.categoryId);
                              if (subCat) return getTranslatedName(subCat, storeLanguages, currentLanguage);
                              return t('select_category');
                            })()
                          : t('select_category')}
                      </Text>
                    </HStack>
                    <ChevronDown size={18} color={colors.textSecondary} style={{ transform: [{ rotate: categoryMenuVisible ? '180deg' : '0deg' }] }} />
                  </HStack>
                </Pressable>

                {categoryMenuVisible && (
                  <Box borderRadius="$lg" bg="$backgroundLight" $dark-bg="$backgroundDark" borderWidth={1} borderColor="$borderLight" $dark-borderColor="$borderDark" overflow="hidden" maxHeight={250}>
                    <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                      <Pressable onPress={() => { haptics.light(); updateField('categoryId', ''); setCategoryMenuVisible(false); }} px="$3" py="$2.5" borderBottomWidth={1} borderBottomColor="$borderLight" $dark-borderBottomColor="$borderDark" $active-bg="rgba(0,0,0,0.05)">
                        <HStack alignItems="center" justifyContent="space-between" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                          <HStack alignItems="center" space="xs" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                            <X size={16} color={colors.textSecondary} strokeWidth={2} />
                            <Text fontSize="$sm" color="$textLight" $dark-color="$textDark">{t('no_category')}</Text>
                          </HStack>
                          {!formData.categoryId && <Check size={16} color={colors.primary} strokeWidth={2.5} />}
                        </HStack>
                      </Pressable>
                      {categories.map((cat) => {
                        const hasChildren = cat.children && cat.children.length > 0;
                        const isSelected = formData.categoryId === cat.id;
                        return (
                          <Box key={cat.id}>
                            <Pressable onPress={() => { if (!hasChildren) { haptics.light(); updateField('categoryId', cat.id); setCategoryMenuVisible(false); } }} px="$3" py="$2.5" borderBottomWidth={1} borderBottomColor="$borderLight" $dark-borderBottomColor="$borderDark" $active-bg={!hasChildren ? 'rgba(0,0,0,0.05)' : undefined} opacity={hasChildren ? 0.6 : 1}>
                              <HStack alignItems="center" justifyContent="space-between" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                                <HStack alignItems="center" space="xs" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                                  {hasChildren ? <Folder size={16} color={colors.text} strokeWidth={2} /> : <Tag size={16} color={colors.textSecondary} strokeWidth={2} />}
                                  <Text fontSize="$sm" fontWeight={hasChildren ? '$semibold' : '$normal'} color="$textLight" $dark-color="$textDark">{getTranslatedName(cat, storeLanguages, currentLanguage)}</Text>
                                </HStack>
                                {isSelected && !hasChildren && <Check size={16} color={colors.primary} strokeWidth={2.5} />}
                              </HStack>
                            </Pressable>
                            {hasChildren && cat.children!.map((subCat) => {
                              const isSubSelected = formData.categoryId === subCat.id;
                              return (
                                <Pressable key={subCat.id} onPress={() => { haptics.light(); updateField('categoryId', subCat.id); setCategoryMenuVisible(false); }} px="$3" pl="$6" py="$2.5" borderBottomWidth={1} borderBottomColor="$borderLight" $dark-borderBottomColor="$borderDark" $active-bg="rgba(0,0,0,0.05)">
                                  <HStack alignItems="center" justifyContent="space-between" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                                    <HStack alignItems="center" space="xs" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                                      <CornerDownRight size={14} color={colors.textSecondary} strokeWidth={2} />
                                      <Text fontSize="$sm" color="$textLight" $dark-color="$textDark">{getTranslatedName(subCat, storeLanguages, currentLanguage)}</Text>
                                    </HStack>
                                    {isSubSelected && <Check size={16} color={colors.primary} strokeWidth={2.5} />}
                                  </HStack>
                                </Pressable>
                              );
                            })}
                          </Box>
                        );
                      })}
                    </ScrollView>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Variants Section */}
            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$xl" p="$4">
              <VariantOptionsManager
                variants={variants}
                onChange={setVariants}
                productPrice={parseFloat(formData.price) || 0}
                productQuantity={parseInt(formData.quantity) || 0}
                variantsRequired={variantsRequired}
                onVariantsRequiredChange={setVariantsRequired}
                productSKU={formData.sku || ''}
              />
            </Box>

            {/* Active Status */}
            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$xl" p="$4">
              <HStack px="$3" py="$2.5" alignItems="center" justifyContent="space-between" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                <Text fontSize="$sm" fontWeight="$medium" color="$textLight" $dark-color="$textDark">{t('active')}</Text>
                <Switch value={formData.enabled} onValueChange={(value) => { haptics.light(); updateField('enabled', value); }} size="sm" trackColor={{ false: colors.border, true: `${colors.primary}80` }} thumbColor={formData.enabled ? colors.primary : colors.textSecondary} />
              </HStack>
            </Box>

            <HStack space="sm">
              <Button flex={1} size="lg" variant="outline" borderRadius="$lg" borderColor="$borderLight" $dark-borderColor="$borderDark" onPress={() => { haptics.light(); router.back(); }} isDisabled={loading}>
                <ButtonText fontSize="$sm" fontWeight="$bold" color="$textLight" $dark-color="$textDark">{t('cancel')}</ButtonText>
              </Button>
              <Button flex={1} size="lg" bg="$primary500" borderRadius="$lg" onPress={handleSubmit} isDisabled={loading || !isFormValid()} opacity={loading || !isFormValid() ? 0.5 : 1}>
                {loading ? (
                  <VStack space="xs" alignItems="center" w="$full">
                    <Spinner size="small" color="$white" />
                    {uploadStatus && <Text fontSize="$xs" color="$white" fontWeight="$medium">{uploadStatus}</Text>}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <Box w="100%" h={2} borderRadius="$full" bg="rgba(255,255,255,0.3)" overflow="hidden">
                        <Box w={`${uploadProgress}%`} h="100%" bg="$white" borderRadius="$full" />
                      </Box>
                    )}
                  </VStack>
                ) : (
                  <ButtonText fontSize="$sm" fontWeight="$bold" color="$white">{t('create')}</ButtonText>
                )}
              </Button>
            </HStack>
          </VStack>
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
}
