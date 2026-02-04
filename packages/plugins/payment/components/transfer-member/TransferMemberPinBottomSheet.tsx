/**
 * Transfer Member PIN Bottom Sheet (Member App)
 * Bottom sheet untuk input PIN dengan keypad numerik.
 * Menggunakan reusable BottomSheet component dari @core/config
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
import { PinInput } from '../shared/PinInput';

export interface TransferMemberPinData {
  memberId: string;
  memberName: string;
  memberRefId: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
  note?: string;
}

interface TransferMemberPinBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  data: TransferMemberPinData | null;
  onComplete: (pin: string) => void;
}

const PIN_LENGTH = 6;

export const TransferMemberPinBottomSheet: React.FC<TransferMemberPinBottomSheetProps> = ({
  visible,
  onClose,
  data,
  onComplete,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!visible) return null;

  const handlePinComplete = (pin: string) => {
    onComplete(pin);
  };

  const handleForgotPin = () => {
    // TODO: Implement forgot PIN flow
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      // Lebih pendek biar terasa seperti bottom sheet (bukan full page)
      snapPoints={[80]}
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
            onComplete={handlePinComplete}
            onForgotPin={handleForgotPin}
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
