/**
 * PromoBanner - Widget promo/banner di Beranda
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { getResponsiveFontSize, FontFamily, moderateVerticalScale } from '@core/config';
import { useTranslation } from '@core/i18n';

export const PromoBanner: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
      ]}
      onPress={() => navigation.navigate('Marketplace' as never)}
      activeOpacity={0.8}
    >
      <Text style={[styles.title, { color: colors.surface }]}>
        {t('home.promoTitle') || 'Promo Spesial'}
      </Text>
      <Text style={[styles.desc, { color: colors.surface }]}>
        {t('home.promoDesc') || 'Lihat penawaran terbaik untuk Anda'}
      </Text>
    </TouchableOpacity>
  );
});

PromoBanner.displayName = 'PromoBanner';

const styles = StyleSheet.create({
  container: {
    paddingVertical: moderateVerticalScale(16),
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: moderateVerticalScale(16),
    borderWidth: 1,
  },
  title: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: 4,
  },
  desc: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
});
