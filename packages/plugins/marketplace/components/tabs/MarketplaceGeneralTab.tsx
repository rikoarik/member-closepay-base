/**
 * MarketplaceGeneralTab Component
 * Tab utama untuk belanja di marketplace
 */
import React from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';

interface MarketplaceGeneralTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const MarketplaceGeneralTab: React.FC<MarketplaceGeneralTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const categories = [
      { id: 1, name: 'Fashion', icon: '👕' },
      { id: 2, name: 'Elektronik', icon: '📱' },
      { id: 3, name: 'Kecantikan', icon: '💄' },
      { id: 4, name: 'Hobi', icon: '🎮' },
      { id: 5, name: 'Rumah', icon: '🏠' },
    ];

    const products = [
      {
        id: 1,
        name: 'Kemeja Flannel Checkered',
        price: 199000,
        rating: 4.8,
        sold: 120,
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 2,
        name: 'Wireless Earbuds Pro',
        price: 450000,
        rating: 4.9,
        sold: 85,
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 3,
        name: 'Skincare Basic Set',
        price: 299000,
        rating: 4.7,
        sold: 210,
        image: 'https://via.placeholder.com/150',
      },
      {
        id: 4,
        name: 'Gaming Mouse RGB',
        price: 350000,
        rating: 4.6,
        sold: 50,
        image: 'https://via.placeholder.com/150',
      },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <View style={[styles.promoBanner, { backgroundColor: colors.primary }]}>
              <Text style={styles.promoText}>Diskon s/d 50%!</Text>
              <Text style={styles.promoSubtext}>Spesial Hari Ini</Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories.map((cat) => (
                <View key={cat.id} style={styles.catItem}>
                  <View style={[styles.catIcon, { backgroundColor: colors.surface }]}>
                    <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                  </View>
                  <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                </View>
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
              Rekomendasi
            </Text>
            <View style={styles.productGrid}>
              {products.map((prod) => (
                <TouchableOpacity
                  key={prod.id}
                  style={[styles.productCard, { backgroundColor: colors.surface }]}
                >
                  <View style={[styles.productImage, { backgroundColor: '#E5E7EB' }]} />
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                      {prod.name}
                    </Text>
                    <Text style={[styles.productPrice, { color: colors.primary }]}>
                      Rp {prod.price.toLocaleString('id-ID')}
                    </Text>
                    <View style={styles.productMeta}>
                      <Text style={[styles.productRating, { color: colors.textSecondary }]}>
                        ★ {prod.rating}
                      </Text>
                      <Text style={[styles.productSold, { color: colors.textSecondary }]}>
                        {prod.sold} terjual
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
);

MarketplaceGeneralTab.displayName = 'MarketplaceGeneralTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  promoBanner: {
    padding: moderateVerticalScale(24),
    borderRadius: 16,
    marginBottom: moderateVerticalScale(24),
    marginTop: moderateVerticalScale(8),
  },
  promoText: {
    fontSize: getResponsiveFontSize('xxlarge'),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  promoSubtext: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  catScroll: {
    marginHorizontal: -getHorizontalPadding(),
    paddingHorizontal: getHorizontalPadding(),
  },
  catItem: { alignItems: 'center', marginRight: scale(16) },
  catIcon: {
    width: scale(64),
    height: scale(64),
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  catName: { fontSize: getResponsiveFontSize('small'), fontFamily: FontFamily.monasans.medium },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  productImage: { height: 150, width: '100%' },
  productInfo: { padding: 12 },
  productName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: 4,
  },
  productMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  productRating: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  productSold: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
});
