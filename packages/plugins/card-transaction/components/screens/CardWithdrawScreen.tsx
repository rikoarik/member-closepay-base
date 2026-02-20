/**
 * CardWithdrawScreen
 * Pencairan dana dari saldo kartu virtual ke saldo utama atau rekening bank
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft2, MoneySend, Wallet, Bank } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  getHorizontalPadding,
  getMinTouchTarget,
  FontFamily,
  getResponsiveFontSize,
  scale,
  moderateVerticalScale,
} from '@core/config';

type CardParam = {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate?: string;
  gradientColors?: string[];
};

type RouteParams = {
  CardWithdraw: { card: CardParam };
};

type Destination = 'main_balance' | 'bank';

const MOCK_CARD_BALANCE = 85350;

export const CardWithdrawScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CardWithdraw'>>();
  const card = route.params?.card;

  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState<Destination>('main_balance');

  const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
  const displayAmount = amount ? numericAmount.toLocaleString('id-ID') : '';
  const canSubmit = numericAmount > 0 && numericAmount <= MOCK_CARD_BALANCE;

  const handleBack = () => navigation.goBack();

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/\D/g, '');
    const val = parseInt(numeric, 10);
    if (numeric && val > MOCK_CARD_BALANCE) {
      setAmount(MOCK_CARD_BALANCE.toString());
      return;
    }
    setAmount(numeric);
  };

  const handleSubmit = () => {
    if (!canSubmit || !card) return;
    // TODO: Call payment plugin (withdraw from card to main balance or bank)
    // navigation.navigate('WithdrawSuccess', { ... });
    handleBack();
  };

  const paddingH = getHorizontalPadding();
  const minTouch = getMinTouchTarget();

  if (!card) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { paddingHorizontal: paddingH }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <ArrowLeft2 size={scale(24)} color={colors.text} variant="Outline" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('home.withdrawal') || 'Pencairan Dana'}
          </Text>
          <View style={{ width: minTouch }} />
        </View>
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('common.error')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: paddingH }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('home.withdrawal') || 'Pencairan Dana'}
        </Text>
        <View style={{ width: minTouch }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: paddingH }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.cardContext, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardContextLabel, { color: colors.textSecondary }]}>
            {t('home.cardHolder') || 'Pemegang Kartu'}
          </Text>
          <Text style={[styles.cardContextName, { color: colors.text }]} numberOfLines={1}>
            {card.cardHolderName}
          </Text>
          <Text style={[styles.cardContextNumber, { color: colors.textSecondary }]} numberOfLines={1}>
            {card.cardNumber}
          </Text>
          <Text style={[styles.cardBalance, { color: colors.primary }]}>
            {t('home.cardBalance') || 'Saldo Kartu'}: Rp {MOCK_CARD_BALANCE.toLocaleString('id-ID')}
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>{t('withdraw.amount') || 'Nominal'}</Text>
        <View
          style={[
            styles.amountRow,
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
          />
        </View>

        <Text style={[styles.label, { color: colors.text, marginTop: moderateVerticalScale(20) }]}>
          {t('cardWithdraw.destination') || 'Tujuan Pencairan'}
        </Text>
        <View style={styles.destRow}>
          <TouchableOpacity
            style={[
              styles.destOption,
              { backgroundColor: colors.surface, borderColor: colors.border, marginRight: scale(12) },
              destination === 'main_balance' && { backgroundColor: colors.primaryLight ?? colors.surface, borderColor: colors.primary },
            ]}
            onPress={() => setDestination('main_balance')}
          >
            <Wallet size={scale(22)} color={destination === 'main_balance' ? colors.primary : colors.textSecondary} variant="Bold" />
            <Text
              style={[
                styles.destLabel,
                { color: destination === 'main_balance' ? colors.primary : colors.text },
              ]}
            >
              {t('cardWithdraw.toMainBalance') || 'Saldo Utama'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.destOption,
              { backgroundColor: colors.surface, borderColor: colors.border },
              destination === 'bank' && { backgroundColor: colors.primaryLight ?? colors.surface, borderColor: colors.primary },
            ]}
            onPress={() => setDestination('bank')}
          >
            <Bank size={scale(22)} color={destination === 'bank' ? colors.primary : colors.textSecondary} variant="Bold" />
            <Text
              style={[
                styles.destLabel,
                { color: destination === 'bank' ? colors.primary : colors.text },
              ]}
            >
              {t('cardWithdraw.toBank') || 'Rekening Bank'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: canSubmit ? colors.primary : colors.border, opacity: canSubmit ? 1 : 0.6 },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <MoneySend size={scale(20)} color={colors.surface} variant="Bold" />
          <Text style={[styles.submitBtnText, { color: colors.surface }]}>
            {t('withdraw.confirmTitle') || 'Konfirmasi Penarikan'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: getResponsiveFontSize('medium'), fontFamily: FontFamily.monasans.regular },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: moderateVerticalScale(32) },
  cardContext: {
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(24),
  },
  cardContextLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: 2,
  },
  cardContextName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  cardContextNumber: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  cardBalance: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    marginTop: scale(8),
  },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: scale(8),
  },
  amountRow: {
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
  destRow: { flexDirection: 'row', marginTop: scale(8) },
  destOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(14),
    borderRadius: scale(12),
    borderWidth: 1,
    gap: scale(8),
  },
  destLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    marginTop: moderateVerticalScale(32),
  },
  submitBtnText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});
