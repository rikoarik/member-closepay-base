/**
 * SetPinOptionsSheet
 * Bottom sheet dengan 3 opsi: Nonaktifkan PIN, Ganti PIN, Lupa PIN.
 * Pakai Modal RN langsung agar pasti muncul (tidak tergantung BottomSheet core).
 */
import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, Refresh2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  FontFamily,
  getResponsiveFontSize,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

export type SetPinAction = 'deactivate' | 'change' | 'forgot';

interface SetPinOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: SetPinAction) => void;
}

const OPTIONS: { action: SetPinAction; labelKey: string; Icon: typeof Lock }[] = [
  { action: 'deactivate', labelKey: 'home.setPinDeactivate', Icon: Lock },
  { action: 'change', labelKey: 'home.setPinChange', Icon: Refresh2 },
  { action: 'forgot', labelKey: 'home.setPinForgot', Icon: Lock },
];

export const SetPinOptionsSheet: React.FC<SetPinOptionsSheetProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const sheetHeight = Math.min(screenHeight * 0.5, 400);

  const handlePress = (action: SetPinAction) => {
    onSelect(action);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              height: sheetHeight,
              paddingBottom: insets.bottom + scale(24),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
          <View style={styles.container}>
            {OPTIONS.map(({ action, labelKey, Icon }) => (
              <TouchableOpacity
                key={action}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handlePress(action)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight ?? colors.background }]}>
                  <Icon size={scale(22)} color={colors.primary} variant="Linear" />
                </View>
                <Text style={[styles.optionLabel, { color: colors.text }]}>{t(labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    paddingHorizontal: scale(20),
    paddingTop: scale(12),
  },
  dragHandle: {
    width: scale(40),
    height: scale(4),
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: scale(8),
  },
  container: {
    paddingBottom: moderateVerticalScale(16),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(14),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
  },
  iconWrap: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(14),
  },
  optionLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    flex: 1,
  },
});
