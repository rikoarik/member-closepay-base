/**
 * RewardsPoints - Widget poin rewards di Beranda
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { getResponsiveFontSize, FontFamily, moderateVerticalScale } from '@core/config';
import { useTranslation } from '@core/i18n';

const MOCK_POINTS = 1250;

export const RewardsPoints: React.FC = React.memo(() => {
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
      onPress={() => navigation.navigate('Marketplace' as never)}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: colors.warningLight }]}>
          <Text style={styles.icon}>★</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('home.rewardsPoints') || 'Poin Rewards'}
          </Text>
          <Text style={[styles.points, { color: colors.warning }]}>
            {MOCK_POINTS.toLocaleString('id-ID')} {t('home.points') || 'poin'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

RewardsPoints.displayName = 'RewardsPoints';

const styles = StyleSheet.create({
  container: {
    paddingVertical: moderateVerticalScale(16),
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: moderateVerticalScale(16),
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    color: '#F59E0B',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: 2,
  },
  points: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
});
