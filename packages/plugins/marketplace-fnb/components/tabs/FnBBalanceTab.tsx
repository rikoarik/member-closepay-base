/**
 * FnBBalanceTab Component
 * Tab saldo khusus F&B (vouchers/deposit)
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
} from '@core/config';
import { useTranslation } from '@core/i18n';

interface FnBBalanceTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const FnBBalanceTab: React.FC<FnBBalanceTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <View style={{ padding: getHorizontalPadding() }}>
          <Text style={[styles.header, { color: colors.text }]}>Saldo F&B</Text>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Voucher Makan</Text>
            <Text style={[styles.amount, { color: colors.text }]}>Rp 1.500.000</Text>
            <Text style={[styles.expiry, { color: colors.textSecondary }]}>
              Berlaku s/d 31 Des 2024
            </Text>

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
              <Text style={styles.btnText}>Riwayat Pemakaian</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, marginTop: 16 }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Poin Rewards</Text>
            <Text style={[styles.amount, { color: colors.text }]}>2.450 Poin</Text>
            <Text style={[styles.expiry, { color: colors.textSecondary }]}>Setara Rp 24.500</Text>

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
              <Text style={styles.btnText}>Tukar Poin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
);

FnBBalanceTab.displayName = 'FnBBalanceTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  card: { padding: 20, borderRadius: 16 },
  label: {
    fontFamily: FontFamily.monasans.medium,
    fontSize: getResponsiveFontSize('medium'),
    marginBottom: 8,
  },
  amount: { fontFamily: FontFamily.monasans.bold, fontSize: 32, marginBottom: 4 },
  expiry: {
    fontFamily: FontFamily.monasans.regular,
    fontSize: getResponsiveFontSize('small'),
    marginBottom: 20,
  },
  button: { padding: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontFamily: FontFamily.monasans.semiBold },
});
