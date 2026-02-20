/**
 * MarketplaceRiwayatScreen Component
 * Tab Riwayat: riwayat belanja / transaksi marketplace dengan filter status
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useTabBar } from '../navigation/TabBarContext';

export type OrderStatusFilter =
  | 'semua'
  | 'belum_dibayar'
  | 'dipesan'
  | 'diproses'
  | 'dikirim'
  | 'at_pickup_point'
  | 'selesai'
  | 'dibatalkan'
  | 'ditolak'
  | 'ditinjau';

const ORDER_STATUS_KEYS: OrderStatusFilter[] = [
  'semua',
  'belum_dibayar',
  'dipesan',
  'diproses',
  'dikirim',
  'at_pickup_point',
  'selesai',
  'dibatalkan',
  'ditolak',
  'ditinjau',
];

const transactions: Array<{
  id: string;
  item: string;
  price: number;
  date: string;
  status: OrderStatusFilter;
}> = [
  { id: 'INV/2023/MP/001', item: 'Kemeja Flannel', price: 199000, date: '10 Feb 2024', status: 'selesai' },
  { id: 'INV/2023/MP/002', item: 'Wireless Earbuds', price: 450000, date: '08 Feb 2024', status: 'dikirim' },
  { id: 'INV/2023/MP/003', item: 'Tas Ransel', price: 299000, date: '05 Feb 2024', status: 'diproses' },
  { id: 'INV/2023/MP/004', item: 'Sepatu Sneakers', price: 450000, date: '01 Feb 2024', status: 'belum_dibayar' },
  { id: 'INV/2023/MP/005', item: 'Jaket Hoodie', price: 350000, date: '12 Jan 2024', status: 'dibatalkan' },
];

const ORDER_STATUS_I18N: Record<OrderStatusFilter, string> = {
  semua: 'marketplace.orderStatusAll',
  belum_dibayar: 'marketplace.orderStatusUnpaid',
  dipesan: 'marketplace.orderStatusOrdered',
  diproses: 'marketplace.orderStatusProcessing',
  dikirim: 'marketplace.orderStatusShipped',
  at_pickup_point: 'marketplace.orderStatusAtPickupPoint',
  selesai: 'marketplace.orderStatusCompleted',
  dibatalkan: 'marketplace.orderStatusCancelled',
  ditolak: 'marketplace.orderStatusRejected',
  ditinjau: 'marketplace.orderStatusReviewed',
};

export const MarketplaceRiwayatScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const paddingH = getHorizontalPadding();
  const { toggleTabBar } = useTabBar();
  const lastContentOffset = useRef(0);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusFilter>('semua');

  const filteredTransactions = useMemo(() => {
    if (selectedStatus === 'semua') return transactions;
    return transactions.filter((tx) => tx.status === selectedStatus);
  }, [selectedStatus]);

  const goToExplore = useCallback(() => {
    navigation.navigate('MarketplaceExplore' as never);
  }, [navigation]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goToExplore();
      return true;
    });
    return () => sub.remove();
  }, [goToExplore]);

  const getStatusColor = useCallback(
    (status: OrderStatusFilter) => {
      switch (status) {
        case 'selesai':
        case 'ditinjau':
          return colors.success;
        case 'dibatalkan':
        case 'ditolak':
          return colors.error;
        case 'belum_dibayar':
          return colors.warning;
        default:
          return colors.primary;
      }
    },
    [colors]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const diff = currentOffset - lastContentOffset.current;
      if (Math.abs(diff) > 3) {
        if (diff > 0 && currentOffset > 20) {
          toggleTabBar(false);
        } else {
          toggleTabBar(true);
        }
      }
      lastContentOffset.current = currentOffset;
    },
    [toggleTabBar]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            paddingTop: insets.top,
            paddingHorizontal: paddingH,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={goToExplore}>
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('marketplace.riwayat') || 'Riwayat'}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + moderateVerticalScale(100) },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.statusTabsContent, { paddingHorizontal: paddingH }]}
          style={styles.statusTabsWrapper}
        >
          {ORDER_STATUS_KEYS.map((statusKey) => {
            const isSelected = selectedStatus === statusKey;
            return (
              <TouchableOpacity
                key={statusKey}
                style={[
                  styles.statusTab,
                  isSelected && { backgroundColor: colors.primary },
                  !isSelected && {
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedStatus(statusKey)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.statusTabText,
                    { color: isSelected ? colors.surface : colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {t(ORDER_STATUS_I18N[statusKey])}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.listSection, { paddingHorizontal: paddingH }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('marketplace.orderHistory') || 'Transaksi Belanja'}
          </Text>
          {filteredTransactions.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('marketplace.noOrdersInStatus')}
            </Text>
          ) : (
            filteredTransactions.map((tx) => (
              <View key={tx.id} style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.invoice, { color: colors.primary }]}>{tx.id}</Text>
                  <Text style={[styles.status, { color: getStatusColor(tx.status) }]}>
                    {t(ORDER_STATUS_I18N[tx.status])}
                  </Text>
                </View>
                <Text style={[styles.item, { color: colors.text }]}>{tx.item}</Text>
                <View style={styles.cardFooter}>
                  <Text style={[styles.date, { color: colors.textSecondary }]}>{tx.date}</Text>
                  <Text style={[styles.price, { color: colors.text }]}>
                    Rp {tx.price.toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: moderateVerticalScale(12),
    gap: scale(12),
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: FontFamily?.monasans?.semiBold ?? 'System',
    fontSize: getResponsiveFontSize('large'),
    flex: 1,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: moderateVerticalScale(12),
  },
  statusTabsWrapper: {
    marginBottom: moderateVerticalScale(16),
  },
  statusTabsContent: {
    gap: scale(8),
    paddingVertical: scale(4),
  },
  statusTab: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(20),
  },
  statusTabText: {
    fontFamily: FontFamily?.monasans?.semiBold ?? 'System',
    fontSize: getResponsiveFontSize('small'),
    maxWidth: scale(100),
  },
  listSection: {
    paddingTop: scale(4),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily?.monasans?.bold ?? 'System',
    marginBottom: moderateVerticalScale(16),
  },
  card: {
    padding: scale(16),
    borderRadius: 12,
    marginBottom: scale(12),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(8),
  },
  invoice: {
    fontFamily: FontFamily?.monasans?.bold ?? 'System',
    fontSize: getResponsiveFontSize('small'),
  },
  status: {
    fontFamily: FontFamily?.monasans?.semiBold ?? 'System',
    fontSize: getResponsiveFontSize('small'),
  },
  item: {
    fontFamily: FontFamily?.monasans?.medium ?? 'System',
    fontSize: getResponsiveFontSize('medium'),
    marginBottom: scale(12),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontFamily: FontFamily?.monasans?.regular ?? 'System',
    fontSize: getResponsiveFontSize('small'),
  },
  price: {
    fontFamily: FontFamily?.monasans?.bold ?? 'System',
    fontSize: getResponsiveFontSize('medium'),
  },
  emptyText: {
    fontFamily: FontFamily?.monasans?.regular ?? 'System',
    fontSize: getResponsiveFontSize('medium'),
    textAlign: 'center',
    paddingVertical: moderateVerticalScale(24),
  },
});
