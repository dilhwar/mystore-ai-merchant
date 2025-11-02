import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useRouter } from 'expo-router';
import { PageHeader } from '@/components/ui/PageHeader';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { formatCurrency } from '@/utils/currency';
import { haptics } from '@/utils/haptics';
import { Package, Search, Plus, Edit2, Trash2, MoreVertical } from 'lucide-react-native';
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

          {/* Menu Button (3 dots) */}
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: colors.surface }]}
            onPress={(e) => {
              e.stopPropagation();
              handleMenuPress(product);
            }}
            activeOpacity={0.7}
          >
            <MoreVertical size={18} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
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

          {/* Stock Status */}
          <View
            style={[
              styles.stockBadge,
              {
                backgroundColor:
                  stockStatusKey === 'in_stock'
                    ? '#10B98120'
                    : stockStatusKey === 'low_stock'
                    ? '#F59E0B20'
                    : '#EF444420',
              },
            ]}
          >
            <Text
              style={[
                styles.stockText,
                {
                  color:
                    stockStatusKey === 'in_stock'
                      ? '#10B981'
                      : stockStatusKey === 'low_stock'
                      ? '#F59E0B'
                      : '#EF4444',
                },
              ]}
            >
              {t(stockStatusKey)} ({product.quantity})
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('loading_products')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PageHeader
        title={t('products')}
        subtitle={t('manage_products')}
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={20} color={colors.textSecondary} strokeWidth={2} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('search_products')}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <Text style={[styles.clearButton, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        )}
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
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Package size={48} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              {searchQuery ? t('no_results_found') : t('no_products_found')}
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {searchQuery ? t('try_different_search') : t('add_first_product')}
            </Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => renderProductCard(product))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          haptics.medium();
          router.push('/products/add');
        }}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            haptics.light();
            setMenuVisible(false);
          }}
        >
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>
              {selectedProduct ? getProductName(selectedProduct, currentLanguage) : ''}
            </Text>

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
              <Trash2 size={20} color="#EF4444" strokeWidth={2} />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>
                {t('delete_product')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: 16,
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.m,
    marginVertical: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: design.radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: 15,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    fontSize: 18,
    paddingHorizontal: spacing.xs,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
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
    paddingVertical: 4,
    alignItems: 'center',
  },
  inactiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: design.radius.sm,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Menu Button (3 dots)
  menuButton: {
    position: 'absolute',
    top: spacing.s,
    left: spacing.s,
    width: 32,
    height: 32,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  productInfo: {
    padding: spacing.s,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    height: 34,
  },
  categoryName: {
    fontSize: 11,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  stockBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: design.radius.sm,
    alignSelf: 'flex-start',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    padding: spacing.xxl,
    borderRadius: design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: spacing.l,
    right: spacing.l,
    width: 56,
    height: 56,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  // Menu Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 300,
    borderRadius: design.radius.lg,
    padding: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.m,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
