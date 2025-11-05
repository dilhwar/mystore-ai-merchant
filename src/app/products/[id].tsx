import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';
import {
  Edit,
  Trash2,
  Package,
  Tag,
  DollarSign,
  BarChart3,
} from 'lucide-react-native';
import { getProductById, deleteProduct, Product } from '@/services/products.service';
import { getTranslatedName } from '@/utils/language';
import { getCurrencyByCode } from '@/constants/currencies';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { t, i18n } = useTranslation('products');
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const currentLanguage = i18n.language;

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id!);
      setProduct(data);
    } catch (error: any) {
      console.error('Load product error:', error.message);
      Alert.alert(t('error'), error.message || t('failed_to_load_product'));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    haptics.light();
    router.push(`/products/edit/${id}`);
  };

  const handleDelete = () => {
    haptics.medium();
    Alert.alert(
      t('delete_product'),
      t('delete_product_confirm', { name: getProductName() }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              haptics.medium();
              await deleteProduct(id!);
              haptics.success();
              Alert.alert(t('success'), t('product_deleted'), [
                {
                  text: t('ok'),
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              console.error('Delete product error:', error.message);
              haptics.error();
              Alert.alert(t('error'), error.message || t('delete_failed'));
            }
          },
        },
      ]
    );
  };

  const getProductName = (): string => {
    if (!product) return '';
    return product.translations?.[currentLanguage]?.name || product.name || '';
  };

  const getProductDescription = (): string => {
    if (!product) return '';
    return (
      product.translations?.[currentLanguage]?.description ||
      product.description ||
      ''
    );
  };

  const getCategoryName = (): string => {
    if (!product?.category) return t('no_category');
    return getTranslatedName(product.category, currentLanguage);
  };

  const getStockStatus = (): {
    label: string;
    color: string;
    bgColor: string;
  } => {
    if (!product) return { label: '', color: '', bgColor: '' };

    const quantity = product.quantity || 0;

    if (quantity === 0) {
      return {
        label: t('out_of_stock'),
        color: colors.error,
        bgColor: `${colors.error}15`,
      };
    } else if (quantity < 10) {
      return {
        label: t('low_stock'),
        color: '#FF9800',
        bgColor: '#FF980015',
      };
    } else {
      return {
        label: t('in_stock'),
        color: colors.success,
        bgColor: `${colors.success}15`,
      };
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContainer: {
      paddingBottom: 100,
    },
    imageContainer: {
      width: '100%',
      height: width,
      backgroundColor: colors.card,
    },
    mainImage: {
      width: '100%',
      height: '100%',
    },
    thumbnailContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.background,
    },
    thumbnailScroll: {
      gap: spacing.sm,
    },
    thumbnail: {
      width: 60,
      height: 60,
      borderRadius: design.borderRadius.md,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    thumbnailSelected: {
      borderColor: colors.primary,
    },
    thumbnailImage: {
      width: '100%',
      height: '100%',
      borderRadius: design.borderRadius.md - 2,
    },
    contentContainer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    header: {
      marginBottom: spacing.md,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: design.borderRadius.sm,
      marginBottom: spacing.xs,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    productName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    categoryText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    priceSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    priceLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    priceValue: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.primary,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.text,
    },
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    infoCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.card,
      borderRadius: design.borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    infoCardLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    infoCardValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    actionButtons: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      ...design.shadows.lg,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: design.borderRadius.md,
      gap: spacing.xs,
      ...design.shadows.sm,
    },
    editButton: {
      backgroundColor: colors.primary,
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <PageHeader title={t('loading')} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <PageHeader title={t('error')} showBack />
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>{t('failed_to_load_product')}</Text>
        </View>
      </View>
    );
  }

  const stockStatus = getStockStatus();
  const currencyInfo = getCurrencyByCode(product.currency || 'USD');

  return (
    <View style={styles.container}>
      <PageHeader title={getProductName()} showBack />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        {product.images && product.images.length > 0 && (
          <>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: product.images[selectedImageIndex] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            </View>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <View style={styles.thumbnailContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailScroll}
                >
                  {product.images.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.thumbnail,
                        selectedImageIndex === index && styles.thumbnailSelected,
                      ]}
                      onPress={() => {
                        haptics.light();
                        setSelectedImageIndex(index);
                      }}
                    >
                      <Image source={{ uri: img }} style={styles.thumbnailImage} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}

        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: stockStatus.bgColor },
              ]}
            >
              <Text style={[styles.statusText, { color: stockStatus.color }]}>
                {stockStatus.label}
              </Text>
            </View>
            <Text style={styles.productName}>{getProductName()}</Text>
            <Text style={styles.categoryText}>{getCategoryName()}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <DollarSign size={24} color={colors.primary} />
            <View>
              <Text style={styles.priceLabel}>{t('price')}</Text>
              <Text style={styles.priceValue}>
                {currencyInfo?.symbol || product.currency}{' '}
                {product.price?.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Description */}
          {getProductDescription() && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('description')}</Text>
              <Text style={styles.description}>{getProductDescription()}</Text>
            </View>
          )}

          {/* Info Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product_information')}</Text>
            <View style={styles.infoGrid}>
              {/* Quantity */}
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Package size={16} color={colors.textSecondary} />
                  <Text style={styles.infoCardLabel}>{t('quantity')}</Text>
                </View>
                <Text style={styles.infoCardValue}>{product.quantity || 0}</Text>
              </View>

              {/* SKU */}
              {product.sku && (
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Tag size={16} color={colors.textSecondary} />
                    <Text style={styles.infoCardLabel}>{t('sku')}</Text>
                  </View>
                  <Text style={styles.infoCardValue}>{product.sku}</Text>
                </View>
              )}

              {/* Status */}
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <BarChart3 size={16} color={colors.textSecondary} />
                  <Text style={styles.infoCardLabel}>{t('active')}</Text>
                </View>
                <Text style={styles.infoCardValue}>
                  {product.isActive ? t('active') : t('inactive')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <Edit size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>{t('edit_product')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Trash2 size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>{t('delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
