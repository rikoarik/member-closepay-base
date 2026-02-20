/**
 * CardActivityLogScreen
 * Log aktivitas kartu dengan filter rentang tanggal (date range).
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft2, ReceiptItem, Calendar } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  FontFamily,
  getResponsiveFontSize,
  scale,
  DatePicker,
} from '@core/config';

type CardParam = {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate?: string;
  gradientColors?: string[];
};

type RouteParams = {
  CardActivityLog: { card: CardParam };
};

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

const MOCK_ACTIVITIES = [
  { id: '1', merchant: 'Netflix Subscription', amount: -169000, date: new Date(now), status: 'success' as const, icon: '🎬' },
  { id: '2', merchant: 'Spotify Premium', amount: -54990, date: new Date(now - day), status: 'success' as const, icon: '🎵' },
  { id: '3', merchant: 'Amazon Purchase', amount: -450000, date: new Date(now - 2 * day), status: 'success' as const, icon: '📦' },
  { id: '4', merchant: 'Google Cloud', amount: -125000, date: new Date(now - 3 * day), status: 'pending' as const, icon: '☁️' },
  { id: '5', merchant: 'Top Up Saldo', amount: 500000, date: new Date(now - 5 * day), status: 'success' as const, icon: '💳' },
];

function formatDateLabel(d: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Hari ini, ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Kemarin, ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isDateInRange(d: Date, start: Date, end: Date): boolean {
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return day >= s && day <= e;
}

export const CardActivityLogScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CardActivityLog'>>();
  const card = route.params?.card;

  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const filteredActivities = useMemo(() => {
    return MOCK_ACTIVITIES.filter((a) => isDateInRange(a.date, startDate, endDate));
  }, [startDate, endDate]);

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

  const formatDisplayDate = (d: Date) =>
    d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top'] as const}>
      <View style={[styles.header, { paddingHorizontal: paddingH }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('home.cardActivityLog')}
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
            {t('news.dateRange') || 'Rentang Tanggal'}
          </Text>
          <View style={styles.dateRangeRow}>
            <TouchableOpacity
              style={[styles.dateChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowStartPicker(true)}
            >
              <Calendar size={scale(18)} color={colors.primary} variant="Linear" />
              <Text style={[styles.dateChipText, { color: colors.text }]} numberOfLines={1}>
                {formatDisplayDate(startDate)}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.dateSeparator, { color: colors.textSecondary }]}>–</Text>
            <TouchableOpacity
              style={[styles.dateChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowEndPicker(true)}
            >
              <Calendar size={scale(18)} color={colors.primary} variant="Linear" />
              <Text style={[styles.dateChipText, { color: colors.text }]} numberOfLines={1}>
                {formatDisplayDate(endDate)}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: moderateVerticalScale(20) }]}>
            {t('home.cardTransaction') || 'Transaksi Kartu'}
          </Text>
        </View>

        {filteredActivities.length === 0 ? (
          <View style={[styles.emptyWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.background }]}>
              <ReceiptItem size={scale(40)} color={colors.textSecondary} variant="Linear" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('transaction.noHistory') || 'Tidak ada aktivitas'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              {t('transaction.noHistoryHint') || 'Tidak ada aktivitas pada rentang tanggal yang dipilih'}
            </Text>
          </View>
        ) : (
          <View style={[styles.listWrap, { paddingHorizontal: paddingH }]}>
            {filteredActivities.map((tx) => {
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
                    <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                      {formatDateLabel(tx.date)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]} numberOfLines={1}>
                        {tx.status === 'success' ? '✓ ' : tx.status === 'pending' ? '⏳ ' : '✗ '}
                        {getStatusLabel(tx.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[styles.txAmount, { color: tx.amount >= 0 ? colors.success : colors.text }]}>
                      {tx.amount >= 0 ? '+' : ''}Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <DatePicker
        visible={showStartPicker}
        onClose={() => setShowStartPicker(false)}
        onConfirm={(date) => {
          setStartDate(date);
          setShowStartPicker(false);
        }}
        value={startDate}
        maximumDate={endDate}
        title={t('news.selectStartDate') || 'Pilih Tanggal Mulai'}
      />
      <DatePicker
        visible={showEndPicker}
        onClose={() => setShowEndPicker(false)}
        onConfirm={(date) => {
          setEndDate(date);
          setShowEndPicker(false);
        }}
        value={endDate}
        minimumDate={startDate}
        title={t('news.selectEndDate') || 'Pilih Tanggal Akhir'}
      />
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
    marginBottom: moderateVerticalScale(16),
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
    marginBottom: moderateVerticalScale(10),
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: moderateVerticalScale(10),
    borderRadius: scale(10),
    borderWidth: 1,
    gap: scale(8),
    flex: 1,
    minWidth: scale(120),
  },
  dateChipText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    flex: 1,
  },
  dateSeparator: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  emptyWrap: {
    marginHorizontal: getHorizontalPadding(),
    padding: scale(32),
    borderRadius: scale(16),
    borderWidth: 1,
    alignItems: 'center',
    marginTop: moderateVerticalScale(16),
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
