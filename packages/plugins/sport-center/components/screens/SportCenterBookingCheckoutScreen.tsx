import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft2, Calendar, Clock, Game, Box1, Lock, ArrowRight2 } from 'iconsax-react-nativejs';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getMinTouchTarget,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useAuth } from '@core/auth';
import { getFacilityById } from '../../hooks';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

export const SportCenterBookingCheckoutScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const params = route.params as {
    facilityId: string;
    date: string; // ISO string
    slot: string; // "19:00"
    courtId?: string;
  };

  const facility = getFacilityById(params?.facilityId);
  const date = new Date(params?.date || new Date());

  // Format date: "Sun, 22 Oct 2023"
  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const startTime = params?.slot || '00:00';
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const endTime = `${(startHour + 1).toString().padStart(2, '0')}:${startMinute
    .toString()
    .padStart(2, '0')}`;

  const courtName = facility?.courts?.find((c) => c.id === params?.courtId)?.name || 'Court';

  const price = facility?.pricePerSlot || 150000;
  const serviceFee = 5000;
  const discount = 0;
  const total = price + serviceFee - discount;

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [voucher, setVoucher] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: '#F6F8F7' }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 12),
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Booking Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + scale(100) },
        ]}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={Platform.select({ android: 100, ios: 0 })}
      >
        {/* Booking Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Image
              source={{
                uri:
                  facility?.imageUrl ||
                  'https://images.unsplash.com/photo-1541252260730-0412e8e2108e',
              }}
              style={styles.facilityImage}
              resizeMode="cover"
            />
            <View style={styles.facilityInfo}>
              <Text style={[styles.facilityName, { color: colors.text }]}>
                {facility?.name || 'Facility Name'} - {courtName}
              </Text>
              <View style={styles.facilityTypeRow}>
                <Game size={scale(14)} color={colors.textSecondary} variant="Bold" />
                <Text style={[styles.facilityType, { color: colors.textSecondary }]}>
                  Mini Soccer
                </Text>
              </View>

              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimeRow}>
                  <Calendar size={scale(14)} color={colors.textSecondary} variant="Bold" />
                  <Text style={[styles.dateTimeText, { color: colors.textSecondary }]}>
                    {dateString}
                  </Text>
                </View>
                <View style={styles.dateTimeRow}>
                  <Clock size={scale(14)} color={colors.textSecondary} variant="Bold" />
                  <Text style={[styles.dateTimeText, { color: colors.textSecondary }]}>
                    {startTime} - {endTime} (1 Hour)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Order Form Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            Booking Details
          </Text>
          <View style={[styles.card, styles.formCard]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Order Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: '#F8FAFC', // slate-50
                    borderColor: '#E2E8F0', // slate-200
                    color: colors.text,
                  },
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: '#F8FAFC', // slate-50
                    borderColor: '#E2E8F0', // slate-200
                    color: colors.text,
                  },
                ]}
                placeholder="email@example.com"
                placeholderTextColor={colors.textSecondary}
                value={user?.email || ''}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>WhatsApp Number</Text>
              <View style={styles.phoneInputContainer}>
                <Text style={[styles.prefix, { color: colors.textSecondary }]}>+62</Text>
                <TextInput
                  style={[
                    styles.phoneInput,
                    {
                      backgroundColor: '#F8FAFC',
                      borderColor: '#E2E8F0',
                      color: colors.text,
                    },
                  ]}
                  placeholder="812 3456 7890"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                />
              </View>
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                Used for booking confirmation and venue entry code.
              </Text>
            </View>
          </View>
        </View>

        {/* Voucher Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Promotions</Text>
          <View style={[styles.card, { padding: scale(16) }]}>
            <View style={styles.voucherRow}>
              <View style={styles.voucherInputContainer}>
                <View style={styles.voucherIcon}>
                  <Box1 size={scale(20)} color={colors.textSecondary} />
                </View>
                <TextInput
                  style={[
                    styles.voucherInput,
                    {
                      backgroundColor: '#F8FAFC',
                      borderColor: '#E2E8F0',
                      color: colors.text,
                    },
                  ]}
                  placeholder="VOUCHER CODE"
                  placeholderTextColor={colors.textSecondary}
                  value={voucher}
                  onChangeText={setVoucher}
                  autoCapitalize="characters"
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  {
                    backgroundColor: 'rgba(56, 224, 123, 0.2)',
                    borderColor: 'rgba(56, 224, 123, 0.2)',
                  },
                ]}
              >
                <Text style={[styles.applyButtonText, { color: colors.primary }]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Payment Breakdown */}
        <View style={[styles.card, { padding: scale(20), gap: scale(12) }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Court Fee</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>
              Rp {price.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Service Fee</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>
              Rp {serviceFee.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.primary }]}>Voucher Discount</Text>
            <Text style={[styles.rowValue, { color: colors.primary, fontFamily: fontBold }]}>
              - Rp {discount}
            </Text>
          </View>
          <View style={[styles.divider, { borderBottomColor: '#E2E8F0' }]} />
          <View style={styles.row}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Payment</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              Rp {total.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: '#fff',
            borderTopColor: '#F1F5F9',
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('PaymentSelectionScreen', {
              totalAmount: total,
              targetScreen: 'SportCenterPaymentSuccess',
              targetParams: {
                bookingData: {
                  id: 'ORD-' + Math.floor(Math.random() * 100000), // Mock ID
                  transactionId: 'TRX-' + Math.floor(Math.random() * 1000000),
                  facilityName: facility?.name,
                  courtName: courtName,
                  date: dateString,
                  timeSlot: `${startTime} - ${endTime}`,
                  userName: name || user?.name || 'Guest',
                  userEmail: user?.email || '-',
                  userPhone: whatsapp || '-',
                  amount: total,
                },
              },
            });
          }}
        >
          <Text style={styles.payButtonText}>Confirm & Pay</Text>
          <ArrowRight2 size={scale(20)} color="#FFF" variant="Linear" />
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
    paddingBottom: scale(12),
    borderBottomWidth: 1,
    zIndex: 10,
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: scale(16),
    fontFamily: fontSemiBold,
  },
  headerSpacer: {
    width: scale(40),
  },
  contentContainer: {
    paddingHorizontal: getHorizontalPadding(),
    paddingTop: scale(24),
    gap: scale(24),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9', // slate-100
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContent: {
    padding: scale(16),
    flexDirection: 'row',
    gap: scale(16),
  },
  facilityImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: scale(14),
    fontFamily: fontBold,
    marginBottom: scale(4),
  },
  facilityTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginBottom: scale(8),
  },
  facilityType: {
    fontSize: scale(12),
    fontFamily: fontRegular,
  },
  dateTimeContainer: {
    gap: scale(4),
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  dateTimeText: {
    fontSize: scale(11),
    fontFamily: fontSemiBold,
  },
  section: {
    gap: scale(12),
  },
  sectionHeader: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: scale(4),
  },
  formCard: {
    padding: scale(20),
    gap: scale(16),
  },
  inputGroup: {
    gap: scale(6),
  },
  label: {
    fontSize: scale(13),
    fontFamily: fontSemiBold,
    marginBottom: scale(2),
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    fontSize: scale(14),
    fontFamily: fontRegular,
  },
  phoneInputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  prefix: {
    position: 'absolute',
    left: scale(16),
    zIndex: 1,
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },
  phoneInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft: scale(56), // space for prefix
    paddingRight: scale(16),
    paddingVertical: scale(12),
    fontSize: scale(14),
    fontFamily: fontRegular,
  },
  helperText: {
    fontSize: scale(10),
    fontFamily: fontRegular,
    fontStyle: 'italic',
    paddingHorizontal: scale(4),
    marginTop: scale(2),
  },
  voucherRow: {
    flexDirection: 'row',
    gap: scale(8),
  },
  voucherInputContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  voucherIcon: {
    position: 'absolute',
    left: scale(12),
    zIndex: 1,
  },
  voucherInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft: scale(40),
    paddingRight: scale(16),
    paddingVertical: scale(12),
    fontSize: scale(13),
    fontFamily: fontSemiBold,
    textTransform: 'uppercase',
  },
  applyButton: {
    paddingHorizontal: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  applyButtonText: {
    fontSize: scale(13),
    fontFamily: fontBold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: scale(13),
    fontFamily: fontRegular,
  },
  rowValue: {
    fontSize: scale(13),
    fontFamily: fontSemiBold,
  },
  divider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    marginVertical: scale(4),
  },
  totalLabel: {
    fontSize: scale(14),
    fontFamily: fontBold,
  },
  totalValue: {
    fontSize: scale(18),
    fontFamily: fontBold,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    opacity: 0.5,
    marginTop: scale(8),
  },
  securityText: {
    fontSize: scale(9),
    fontFamily: fontBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: scale(24),
    borderTopWidth: 1,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    paddingVertical: scale(16),
    borderRadius: 12,
    shadowColor: '#38e07b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: scale(16),
    fontFamily: fontBold,
  },
});
