import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, Clock, Ticket } from 'iconsax-react-nativejs';
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
import { useTabBar } from '../navigation/TabBarContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

function getStatusColor(
  status: SportCenterBookingStatus,
  colors: {
    success: string;
    warning: string;
    error: string;
    textSecondary: string;
    primary: string;
  }
) {
  switch (status) {
    case 'upcoming':
      return colors.primary;
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
      return t('sportCenter.statusUpcoming') || 'Akan Datang';
    case 'completed':
      return t('sportCenter.statusCompleted') || 'Selesai';
    case 'cancelled':
      return t('sportCenter.statusCancelled') || 'Dibatalkan';
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
  const { toggleTabBar } = useTabBar();
  const lastContentOffset = React.useRef(0);

  const handleScroll = (event: any) => {
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
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']}>
        <View
          style={[styles.header, { paddingHorizontal: paddingH, borderBottomColor: colors.border }]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('sportCenter.myBookings') || 'Riwayat Booking'}
          </Text>
          <Calendar size={scale(24)} color={colors.primary} variant="Bold" />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: paddingH, paddingBottom: moderateVerticalScale(100) },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {recentBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={scale(48)} color={colors.textSecondary} variant="Bulk" />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('sportCenter.noBookings') || 'Belum ada booking'}
            </Text>
          </View>
        ) : (
          recentBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={[
                styles.bookingCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('SportCenterBookingDetail', { booking });
              }}
            >
              <View style={styles.bookingHeader}>
                <Text style={[styles.bookingFacilityName, { color: colors.text }]}>
                  {booking.facilityName}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status, colors) + '20' },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: getStatusColor(booking.status, colors) }]}
                  >
                    {getStatusLabel(booking.status, t)}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Calendar size={scale(16)} color={colors.textSecondary} variant="Linear" />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {new Date(booking.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={scale(16)} color={colors.textSecondary} variant="Linear" />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {booking.timeSlot}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ticket size={scale(16)} color={colors.textSecondary} variant="Linear" />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {booking.courtName || 'Lapangan A'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
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
    gap: scale(12),
  },
  emptyText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
  },
  bookingCard: {
    padding: scale(12),
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  bookingFacilityName: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(6),
  },
  statusText: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('small'),
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: scale(12),
  },
  bookingDetails: {
    gap: scale(8),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  detailText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('small'),
  },
});
