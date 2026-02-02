/**
 * ProductDetailScreen Component
 * Display product detail with add to cart functionality
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft2,
  Heart,
  ShoppingCart,
  Star1,
  Shop,
  Add,
  Minus,
  Bag2,
} from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, getHorizontalPadding, FontFamily } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useMarketplaceCart } from '../../hooks/useMarketplaceCart';
import { getAllStores } from '../../hooks/useMarketplaceData';
import type { Product } from '../shared/ProductCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ProductDetailRouteParams = {
  ProductDetail: {
    product: Product;
  };
};

const formatPrice = (price: number): string => {
  return `Rp ${price.toLocaleString('id-ID')}`;
};

export const ProductDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ProductDetailRouteParams, 'ProductDetail'>>();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const product = route.params?.product;
  const { addItem, getItemQuantity, itemCount, subtotal } = useMarketplaceCart();

  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;
  const cartIconRef = useRef<View>(null);
  const addToCartButtonRef = useRef<View>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: SCREEN_WIDTH - scale(50), y: scale(50) }); // Default heuristic

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const cartQuantity = product ? getItemQuantity(product.id) : 0;

  // Check if store is open
  const store = product?.storeName
    ? getAllStores().find((s) => s.name === product.storeName)
    : null;
  const isStoreOpen = store?.isOpen ?? true;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCartPress = useCallback(() => {
    // @ts-ignore
    navigation.navigate('Cart');
  }, [navigation]);

  const startAddToCartAnimation = useCallback(
    (callback: () => void) => {
      setIsAnimating(true);
      animValue.setValue(0);

      Animated.timing(animValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      }).start(() => {
        setIsAnimating(false);
        callback();
      });
    },
    [animValue]
  );

  const handleAddToCart = useCallback(() => {
    if (product && addToCartButtonRef.current) {
      // Measure button position for animation start
      addToCartButtonRef.current.measureInWindow((x, y, width, height) => {
        setStartPos({ x: x + width / 2, y: y });

        startAddToCartAnimation(() => {
          addItem(product, quantity);
          setQuantity(1);
        });
      });
    } else if (product) {
      // Fallback if measurement fails or not ready
      addItem(product, quantity);
      setQuantity(1);
    }
  }, [product, quantity, addItem, startAddToCartAnimation]);

  const handleBuyNow = useCallback(() => {
    if (product) {
      // @ts-ignore
      navigation.navigate('Checkout', { product, quantity });
    }
  }, [product, quantity, navigation]);

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }, []);

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>
          {t('marketplace.productNotFound') || 'Product not found'}
        </Text>
      </View>
    );
  }

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  // Interpolate animation values
  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, endPos.x - startPos.x],
  });

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, endPos.y - startPos.y],
  });

  const scaleAnim = animValue.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 0.2, 0.1],
  });

  const opacityAnim = animValue.interpolate({
    inputRange: [0, 0.9, 1],
    outputRange: [1, 0.5, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            paddingTop: insets.top + moderateVerticalScale(8),
            paddingHorizontal: horizontalPadding,
          },
        ]}
        onLayout={() => {
          // Try to get cart icon position relative to header
          // This is an approximation since measureInWindow is async and may vary
        }}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {t('marketplace.productDetail')}
        </Text>

        <TouchableOpacity
          ref={cartIconRef}
          style={styles.headerButton}
          onPress={handleCartPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onLayout={(event) => {
            // Capture approximate end position from layout event
            // For more precision we would use measureInWindow in a ref callback
            const { x, y, width, height } = event.nativeEvent.layout;
            // Since this is inside header which has padding, adjust manually or assume top right
          }}
        >
          <ShoppingCart size={scale(24)} color={colors.text} variant="Linear" />
          {itemCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.cartBadgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: imageError
                ? 'https://via.placeholder.com/400x400/CCCCCC/FFFFFF?text=Product'
                : product.imageUrl ||
                  'https://via.placeholder.com/400x400/CCCCCC/FFFFFF?text=Product',
            }}
            style={styles.productImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />

          {discountPercentage && (
            <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.discountText}>
                {discountPercentage}% {t('marketplace.off')}
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={[styles.infoContainer, { paddingHorizontal: horizontalPadding }]}>
          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {formatPrice(product.price)}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>

          {/* Product Name */}
          <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>

          {/* Rating & Sold */}
          <View style={styles.metaRow}>
            {product.rating !== undefined && (
              <View style={styles.ratingContainer}>
                <Star1 size={scale(16)} color={colors.warning} variant="Bold" />
                <Text style={[styles.ratingText, { color: colors.text }]}>
                  {product.rating.toFixed(1)}
                </Text>
              </View>
            )}
            {product.sold !== undefined && (
              <Text style={[styles.soldText, { color: colors.textSecondary }]}>
                {product.sold > 1000 ? `${(product.sold / 1000).toFixed(1)}rb` : product.sold}{' '}
                {t('marketplace.sold')}
              </Text>
            )}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Store Info */}
          {product.storeName && (
            <View style={styles.storeSection}>
              <View style={[styles.storeIcon, { backgroundColor: colors.primaryLight }]}>
                <Shop size={scale(20)} color={colors.primary} variant="Bold" />
              </View>
              <View style={styles.storeInfo}>
                <View style={styles.storeNameRow}>
                  <Text style={[styles.storeName, { color: colors.text }]}>
                    {product.storeName}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isStoreOpen ? colors.success + '20' : colors.error + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: isStoreOpen ? colors.success : colors.error },
                      ]}
                    >
                      {isStoreOpen
                        ? t('marketplace.storeOpen') || 'Buka'
                        : t('marketplace.storeClosed') || 'Tutup'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.storeLocation, { color: colors.textSecondary }]}>Jakarta</Text>
              </View>
            </View>
          )}

          {/* Store Closed Banner */}
          {!isStoreOpen && (
            <View
              style={[
                styles.closedBanner,
                { backgroundColor: colors.error + '15', borderColor: colors.error },
              ]}
            >
              <Text style={[styles.closedBannerText, { color: colors.error }]}>
                {t('marketplace.storeClosedMessage') ||
                  'Toko ini sedang tutup dan tidak dapat menerima pesanan saat ini.'}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('marketplace.description')}
            </Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              {product.description ||
                'Produk berkualitas tinggi dengan harga terjangkau. Cocok untuk kebutuhan sehari-hari Anda.'}
            </Text>
          </View>

          {/* Category */}
          {product.category && (
            <View style={styles.categorySection}>
              <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                {t('marketplace.category')}:
              </Text>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {product.category}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + moderateVerticalScale(12),
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: colors.primaryLight }]}
            onPress={decrementQuantity}
          >
            <Minus size={scale(18)} color={colors.primary} variant="Linear" />
          </TouchableOpacity>
          <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: colors.primaryLight }]}
            onPress={incrementQuantity}
          >
            <Add size={scale(18)} color={colors.primary} variant="Linear" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons Container */}
        <View style={styles.actionButtonsContainer}>
          {/* Add to Cart Button */}
          <TouchableOpacity
            ref={addToCartButtonRef}
            style={[
              styles.actionButton,
              styles.cartButtonOutline,
              {
                borderColor: isStoreOpen ? colors.primary : colors.border,
                opacity: isStoreOpen ? 1 : 0.5,
              },
            ]}
            onPress={handleAddToCart}
            activeOpacity={0.8}
            disabled={!isStoreOpen}
          >
            <ShoppingCart
              size={scale(20)}
              color={isStoreOpen ? colors.primary : colors.textSecondary}
              variant="Bold"
            />
          </TouchableOpacity>

          {/* Buy Now Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.buyButton,
              {
                backgroundColor: isStoreOpen ? colors.primary : colors.border,
              },
            ]}
            onPress={handleBuyNow}
            activeOpacity={0.8}
            disabled={!isStoreOpen}
          >
            <Text
              style={[
                styles.buyButtonText,
                { color: isStoreOpen ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {t('marketplace.buyNow')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Flying Item Animation Layer */}
      {isAnimating && (
        <Animated.View
          style={[
            styles.flyingItem,
            {
              top: startPos.y,
              left: startPos.x,
              transform: [{ translateX }, { translateY }, { scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Image
            source={{
              uri: imageError
                ? 'https://via.placeholder.com/400x400/CCCCCC/FFFFFF?text=Product'
                : product.imageUrl ||
                  'https://via.placeholder.com/400x400/CCCCCC/FFFFFF?text=Product',
            }}
            style={styles.flyingImage}
            resizeMode="cover"
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: moderateVerticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  headerButton: {
    padding: scale(4),
    position: 'relative',
  },
  headerTitle: {
    flex: 1,
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.semiBold,
    textAlign: 'center',
    marginHorizontal: scale(12),
  },
  cartBadge: {
    position: 'absolute',
    top: -scale(4),
    right: -scale(4),
    minWidth: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(4),
  },
  cartBadgeText: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: moderateVerticalScale(20),
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 1,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: scale(16),
    left: scale(16),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(8),
  },
  discountText: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  infoContainer: {
    paddingTop: moderateVerticalScale(16),
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: scale(8),
  },
  price: {
    fontSize: scale(24),
    fontFamily: FontFamily.monasans.bold,
  },
  originalPrice: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.regular,
    textDecorationLine: 'line-through',
  },
  productName: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.semiBold,
    lineHeight: scale(26),
    marginBottom: scale(12),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
    marginBottom: moderateVerticalScale(16),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  ratingText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.semiBold,
  },
  soldText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.regular,
  },
  divider: {
    height: 1,
    marginVertical: moderateVerticalScale(16),
  },
  storeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  storeIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: scale(15),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: scale(2),
  },
  storeLocation: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.regular,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(2),
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(8),
  },
  statusText: {
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.medium,
  },
  closedBanner: {
    marginTop: moderateVerticalScale(12),
    padding: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  closedBannerText: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.medium,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: moderateVerticalScale(16),
  },
  sectionTitle: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(8),
  },
  descriptionText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: scale(22),
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  categoryLabel: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.regular,
  },
  categoryBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(16),
  },
  categoryText: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.medium,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: moderateVerticalScale(12),
    gap: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  quantityButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
    minWidth: scale(24),
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: scale(8),
    marginLeft: scale(8),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateVerticalScale(10),
    borderRadius: scale(10),
  },
  cartButtonOutline: {
    flex: 0.4,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  addToCartText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  buyButton: {
    flex: 1,
  },
  buyButtonText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  flyingItem: {
    position: 'absolute',
    width: scale(40),
    height: scale(40),
    zIndex: 9999,
    borderRadius: scale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  flyingImage: {
    width: '100%',
    height: '100%',
  },
});

export default ProductDetailScreen;
