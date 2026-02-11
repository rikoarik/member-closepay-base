/**
 * TransactionHistoryTab Component
 * Tab untuk riwayat transaksi lengkap dengan filter
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';

interface TransactionHistoryTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

type TransactionType = 'all' | 'income' | 'expense' | 'transfer';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  title: string;
  description: string;
  amount: number;
  date: string;
  time: string;
  category: string;
  icon: string;
}

export const TransactionHistoryTab: React.FC<TransactionHistoryTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [selectedFilter, setSelectedFilter] = useState<TransactionType>('all');

    // Mock transactions data
    const transactions: Transaction[] = [
      {
        id: '1',
        type: 'expense',
        title: 'Transfer ke Budi',
        description: 'Transfer Member',
        amount: 500000,
        date: 'Hari ini',
        time: '14:30',
        category: 'Transfer',
        icon: '💸',
      },
      {
        id: '2',
        type: 'income',
        title: 'Top Up VA',
        description: 'Virtual Account',
        amount: 1000000,
        date: 'Hari ini',
        time: '10:15',
        category: 'Top Up',
        icon: '⬆️',
      },
      {
        id: '3',
        type: 'expense',
        title: 'QRIS Payment',
        description: 'Toko ABC',
        amount: 150000,
        date: 'Kemarin',
        time: '18:45',
        category: 'Pembayaran',
        icon: '📱',
      },
      {
        id: '4',
        type: 'expense',
        title: 'Belanja Marketplace',
        description: 'Produk XYZ',
        amount: 250000,
        date: 'Kemarin',
        time: '15:20',
        category: 'Belanja',
        icon: '🛒',
      },
      {
        id: '5',
        type: 'transfer',
        title: 'Transfer dari Andi',
        description: 'Transfer Member',
        amount: 750000,
        date: '2 hari lalu',
        time: '09:00',
        category: 'Transfer',
        icon: '📥',
      },
      {
        id: '6',
        type: 'expense',
        title: 'F&B Order',
        description: 'Cafe DEF',
        amount: 85000,
        date: '2 hari lalu',
        time: '12:30',
        category: 'Makanan',
        icon: '🍔',
      },
    ];

    // Filter buttons
    const filters = [
      { id: 'all', label: t('transaction.all') || 'Semua' },
      { id: 'income', label: t('transaction.income') || 'Pemasukan' },
      { id: 'expense', label: t('transaction.expense') || 'Pengeluaran' },
      { id: 'transfer', label: t('transaction.transfer') || 'Transfer' },
    ];

    // Filter transactions
    const filteredTransactions =
      selectedFilter === 'all'
        ? transactions
        : transactions.filter((t) => t.type === selectedFilter);

    // Group by date
    const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);

    const renderTransaction = (transaction: Transaction) => (
      <View
        key={transaction.id}
        style={[
          styles.transactionItem,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.transactionIconContainer}>
          <Text style={styles.transactionIcon}>{transaction.icon}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionTitle, { color: colors.text }]}>{transaction.title}</Text>
          <Text style={[styles.transactionDescription, { color: colors.textSecondary }]}>
            {transaction.description} • {transaction.time}
          </Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text
            style={[
              styles.transactionAmount,
              {
                color:
                  transaction.type === 'income'
                    ? '#10B981'
                    : transaction.type === 'transfer'
                    ? '#3B82F6'
                    : colors.text,
              },
            ]}
          >
            {transaction.type === 'income' || transaction.type === 'transfer' ? '+' : '-'}Rp{' '}
            {transaction.amount.toLocaleString('id-ID')}
          </Text>
          <Text style={[styles.transactionCategory, { color: colors.textSecondary }]}>
            {transaction.category}
          </Text>
        </View>
      </View>
    );

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <View style={{ padding: getHorizontalPadding() }}>
          {/* Header */}
          <Text style={[styles.header, { color: colors.text }]}>
            {t('transaction.history') || 'Riwayat Transaksi'}
          </Text>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: selectedFilter === filter.id ? colors.primary : colors.surface,
                    borderColor: selectedFilter === filter.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.id as TransactionType)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: selectedFilter === filter.id ? colors.surface : colors.text,
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Transaction List */}
          <ScrollView
            style={styles.transactionsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.transactionsContent}
          >
            {Object.entries(groupedTransactions).map(([date, transactions]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{date}</Text>
                {transactions.map(renderTransaction)}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }
);

TransactionHistoryTab.displayName = 'TransactionHistoryTab';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  filtersContainer: {
    marginBottom: moderateVerticalScale(20),
  },
  filtersContent: {
    gap: scale(8),
    paddingRight: getHorizontalPadding(),
  },
  filterButton: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  transactionsList: {
    flex: 1,
  },
  transactionsContent: {
    paddingBottom: moderateVerticalScale(24),
  },
  dateGroup: {
    marginBottom: moderateVerticalScale(20),
  },
  dateLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    textTransform: 'uppercase',
    marginBottom: moderateVerticalScale(8),
  },
  transactionItem: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
    borderWidth: 1,
  },
  transactionIconContainer: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  transactionIcon: {
    fontSize: 22,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(2),
  },
  transactionDescription: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(2),
  },
  transactionCategory: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
});
