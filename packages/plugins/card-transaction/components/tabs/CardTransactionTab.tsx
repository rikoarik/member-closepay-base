/**
 * CardTransactionTab Component
 * Tab untuk transaksi kartu virtual
 */
import React, { useState } from 'react';
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

interface CardTransactionTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

type FilterType = 'all' | 'success' | 'pending' | 'failed';

export const CardTransactionTab: React.FC<CardTransactionTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [filter, setFilter] = useState<FilterType>('all');

    const transactions = [
      {
        id: 1,
        merchant: 'Netflix Subscription',
        amount: 169000,
        date: 'Hari ini, 10:00',
        status: 'success',
        icon: '🎬',
      },
      {
        id: 2,
        merchant: 'Spotify Premium',
        amount: 54990,
        date: 'Kemarin, 08:30',
        status: 'success',
        icon: '🎵',
      },
      {
        id: 3,
        merchant: 'Amazon Purchase',
        amount: 450000,
        date: '2 hari lalu',
        status: 'success',
        icon: '📦',
      },
      {
        id: 4,
        merchant: 'Google Cloud',
        amount: 125000,
        date: '3 hari lalu',
        status: 'pending',
        icon: '☁️',
      },
    ];

    const filters = [
      { id: 'all', label: 'Semua' },
      { id: 'success', label: 'Berhasil' },
      { id: 'pending', label: 'Pending' },
      { id: 'failed', label: 'Gagal' },
    ];

    const filteredTx =
      filter === 'all' ? transactions : transactions.filter((t) => t.status === filter);

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <View style={{ padding: getHorizontalPadding() }}>
          <Text style={[styles.header, { color: colors.text }]}>Transaksi Kartu</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filters.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: filter === f.id ? colors.primary : colors.surface,
                    borderColor: filter === f.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFilter(f.id as FilterType)}
              >
                <Text
                  style={[styles.filterText, { color: filter === f.id ? '#FFFFFF' : colors.text }]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filteredTx.map((tx) => (
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
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          tx.status === 'success'
                            ? '#10B98120'
                            : tx.status === 'pending'
                            ? '#F59E0B20'
                            : '#EF444420',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            tx.status === 'success'
                              ? '#10B981'
                              : tx.status === 'pending'
                              ? '#F59E0B'
                              : '#EF4444',
                        },
                      ]}
                    >
                      {tx.status === 'success'
                        ? '✓ Berhasil'
                        : tx.status === 'pending'
                        ? '⏳ Pending'
                        : '✗ Gagal'}
                    </Text>
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

CardTransactionTab.displayName = 'CardTransactionTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  filtersContainer: { marginBottom: moderateVerticalScale(16) },
  filterButton: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: 20,
    borderWidth: 1,
    marginRight: scale(8),
  },
  filterText: { fontSize: getResponsiveFontSize('medium'), fontFamily: FontFamily.monasans.medium },
  list: { flex: 1 },
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
  },
  statusText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
  },
});
