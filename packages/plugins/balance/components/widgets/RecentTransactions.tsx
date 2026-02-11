/**
 * RecentTransactions Component
 * Komponen untuk menampilkan transaksi terbaru di tab beranda
 */
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useBalance, TransactionType } from '@plugins/balance';
import {
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
  moderateVerticalScale,
  scale,
  useRefreshRegistry,
} from '@core/config';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { useNavigation } from '@react-navigation/native';

const WIDGET_ID = 'recent-transactions';

interface RecentTransactionsProps {
  isActive?: boolean;
  isVisible?: boolean;
  showRecentTransactions?: boolean;
  limit?: number;
  onViewAllPress?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = React.memo(
  ({
    isActive = true,
    isVisible = true,
    showRecentTransactions = true,
    limit = 5,
    onViewAllPress,
  }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const horizontalPadding = getHorizontalPadding();
    const { mutations, loadMutations, isLoading } = useBalance();
    const refreshRegistry = useRefreshRegistry();
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
      loadMutations({ limit });
    }, [loadMutations, limit, refreshKey]);

    const handleViewAll = useCallback(() => {
      if (onViewAllPress) {
        onViewAllPress();
      } else {
        (navigation as any).navigate('TransactionHistory' as never);
      }
    }, [onViewAllPress, navigation]);

    const handleRefresh = useCallback(async () => {
      setRefreshKey((prev) => prev + 1);
      await loadMutations({ limit });
    }, [loadMutations, limit]);

    useEffect(() => {
      if (!refreshRegistry) return;
      const unregister = refreshRegistry.registerRefreshCallback(WIDGET_ID, handleRefresh);
      return unregister;
    }, [refreshRegistry, handleRefresh]);

    const formatTransactionDate = (date: Date): string => {
      const now = new Date();
      const transactionDate = new Date(date);
      const diffTime = Math.abs(now.getTime() - transactionDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        const hours = transactionDate.getHours().toString().padStart(2, '0');
        const minutes = transactionDate.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else if (diffDays === 1) {
        return t('home.yesterday') || 'Kemarin';
      } else if (diffDays < 7) {
        const day = transactionDate.getDate();
        const month = transactionDate.getMonth() + 1;
        return `${day}/${month}`;
      } else {
        const day = transactionDate.getDate();
        const month = transactionDate.getMonth() + 1;
        const year = transactionDate.getFullYear();
        return `${day}/${month}/${year}`;
      }
    };

    const formatAmount = (amount: number): string => {
      const absAmount = Math.abs(amount);
      const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${amount < 0 ? '-' : '+'}Rp ${formatted}`;
    };

    const getTransactionColor = (type: TransactionType, amount: number): string => {
      return amount > 0 ? colors.success || '#10B981' : colors.error || '#EF4444';
    };

    const recentTransactions = useMemo(() => {
      if (!mutations || mutations.length === 0) return [];
      return [...mutations]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    }, [mutations, limit]);

    if (!showRecentTransactions) return null;

    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('home.recentTransactions') || 'Transaksi Terbaru'}
          </Text>
          <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton} activeOpacity={0.7}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              {t('home.viewAll') || 'Lihat Semua'}
            </Text>
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <ArrowLeft2 size={16} color={colors.primary} variant="Outline" />
            </View>
          </TouchableOpacity>
        </View>

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
                    { backgroundColor: colors.surface, borderColor: colors.border },
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
  }
);

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
