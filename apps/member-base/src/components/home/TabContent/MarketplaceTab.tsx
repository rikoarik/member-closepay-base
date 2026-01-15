import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, TextInput, TouchableOpacity, Text, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SearchNormal, CloseCircle } from 'iconsax-react-nativejs';
import { ProductCard, Product, ProductCardSkeleton } from '@plugins/marketplace';
import { StoreCard, Store } from '../stores/StoreCard';
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
import { useMarketplaceData, getCategories } from '@plugins/marketplace';
import { useStoreData } from '../hooks/useStoreData';
import { ScrollView } from 'react-native';

interface MarketplaceTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  onRefreshRequested?: (refreshFn: () => void) => void;
  scrollEnabled?: boolean;
  onScroll?: (event: any) => void;
}

const PAGE_SIZE = UI_CONSTANTS.DEFAULT_PAGE_SIZE;
const BATCH_SIZE = 10;

export const MarketplaceTab: React.FC<MarketplaceTabProps> = ({
  isActive = true,
  isVisible = true,
  onRefreshRequested,
  scrollEnabled = false,
  onScroll,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const horizontalPadding = getHorizontalPadding();
  const { width: screenWidth } = useDimensions();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadedBatches, setLoadedBatches] = useState<number>(1);
  const scrollPositionRef = useRef(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const categories = useMemo(() => getCategories(), []);

  const allProductsData = useMarketplaceData(loadedBatches * 20, isActive, isVisible);
  
  const bestSellerProducts = useMemo(() => {
    const products = [...allProductsData];
    return products
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 10);
  }, [allProductsData]);

  const nearbyStores = useStoreData(5);

  const processedProducts = useMemo(() => {
    if (!isActive && !isVisible) return [];

    let result = [...allProductsData];

    if (selectedCategory && selectedCategory !== 'Semua') {
      result = result.filter(item => item.category === selectedCategory);
    }

    return result;
  }, [allProductsData, selectedCategory, isActive, isVisible]);

  const paginatedProducts = useMemo(() => {
    if (!isActive && !isVisible) return [];
    const endIndex = currentPage * PAGE_SIZE;
    return processedProducts.slice(0, endIndex);
  }, [processedProducts, currentPage, isActive, isVisible]);

  const hasMore = paginatedProducts.length < processedProducts.length;

  useEffect(() => {
    if (refreshing || isInitialLoad) {
      const timer = setTimeout(() => {
        setShowShimmer(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowShimmer(false);
        setIsInitialLoad(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [refreshing, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !refreshing && isActive && !isInitialLoad && paginatedProducts.length > 0) {
      setIsLoadingMore(true);

      const neededBatches = Math.ceil((currentPage + 1) * PAGE_SIZE / BATCH_SIZE);
      if (neededBatches > loadedBatches) {
        setLoadedBatches(neededBatches);
      }

      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, hasMore, refreshing, isActive, isInitialLoad, paginatedProducts.length, currentPage, loadedBatches]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setLoadedBatches(1);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (onRefreshRequested) {
      onRefreshRequested(onRefresh);
    }
  }, [onRefreshRequested, onRefresh]);

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={(product) => {
        // @ts-ignore
        navigation.navigate('ProductDetail', { product });
      }}
    />
  ), [navigation]);

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

  const cardWidth = useMemo(() => {
    return (screenWidth - horizontalPadding * 2 - scale(12)) / 2;
  }, [screenWidth, horizontalPadding]);
  const numColumns = 2;

  if (!isActive && !isVisible) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Header - Clickable untuk navigate ke SearchScreen */}
      <View style={[styles.searchContainer, { paddingHorizontal: horizontalPadding }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.searchInputContainer, { backgroundColor: colors.primaryLight || colors.surface }]}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('Search' as never);
          }}
        >
          <SearchNormal size={scale(22)} color={colors.primary} variant="Linear" />
          <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
            {t('marketplace.searchPlaceholder')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={[styles.categoryContainer, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.categoryScrollContainer}>
          {categories.map((item) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isSelected ? colors.surface : colors.text,
                      fontFamily: isSelected ? FontFamily.monasans.semiBold : FontFamily.monasans.regular,
                    },
                  ]}
                >
                  {item === 'Semua' ? (t('marketplace.allCategories') || 'Semua') : item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Best Seller Products */}
      {bestSellerProducts.length > 0 && (
        <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('marketplace.bestSellers') || 'Produk Terlaris'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory('Semua');
              }}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                {t('common.viewAll') || 'Lihat Semua'}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalScroll, { paddingRight: horizontalPadding }]}
            nestedScrollEnabled={true}
          >
            {bestSellerProducts.map((product) => (
              <View key={product.id} style={[styles.horizontalCard, { width: cardWidth }]}>
                <ProductCard 
                  product={product} 
                  onPress={renderItem({ item: product }).props.onPress}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Nearby Stores */}
      {nearbyStores.length > 0 && (
        <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('marketplace.nearbyStores') || 'Toko Terdekat'}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                {t('common.viewAll') || 'Lihat Semua'}
              </Text>
            </TouchableOpacity>
          </View>
          {nearbyStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onPress={(store) => {
                // @ts-ignore
                navigation.navigate('StoreDetail', { store });
              }}
            />
          ))}
        </View>
      )}

      {/* Product Grid */}
      {showShimmer && (refreshing || isInitialLoad) && paginatedProducts.length === 0 ? (
        <View
          style={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + moderateVerticalScale(16),
              paddingHorizontal: horizontalPadding,
              paddingTop: moderateVerticalScale(16),
            },
          ]}
        >
          <View style={styles.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={`skeleton-${index}`} />
            ))}
          </View>
        </View>
      ) : scrollEnabled ? (
        <FlatList
          ref={flatListRef}
          data={showShimmer && (refreshing || isInitialLoad) ? [] : paginatedProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={{
            gap: scale(12),
          }}
          disableVirtualization={false}
          onScroll={(event) => {
            scrollPositionRef.current = event.nativeEvent.contentOffset.y;
            if (onScroll) {
              onScroll(event);
            }
          }}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + moderateVerticalScale(16),
              paddingHorizontal: horizontalPadding,
              paddingTop: moderateVerticalScale(16),
            },
          ]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          bounces={true}
          directionalLockEnabled={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onScrollBeginDrag={(e) => {
            if (Platform.OS === 'ios') {
              e.stopPropagation();
            }
          }}
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
          ListEmptyComponent={
            showShimmer && (refreshing || isInitialLoad) ? (
              <View style={styles.emptyContainer}>
                <View style={styles.grid}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ProductCardSkeleton key={`skeleton-loading-${index}`} />
                  ))}
                </View>
              </View>
            ) : paginatedProducts.length === 0 && !refreshing && !isLoadingMore && !isInitialLoad ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('marketplace.noProductsFound') || 'Tidak ada produk ditemukan.'}
                </Text>
              </View>
            ) : null
          }
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={100}
          windowSize={2}
          removeClippedSubviews={true}
        />
      ) : (
        <View
          style={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + moderateVerticalScale(16),
              paddingHorizontal: horizontalPadding,
              paddingTop: moderateVerticalScale(16),
            },
          ]}
        >
          {paginatedProducts.length === 0 && !refreshing && !isLoadingMore && !isInitialLoad ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('marketplace.noProductsFound') || 'Tidak ada produk ditemukan.'}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.grid}>
                {paginatedProducts.map((item) => renderItem({ item }))}
              </View>
              {isLoadingMore && hasMore && (
                <View style={styles.footerShimmer}>
                  {Array.from({ length: 2 }).map((_, index) => (
                    <ProductCardSkeleton key={`skeleton-footer-${index}`} />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  searchContainer: {
    paddingTop: moderateVerticalScale(8),
    paddingBottom: moderateVerticalScale(8),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    height: scale(48),
    borderRadius: scale(24),
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: scale(12),
    fontFamily: FontFamily.monasans.regular,
    fontSize: getResponsiveFontSize('medium'),
  },
  categoryContainer: {
    paddingBottom: moderateVerticalScale(8),
  },
  categoryScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: scale(8),
  },
  categoryPill: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: scale(20),
    borderWidth: 1,
    marginRight: scale(8),
  },
  categoryText: {
    fontSize: getResponsiveFontSize('small'),
  },
  scrollContent: {
    flexGrow: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: scale(12),
  },
  footerShimmer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: moderateVerticalScale(8),
  },
  emptyContainer: {
    paddingTop: moderateVerticalScale(32),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  placeholder: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  section: {
    marginTop: moderateVerticalScale(8),
    marginBottom: moderateVerticalScale(8),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: moderateVerticalScale(12),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  viewAllText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  horizontalScroll: {
    paddingRight: 0,
  },
  horizontalCard: {
    marginRight: scale(12),
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
});
