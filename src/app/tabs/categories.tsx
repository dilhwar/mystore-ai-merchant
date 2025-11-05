import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text as GText,
  Pressable,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
} from 'lucide-react-native';
import { haptics } from '@/utils/haptics';
import {
  getCategories,
  Category,
  getCategoryName,
  getTotalProductsCount,
} from '@/services/categories.service';

export default function CategoriesScreen() {
  const { t, i18n } = useTranslation('categories');
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const currentLanguage = i18n.language;

  const toggleCategory = (categoryId: string) => {
    haptics.light();
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const loadCategories = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Load categories error:', error.message);
      Alert.alert(
        t('error'),
        t('failed_to_load_categories')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onRefresh = useCallback(() => {
    loadCategories(true);
  }, []);

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    Alert.alert(
      t('delete_category'),
      t('delete_category_confirm', { name: categoryName }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement delete API call
              haptics.success();
              Alert.alert(t('success'), t('category_deleted'));
              loadCategories();
            } catch (error) {
              haptics.error();
              Alert.alert(t('error'), t('failed_to_delete_category'));
            }
          },
        },
      ]
    );
  };

  const handleEditCategory = (category: Category) => {
    haptics.light();
    // TODO: Navigate to edit category screen
    Alert.alert(t('edit_category'), `Edit: ${getCategoryName(category, currentLanguage)}`);
  };

  const handleAddCategory = () => {
    haptics.light();
    // TODO: Navigate to add category screen
    Alert.alert(t('add_category'), t('add_category_message'));
  };

  const renderSubcategory = (subcategory: Category) => {
    const productCount = subcategory._count?.products || 0;
    const categoryName = getCategoryName(subcategory, currentLanguage);

    return (
      <Box
        key={subcategory.id}
        bg="$backgroundLight"
        $dark-bg="$backgroundDark"
        borderRadius="$lg"
        p="$3"
        mb="$2"
        borderWidth={1}
        borderColor="$borderLight"
        $dark-borderColor="$borderDark"
      >
        <HStack justifyContent="space-between" alignItems="center">
          {/* Drag Handle */}
          <Box mr="$2">
            <GripVertical size={20} color={colors.textSecondary} strokeWidth={2} />
          </Box>

          {/* Left Side: Image + Info */}
          <HStack space="sm" flex={1} alignItems="center" minWidth={0}>
            {subcategory.image ? (
              <Image
                source={{ uri: subcategory.image }}
                style={styles.subcategoryImage}
              />
            ) : (
              <Box
                w={40}
                h={40}
                borderRadius="$md"
                bg="$primary100"
                $dark-bg="$primary950"
                alignItems="center"
                justifyContent="center"
              >
                <Text style={{ fontSize: 20 }}>🏷️</Text>
              </Box>
            )}
            <VStack flex={1} minWidth={0}>
              <GText
                fontSize="$sm"
                fontWeight="$semibold"
                color="$textLight"
                $dark-color="$textDark"
                numberOfLines={1}
              >
                {categoryName}
              </GText>
              <GText fontSize="$2xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                {t('products_count', { count: productCount })}
              </GText>
            </VStack>
          </HStack>

          {/* Right Side: Action Buttons */}
          <HStack space="sm" alignItems="center">
            {/* Edit Button */}
            <Pressable
              onPress={() => handleEditCategory(subcategory)}
              w={32}
              h={32}
              borderRadius="$full"
              bg="$info100"
              $dark-bg="$info950"
              alignItems="center"
              justifyContent="center"
            >
              <Edit2 size={14} color={colors.info500} strokeWidth={2.5} />
            </Pressable>

            {/* Delete Button */}
            <Pressable
              onPress={() => handleDeleteCategory(subcategory.id, categoryName)}
              w={32}
              h={32}
              borderRadius="$full"
              bg="$error100"
              $dark-bg="$error950"
              alignItems="center"
              justifyContent="center"
            >
              <Trash2 size={14} color={colors.error500} strokeWidth={2.5} />
            </Pressable>
          </HStack>
        </HStack>
      </Box>
    );
  };

  const renderCategoryCard = (category: Category) => {
    const categoryName = getCategoryName(category, currentLanguage);
    const totalProducts = getTotalProductsCount(category);
    const hasSubcategories = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <Box
        key={category.id}
        bg="$cardLight"
        $dark-bg="$cardDark"
        borderRadius="$xl"
        mb="$3"
        shadowColor="$black"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={4}
        overflow="hidden"
      >
        {/* Category Header - Clickable */}
        <Pressable
          onPress={() => hasSubcategories && toggleCategory(category.id)}
          p="$4"
        >
          <HStack justifyContent="space-between" alignItems="center">
            {/* Left Side: Drag Handle + Category Info */}
            <HStack space="sm" flex={1} alignItems="center" minWidth={0}>
                {/* Drag Handle */}
                <Box>
                  <GripVertical size={24} color={colors.textSecondary} strokeWidth={2} />
                </Box>

                {/* Category Image */}
                {category.image ? (
                  <Image
                    source={{ uri: category.image }}
                    style={styles.categoryImageSmall}
                  />
                ) : (
                  <Box
                    w={48}
                    h={48}
                    borderRadius="$lg"
                    bg="$primary100"
                    $dark-bg="$primary950"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text style={{ fontSize: 24 }}>🏷️</Text>
                  </Box>
                )}

                {/* Category Name & Stats */}
                <VStack flex={1} minWidth={0}>
                  <GText
                    fontSize="$md"
                    fontWeight="$bold"
                    color="$textLight"
                    $dark-color="$textDark"
                    numberOfLines={1}
                  >
                    {categoryName}
                  </GText>
                  <HStack space="xs" alignItems="center">
                    {hasSubcategories && (
                      <>
                        <GText fontSize="$2xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                          {category.children!.length}
                        </GText>
                        <GText fontSize="$2xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">•</GText>
                      </>
                    )}
                    <GText fontSize="$2xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      {totalProducts} {t('products')}
                    </GText>
                  </HStack>
                </VStack>
              </HStack>

              {/* Right Side: Action Buttons - Fixed Width */}
              <HStack space="sm" alignItems="center">
                {/* Edit Button */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditCategory(category);
                  }}
                  w={36}
                  h={36}
                  borderRadius="$full"
                  bg="$info100"
                  $dark-bg="$info950"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Edit2 size={16} color={colors.info500} strokeWidth={2.5} />
                </Pressable>

                {/* Delete Button */}
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category.id, categoryName);
                  }}
                  w={36}
                  h={36}
                  borderRadius="$full"
                  bg="$error100"
                  $dark-bg="$error950"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Trash2 size={16} color={colors.error500} strokeWidth={2.5} />
                </Pressable>
              </HStack>
            </HStack>
          </Pressable>

        {/* Subcategories - Collapsible */}
        {hasSubcategories && isExpanded && (
          <VStack
            space="xs"
            px="$4"
            pb="$4"
            pt="$2"
            bg="$backgroundLight"
            $dark-bg="$backgroundDark"
            borderTopWidth={1}
            borderTopColor="$borderLight"
            $dark-borderTopColor="$borderDark"
          >
            {category.children!.map(renderSubcategory)}
          </VStack>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
        {/* Header */}
        <Box px="$4" pt="$12" pb="$4">
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="xl" color="$textLight" $dark-color="$textDark">
              {t('categories')}
            </Heading>

            {/* Add Category Button */}
            <Pressable
              onPress={handleAddCategory}
              bg="$primary500"
              px="$4"
              py="$2.5"
              borderRadius="$full"
              flexDirection="row"
              alignItems="center"
              space="xs"
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
              <GText fontSize="$sm" color="$white" fontWeight="$semibold">
                {t('add')}
              </GText>
            </Pressable>
          </HStack>
        </Box>

        <View style={[styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('loading_categories')}
          </Text>
        </View>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
      {/* Header */}
      <Box px="$4" pt="$12" pb="$4">
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="xl" color="$textLight" $dark-color="$textDark">
            {t('categories')}
          </Heading>

          {/* Add Category Button */}
          <Pressable
            onPress={handleAddCategory}
            bg="$primary500"
            px="$4"
            py="$2.5"
            borderRadius="$full"
            flexDirection="row"
            alignItems="center"
            space="xs"
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            <GText fontSize="$sm" color="$white" fontWeight="$semibold">
              {t('add')}
            </GText>
          </Pressable>
        </HStack>
      </Box>

      {/* Categories List */}
      {categories.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: `${colors.primary}10` }]}>
          <Text style={{ fontSize: 48 }}>🏷️</Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            {t('no_categories_found')}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {categories.map(renderCategoryCard)}
        </ScrollView>
      )}
    </Box>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
  },
  categoryCard: {
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: spacing.m,
  },
  categoryImageSmall: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  categoryImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryStats: {
    fontSize: 13,
  },
  subcategoriesContainer: {
    marginTop: spacing.s,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  subcategoriesTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: spacing.s,
  },
  subcategoryCard: {
    borderRadius: 8,
    padding: spacing.s,
    marginBottom: spacing.xs,
  },
  subcategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: spacing.s,
  },
  subcategoryImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subcategoryInfo: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subcategoryCount: {
    fontSize: 12,
  },
  emptyState: {
    padding: spacing.xxl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: spacing.m,
    textAlign: 'center',
  },
});
