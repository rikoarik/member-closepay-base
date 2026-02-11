/**
 * SportCenterBookingScreen Component
 * Date picker, Court selection, Time grid (multi-slot), Summary bar (Ayo style)
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  getMinTouchTarget,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { TimeSlotSelector } from '../shared';
import type { SportCenterTimeSlot } from '../../models';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

const MOCK_SLOTS: SportCenterTimeSlot[] = [
  { time: '08:00', available: true, price: 50000 },
  { time: '09:00', available: true, price: 50000 },
  { time: '10:00', available: false, price: 50000 },
  { time: '11:00', available: true, price: 50000 },
  { time: '12:00', available: true, price: 50000 },
  { time: '13:00', available: true, price: 50000 },
  { time: '14:00', available: false, price: 50000 },
  { time: '15:00', available: true, price: 50000 },
  { time: '16:00', available: true, price: 50000 },
  { time: '17:00', available: true, price: 50000 },
];

function getNextDays(count: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr);
  const isToday = new Date().toDateString() === d.toDateString();
  if (isToday) return 'Hari ini';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return 'Besok';
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
}

export const SportCenterBookingScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const paddingH = getHorizontalPadding();
  const insets = useSafeAreaInsets();

  const params = route.params as {
    facilityId?: string;
    facilityName?: string;
    pricePerSlot?: number;
    courts?: { id: string; name: string }[];
  } | undefined;

  const facilityId = params?.facilityId ?? '';
  const facilityName = params?.facilityName ?? '';
  const pricePerSlot = params?.pricePerSlot ?? 50000;
  const courts = params?.courts ?? [];

  const [selectedDate, setSelectedDate] = useState<string>(() => getNextDays(1)[0]);
  const [selectedCourt, setSelectedCourt] = useState<string>(courts[0]?.id ?? '');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const dates = useMemo(() => getNextDays(7), []);

  const slotCount = selectedSlots.length;
  const totalAmount = slotCount * pricePerSlot;

  const handleLanjut = () => {
    if (slotCount === 0 || !facilityId) return;
    // @ts-ignore
    navigation.navigate('SportCenterCheckout', {
      facilityId,
      facilityName,
      pricePerSlot,
      selectedDate,
      selectedCourt,
      selectedSlots,
      totalAmount,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: paddingH }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('sportCenter.confirmBooking')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: paddingH }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.facilityName, { color: colors.text }]}>{facilityName}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            {t('sportCenter.selectTime')}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('sportCenter.selectDate')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScroll}
        >
          {dates.map((dateStr) => {
            const isSelected = selectedDate === dateStr;
            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dateChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedDate(dateStr)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dateChipText,
                    { color: isSelected ? colors.surface : colors.text },
                  ]}
                >
                  {formatDateDisplay(dateStr)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {courts.length > 1 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('sportCenter.lapangan')}
            </Text>
            <View style={styles.courtRow}>
              {courts.map((court) => {
                const isSelected = selectedCourt === court.id;
                return (
                  <TouchableOpacity
                    key={court.id}
                    style={[
                      styles.courtChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedCourt(court.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.courtChipText,
                        { color: isSelected ? colors.surface : colors.text },
                      ]}
                    >
                      {court.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <TimeSlotSelector
          slots={MOCK_SLOTS}
          selectedSlots={selectedSlots}
          onSelectSlots={setSelectedSlots}
          multiSelect
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingHorizontal: paddingH,
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.summaryRow}>
          <Text style={[styles.summarySlots, { color: colors.textSecondary }]}>
            {slotCount > 0
              ? t('sportCenter.slotDipilih', { count: slotCount })
              : t('sportCenter.selectTime')}
          </Text>
          <Text style={[styles.summaryTotal, { color: colors.primary }]}>
            Rp {totalAmount.toLocaleString('id-ID')}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.lanjutButton,
            {
              backgroundColor: slotCount > 0 ? colors.primary : colors.border,
              minHeight: getMinTouchTarget(),
            },
          ]}
          onPress={handleLanjut}
          disabled={slotCount === 0}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.lanjutButtonText,
              {
                color: slotCount > 0 ? colors.surface : colors.textSecondary,
                fontSize: getResponsiveFontSize('medium'),
              },
            ]}
          >
            {t('sportCenter.lanjut')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
    gap: scale(12),
  },
  backButton: { padding: scale(4) },
  headerTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('large'),
    flex: 1,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: moderateVerticalScale(120),
  },
  summaryCard: {
    padding: scale(16),
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: moderateVerticalScale(20),
  },
  facilityName: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
    marginBottom: scale(4),
  },
  summaryLabel: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('small'),
  },
  sectionTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
    marginBottom: moderateVerticalScale(12),
  },
  dateScroll: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: moderateVerticalScale(20),
  },
  dateChip: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: 12,
    borderWidth: 1,
  },
  dateChipText: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('small'),
  },
  courtRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: moderateVerticalScale(20),
  },
  courtChip: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: 12,
    borderWidth: 1,
  },
  courtChipText: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('small'),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  summarySlots: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
  },
  summaryTotal: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('large'),
  },
  footer: {
    paddingVertical: moderateVerticalScale(16),
    borderTopWidth: 1,
  },
  lanjutButton: {
    borderRadius: 12,
    paddingVertical: moderateVerticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  lanjutButtonText: {
    fontFamily: fontSemiBold,
  },
});
