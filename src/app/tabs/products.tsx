import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchBar } from '@/components/ui/SearchBar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FAB } from '@/components/ui/FAB';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { formatCurrency } from '@/utils/currency';
import { haptics } from '@/utils/haptics';
import { Package, Plus, Edit2, Trash2, MoreVertical } from 'lucide-react-native';
import {
  getProducts,
  Product,
  getProductName,
  getProductImage,
  getProductPrice,
  getStockStatusKey,
} from '@/services/products.service';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.m * 3) / 2;

export default function ProductsScreen() {
  const { t, i18n } = useTranslation('products');
  const { colors } = useTheme();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const currentLanguage = i18n.language;

  const loadProducts = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {
        page: refresh ? 1 : page,
        limit: 20,
      };

      const data = await getProducts(params);

      if (refresh) {
        setProducts(data.products);
        setFilteredProducts(data.products);
        setPage(1);
      } else {
        setProducts(data.products);
        setFilteredProducts(data.products);
      }

      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      console.error('Load products error:', error.message);
      Alert.alert(
        t('error'),
        t('failed_to_load_products')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => {
        const productName = getProductName(product, currentLanguage).toLowerCase();
        return productName.includes(searchQuery.toLowerCase());
      });
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products, currentLanguage]);

  const onRefresh = useCallback(() => {
    loadProducts(true);
  }, []);

  const handleMenuPress = (product: Product) => {
    haptics.light();
    setSelectedProduct(product);
    setMenuVisible(true);
  };

  const handleEditPress = () => {
    if (!selectedProduct) return;
    setMenuVisible(false);
    haptics.medium();
    // TODO: Navigate to edit screen
    setTimeout(() => {
      Alert.alert(t('edit_product'), `Editing ${getProductName(selectedProduct, currentLanguage)}`);
    }, 300);
  };

  const handleDeletePress = () => {
    if (!selectedProduct) return;
    setMenuVisible(false);
    haptics.medium();
    setTimeout(() => {
      Alert.alert(
        t('delete_product'),
        t('delete_product_confirm', { name: getProductName(selectedProduct, currentLanguage) }),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('delete'),
            style: 'destructive',
            onPress: async () => {
              // TODO: Implement delete functionality
              haptics.success();
            },
          },
        ]
      );
    }, 300);
  };

  const renderProductCard = (product: Product) => {
    const productName = getProductName(product, currentLanguage);
    const productImage = getProductImage(product);
    const { price, originalPrice } = getProductPrice(product);
    const stockStatusKey = getStockStatusKey(product);
    const hasDiscount = !!originalPrice;

    return (
      <TouchableOpacity
        key={product.id}
        style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        activeOpacity={0.7}
        onPress={() => {
          haptics.light();
          // TODO: Navigate to product details
        }}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: `${colors.primary}15` }]}>
              <Package size={40} color={colors.primary} strokeWidth={1.5} />
            </View>
          )}
          {!product.isActive && (
            <View style={[styles.inactiveBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <Text style={styles.inactiveBadgeText}>{t('inactive')}</Text>
            </View>
          )}
          {hasDiscount && (
            <View style={[styles.discountBadge, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.discountBadgeText}>
                {product.discountInfo?.type === 'PERCENTAGE'
                  ? `-${product.discountInfo.value}%`
                  : t('sale')}
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {productName}
          </Text>

          {product.category && (
            <Text style={[styles.categoryName, { color: colors.textSecondary }]} numberOfLines={1}>
              {currentLanguage === 'ar' && product.category.nameAr
                ? product.category.nameAr
                : product.category.name}
            </Text>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {formatCurrency(price, 'IQD', currentLanguage)}
            </Text>
            {hasDiscount && (
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                {formatCurrency(originalPrice!, 'IQD', currentLanguage)}
              </Text>
            )}
          </View>

          {/* Stock Status & Menu Button Row */}
          <View style={styles.stockActionsRow}>
            <Badge
              text={`${t(stockStatusKey)} (${product.quantity})`}
              variant={
                stockStatusKey === 'in_stock'
                  ? 'success'
                  : stockStatusKey === 'low_stock'
                  ? 'warning'
                  : 'error'
              }
              size="sm"
            />

            <TouchableOpacity
              style={[styles.menuBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={(e) => {
                e.stopPropagation();
                handleMenuPress(product);
              }}
              activeOpacity={0.7}
            >
              <MoreVertical size={16} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LoadingOverlay visible={loading} message={t('loading_products')} />

      {/* Header */}
      <PageHeader
        title={t('products')}
        subtitle={t('manage_products')}
      />

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder={t('search_products')}
        />
      </View>

      {/* Products Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={<Package size={48} color={colors.primary} strokeWidth={1.5} />}
            title={searchQuery ? t('no_results_found') : t('no_products_found')}
            message={searchQuery ? t('try_different_search') : t('add_first_product')}
          />
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => renderProductCard(product))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon={<Plus size={24} color={colors.white} strokeWidth={2.5} />}
        onPress={() => router.push('/products/add')}
        position="bottom-right"
      />

      {/* Menu Modal */}
      <BottomSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        title={selectedProduct ? getProductName(selectedProduct, currentLanguage) : ''}
        height="auto"
      >
        <View style={styles.menuContent}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={handleEditPress}
            activeOpacity={0.7}
          >
            <Edit2 size={20} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              {t('edit_product')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDeletePress}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color={colors.error} strokeWidth={2} />
            <Text style={[styles.menuItemText, { color: colors.error }]}>
              {t('delete_product')}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Search Bar
  searchWrapper: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: 80, // Space for FAB
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Product Card
  productCard: {
    width: CARD_WIDTH,
    borderRadius: design.radius.md,
    marginBottom: spacing.m,
    borderWidth: 1,
    ...design.shadow.sm,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  inactiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: design.radius.sm,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  productInfo: {
    padding: spacing.s,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
    height: 34,
  },
  categoryName: {
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: spacing.xs,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },

  // Stock & Menu Button Row
  stockActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  menuBtn: {
    width: 32,
    height: 32,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Menu Modal Content
  menuContent: {
    gap: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    gap: spacing.m,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});
