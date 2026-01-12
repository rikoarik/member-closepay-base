import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScanBarcode, Edit2, CloseCircle } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NavigationProp } from '@core/navigation';

const { width } = Dimensions.get('window');

interface QrDisplayScreenProps {
  isActive: boolean;
  selectedBalance?: 'plafon' | 'makan' | 'utama';
}

const DEFAULT_QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

export const QrDisplayScreen: React.FC<QrDisplayScreenProps> = ({ isActive, selectedBalance }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<'EditQuickAmount'>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [quickAmounts, setQuickAmounts] = useState<number[]>(DEFAULT_QUICK_AMOUNTS);

  useFocusEffect(
    useCallback(() => {
      const params = route.params as any;
      if (params?.updatedQuickAmounts) {
        setQuickAmounts(params.updatedQuickAmounts);
      }
    }, [route.params])
  );

  const formatCurrency = useCallback((value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue, 10).toLocaleString('id-ID');
  }, []);

  const handleAmountChange = useCallback((text: string) => {
    const numericValue = text.replace(/\D/g, '');
    setAmount(numericValue);
    setSelectedQuickAmount(null);
  }, []);

  const handleClearAmount = useCallback(() => {
    setAmount('');
    setSelectedQuickAmount(null);
  }, []);

  const handleQuickAmount = useCallback((quickAmount: number) => {
    setAmount(quickAmount.toString());
    setSelectedQuickAmount(quickAmount);
  }, []);

  const handleGenerateQR = useCallback(() => {
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    if (numericAmount > 0) {
      console.log('Generate QR with amount:', numericAmount, 'Balance:', selectedBalance);
    }
  }, [amount, selectedBalance]);

  const handleOpenEditModal = useCallback(() => {
    navigation.navigate('EditQuickAmount', {
      quickAmounts,
    });
  }, [navigation, quickAmounts]);

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const displayAmount = numericAmount > 0 ? formatCurrency(amount) : '';
  const canGenerateQR = numericAmount > 0;

  if (!isActive) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, width }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + moderateVerticalScale(80) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, { paddingHorizontal: getHorizontalPadding() }]}>
          {/* Nominal Input Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('qr.amount')}</Text>

            <View
              style={[
                styles.amountContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.currencyPrefix, { color: colors.text }]}>Rp</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={displayAmount}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                selectTextOnFocus
              />
              {numericAmount > 0 && (
                <TouchableOpacity
                  onPress={handleClearAmount}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.clearButton}
                >
                  <CloseCircle size={scale(20)} color={colors.textSecondary} variant="Linear" />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Access Buttons */}
            <View style={styles.quickAccessHeader}>
              <Text style={[styles.quickAccessLabel, { color: colors.textSecondary }]}>
                {t('qr.quickAmount')}
              </Text>
              <TouchableOpacity
                onPress={handleOpenEditModal}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Edit2 size={scale(18)} color={colors.primary} variant="Linear" />
              </TouchableOpacity>
            </View>
            <View style={styles.quickAccessContainer}>
              {quickAmounts.map((quickAmount, index) => {
                const isSelected =
                  selectedQuickAmount === quickAmount ||
                  (numericAmount === quickAmount && amount !== '');
                return (
                  <TouchableOpacity
                    key={`${quickAmount}-${index}`}
                    style={[
                      styles.quickAccessButton,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleQuickAmount(quickAmount)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.quickAccessButtonText,
                        {
                          color: isSelected ? colors.surface : colors.text,
                        },
                      ]}
                    >
                      {formatCurrency(quickAmount.toString())}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Generate QR Button */}
      <SafeAreaView
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <View
          style={{
            paddingHorizontal: getHorizontalPadding(),
            paddingBottom: insets.bottom + moderateVerticalScale(180),
          }}
        >
          <TouchableOpacity
            style={[
              styles.generateButton,
              {
                backgroundColor: canGenerateQR ? colors.primary : colors.border,
                opacity: canGenerateQR ? 1 : 0.5,
              },
            ]}
            onPress={handleGenerateQR}
            disabled={!canGenerateQR}
            activeOpacity={0.8}
          >
            <ScanBarcode size={scale(20)} color={colors.surface} variant="Bold" />
            <Text style={[styles.generateButtonText, { color: colors.surface }]}>
              {t('qr.generateQR')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

    </View>
  );
};

const minTouchTarget = getMinTouchTarget();
const horizontalPadding = getHorizontalPadding();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: moderateVerticalScale(220),
  },
  content: {
    flex: 1,
  },
  inputSection: {
    marginBottom: moderateVerticalScale(32),
  },
  sectionLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: moderateVerticalScale(20),
    borderRadius: scale(16),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(16),
  },
  currencyPrefix: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginRight: scale(12),
  },
  amountInput: {
    flex: 1,
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    padding: 0,
  },
  clearButton: {
    padding: scale(4),
    marginLeft: scale(8),
  },
  quickAccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(12),
  },
  quickAccessLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  quickAccessButton: {
    flex: 1,
    minWidth: scale(100),
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
  quickAccessButtonText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  footer: {
    borderBottomWidth: 1,
    paddingTop: moderateVerticalScale(16),
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    width: '100%',
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(16),
    minHeight: minTouchTarget,
  },
  generateButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});
