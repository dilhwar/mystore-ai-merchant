import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';
import {
  ImagePlus,
  Sparkles,
  DollarSign,
  Package,
  Tag,
  FileText,
  ChevronDown,
  X,
  Check,
  Folder,
  CornerDownRight,
} from 'lucide-react-native';
import { createProduct } from '@/services/products.service';
import { getCategories, Category } from '@/services/categories.service';
import { generateAllContentWithImage } from '@/services/ai.service';
import { getFieldName, getTranslatedName } from '@/utils/language';
import { CURRENCIES, getCurrencyByCode } from '@/constants/currencies';
import { getStoreSettings } from '@/services/store-settings.service';
import { uploadMultipleImages, validateImages } from '@/services/upload.service';

export default function AddProductScreen() {
  const { t, i18n } = useTranslation('products');
  const { colors } = useTheme();
  const router = useRouter();

  // Get store settings from authStore (dynamic)
  const { storeLanguages, defaultLanguage, storeCurrency, setStoreSettings } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);

  // Dynamic form state - stores all fields including language-specific ones
  const [formData, setFormData] = useState<Record<string, any>>({
    price: '',
    quantity: '0',
    categoryId: '',
    currency: storeCurrency, // Use store currency (dynamic)
    isActive: true,
  });
  const [images, setImages] = useState<any[]>([]); // Support multiple images (up to 10)
  const [selectedAIImageIndex, setSelectedAIImageIndex] = useState<number>(0); // Which image to use for AI
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false); // Category modal visible

  const currentLanguage = i18n.language;

  // Log state changes for debugging
  useEffect(() => {
    console.log('[CategoryMenu] Visibility changed:', categoryMenuVisible);
  }, [categoryMenuVisible]);

  useEffect(() => {
    console.log('[Categories] Loaded categories:', categories.length);
    console.log('[Categories] Categories data:', JSON.stringify(categories, null, 2));
  }, [categories]);

  // Get currency info for display
  const currencyInfo = getCurrencyByCode(storeCurrency);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Update currency when storeCurrency changes
    setFormData((prev) => ({
      ...prev,
      currency: storeCurrency,
    }));
  }, [storeCurrency]);

  const loadInitialData = async () => {
    try {
      // Load categories
      await loadCategories();

      // Load and update store settings
      await loadStoreSettings();
    } catch (error: any) {
      console.error('Load initial data error:', error.message);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('[LoadCategories] Fetching categories...');
      const data = await getCategories();
      console.log('[LoadCategories] Categories received:', data.length);
      console.log('[LoadCategories] Categories structure:', JSON.stringify(data, null, 2));
      setCategories(data);
      console.log('[LoadCategories] Categories state updated successfully');
    } catch (error: any) {
      console.error('[LoadCategories] Error:', error.message);
      console.error('[LoadCategories] Error stack:', error.stack);
    }
  };

  const loadStoreSettings = async () => {
    try {
      const storeData: any = await getStoreSettings();

      // Extract languages and currency from store settings
      const languages = (storeData.settings?.languages as string[]) || [defaultLanguage];
      const defaultLang = languages[0] || defaultLanguage;
      const currency = storeData.settings?.currency || storeCurrency;

      // Update authStore with real store settings
      setStoreSettings(languages, defaultLang, currency);

      console.log('✅ Store settings loaded:', { languages, defaultLang, currency });
    } catch (error: any) {
      console.error('Load store settings error:', error.message);
      // Don't fail the page if settings can't be loaded
    }
  };

  // Update form field
  const updateField = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Get field value safely
  const getFieldValue = (fieldName: string): string => {
    return formData[fieldName] || '';
  };

  // اختيار صور متعددة (حتى 10)
  const pickImages = async () => {
    console.log('[PickImages] Starting image picker...');
    console.log('[PickImages] Current images count:', images.length);

    if (images.length >= 10) {
      console.log('[PickImages] Max images reached (10)');
      Alert.alert(t('error'), t('max_images_reached'));
      return;
    }

    haptics.light();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - images.length,
    });

    console.log('[PickImages] Result:', result.canceled ? 'Canceled' : `Selected ${result.assets?.length} images`);

    if (!result.canceled && result.assets.length > 0) {
      const newImages = [...images, ...result.assets].slice(0, 10);
      console.log('[PickImages] New total images:', newImages.length);
      setImages(newImages);
      haptics.success();
    }
  };

  // حذف صورة
  const removeImage = (index: number) => {
    haptics.light();
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    // If removed image was selected for AI, reset to first image
    if (selectedAIImageIndex === index) {
      setSelectedAIImageIndex(0);
    } else if (selectedAIImageIndex > index) {
      setSelectedAIImageIndex(selectedAIImageIndex - 1);
    }
  };

  // توليد المحتوى بالكامل باستخدام AI
  const generateWithAI = async () => {
    if (images.length === 0) {
      Alert.alert(t('error'), t('image_required_for_ai'));
      return;
    }

    try {
      setAiLoading(true);
      setUploadStatus(t('uploading_image_for_ai') || 'Uploading image for AI...');

      // استخدام الصورة المحددة للـ AI
      const selectedImage = images[selectedAIImageIndex];

      // Upload selected image to S3 first
      const imageUris = [selectedImage.uri];
      const uploadedImages = await uploadMultipleImages(imageUris, 'products');

      console.log('Uploaded images:', uploadedImages);

      if (!uploadedImages || uploadedImages.length === 0) {
        throw new Error('Failed to upload image for AI');
      }

      // Extract URL from the upload response structure
      // Backend returns: { original, sizes: { large: { url, ... }, medium: { url, ... } } }
      const s3ImageUrl = uploadedImages[0]?.sizes?.large?.url || uploadedImages[0]?.sizes?.medium?.url;

      console.log('S3 Image URL:', s3ImageUrl);

      if (!s3ImageUrl) {
        throw new Error('Failed to get image URL from upload response');
      }

      setUploadStatus(t('generating_content') || 'Generating content...');

      // استدعاء AI لتوليد المحتوى بناءً على لغات المتجر
      const response = await generateAllContentWithImage({
        imageUri: s3ImageUrl, // Use S3 URL instead of local URI
        category: formData.categoryId || undefined,
        storeLanguages,
        dashboardLanguage: currentLanguage,
      });

      // تعبئة الحقول بالمحتوى المُولّد
      const updatedFormData = { ...formData };

      storeLanguages.forEach((lang, index) => {
        const nameField = getFieldName(index, 'name', lang);
        const descField = getFieldName(index, 'description', lang);

        updatedFormData[nameField] = response[lang]?.name || '';
        updatedFormData[descField] = response[lang]?.description || '';
      });

      setFormData(updatedFormData);
      Alert.alert(t('success'), t('ai_content_generated'));

    } catch (error: any) {
      console.error('AI generation error:', error);
      console.error('Error details:', {
        message: error.message,
        responseData: error.response?.data,
        responseMessage: error.response?.data?.message,
      });
      const errorMessage = error.message || t('ai_generation_failed');
      Alert.alert(t('error'), errorMessage);
    } finally {
      setAiLoading(false);
      setUploadStatus('');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (images.length === 0) {
      Alert.alert(t('error'), t('image_required'));
      return;
    }

    // Validate primary language name (first language is required)
    const primaryNameField = getFieldName(0, 'name', storeLanguages[0]);
    if (!formData[primaryNameField]?.trim()) {
      Alert.alert(t('error'), t('name_required'));
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      Alert.alert(t('error'), t('price_required'));
      return;
    }

    if (!formData.currency) {
      Alert.alert(t('error'), t('currency_required'));
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);
      setUploadStatus(t('validating_images') || 'Validating images...');

      // Validate images before upload
      const imageUris = images.map((img) => img.uri);
      const validation = await validateImages(imageUris, {
        maxSizeMB: 5,
        maxWidth: 4000,
        maxHeight: 4000,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      });

      if (!validation.valid) {
        Alert.alert(t('error'), validation.errors.join('\n'));
        setLoading(false);
        setUploadStatus('');
        return;
      }

      // Upload images to S3
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

      // Prepare image files with S3 URLs
      const imageFiles = uploadedImages.map((img, index) => ({
        uri: img.url, // Use S3 URL instead of local URI
        type: 'image/jpeg',
        name: `product-${index}.jpg`,
      }));

      setUploadStatus(t('creating_product') || 'Creating product...');
      setUploadProgress(100);

      // Build product data with dynamic language fields
      const productData: any = {
        price: parseFloat(formData.price),
        currency: formData.currency,
        categoryId: formData.categoryId || undefined,
        quantity: parseInt(formData.quantity) || 0,
        isActive: formData.isActive,
        featured: false,
        images: imageFiles,
      };

      // Add language-specific fields
      storeLanguages.forEach((lang, index) => {
        const nameField = getFieldName(index, 'name', lang);
        const descField = getFieldName(index, 'description', lang);

        productData[nameField] = formData[nameField]?.trim() || undefined;
        productData[descField] = formData[descField]?.trim() || undefined;
      });

      await createProduct(productData);

      Alert.alert(t('success'), t('product_created'), [
        {
          text: t('ok'),
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Create product error:', error);
      Alert.alert(t('error'), error.message || t('create_error'));
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  // Get language display name
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
    };
    return languageNames[langCode] || langCode.toUpperCase();
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    // Check if at least one image is uploaded
    if (images.length === 0) return false;

    // Check if primary language name is filled
    const primaryNameField = getFieldName(0, 'name', storeLanguages[0]);
    if (!formData[primaryNameField]?.trim()) return false;

    // Check if price is valid
    if (!formData.price || parseFloat(formData.price) < 0) return false;

    return true;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Image Section Card */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {/* Images Grid */}
          {images.length > 0 ? (
            <View style={styles.imagesGrid}>
              {images.map((img, index) => (
                <View key={index} style={styles.imageGridItem}>
                  <Image source={{ uri: img.uri }} style={styles.gridImage} />

                  {/* AI Selection Radio */}
                  <TouchableOpacity
                    style={[styles.aiSelectBtn, { backgroundColor: selectedAIImageIndex === index ? '#8B5CF6' : 'rgba(0,0,0,0.5)' }]}
                    onPress={() => {
                      haptics.light();
                      setSelectedAIImageIndex(index);
                    }}
                  >
                    <Sparkles size={12} color="#FFFFFF" strokeWidth={2} />
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={[styles.deleteBtn, { backgroundColor: colors.error }]}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.deleteBtnText}>×</Text>
                  </TouchableOpacity>

                  {/* Default Badge */}
                  {index === 0 && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.defaultBadgeText}>{t('main')}</Text>
                    </View>
                  )}
                </View>
              ))}

              {/* Add More Button */}
              {images.length < 10 && (
                <TouchableOpacity
                  style={[styles.addMoreBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={pickImages}
                >
                  <ImagePlus size={32} color={colors.primary} strokeWidth={1.5} />
                  <Text style={[styles.addMoreText, { color: colors.textSecondary }]}>
                    {images.length}/10
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.imagePicker, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={pickImages}
              activeOpacity={0.7}
            >
              <View style={styles.imagePickerContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  <ImagePlus size={24} color={colors.primary} strokeWidth={1.5} />
                </View>
                <Text style={[styles.imagePickerText, { color: colors.text }]}>
                  {t('tap_to_add_images')}
                </Text>
                <Text style={[styles.imagePickerHint, { color: colors.textSecondary }]}>
                  {t('up_to_10_images')}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* AI Button */}
          {images.length > 0 && (
            <TouchableOpacity
              style={[styles.aiButton, { backgroundColor: '#8B5CF6' }]}
              onPress={generateWithAI}
              disabled={aiLoading}
              activeOpacity={0.8}
            >
              {aiLoading ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.aiButtonText}>{t('generating')}</Text>
                </>
              ) : (
                <>
                  <Sparkles size={20} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.aiButtonText}>{t('generate_with_ai')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Product Information Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {/* Dynamic Language Fields */}
          {storeLanguages.map((lang, index) => {
            const isPrimaryLanguage = index === 0;
            const nameField = getFieldName(index, 'name', lang);
            const descField = getFieldName(index, 'description', lang);
            const langDisplayName = getLanguageDisplayName(lang);

            return (
              <View key={lang} style={styles.languageSection}>
                <View style={styles.languageHeader}>
                  <Text style={[styles.languageLabel, { color: colors.textSecondary }]}>
                    {langDisplayName}
                  </Text>
                  {isPrimaryLanguage && (
                    <View style={[styles.primaryBadge, { backgroundColor: `${colors.primary}15` }]}>
                      <Text style={[styles.primaryBadgeText, { color: colors.primary }]}>
                        {t('primary')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Name */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('product_name')} {isPrimaryLanguage && <Text style={styles.required}>*</Text>}
                  </Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Tag size={18} color={colors.textSecondary} strokeWidth={2} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={getFieldValue(nameField)}
                      onChangeText={(text) => updateField(nameField, text)}
                      placeholder={t('enter_product_name')}
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>{t('description')}</Text>
                  <TextInput
                    style={[
                      styles.textarea,
                      { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                    ]}
                    value={getFieldValue(descField)}
                    onChangeText={(text) => updateField(descField, text)}
                    placeholder={t('enter_description')}
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Pricing & Inventory Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('price')} <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.currencySymbolInline, { color: colors.primary }]}>
                  {currencyInfo?.symbol || storeCurrency}
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={formData.price}
                  onChangeText={(text) => updateField('price', text)}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={[styles.label, { color: colors.text }]}>{t('quantity')}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Package size={18} color={colors.textSecondary} strokeWidth={2} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={formData.quantity}
                  onChangeText={(text) => updateField('quantity', text)}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>{t('category')}</Text>
            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => {
                console.log('[CategoryMenu] Menu dismissed (closed)');
                setCategoryMenuVisible(false);
                // Force remount by briefly resetting then restoring categories
                setTimeout(() => {
                  console.log('[CategoryMenu] Menu fully closed, ready for next open');
                }, 100);
              }}
              anchor={
                <TouchableOpacity
                  style={[
                    styles.categorySelector,
                    {
                      backgroundColor: colors.card,
                      borderColor: categoryMenuVisible ? colors.primary : colors.border,
                      ...design.shadow.sm,
                    }
                  ]}
                  onPress={() => {
                    console.log('[CategoryMenu] Button pressed');
                    console.log('[CategoryMenu] Current visible state:', categoryMenuVisible);
                    console.log('[CategoryMenu] Current categories count:', categories.length);

                    haptics.light();

                    if (categoryMenuVisible) {
                      // If already visible, close it first
                      console.log('[CategoryMenu] Closing menu (was open)');
                      setCategoryMenuVisible(false);
                    } else {
                      // If closed, open it
                      console.log('[CategoryMenu] Opening category menu...');
                      setCategoryMenuVisible(true);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.categorySelectorContent}>
                    <Tag size={18} color={formData.categoryId ? colors.primary : colors.textSecondary} />
                    <Text
                      style={[
                        styles.categorySelectorText,
                        {
                          color: formData.categoryId ? colors.text : colors.textSecondary,
                          fontWeight: formData.categoryId ? '600' : '400'
                        }
                      ]}
                    >
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
                  </View>
                  <ChevronDown
                    size={20}
                    color={colors.textSecondary}
                    style={{
                      transform: [{ rotate: categoryMenuVisible ? '180deg' : '0deg' }]
                    }}
                  />
                </TouchableOpacity>
              }
              contentStyle={{ backgroundColor: colors.surface }}
            >
              {/* No Category Option */}
              <Menu.Item
                onPress={() => {
                  console.log('[CategoryMenu] "No Category" selected');
                  haptics.light();
                  updateField('categoryId', '');
                  // Force close with delay
                  requestAnimationFrame(() => {
                    setCategoryMenuVisible(false);
                  });
                }}
                title={t('no_category')}
                leadingIcon={() => <X size={20} color={colors.textSecondary} />}
                trailingIcon={() => !formData.categoryId ? <Check size={20} color={colors.primary} /> : null}
              />
              <Divider />

              {/* Categories with subcategories */}
              {categories.map((cat) => {
                const hasChildren = cat.children && cat.children.length > 0;
                const isSelected = formData.categoryId === cat.id;

                return (
                  <View key={cat.id}>
                    {/* Parent Category */}
                    <Menu.Item
                      onPress={() => {
                        console.log('[CategoryMenu] Parent category clicked:', cat.id, getTranslatedName(cat, storeLanguages, currentLanguage));
                        console.log('[CategoryMenu] Has children:', hasChildren);
                        if (!hasChildren) {
                          console.log('[CategoryMenu] Selecting parent category:', cat.id);
                          haptics.light();
                          updateField('categoryId', cat.id);
                          // Force close with delay
                          requestAnimationFrame(() => {
                            setCategoryMenuVisible(false);
                          });
                        } else {
                          console.log('[CategoryMenu] Parent category disabled (has children)');
                        }
                      }}
                      disabled={hasChildren}
                      title={getTranslatedName(cat, storeLanguages, currentLanguage)}
                      leadingIcon={() =>
                        hasChildren ? (
                          <Folder size={20} color={colors.text} />
                        ) : (
                          <Tag size={20} color={colors.textSecondary} />
                        )
                      }
                      trailingIcon={() => isSelected && !hasChildren ? <Check size={20} color={colors.primary} /> : null}
                      titleStyle={{ fontWeight: hasChildren ? '600' : '400' }}
                    />

                    {/* Subcategories */}
                    {hasChildren && cat.children!.map((subCat) => {
                      const isSubSelected = formData.categoryId === subCat.id;
                      return (
                        <Menu.Item
                          key={subCat.id}
                          onPress={() => {
                            console.log('[CategoryMenu] Subcategory selected:', subCat.id, getTranslatedName(subCat, storeLanguages, currentLanguage));
                            haptics.light();
                            updateField('categoryId', subCat.id);
                            // Force close with delay
                            requestAnimationFrame(() => {
                              setCategoryMenuVisible(false);
                            });
                          }}
                          title={getTranslatedName(subCat, storeLanguages, currentLanguage)}
                          leadingIcon={() => <CornerDownRight size={18} color={colors.textSecondary} />}
                          trailingIcon={() => isSubSelected ? <Check size={20} color={colors.primary} /> : null}
                          style={{ paddingLeft: spacing.lg }}
                        />
                      );
                    })}
                  </View>
                );
              })}
            </Menu>
          </View>

          {/* Active Switch */}
          <View style={[styles.switchRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>{t('active')}</Text>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => {
                haptics.light();
                updateField('isActive', value);
              }}
              trackColor={{ false: colors.border, true: `${colors.primary}80` }}
              thumbColor={formData.isActive ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>{t('cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              {
                backgroundColor: !isFormValid() || loading ? colors.border : colors.primary,
                opacity: !isFormValid() || loading ? 0.5 : 1,
              }
            ]}
            onPress={handleSubmit}
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                {uploadStatus && (
                  <View style={styles.uploadStatusContainer}>
                    <Text style={styles.uploadStatusText}>{uploadStatus}</Text>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                      </View>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.submitButtonText}>{t('create')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
    gap: spacing.m,
    paddingBottom: spacing.xxl,
  },

  // Section Card
  section: {
    borderRadius: design.radius.md,
    padding: spacing.m,
    gap: spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Image Picker
  imagePicker: {
    height: 110,
    borderRadius: design.radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePickerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.s,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  imagePickerHint: {
    fontSize: 11,
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },

  // AI Button
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
    borderRadius: design.radius.md,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Language Section
  languageSection: {
    gap: spacing.m,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  primaryBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: design.radius.sm,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Input Group
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: design.radius.md,
    paddingHorizontal: spacing.m,
    gap: spacing.s,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.s,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: design.radius.md,
    padding: spacing.m,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  currencySymbolInline: {
    fontSize: 18,
    fontWeight: '700',
    paddingRight: spacing.xs,
  },

  // Row
  row: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  flex1: {
    flex: 1,
  },

  // Categories
  categoriesContainer: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: design.radius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    paddingHorizontal: spacing.m + 2,
    borderRadius: design.radius.md,
    borderWidth: 1.5,
    minHeight: 52,
  },
  categorySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flex: 1,
  },
  categorySelectorText: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
  menuContent: {
    borderRadius: design.radius.md,
    marginTop: spacing.xs,
    minWidth: 200,
    maxHeight: 400,
  },
  menuItem: {
    minHeight: 48,
    paddingVertical: spacing.xs,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Switch
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderRadius: design.radius.md,
    borderWidth: 1,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Buttons
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.m,
    marginTop: spacing.s,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Images Grid
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  imageGridItem: {
    width: '31%', // ~1/3 with gaps
    aspectRatio: 1,
    borderRadius: design.radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  aiSelectBtn: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  defaultBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  addMoreBtn: {
    width: '31%', // ~1/3 with gaps
    aspectRatio: 1,
    borderRadius: design.radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  addMoreText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Upload Progress
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xs,
    width: '100%',
  },
  uploadStatusContainer: {
    width: '100%',
    gap: spacing.xxs,
  },
  uploadStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBarContainer: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.xxs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

});
