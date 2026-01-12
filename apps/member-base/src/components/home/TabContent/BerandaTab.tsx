/**
 * BerandaTab Component
 * Tab beranda dengan quick access buttons dan konten beranda
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  scale,
  FontFamily,
  getResponsiveFontSize,
  QrScanIcon,
} from '@core/config';
import { QuickAccessButtons } from '../quick-actions/QuickAccessButtons';
import { BalanceCard } from '@plugins/balance/components/BalanceCard';
import { TransactionHistoryScreen } from '@plugins/balance';
import { useTranslation } from '@core/i18n';
import { BerandaNewsInfo, type BerandaNewsInfoProps } from './BerandaNewsInfo';
import { RecentTransactions, type RecentTransactionsProps } from './RecentTransactions';

interface BerandaTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  /**
   * Callback untuk navigasi ke NewsTab saat "Lihat Semua" diklik
   */
  onNavigateToNews?: () => void;
  /**
   * Props untuk BerandaNewsInfo component
   * Semua props news info di-forward ke BerandaNewsInfo
   */
  newsInfoProps?: Omit<BerandaNewsInfoProps, 'onViewAllPress'>;
  /**
   * Props untuk RecentTransactions component
   * Semua props recent transactions di-forward ke RecentTransactions
   */
  recentTransactionsProps?: Omit<RecentTransactionsProps, 'onViewAllPress'>;
}

export const BerandaTab: React.FC<BerandaTabProps> = React.memo(({
  isActive = true,
  isVisible = true,
  onNavigateToNews,
  newsInfoProps,
  recentTransactionsProps,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();
  const { t } = useTranslation();

  // State untuk toggle show/hide saldo (balance)
  // Default: hidden (false)
  const [showBalance, setShowBalance] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const refreshNewsInfoRef = React.useRef<(() => void) | null>(null);
  const refreshRecentTransactionsRef = React.useRef<(() => void) | null>(null);

  // Handler untuk refresh BerandaNewsInfo dan RecentTransactions
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Trigger refresh di BerandaNewsInfo jika ada
      if (refreshNewsInfoRef.current) {
        refreshNewsInfoRef.current();
      }
      // Trigger refresh di RecentTransactions jika ada
      if (refreshRecentTransactionsRef.current) {
        refreshRecentTransactionsRef.current();
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      // Simulate refresh delay
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }
  }, []);

  // Handler untuk receive refresh function dari BerandaNewsInfo
  const handleNewsRefreshRequested = useCallback((refreshFn: () => void) => {
    refreshNewsInfoRef.current = refreshFn;
  }, []);

  // Handler untuk receive refresh function dari RecentTransactions
  const handleTransactionsRefreshRequested = useCallback((refreshFn: () => void) => {
    refreshRecentTransactionsRef.current = refreshFn;
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: insets.bottom + moderateVerticalScale(24),
          paddingHorizontal: horizontalPadding,
          paddingTop: moderateVerticalScale(16),
        }
      ]}
      pointerEvents={isActive ? 'auto' : 'none'}
    >
      {/**
        * Toggle show/hide saldo (balance)
        */}
      <BalanceCard
        title="Balance"
        balance={10000000000}
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(v => !v)}
      />
      {/* Quick Access Buttons */}
      <View style={styles.menuItem}>
        <Text style={styles.menuItemTitle}>{t('home.quickAccess')}</Text>
        <QuickAccessButtons />
      </View>

      {/* Recent Transactions - Komponen terpisah untuk reusability */}
      {/* <RecentTransactions
        {...recentTransactionsProps}
        onRefreshRequested={handleTransactionsRefreshRequested}
      /> */}

      {/* News Info - Komponen terpisah untuk reusability */}
      <BerandaNewsInfo
        {...newsInfoProps}
        onViewAllPress={onNavigateToNews}
        onRefreshRequested={handleNewsRefreshRequested}
      />
    </View>
  );
});

BerandaTab.displayName = 'BerandaTab';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: moderateVerticalScale(16),
  },
  menuItemTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(8),
  },
  menuItem: {
    marginTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(16),
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: moderateVerticalScale(16),
  },
});