import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  scale,
  moderateVerticalScale,
  getResponsiveFontSize,
  FontFamily,
  getHorizontalPadding,
  useDimensions,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  rating?: number;
  sold?: number;
  category?: string;
  discount?: number;
  storeName?: string;
  description?: string;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
}

const PLACEHOLDER_IMAGE =
  'https://via.placeholder.com/200x200/CCCCCC/FFFFFF?text=Product';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth } = useDimensions();
  const [imageError, setImageError] = useState(false);
  const horizontalPadding = getHorizontalPadding();

  const cardWidth = (screenWidth - horizontalPadding * 2 - scale(12)) / 2;

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
      : null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: cardWidth,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress?.(product)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: imageError
              ? PLACEHOLDER_IMAGE
              : product.imageUrl || PLACEHOLDER_IMAGE,
          }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />

        {discountPercentage && (
          <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
            <Text style={[styles.discountText, { color: colors.surface }]}>
              {discountPercentage}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {product.name}
        </Text>

        <Text style={[styles.price, { color: colors.primary }]}>
          {formatCurrency(product.price)}
        </Text>

        {product.originalPrice && product.originalPrice > product.price && (
          <Text style={[styles.promoText, { color: colors.error }]}>
            {t('marketplace.save')} {discountPercentage}% · {formatCurrency(product.originalPrice)}
          </Text>
        )}

        {(product.rating !== undefined || product.sold !== undefined) && (
          <View style={styles.footer}>
            {product.rating !== undefined && (
              <View style={styles.ratingContainer}>
                <Text style={[styles.starIcon, { color: colors.warning }]}>★</Text>
                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                  {product.rating.toFixed(1)}
                </Text>
              </View>
            )}

            {product.sold !== undefined && (
              <Text style={[styles.soldText, { color: colors.textSecondary }]}>
                ·{' '}
                {product.sold > 1000
                  ? `${(product.sold / 1000).toFixed(1)}rb`
                  : product.sold}{' '}
                {t('marketplace.sold') || 'terjual'}
              </Text>
            )}
          </View>
        )}

        {product.storeName && (
          <Text
            style={[styles.storeName, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {product.storeName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const ProductCard = React.memo(ProductCardComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(10),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
    overflow: 'hidden',
    minHeight: moderateVerticalScale(190),
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: scale(8),
    left: scale(8),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(6),
    elevation: 3,
  },
  discountText: {
    fontSize: getResponsiveFontSize('xsmall'),
    fontFamily: FontFamily.monasans.bold,
  },
  content: {
    flex: 1,
    padding: scale(10),
    justifyContent: 'space-between',
  },
  name: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    lineHeight: getResponsiveFontSize('small') * 1.2,
  },
  price: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
  promoText: {
    fontSize: getResponsiveFontSize('xsmall'),
    fontFamily: FontFamily.monasans.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
  },
  starIcon: {
    fontSize: getResponsiveFontSize('small'),
  },
  ratingText: {
    fontSize: getResponsiveFontSize('xxxsmall'),
    fontFamily: FontFamily.monasans.medium,
  },
  soldText: {
    fontSize: getResponsiveFontSize('xxxsmall'),
    fontFamily: FontFamily.monasans.regular,
  },
  storeName: {
    fontSize: getResponsiveFontSize('xxxsmall'),
    fontFamily: FontFamily.monasans.regular,
    opacity: 0.8,
  },
});