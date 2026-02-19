/**
 * Virtual Account Screen
 * Menampilkan detail virtual account untuk pembayaran top up
 * dengan petunjuk pembayaran via ATM dan M-banking
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2, ArrowDown2, Copy } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getIconSize,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-clipboard/clipboard';
type VaChannel = 'atm' | 'mbanking' | 'bankLain';

interface RouteParams {
  amount?: number;
  paymentMethod?: string;
  bankId?: string;
  channel?: VaChannel;
}

interface BankVA {
  id: string;
  name: string;
  shortName: string;
  vaNumber: string;
  color: string;
}

const BANKS: BankVA[] = [
  { id: 'bsi', name: 'Bank Syariah Indonesia', shortName: 'BSI', vaNumber: '600 0861 6737 8723', color: '#076535' },
  { id: 'bca', name: 'Bank Central Asia', shortName: 'BCA', vaNumber: '8801 2345 6789 001', color: '#0066AE' },
  { id: 'bni', name: 'BNI', shortName: 'BNI', vaNumber: '988 7654321098765', color: '#F26522' },
  { id: 'mandiri', name: 'Bank Mandiri', shortName: 'Mandiri', vaNumber: '70012 9876543210', color: '#003D79' },
  { id: 'bri', name: 'BRI', shortName: 'BRI', vaNumber: '26213 5678901234', color: '#003A70' },
];

export const VirtualAccountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [expandedInfoTopUp, setExpandedInfoTopUp] = useState(true);
  const [expandedPetunjuk, setExpandedPetunjuk] = useState(false);

  const params = route.params as RouteParams | undefined;
  const bankId = params?.bankId ?? 'bca';
  const channel: VaChannel = params?.channel ?? 'mbanking';
  const selectedBank = BANKS.find((b) => b.id === bankId) ?? BANKS[1];

  // Calculate expiry time (24 hours from now)
  const [expiryTime] = useState(() => {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return expiry;
  });

  const [timeRemaining, setTimeRemaining] = useState({
    hours: 23,
    minutes: 56,
    seconds: 3,
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiryTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  const handleCopyVA = async (vaNumberWithSpaces: string) => {
    try {
      const vaNumber = vaNumberWithSpaces.replace(/\s/g, '');
      await Clipboard.setString(vaNumber);

      Toast.show({
        type: 'success',
        text1: t('virtualAccount.copied'),
        text2: vaNumber,
        position: 'bottom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('virtualAccount.copyFailed'),
        position: 'bottom',
      });
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const atmSteps = [
    t('virtualAccount.step1'),
    t('virtualAccount.step2'),
    t('virtualAccount.step3'),
    t('virtualAccount.step4'),
    t('virtualAccount.step5'),
    t('virtualAccount.step6'),
  ];
  const mbankingSteps = [
    t('virtualAccount.mStep1'),
    t('virtualAccount.mStep2'),
    t('virtualAccount.mStep3'),
    t('virtualAccount.mStep4'),
    t('virtualAccount.mStep5'),
    t('virtualAccount.mStep6'),
  ];
  const bankLainSteps = [
    t('virtualAccount.bankLainMobileStep1'),
    t('virtualAccount.bankLainMobileStep2'),
    t('virtualAccount.bankLainMobileStep3'),
    t('virtualAccount.bankLainMobileStep4'),
    t('virtualAccount.bankLainMobileStep5'),
    t('virtualAccount.bankLainMobileStep6'),
    t('virtualAccount.bankLainMobileStep7'),
    t('virtualAccount.bankLainMobileStep8'),
  ];
  const stepsByChannel: Record<VaChannel, string[]> = {
    atm: atmSteps,
    mbanking: mbankingSteps,
    bankLain: bankLainSteps,
  };
  const currentSteps = stepsByChannel[channel];

  const getPetunjukTitle = () => {
    if (channel === 'atm') return t('virtualAccount.petunjukTopUpATM');
    if (channel === 'mbanking') return t('virtualAccount.petunjukTopUpMBanking');
    return t('virtualAccount.petunjukTopUpBankLain');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header - title di tengah */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft2
            size={getIconSize('medium')}
            color={colors.text}
            variant="Outline"
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('virtualAccount.paymentInstructions')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Warning di bawah header */}
      <View style={[styles.warningBox, { backgroundColor: colors.warningLight }]}>
        <Text style={[styles.warningText, { color: colors.warning }]}>
          {t('virtualAccount.minimalTopUpWarning')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + moderateVerticalScale(16) }]}
      >
        {/* Kartu bank (tanpa status) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.bankInfoLeft}>
            <View style={[styles.bankLogoSmall, { backgroundColor: selectedBank.color }]}>
              <Text style={styles.bankLogoTextWhite}>{selectedBank.shortName}</Text>
            </View>
            <View>
              <Text style={[styles.bankTransferLabel, { color: colors.textSecondary }]}>
                {t('virtualAccount.bankTransfer')}
              </Text>
              <Text style={[styles.bankNameBold, { color: colors.text }]}>
                {selectedBank.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Nomor VA + Copy + batas waktu (tanpa nama rekening) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.labelSmall, { color: colors.textSecondary }]}>
            {t('virtualAccount.virtualAccountNumber').toUpperCase()}
          </Text>
          <TouchableOpacity
            style={[
              styles.vaNumberCopyRow,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleCopyVA(selectedBank.vaNumber)}
            activeOpacity={0.8}
          >
            <Text style={[styles.vaNumberLarge, { color: colors.text }]}>
              {selectedBank.vaNumber}
            </Text>
            <View style={styles.copyLinkRow}>
              <Text style={[styles.copyLinkText, { color: colors.primary }]}>Copy</Text>
              <Copy size={getIconSize('small')} color={colors.primary} variant="Outline" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.timerText, { color: colors.error }]}>
            {t('virtualAccount.completePaymentWithin')}{' '}
            {timeRemaining.hours}:{String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
          </Text>
        </View>

        {/* Informasi Top up - collapsible */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.collapseRow}
            onPress={() => setExpandedInfoTopUp((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={[styles.howToTitle, { color: colors.text }]}>
              {t('virtualAccount.infoTopUpTitle')}
            </Text>
            <View style={[styles.chevronWrap, { transform: [{ rotate: expandedInfoTopUp ? '180deg' : '0deg' }] }]}>
              <ArrowDown2 size={getIconSize('medium')} color={colors.textSecondary} variant="Outline" />
            </View>
          </TouchableOpacity>
          {expandedInfoTopUp && (
            <View style={[styles.infoTopUpBody, { borderTopColor: colors.border }]}>
              <Text style={[styles.infoTopUpDescription, { color: colors.text }]}>
                {t('virtualAccount.infoTopUpDescription')}
              </Text>
              <View style={[styles.infoTopUpExampleBox, { backgroundColor: colors.warningLight }]}>
                <Text style={[styles.infoTopUpExample, { color: colors.text }]}>
                  {t('virtualAccount.infoTopUpExample')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Petunjuk - collapsible, title & isi sesuai channel yang diklik di Top Up (ATM / M Banking / Bank Lain) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.collapseRow}
            onPress={() => setExpandedPetunjuk((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={[styles.howToTitle, { color: colors.text }]}>
              {getPetunjukTitle()}
            </Text>
            <View style={[styles.chevronWrap, { transform: [{ rotate: expandedPetunjuk ? '180deg' : '0deg' }] }]}>
              <ArrowDown2 size={getIconSize('medium')} color={colors.textSecondary} variant="Outline" />
            </View>
          </TouchableOpacity>
          {expandedPetunjuk && (
            <View style={[styles.infoTopUpBody, { borderTopColor: colors.border }]}>
              <Text style={[styles.sheetSubheader, { color: colors.textSecondary }]}>
                {t('virtualAccount.instruksi')}
              </Text>
              <View style={styles.stepsContainer}>
                {currentSteps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Default export untuk kompatibilitas
export default VirtualAccountScreen;

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
    paddingBottom: moderateVerticalScale(8),
  },
  backButton: {
    padding: moderateVerticalScale(8),
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    flex: 1,
  },
  headerRight: {
    width: minTouchTarget,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalPadding,
    paddingBottom: moderateVerticalScale(16),
  },
  card: {
    borderRadius: scale(12),
    borderWidth: 1,
    padding: scale(16),
    marginTop: moderateVerticalScale(12),
    marginBottom: moderateVerticalScale(12),
  },
  warningBox: {
    marginHorizontal: horizontalPadding,
    borderRadius: scale(8),
    padding: scale(12),
    marginBottom: moderateVerticalScale(12),
  },
  warningText: {
    fontSize: moderateScale(13),
    fontFamily: FontFamily.monasans.medium,
  },
  labelSmall: {
    fontSize: moderateScale(11),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: moderateVerticalScale(6),
    letterSpacing: 0.5,
  },
  bankInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankLogoSmall: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  bankLogoTextWhite: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  bankTransferLabel: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(2),
  },
  bankNameBold: {
    fontSize: moderateScale(15),
    fontFamily: FontFamily.monasans.semiBold,
  },
  vaNumberCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: scale(8),
    borderWidth: 1,
    padding: scale(12),
    marginBottom: moderateVerticalScale(6),
  },
  vaNumberLarge: {
    fontSize: moderateScale(20),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: scale(1),
    flex: 1,
  },
  copyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  copyLinkText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.monasans.semiBold,
  },
  timerText: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.regular,
  },
  howToTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  collapseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevronWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: minTouchTarget,
  },
  infoTopUpBody: {
    marginTop: moderateVerticalScale(12),
    paddingTop: moderateVerticalScale(12),
    borderTopWidth: 1,
  },
  infoTopUpDescription: {
    fontSize: moderateScale(13),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: moderateScale(20),
    marginBottom: moderateVerticalScale(10),
  },
  infoTopUpExampleBox: {
    borderRadius: scale(8),
    padding: scale(12),
  },
  infoTopUpExample: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: moderateScale(18),
  },
  sheetSubheader: {
    fontSize: moderateScale(13),
    fontFamily: FontFamily.monasans.semiBold,
  },
  stepsContainer: {
    padding: scale(16),
    paddingBottom: scale(8),
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: moderateVerticalScale(10),
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: moderateScale(13),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: moderateScale(20),
  },
});
