/**
 * SetPinFlowScreen
 * Halaman setelah memilih opsi dari bottom sheet Atur PIN: Nonaktifkan / Ganti / Lupa PIN.
 * - Nonaktifkan: judul, peringatan, instruksi, input PIN, Konfirmasi.
 * - Ganti PIN: Satu layar dengan PIN lama, PIN baru, Konfirmasi PIN baru.
 * - Lupa PIN: Verifikasi, teks OTP ke email, tampilkan email, input OTP.
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useAuth } from '@core/auth';
import {
  getHorizontalPadding,
  getMinTouchTarget,
  FontFamily,
  getResponsiveFontSize,
  scale,
  moderateVerticalScale,
} from '@core/config';
import { PinDotsInput } from '../PinDotsInput';
import type { SetPinAction } from '../SetPinOptionsSheet';

type CardParam = {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate?: string;
  gradientColors?: string[];
};

type RouteParams = {
  SetPinFlow: { card: CardParam; action: SetPinAction };
};

const ACTION_TITLE_KEYS: Record<SetPinAction, string> = {
  deactivate: 'home.setPinDeactivate',
  change: 'home.setPinChange',
  forgot: 'home.setPinForgot',
};

export const SetPinFlowScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'SetPinFlow'>>();
  const { user } = useAuth();
  const { card, action } = route.params ?? {};
  const insets = useSafeAreaInsets();

  const [pin, setPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changeError, setChangeError] = useState('');
  const [otp, setOtp] = useState('');

  const handleBack = () => navigation.goBack();

  const handleDeactivateConfirm = () => {
    if (pin.length !== 6) return;
    // TODO: API nonaktifkan PIN dengan pin
    handleBack();
  };

  const handleOldPinChange = useCallback((value: string) => {
    setOldPin(value);
    setChangeError('');
  }, []);

  const handleNewPinChange = useCallback((value: string) => {
    setNewPin(value);
    setChangeError('');
  }, []);

  const handleConfirmPinChange = useCallback((value: string) => {
    setConfirmPin(value);
    setChangeError(value.length === 6 && value !== newPin ? t('home.changePinMismatch') : '');
  }, [newPin, t]);

  const handleChangePinConfirm = useCallback(() => {
    if (confirmPin.length !== 6 || newPin !== confirmPin) {
      setChangeError(t('home.changePinMismatch'));
      return;
    }
    setChangeError('');
    // TODO: API ganti PIN (oldPin, newPin)
    handleBack();
  }, [confirmPin, newPin, t]);

  const handleForgotOtpSubmit = useCallback(() => {
    if (otp.length !== 6) return;
    // TODO: API verifikasi OTP lalu reset PIN
    handleBack();
  }, [otp]);

  const paddingH = getHorizontalPadding();
  const minTouch = getMinTouchTarget();
  const titleKey = ACTION_TITLE_KEYS[action ?? 'change'];
  const isDeactivate = action === 'deactivate';
  const isChange = action === 'change';
  const isForgot = action === 'forgot';
  const userEmail = user?.email ?? '';
  const canChangeSubmit = oldPin.length === 6 && newPin.length === 6 && confirmPin.length === 6 && newPin === confirmPin;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: paddingH }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {t(titleKey)}
        </Text>
        <View style={{ width: minTouch }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingHorizontal: paddingH }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isDeactivate ? (
          <>
            <Text style={[styles.deactivateTitle, { color: colors.text }]}>
              {t('home.deactivatePinTitle')}
            </Text>
            <View style={[styles.warningBox, { backgroundColor: colors.warningLight ?? 'rgba(245,158,11,0.12)', borderColor: colors.warning }]}>
              <Text style={[styles.warningTitle, { color: colors.text }]}>{t('home.deactivatePinWarningTitle')}</Text>
              <Text style={[styles.warningText, { color: colors.text }]}>{t('home.deactivatePinWarning')}</Text>
            </View>
            <Text style={[styles.instruction, { color: colors.text }]}>
              {t('home.deactivatePinInstruction')}
            </Text>
            <View style={styles.pinWrap}>
              <PinDotsInput
                length={6}
                onChange={setPin}
                autoSubmit={false}
              />
            </View>
          </>
        ) : isChange ? (
          <>
            <Text style={[styles.label, { color: colors.text }]}>{t('home.changePinLabelOld')}</Text>
            <View style={[styles.pinWrap, styles.changePinRow]}>
              <PinDotsInput length={6} onChange={handleOldPinChange} autoSubmit={false} />
            </View>
            <Text style={[styles.label, styles.changePinLabelNext, { color: colors.text }]}>
              {t('home.changePinLabelNew')}
            </Text>
            <View style={[styles.pinWrap, styles.changePinRow]}>
              <PinDotsInput length={6} onChange={handleNewPinChange} autoSubmit={false} />
            </View>
            <Text style={[styles.label, styles.changePinLabelNext, { color: colors.text }]}>
              {t('home.changePinLabelConfirm')}
            </Text>
            <View style={[styles.pinWrap, styles.changePinRow]}>
              <PinDotsInput
                key="change-confirm"
                length={6}
                onChange={handleConfirmPinChange}
                autoSubmit={false}
              />
            </View>
            {changeError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{changeError}</Text>
            ) : null}
          </>
        ) : isForgot ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('home.forgotPinVerificationTitle')}
            </Text>
            <Text style={[styles.instruction, { color: colors.text, marginBottom: scale(8) }]}>
              {t('home.forgotPinOtpSentToEmail')}
            </Text>
            {userEmail ? (
              <Text style={[styles.emailText, { color: colors.primary, marginBottom: moderateVerticalScale(24) }]}>
                {userEmail}
              </Text>
            ) : (
              <Text style={[styles.emailText, { color: colors.textSecondary, marginBottom: moderateVerticalScale(24) }]}>
                —
              </Text>
            )}
            <Text style={[styles.label, { color: colors.text }]}>{t('auth.otp')}</Text>
            <View style={styles.pinWrap}>
              <PinDotsInput
                length={6}
                onChange={setOtp}
                autoSubmit={false}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

      {(isDeactivate || isChange || isForgot) ? (
        <View style={[styles.confirmBtnWrap, { paddingBottom: insets.bottom + moderateVerticalScale(12), paddingHorizontal: paddingH, backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              {
                backgroundColor: isDeactivate
                  ? (pin.length === 6 ? colors.primary : colors.border)
                  : isChange
                    ? (canChangeSubmit ? colors.primary : colors.border)
                    : (otp.length === 6 ? colors.primary : colors.border),
              },
            ]}
            onPress={isDeactivate ? handleDeactivateConfirm : isChange ? handleChangePinConfirm : handleForgotOtpSubmit}
            disabled={
              isDeactivate ? pin.length !== 6 : isChange ? !canChangeSubmit : otp.length !== 6
            }
            activeOpacity={0.8}
          >
            <Text style={[styles.confirmBtnText, { color: colors.surface }]}>{t('common.confirm')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
    flex: 1,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingTop: moderateVerticalScale(24),
    paddingBottom: moderateVerticalScale(72),
  },
  confirmBtnWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: moderateVerticalScale(12),
  },
  deactivateTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
  },
  warningBox: {
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(24),
  },
  warningTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: scale(8),
  },
  warningText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: scale(20),
  },
  instruction: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(16),
  },
  pinWrap: {
    marginBottom: moderateVerticalScale(24),
  },
  changePinRow: {
    marginBottom: moderateVerticalScale(12),
  },
  changePinLabelNext: {
    marginTop: moderateVerticalScale(12),
  },
  confirmBtn: {
    paddingVertical: moderateVerticalScale(14),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: scale(10),
  },
  pinDotsPlaceholder: {
    paddingVertical: scale(12),
    marginBottom: scale(4),
  },
  pinDotsText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  errorText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: scale(8),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
  },
  emailText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  cardInfo: {
    padding: scale(20),
    borderRadius: scale(12),
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(24),
  },
  cardName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginTop: scale(12),
  },
  cardNumber: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: scale(4),
  },
  placeholder: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
});
