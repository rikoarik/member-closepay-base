/**
 * VirtualCardTopUpAmountScreen
 * Input nominal untuk top up kartu virtual (dipanggil dari VirtualCardDetail).
 * Flow: nominal → TopUpMemberSummary (inquiry) → PIN → Success.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
} from '@core/config';

export interface VirtualCardTopUpCardParams {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  gradientColors: string[];
  orbColors?: string[];
  avatarUrl?: string;
}

interface RouteParams {
  card: VirtualCardTopUpCardParams;
}

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000];

function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 8) return cardNumber;
  return cleaned.slice(-4).padStart(cleaned.length, '•');
}

export const VirtualCardTopUpAmountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = route.params as RouteParams | undefined;
  const card = params?.card;

  const [amount, setAmount] = useState('');
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue, 10).toLocaleString('id-ID');
  };

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    setAmount(numericValue);
    setSelectedQuickAmount(null);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    setSelectedQuickAmount(quickAmount);
  };

  const handleNext = () => {
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    if (numericAmount <= 0 || !card) return;

    const adminFee = Math.round(numericAmount * 0.1);
    const totalAmount = numericAmount + adminFee;

    (navigation as any).navigate('TopUpMemberSummary', {
      tabType: 'virtual-card',
      balanceTarget: card.id,
      balanceTargetName: t('home.virtualCard'),
      amount: numericAmount,
      memberId: card.id,
      memberName: card.cardHolderName,
      cardId: card.id,
      cardNumber: card.cardNumber,
      cardHolderName: card.cardHolderName,
      adminFee,
      totalAmount,
    });
  };

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const displayAmount = numericAmount > 0 ? formatCurrency(amount) : '';

  if (!card) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('home.topUpCard')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorWrap}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {t('common.error')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('home.topUpCard')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + moderateVerticalScale(24) }]}
      >
        <View
          style={[
            styles.cardSummary,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('home.virtualCard')}
          </Text>
          <Text style={[styles.cardNumberMasked, { color: colors.text }]} numberOfLines={1}>
            {maskCardNumber(card.cardNumber)}
          </Text>
          <Text style={[styles.cardHolder, { color: colors.textSecondary }]} numberOfLines={1}>
            {card.cardHolderName}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('topUp.amount')}</Text>
          <View
            style={[
              styles.amountContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
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
          </View>

          <Text style={[styles.quickAccessLabel, { color: colors.textSecondary }]}>
            {t('topUp.quickAccess')}
          </Text>
          <View style={styles.quickAccessContainer}>
            {QUICK_AMOUNTS.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAccessButton,
                  {
                    backgroundColor:
                      selectedQuickAmount === quickAmount ? colors.primary : colors.surface,
                    borderColor:
                      selectedQuickAmount === quickAmount ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleQuickAmount(quickAmount)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.quickAccessButtonText,
                    {
                      color:
                        selectedQuickAmount === quickAmount ? colors.surface : colors.text,
                    },
                  ]}
                >
                  Rp {formatCurrency(quickAmount.toString())}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: numericAmount > 0 ? colors.primary : colors.border,
              opacity: numericAmount > 0 ? 1 : 0.5,
            },
          ]}
          onPress={handleNext}
          disabled={numericAmount <= 0}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, { color: colors.surface }]}>
            {t('common.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const minTouchTarget = getMinTouchTarget();
const horizontalPadding = getHorizontalPadding();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalPadding,
    paddingBottom: moderateVerticalScale(12),
  },
  backButton: {
    padding: moderateVerticalScale(8),
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: minTouchTarget,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalPadding,
  },
  errorText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(24),
  },
  cardSummary: {
    padding: moderateScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(24),
  },
  cardLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(4),
  },
  cardNumberMasked: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(4),
  },
  cardHolder: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  section: {
    marginBottom: moderateVerticalScale(24),
  },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(8),
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  currencyPrefix: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginRight: scale(8),
  },
  amountInput: {
    flex: 1,
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    padding: 0,
  },
  quickAccessLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: moderateVerticalScale(12),
    marginBottom: moderateVerticalScale(8),
  },
  quickAccessContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  quickAccessButton: {
    minWidth: scale(72),
    flex: 1,
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(8),
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
    borderTopWidth: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
  },
  nextButton: {
    width: '100%',
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
  nextButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});
