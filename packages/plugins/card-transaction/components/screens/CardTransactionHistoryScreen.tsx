/**
 * CardTransactionHistoryScreen
 * Riwayat transaksi untuk satu kartu virtual (dipanggil dari VirtualCardDetail)
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft2, ReceiptItem } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  FontFamily,
  getResponsiveFontSize,
  scale,
} from '@core/config';

type FilterType = 'all' | 'success' | 'pending' | 'failed';

type CardParam = {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate?: string;
  gradientColors?: string[];
};

type RouteParams = {
  CardTransactionHistory: { card: CardParam };
};

const MOCK_TRANSACTIONS = [
  { id: '1', merchant: 'Netflix Subscription', amount: 169000, date: 'Hari ini, 10:00', status: 'success' as const, icon: '🎬' },
  { id: '2', merchant: 'Spotify Premium', amount: 54990, date: 'Kemarin, 08:30', status: 'success' as const, icon: '🎵' },
  { id: '3', merchant: 'Amazon Purchase', amount: 450000, date: '2 hari lalu', status: 'success' as const, icon: '📦' },
  { id: '4', merchant: 'Google Cloud', amount: 125000, date: '3 hari lalu', status: 'pending' as const, icon: '☁️' },
];

const FILTERS: { id: FilterType; labelKey: string }[] = [
  { id: 'all', labelKey: 'transaction.filterAll' },
  { id: 'success', labelKey: 'transaction.filterSuccess' },
  { id: 'pending', labelKey: 'transaction.filterPending' },
  { id: 'failed', labelKey: 'transaction.filterFailed' },
];

export const CardTransactionHistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CardTransactionHistory'>>();
  const card = route.params?.card;

  const [filter, setFilter] = useState<FilterType>('all');
  const filteredTx = filter === 'all'
    ? MOCK_TRANSACTIONS
    : MOCK_TRANSACTIONS.filter((tx) => tx.status === filter);

  const handleBack = () => navigation.goBack();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'success':
        return { bg: colors.successLight ?? 'rgba(16, 185, 129, 0.12)', text: colors.success };
      case 'pending':
        return { bg: colors.warningLight ?? 'rgba(245, 158, 11, 0.12)', text: colors.warning };
      case 'failed':
        return { bg: colors.errorLight ?? 'rgba(239, 68, 68, 0.12)', text: colors.error };
      default:
        return { bg: colors.surface, text: colors.text };
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'success') return t('transaction.success') || 'Berhasil';
    if (status === 'pending') return t('transaction.pending') || 'Pending';
    if (status === 'failed') return t('transaction.failed') || 'Gagal';
    return status;
  };

  const minTouch = getMinTouchTarget();
  const paddingH = getHorizontalPadding();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top'] as const}>
      <View style={[styles.header, { paddingHorizontal: paddingH }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('home.transactionHistory') || 'Riwayat Transaksi'}
        </Text>
        <View style={{ width: minTouch }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: paddingH }}>
          {card && (
            <View style={[styles.cardContext, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardContextRow}>
                <View style={[styles.cardContextIconWrap, { backgroundColor: colors.primaryLight ?? colors.background }]}>
                  <ReceiptItem size={scale(20)} color={colors.primary} variant="Bold" />
                </View>
                <View style={styles.cardContextText}>
                  <Text style={[styles.cardContextLabel, { color: colors.textSecondary }]}>
                    {t('home.cardHolder') || 'Pemegang Kartu'}
                  </Text>
                  <Text style={[styles.cardContextName, { color: colors.text }]} numberOfLines={1}>
                    {card.cardHolderName}
                  </Text>
                  <Text style={[styles.cardContextNumber, { color: colors.textSecondary }]} numberOfLines={1}>
                    {card.cardNumber}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home.cardTransaction') || 'Transaksi Kartu'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContent}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: filter === f.id ? colors.primary : colors.surface,
                    borderColor: filter === f.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFilter(f.id)}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    { color: filter === f.id ? colors.surface : colors.text },
                  ]}
                >
                  {t(f.labelKey) || f.id}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {filteredTx.length === 0 ? (
          <View style={[styles.emptyWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.background }]}>
              <ReceiptItem size={scale(40)} color={colors.textSecondary} variant="Linear" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('transaction.noHistory') || 'Tidak ada riwayat transaksi'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              {t('transaction.noHistoryHint') || 'Transaksi untuk kartu ini akan muncul di sini'}
            </Text>
          </View>
        ) : (
          <View style={[styles.listWrap, { paddingHorizontal: paddingH }]}>
            {filteredTx.map((tx) => {
              const statusStyle = getStatusStyle(tx.status);
              return (
                <View
                  key={tx.id}
                  style={[styles.txCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={[styles.txIcon, { backgroundColor: colors.background }]}>
                    <Text style={styles.txEmoji}>{tx.icon}</Text>
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={[styles.txMerchant, { color: colors.text }]} numberOfLines={1}>
                      {tx.merchant}
                    </Text>
                    <Text style={[styles.txDate, { color: colors.textSecondary }]}>{tx.date}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]} numberOfLines={1}>
                        {tx.status === 'success' ? '✓ ' : tx.status === 'pending' ? '⏳ ' : '✗ '}
                        {getStatusLabel(tx.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[styles.txAmount, { color: colors.text }]}>
                      -Rp {tx.amount.toLocaleString('id-ID')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateVerticalScale(12),
  },
  backBtn: {
    minWidth: getMinTouchTarget(),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: moderateVerticalScale(32) },
  cardContext: {
    padding: scale(14),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(20),
  },
  cardContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContextIconWrap: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  cardContextText: { flex: 1 },
  cardContextLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: 2,
  },
  cardContextName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  cardContextNumber: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  filtersScroll: { marginBottom: moderateVerticalScale(16), marginHorizontal: -getHorizontalPadding() },
  filtersContent: {
    paddingHorizontal: getHorizontalPadding(),
    paddingRight: getHorizontalPadding() * 2,
  },
  filterBtn: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(10),
    borderRadius: 20,
    borderWidth: 1,
    marginRight: scale(8),
  },
  filterBtnText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  emptyWrap: {
    marginHorizontal: getHorizontalPadding(),
    padding: scale(32),
    borderRadius: scale(16),
    borderWidth: 1,
    alignItems: 'center',
    marginTop: moderateVerticalScale(8),
  },
  emptyIconWrap: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  emptyTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    textAlign: 'center',
    marginBottom: scale(8),
  },
  emptySub: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  listWrap: { paddingBottom: moderateVerticalScale(16) },
  txCard: {
    flexDirection: 'row',
    padding: moderateVerticalScale(14),
    borderRadius: scale(12),
    alignItems: 'center',
    marginBottom: moderateVerticalScale(10),
    borderWidth: 1,
  },
  txIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  txEmoji: { fontSize: 22 },
  txInfo: { flex: 1, minWidth: 0 },
  txMerchant: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  txDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: scale(8),
    paddingVertical: moderateVerticalScale(4),
    borderRadius: 6,
    marginTop: scale(6),
  },
  statusText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
  },
  txRight: {
    alignItems: 'flex-end',
    marginLeft: scale(12),
  },
  txAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
});
