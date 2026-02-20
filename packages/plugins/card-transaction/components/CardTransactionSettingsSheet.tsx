/**
 * CardTransactionSettingsSheet
 * Pengaturan Transaksi Kartu: input disabled sampai user klik Ubah.
 * Tooltip = popup kecil di dekat ikon (i), hilang saat tap di luar; posisi menyesuaikan kiri/kanan.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { InfoCircle } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  FontFamily,
  getResponsiveFontSize,
  BottomSheet,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const DEFAULT_LIMIT = '100000';

function formatCurrencyDisplay(value: string): string {
  const num = value.replace(/\D/g, '');
  if (!num) return '';
  return parseInt(num, 10).toLocaleString('id-ID');
}

type TooltipKey = 'title' | 'limitSingle' | 'limitDaily' | 'limitMonthly' | 'limitAccumulation';

const TOOLTIP_KEYS: Record<TooltipKey, string> = {
  title: 'cardTransactionSettings.tooltipTitle',
  limitSingle: 'cardTransactionSettings.tooltipLimitSingle',
  limitDaily: 'cardTransactionSettings.tooltipLimitDaily',
  limitMonthly: 'cardTransactionSettings.tooltipLimitMonthly',
  limitAccumulation: 'cardTransactionSettings.tooltipLimitAccumulation',
};

const TOOLTIP_MAX_WIDTH = scale(280);
const TOOLTIP_PADDING = scale(16);

function clampTooltipLeft(iconX: number, iconWidth: number): number {
  const { width: screenWidth } = Dimensions.get('window');
  const centerUnderIcon = iconX + iconWidth / 2 - TOOLTIP_MAX_WIDTH / 2;
  return Math.max(
    TOOLTIP_PADDING,
    Math.min(screenWidth - TOOLTIP_MAX_WIDTH - TOOLTIP_PADDING, centerUnderIcon)
  );
}

export interface CardTransactionSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (values: {
    limitSingle: string;
    limitDaily: string;
    limitMonthly: string;
    limitAccumulation: string;
    syncWithBalance: boolean;
  }) => void;
}

export const CardTransactionSettingsSheet: React.FC<CardTransactionSettingsSheetProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<TooltipKey | null>(null);
  const [tooltipLayout, setTooltipLayout] = useState<{ left: number; top: number } | null>(null);
  const iconRefs = useRef<Record<TooltipKey, View | null>>({
    title: null,
    limitSingle: null,
    limitDaily: null,
    limitMonthly: null,
    limitAccumulation: null,
  });
  const [limitSingle, setLimitSingle] = useState(DEFAULT_LIMIT);
  const [limitDaily, setLimitDaily] = useState(DEFAULT_LIMIT);
  const [limitMonthly, setLimitMonthly] = useState(DEFAULT_LIMIT);
  const [limitAccumulation, setLimitAccumulation] = useState(DEFAULT_LIMIT);
  const [syncWithBalance, setSyncWithBalance] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsEditing(false);
      setActiveTooltip(null);
      setTooltipLayout(null);
    }
  }, [visible]);

  const handleLimitChange = useCallback(
    (setter: (v: string) => void, text: string) => {
      const num = text.replace(/\D/g, '');
      setter(num);
    },
    []
  );

  const handleSave = useCallback(() => {
    onSave?.({
      limitSingle,
      limitDaily,
      limitMonthly,
      limitAccumulation,
      syncWithBalance,
    });
    setIsEditing(false);
    onClose();
  }, [onSave, onClose, limitSingle, limitDaily, limitMonthly, limitAccumulation, syncWithBalance]);

  const handleBatal = useCallback(() => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [isEditing, onClose]);

  const openTooltip = useCallback((key: TooltipKey) => {
    const ref = iconRefs.current[key];
    if (ref && 'measureInWindow' in ref) {
      (ref as View).measureInWindow((x, y, w, h) => {
        const left = clampTooltipLeft(x, w);
        const top = y + h + scale(6);
        setTooltipLayout({ left, top });
        setActiveTooltip(key);
      });
    } else {
      setActiveTooltip(key);
      const { width } = Dimensions.get('window');
      setTooltipLayout({
        left: clampTooltipLeft(width - scale(40), scale(24)),
        top: 110,
      });
    }
  }, []);

  const closeTooltip = useCallback(() => {
    setActiveTooltip(null);
    setTooltipLayout(null);
  }, []);

  const renderLimitField = (
    labelKey: string,
    tooltipKey: TooltipKey,
    value: string,
    onChange: (v: string) => void
  ) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>{t(labelKey)}</Text>
        <View
          ref={(r) => { iconRefs.current[tooltipKey] = r; }}
          style={styles.infoIconWithTooltip}
          collapsable={false}
        >
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => (activeTooltip === tooltipKey ? closeTooltip() : openTooltip(tooltipKey))}
            style={styles.infoIconWrap}
          >
            <InfoCircle size={scale(16)} color={colors.textSecondary} variant="Linear" />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={[
          styles.currencyInputWrap,
          {
            backgroundColor: isEditing ? colors.surface : (colors.background ?? colors.surface),
            borderColor: colors.border,
            opacity: isEditing ? 1 : 0.9,
          },
        ]}
      >
        <Text style={[styles.currencyPrefix, { color: colors.text }]}>Rp</Text>
        <TextInput
          style={[styles.currencyInput, { color: colors.text }]}
          value={formatCurrencyDisplay(value)}
          onChangeText={(text) => handleLimitChange(onChange, text)}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          editable={isEditing}
        />
      </View>
    </View>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[90]}>
      <View style={styles.container}>
        <KeyboardAwareScrollView
          enableOnAndroid
          enableAutomaticScroll
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.titleRow}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('cardTransactionSettings.title')}
            </Text>
            <View
              ref={(r) => { iconRefs.current.title = r; }}
              style={styles.infoIconWithTooltip}
              collapsable={false}
            >
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => (activeTooltip === 'title' ? closeTooltip() : openTooltip('title'))}
                style={styles.titleInfoIcon}
              >
                <InfoCircle size={scale(18)} color={colors.primary} variant="Linear" />
              </TouchableOpacity>
            </View>
          </View>

          {renderLimitField('cardTransactionSettings.limitSingle', 'limitSingle', limitSingle, setLimitSingle)}
          {renderLimitField('cardTransactionSettings.limitDaily', 'limitDaily', limitDaily, setLimitDaily)}
          {renderLimitField('cardTransactionSettings.limitMonthly', 'limitMonthly', limitMonthly, setLimitMonthly)}
          {renderLimitField('cardTransactionSettings.limitAccumulation', 'limitAccumulation', limitAccumulation, setLimitAccumulation)}

          <TouchableOpacity
            style={[
              styles.checkboxRow,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: isEditing ? 1 : 0.9,
              },
            ]}
            onPress={() => isEditing && setSyncWithBalance(!syncWithBalance)}
            activeOpacity={0.7}
            disabled={!isEditing}
          >
            <View
              style={[
                styles.checkboxBox,
                {
                  borderColor: syncWithBalance ? colors.primary : colors.border,
                  backgroundColor: syncWithBalance ? colors.primary : 'transparent',
                },
              ]}
            >
              {syncWithBalance && (
                <Text style={[styles.checkboxCheckText, { color: colors.surface }]}>✓</Text>
              )}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              {t('cardTransactionSettings.syncWithBalance')}
            </Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                styles.btnCancel,
                { borderColor: colors.primary, backgroundColor: colors.surface },
              ]}
              onPress={handleBatal}
            >
              <Text style={[styles.btnCancelText, { color: colors.primary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.btnSave, { backgroundColor: colors.primary }]}
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
            >
              <Text style={[styles.btnSaveText, { color: colors.surface }]}>
                {isEditing ? t('common.save') : t('cardTransactionSettings.ubah')}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>

      <Modal
        visible={!!activeTooltip}
        transparent
        animationType="fade"
        onRequestClose={closeTooltip}
      >
        <Pressable style={styles.tooltipBackdrop} onPress={closeTooltip}>
          {tooltipLayout && activeTooltip && (
            <View
              style={[
                styles.tooltipPopup,
                {
                  left: tooltipLayout.left,
                  top: tooltipLayout.top,
                  backgroundColor: 'rgba(0,0,0,0.9)',
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.tooltipPopupText} numberOfLines={6}>
                {t(TOOLTIP_KEYS[activeTooltip])}
              </Text>
            </View>
          )}
        </Pressable>
      </Modal>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: { padding: scale(20) },
  scrollContent: { paddingBottom: moderateVerticalScale(100) },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  modalTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  titleInfoIcon: {
    marginLeft: scale(4),
  },
  infoIconWithTooltip: {
    alignItems: 'flex-end',
    marginLeft: scale(4),
  },
  inputGroup: { marginBottom: moderateVerticalScale(14) },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: moderateVerticalScale(6),
  },
  label: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    flex: 1,
  },
  infoIconWrap: {
    marginLeft: 0,
  },
  tooltipBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tooltipPopup: {
    position: 'absolute',
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    borderRadius: scale(8),
    maxWidth: TOOLTIP_MAX_WIDTH,
  },
  tooltipPopupText: {
    color: '#FFFFFF',
    fontSize: getResponsiveFontSize('xsmall'),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: scale(18),
  },
  currencyInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    paddingVertical: moderateVerticalScale(10),
  },
  currencyPrefix: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginRight: scale(8),
  },
  currencyInput: {
    flex: 1,
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    padding: 0,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(10),
    padding: scale(14),
    marginTop: moderateVerticalScale(8),
    marginBottom: moderateVerticalScale(20),
  },
  checkboxBox: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(6),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  checkboxCheckText: {
    fontSize: scale(14),
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: scale(12),
  },
  modalBtn: {
    flex: 1,
    paddingVertical: moderateVerticalScale(14),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnCancel: {},
  btnSave: {},
  btnCancelText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  btnSaveText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});
