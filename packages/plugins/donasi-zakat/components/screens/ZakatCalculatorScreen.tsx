import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft2,
  Clock,
  InfoCircle,
  Verify,
  ArrowRight2,
  Wallet,
  Buildings,
  Chart,
  Receipt1,
  TickCircle,
  EyeSlash,
} from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  ScreenHeader,
  PluginRegistry,
  useConfig,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { zakatService } from '../../services/zakatService';

const getZakatTypeIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'wallet':
      return Wallet;
    case 'receipt1':
    case 'archive': // Fallback for archive
    case 'profesi':
      return Receipt1;
    case 'money':
    case 'chart':
      return Chart;
    case 'buildings':
      return Buildings;
    default:
      return Wallet;
  }
};

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

const parseNumeric = (value: string) => {
  return parseInt(value.replace(/\./g, ''), 10) || 0;
};

interface RawZakatType {
  id: string;
  labelKey: string;
  summaryKey: string;
  icon: string;
}

interface ZakatType {
  id: string;
  labelKey: string;
  summaryKey: string;
  icon: string;
  title: string;
  desc: string;
  Icon: any;
}

export const ZakatCalculatorScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();
  const { config } = useConfig();
  const manifest = PluginRegistry.getPlugin('donasi-zakat');

  const [step, setStep] = useState(1);
  const [zakatType, setZakatType] = useState('maal'); // 'maal', 'profesi', 'emas'

  const zakatTypes = React.useMemo(() => {
    // Default types from manifest
    const defaultTypes = manifest?.config?.zakatTypes || [];

    // Check for global config overrides (e.g. from Admin Config)
    const pluginOverride = (config?.plugins as any)?.['donasi-zakat'];
    const activeTypes = pluginOverride?.zakatTypes || defaultTypes;

    return activeTypes.map((type: RawZakatType) => ({
      ...type,
      title: t(type.labelKey),
      desc: t(type.summaryKey),
      Icon: getZakatTypeIcon(type.icon),
    }));
  }, [config, t, manifest]);

  // Step 2 Data (Maal)
  const [cash, setCash] = useState('45.000.000');
  const [property, setProperty] = useState('0');
  const [stocks, setStocks] = useState('0');
  const [debts, setDebts] = useState('0');

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [goldPrice, setGoldPrice] = useState(1250000); // Default price
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        const price = await zakatService.getGoldPrice();
        setGoldPrice(price);
      } catch (error) {
        console.error('Failed to fetch gold price:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoldPrice();
  }, []);

  const cashNum = parseNumeric(cash);
  const propertyNum = parseNumeric(property);
  const stocksNum = parseNumeric(stocks);
  const debtsNum = parseNumeric(debts);

  const totalAsset = cashNum + propertyNum + stocksNum;
  const netWealth = totalAsset - debtsNum;
  const nisab = goldPrice * 85;
  const isReachedNisab = netWealth >= nisab;
  const zakatDue = isReachedNisab ? Math.floor(netWealth * 0.025) : 0;

  const handleInputChange = (setter: (v: string) => void) => (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '');
    if (numeric === '') {
      setter('0');
      return;
    }
    setter(formatIDR(parseInt(numeric, 10)));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      Alert.alert('Sukses', 'Pembayaran zakat Anda sedang diproses.');
      navigation.goBack();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  const showInfoAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('donasiZakat.zakatCalculator')} onBackPress={handleBack} />

      {/* Progress Stepper */}
      <View style={[styles.stepperContainer, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.stepperHeader}>
          <Text style={[styles.stepperSub, { color: colors.primary }]}>
            {t('donasiZakat.stepXofY', { step, total: 4 })}
          </Text>
          <Text style={[styles.stepperStatus, { color: colors.textSecondary }]}>
            {t('donasiZakat.percentComplete', { percent: step * 25 })}
          </Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: colors.primary + '15' }]}>
          <View
            style={[
              styles.progressBarFill,
              { backgroundColor: colors.primary, width: `${step * 25}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <View style={styles.heroText}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                {t('donasiZakat.selectZakatType')}
              </Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                {t('donasiZakat.selectZakatTypeDesc')}
              </Text>
            </View>

            <View style={styles.selectionGrid}>
              {zakatTypes.map((item: ZakatType) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.selectionCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: zakatType === item.id ? colors.primary : colors.borderLight,
                    },
                    zakatType === item.id && { backgroundColor: colors.primary + '05' },
                  ]}
                  onPress={() => setZakatType(item.id)}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconWrap, { backgroundColor: colors.primary + '10' }]}>
                      <item.Icon size={scale(24)} color={colors.primary} variant="Bold" />
                    </View>
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: zakatType === item.id ? colors.primary : colors.borderLight,
                        },
                      ]}
                    >
                      {zakatType === item.id && (
                        <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                    {item.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View
              style={[
                styles.infoBox,
                { backgroundColor: colors.primary + '05', borderColor: colors.primary + '15' },
              ]}
            >
              <InfoCircle size={scale(20)} color={colors.primary} variant="Bold" />
              <Text style={[styles.infoBoxText, { color: colors.textSecondary }]}>
                {t('donasiZakat.nisabInfo')}
              </Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <View style={styles.heroText}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                {t('donasiZakat.wealthInfo')}
              </Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                {t('donasiZakat.wealthInfoDesc')}
              </Text>
            </View>

            <View style={styles.formGrid}>
              {[
                {
                  label: t('donasiZakat.totalSavings'),
                  value: cash,
                  setter: setCash,
                  icon: Wallet,
                  hint: t('donasiZakat.totalSavingsHint'),
                },
                {
                  label: t('donasiZakat.propertyValue'),
                  value: property,
                  setter: setProperty,
                  icon: Buildings,
                  hint: t('donasiZakat.propertyValueHint'),
                },
                {
                  label: t('donasiZakat.investmentValue'),
                  value: stocks,
                  setter: setStocks,
                  icon: Chart,
                },
                {
                  label: t('donasiZakat.debtDueValue'),
                  value: debts,
                  setter: setDebts,
                  icon: Receipt1,
                  isDebt: true,
                  hint: t('donasiZakat.debtDueValueHint'),
                },
              ].map((field, index) => (
                <View key={index} style={styles.inputGroup}>
                  <View style={styles.fieldLabel}>
                    <field.icon size={scale(16)} color={colors.primary} variant="Bold" />
                    <Text style={[styles.fieldLabelText, { color: colors.textSecondary }]}>
                      {field.label}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.inputBox,
                      { backgroundColor: colors.surface, borderColor: colors.borderLight },
                    ]}
                  >
                    <Text style={[styles.rp, { color: colors.textTertiary }]}>Rp</Text>
                    <TextInput
                      style={[styles.fieldInput, { color: colors.text }]}
                      value={field.value}
                      onChangeText={handleInputChange(field.setter)}
                      keyboardType="numeric"
                    />
                    {field.isDebt && (
                      <Receipt1 size={scale(20)} color={colors.error} variant="Outline" />
                    )}
                  </View>
                  {field.hint && (
                    <Text style={[styles.hint, { color: colors.textTertiary }]}>{field.hint}</Text>
                  )}
                </View>
              ))}
            </View>

            <View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.primary + '08', borderColor: colors.primary + '15' },
              ]}
            >
              <View>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {t('donasiZakat.subtotalWealth')}
                </Text>
                <Text style={[styles.summaryVal, { color: colors.primary }]}>
                  Rp {formatIDR(netWealth)}
                </Text>
              </View>
              <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '15' }]}>
                <TickCircle size={scale(24)} color={colors.primary} />
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <View
              style={[
                styles.resultCard,
                { backgroundColor: colors.primary + '05', borderColor: colors.primary + '10' },
              ]}
            >
              <View style={styles.resultHeader}>
                <View>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                    {t('donasiZakat.totalNetWealth')}
                  </Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    Rp {formatIDR(netWealth)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isReachedNisab ? colors.success + '15' : colors.error + '15',
                    },
                  ]}
                >
                  <Verify
                    size={scale(12)}
                    color={isReachedNisab ? colors.success : colors.error}
                    variant="Bold"
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: isReachedNisab ? colors.success : colors.error },
                    ]}
                  >
                    {isReachedNisab
                      ? t('donasiZakat.urgent')
                      : t('donasiZakat.notReachedNisabMsg', { amount: '' }).split(' ')[0]}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.resultInfo,
                  { backgroundColor: isReachedNisab ? colors.success + '10' : colors.error + '10' },
                ]}
              >
                <TickCircle
                  size={scale(16)}
                  color={isReachedNisab ? colors.success : colors.error}
                />
                <Text
                  style={[
                    styles.resultInfoText,
                    { color: isReachedNisab ? colors.success : colors.error },
                  ]}
                >
                  {isReachedNisab
                    ? t('donasiZakat.reachedNisabMsg', {
                        amount: formatIDR(Math.floor(nisab)),
                      })
                    : t('donasiZakat.notReachedNisabMsg', {
                        amount: formatIDR(Math.floor(nisab)),
                      })}
                </Text>
              </View>
            </View>

            <View style={styles.mainResult}>
              <Text style={[styles.mainLabel, { color: colors.textSecondary }]}>
                {t('donasiZakat.totalZakatDueLabel')}
              </Text>
              <Text style={[styles.mainAmount, { color: colors.primary }]}>
                Rp {formatIDR(zakatDue)}
              </Text>
              <Text style={[styles.mainSub, { color: colors.textTertiary }]}>
                {t('donasiZakat.shariahStandard')}
              </Text>
            </View>

            <View style={styles.breakdownSection}>
              <Text style={[styles.sectionTitleSmall, { color: colors.text }]}>
                {t('donasiZakat.calculationBreakdown')}
              </Text>
              <View style={styles.breakdownList}>
                <View
                  style={[
                    styles.breakdownItem,
                    { backgroundColor: colors.surface, borderColor: colors.borderLight },
                  ]}
                >
                  <View>
                    <Text style={[styles.itemLabel, { color: colors.text }]}>
                      {t('donasiZakat.grossWealth')}
                    </Text>
                    <Text style={[styles.itemSub, { color: colors.textTertiary }]}>
                      {t('donasiZakat.totalAssets')}
                    </Text>
                  </View>
                  <Text style={[styles.itemVal, { color: colors.text }]}>
                    Rp {formatIDR(totalAsset)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.breakdownItem,
                    { backgroundColor: colors.surface, borderColor: colors.borderLight },
                  ]}
                >
                  <View>
                    <Text style={[styles.itemLabel, { color: colors.text }]}>
                      {t('donasiZakat.deductions')}
                    </Text>
                    <Text style={[styles.itemSub, { color: colors.textTertiary }]}>
                      {t('donasiZakat.debtDueValue')}
                    </Text>
                  </View>
                  <Text style={[styles.itemVal, { color: colors.primary }]}>
                    (- Rp {formatIDR(debtsNum)})
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.quoteBox,
                  { backgroundColor: colors.surfaceSecondary, borderLeftColor: colors.primary },
                ]}
              >
                <Text style={[styles.quoteText, { color: colors.textSecondary }]}>
                  {t('donasiZakat.zakatQuote')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <View
              style={[
                styles.confirmationCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight },
              ]}
            >
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>
                {t('donasiZakat.amountToPay')}
              </Text>
              <Text style={[styles.confirmAmount, { color: colors.text }]}>
                Rp {formatIDR(zakatDue)}
              </Text>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmRow}>
                <Text style={[styles.confirmCategory, { color: colors.textSecondary }]}>
                  {t('donasiZakat.zakatMaal')}
                </Text>
                <View style={[styles.confirmBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.confirmBadgeText, { color: colors.primary }]}>
                    {t('donasiZakat.urgent')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.niatSection}>
              <View style={styles.niatHeader}>
                <InfoCircle size={scale(16)} color={colors.primary} />
                <Text style={[styles.niatLabel, { color: colors.textSecondary }]}>
                  {t('donasiZakat.niatZakatMaalLabel')}
                </Text>
              </View>
              <View
                style={[
                  styles.niatBox,
                  { backgroundColor: colors.primary + '05', borderColor: colors.primary + '10' },
                ]}
              >
                <Text style={[styles.niatArabic, { color: colors.text }]}>
                  نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى
                </Text>
                <Text style={[styles.niatTranslation, { color: colors.textSecondary }]}>
                  {t('donasiZakat.niatTranslation')}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.anonCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight },
              ]}
            >
              <View style={styles.anonLeft}>
                <View style={[styles.anonIcon, { backgroundColor: colors.surfaceSecondary }]}>
                  <EyeSlash size={scale(20)} color={colors.textSecondary} />
                </View>
                <View>
                  <Text style={[styles.anonTitle, { color: colors.text }]}>
                    {t('donasiZakat.anonymousDonation')}
                  </Text>
                  <Text style={[styles.anonSub, { color: colors.textTertiary }]}>
                    {t('donasiZakat.hideNameFromPublic')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsAnonymous(!isAnonymous)}>
                <View
                  style={[
                    styles.switch,
                    { backgroundColor: isAnonymous ? colors.primary : colors.borderLight },
                  ]}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      { transform: [{ translateX: isAnonymous ? scale(20) : 0 }] },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.trustFlow}>
              <View style={styles.trustItem}>
                <Verify size={scale(14)} color={colors.textTertiary} />
                <Text style={[styles.trustText, { color: colors.textTertiary }]}>
                  {t('donasiZakat.success').toUpperCase()} &{' '}
                  {t('donasiZakat.officialChannel').split(' ')[0].toUpperCase()}
                </Text>
              </View>
              <View style={[styles.dot, { backgroundColor: colors.borderLight }]} />
              <View style={styles.trustItem}>
                <TickCircle size={scale(14)} color={colors.textTertiary} />
                <Text style={[styles.trustText, { color: colors.textTertiary }]}>
                  {t('donasiZakat.officialChannel')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, borderTopColor: colors.borderLight },
        ]}
      >
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {step === 1
              ? t('common.next')
              : step === 2
              ? t('donasiZakat.calculateAndContinue')
              : step === 3
              ? t('donasiZakat.payZakatNow')
              : t('donasiZakat.confirmPayment')}
          </Text>
          <ArrowRight2 size={scale(18)} color="#FFF" />
        </TouchableOpacity>
        {step === 2 && (
          <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.goBack()}>
            <Text style={[styles.skipBtnText, { color: colors.textTertiary }]}>
              {t('donasiZakat.maybeLater')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: scale(4),
  },
  stepperContainer: {
    marginTop: scale(16),
    marginBottom: scale(24),
  },
  stepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: scale(8),
  },
  stepperSub: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 1.5,
  },
  stepperStatus: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.medium,
  },
  progressBarBg: {
    height: scale(6),
    borderRadius: scale(3),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: scale(3),
  },
  heroText: {
    marginBottom: scale(32),
  },
  stepTitle: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(8),
  },
  stepDesc: {
    fontSize: scale(12),
    lineHeight: scale(18),
    fontFamily: FontFamily.monasans.regular,
  },
  selectionGrid: {
    gap: scale(16),
  },
  selectionCard: {
    padding: scale(20),
    borderRadius: scale(16),
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  iconWrap: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  radio: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
  },
  cardTitle: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(4),
  },
  cardDesc: {
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: scale(15),
  },
  infoBox: {
    flexDirection: 'row',
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    marginTop: scale(32),
    gap: scale(12),
    alignItems: 'center',
  },
  infoBoxText: {
    flex: 1,
    fontSize: scale(12),
    lineHeight: scale(18),
  },
  formGrid: {
    gap: scale(24),
  },
  fieldLabel: {
    marginBottom: scale(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  fieldLabelText: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    height: scale(56),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  rp: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
    marginRight: scale(8),
  },
  fieldInput: {
    flex: 1,
    fontSize: scale(15),
    fontFamily: FontFamily.monasans.bold,
    padding: 0,
  },
  hint: {
    fontSize: scale(11),
    fontStyle: 'italic',
    marginTop: scale(4),
  },
  summaryCard: {
    marginTop: scale(32),
    padding: scale(20),
    borderRadius: scale(16),
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 1,
    marginBottom: scale(4),
  },
  summaryVal: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
  },
  summaryIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    padding: scale(24),
    borderRadius: scale(20),
    borderWidth: 1,
    marginBottom: scale(40),
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scale(20),
  },
  resultLabel: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 1,
    marginBottom: scale(4),
  },
  resultValue: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.bold,
  },
  statusBadge: {
    flexDirection: 'row',
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    alignItems: 'center',
    gap: scale(4),
  },
  statusText: {
    fontSize: scale(9),
    fontFamily: FontFamily.monasans.bold,
  },
  resultInfo: {
    flexDirection: 'row',
    padding: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
    gap: scale(8),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  resultInfoText: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.medium,
  },
  mainResult: {
    alignItems: 'center',
    marginBottom: scale(40),
  },
  mainLabel: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: scale(8),
  },
  mainAmount: {
    fontSize: scale(28),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: -1,
    marginBottom: scale(8),
  },
  mainSub: {
    fontSize: scale(11),
    textAlign: 'center',
  },
  breakdownSection: {
    marginTop: scale(8),
  },
  sectionTitleSmall: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(16),
  },
  breakdownList: {
    gap: scale(12),
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(14),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  itemLabel: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
  },
  itemSub: {
    fontSize: scale(9),
  },
  itemVal: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
  },
  quoteBox: {
    marginTop: scale(24),
    padding: scale(16),
    borderRadius: scale(12),
    borderLeftWidth: 4,
  },
  quoteText: {
    fontSize: scale(12),
    fontStyle: 'italic',
    lineHeight: scale(18),
  },
  confirmationCard: {
    padding: scale(24),
    borderRadius: scale(16),
    borderWidth: 1,
    marginBottom: scale(32),
  },
  confirmLabel: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: scale(4),
  },
  confirmAmount: {
    fontSize: scale(20),
    fontFamily: FontFamily.monasans.bold,
  },
  confirmDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: scale(20),
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 1,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmCategory: {
    fontSize: scale(11),
  },
  confirmBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(4),
  },
  confirmBadgeText: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
  },
  niatSection: {
    marginBottom: scale(32),
  },
  niatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(12),
  },
  niatLabel: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 1,
  },
  niatBox: {
    padding: scale(20),
    borderRadius: scale(16),
    borderWidth: 1,
    alignItems: 'center',
  },
  niatArabic: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: scale(22),
    marginBottom: scale(12),
  },
  niatTranslation: {
    fontSize: scale(11),
    textAlign: 'center',
    lineHeight: scale(16),
  },
  anonCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderRadius: scale(16),
    borderWidth: 1,
  },
  anonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  anonIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  anonTitle: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.bold,
  },
  anonSub: {
    fontSize: scale(11),
  },
  switch: {
    width: scale(44),
    height: scale(24),
    borderRadius: scale(12),
    paddingHorizontal: scale(2),
    justifyContent: 'center',
  },
  switchThumb: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: '#FFF',
  },
  trustFlow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(12),
    marginTop: scale(24),
    opacity: 0.6,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  trustText: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 1,
  },
  dot: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
  },
  scrollContent: {
    paddingBottom: moderateVerticalScale(120),
  },
  footer: {
    paddingHorizontal: scale(24),
    paddingTop: scale(24),
    paddingBottom: scale(24),
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  nextBtn: {
    height: scale(56),
    borderRadius: scale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(10),
  },
  nextBtnText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFF',
  },
  skipBtn: {
    marginTop: scale(12),
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
});

export default ZakatCalculatorScreen;
