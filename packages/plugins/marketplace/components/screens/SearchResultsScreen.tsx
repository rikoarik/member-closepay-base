/**
 * SearchResultsScreen Component
 * Halaman hasil search untuk marketplace
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft2, Filter, SearchNormal, CloseCircle, ShoppingCart } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
  useDimensions,
  UI_CONSTANTS,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ProductCard, Product } from '../shared/ProductCard';
import { ProductCardSkeleton } from '../shared/ProductCardSkeleton';
import { StoreCard } from '../shared/StoreCard';
import { useMarketplaceData, searchStores } from '../../hooks/useMarketplaceData';
import { useMarketplaceAnalytics } from '../../hooks/useMarketplaceAnalytics';

const PAGE_SIZE = UI_CONSTANTS.DEFAULT_PAGE_SIZE;

export const SearchResultsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();
  const { width: screenWidth } = useDimensions();
  const { trackSearch, trackViewProduct } = useMarketplaceAnalytics();

  const searchQuery = (route.params as any)?.query || '';
  const [searchText, setSearchText] = useState(searchQuery);
  const [activeTab, setActiveTab] = useState<'product' | 'store'>('product');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadedBatches, setLoadedBatches] = useState<number>(1);
  const searchInputRef = React.useRef<any>(null);

  useEffect(() => {
    setSearchText(searchQuery);
  }, [searchQuery]);

  const { products: allProducts } = useMarketplaceData(loadedBatches * 20, true, true);

  const filteredProducts = React.useMemo(() => {
    const query = searchText || searchQuery;
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category?.toLowerCase().includes(lowerQuery)
    );
  }, [allProducts, searchText, searchQuery]);

  const filteredStores = React.useMemo(() => {
    const query = searchText || searchQuery;
    return searchStores(query);
  }, [searchText, searchQuery]);

  const paginatedProducts = React.useMemo(() => {
    const endIndex = currentPage * PAGE_SIZE;
    return filteredProducts.slice(0, endIndex);
  }, [filteredProducts, currentPage]);

  const hasMore = paginatedProducts.length < filteredProducts.length;

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
    setLoadedBatches(1);
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
          {Array.from({ length: 2 }).map((_, index) => (
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
        <View style={styles.searchRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
          </TouchableOpacity>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.primaryLight || colors.surface }]}>
            <SearchNormal size={scale(20)} color={colors.primary} variant="Bold" />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('marketplace.searchPlaceholder') || 'Cari produk, brand, dan lainnya...'}
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchText.trim()) {
                  trackSearch(searchText.trim());
                  // @ts-ignore
                  navigation.push('MarketplaceSearchResults' as never, { query: searchText.trim() } as never);
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
                <CloseCircle size={scale(20)} color={colors.textSecondary} variant="Linear" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Cart' as never);
            }}
            style={styles.cartButton}
          >
            <ShoppingCart size={scale(24)} color={colors.text} variant="Linear" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Filter size={scale(20)} color={colors.text} variant="Linear" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'product' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('product')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'product' ? colors.primary : colors.textSecondary }]}>
            Produk
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'store' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('store')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'store' ? colors.primary : colors.textSecondary }]}>
            Toko
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      {(activeTab === 'product' ? filteredProducts.length : filteredStores.length) > 0 && (
        <View style={[styles.resultsCount, { paddingHorizontal: horizontalPadding }]}>
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {t('marketplace.found') || 'Ditemukan'} {activeTab === 'product' ? filteredProducts.length : filteredStores.length} {activeTab === 'product' ? (t('marketplace.products') || 'produk') : 'toko'}
          </Text>
        </View>
      )}

      {/* Product List */}
      {activeTab === 'product' ? (
        paginatedProducts.length === 0 && !refreshing && !isLoadingMore ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('marketplace.noProductsFound') || 'Tidak ada produk ditemukan.'}
            </Text>
          </View>
        ) : (
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
        )
      ) : (
        /* Store List */
        <FlatList
          data={filteredStores}
          renderItem={({ item }) => <StoreCard store={item} onPress={() => { }} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: moderateVerticalScale(16),
              paddingBottom: insets.bottom + moderateVerticalScale(16),
            },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Tidak ada toko ditemukan.
              </Text>
            </View>
          }
        />
      )}
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
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginTop: moderateVerticalScale(8),
  },
  backButton: {
    padding: scale(4),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    height: scale(44),
    borderRadius: scale(22),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontFamily: FontFamily.monasans.regular,
    fontSize: getResponsiveFontSize('medium'),
    paddingVertical: 0,
  },
  clearButton: {
    padding: scale(4),
  },
  cartButton: {
    padding: scale(8),
  },
  filterButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(8),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsCount: {
    paddingVertical: moderateVerticalScale(12),
  },
  countText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getHorizontalPadding(),
  },
  emptyText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: moderateVerticalScale(12),
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});