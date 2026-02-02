/**
 * SearchResultsScreen Component
 * Halaman hasil search untuk marketplace
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft2,
  Filter,
  SearchNormal,
  CloseCircle,
  ShoppingCart,
  TickCircle,
} from 'iconsax-react-nativejs';
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
import { useMarketplaceData, searchStores, getCategories } from '../../hooks/useMarketplaceData';
import { useMarketplaceAnalytics } from '../../hooks/useMarketplaceAnalytics';

const PAGE_SIZE = UI_CONSTANTS.DEFAULT_PAGE_SIZE;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterState {
  categories: string[];
  priceRange: { min: number; max: number } | null;
  minRating: number | null;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest';
}

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

  // Filter states
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: null,
    minRating: null,
    sortBy: 'relevance',
  });
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    setSearchText(searchQuery);
  }, [searchQuery]);

  // Bottom sheet animation
  useEffect(() => {
    if (showFilterSheet) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showFilterSheet, slideAnim]);

  const { products: allProducts } = useMarketplaceData(loadedBatches * 20, true, true);
  const categories = React.useMemo(() => getCategories(), []);

  const filteredProducts = React.useMemo(() => {
    const query = searchText || searchQuery;
    if (!query) return [];
    const lowerQuery = query.toLowerCase();

    let results = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category?.toLowerCase().includes(lowerQuery)
    );

    // Apply category filter
    if (filters.categories.length > 0) {
      results = results.filter((product) => filters.categories.includes(product.category || ''));
    }

    // Apply price range filter
    if (filters.priceRange) {
      results = results.filter(
        (product) =>
          product.price >= filters.priceRange!.min && product.price <= filters.priceRange!.max
      );
    }

    // Apply rating filter
    if (filters.minRating) {
      results = results.filter((product) => (product.rating || 0) >= filters.minRating!);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        // Assuming products have a createdAt or similar field
        // results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'relevance':
      default:
        // Keep original order (relevance)
        break;
    }

    return results;
  }, [allProducts, searchText, searchQuery, filters]);

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
      const neededBatches = Math.ceil(((currentPage + 1) * PAGE_SIZE) / 20);
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
    ({ item }: { item: Product }) => <ProductCard product={item} onPress={handleProductPress} />,
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

  // Filter handlers
  const handleOpenFilter = () => {
    setTempFilters(filters);
    setShowFilterSheet(true);
  };

  const handleCloseFilter = () => {
    setShowFilterSheet(false);
  };

  const handleApplyFilter = () => {
    setFilters(tempFilters);
    setCurrentPage(1);
    setShowFilterSheet(false);
  };

  const handleResetFilter = () => {
    const resetFilters: FilterState = {
      categories: [],
      priceRange: null,
      minRating: null,
      sortBy: 'relevance',
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setCurrentPage(1);
  };

  const toggleCategory = (category: string) => {
    setTempFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const setPriceRange = (min: number, max: number) => {
    setTempFilters((prev) => ({
      ...prev,
      priceRange: { min, max },
    }));
  };

  const setMinRating = (rating: number | null) => {
    setTempFilters((prev) => ({
      ...prev,
      minRating: rating,
    }));
  };

  const setSortBy = (sortBy: FilterState['sortBy']) => {
    setTempFilters((prev) => ({
      ...prev,
      sortBy,
    }));
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange !== null ||
    filters.minRating !== null ||
    filters.sortBy !== 'relevance';

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
          </TouchableOpacity>
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: colors.background || colors.surface },
            ]}
          >
            <SearchNormal size={scale(20)} color={colors.primary} variant="Linear" />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={
                t('marketplace.searchPlaceholder') || 'Cari produk, brand, dan lainnya...'
              }
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchText.trim()) {
                  trackSearch(searchText.trim());
                  // @ts-ignore
                  navigation.push(
                    'MarketplaceSearchResults' as never,
                    { query: searchText.trim() } as never
                  );
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
            onPress={handleOpenFilter}
            style={[
              styles.filterButton,
              {
                backgroundColor: hasActiveFilters ? colors.primary : colors.surface,
                borderColor: hasActiveFilters ? colors.primary : colors.border,
              },
            ]}
          >
            <Filter
              size={scale(20)}
              color={hasActiveFilters ? colors.surface : colors.text}
              variant="Linear"
            />
            {hasActiveFilters && (
              <View style={[styles.filterBadge, { backgroundColor: colors.error || '#FF3B30' }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Tabs */}
      <View
        style={[
          styles.tabsContainer,
          { borderBottomColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'product' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('product')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'product' ? colors.primary : colors.textSecondary },
            ]}
          >
            Produk
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'store' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('store')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'store' ? colors.primary : colors.textSecondary },
            ]}
          >
            Toko
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      {(activeTab === 'product' ? filteredProducts.length : filteredStores.length) > 0 && (
        <View style={[styles.resultsCount, { paddingHorizontal: horizontalPadding }]}>
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {t('marketplace.found') || 'Ditemukan'}{' '}
            {activeTab === 'product' ? filteredProducts.length : filteredStores.length}{' '}
            {activeTab === 'product' ? t('marketplace.products') || 'produk' : 'toko'}
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
            key="search-results-grid-2"
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
          renderItem={({ item }) => <StoreCard store={item} onPress={() => {}} />}
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
                {t('marketplace.noStoresFound') || 'Tidak ada toko ditemukan'}
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Bottom Sheet */}
      <Modal
        visible={showFilterSheet}
        transparent
        animationType="none"
        onRequestClose={handleCloseFilter}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseFilter}
          />
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                backgroundColor: colors.surface,
                transform: [{ translateY: slideAnim }],
                paddingBottom: insets.bottom,
              },
            ]}
          >
            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {t('marketplace.filterAndSort') || 'Filter & Urutkan'}
              </Text>
              <TouchableOpacity onPress={handleResetFilter} style={styles.resetButton}>
                <Text style={[styles.resetText, { color: colors.primary }]}>
                  {t('common.reset') || 'Reset'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
                  {t('marketplace.sort') || 'Urutkan'}
                </Text>
                <View style={styles.sortOptions}>
                  {[
                    { value: 'relevance', label: 'Paling Relevan' },
                    { value: 'price_low', label: 'Harga Terendah' },
                    { value: 'price_high', label: 'Harga Tertinggi' },
                    { value: 'rating', label: 'Rating Tertinggi' },
                    { value: 'newest', label: 'Terbaru' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.sortOption,
                        {
                          backgroundColor:
                            tempFilters.sortBy === option.value
                              ? colors.primaryLight || colors.surface
                              : colors.background,
                          borderColor:
                            tempFilters.sortBy === option.value ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSortBy(option.value as FilterState['sortBy'])}
                    >
                      <Text
                        style={[
                          styles.sortOptionText,
                          {
                            color:
                              tempFilters.sortBy === option.value ? colors.primary : colors.text,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                      {tempFilters.sortBy === option.value && (
                        <TickCircle size={scale(18)} color={colors.primary} variant="Bold" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
                  {t('marketplace.category') || 'Kategori'}
                </Text>
                <View style={styles.categoryGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: tempFilters.categories.includes(category)
                            ? colors.primary
                            : colors.background,
                          borderColor: tempFilters.categories.includes(category)
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          {
                            color: tempFilters.categories.includes(category)
                              ? colors.surface
                              : colors.text,
                          },
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
                  {t('marketplace.priceRange') || 'Rentang Harga'}
                </Text>
                <View style={styles.priceRangeOptions}>
                  {[
                    { min: 0, max: 50000, label: '< Rp 50.000' },
                    { min: 50000, max: 100000, label: 'Rp 50.000 - Rp 100.000' },
                    { min: 100000, max: 500000, label: 'Rp 100.000 - Rp 500.000' },
                    { min: 500000, max: 1000000, label: 'Rp 500.000 - Rp 1.000.000' },
                    { min: 1000000, max: 999999999, label: '> Rp 1.000.000' },
                  ].map((range) => {
                    const isSelected =
                      tempFilters.priceRange?.min === range.min &&
                      tempFilters.priceRange?.max === range.max;
                    return (
                      <TouchableOpacity
                        key={`${range.min}-${range.max}`}
                        style={[
                          styles.priceRangeOption,
                          {
                            backgroundColor: isSelected
                              ? colors.primaryLight || colors.surface
                              : colors.background,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setPriceRange(range.min, range.max)}
                      >
                        <Text
                          style={[
                            styles.priceRangeText,
                            { color: isSelected ? colors.primary : colors.text },
                          ]}
                        >
                          {range.label}
                        </Text>
                        {isSelected && (
                          <TickCircle size={scale(18)} color={colors.primary} variant="Bold" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
                  {t('marketplace.minRating') || 'Rating Minimum'}
                </Text>
                <View style={styles.ratingOptions}>
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => {
                    const isSelected = tempFilters.minRating === rating;
                    return (
                      <TouchableOpacity
                        key={rating}
                        style={[
                          styles.ratingOption,
                          {
                            backgroundColor: isSelected
                              ? colors.primaryLight || colors.surface
                              : colors.background,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setMinRating(rating)}
                      >
                        <Text
                          style={[
                            styles.ratingText,
                            { color: isSelected ? colors.primary : colors.text },
                          ]}
                        >
                          ⭐ {rating}+
                        </Text>
                        {isSelected && (
                          <TickCircle size={scale(18)} color={colors.primary} variant="Bold" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={handleApplyFilter}
              >
                <Text style={styles.applyButtonText}>
                  {t('marketplace.applyFilter') || 'Terapkan Filter'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  filterBadge: {
    position: 'absolute',
    top: scale(4),
    right: scale(4),
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: moderateVerticalScale(16),
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  resetButton: {
    padding: scale(4),
  },
  resetText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  sheetContent: {
    paddingHorizontal: getHorizontalPadding(),
    paddingTop: moderateVerticalScale(16),
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  filterSection: {
    marginBottom: moderateVerticalScale(24),
  },
  filterSectionTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(12),
  },
  sortOptions: {
    gap: scale(8),
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  categoryChip: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: scale(20),
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
  },
  priceRangeOptions: {
    gap: scale(8),
  },
  priceRangeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  priceRangeText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  ratingOptions: {
    gap: scale(8),
  },
  ratingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  ratingText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  sheetFooter: {
    paddingHorizontal: getHorizontalPadding(),
    paddingTop: moderateVerticalScale(16),
    borderTopWidth: 1,
  },
  applyButton: {
    paddingVertical: moderateVerticalScale(14),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
});
