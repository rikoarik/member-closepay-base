/**
 * FnBOrderTab Component
 * Tab untuk pesan makanan
 */
import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';

interface FnBOrderTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const FnBOrderTab: React.FC<FnBOrderTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const popularItems = [
      { id: 1, name: 'Nasi Goreng Spesial', price: 35000, image: '🍽️' },
      { id: 2, name: 'Ayam Bakar Madu', price: 42000, image: '🍗' },
      { id: 3, name: 'Es Kopi Susu', price: 18000, image: '☕' },
      { id: 4, name: 'Mie Ayam Bakso', price: 25000, image: '🍜' },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
              <Text style={styles.headerTitle}>Lapar?</Text>
              <Text style={styles.headerSubtitle}>Pesan makanan favoritmu sekarang</Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Menu Populer</Text>
            <View style={styles.grid}>
              {popularItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.imagePlaceholder}>
                    <Text style={{ fontSize: 40 }}>{item.image}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.itemPrice, { color: colors.primary }]}>
                      Rp {item.price.toLocaleString('id-ID')}
                    </Text>
                    <TouchableOpacity
                      style={[styles.addButton, { backgroundColor: colors.primary }]}
                    >
                      <Text style={styles.addText}>+ Tambah</Text>
                    </TouchableOpacity>
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

FnBOrderTab.displayName = 'FnBOrderTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  header: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
  },
  imagePlaceholder: {
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { alignItems: 'flex-start' },
  itemName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: 8,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  addText: {
    color: '#FFFFFF',
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});
