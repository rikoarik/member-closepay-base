/**
 * MarketplaceExploreScreen Component
 * Tab Explore: grid produk, kategori, best sellers, toko terdekat
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SearchNormal, ShoppingCart, ArrowLeft2 } from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, getHorizontalPadding, FontFamily } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ProductCard, Product } from '../shared/ProductCard';
import { ProductCardSkeleton } from '../shared/ProductCardSkeleton';
import { CartBar } from '../shared/CartBar';
import { StoreCard } from '../shared/StoreCard';
import { MarketplaceCategoryTabs } from '../shared/MarketplaceCategoryTabs';
import { useMarketplaceData, getCategories, getAllStores } from '../../hooks/useMarketplaceData';
import { useMarketplaceAnalytics } from '../../hooks/useMarketplaceAnalytics';
import { useMarketplaceCart } from '../../hooks/useMarketplaceCart';
import { useTabBar } from '../navigation/TabBarContext';

const PAGE_SIZE = 20;

export const MarketplaceExploreScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const { trackViewProduct } = useMarketplaceAnalytics();

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadedBatches, setLoadedBatches] = useState<number>(2);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const { toggleTabBar } = useTabBar();
  const lastContentOffset = React.useRef(0);

  const { itemCount, subtotal, getItemQuantity } = useMarketplaceCart();

  const { products: allProducts, loading: isInitialLoading } = useMarketplaceData(
    loadedBatches * 20,
    true,
    true
  );
  const stores = React.useMemo(() => getAllStores().slice(0, 3), []);
  const categories = React.useMemo(() => getCategories(), []);

  const bestSellerProducts = React.useMemo(() => {
    return [...allProducts].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 6);
  }, [allProducts]);

  const filteredProducts = React.useMemo(() => {
    let products = allProducts;
    if (selectedCategory !== 'Semua') {
      products = products.filter((p) => p.category === selectedCategory);
    }
    const endIndex = currentPage * PAGE_SIZE;
    return products.slice(0, endIndex);
  }, [allProducts, selectedCategory, currentPage]);

  const hasMore =
    filteredProducts.length <
    (selectedCategory === 'Semua'
      ? allProducts.length
      : allProducts.filter((p) => p.category === selectedCategory).length);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

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
    setLoadedBatches(2);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleProductPress = useCallback(
    (product: Product) => {
      if (product.category) {
        trackViewProduct(product.category);
      }
      // @ts-ignore
      navigation.navigate('ProductDetail', { product });
    },
    [navigation, trackViewProduct]
  );

  const handleCartPress = useCallback(() => {
    // @ts-ignore
    navigation.navigate('Cart' as never);
  }, [navigation]);

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const diff = currentOffset - lastContentOffset.current;
      if (Math.abs(diff) > 3) {
        if (diff > 0 && currentOffset > 20) {
          toggleTabBar(false);
        } else {
          toggleTabBar(true);
        }
      }
      lastContentOffset.current = currentOffset;
    },
    [toggleTabBar]
  );

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

  const renderEmptyComponent = () => {
    if (isInitialLoading) {
      return (
        <View style={styles.loadingContainer}>
          {Array.from({ length: 6 }, (_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} />
          ))}
        </View>
      );
    }
    if (filteredProducts.length === 0 && !refreshing) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('marketplace.noProductsFound') || 'Tidak ada produk ditemukan.'}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderHeader = () => (
    <View>
      <MarketplaceCategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {selectedCategory === 'Semua' && bestSellerProducts.length > 0 && (
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { paddingHorizontal: horizontalPadding }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('marketplace.bestSellers')}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: horizontalPadding,
              paddingRight: horizontalPadding,
              gap: scale(12),
            }}
          >
            {bestSellerProducts.map((product) => (
              <View key={product.id} style={{ width: scale(160), marginRight: scale(12) }}>
                <ProductCard product={product} onPress={handleProductPress} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedCategory === 'Semua' && stores.length > 0 && (
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { paddingHorizontal: horizontalPadding }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('marketplace.nearbyStores')}
            </Text>
          </View>
          <View style={{ paddingHorizontal: horizontalPadding }}>
            {stores.map((store) => (
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
        </View>
      )}

      <View
        style={[
          styles.sectionHeader,
          { paddingHorizontal: horizontalPadding, marginTop: moderateVerticalScale(16) },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {selectedCategory === 'Semua'
            ? t('marketplace.recommendations')
            : t('marketplace.productsForCategory', { category: selectedCategory })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.background || colors.surface }]}
          activeOpacity={0.7}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('MarketplaceSearch');
          }}
        >
          <SearchNormal size={scale(20)} color={colors.primary} variant="Linear" />
          <Text numberOfLines={1} style={[styles.searchInput, { color: colors.textSecondary }]}>
            {t('marketplace.searchPlaceholder') || 'Cari produk...'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cartButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={handleCartPress}
        >
          <ShoppingCart size={scale(20)} color={colors.text} variant="Linear" />
          {itemCount > 0 && (
            <View
              style={[
                styles.badgeContainer,
                { backgroundColor: colors.error, borderColor: colors.surface },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.surface }]}>
                {itemCount > 99 ? '99+' : itemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        key="marketplace-grid-2"
        data={filteredProducts}
        ListHeaderComponent={renderHeader}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: insets.bottom + moderateVerticalScale(80),
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
        ListEmptyComponent={renderEmptyComponent}
        keyboardShouldPersistTaps="handled"
      />

      <CartBar
        itemCount={itemCount}
        total={subtotal}
        onPress={handleCartPress}
        visible={itemCount > 0}
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
    gap: scale(12),
  },
  searchBar: {
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
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.regular,
    paddingVertical: 0,
  },
  section: {
    marginVertical: moderateVerticalScale(12),
  },
  sectionHeader: {
    marginBottom: moderateVerticalScale(12),
  },
  sectionTitle: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
  },
  cartButton: {
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
  badgeContainer: {
    position: 'absolute',
    top: -scale(6),
    right: -scale(6),
    minWidth: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(4),
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
    lineHeight: scale(12),
  },
  columnWrapper: {
    gap: scale(12),
    paddingHorizontal: getHorizontalPadding(),
  },
  footerShimmer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: moderateVerticalScale(8),
    paddingHorizontal: getHorizontalPadding(),
  },
  loadingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: getHorizontalPadding(),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(40),
  },
  emptyText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
});
