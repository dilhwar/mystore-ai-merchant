import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, RefreshControl, Dimensions, Image as RNImage, Alert as RNAlert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from '@/store/themeStore';
import { useAuth } from '@/store/authStore';
import { haptics } from '@/utils/haptics';
import { formatCurrency } from '@/utils/currency';
import { productLogger } from '@/utils/logger';
import {
  Box,
  HStack,
  VStack,
  Text,
  Heading,
  Pressable,
  Badge,
  BadgeText,
  Input,
  InputField,
  InputSlot,
  InputIcon,
  Card,
  Image,
  Fab,
  FabIcon,
  Menu,
  MenuItem,
  MenuItemLabel,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  Divider,
  Button,
  ButtonText,
  ButtonIcon,
  Icon,
} from '@gluestack-ui/themed';
import {
  Search,
  Package,
  X,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Archive,
  Copy,
  Filter,
  ChevronDown,
  ChevronRight,
} from 'lucide-react-native';
import { OrderCardSkeleton } from '@/components/ui/SkeletonLoader';
import {
  getProducts,
  Product,
  getProductName,
  getProductImage,
  getProductPrice,
  getStockStatusKey,
} from '@/services/products.service';
import { getCategories, Category, getCategoryName } from '@/services/categories.service';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // 16px padding each side + 8px gap between cards

interface ProductCardSkeletonProps {
  width: number;
}

function ProductCardSkeleton({ width }: ProductCardSkeletonProps) {
  const { colors, isDark } = useTheme();

  return (
    <Box w={width} mb="$3">
      <Card size="md" variant="elevated" bg="$cardLight" $dark-bg="$cardDark">
        <VStack space="sm">
          {/* Image skeleton */}
          <Box w="$full" h={width} borderRadius="$lg" bg="$surfaceLight" $dark-bg="$surfaceDark" />
          {/* Content skeleton */}
          <VStack space="xs" p="$3">
            <Box w="80%" h={16} borderRadius="$sm" bg="$surfaceLight" $dark-bg="$surfaceDark" />
            <Box w="50%" h={12} borderRadius="$sm" bg="$surfaceLight" $dark-bg="$surfaceDark" />
            <Box w="40%" h={14} borderRadius="$sm" bg="$surfaceLight" $dark-bg="$surfaceDark" />
          </VStack>
        </VStack>
      </Card>
    </Box>
  );
}

export default function ProductsNewScreen() {
  const { t, i18n } = useTranslation('products');
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { storeCurrency } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Sorting state
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date' | 'stock'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  // Advanced filters state
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  const currentLanguage = i18n.language;

  const loadProducts = async (refresh = false) => {
    try {
      if (refresh) {
        productLogger.refresh({ language: currentLanguage });
        haptics.light();
        setRefreshing(true);
        setCurrentPage(1);
      } else {
        productLogger.loadList({ language: currentLanguage });
        setLoading(true);
      }

      const params = {
        page: 1,
        limit: ITEMS_PER_PAGE,
      };

      const data = await getProducts(params);
      setProducts(data.products);
      setTotalPages(data.pagination?.totalPages || 1);
      setHasMore(data.products.length >= ITEMS_PER_PAGE);

      if (refresh) {
        productLogger.refreshSuccess(data.products.length, {
          totalPages: data.pagination?.totalPages,
          language: currentLanguage
        });
        haptics.success();
      } else {
        productLogger.loadListSuccess(data.products.length, {
          totalPages: data.pagination?.totalPages,
          language: currentLanguage
        });
      }
    } catch (error: any) {
      if (refresh) {
        productLogger.refreshError(error, { language: currentLanguage });
      } else {
        productLogger.loadListError(error, { language: currentLanguage });
      }
      haptics.error();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load more products for infinite scroll
  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore || searchQuery.trim()) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      productLogger.loadMore(nextPage, { language: currentLanguage });

      const params = {
        page: nextPage,
        limit: ITEMS_PER_PAGE,
      };

      const data = await getProducts(params);

      if (data.products.length > 0) {
        setProducts((prev) => [...prev, ...data.products]);
        setCurrentPage(nextPage);
        setHasMore(data.products.length >= ITEMS_PER_PAGE);
        productLogger.loadMoreSuccess(nextPage, data.products.length, {
          totalItems: products.length + data.products.length,
          language: currentLanguage
        });
      } else {
        setHasMore(false);
        productLogger.loadMoreSuccess(nextPage, 0, {
          message: 'No more products',
          language: currentLanguage
        });
      }
    } catch (error: any) {
      productLogger.loadMoreError(currentPage + 1, error, { language: currentLanguage });
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Load categories error:', error.message);
    }
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];
    const initialCount = filtered.length;

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        const productName = getProductName(product, currentLanguage).toLowerCase();
        return productName.includes(query);
      });
      productLogger.searchResults(query, filtered.length, {
        originalCount: initialCount,
        language: currentLanguage
      });
    }

    // Filter by active status
    if (filterActive === 'active') {
      filtered = filtered.filter((p) => p.isActive);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter((p) => !p.isActive);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category?.id === selectedCategory);
    }

    // Filter by stock level
    if (stockFilter !== 'all') {
      filtered = filtered.filter((p) => {
        const quantity = p.quantity || 0;
        if (stockFilter === 'out_of_stock') return quantity === 0;
        if (stockFilter === 'low_stock') return quantity > 0 && quantity < 10;
        if (stockFilter === 'in_stock') return quantity >= 10;
        return true;
      });
    }

    // Log applied filters
    if (selectedCategory || stockFilter !== 'all' || filterActive !== 'all') {
      productLogger.applyFilters({
        category: selectedCategory,
        stockLevel: stockFilter,
        activeStatus: filterActive,
        resultCount: filtered.length,
        language: currentLanguage
      });
    }

    // Sort products
    productLogger.sort(sortBy, sortOrder, {
      itemCount: filtered.length,
      language: currentLanguage
    });

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          const nameA = getProductName(a, currentLanguage).toLowerCase();
          const nameB = getProductName(b, currentLanguage).toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;

        case 'price':
          const priceA = getProductPrice(a).price;
          const priceB = getProductPrice(b).price;
          comparison = priceA - priceB;
          break;

        case 'stock':
          comparison = (a.quantity || 0) - (b.quantity || 0);
          break;

        case 'date':
        default:
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(filtered);
  }, [searchQuery, products, currentLanguage, filterActive, sortBy, sortOrder, selectedCategory, stockFilter]);

  const onRefresh = useCallback(() => {
    loadProducts(true);
  }, []);

  const handleProductPress = (product: Product) => {
    haptics.light();
    router.push(`/products/${product.id}`);
  };

  const handleProductLongPress = (product: Product) => {
    haptics.medium();
    setSelectedProduct(product);
    setShowActionSheet(true);
  };

  const handleEdit = () => {
    setShowActionSheet(false);
    haptics.selection();
    setTimeout(() => {
      if (selectedProduct) {
        router.push(`/products/edit/${selectedProduct.id}`);
      }
    }, 300);
  };

  const handleDelete = () => {
    setShowActionSheet(false);
    haptics.selection();
    setTimeout(() => {
      RNAlert.alert(
        t('delete_product'),
        t('delete_product_confirm', { name: selectedProduct ? getProductName(selectedProduct, currentLanguage) : '' }),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('delete'),
            style: 'destructive',
            onPress: () => {
              haptics.success();
              // Implement delete
            },
          },
        ]
      );
    }, 300);
  };

  const hasActiveFilters = () => {
    return !!(selectedCategory || stockFilter !== 'all' || filterActive !== 'all');
  };

  const clearAllFilters = () => {
    productLogger.clearFilters({ language: currentLanguage });
    setSelectedCategory(null);
    setStockFilter('all');
    setFilterActive('all');
    haptics.light();
  };

  const getStockBadgeConfig = (stockKey: string) => {
    const configs = {
      in_stock: { action: 'success' as const, icon: TrendingUp },
      low_stock: { action: 'warning' as const, icon: TrendingDown },
      out_of_stock: { action: 'error' as const, icon: Archive },
    };
    return configs[stockKey as keyof typeof configs] || configs.in_stock;
  };

  if (loading) {
    return (
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
        {/* Header */}
        <Box px="$4" pt="$12" pb="$4">
          <Heading size="xl" color="$textLight" $dark-color="$textDark">
            {t('products')}
          </Heading>
        </Box>

        {/* Skeletons */}
        <HStack px="$4" space="md" flexWrap="wrap">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} width={CARD_WIDTH} />
          ))}
        </HStack>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
      {/* Header */}
      <Box px="$4" pt="$12" pb="$4">
        <HStack alignItems="center" space="sm" mb="$4">
          <Heading size="xl" color="$textLight" $dark-color="$textDark" style={{ writingDirection: currentLanguage === 'ar' ? 'rtl' : 'ltr' }}>
            {t('products')}
          </Heading>
          <Badge action="muted" variant="solid" size="sm" borderRadius="$full">
            <BadgeText fontSize="$xs" fontWeight="$bold">{products.length}</BadgeText>
          </Badge>
        </HStack>

        {/* Search Bar and Filter Row */}
        <HStack space="sm" alignItems="center" mb="$3">
          <Input
            variant="outline"
            size="lg"
            bg="$surfaceLight"
            $dark-bg="$surfaceDark"
            borderColor="$borderLight"
            $dark-borderColor="$borderDark"
            borderRadius="$xl"
            $focus-borderColor="$primary500"
            flex={1}
          >
            <InputSlot pl="$4">
              <InputIcon as={Search} size="lg" color={colors.textSecondary} />
            </InputSlot>
            <InputField
              placeholder={t('search_products')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              color="$textLight"
              $dark-color="$textDark"
            />
            {searchQuery.length > 0 && (
              <InputSlot pr="$4">
                <Pressable
                  onPress={() => {
                    setSearchQuery('');
                    haptics.light();
                  }}
                >
                  <InputIcon as={X} size="sm" color={colors.textSecondary} />
                </Pressable>
              </InputSlot>
            )}
          </Input>

          {/* Filter Button */}
          <Pressable
            onPress={() => {
              setShowFiltersSheet(true);
              haptics.light();
            }}
            px="$4"
            py="$3"
            borderRadius="$xl"
            bg={hasActiveFilters() ? '$primary500' : '$surfaceLight'}
            $dark-bg={hasActiveFilters() ? '$primary500' : '$surfaceDark'}
            borderWidth={1}
            borderColor={hasActiveFilters() ? '$primary500' : '$borderLight'}
            $dark-borderColor={hasActiveFilters() ? '$primary500' : '$borderDark'}
            flexDirection="row"
            alignItems="center"
            space="xs"
          >
            <Filter size={20} color={hasActiveFilters() ? '#FFFFFF' : colors.textSecondary} />
            {hasActiveFilters() && (
              <Box
                w={18}
                h={18}
                borderRadius="$full"
                bg="$white"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="$2xs" fontWeight="$bold" color="$primary500">
                  {[selectedCategory, stockFilter !== 'all', filterActive !== 'all'].filter(Boolean).length}
                </Text>
              </Box>
            )}
          </Pressable>
        </HStack>
      </Box>

      {/* Products Grid */}
      <ScrollView
        px="$4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

          if (isCloseToBottom && !loadingMore && hasMore && !searchQuery.trim()) {
            loadMoreProducts();
          }
        }}
        scrollEventThrottle={400}
      >
        {filteredProducts.length === 0 ? (
          <Box mt="$12" alignItems="center" justifyContent="center">
            <Box w={80} h={80} borderRadius="$full" bg="$surfaceLight" $dark-bg="$surfaceDark" alignItems="center" justifyContent="center" mb="$4">
              <Package size={40} color={colors.textSecondary} strokeWidth={1.5} />
            </Box>
            <Heading size="lg" color="$textLight" $dark-color="$textDark" mb="$2">
              {searchQuery ? t('no_results_found') : t('no_products_found')}
            </Heading>
            <Text fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign="center">
              {searchQuery ? t('try_different_search') : t('add_first_product')}
            </Text>
          </Box>
        ) : (
          <VStack pb="$24" px="$4" space="xs">
            {filteredProducts.map((product, index) => {
              const productName = getProductName(product, currentLanguage);
              const productImage = getProductImage(product);
              const { price, originalPrice } = getProductPrice(product);
              const stockStatusKey = getStockStatusKey(product);
              const hasDiscount = !!originalPrice;
              const stockConfig = getStockBadgeConfig(stockStatusKey);

              return (
                <Pressable
                  key={product.id}
                  onPress={() => handleProductPress(product)}
                  onLongPress={() => handleProductLongPress(product)}
                  py="$3"
                  borderBottomWidth={1}
                  borderBottomColor="$borderLight"
                  $dark-borderBottomColor="$borderDark"
                >
                  <HStack space="md" alignItems="center">
                    {/* Product Image */}
                    <Box w={60} h={60} borderRadius="$md" overflow="hidden" bg="$surfaceLight" $dark-bg="$surfaceDark">
                      {productImage ? (
                        <RNImage
                          source={{ uri: productImage }}
                          style={{ width: 60, height: 60 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Box w="$full" h="$full" alignItems="center" justifyContent="center" bg={`${colors.primary}15`}>
                          <Package size={24} color={colors.primary} strokeWidth={1.5} />
                        </Box>
                      )}
                    </Box>

                    {/* Product Info */}
                    <VStack flex={1} space="xs" justifyContent="space-between">
                      <Text fontSize="$sm" color="$textLight" $dark-color="$textDark" fontWeight="$medium" numberOfLines={1}>
                        {productName}
                      </Text>
                      <HStack justifyContent="space-between" alignItems="flex-end">
                        <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                          {t(stockStatusKey)}
                        </Text>
                        <Text fontSize="$xs" color="$textLight" $dark-color="$textDark" fontWeight="$semibold">
                          {formatCurrency(price, storeCurrency, currentLanguage)}
                        </Text>
                      </HStack>
                    </VStack>

                    {/* Arrow */}
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <Box py="$6" alignItems="center">
            <Spinner size="small" color="$primary500" />
            <Text mt="$2" fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
              {t('loading_more')}
            </Text>
          </Box>
        )}

        {/* No More Products */}
        {!hasMore && products.length > 0 && !searchQuery.trim() && (
          <Box py="$6" alignItems="center">
            <Text fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
              {t('no_more_products')}
            </Text>
          </Box>
        )}
      </ScrollView>

      {/* FAB - Add Product */}
      <Fab
        size="lg"
        placement="bottom right"
        bg="$primary500"
        onPress={() => {
          haptics.medium();
          router.push('/products/add');
        }}
        $hover-bg="$primary600"
        $active-bg="$primary700"
      >
        <FabIcon as={Plus} size="xl" color="$white" />
      </Fab>

      {/* Action Sheet */}
      <Actionsheet isOpen={showActionSheet} onClose={() => setShowActionSheet(false)} zIndex={999}>
        <ActionsheetBackdrop />
        <ActionsheetContent zIndex={999} bg="$cardLight" $dark-bg="$cardDark">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack w="$full" p="$4" space="md">
            {selectedProduct && (
              <VStack space="xs" mb="$2">
                <Heading size="lg" color="$textLight" $dark-color="$textDark">
                  {getProductName(selectedProduct, currentLanguage)}
                </Heading>
                <Text fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                  {formatCurrency(getProductPrice(selectedProduct).price, storeCurrency, currentLanguage)}
                </Text>
              </VStack>
            )}

            <Divider bg="$borderLight" $dark-bg="$borderDark" />

            {/* Actions */}
            <ActionsheetItem onPress={handleEdit} bg="transparent">
              <HStack w="$full" alignItems="center" space="md">
                <Box w={36} h={36} borderRadius="$full" bg="$primary100" $dark-bg="$primary950" alignItems="center" justifyContent="center">
                  <Edit2 size={18} color={colors.primary500} />
                </Box>
                <ActionsheetItemText color="$textLight" $dark-color="$textDark" fontWeight="$medium">
                  {t('edit_product')}
                </ActionsheetItemText>
              </HStack>
            </ActionsheetItem>

            <ActionsheetItem
              onPress={() => {
                setShowActionSheet(false);
                haptics.selection();
              }}
              bg="transparent"
            >
              <HStack w="$full" alignItems="center" space="md">
                <Box w={36} h={36} borderRadius="$full" bg="$info100" $dark-bg="$info950" alignItems="center" justifyContent="center">
                  <Copy size={18} color={colors.info500} />
                </Box>
                <ActionsheetItemText color="$textLight" $dark-color="$textDark" fontWeight="$medium">
                  {t('duplicate_product')}
                </ActionsheetItemText>
              </HStack>
            </ActionsheetItem>

            <ActionsheetItem onPress={handleDelete} bg="transparent">
              <HStack w="$full" alignItems="center" space="md">
                <Box w={36} h={36} borderRadius="$full" bg="$error100" $dark-bg="$error950" alignItems="center" justifyContent="center">
                  <Trash2 size={18} color={colors.error500} />
                </Box>
                <ActionsheetItemText color="$error500" fontWeight="$medium">
                  {t('delete_product')}
                </ActionsheetItemText>
              </HStack>
            </ActionsheetItem>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>

      {/* Filters Action Sheet */}
      <Actionsheet isOpen={showFiltersSheet} onClose={() => setShowFiltersSheet(false)} zIndex={999}>
        <ActionsheetBackdrop />
        <ActionsheetContent zIndex={999} bg="$cardLight" $dark-bg="$cardDark" maxHeight="80%">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <ScrollView w="$full" showsVerticalScrollIndicator={false}>
            <VStack w="$full" p="$4" space="lg">
              {/* Header */}
              <HStack justifyContent="space-between" alignItems="center">
                <Heading size="xl" color="$textLight" $dark-color="$textDark">
                  {t('filters')}
                </Heading>
                {hasActiveFilters() && (
                  <Pressable onPress={clearAllFilters}>
                    <Text fontSize="$sm" color="$primary500" fontWeight="$semibold">
                      {t('clear_all')}
                    </Text>
                  </Pressable>
                )}
              </HStack>

              <Divider bg="$borderLight" $dark-bg="$borderDark" />

              {/* Status Filter */}
              <VStack space="sm">
                <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark">
                  {t('status')}
                </Text>
                <HStack space="sm" flexWrap="wrap">
                  {(['all', 'active', 'inactive'] as const).map((status) => (
                    <Pressable
                      key={status}
                      onPress={() => {
                        setFilterActive(status);
                        haptics.light();
                      }}
                      px="$4"
                      py="$2"
                      borderRadius="$full"
                      bg={filterActive === status ? '$primary500' : '$surfaceLight'}
                      $dark-bg={filterActive === status ? '$primary500' : '$surfaceDark'}
                      borderWidth={1}
                      borderColor={filterActive === status ? '$primary500' : '$borderLight'}
                      $dark-borderColor={filterActive === status ? '$primary500' : '$borderDark'}
                    >
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={filterActive === status ? '$white' : '$textLight'}
                        $dark-color={filterActive === status ? '$white' : '$textDark'}
                      >
                        {status === 'all' ? t('all') : status === 'active' ? t('active') : t('inactive')}
                      </Text>
                    </Pressable>
                  ))}
                </HStack>
              </VStack>

              <Divider bg="$borderLight" $dark-bg="$borderDark" />

              {/* Category Filter */}
              <VStack space="sm">
                <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark">
                  {t('category')}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack space="sm">
                    <Pressable
                      onPress={() => {
                        setSelectedCategory(null);
                        haptics.light();
                      }}
                      px="$4"
                      py="$2"
                      borderRadius="$full"
                      bg={!selectedCategory ? '$primary500' : '$surfaceLight'}
                      $dark-bg={!selectedCategory ? '$primary500' : '$surfaceDark'}
                      borderWidth={1}
                      borderColor={!selectedCategory ? '$primary500' : '$borderLight'}
                      $dark-borderColor={!selectedCategory ? '$primary500' : '$borderDark'}
                    >
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={!selectedCategory ? '$white' : '$textLight'}
                        $dark-color={!selectedCategory ? '$white' : '$textDark'}
                      >
                        {t('all')}
                      </Text>
                    </Pressable>
                    {categories.map((cat) => (
                      <Pressable
                        key={cat.id}
                        onPress={() => {
                          setSelectedCategory(cat.id);
                          haptics.light();
                        }}
                        px="$4"
                        py="$2"
                        borderRadius="$full"
                        bg={selectedCategory === cat.id ? '$primary500' : '$surfaceLight'}
                        $dark-bg={selectedCategory === cat.id ? '$primary500' : '$surfaceDark'}
                        borderWidth={1}
                        borderColor={selectedCategory === cat.id ? '$primary500' : '$borderLight'}
                        $dark-borderColor={selectedCategory === cat.id ? '$primary500' : '$borderDark'}
                      >
                        <Text
                          fontSize="$sm"
                          fontWeight="$semibold"
                          color={selectedCategory === cat.id ? '$white' : '$textLight'}
                          $dark-color={selectedCategory === cat.id ? '$white' : '$textDark'}
                        >
                          {getCategoryName(cat, currentLanguage)}
                        </Text>
                      </Pressable>
                    ))}
                  </HStack>
                </ScrollView>
              </VStack>

              <Divider bg="$borderLight" $dark-bg="$borderDark" />

              {/* Stock Level Filter */}
              <VStack space="sm">
                <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark">
                  {t('stock_level')}
                </Text>
                <HStack space="sm" flexWrap="wrap">
                  {(['all', 'in_stock', 'low_stock', 'out_of_stock'] as const).map((stock) => (
                    <Pressable
                      key={stock}
                      onPress={() => {
                        setStockFilter(stock);
                        haptics.light();
                      }}
                      px="$4"
                      py="$2"
                      borderRadius="$full"
                      bg={stockFilter === stock ? '$primary500' : '$surfaceLight'}
                      $dark-bg={stockFilter === stock ? '$primary500' : '$surfaceDark'}
                      borderWidth={1}
                      borderColor={stockFilter === stock ? '$primary500' : '$borderLight'}
                      $dark-borderColor={stockFilter === stock ? '$primary500' : '$borderDark'}
                    >
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={stockFilter === stock ? '$white' : '$textLight'}
                        $dark-color={stockFilter === stock ? '$white' : '$textDark'}
                      >
                        {t(stock === 'all' ? 'all' : stock)}
                      </Text>
                    </Pressable>
                  ))}
                </HStack>
              </VStack>

              <Divider bg="$borderLight" $dark-bg="$borderDark" />

              {/* Sort Options */}
              <VStack space="sm">
                <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark">
                  {t('sort_by')}
                </Text>
                <HStack space="sm" flexWrap="wrap">
                  {(['date', 'name', 'price', 'stock'] as const).map((sort) => (
                    <Pressable
                      key={sort}
                      onPress={() => {
                        if (sortBy === sort) {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy(sort);
                          setSortOrder('desc');
                        }
                        haptics.selection();
                      }}
                      px="$4"
                      py="$2"
                      borderRadius="$full"
                      bg={sortBy === sort ? '$primary500' : '$surfaceLight'}
                      $dark-bg={sortBy === sort ? '$primary500' : '$surfaceDark'}
                      borderWidth={1}
                      borderColor={sortBy === sort ? '$primary500' : '$borderLight'}
                      $dark-borderColor={sortBy === sort ? '$primary500' : '$borderDark'}
                      flexDirection="row"
                      alignItems="center"
                      space="xs"
                    >
                      <Text
                        fontSize="$sm"
                        fontWeight="$semibold"
                        color={sortBy === sort ? '$white' : '$textLight'}
                        $dark-color={sortBy === sort ? '$white' : '$textDark'}
                      >
                        {t(`sort_${sort}`)}
                      </Text>
                      {sortBy === sort && (
                        <Text fontSize="$sm" color="$white" fontWeight="$bold">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </HStack>
              </VStack>

              {/* Apply Button */}
              <Button
                size="lg"
                bg="$primary500"
                onPress={() => {
                  setShowFiltersSheet(false);
                  haptics.success();
                }}
                $hover-bg="$primary600"
                $active-bg="$primary700"
              >
                <ButtonText fontWeight="$bold">{t('apply_filters')}</ButtonText>
              </Button>
            </VStack>
          </ScrollView>
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  );
}
