import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, RefreshControl, Dimensions, Image as RNImage, Alert as RNAlert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useTheme } from '@/store/themeStore';
import { haptics } from '@/utils/haptics';
import { formatCurrency } from '@/utils/currency';
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

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 16px padding each side + 16px gap

interface ProductCardSkeletonProps {
  width: number;
}

function ProductCardSkeleton({ width }: ProductCardSkeletonProps) {
  const { colors, isDark } = useTheme();

  return (
    <Box w={width} mb="$4">
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

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const currentLanguage = i18n.language;

  const loadProducts = async (refresh = false) => {
    try {
      if (refresh) {
        haptics.light();
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {
        page: 1,
        limit: 50,
      };

      const data = await getProducts(params);
      setProducts(data.products);

      if (refresh) {
        haptics.success();
      }
    } catch (error: any) {
      console.error('Load products error:', error.message);
      haptics.error();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = [...products];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        const productName = getProductName(product, currentLanguage).toLowerCase();
        return productName.includes(query);
      });
    }

    // Filter by active status
    if (filterActive === 'active') {
      filtered = filtered.filter((p) => p.isActive);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter((p) => !p.isActive);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, products, currentLanguage, filterActive]);

  const onRefresh = useCallback(() => {
    loadProducts(true);
  }, []);

  const handleProductPress = (product: Product) => {
    haptics.light();
    // Navigate to product details
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
        // router.push(`/products/edit/${selectedProduct.id}`);
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

  const getStockBadgeConfig = (stockKey: string) => {
    const configs = {
      in_stock: { action: 'success' as const, icon: TrendingUp },
      low_stock: { action: 'warning' as const, icon: TrendingDown },
      out_of_stock: { action: 'error' as const, icon: Archive },
    };
    return configs[stockKey as keyof typeof configs] || configs.in_stock;
  };

  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;

  if (loading) {
    return (
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
        {/* Header */}
        <Box px="$4" pt="$6" pb="$4">
          <Heading size="2xl" color="$textLight" $dark-color="$textDark">
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
      <Box px="$4" pt="$6" pb="$4">
        <HStack justifyContent="space-between" alignItems="center" mb="$4">
          <VStack space="xs">
            <Heading size="2xl" color="$textLight" $dark-color="$textDark">
              {t('products')}
            </Heading>
            <Text fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
              {products.length} {t('total_products')}
            </Text>
          </VStack>

          {/* Quick Stats */}
          <HStack space="sm">
            <VStack alignItems="center" space="xs">
              <Badge action="success" variant="solid" size="md" borderRadius="$full">
                <BadgeText>{activeCount}</BadgeText>
              </Badge>
              <Text fontSize="$2xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                Active
              </Text>
            </VStack>
            <VStack alignItems="center" space="xs">
              <Badge action="muted" variant="solid" size="md" borderRadius="$full">
                <BadgeText>{inactiveCount}</BadgeText>
              </Badge>
              <Text fontSize="$2xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                Inactive
              </Text>
            </VStack>
          </HStack>
        </HStack>

        {/* Search Bar */}
        <Input
          variant="outline"
          size="lg"
          bg="$surfaceLight"
          $dark-bg="$surfaceDark"
          borderColor="$borderLight"
          $dark-borderColor="$borderDark"
          borderRadius="$xl"
          $focus-borderColor="$primary500"
          mb="$3"
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

        {/* Filter Chips */}
        <HStack space="sm">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <Pressable
              key={filter}
              onPress={() => {
                setFilterActive(filter);
                haptics.selection();
              }}
              px="$4"
              py="$2"
              borderRadius="$full"
              bg={filterActive === filter ? '$primary500' : '$surfaceLight'}
              $dark-bg={filterActive === filter ? '$primary500' : '$surfaceDark'}
              borderWidth={1}
              borderColor={filterActive === filter ? '$primary500' : '$borderLight'}
              $dark-borderColor={filterActive === filter ? '$primary500' : '$borderDark'}
            >
              <Text
                fontSize="$sm"
                fontWeight="$semibold"
                color={filterActive === filter ? '$white' : '$textLight'}
                $dark-color={filterActive === filter ? '$white' : '$textDark'}
              >
                {filter === 'all' ? t('all') : filter === 'active' ? t('active') : t('inactive')}
              </Text>
            </Pressable>
          ))}
        </HStack>
      </Box>

      {/* Products Grid */}
      <ScrollView
        px="$4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
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
          <HStack space="md" flexWrap="wrap" justifyContent="space-between" pb="$24">
            {filteredProducts.map((product, index) => {
              const productName = getProductName(product, currentLanguage);
              const productImage = getProductImage(product);
              const { price, originalPrice } = getProductPrice(product);
              const stockStatusKey = getStockStatusKey(product);
              const hasDiscount = !!originalPrice;
              const stockConfig = getStockBadgeConfig(stockStatusKey);
              const StockIcon = stockConfig.icon;

              return (
                <Card
                  key={product.id}
                  size="md"
                  variant="elevated"
                  w={CARD_WIDTH}
                  mb="$4"
                  bg="$cardLight"
                  $dark-bg="$cardDark"
                  overflow="hidden"
                >
                  <Pressable
                    onPress={() => handleProductPress(product)}
                    onLongPress={() => handleProductLongPress(product)}
                  >
                    <VStack space="sm">
                      {/* Product Image */}
                      <Box position="relative" w="$full" h={CARD_WIDTH} bg="$surfaceLight" $dark-bg="$surfaceDark">
                        {productImage ? (
                          <Image
                            source={{ uri: productImage }}
                            alt={productName}
                            w="$full"
                            h="$full"
                            resizeMode="cover"
                          />
                        ) : (
                          <Box w="$full" h="$full" alignItems="center" justifyContent="center" bg={`${colors.primary}15`}>
                            <Package size={48} color={colors.primary} strokeWidth={1.5} />
                          </Box>
                        )}

                        {/* Inactive Overlay */}
                        {!product.isActive && (
                          <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="rgba(0,0,0,0.6)" alignItems="center" justifyContent="center">
                            <EyeOff size={32} color="#FFFFFF" />
                            <Text fontSize="$sm" color="$white" fontWeight="$bold" mt="$2">
                              {t('inactive')}
                            </Text>
                          </Box>
                        )}

                        {/* Discount Badge */}
                        {hasDiscount && product.isActive && (
                          <Box position="absolute" top="$2" right="$2" px="$2" py="$1" borderRadius="$lg" bg="$error500">
                            <Text fontSize="$xs" color="$white" fontWeight="$bold">
                              {product.discountInfo?.type === 'PERCENTAGE' ? `-${product.discountInfo.value}%` : t('sale')}
                            </Text>
                          </Box>
                        )}

                        {/* Menu Button */}
                        <Pressable
                          position="absolute"
                          top="$2"
                          left="$2"
                          w={32}
                          h={32}
                          borderRadius="$full"
                          bg="rgba(0,0,0,0.5)"
                          backdropFilter="blur(10px)"
                          alignItems="center"
                          justifyContent="center"
                          onPress={(e) => {
                            haptics.light();
                            setSelectedProduct(product);
                            setShowActionSheet(true);
                          }}
                        >
                          <MoreVertical size={16} color="#FFFFFF" />
                        </Pressable>
                      </Box>

                      {/* Product Info */}
                      <VStack space="xs" p="$3">
                        {/* Category */}
                        {product.category && (
                          <Text fontSize="$2xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textTransform="uppercase" fontWeight="$medium">
                            {currentLanguage === 'ar' && product.category.nameAr ? product.category.nameAr : product.category.name}
                          </Text>
                        )}

                        {/* Product Name */}
                        <Heading size="sm" color="$textLight" $dark-color="$textDark" numberOfLines={2} minHeight={40}>
                          {productName}
                        </Heading>

                        {/* Price */}
                        <HStack alignItems="center" space="xs" flexWrap="wrap">
                          <Heading size="md" color="$success500">
                            {formatCurrency(price, 'IQD', currentLanguage)}
                          </Heading>
                          {hasDiscount && (
                            <Text fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textDecorationLine="line-through">
                              {formatCurrency(originalPrice!, 'IQD', currentLanguage)}
                            </Text>
                          )}
                        </HStack>

                        {/* Stock Badge */}
                        <Badge action={stockConfig.action} variant="solid" size="sm" borderRadius="$lg" alignSelf="flex-start">
                          <HStack space="xs" alignItems="center" px="$1">
                            <StockIcon size={12} color="#FFFFFF" strokeWidth={2.5} />
                            <BadgeText fontSize="$xs" fontWeight="$semibold">
                              {t(stockStatusKey)} ({product.quantity})
                            </BadgeText>
                          </HStack>
                        </Badge>
                      </VStack>
                    </VStack>
                  </Pressable>
                </Card>
              );
            })}
          </HStack>
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
                  {formatCurrency(getProductPrice(selectedProduct).price, 'IQD', currentLanguage)}
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
    </Box>
  );
}
