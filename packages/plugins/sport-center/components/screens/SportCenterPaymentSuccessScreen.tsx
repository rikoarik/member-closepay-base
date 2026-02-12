import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, TickCircle, DocumentDownload, Refresh } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { scale, getHorizontalPadding, FontFamily, moderateVerticalScale } from '@core/config';
import { useTranslation } from '@core/i18n';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BookingData {
  id: string; // Order ID
  transactionId: string;
  facilityName: string;
  courtName: string;
  date: string;
  timeSlot: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  amount: number;
}

export const SportCenterPaymentSuccessScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // Mock data if params are missing (for dev/testing)
  const defaultBooking: BookingData = {
    id: '698d2b57a5e25944a358dce0',
    transactionId: '698d2b57a5e25944a358dcdf',
    facilityName: 'Sport Center',
    courtName: 'Lapangan Badminton',
    date: new Date().toISOString(),
    timeSlot: '09.00 - 10.00',
    userName: 'User',
    userEmail: 'user@example.com',
    userPhone: '-',
    amount: 10000,
  };

  const params = route.params as { bookingData?: BookingData } | undefined;
  const booking = params?.bookingData || defaultBooking;

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft2 size={scale(20)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>E-Ticket Pembayaran</Text>
        <View style={{ width: scale(40) }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + scale(100) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Message */}
        <View style={styles.successSection}>
          <View style={[styles.successIconBg, { backgroundColor: '#DCFCE7' }]}>
            <TickCircle size={scale(48)} color="#22C55E" variant="Bold" />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Pembayaran Berhasil!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Simpan e-ticket ini untuk check-in di lokasi
          </Text>
        </View>

        {/* Ticket Card */}
        <View style={[styles.ticketCard, { backgroundColor: colors.surface }]}>
          {/* Top Section */}
          <View style={styles.ticketContent}>
            <View style={styles.statusRow}>
              <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>INFORMASI</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusLabel}>STATUS</Text>
                <View style={[styles.statusChip, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.statusText, { color: '#16A34A' }]}>Berhasil</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Id Transaksi</Text>
                <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
                  {booking.transactionId}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Id Order</Text>
                <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
                  {booking.id}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Lapangan</Text>
                <Text style={[styles.value, styles.valueBold, { color: colors.text }]}>
                  {booking.courtName}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Jam</Text>
                <Text style={[styles.value, styles.valueBold, { color: colors.text }]}>
                  {booking.timeSlot}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Nama</Text>
                <Text style={[styles.value, styles.valueBold, { color: colors.text }]}>
                  {booking.userName}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Total Bayar</Text>
                <Text style={[styles.value, styles.valueBold, { color: colors.primary }]}>
                  Rp {booking.amount.toLocaleString('id-ID')}
                </Text>
              </View>

              <View style={[styles.detailItem, styles.fullWidth]}>
                <View style={styles.contactRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                    <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
                      {booking.userEmail}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>WhatsApp</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{booking.userPhone}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Cutout Divider */}
          <View style={[styles.cutoutRow, { backgroundColor: '#F8FAFC' }]}>
            <View
              style={[styles.cutoutCircle, styles.cutoutLeft, { backgroundColor: '#F8FAFC' }]}
            />
            <View style={[styles.dashedLine, { borderColor: '#E2E8F0' }]} />
            <View
              style={[styles.cutoutCircle, styles.cutoutRight, { backgroundColor: '#F8FAFC' }]}
            />
          </View>

          {/* QR Code Section */}
          <View style={[styles.qrSection, { backgroundColor: colors.surface }]}>
            <View style={styles.qrContainer}>
              <Image
                source={{
                  uri:
                    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + booking.id,
                }}
                style={styles.qrImage}
              />
            </View>
            <Text style={[styles.scanText, { color: colors.textSecondary }]}>
              PINDAI SAAT TIBA DI LOKASI
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { backgroundColor: 'rgba(248,250,252,0.9)' }]}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
          <DocumentDownload size={scale(20)} color="#FFF" />
          <Text style={styles.actionButtonText}>Simpan ke Galeri</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.outlineButton,
            { borderColor: '#E2E8F0', backgroundColor: colors.surface },
          ]}
        >
          <Refresh size={scale(20)} color={colors.textSecondary} />
          <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
            Refresh Status
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingBottom: scale(16),
    zIndex: 10,
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: scale(16),
    fontFamily: fontSemiBold,
    letterSpacing: -0.5,
  },
  contentContainer: {
    paddingHorizontal: scale(16),
    paddingTop: scale(8),
  },
  successSection: {
    alignItems: 'center',
    marginBottom: scale(32),
  },
  successIconBg: {
    width: scale(80),
    height: scale(80),
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  successTitle: {
    fontSize: scale(20),
    fontFamily: fontBold,
    marginBottom: scale(4),
  },
  successSubtitle: {
    fontSize: scale(12),
    fontFamily: fontRegular,
  },
  ticketCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  ticketContent: {
    padding: scale(24),
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scale(24),
  },
  sectionHeader: {
    fontSize: scale(11),
    fontFamily: fontSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadge: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: scale(9),
    fontFamily: fontBold,
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: scale(4),
  },
  statusChip: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: 12,
  },
  statusText: {
    fontSize: scale(10),
    fontFamily: fontBold,
    textTransform: 'uppercase',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(16),
  },
  detailItem: {
    width: '45%', // slightly less than half to account for gap
    marginBottom: scale(4),
  },
  fullWidth: {
    width: '100%',
  },
  contactRow: {
    flexDirection: 'row',
    gap: scale(16),
  },
  label: {
    fontSize: scale(10),
    fontFamily: fontSemiBold,
    textTransform: 'uppercase',
    color: '#94A3B8',
    marginBottom: scale(4),
  },
  value: {
    fontSize: scale(12),
    fontFamily: fontRegular,
  },
  valueBold: {
    fontSize: scale(13),
    fontFamily: fontSemiBold,
  },
  cutoutRow: {
    height: scale(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    marginHorizontal: scale(20),
  },
  cutoutCircle: {
    width: scale(20),
    height: scale(20),
    borderRadius: 10,
    position: 'absolute',
    top: 2, // Slight adjustment to center visually
  },
  cutoutLeft: {
    left: -10,
  },
  cutoutRight: {
    right: -10,
  },
  qrSection: {
    padding: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrContainer: {
    padding: scale(12),
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: scale(16),
  },
  qrImage: {
    width: scale(140),
    height: scale(140),
  },
  scanText: {
    fontSize: scale(10),
    fontFamily: fontBold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: scale(16),
    gap: scale(12),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(16),
    borderRadius: 16,
    gap: scale(8),
  },
  outlineButton: {
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: scale(14),
    fontFamily: fontBold,
    color: '#FFF',
  },
});
