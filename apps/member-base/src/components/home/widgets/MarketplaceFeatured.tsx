/**
 * MarketplaceFeatured - Widget produk unggulan di Beranda
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import {
  getResponsiveFontSize,
  FontFamily,
  moderateVerticalScale,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';
import { ProductCard, Product, useMarketplaceData } from '@plugins/marketplace';

interface MarketplaceFeaturedProps {
  isActive?: boolean;
  isVisible?: boolean;
}

export const MarketplaceFeatured: React.FC<MarketplaceFeaturedProps> = React.memo(
  ({ isActive = true, isVisible = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { products } = useMarketplaceData(8, isActive, isVisible);

    const bestSellers = useMemo(() => {
      return [...products]
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 4);
    }, [products]);

    const handleProductPress = (product: Product) => {
      navigation.navigate('ProductDetail' as never, {
        productId: product.id,
        productName: product.name,
      });
    };

    if (bestSellers.length === 0) return null;

    return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.marketplaceFeatured') || 'Produk Unggulan'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Marketplace' as never)}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            {t('common.viewAll') || 'Lihat Semua'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {bestSellers.map((product) => (
          <View key={product.id} style={styles.cardWrapper}>
            <ProductCard
              product={product}
              onPress={handleProductPress}
              width={scale(160)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
    );
  }
);

MarketplaceFeatured.displayName = 'MarketplaceFeatured';

const styles = StyleSheet.create({
  section: {
    marginBottom: moderateVerticalScale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  seeAll: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  list: {
    gap: 12,
  },
  cardWrapper: {
    width: scale(160),
    marginRight: 12,
  },
});
