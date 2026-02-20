/**
 * ActivatePinScreen
 * Halaman buat PIN transaksi kartu (untuk user yang belum punya PIN).
 * Satu layar: PIN baru + Konfirmasi PIN baru (6 kotak masing-masing), tombol Konfirmasi.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  getHorizontalPadding,
  getMinTouchTarget,
  FontFamily,
  getResponsiveFontSize,
  scale,
  moderateVerticalScale,
  ScreenHeader,
} from '@core/config';
import { PinDotsInput } from '../PinDotsInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CardParam = {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate?: string;
  gradientColors?: string[];
};

type RouteParams = {
  ActivatePin: { card: CardParam };
};

export const ActivatePinScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ActivatePin'>>();
  const card = route.params?.card;
  const insets = useSafeAreaInsets();

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleBack = () => navigation.goBack();

  const handleNewPinChange = useCallback((pin: string) => {
    setNewPin(pin);
    setError('');
  }, []);

  const handleConfirmPinChange = useCallback((pin: string) => {
    setConfirmPin(pin);
    setError(pin.length === 6 && pin !== newPin ? 'PIN tidak cocok' : '');
  }, [newPin]);

  const handleConfirm = () => {
    if (newPin.length !== 6 || confirmPin.length !== 6 || newPin !== confirmPin) {
      setError('PIN tidak cocok. Silakan periksa lagi.');
      return;
    }
    setError('');
    // TODO: API aktifkan PIN
    Alert.alert(
      t('home.activatePinSuccessTitle'),
      t('home.activatePinSuccessMessage'),
      [{ text: t('common.ok'), onPress: handleBack }]
    );
  };

  const paddingH = getHorizontalPadding();
  const minTouch = getMinTouchTarget();
  const canSubmit = newPin.length === 6 && confirmPin.length === 6 && newPin === confirmPin;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScreenHeader
        title={t('home.activatePinTitle')}
        onBackPress={handleBack}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: paddingH }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        <Text style={[styles.intro, { color: colors.text }]}>{t('home.activatePinIntro1')}</Text>
        <Text style={[styles.intro, { color: colors.text }]}>{t('home.activatePinIntro2')}</Text>
        <Text style={[styles.intro, { color: colors.text, marginBottom: moderateVerticalScale(16) }]}>
          {t('home.activatePinIntro3')}
        </Text>

        <View style={[styles.warningBox, { backgroundColor: colors.warningLight ?? 'rgba(245,158,11,0.12)', borderColor: colors.warning }]}>
          <Text style={[styles.warningTitle, { color: colors.text }]}>{t('home.activatePinWarningTitle')}</Text>
          <Text style={[styles.warningItem, { color: colors.text }]}>{t('home.activatePinWarning1')}</Text>
          <Text style={[styles.warningItem, { color: colors.text }]}>{t('home.activatePinWarning2')}</Text>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>{t('home.activatePinLabelNew')}</Text>
        <View style={styles.pinWrap}>
          <PinDotsInput
            length={6}
            onChange={handleNewPinChange}
            autoSubmit={false}
          />
        </View>

        <Text style={[styles.label, { color: colors.text, marginTop: moderateVerticalScale(20) }]}>
          {t('home.activatePinLabelConfirm')}
        </Text>
        <View style={styles.pinWrap}>
          <PinDotsInput
            key="confirm"
            length={6}
            onChange={handleConfirmPinChange}
            autoSubmit={false}
          />
        </View>
        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : null}
      </ScrollView>
      <View
        style={[
          styles.confirmBtnWrap,
          {
            paddingBottom: insets.bottom + moderateVerticalScale(12),
            paddingHorizontal: paddingH,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: canSubmit ? colors.primary : colors.border }]}
          onPress={handleConfirm}
          disabled={!canSubmit}
          activeOpacity={0.8}
        >
          <Text style={[styles.confirmBtnText, { color: colors.surface }]}>
            {t('common.confirm')}
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
    justifyContent: 'space-between',
    paddingVertical: moderateVerticalScale(12),
  },
  backBtn: {
    minWidth: getMinTouchTarget(),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: moderateVerticalScale(72),
  },
  confirmBtnWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: moderateVerticalScale(12),
  },
  title: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
  },
  intro: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: scale(4),
    lineHeight: scale(20),
  },
  warningBox: {
    padding: scale(14),
    borderRadius: scale(10),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(24),
  },
  warningTitle: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: scale(8),
  },
  warningItem: {
    fontSize: getResponsiveFontSize('xsmall'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: scale(4),
    paddingLeft: scale(8),
  },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: scale(10),
  },
  pinWrap: {
    marginBottom: scale(8),
  },
  errorText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: scale(8),
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
});
