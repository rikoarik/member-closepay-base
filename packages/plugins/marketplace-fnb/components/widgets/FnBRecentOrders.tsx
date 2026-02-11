/**
 * FnBRecentOrders - Widget pesanan F&B terakhir di Beranda
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { getResponsiveFontSize, FontFamily, moderateVerticalScale } from '@core/config';
import { useTranslation } from '@core/i18n';

const MOCK_ORDERS = [
  { id: '1', store: 'Warung Makan Sederhana', date: 'Hari ini' },
  { id: '2', store: 'Kopi Kenangan', date: 'Kemarin' },
];

export const FnBRecentOrders: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.fnbRecentOrders') || 'Pesanan Terakhir'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('FnB' as never)}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            {t('common.viewAll') || 'Lihat Semua'}
          </Text>
        </TouchableOpacity>
      </View>
      {MOCK_ORDERS.map((o) => (
        <TouchableOpacity
          key={o.id}
          style={[styles.item, { borderColor: colors.border }]}
          onPress={() => navigation.navigate('FnB' as never)}
        >
          <Text style={[styles.storeName, { color: colors.text }]}>{o.store}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{o.date}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

FnBRecentOrders.displayName = 'FnBRecentOrders';

const styles = StyleSheet.create({
  container: {
    paddingVertical: moderateVerticalScale(16),
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: moderateVerticalScale(16),
    borderWidth: 1,
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
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  storeName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  date: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
});
