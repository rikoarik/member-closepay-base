/**
 * TransactionAllTab Component
 * Tab untuk semua jenis transaksi
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';

interface TransactionAllTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const TransactionAllTab: React.FC<TransactionAllTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const transactions = [
      {
        id: 1,
        type: 'transfer',
        title: 'Transfer ke Budi',
        amount: -500000,
        date: 'Hari ini, 14:30',
        category: 'Transfer',
        icon: '💸',
      },
      {
        id: 2,
        type: 'payment',
        title: 'QRIS Payment',
        amount: -150000,
        date: 'Hari ini, 12:00',
        category: 'Pembayaran',
        icon: '📱',
      },
      {
        id: 3,
        type: 'topup',
        title: 'Top Up VA',
        amount: 1000000,
        date: 'Kemarin, 10:15',
        category: 'Top Up',
        icon: '⬆️',
      },
      {
        id: 4,
        type: 'marketplace',
        title: 'Belanja Produk',
        amount: -250000,
        date: 'Kemarin, 15:20',
        category: 'Belanja',
        icon: '🛒',
      },
      {
        id: 5,
        type: 'card',
        title: 'Netflix Subscription',
        amount: -169000,
        date: '2 hari lalu',
        category: 'Kartu',
        icon: '💳',
      },
      {
        id: 6,
        type: 'fnb',
        title: 'Kopi Kenangan',
        amount: -25000,
        date: '2 hari lalu',
        category: 'F&B',
        icon: '☕',
      },
    ];

    const groupedTx = transactions.reduce((groups, tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
      return groups;
    }, {} as Record<string, typeof transactions>);

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <View style={{ padding: getHorizontalPadding() }}>
          <Text style={[styles.header, { color: colors.text }]}>Semua Transaksi</Text>

          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Pemasukan
              </Text>
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>+Rp 1.000.000</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Pengeluaran
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>-Rp 1.094.000</Text>
            </View>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {Object.entries(groupedTx).map(([date, txs]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{date}</Text>
                {txs.map((tx) => (
                  <View key={tx.id} style={[styles.txItem, { backgroundColor: colors.surface }]}>
                    <Text style={styles.txIcon}>{tx.icon}</Text>
                    <View style={styles.txInfo}>
                      <Text style={[styles.txTitle, { color: colors.text }]}>{tx.title}</Text>
                      <Text style={[styles.txCategory, { color: colors.textSecondary }]}>
                        {tx.category}
                      </Text>
                    </View>
                    <Text
                      style={[styles.txAmount, { color: tx.amount > 0 ? '#10B981' : colors.text }]}
                    >
                      {tx.amount > 0 ? '+' : ''}Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }
);

TransactionAllTab.displayName = 'TransactionAllTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  summaryCard: {
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    marginBottom: moderateVerticalScale(16),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(8),
  },
  summaryLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  summaryValue: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
  list: { flex: 1 },
  dateGroup: { marginBottom: moderateVerticalScale(16) },
  dateLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    textTransform: 'uppercase',
    marginBottom: moderateVerticalScale(8),
  },
  txItem: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  txIcon: { fontSize: 24, marginRight: scale(12) },
  txInfo: { flex: 1 },
  txTitle: { fontSize: getResponsiveFontSize('medium'), fontFamily: FontFamily.monasans.semiBold },
  txCategory: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  txAmount: { fontSize: getResponsiveFontSize('medium'), fontFamily: FontFamily.monasans.bold },
});
