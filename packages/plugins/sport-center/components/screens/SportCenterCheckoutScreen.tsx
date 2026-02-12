/**
 * SportCenterCheckoutScreen Component
 * Input form: Name, Phone, Voucher, Payment options (DP/Full) - KeyboardAwareScrollView (Ayo style)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { ArrowLeft2, TickCircle } from 'iconsax-react-nativejs';
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
import { useAuth } from '@core/auth';
import { useSportCenterBookings } from '../../hooks';
import { paymentService } from '@plugins/payment';
import { SportCenterPaymentPinBottomSheet } from '../sheets/SportCenterPaymentPinBottomSheet';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

type PaymentMethod = 'full' | 'dp';

export const SportCenterCheckoutScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const paddingH = getHorizontalPadding();
  const insets = useSafeAreaInsets();
  const { addBooking } = useSportCenterBookings();

  const params = route.params as
    | {
        facilityId?: string;
        facilityName?: string;
        pricePerSlot?: number;
        selectedDate?: string;
        selectedCourt?: string;
        selectedSlots?: string[];
        totalAmount?: number;
      }
    | undefined;

  const facilityId = params?.facilityId ?? '';
  const facilityName = params?.facilityName ?? '';
  const totalAmount = params?.totalAmount ?? 0;
  const selectedSlots = params?.selectedSlots ?? [];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('full');
  const [showPinSheet, setShowPinSheet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0;

  const handleBook = () => {
    setShowPinSheet(true);
  };

  const handlePinComplete = async (pin: string) => {
    if (!canSubmit || !facilityId || selectedSlots.length === 0) return;

    setShowPinSheet(false);
    setIsProcessing(true);

    try {
      const actualAmount = paymentMethod === 'full' ? totalAmount : Math.ceil(totalAmount * 0.5);

      const result = await paymentService.payWithBalance(actualAmount, `ORD-SC-${Date.now()}`, {
        facilityId,
        facilityName,
        selectedSlots,
        pin,
      });

      if (result.status === 'success') {
        const pricePerSlot = params?.pricePerSlot ?? Math.floor(totalAmount / selectedSlots.length);
        selectedSlots.forEach((slot) => {
          addBooking({
            facilityId,
            facilityName,
            category: 'gym',
            date: params?.selectedDate ?? '',
            timeSlot: slot,
            status: 'upcoming',
            amount: pricePerSlot,
            userEmail: user?.email,
          });
        });

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' as never }, { name: 'SportCenterMyBookings' as never }],
          })
        );
      }
    } catch (error) {
      console.error('Checkout payment failed:', error);
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { paddingHorizontal: paddingH }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('sportCenter.checkout')}
        </Text>
      </View>

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: paddingH }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={20}
      >
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.facilityName, { color: colors.text }]}>{facilityName}</Text>
          <Text style={[styles.summaryDetail, { color: colors.textSecondary }]}>
            {selectedSlots.length} slot • Rp {totalAmount.toLocaleString('id-ID')}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('sportCenter.namePlaceholder')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground || colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={t('sportCenter.namePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('sportCenter.phonePlaceholder')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground || colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={t('sportCenter.phonePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('sportCenter.voucherPlaceholder')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground || colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={t('sportCenter.voucherPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={voucherCode}
            onChangeText={setVoucherCode}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('sportCenter.paymentMethod') || 'Metode Pembayaran'}
        </Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'full' ? colors.primary + '08' : colors.surface,
                borderColor: paymentMethod === 'full' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setPaymentMethod('full')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentOptionContent}>
              <View style={styles.paymentOptionInfo}>
                <Text style={[styles.paymentOptionTitle, { color: colors.text }]}>
                  {t('sportCenter.payFull') || 'Bayar Lunas'}
                </Text>
                <Text style={[styles.paymentOptionPrice, { color: colors.primary }]}>
                  Rp {totalAmount.toLocaleString('id-ID')}
                </Text>
              </View>
              <TickCircle
                size={scale(24)}
                color={paymentMethod === 'full' ? colors.primary : colors.border}
                variant={paymentMethod === 'full' ? 'Bold' : 'Linear'}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'dp' ? colors.primary + '08' : colors.surface,
                borderColor: paymentMethod === 'dp' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setPaymentMethod('dp')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentOptionContent}>
              <View style={styles.paymentOptionInfo}>
                <Text style={[styles.paymentOptionTitle, { color: colors.text }]}>
                  {t('sportCenter.payDP') || 'Bayar DP (50%)'}
                </Text>
                <Text style={[styles.paymentOptionPrice, { color: colors.primary }]}>
                  Rp {Math.ceil(totalAmount * 0.5).toLocaleString('id-ID')}
                </Text>
              </View>
              <TickCircle
                size={scale(24)}
                color={paymentMethod === 'dp' ? colors.primary : colors.border}
                variant={paymentMethod === 'dp' ? 'Bold' : 'Linear'}
              />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

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
        <TouchableOpacity
          style={[
            styles.bookButton,
            {
              backgroundColor: canSubmit && !isProcessing ? colors.primary : colors.border,
              minHeight: getMinTouchTarget(),
            },
          ]}
          onPress={handleBook}
          disabled={!canSubmit || isProcessing}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.bookButtonText,
              {
                color: canSubmit && !isProcessing ? colors.surface : colors.textSecondary,
                fontSize: getResponsiveFontSize('medium'),
              },
            ]}
          >
            {isProcessing
              ? 'Processing...'
              : `${t('sportCenter.bookNow')} - Rp ${totalAmount.toLocaleString('id-ID')}`}
          </Text>
        </TouchableOpacity>
      </View>

      <SportCenterPaymentPinBottomSheet
        visible={showPinSheet}
        onClose={() => setShowPinSheet(false)}
        onComplete={handlePinComplete}
      />
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
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: moderateVerticalScale(24),
    backgroundColor: '#F8F9FF',
  },
  facilityName: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
    marginBottom: scale(6),
  },
  summaryDetail: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('small'),
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: moderateVerticalScale(20),
  },
  label: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('small'),
    marginBottom: scale(10),
  },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
  },
  sectionTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  paymentOptions: {
    gap: scale(12),
  },
  paymentOption: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
    borderRadius: 16,
    borderWidth: 1.5,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentOptionInfo: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
    marginBottom: 4,
  },
  paymentOptionPrice: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
  },
  footer: {
    paddingVertical: moderateVerticalScale(16),
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookButton: {
    borderRadius: 16,
    paddingVertical: moderateVerticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontFamily: fontSemiBold,
  },
});
