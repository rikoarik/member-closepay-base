/**
 * ReferralBanner - Widget ajak teman / referral di Beranda
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { getResponsiveFontSize, FontFamily, moderateVerticalScale } from '@core/config';
import { useTranslation } from '@core/i18n';

export const ReferralBanner: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.successLight,
          borderColor: colors.success,
        },
      ]}
      onPress={() => {
        // TODO: Navigate to referral screen
      }}
      activeOpacity={0.8}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t('home.referralTitle') || 'Ajak Teman'}
      </Text>
      <Text style={[styles.desc, { color: colors.textSecondary }]}>
        {t('home.referralDesc') || 'Dapatkan reward saat teman mendaftar'}
      </Text>
    </TouchableOpacity>
  );
});

ReferralBanner.displayName = 'ReferralBanner';

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
