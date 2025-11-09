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
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { PageHeader } from '@/components/ui/PageHeader';
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
  X,
} from 'lucide-react-native';
import { getProductById, updateProduct } from '@/services/products.service';
import { getCategories, Category } from '@/services/categories.service';
import { generateAllContentWithImage } from '@/services/ai.service';
import { getFieldName, getTranslatedName } from '@/utils/language';
import { CURRENCIES, getCurrencyByCode } from '@/constants/currencies';
import { getStoreSettings } from '@/services/store-settings.service';
import { uploadMultipleImages, validateImages } from '@/services/upload.service';

interface ImageItem {
  uri: string;
  isExisting: boolean; // true = S3 URL, false = local file
}

export default function EditProductScreen() {
  const { t, i18n } = useTranslation('products');
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Get store settings from authStore (dynamic)
  const { storeLanguages, defaultLanguage, storeCurrency, setStoreSettings } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
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
  const [images, setImages] = useState<ImageItem[]>([]); // Support multiple images (up to 10)
  const [selectedAIImageIndex, setSelectedAIImageIndex] = useState<number>(0); // Which image to use for AI

  const currentLanguage = i18n.language;

  // Get currency info for display
  const currencyInfo = getCurrencyByCode(storeCurrency);

  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id]);

  useEffect(() => {
    // Update currency when storeCurrency changes
    setFormData((prev) => ({
      ...prev,
      currency: storeCurrency,
    }));
  }, [storeCurrency]);

  const loadProductData = async () => {
    try {
      setDataLoading(true);

      // Load product data
      const product = await getProductById(id!);

      // Load categories
      await loadCategories();

      // Load and update store settings
      await loadStoreSettings();

      // Populate form with product data
      const updatedFormData: Record<string, any> = {
        price: product.price?.toString() || '',
        quantity: product.quantity?.toString() || '0',
        categoryId: product.categoryId || '',
        currency: product.currency || storeCurrency,
        isActive: product.isActive !== false,
      };

      // Populate language-specific fields
      storeLanguages.forEach((lang, index) => {
        const nameField = getFieldName(index, 'name', lang);
        const descField = getFieldName(index, 'description', lang);

        updatedFormData[nameField] = product.translations?.[lang]?.name || '';
        updatedFormData[descField] = product.translations?.[lang]?.description || '';
      });

      setFormData(updatedFormData);

      // Populate images from product
      if (product.images && product.images.length > 0) {
        const existingImages: ImageItem[] = product.images.map((imgUrl: string) => ({
          uri: imgUrl,
          isExisting: true,
        }));
        setImages(existingImages);
      }

      console.log('✅ Product data loaded:', product.id);
    } catch (error: any) {
      console.error('Load product error:', error.message);
      Alert.alert(t('error'), error.message || t('failed_to_load_product'));
      router.back();
    } finally {
      setDataLoading(false);
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
    if (images.length >= 10) {
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

    if (!result.canceled && result.assets.length > 0) {
      const newLocalImages: ImageItem[] = result.assets.map((asset) => ({
        uri: asset.uri,
        isExisting: false,
      }));
      const updatedImages = [...images, ...newLocalImages].slice(0, 10);
      setImages(updatedImages);
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

      let s3ImageUrl = selectedImage.uri;

      // If it's a local image, upload to S3 first
      if (!selectedImage.isExisting) {
        const imageUris = [selectedImage.uri];
        const uploadedImages = await uploadMultipleImages(imageUris, 'products');

        console.log('Uploaded images:', uploadedImages);

        if (!uploadedImages || uploadedImages.length === 0) {
          throw new Error('Failed to upload image for AI');
        }

        // Extract URL from the upload response structure
        // Backend returns: { original, sizes: { large: { url, ... }, medium: { url, ... } } }
        s3ImageUrl = uploadedImages[0]?.sizes?.large?.url || uploadedImages[0]?.sizes?.medium?.url;

        console.log('S3 Image URL:', s3ImageUrl);

        if (!s3ImageUrl) {
          throw new Error('Failed to get image URL from upload response');
        }
      }

      // Validate that we have a valid S3 URL
      if (!s3ImageUrl) {
        throw new Error('No valid image URL available for AI generation');
      }

      setUploadStatus(t('generating_content') || 'Generating content...');

      // استدعاء AI لتوليد المحتوى بناءً على لغات المتجر
      const response = await generateAllContentWithImage({
        imageUri: s3ImageUrl, // Use S3 URL
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
      setUploadStatus(t('processing_images') || 'Processing images...');

      // Separate existing S3 images from new local images
      const existingImages = images.filter((img) => img.isExisting);
      const newLocalImages = images.filter((img) => !img.isExisting);

      let finalImageUrls = existingImages.map((img) => img.uri);

      // Upload new images if any
      if (newLocalImages.length > 0) {
        setUploadStatus(t('validating_images') || 'Validating images...');

        const imageUris = newLocalImages.map((img) => img.uri);
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

        // Upload new images to S3
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

        // Add new uploaded images to final list (use medium size URL)
        const newUploadedUrls = uploadedImages.map(
          (img) => img.sizes?.medium?.url || img.sizes?.large?.url || img.sizes?.thumbnail?.url
        ).filter((url) => url); // Filter out null/undefined
        finalImageUrls = [...finalImageUrls, ...newUploadedUrls];
      }

      setUploadStatus(t('updating_product') || 'Updating product...');
      setUploadProgress(100);

      // Build product data with dynamic language fields
      const productData: any = {
        price: parseFloat(formData.price),
        currency: formData.currency,
        quantity: parseInt(formData.quantity) || 0,
        categoryId: formData.categoryId || null,
        isActive: formData.isActive,
        images: finalImageUrls,
      };

      // Add language-specific translations
      const translations: Record<string, any> = {};
      storeLanguages.forEach((lang, index) => {
        const nameField = getFieldName(index, 'name', lang);
        const descField = getFieldName(index, 'description', lang);

        translations[lang] = {
          name: formData[nameField]?.trim() || '',
          description: formData[descField]?.trim() || '',
        };
      });

      productData.translations = translations;

      console.log('Updating product with data:', productData);

      await updateProduct(id!, productData);

      haptics.success();
      Alert.alert(t('success'), t('product_updated'), [
        {
          text: t('ok'),
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Update product error:', error);
      haptics.error();
      const errorMessage = error.response?.data?.message || error.message || t('update_failed');
      Alert.alert(t('error'), errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      paddingHorizontal: spacing.md,
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: design.radius.md,
      padding: spacing.md,
      fontSize: 14,
      color: colors.text,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: design.radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    imagesContainer: {
      gap: spacing.sm,
    },
    imagesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    imageItem: {
      width: 100,
      height: 100,
      borderRadius: design.radius.md,
      position: 'relative',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    imageItemSelected: {
      borderColor: colors.primary,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: design.radius.md,
    },
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      ...design.shadow.md,
    },
    aiSelectionBadge: {
      position: 'absolute',
      bottom: 4,
      left: 4,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: 4,
    },
    aiSelectionText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
    },
    addImageButton: {
      width: 100,
      height: 100,
      borderRadius: design.radius.md,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    aiButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: design.radius.md,
      gap: spacing.xs,
      ...design.shadow.sm,
    },
    aiButtonDisabled: {
      opacity: 0.5,
    },
    aiButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    submitButton: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      ...design.shadow.lg,
    },
    submitButtonInner: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: design.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      ...design.shadow.md,
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingSubmitContainer: {
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

  if (dataLoading) {
    return (
      <View style={styles.container}>
        <PageHeader title={t('edit_product')} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: spacing.md }}>
            {t('loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader title={t('edit_product')} showBack />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('images')}</Text>
          <View style={styles.imagesContainer}>
            <View style={styles.imagesGrid}>
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.imageItem,
                    selectedAIImageIndex === index && styles.imageItemSelected,
                  ]}
                  onPress={() => {
                    haptics.light();
                    setSelectedAIImageIndex(index);
                  }}
                >
                  <Image source={{ uri: img.uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <X size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  {selectedAIImageIndex === index && (
                    <View style={styles.aiSelectionBadge}>
                      <Text style={styles.aiSelectionText}>AI</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {images.length < 10 && (
                <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                  <ImagePlus size={32} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.aiButton, (aiLoading || images.length === 0) && styles.aiButtonDisabled]}
              onPress={generateWithAI}
              disabled={aiLoading || images.length === 0}
            >
              {aiLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Sparkles size={20} color="#FFFFFF" />
              )}
              <Text style={styles.aiButtonText}>
                {aiLoading ? t('generating') : t('generate_with_ai')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Language-specific fields */}
        {storeLanguages.map((lang, index) => {
          const nameField = getFieldName(index, 'name', lang);
          const descField = getFieldName(index, 'description', lang);

          return (
            <View key={lang} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('language')}: {lang.toUpperCase()}
                {index === 0 && ' *'}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('product_name')}</Text>
                <TextInput
                  style={styles.input}
                  value={getFieldValue(nameField)}
                  onChangeText={(value) => updateField(nameField, value)}
                  placeholder={t('enter_product_name')}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('description')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={getFieldValue(descField)}
                  onChangeText={(value) => updateField(descField, value)}
                  placeholder={t('enter_description')}
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
              </View>
            </View>
          );
        })}

        {/* Price & Currency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('pricing')}</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {t('price')} ({currencyInfo?.symbol || storeCurrency})
            </Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(value) => updateField('price', value)}
              placeholder={t('enter_price')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('inventory')}</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('quantity')}</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity}
              onChangeText={(value) => updateField('quantity', value)}
              placeholder={t('enter_quantity')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('category')}</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('select_category')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm }}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: design.radius.md,
                    backgroundColor:
                      formData.categoryId === category.id ? colors.primary : colors.card,
                    borderWidth: 1,
                    borderColor:
                      formData.categoryId === category.id ? colors.primary : colors.border,
                  }}
                  onPress={() => {
                    haptics.light();
                    updateField('categoryId', category.id);
                  }}
                >
                  <Text
                    style={{
                      color:
                        formData.categoryId === category.id ? '#FFFFFF' : colors.text,
                      fontWeight: '500',
                    }}
                  >
                    {getTranslatedName(category, currentLanguage)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Active Status */}
        <View style={styles.section}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>{t('active')}</Text>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => {
                haptics.light();
                updateField('isActive', value);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitButton}>
        <TouchableOpacity
          style={[styles.submitButtonInner, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingSubmitContainer}>
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
            <Text style={styles.submitButtonText}>{t('save_changes')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
