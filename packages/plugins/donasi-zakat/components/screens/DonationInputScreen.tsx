import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2, ArrowRight2, Wallet, ArrowDown2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

export const DonationInputScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const [amount, setAmount] = useState('500.000');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const quickAmounts = ['50.000', '100.000', '500.000', '1.000.000'];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + scale(12) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft2 size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('donasiZakat.inputDonation')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={[styles.bannerBg, { backgroundColor: colors.primary + '10' }]} />
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTQYrSk64KT9-nVDKy9yr0gNl-qvoMZdmM831eIc36Xojwcf4dZ2qwZ5PnGtzgq6SLFSDm58D7sKZWVucQeAaexh0fAFFEByG67pZIg4_yP0yqzsRUQfzlXS-E9pgMmr3qld6AuNxdq8NpIZzEFdMwFvEyx2eX8rcY3XwpVfHc_EIu4rPiZcchfySC-vFcFyJXAGohYtCTIxVlhjkXyHUossd8JQa7_sNfOZYB8kCo9OKJ3JIuS2kx3ockx2ow90tDOS202URlI_E',
            }}
            style={styles.bannerPattern}
          />
          <View style={styles.bannerContent}>
            <Text style={[styles.bannerLabel, { color: colors.primary }]}>
              {t('donasiZakat.zakatMaal').toUpperCase()}
            </Text>
            <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
              {t('donasiZakat.cleanseWealthDesc')}
            </Text>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.textTertiary }]}>
            {t('donasiZakat.enterAmount')}
          </Text>
          <View style={styles.amountInputRow}>
            <Text style={[styles.currencyPrefix, { color: colors.textTertiary }]}>Rp</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.primary }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={[styles.inputDivider, { backgroundColor: colors.borderLight }]} />
        </View>

        {/* Quick Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {quickAmounts.map((q) => (
            <TouchableOpacity
              key={q}
              style={[
                styles.chip,
                amount === q
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { borderColor: colors.borderLight, backgroundColor: colors.surface },
              ]}
              onPress={() => setAmount(q)}
            >
              <Text
                style={[
                  styles.chipText,
                  amount === q ? styles.activeChipText : { color: colors.textSecondary },
                ]}
              >
                Rp {q}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Niat Selector */}
        <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
          <Text style={[styles.label, { color: colors.text }]}>{t('donasiZakat.niatZakat')}</Text>
          <TouchableOpacity
            style={[
              styles.selector,
              { backgroundColor: colors.borderLight + '30', borderColor: colors.borderLight },
            ]}
          >
            <Text style={[styles.selectorText, { color: colors.text }]}>
              {t('donasiZakat.niatZakatMaal')}
            </Text>
            <ArrowDown2 size={scale(20)} color={colors.textTertiary} />
          </TouchableOpacity>

          <View
            style={[
              styles.niatCard,
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

        {/* Anonymous Toggle */}
        <View style={[styles.toggleRow, { paddingHorizontal: horizontalPadding }]}>
          <View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>
              {t('donasiZakat.hideName')}
            </Text>
            <Text style={[styles.toggleDesc, { color: colors.textTertiary }]}>
              {t('donasiZakat.donateAsAnonymous')}
            </Text>
          </View>
          <Switch
            trackColor={{ false: colors.borderLight, true: colors.primary }}
            thumbColor="#FFF"
            ios_backgroundColor={colors.borderLight}
            onValueChange={setIsAnonymous}
            value={isAnonymous}
          />
        </View>

        {/* Payment Method Preview */}
        <TouchableOpacity
          style={[
            styles.paymentPreview,
            { marginHorizontal: horizontalPadding, borderColor: colors.borderLight },
          ]}
        >
          <View style={styles.paymentLeft}>
            <View style={[styles.paymentIconWrap, { backgroundColor: colors.infoLight }]}>
              <Wallet size={scale(20)} color={colors.info} />
            </View>
            <View>
              <Text style={[styles.paymentTitle, { color: colors.text }]}>
                {t('donasiZakat.paymentMethod')}
              </Text>
              <Text style={[styles.paymentSub, { color: colors.textSecondary }]}>
                {t('donasiZakat.selectInNextStep')}
              </Text>
            </View>
          </View>
          <ArrowRight2 size={scale(20)} color={colors.textTertiary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + scale(12), borderTopColor: colors.borderLight },
        ]}
      >
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            {t('donasiZakat.totalDonation')}
          </Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>Rp {amount}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
          ]}
        >
          <Text style={styles.submitBtnText}>{t('donasiZakat.continuePayment')}</Text>
          <ArrowRight2 size={scale(18)} color="#FFF" variant="Bold" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: scale(12),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: scale(20),
    fontFamily: FontFamily.monasans.bold,
  },
  placeholder: {
    width: scale(40),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: moderateVerticalScale(120),
  },
  banner: {
    height: scale(120),
    marginVertical: scale(24),
    position: 'relative',
    overflow: 'hidden',
  },
  bannerBg: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    resizeMode: 'cover',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(24),
  },
  bannerLabel: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 1.5,
    marginBottom: scale(4),
  },
  bannerText: {
    fontSize: scale(14),
    maxWidth: '80%',
    lineHeight: scale(20),
    fontFamily: FontFamily.monasans.medium,
  },
  inputSection: {
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  inputLabel: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: scale(8),
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: scale(32),
    fontFamily: FontFamily.monasans.bold,
    marginRight: scale(8),
  },
  amountInput: {
    fontSize: scale(48),
    fontFamily: FontFamily.monasans.bold,
    padding: 0,
    minWidth: scale(100),
    textAlign: 'center',
  },
  inputDivider: {
    height: 2,
    width: '100%',
    marginTop: scale(16),
    borderRadius: 1,
  },
  chipsContainer: {
    paddingHorizontal: scale(24),
    paddingVertical: scale(16),
    gap: scale(10),
  },
  chip: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(20),
    borderWidth: 1,
  },
  chipText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.semiBold,
  },
  activeChipText: {
    color: '#FFF',
  },
  section: {
    marginTop: scale(24),
  },
  label: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(12),
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  selectorText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
  },
  niatCard: {
    marginTop: scale(12),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  niatArabic: {
    fontSize: scale(20),
    textAlign: 'right',
    marginBottom: scale(8),
    lineHeight: scale(36),
  },
  niatTranslation: {
    fontSize: scale(12),
    fontStyle: 'italic',
    fontFamily: FontFamily.monasans.regular,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scale(32),
  },
  toggleLabel: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  toggleDesc: {
    fontSize: scale(12),
    marginTop: scale(2),
  },
  paymentPreview: {
    marginTop: scale(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  paymentIconWrap: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  paymentSub: {
    fontSize: scale(11),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: scale(24),
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  totalLabel: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
  },
  totalAmount: {
    fontSize: scale(20),
    fontFamily: FontFamily.monasans.bold,
  },
  submitBtn: {
    height: scale(56),
    borderRadius: scale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
  },
});

export default DonationInputScreen;
