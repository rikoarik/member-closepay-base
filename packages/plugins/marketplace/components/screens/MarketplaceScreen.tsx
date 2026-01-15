/**
 * MarketplaceScreen Component
 * Halaman utama marketplace dengan grid produk
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SearchNormal, Filter } from 'iconsax-react-nativejs';
import { TouchableOpacity } from 'react-native';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ProductCard, Product } from '../shared/ProductCard';
import { ProductCardSkeleton } from '../shared/ProductCardSkeleton';
import { useMarketplaceData } from '../../hooks/useMarketplaceData';
import { useMarketplaceAnalytics } from '../../hooks/useMarketplaceAnalytics';

const PAGE_SIZE = 20;

export const MarketplaceScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const { trackViewProduct } = useMarketplaceAnalytics();

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadedBatches, setLoadedBatches] = useState<number>(2); // Load 2 batches initially

  const allProducts = useMarketplaceData(loadedBatches * 20, true, true);

  const paginatedProducts = React.useMemo(() => {
    const endIndex = currentPage * PAGE_SIZE;
    return allProducts.slice(0, endIndex);
  }, [allProducts, currentPage]);

  const hasMore = paginatedProducts.length < allProducts.length;

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !refreshing) {
      setIsLoadingMore(true);
      const neededBatches = Math.ceil((currentPage + 1) * PAGE_SIZE / 20);
      if (neededBatches > loadedBatches) {
        setLoadedBatches(neededBatches);
      }
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, hasMore, refreshing, currentPage, loadedBatches]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setLoadedBatches(2);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleProductPress = (product: Product) => {
    if (product.category) {
      trackViewProduct(product.category);
    }
    // @ts-ignore
    navigation.navigate('ProductDetail', { product });
  };

  const handleSearchPress = () => {
    // @ts-ignore
    navigation.navigate('MarketplaceSearch' as never);
  };

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard product={item} onPress={handleProductPress} />
    ),
    [handleProductPress]
  );

  const renderFooter = () => {
    if (isLoadingMore && hasMore) {
      return (
        <View style={styles.footerShimmer}>
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-footer-${index}`} />
          ))}
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            paddingTop: insets.top,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleSearchPress}
          style={[styles.searchBar, { backgroundColor: colors.primaryLight || colors.surface }]}
        >
          <SearchNormal size={scale(20)} color={colors.primary} variant="Bold" />
          <View style={styles.searchText}>
            {/* Placeholder text */}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Filter size={scale(20)} color={colors.text} variant="Linear" />
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      <FlatList
        data={paginatedProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{
          gap: scale(12),
        }}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: moderateVerticalScale(16),
            paddingBottom: insets.bottom + moderateVerticalScale(16),
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        ListFooterComponent={renderFooter}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: moderateVerticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    height: scale(44),
    borderRadius: scale(22),
  },
  searchText: {
    flex: 1,
    marginLeft: scale(8),
  },
  filterButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(8),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  footerShimmer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: moderateVerticalScale(8),
  },
});