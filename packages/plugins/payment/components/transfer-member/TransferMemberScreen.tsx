/**
 * Transfer Member Screen (Member App)
 * Transfer antar member: input ID penerima, nominal, keterangan.
 * Bukan flow merchant (isi saldo member).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2, Edit } from 'iconsax-react-nativejs';
import {
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
} from '@core/config';
import {
  TransferMemberSummaryBottomSheet,
  type TransferMemberSummaryData,
} from './TransferMemberSummaryBottomSheet';
import {
  TransferMemberPinBottomSheet,
  type TransferMemberPinData,
} from './TransferMemberPinBottomSheet';

export const TransferMemberScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [recipientChecked, setRecipientChecked] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientRefId, setRecipientRefId] = useState('');
  const [showSummaryBottomSheet, setShowSummaryBottomSheet] = useState(false);
  const [summaryData, setSummaryData] = useState<TransferMemberSummaryData | null>(null);
  const [showPinBottomSheet, setShowPinBottomSheet] = useState(false);
  const [pinData, setPinData] = useState<TransferMemberPinData | null>(null);

  const displayAmount = amount
    ? parseInt(amount.replace(/\D/g, '') || '0', 10).toLocaleString('id-ID')
    : '';
  const amountNum = parseInt(amount.replace(/\D/g, '') || '0', 10);

  const handleAmountChange = (text: string) => {
    setAmount(text.replace(/\D/g, ''));
  };

  const handleCheckMember = () => {
    if (!memberId.trim()) return;
    setRecipientChecked(true);
    setRecipientName('Riko Siahaan');
    setRecipientRefId('1234213124');
  };

  const handleNext = () => {
    if (!recipientChecked || amountNum <= 0) return;
    const adminFee = Math.round(amountNum * 0.1);
    const totalAmount = amountNum - adminFee;
    const data: TransferMemberSummaryData = {
      memberId: memberId.trim(),
      memberName: recipientName,
      memberRefId: recipientRefId,
      amount: amountNum,
      adminFee,
      totalAmount,
      note: note.trim(),
    };
    Keyboard.dismiss();
    setSummaryData(data);
    requestAnimationFrame(() => {
      setShowSummaryBottomSheet(true);
    });
  };

  const handleSummaryConfirm = (data: TransferMemberSummaryData) => {
    setShowSummaryBottomSheet(false);
    setSummaryData(null);
    setPinData(data);

    // Delay opening the PIN sheet to allow the Summary sheet to close
    setTimeout(() => {
      setShowPinBottomSheet(true);
    }, 500);
  };

  const handlePinComplete = (pin: string) => {
    if (!pinData) return;
    setShowPinBottomSheet(false);
    const payload = { ...pinData, pin };
    setPinData(null);
    (navigation as any).navigate('TransferMemberSuccess', payload);
  };

  const canProceed = recipientChecked && amountNum > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('home.transferMember')}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.section]}>
            <View style={[styles.sectionContent, { backgroundColor: colors.inputBackground }]}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('topUp.transferMemberIdLabel')}
              </Text>
              <View style={styles.rowWithButton}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={memberId}
                  onChangeText={setMemberId}
                  placeholder="123456789"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.checkButtonTextOnly}
                  onPress={handleCheckMember}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.checkButtonTextBlue, { color: colors.primary }]}>
                    {t('topUp.transferMemberCheck')}
                  </Text>
                </TouchableOpacity>
              </View>
              {recipientChecked && (
                <View
                  style={[
                    styles.recipientInfo,
                    { backgroundColor: colors.surfaceSecondary || '#F5F5F5' },
                  ]}
                >
                  <Text style={[styles.recipientName, { color: colors.text }]}>
                    {recipientName}
                  </Text>
                  <Text style={[styles.recipientId, { color: colors.textSecondary }]}>
                    {recipientRefId}
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.label, { color: colors.text }]}>{t('topUp.amount')}</Text>
              <View style={[styles.amountRow, { borderBottomColor: colors.primary }]}>
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
            </View>

            <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
              <View style={[styles.noteLabelRow, { marginBottom: moderateVerticalScale(8) }]}>
                <Edit size={getIconSize('medium')} color={colors.textSecondary} variant="Outline" />
                <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>
                  {t('topUp.transferMemberNoteLabel')}
                </Text>
              </View>
              <TextInput
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={note}
                onChangeText={setNote}
                placeholder={t('topUp.transferMemberNotePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { backgroundColor: colors.inputBackground, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: canProceed ? colors.primary : colors.border },
            ]}
            onPress={handleNext}
            disabled={!canProceed}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>{t('common.next')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <TransferMemberSummaryBottomSheet
        visible={showSummaryBottomSheet}
        onClose={() => {
          setShowSummaryBottomSheet(false);
          setSummaryData(null);
        }}
        data={summaryData}
        onConfirm={handleSummaryConfirm}
      />

      <TransferMemberPinBottomSheet
        visible={showPinBottomSheet}
        onClose={() => {
          setShowPinBottomSheet(false);
          setPinData(null);
        }}
        data={pinData}
        onComplete={handlePinComplete}
      />
    </SafeAreaView>
  );
};

const minTouchTarget = getMinTouchTarget();
const horizontalPadding = getHorizontalPadding();

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  headerRight: { width: minTouchTarget },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: moderateVerticalScale(24),
  },
  section: {},
  sectionContent: {
    marginTop: moderateVerticalScale(8),
    paddingHorizontal: horizontalPadding,
    paddingVertical: moderateVerticalScale(24),
  },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: moderateVerticalScale(8),
  },
  rowWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  textInput: {
    flex: 1,
    height: moderateVerticalScale(48),
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  checkButtonTextOnly: {
    paddingHorizontal: moderateScale(16),
    height: moderateVerticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonTextBlue: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  recipientInfo: {
    marginTop: moderateVerticalScale(12),
    padding: moderateScale(16),
    borderWidth: 0.2,
    borderRadius: moderateScale(12),
  },
  recipientName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  recipientId: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: moderateVerticalScale(4),
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
    borderBottomWidth: 2,
    paddingHorizontal: 0,
  },
  currencyPrefix: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.regular,
    marginRight: moderateScale(8),
  },
  amountInput: {
    flex: 1,
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    padding: 0,
    paddingVertical: 0,
  },
  noteLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  noteLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  noteInput: {
    minHeight: moderateVerticalScale(80),
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateVerticalScale(12),
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlignVertical: 'top',
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: horizontalPadding,
    paddingVertical: moderateVerticalScale(16),
  },
  nextButton: {
    width: '100%',
    paddingVertical: moderateVerticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
  },
  nextButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
});
