/**
 * Invoice Payment PIN Bottom Sheet
 * Reuses PinInput from payment plugin
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { BottomSheet } from '@core/config';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { PinInput } from '@plugins/payment'; // Using alias if available, otherwise direct import might be needed

interface InvoicePaymentPinBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (pin: string) => void;
}

const PIN_LENGTH = 6;

export const InvoicePaymentPinBottomSheet: React.FC<InvoicePaymentPinBottomSheetProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[100]}
      initialSnapPoint={0}
      enablePanDownToClose={false}
      disableClose={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('topUp.enterPin')}</Text>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.content}>
          <PinInput
            length={PIN_LENGTH}
            onComplete={onComplete}
            onForgotPin={() => {}} // TODO: Implement if needed
            autoSubmit
            autoSubmitDelay={300}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const horizontalPadding = getHorizontalPadding();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(24),
  },
  headerSide: {
    width: scale(40),
    height: scale(40),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingTop: moderateVerticalScale(8),
  },
});
