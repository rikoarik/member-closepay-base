/**
 * VoucherAvailable - Widget voucher tersedia di Beranda
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { getResponsiveFontSize, FontFamily, moderateVerticalScale } from '@core/config';
import { useTranslation } from '@core/i18n';

const MOCK_VOUCHERS = [
  { id: '1', title: 'Diskon 10%', desc: 'Min. belanja Rp 50.000' },
  { id: '2', title: 'Gratis ongkir', desc: 'Max. Rp 15.000' },
];

export const VoucherAvailable: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <View style={[styles.section, { marginBottom: moderateVerticalScale(16) }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.voucherAvailable') || 'Voucher Tersedia'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Marketplace' as never)}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            {t('common.viewAll') || 'Lihat Semua'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_VOUCHERS.map((v) => (
          <TouchableOpacity
            key={v.id}
            style={[
              styles.card,
              { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => navigation.navigate('Marketplace' as never)}
          >
            <Text style={[styles.cardTitle, { color: colors.primary }]}>{v.title}</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{v.desc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

VoucherAvailable.displayName = 'VoucherAvailable';

const styles = StyleSheet.create({
  section: {},
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
  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    minWidth: 140,
  },
  cardTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
});
