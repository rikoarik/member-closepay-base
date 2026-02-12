/**
 * SportCenterBookingDetailScreen Component
 * Detail Pesanan / Booking Detail
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft2,
  Send2,
  TickCircle,
  Location,
  Calendar,
  Clock,
  Element3,
  Scan,
  ArrowDown2,
  ArrowUp2,
  Map1,
  CloseCircle,
} from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  ScreenHeader,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useAuth } from '@core/auth';
import type { SportCenterBooking } from '../../models';
import type { SportCenterFacility } from '../../models';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

type ParamList = {
  SportCenterBookingDetail: {
    booking: SportCenterBooking;
  };
};

export const SportCenterBookingDetailScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'SportCenterBookingDetail'>>();
  const paddingH = getHorizontalPadding();

  // Mock booking data if not passed (fallback) or use passed booking
  const booking = route.params?.booking || {
    id: 'TIF-20231022-0941',
    facilityName: 'Tifosi Sport Center',
    facilityImageUrl:
      'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=800&auto=format&fit=crop',
    date: new Date().toISOString(),
    timeSlot: '19:00 - 21:00',
    courtName: 'Lapangan A (Vinyl)',
    status: 'completed',
    amount: 242500,
    address: 'Jl. Raden Inten II No.18, Duren Sawit, Jakarta Timur',
  };

  const [qrCollapsed, setQrCollapsed] = useState(false);

  const toggleQr = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setQrCollapsed(!qrCollapsed);
  };

  // Helper to get status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: '#22C55E', // Green
          backgroundColor: '#22C55E15',
          borderColor: '#22C55E30',
          icon: TickCircle,
          label: t('sportCenter.statusCompleted') || 'Selesai',
        };
      case 'cancelled':
        return {
          color: '#EF4444', // Red
          backgroundColor: '#EF444415',
          borderColor: '#EF444430',
          icon: require('iconsax-react-nativejs').CloseCircle, // Dynamic import or add to imports
          label: t('sportCenter.statusCancelled') || 'Dibatalkan',
        };
      case 'upcoming':
      default:
        return {
          color: '#3B82F6', // Blue
          backgroundColor: '#3B82F615',
          borderColor: '#3B82F630',
          icon: Clock,
          label: t('sportCenter.statusUpcoming') || 'Mendatang',
        };
    }
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  const renderStatusBanner = () => (
    <View style={styles.sectionContainer}>
      <View
        style={[
          styles.statusBanner,
          {
            backgroundColor: statusConfig.backgroundColor,
            borderColor: statusConfig.borderColor,
          },
        ]}
      >
        <View style={styles.statusLeft}>
          <View style={[styles.statusIconCircle, { backgroundColor: statusConfig.color }]}>
            <StatusIcon size={scale(24)} color="#FFF" variant="Bold" />
          </View>
          <View>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              {t('sportCenter.orderStatus') || 'STATUS PESANAN'}
            </Text>
            <Text style={[styles.statusValue, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <View style={styles.statusRight}>
          <Text style={[styles.statusTimeLabel, { color: colors.textSecondary }]}>
            {t('sportCenter.completionTime') || 'WAKTU SELESAI'}
          </Text>
          <Text style={[styles.statusTimeValue, { color: colors.text }]}>22 Okt, 21:00</Text>
        </View>
      </View>
    </View>
  );

  const renderVenueCard = () => (
    <View style={styles.sectionContainer}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.venueImageContainer}>
          <Image
            source={{ uri: booking.facilityImageUrl }}
            style={styles.venueImage}
            resizeMode="cover"
          />
          <View style={[styles.venueCategoryBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.venueCategoryText}>
              {t('sportCenter.categorySports') || 'Sports'}
            </Text>
          </View>
        </View>
        <View style={styles.venueContent}>
          <Text style={[styles.venueName, { color: colors.text }]}>{booking.facilityName}</Text>
          <Text style={[styles.venueAddress, { color: colors.textSecondary }]}>
            {booking.address || 'Jl. Raden Inten II No.18, Duren Sawit, Jakarta Timur'}
          </Text>
          <TouchableOpacity
            style={[
              styles.directionBtn,
              {
                backgroundColor: colors.background,
                borderColor: colors.primary + '30',
              },
            ]}
          >
            <Map1 size={scale(18)} color={colors.primary} variant="Linear" />
            <Text style={[styles.directionBtnText, { color: colors.primary }]}>
              {t('sportCenter.directions') || 'Petunjuk Arah'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderScheduleInfo = () => (
    <View style={styles.sectionContainer}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            padding: scale(16),
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t('sportCenter.scheduleInfo') || 'INFORMASI JADWAL'}
        </Text>
        <View style={styles.scheduleList}>
          {/* Date */}
          <View style={styles.scheduleRow}>
            <View style={[styles.scheduleIconBox, { backgroundColor: colors.primary + '15' }]}>
              <Calendar size={scale(20)} color={colors.primary} variant="Linear" />
            </View>
            <View>
              <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                {t('common.date') || 'Tanggal'}
              </Text>
              <Text style={[styles.scheduleValue, { color: colors.text }]}>
                {new Date(booking.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Time */}
          <View style={styles.scheduleRow}>
            <View style={[styles.scheduleIconBox, { backgroundColor: colors.primary + '15' }]}>
              <Clock size={scale(20)} color={colors.primary} variant="Linear" />
            </View>
            <View>
              <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                {t('common.time') || 'Waktu'}
              </Text>
              <Text style={[styles.scheduleValue, { color: colors.text }]}>
                {booking.timeSlot}{' '}
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: scale(12),
                    fontFamily: fontRegular,
                  }}
                >
                  {t('sportCenter.duration', { count: 2 }) || '(2 Jam)'}
                </Text>
              </Text>
            </View>
          </View>

          {/* Court */}
          <View style={styles.scheduleRow}>
            <View style={[styles.scheduleIconBox, { backgroundColor: colors.primary + '15' }]}>
              <Element3 size={scale(20)} color={colors.primary} variant="Linear" />
            </View>
            <View>
              <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                {t('sportCenter.court') || 'Lapangan'}
              </Text>
              <Text style={[styles.scheduleValue, { color: colors.text }]}>
                {booking.courtName || 'Lapangan A (Vinyl)'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderQrCode = () => (
    <View style={styles.sectionContainer}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            overflow: 'hidden',
          },
        ]}
      >
        <TouchableOpacity style={styles.qrHeader} onPress={toggleQr} activeOpacity={0.7}>
          <View style={styles.qrTitleRow}>
            <Scan size={scale(24)} color={colors.primary} variant="Linear" />
            <Text style={[styles.qrTitle, { color: colors.text }]}>
              {t('sportCenter.bookingCode') || 'Kode Tiket Pesanan'}
            </Text>
          </View>
          {qrCollapsed ? (
            <ArrowDown2 size={scale(20)} color={colors.textSecondary} />
          ) : (
            <ArrowUp2 size={scale(20)} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

        {!qrCollapsed && (
          <View style={[styles.qrContent, { borderTopColor: colors.border }]}>
            <View style={[styles.qrBox, { borderColor: colors.primary + '30' }]}>
              <View style={styles.qrPlaceholder}>
                {/* Replace with actual QR Code component if available */}
                <Scan size={scale(64)} color={colors.text} variant="Bulk" />
              </View>
            </View>
            <Text style={[styles.bookingId, { color: colors.textSecondary }]}>
              ID: {booking.id}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderPaymentSummary = () => (
    <View style={[styles.sectionContainer, { marginBottom: moderateVerticalScale(24) }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            padding: scale(16),
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t('sportCenter.paymentDetails') || 'RINCIAN PEMBAYARAN'}
        </Text>

        <View style={styles.paymentRows}>
          {/* Email Row */}
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
              {t('common.email') || 'Email'}
            </Text>
            <Text style={[styles.paymentValue, { color: colors.text }]}>{user?.email || '-'}</Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
              {t('sportCenter.courtFee') || 'Harga Lapangan'}{' '}
              {t('sportCenter.duration', { count: 2 }) || '(2 Jam)'}
            </Text>
            <Text style={[styles.paymentValue, { color: colors.text }]}>
              Rp {(booking.amount || 240000).toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
              {t('sportCenter.serviceFee') || 'Biaya Layanan'}
            </Text>
            <Text style={[styles.paymentValue, { color: colors.text }]}>Rp 2.500</Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
              {t('sportCenter.paymentMethod') || 'Metode Pembayaran'}
            </Text>
            <View style={styles.paymentMethodRow}>
              <View style={styles.paymentMethodIcon}>
                <Text style={styles.paymentMethodIconText}>G</Text>
              </View>
              <Text style={[styles.paymentValue, { color: colors.text }]}>GoPay</Text>
            </View>
          </View>

          <View
            style={[
              styles.totalRow,
              {
                borderTopColor: colors.border,
                borderStyle: 'dashed',
                borderWidth: 1,
                borderBottomWidth: 0,
                borderLeftWidth: 0,
                borderRightWidth: 0,
              },
            ]}
          >
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              {t('sportCenter.totalPayment') || 'Total Bayar'}
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              Rp {((booking.amount || 240000) + 2500).toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={{ zIndex: 10 }}>
        <ScreenHeader
          title={t('sportCenter.bookingDetail') || 'Detail Pesanan'}
          rightComponent={
            <TouchableOpacity>
              <Send2 size={scale(24)} color={colors.primary} variant="Linear" />
            </TouchableOpacity>
          }
        />
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: paddingH }]}
      >
        {renderStatusBanner()}
        {renderVenueCard()}
        {renderScheduleInfo()}
        {renderQrCode()}
        {renderPaymentSummary()}
      </ScrollView>

      <SafeAreaView
        edges={['bottom']}
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <View style={[styles.footerContent, { paddingHorizontal: paddingH }]}>
          {booking.status === 'completed' ? (
            <>
              <TouchableOpacity style={[styles.footerBtnOutline, { borderColor: colors.primary }]}>
                <Text style={[styles.footerBtnTextOutline, { color: colors.primary }]}>
                  {t('sportCenter.review') || 'Beri Ulasan'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.footerBtnPrimary,
                  { backgroundColor: colors.primary, shadowColor: colors.primary },
                ]}
              >
                <Text style={styles.footerBtnTextPrimary}>
                  {t('sportCenter.bookAgain') || 'Pesan Lagi'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.footerBtnPrimary,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
              ]}
            >
              <Text style={styles.footerBtnTextPrimary}>
                {t('sportCenter.bookAgain') || 'Pesan Lagi'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingVertical: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(120), // Space for footer
  },
  sectionContainer: {
    marginBottom: moderateVerticalScale(16),
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
  },

  // Status Banner
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderRadius: 16,
    borderWidth: 1,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  statusIconCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: scale(10),
    fontFamily: fontSemiBold,
    letterSpacing: 1,
    marginBottom: scale(2),
  },
  statusValue: {
    fontSize: scale(16),
    fontFamily: fontBold,
  },
  statusRight: {
    alignItems: 'flex-end',
  },
  statusTimeLabel: {
    fontSize: scale(9),
    fontFamily: fontRegular,
    textTransform: 'uppercase',
    marginBottom: scale(2),
  },
  statusTimeValue: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
  },

  // Venue Card
  venueImageContainer: {
    height: scale(140),
    borderTopLeftRadius: 15, // slightly less than card radius to fit border
    borderTopRightRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  venueCategoryBadge: {
    position: 'absolute',
    top: scale(12),
    right: scale(12),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: 8,
  },
  venueCategoryText: {
    color: '#FFF',
    fontSize: scale(10),
    fontFamily: fontSemiBold,
  },
  venueContent: {
    padding: scale(16),
  },
  venueName: {
    fontSize: scale(18),
    fontFamily: fontBold,
    marginBottom: scale(4),
  },
  venueAddress: {
    fontSize: scale(12),
    fontFamily: fontRegular,
    lineHeight: scale(18),
    marginBottom: scale(16),
  },
  directionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(10),
    borderRadius: 10,
    borderWidth: 1,
    gap: scale(8),
  },
  directionBtnText: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },

  // Schedule Info
  sectionTitle: {
    fontSize: scale(12),
    fontFamily: fontBold,
    letterSpacing: 1,
    marginBottom: scale(16),
    textTransform: 'uppercase',
  },
  scheduleList: {
    gap: scale(16),
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  scheduleIconBox: {
    width: scale(40),
    height: scale(40),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleLabel: {
    fontSize: scale(11),
    fontFamily: fontRegular,
    marginBottom: scale(2),
  },
  scheduleValue: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },

  // QR Code
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
  },
  qrTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  qrTitle: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },
  qrContent: {
    padding: scale(16),
    paddingTop: scale(20),
    alignItems: 'center',
    borderTopWidth: 1,
  },
  qrBox: {
    width: scale(120),
    height: scale(120),
    backgroundColor: '#F6F8F7',
    borderRadius: 12,
    borderWidth: 2,
    padding: scale(12),
    marginBottom: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingId: {
    fontSize: scale(10),
    fontFamily: 'Menlo', // Monospace font
  },

  // Payment Summary
  paymentRows: {
    gap: scale(12),
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: scale(12),
    fontFamily: fontRegular,
  },
  paymentValue: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  paymentMethodIcon: {
    width: scale(16),
    height: scale(16),
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodIconText: {
    color: '#FFF',
    fontSize: scale(9),
    fontFamily: fontBold,
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: scale(12),
    marginTop: scale(4),
  },
  totalLabel: {
    fontSize: scale(14),
    fontFamily: fontBold,
  },
  totalValue: {
    fontSize: scale(16),
    fontFamily: fontBold,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  footerContent: {
    flexDirection: 'row',
    paddingVertical: moderateVerticalScale(16),
    gap: scale(12),
  },
  footerBtnOutline: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBtnTextOutline: {
    fontSize: scale(14),
    fontFamily: fontBold,
  },
  footerBtnPrimary: {
    flex: 1.5,
    paddingVertical: scale(12),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  footerBtnTextPrimary: {
    color: '#FFF',
    fontSize: scale(14),
    fontFamily: fontBold,
  },
});
