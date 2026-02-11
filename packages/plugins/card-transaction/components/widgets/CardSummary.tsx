/**
 * CardSummary - Widget ringkasan kartu virtual di Beranda
 */
import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { getResponsiveFontSize, FontFamily, moderateVerticalScale } from '@core/config';
import { useTranslation } from '@core/i18n';

interface CardSummaryProps {
  isActive?: boolean;
  isVisible?: boolean;
}

export const CardSummary: React.FC<CardSummaryProps> = React.memo(
  ({ isActive = true, isVisible = true }) => {
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
        onPress={() => navigation.navigate('VirtualCard' as never)}
        activeOpacity={0.8}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.cardSummary') || 'Kartu Virtual'}
        </Text>
        <Text style={[styles.balance, { color: colors.primary }]}>Rp ••••••••</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {t('home.cardSummaryHint') || 'Ketuk untuk lihat detail'}
        </Text>
      </TouchableOpacity>
    );
  }
);

CardSummary.displayName = 'CardSummary';

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
    marginBottom: 4,
  },
  balance: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: 4,
  },
  hint: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
});
