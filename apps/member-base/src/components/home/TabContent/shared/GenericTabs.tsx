/**
 * Generic Tabs Components
 * Placeholder components for remaining simple tabs
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@core/theme';
import {
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  moderateVerticalScale,
} from '@core/config';

const createGenericTab = (title: string, icon: string) => {
  const Component: React.FC<any> = ({ isActive = true }) => {
    const { colors } = useTheme();
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.background }}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <View style={{ padding: getHorizontalPadding(), alignItems: 'center', paddingTop: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>{icon}</Text>
          <Text
            style={{
              fontSize: getResponsiveFontSize('xlarge'),
              fontFamily: FontFamily.monasans.bold,
              color: colors.text,
              marginBottom: 8,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: getResponsiveFontSize('medium'),
              fontFamily: FontFamily.monasans.regular,
              color: colors.textSecondary,
              textAlign: 'center',
            }}
          >
            Fitur ini akan segera hadir.
          </Text>
        </View>
      </View>
    );
  };
  return React.memo(Component);
};

export const TransactionPaymentTab = createGenericTab('Transaksi Bayar', '🧾');
export const TransactionMarketplaceTab = createGenericTab('Transaksi Marketplace', '🛍️');
export const PromoTab = createGenericTab('Promo Spesial', '🎉');
export const RewardsTab = createGenericTab('Hadiah & Rewards', '🎁');
export const VoucherTab = createGenericTab('Voucher Saya', '🎟️');
export const CashbackTab = createGenericTab('Cashback', '💰');
export const ProfileTab = createGenericTab('Profil Saya', '👤');
export const SettingsTab = createGenericTab('Pengaturan', '⚙️');
export const AccountTab = createGenericTab('Akun Saya', '🛡️');
export const AnalyticsDashboardTab = createGenericTab('Dashboard Analitik', '📊');
export const ReportsTab = createGenericTab('Laporan', '📑');
export const StatisticsTab = createGenericTab('Statistik', '📈');
export const WithdrawTab = createGenericTab('Tarik Tunai', '🏧');
export const ScanQrTab = createGenericTab('Scan QR', '📷');
export const RequestMoneyTab = createGenericTab('Minta Uang', '👋');
export const SplitBillTab = createGenericTab('Patungan', '💸');

export const styles = StyleSheet.create({});
