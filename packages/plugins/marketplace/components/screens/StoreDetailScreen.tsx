/**
 * StoreDetailScreen Component
 * Display store profile and products
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft2, Location, Star1, SearchNormal, Copy } from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, getHorizontalPadding, FontFamily } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { Clipboard } from '@core/native';
import { ProductCard, Product } from '../shared/ProductCard';
import { ProductCardSkeleton } from '../shared/ProductCardSkeleton';
import { MarketplaceCategoryTabs } from '../shared/MarketplaceCategoryTabs';
import { useMarketplaceData, Store, getCategories } from '../../hooks/useMarketplaceData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type StoreDetailRouteParams = {
  StoreDetail: {
    store: Store;
  };
};

export const StoreDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<StoreDetailRouteParams, 'StoreDetail'>>();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const store = route.params?.store;
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const categories = useMemo(() => getCategories(), []);

  // Fetch all products and filter by store name
  // In a real app, we would fetch products by store ID from API
  const { products: allProducts, loading } = useMarketplaceData(100, true, true);

  const storeProducts = useMemo(() => {
    if (!store || !allProducts) return [];
    let products = allProducts.filter((p) => p.storeName === store.name);

    if (selectedCategory !== 'Semua') {
      products = products.filter((p) => p.category === selectedCategory);
    }

    if (searchText) {
      products = products.filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()));
    }

    return products;
  }, [store, allProducts, selectedCategory, searchText]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleProductPress = (product: Product) => {
    // @ts-ignore
    navigation.navigate('ProductDetail', { product });
  };

  const handleChat = async () => {
    if (store?.phoneNumber) {
      const url = `https://wa.me/${store.phoneNumber}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'WhatsApp not installed');
      }
    }
  };

  const handleCopyPhoneNumber = () => {
    if (store?.phoneNumber) {
      Clipboard.setString(store.phoneNumber);
      Alert.alert('Success', t('marketplace.phoneNumberCopied'));
    }
  };

  if (!store) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ color: colors.text }}>{t('marketplace.storeNotFound')}</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      <View style={[styles.storeProfileContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.profileContent}>
          <View style={styles.logoAndInfo}>
            <Image
              source={{ uri: store.imageUrl }}
              style={[styles.logoImage, { borderColor: colors.surface }]}
              resizeMode="cover"
            />
            <View style={styles.infoColumn}>
              <Text style={[styles.storeName, { color: colors.text }]} numberOfLines={1}>
                {store.name}
              </Text>
              <View style={styles.metaRow}>
                <Location size={scale(14)} color={colors.textSecondary} variant="Linear" />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {store.location}
                </Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Star1 size={scale(14)} color={colors.warning} variant="Bold" />
                <Text style={[styles.ratingText, { color: colors.text }]}>
                  {store.rating?.toFixed(1) || '4.5'}
                </Text>
              </View>
              {store.openingHours && (
                <Text
                  style={[styles.metaText, { color: colors.textSecondary, marginTop: scale(4) }]}
                >
                  {t('marketplace.openingHours')}: {store.openingHours}
                </Text>
              )}
              {store.phoneNumber && (
                <TouchableOpacity
                  style={[styles.copyContainer, { marginTop: scale(4) }]}
                  onPress={handleCopyPhoneNumber}
                >
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {store.phoneNumber}
                  </Text>
                  <View style={{ marginLeft: scale(4) }}>
                    <Copy size={scale(14)} color={colors.primary} variant="Bold" />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.chatButton, { borderColor: colors.border, flex: 1 }]}
              onPress={handleChat}
            >
              <Text style={[styles.chatButtonText, { color: colors.text }]}>
                {t('marketplace.chatWhatsApp')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: horizontalPadding, marginTop: moderateVerticalScale(16) }}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
          ]}
        >
          <SearchNormal size={scale(20)} color={colors.primary} variant="Linear" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('marketplace.searchPlaceholder') || 'Cari produk...'}
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
        </View>
      </View>

      <MarketplaceCategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={handleProductPress} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Navbar */}
      <View
        style={[
          styles.navbar,
          {
            backgroundColor: colors.surface,
            paddingTop: insets.top,
            paddingEnd: horizontalPadding,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={handleBack} style={styles.navButton}>
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]}>
          {t('marketplace.storeDetail')}
        </Text>
      </View>

      <FlatList
        key="store-products-grid-2"
        data={storeProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + moderateVerticalScale(20) },
        ]}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('marketplace.noProductsInStore')}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: moderateVerticalScale(12),
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    zIndex: 10,
  },
  navButton: {
    padding: scale(4),
  },
  navTitle: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.semiBold,
  },
  storeProfileContainer: {
    marginBottom: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(16),
  },
  bannerImage: {
    width: '100%',
    height: scale(120),
  },
  profileContent: {
    paddingHorizontal: getHorizontalPadding(),
    paddingTop: moderateVerticalScale(16),
  },
  logoAndInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: moderateVerticalScale(16),
  },
  logoImage: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    borderWidth: 3,
  },
  infoColumn: {
    flex: 1,
    marginLeft: scale(12),
    paddingBottom: scale(4),
  },
  storeName: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(4),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(2),
  },
  metaText: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.regular,
    marginLeft: scale(2),
  },
  ratingText: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
    marginLeft: scale(2),
  },
  divider: {
    width: 1,
    height: scale(10),
    marginHorizontal: scale(8),
  },
  followersText: {
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.regular,
    marginTop: scale(2),
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: moderateVerticalScale(8),
  },
  followButton: {
    flex: 1,
    paddingVertical: moderateVerticalScale(8),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.semiBold,
  },
  chatButton: {
    flex: 1,
    paddingVertical: moderateVerticalScale(8),
    borderRadius: scale(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
  },
  listContent: {
    flexGrow: 1,
  },
  columnWrapper: {
    gap: scale(12),
    paddingHorizontal: getHorizontalPadding(),
    marginBottom: scale(12),
  },
  loadingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: getHorizontalPadding(),
  },
  emptyContainer: {
    padding: scale(32),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    height: scale(44),
    borderRadius: scale(22),
    marginBottom: moderateVerticalScale(12),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.regular,
    paddingVertical: 0,
  },
});

export default StoreDetailScreen;
