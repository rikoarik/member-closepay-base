/**
 * ActivitySummary - Widget ringkasan aktivitas di Beranda
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { getResponsiveFontSize, FontFamily, moderateVerticalScale } from '@core/config';
import { useTranslation } from '@core/i18n';

export const ActivitySummary: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => navigation.navigate('TransactionHistory' as never)}
      activeOpacity={0.8}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t('home.activitySummary') || 'Ringkasan Aktivitas'}
      </Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.primary }]}>3</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('home.transactionsToday') || 'Transaksi hari ini'}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.success }]}>Rp 1,5jt</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('home.incomeToday') || 'Pemasukan hari ini'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

ActivitySummary.displayName = 'ActivitySummary';

const styles = StyleSheet.create({
  container: {
    paddingVertical: moderateVerticalScale(16),
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: moderateVerticalScale(16),
    borderWidth: 1,
  },
  title: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  row: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
});
