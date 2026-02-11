/**
 * MarketplaceBalanceTab Component
 * Tab untuk saldo khusus marketplace
 */
import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';

interface MarketplaceBalanceTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const MarketplaceBalanceTab: React.FC<MarketplaceBalanceTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <View style={{ padding: getHorizontalPadding() }}>
          <Text style={[styles.header, { color: colors.text }]}>Saldo Mitra</Text>

          <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.balanceLabel}>Saldo Tersedia</Text>
            <Text style={styles.balanceAmount}>Rp 2.500.000</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>+ Top Up</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>↗ Transfer</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Riwayat Saldo</Text>
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🧾</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Belum ada riwayat transaksi saldo
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

MarketplaceBalanceTab.displayName = 'MarketplaceBalanceTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  balanceCard: {
    padding: moderateVerticalScale(24),
    borderRadius: 16,
    marginBottom: moderateVerticalScale(24),
  },
  balanceLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: getResponsiveFontSize('xxlarge'),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.monasans.semiBold,
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
});
