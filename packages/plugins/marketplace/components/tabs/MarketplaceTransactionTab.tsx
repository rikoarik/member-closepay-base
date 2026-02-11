/**
 * MarketplaceTransactionTab Component
 * Tab riwayat transaksi marketplace
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

interface MarketplaceTransactionTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const MarketplaceTransactionTab: React.FC<MarketplaceTransactionTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const transactions = [
      {
        id: 'INV/2023/MP/001',
        item: 'Kemeja Flannel',
        price: 199000,
        date: '10 Feb 2024',
        status: 'Selesai',
      },
      {
        id: 'INV/2023/MP/002',
        item: 'Wireless Earbuds',
        price: 450000,
        date: '08 Feb 2024',
        status: 'Dikirim',
      },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <View style={{ padding: getHorizontalPadding() }}>
          <Text style={[styles.header, { color: colors.text }]}>Transaksi Belanja</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {transactions.map((tx) => (
              <View key={tx.id} style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.invoice, { color: colors.primary }]}>{tx.id}</Text>
                  <Text
                    style={[
                      styles.status,
                      { color: tx.status === 'Selesai' ? '#10B981' : '#F59E0B' },
                    ]}
                  >
                    {tx.status}
                  </Text>
                </View>
                <Text style={[styles.item, { color: colors.text }]}>{tx.item}</Text>
                <View style={styles.cardFooter}>
                  <Text style={{ color: colors.textSecondary }}>{tx.date}</Text>
                  <Text style={[styles.price, { color: colors.text }]}>
                    Rp {tx.price.toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }
);

MarketplaceTransactionTab.displayName = 'MarketplaceTransactionTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  invoice: { fontFamily: FontFamily.monasans.bold, fontSize: getResponsiveFontSize('small') },
  status: { fontFamily: FontFamily.monasans.semiBold, fontSize: getResponsiveFontSize('small') },
  item: {
    fontFamily: FontFamily.monasans.medium,
    fontSize: getResponsiveFontSize('medium'),
    marginBottom: 12,
  },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontFamily: FontFamily.monasans.bold, fontSize: getResponsiveFontSize('medium') },
});
