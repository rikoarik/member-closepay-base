/**
 * FnBHistoryTab Component
 * Tab riwayat pesanan F&B
 */
import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
} from '@core/config';
import { useTranslation } from '@core/i18n';

interface FnBHistoryTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const FnBHistoryTab: React.FC<FnBHistoryTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const orders = [
      {
        id: 'ORD-001',
        items: '2x Nasi Goreng, 1x Es Teh',
        total: 85000,
        date: 'Hari ini, 12:30',
        status: 'Selesai',
      },
      {
        id: 'ORD-002',
        items: '1x Kopi Susu Gula Aren',
        total: 22000,
        date: 'Kemarin, 09:15',
        status: 'Selesai',
      },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <View style={{ padding: getHorizontalPadding() }}>
          <Text style={[styles.header, { color: colors.text }]}>Riwayat Pesanan</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {orders.map((ord) => (
              <View key={ord.id} style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.topRow}>
                  <Text style={[styles.orderId, { color: colors.text }]}>{ord.id}</Text>
                  <View style={[styles.badge, { backgroundColor: '#10B98120' }]}>
                    <Text
                      style={{
                        color: '#10B981',
                        fontSize: 12,
                        fontFamily: FontFamily.monasans.semiBold,
                      }}
                    >
                      {ord.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.items, { color: colors.textSecondary }]}>{ord.items}</Text>
                <View style={styles.divider} />
                <View style={styles.bottomRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{ord.date}</Text>
                  <Text style={[styles.total, { color: colors.primary }]}>
                    Rp {ord.total.toLocaleString('id-ID')}
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

FnBHistoryTab.displayName = 'FnBHistoryTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  card: { padding: 16, borderRadius: 12, marginBottom: 12 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: { fontFamily: FontFamily.monasans.bold, fontSize: getResponsiveFontSize('medium') },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  items: {
    fontFamily: FontFamily.monasans.regular,
    fontSize: getResponsiveFontSize('medium'),
    marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 12 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontFamily: FontFamily.monasans.bold, fontSize: getResponsiveFontSize('medium') },
});
