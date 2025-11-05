import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Card, Text, Chip, Divider, Menu, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useAuth } from '@/store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { spacing } from '@/theme/spacing';
import { haptics } from '@/utils/haptics';
import { getProductById, deleteProduct, Product } from '@/services/products.service';
import { getTranslatedName } from '@/utils/language';
import { getCurrencyByCode } from '@/constants/currencies';

export default function ProductDetailsScreen() {
  const { t, i18n } = useTranslation('products');
  const { colors } = useTheme();
  const { storeCurrency } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [showDescription, setShowDescription] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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
    setMenuVisible(false);
    haptics.light();
    router.push(`/products/edit/${id}`);
  };

  const handleDelete = () => {
    setMenuVisible(false);
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
  } => {
    if (!product) return { label: '', color: '' };

    const quantity = product.quantity || 0;

    if (quantity === 0) {
      return {
        label: t('out_of_stock'),
        color: colors.error,
      };
    } else if (quantity < 10) {
      return {
        label: t('low_stock'),
        color: '#FF9800',
      };
    } else {
      return {
        label: t('in_stock'),
        color: colors.success,
      };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>{t('failed_to_load_product')}</Text>
        </View>
      </View>
    );
  }

  const stockStatus = getStockStatus();
  const currencyInfo = getCurrencyByCode(storeCurrency);
  const mainImage =
    product.images && product.images.length > 0
      ? typeof product.images[0] === 'string'
        ? product.images[0]
        : product.images[0].url
      : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Menu */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text variant="titleLarge" style={{ color: colors.text, fontWeight: '600' }}>
              {getProductName()}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
              {getCategoryName()}
            </Text>
          </View>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                iconColor={colors.text}
                onPress={() => {
                  haptics.light();
                  setMenuVisible(true);
                }}
              />
            }
          >
            <Menu.Item
              onPress={handleEdit}
              title={t('edit_product')}
              leadingIcon="pencil"
            />
            <Divider />
            <Menu.Item
              onPress={handleDelete}
              title={t('delete')}
              leadingIcon="delete"
              titleStyle={{ color: colors.error }}
            />
          </Menu>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        {mainImage && (
          <Card style={styles.imageCard}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: mainImage }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            </View>
          </Card>
        )}

        {/* Thumbnail Images */}
        {product.images && product.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailsContainer}
          >
            {product.images.slice(0, 5).map((img, index) => {
              const imageUrl = typeof img === 'string' ? img : img.url;
              return (
                <Card key={index} style={styles.thumbnail}>
                  <View style={styles.thumbnailWrapper}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  </View>
                </Card>
              );
            })}
          </ScrollView>
        )}

        {/* Price Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={{ color: colors.textSecondary, marginBottom: 4 }}>
              {t('price')}
            </Text>
            <Text variant="headlineMedium" style={{ color: colors.primary, fontWeight: 'bold' }}>
              {currencyInfo?.symbol || storeCurrency} {product.price?.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>

        {/* Info Cards */}
        <View style={styles.infoRow}>
          <Card style={styles.infoCard}>
            <Card.Content style={styles.infoCardContent}>
              <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                {t('quantity')}
              </Text>
              <Text variant="titleMedium" style={{ color: colors.text, fontWeight: 'bold' }}>
                {product.quantity || 0}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.infoCard}>
            <Card.Content style={styles.infoCardContent}>
              <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                {t('stock')}
              </Text>
              <Chip
                mode="flat"
                style={{ backgroundColor: `${stockStatus.color}20`, marginTop: 4 }}
                textStyle={{ color: stockStatus.color, fontSize: 11, fontWeight: 'bold' }}
              >
                {stockStatus.label}
              </Chip>
            </Card.Content>
          </Card>

          <Card style={styles.infoCard}>
            <Card.Content style={styles.infoCardContent}>
              <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
                {t('status')}
              </Text>
              <Chip
                mode="flat"
                style={{
                  backgroundColor: product.isActive
                    ? `${colors.success}20`
                    : `${colors.textSecondary}20`,
                  marginTop: 4,
                }}
                textStyle={{
                  color: product.isActive ? colors.success : colors.textSecondary,
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              >
                {product.isActive ? t('active') : t('inactive')}
              </Chip>
            </Card.Content>
          </Card>
        </View>

        {/* Description Card */}
        {getProductDescription() && (
          <Card style={styles.card}>
            <Card.Title
              title={t('description')}
              titleVariant="titleMedium"
              right={(props) => (
                <IconButton
                  {...props}
                  icon={showDescription ? 'chevron-up' : 'chevron-down'}
                  onPress={() => {
                    haptics.light();
                    setShowDescription(!showDescription);
                  }}
                />
              )}
            />
            {showDescription && (
              <Card.Content>
                <Text variant="bodyMedium" style={{ color: colors.text, lineHeight: 22 }}>
                  {getProductDescription()}
                </Text>
              </Card.Content>
            )}
          </Card>
        )}

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  imageCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  imageWrapper: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  mainImage: {
    width: '100%',
    height: 280,
  },
  thumbnailsContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  thumbnail: {
    width: 70,
    height: 70,
  },
  thumbnailWrapper: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    margin: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoCard: {
    flex: 1,
  },
  infoCardContent: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
