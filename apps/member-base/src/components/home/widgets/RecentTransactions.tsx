/**
 * RecentTransactions Component
 * Komponen untuk menampilkan transaksi terbaru di tab beranda
 */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useBalance, BalanceMutation, TransactionType } from '@plugins/balance';
import {
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
  moderateVerticalScale,
  scale,
} from '@core/config';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@core/navigation';

// Extend RootStackParamList untuk app-specific routes
type AppRootStackParamList = RootStackParamList & {
  BalanceDetail: undefined;
};

type NavigationProp = NativeStackNavigationProp<AppRootStackParamList>;

export interface RecentTransactionsProps {
  /**
   * Show RecentTransactions component (default: true)
   */
  showRecentTransactions?: boolean;
  /**
   * Jumlah transaksi yang ditampilkan (default: 5)
   */
  limit?: number;
  /**
   * Callback when "Lihat Semua" button is pressed
   * Jika tidak ada, akan navigate ke TransactionHistoryScreen
   */
  onViewAllPress?: () => void;
  /**
   * Callback untuk refresh data
   * Akan dipanggil saat user melakukan pull-to-refresh
   */
  onRefresh?: () => void | Promise<void>;
  /**
   * Callback untuk expose refresh function ke parent
   * Berguna untuk trigger refresh dari parent component
   */
  onRefreshRequested?: (refreshFn: () => void) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = React.memo(({
  showRecentTransactions = true,
  limit = 5,
  onViewAllPress,
  onRefresh,
  onRefreshRequested,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const horizontalPadding = getHorizontalPadding();
  const { mutations, loadMutations, isLoading } = useBalance();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load mutations on mount and when refresh key changes
  useEffect(() => {
    loadMutations({ limit });
  }, [loadMutations, limit, refreshKey]);

  // Default handler untuk navigate ke TransactionHistoryScreen (BalanceDetail route)
  const handleViewAll = () => {
    if (onViewAllPress) {
      onViewAllPress();
    } else {
      // Default: navigate ke BalanceDetail (TransactionHistoryScreen)
      try {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'BalanceDetail',
            params: undefined,
          })
        );
      } catch (error) {
        console.error('Navigation dispatch error:', error);
        // Fallback: coba dengan navigate langsung
        try {
          (navigation as any).navigate('BalanceDetail' as never);
        } catch (fallbackError) {
          console.error('Fallback navigation error:', fallbackError);
        }
      }
    }
  };

  // Handler untuk refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Trigger refresh dengan mengubah key untuk force re-render
      setRefreshKey(prev => prev + 1);
      
      // Reload mutations
      await loadMutations({ limit });
      
      // Jika ada custom refresh handler, panggil juga
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, loadMutations, limit]);

  // Expose refresh function ke parent
  React.useEffect(() => {
    if (onRefreshRequested) {
      onRefreshRequested(handleRefresh);
    }
  }, [onRefreshRequested, handleRefresh]);

  // Format transaction date untuk ditampilkan
  const formatTransactionDate = (date: Date): string => {
    const now = new Date();
    const transactionDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - transactionDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Hari ini - tampilkan jam saja
      const hours = transactionDate.getHours().toString().padStart(2, '0');
      const minutes = transactionDate.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else if (diffDays === 1) {
      // Kemarin
      return t('home.yesterday') || 'Kemarin';
    } else if (diffDays < 7) {
      // Beberapa hari lalu
      const day = transactionDate.getDate();
      const month = transactionDate.getMonth() + 1;
      return `${day}/${month}`;
    } else {
      // Lebih dari seminggu
      const day = transactionDate.getDate();
      const month = transactionDate.getMonth() + 1;
      const year = transactionDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  // Format amount
  const formatAmount = (amount: number): string => {
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${amount < 0 ? '-' : '+'}Rp ${formatted}`;
  };

  // Get transaction type icon color
  const getTransactionColor = (type: TransactionType, amount: number): string => {
    if (amount > 0) {
      return colors.success || '#10B981';
    } else {
      return colors.error || '#EF4444';
    }
  };

  // Get recent transactions (limit)
  const recentTransactions = useMemo(() => {
    if (!mutations || mutations.length === 0) {
      return [];
    }
    // Sort by date (newest first) and limit
    return [...mutations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [mutations, limit]);

  // Jika showRecentTransactions false, jangan render apapun
  if (!showRecentTransactions) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header dengan title dan tombol Lihat Semua */}
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.recentTransactions') || 'Transaksi Terbaru'}
        </Text>
        <TouchableOpacity
          onPress={handleViewAll}
          style={styles.viewAllButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            {t('home.viewAll') || 'Lihat Semua'}
          </Text>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ArrowLeft2 
              size={16} 
              color={colors.primary} 
              variant="Outline"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <View style={[styles.transactionList, { paddingHorizontal: horizontalPadding }]}>
        {isLoading && recentTransactions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t('common.loading') || 'Memuat...'}
            </Text>
          </View>
        ) : recentTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('balance.noTransactions') || 'Tidak ada transaksi'}
            </Text>
          </View>
        ) : (
          recentTransactions.map((transaction) => {
            const transactionColor = getTransactionColor(transaction.type, transaction.amount);
            
            return (
              <View
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.transactionContent}>
                  <Text
                    style={[styles.transactionTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {transaction.description}
                  </Text>
                  <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                    {formatTransactionDate(new Date(transaction.createdAt))}
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: transactionColor }]}>
                  {formatAmount(transaction.amount)}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
});

RecentTransactions.displayName = 'RecentTransactions';

const styles = StyleSheet.create({
  container: {
    marginTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  title: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  viewAllText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  transactionList: {
    gap: scale(12),
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  transactionContent: {
    flex: 1,
    marginRight: scale(12),
  },
  transactionTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(4),
  },
  transactionDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  transactionAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
  loadingContainer: {
    paddingVertical: moderateVerticalScale(24),
    alignItems: 'center',
    gap: scale(8),
  },
  loadingText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  emptyContainer: {
    paddingVertical: moderateVerticalScale(24),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
});

