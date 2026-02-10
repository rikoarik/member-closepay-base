/**
 * GreetingCard - Widget sapaan di Beranda
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@core/theme';
import { useAuth } from '@core/auth';
import { getResponsiveFontSize, FontFamily, moderateVerticalScale } from '@core/config';
import { useTranslation } from '@core/i18n';

export const GreetingCard: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();

  const name = user?.name?.split(' ')[0] || 'Member';
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t('home.greetingMorning') || 'Selamat pagi'
      : hour < 18
        ? t('home.greetingAfternoon') || 'Selamat siang'
        : t('home.greetingEvening') || 'Selamat malam';

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryLight }]}>
      <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
      <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
    </View>
  );
});

GreetingCard.displayName = 'GreetingCard';

const styles = StyleSheet.create({
  container: {
    paddingVertical: moderateVerticalScale(16),
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: moderateVerticalScale(16),
  },
  greeting: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: 4,
  },
  name: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
  },
});
