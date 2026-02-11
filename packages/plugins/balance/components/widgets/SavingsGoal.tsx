/**
 * SavingsGoal - Widget target menabung di Beranda
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { getResponsiveFontSize, FontFamily, moderateVerticalScale } from '@core/config';
import { useTranslation } from '@core/i18n';

const TARGET = 5000000;
const CURRENT = 2500000;
const PROGRESS = (CURRENT / TARGET) * 100;

interface SavingsGoalProps {
  isActive?: boolean;
  isVisible?: boolean;
}

export const SavingsGoal: React.FC<SavingsGoalProps> = React.memo(
  ({ isActive = true, isVisible = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();

    return (
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={() => navigation.navigate('TransactionHistory' as never)}
        activeOpacity={0.8}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.savingsGoal') || 'Target Menabung'}
        </Text>
        <View style={[styles.barBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(PROGRESS, 100)}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Rp {CURRENT.toLocaleString('id-ID')}
          </Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Rp {TARGET.toLocaleString('id-ID')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

SavingsGoal.displayName = 'SavingsGoal';

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
    marginBottom: 12,
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
});
