/**
 * AktivitasTab Component
 * Tab aktivitas dengan transaction history
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useBalance, BalanceMutation } from '@plugins/balance';

interface AktivitasTabProps {
  isActive?: boolean;
  isVisible?: boolean;
}

export const AktivitasTab: React.FC<AktivitasTabProps> = React.memo(({
  isActive = true,
  isVisible = true,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();
  const { mutations, loadMutations, refresh } = useBalance();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isVisible && isActive) {
      loadMutations();
    }
  }, [isVisible, isActive, loadMutations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
      await loadMutations();
    } finally {
      setRefreshing(false);
    }
  }, [refresh, loadMutations]);

  const formatTransactionDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  const formatAmount = (amount: number): string => {
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${amount < 0 ? '-' : ''}Rp ${formatted}`;
  };

  // Get recent transactions (last 10)
  const recentTransactions = useMemo(() => {
    return mutations
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [mutations]);

  const renderTransactionItem = useCallback(({ item }: { item: BalanceMutation }) => (
    <View
      style={[
        styles.transactionItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.transactionContent}>
        <Text style={[styles.transactionTitle, { color: colors.text }]}>
          {item.description}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
          {formatTransactionDate(new Date(item.createdAt))}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          {
            color: item.amount < 0
              ? colors.error || '#EF4444'
              : colors.success || colors.primary,
          },
        ]}
      >
        {formatAmount(item.amount)}
      </Text>
    </View>
  ), [colors]);

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: insets.bottom + moderateVerticalScale(24),
          paddingHorizontal: horizontalPadding,
          paddingTop: moderateVerticalScale(16),
        },
      ]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      scrollEnabled={isActive}
      bounces={false}
      directionalLockEnabled={true}
      onScrollBeginDrag={(e) => {
        e.stopPropagation();
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      pointerEvents={isActive ? 'auto' : 'none'}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('home.activity') || 'Aktivitas Terkini'}
        </Text>
      </View>

      {/* Transaction List */}
      {recentTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('balance.noTransactions') || 'Tidak ada transaksi'}
          </Text>
        </View>
      ) : (
        <View>
          {recentTransactions.map((item, index) => (
            <View key={item.id || index}>
              {renderTransactionItem({ item })}
              {index < recentTransactions.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
});

AktivitasTab.displayName = 'AktivitasTab';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    marginBottom: moderateVerticalScale(16),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
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
    fontFamily: FontFamily.monasans.medium,
    marginBottom: scale(4),
  },
  transactionDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  transactionAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  separator: {
    height: scale(12),
  },
  emptyContainer: {
    paddingTop: moderateVerticalScale(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
});