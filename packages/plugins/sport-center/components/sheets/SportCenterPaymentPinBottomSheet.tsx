/**
 * Sport Center - Payment PIN Bottom Sheet
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PinInput } from '@plugins/payment';
import {
  scale,
  moderateVerticalScale,
  FontFamily,
  getHorizontalPadding,
  getResponsiveFontSize,
  BottomSheet,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2 } from 'iconsax-react-nativejs';

interface SportCenterPaymentPinBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (pin: string) => void;
}

const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

export const SportCenterPaymentPinBottomSheet: React.FC<SportCenterPaymentPinBottomSheetProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const paddingH = getHorizontalPadding();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[100]}
      initialSnapPoint={0}
      enablePanDownToClose={false}
      disableClose={false}
    >
      <View style={[styles.container, { paddingHorizontal: paddingH }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ArrowLeft2 size={scale(24)} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('payment.enterPin') || 'Masukkan PIN'}
          </Text>
          <View style={{ width: scale(24) }} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('payment.enterPinDescription') ||
              'Masukkan 6 digit PIN keamanan Anda untuk memproses transaksi'}
          </Text>

          <PinInput onComplete={onComplete} autoSubmit={true} />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: moderateVerticalScale(8),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(24),
  },
  backButton: {
    padding: scale(4),
  },
  title: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('large'),
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: moderateVerticalScale(32),
    fontSize: getResponsiveFontSize('small'),
    paddingHorizontal: scale(20),
  },
});
