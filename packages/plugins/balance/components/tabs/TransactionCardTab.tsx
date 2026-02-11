/**
 * TransactionCardTab Component
 * Tab untuk transaksi kartu saja
 */
import React from 'react';
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

interface TransactionCardTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const TransactionCardTab: React.FC<TransactionCardTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const cardTransactions = [
      {
        id: 1,
        merchant: 'Netflix Subscription',
        amount: 169000,
        date: 'Hari ini, 10:00',
        icon: '🎬',
        status: 'success',
      },
      {
        id: 2,
        merchant: 'Spotify Premium',
        amount: 54990,
        date: 'Kemarin, 08:30',
        icon: '🎵',
        status: 'success',
      },
      {
        id: 3,
        merchant: 'Amazon Purchase',
        amount: 450000,
        date: '2 hari lalu, 14:00',
        icon: '📦',
        status: 'success',
      },
      {
        id: 4,
        merchant: 'Google Cloud Platform',
        amount: 125000,
        date: '3 hari lalu, 09:15',
        icon: '☁️',
        status: 'success',
      },
      {
        id: 5,
        merchant: 'Adobe Creative Cloud',
        amount: 489000,
        date: '4 hari lalu, 11:30',
        icon: '🎨',
        status: 'success',
      },
    ];

    const totalSpent = cardTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <View style={{ padding: getHorizontalPadding() }}>
          <Text style={[styles.header, { color: colors.text }]}>Transaksi Kartu</Text>

          <View style={[styles.totalCard, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.totalLabel, { color: colors.primary }]}>
              Total Pengeluaran Kartu
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primary }]}>
              Rp {totalSpent.toLocaleString('id-ID')}
            </Text>
            <Text style={[styles.totalPeriod, { color: colors.primary }]}>Bulan ini</Text>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Riwayat Transaksi</Text>
            {cardTransactions.map((tx) => (
              <View key={tx.id} style={[styles.txCard, { backgroundColor: colors.surface }]}>
                <View style={styles.txIcon}>
                  <Text style={styles.txEmoji}>{tx.icon}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={[styles.txMerchant, { color: colors.text }]}>{tx.merchant}</Text>
                  <Text style={[styles.txDate, { color: colors.textSecondary }]}>{tx.date}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, { color: colors.text }]}>
                    -Rp {tx.amount.toLocaleString('id-ID')}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>✓ Berhasil</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }
);

TransactionCardTab.displayName = 'TransactionCardTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  totalCard: {
    padding: moderateVerticalScale(20),
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(20),
  },
  totalLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(8),
  },
  totalAmount: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(4),
  },
  totalPeriod: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  list: { flex: 1 },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  txCard: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  txIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  txEmoji: { fontSize: 22 },
  txInfo: { flex: 1 },
  txMerchant: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  txDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  txRight: { alignItems: 'flex-end' },
  txAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: moderateVerticalScale(4),
    borderRadius: 6,
    backgroundColor: '#10B98120',
  },
  statusText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    color: '#10B981',
  },
});
