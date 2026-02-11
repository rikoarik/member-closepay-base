/**
 * SportCenterMyBookingsScreen Component
 * Riwayat booking user
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useSportCenterBookings } from '../../hooks';
import type { SportCenterBooking, SportCenterBookingStatus } from '../../models';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

function formatBookingDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = today.toDateString() === d.toDateString();
  if (isToday) return 'Hari ini';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return 'Besok';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function getStatusColor(status: SportCenterBookingStatus, colors: { success: string; warning: string; error: string; textSecondary: string }) {
  switch (status) {
    case 'upcoming':
      return colors.warning;
    case 'completed':
      return colors.success;
    case 'cancelled':
      return colors.error;
    default:
      return colors.textSecondary;
  }
}

function getStatusLabel(status: SportCenterBookingStatus, t: (key: string) => string): string {
  switch (status) {
    case 'upcoming':
      return t('sportCenter.statusUpcoming') || 'Upcoming';
    case 'completed':
      return t('sportCenter.statusCompleted') || 'Completed';
    case 'cancelled':
      return t('sportCenter.statusCancelled') || 'Cancelled';
    default:
      return status;
  }
}

export const SportCenterMyBookingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const paddingH = getHorizontalPadding();
  const { recentBookings } = useSportCenterBookings();

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
          {t('sportCenter.myBookings')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: paddingH }]}
        showsVerticalScrollIndicator={false}
      >
        {recentBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('sportCenter.comingSoon')}
            </Text>
          </View>
        ) : (
          recentBookings.map((booking: SportCenterBooking) => (
            <TouchableOpacity
              key={booking.id}
              style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              {booking.facilityImageUrl ? (
                <Image
                  source={{ uri: booking.facilityImageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.border }]} />
              )}
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                  {booking.facilityName}
                </Text>
                <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                  {formatBookingDate(booking.date)} • {booking.timeSlot}
                </Text>
                <View style={styles.cardFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(booking.status, colors) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(booking.status, colors) },
                      ]}
                    >
                      {getStatusLabel(booking.status, t)}
                    </Text>
                  </View>
                  <Text style={[styles.amount, { color: colors.primary }]}>
                    Rp {booking.amount.toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
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
    paddingBottom: moderateVerticalScale(32),
  },
  emptyContainer: {
    paddingVertical: moderateVerticalScale(48),
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
  },
  bookingCard: {
    flexDirection: 'row',
    padding: scale(12),
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
  },
  cardImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(8),
    marginRight: scale(12),
  },
  cardImagePlaceholder: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(8),
    marginRight: scale(12),
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
    marginBottom: scale(4),
  },
  cardMeta: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('small'),
    marginBottom: scale(8),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(8),
  },
  statusText: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('xsmall'),
  },
  amount: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
  },
});
