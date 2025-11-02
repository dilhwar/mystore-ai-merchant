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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { spacing } from '@/theme/spacing';
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

  const currentLanguage = i18n.language;

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

  const renderSubcategory = (subcategory: Category) => {
    const productCount = subcategory._count?.products || 0;
    const categoryName = getCategoryName(subcategory, currentLanguage);

    return (
      <View
        key={subcategory.id}
        style={[styles.subcategoryCard, { backgroundColor: colors.background }]}
      >
        <View style={styles.subcategoryContent}>
          {subcategory.image ? (
            <Image
              source={{ uri: subcategory.image }}
              style={styles.subcategoryImage}
            />
          ) : (
            <View style={[styles.subcategoryImagePlaceholder, { backgroundColor: `${colors.primary}20` }]}>
              <Text style={{ fontSize: 20 }}>🏷️</Text>
            </View>
          )}
          <View style={styles.subcategoryInfo}>
            <Text style={[styles.subcategoryName, { color: colors.text }]}>
              {categoryName}
            </Text>
            <Text style={[styles.subcategoryCount, { color: colors.textSecondary }]}>
              {t('products_count', { count: productCount })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryCard = (category: Category) => {
    const categoryName = getCategoryName(category, currentLanguage);
    const totalProducts = getTotalProductsCount(category);
    const hasSubcategories = category.children && category.children.length > 0;

    return (
      <View
        key={category.id}
        style={[styles.categoryCard, { backgroundColor: colors.surface }]}
      >
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          {category.image ? (
            <Image
              source={{ uri: category.image }}
              style={styles.categoryImage}
            />
          ) : (
            <View style={[styles.categoryImagePlaceholder, { backgroundColor: `${colors.primary}30` }]}>
              <Text style={{ fontSize: 32 }}>🏷️</Text>
            </View>
          )}
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {categoryName}
            </Text>
            <Text style={[styles.categoryStats, { color: colors.textSecondary }]}>
              {hasSubcategories && (
                <Text>{t('subcategories_count', { count: category.children!.length })} • </Text>
              )}
              <Text>{t('products_count', { count: totalProducts })}</Text>
            </Text>
          </View>
        </View>

        {/* Subcategories */}
        {hasSubcategories && (
          <View style={styles.subcategoriesContainer}>
            <Text style={[styles.subcategoriesTitle, { color: colors.textSecondary }]}>
              {t('subcategories')}
            </Text>
            {category.children!.map(renderSubcategory)}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('loading_categories')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PageHeader
        title={t('categories')}
        subtitle={t('manage_categories')}
      />

      {/* Categories List */}
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
        {categories.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: `${colors.primary}10` }]}>
            <Text style={{ fontSize: 48 }}>🏷️</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {t('no_categories_found')}
            </Text>
          </View>
        ) : (
          categories.map(renderCategoryCard)
        )}
      </ScrollView>
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
