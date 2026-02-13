import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2, Clock, InfoCircle, Verify, ArrowRight2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

export const ZakatCalculatorScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const [totalHarta, setTotalHarta] = useState('150.000.000');
  const [hutang, setHutang] = useState('0');
  const [emas, setEmas] = useState('10.000.000');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + scale(12),
            paddingHorizontal: horizontalPadding,
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft2 size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('donasiZakat.zakatCalculator')}
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Clock size={scale(24)} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title Section */}
        <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            {t('donasiZakat.calculateZakatMaal')}
          </Text>
          <Text style={[styles.pageDesc, { color: colors.textSecondary }]}>
            {t('donasiZakat.calcZakatDesc')}
          </Text>

          {/* Progress Indicators */}
          <View style={styles.progressRow}>
            <View
              style={[
                styles.progressIndicator,
                { backgroundColor: colors.error, width: scale(80) },
              ]}
            />
            <View
              style={[styles.progressIndicator, { backgroundColor: colors.error + '20', flex: 1 }]}
            />
            <View
              style={[styles.progressIndicator, { backgroundColor: colors.error + '20', flex: 1 }]}
            />
          </View>
        </View>

        {/* Input Fields */}
        <View style={[styles.formSection, { paddingHorizontal: horizontalPadding }]}>
          {/* Total Harta */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('donasiZakat.totalWealth')}
              </Text>
              <View style={styles.infoBadge}>
                <InfoCircle size={scale(14)} color={colors.error} variant="Bold" />
                <Text style={[styles.infoText, { color: colors.error }]}>
                  {t('donasiZakat.whatIsThis')}
                </Text>
              </View>
            </View>
            <View style={[styles.inputContainer, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.currencyPrefix, { color: colors.textTertiary }]}>Rp</Text>
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                value={totalHarta}
                onChangeText={setTotalHarta}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <Text style={[styles.helperText, { color: colors.textTertiary }]}>
              {t('donasiZakat.includeSavings')}
            </Text>
          </View>

          {/* Hutang */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('donasiZakat.debt')}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.currencyPrefix, { color: colors.textTertiary }]}>Rp</Text>
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                value={hutang}
                onChangeText={setHutang}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <Text style={[styles.helperText, { color: colors.textTertiary }]}>
              {t('donasiZakat.debtDue')}
            </Text>
          </View>

          {/* Emas */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('donasiZakat.goldSilverValue')}
              </Text>
              <Text style={[styles.goldPriceLabel, { color: colors.textTertiary }]}>
                {t('donasiZakat.goldPriceToday')}
              </Text>
            </View>
            <View style={[styles.inputContainer, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.currencyPrefix, { color: colors.textTertiary }]}>Rp</Text>
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                value={emas}
                onChangeText={setEmas}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>
        </View>

        {/* Nisab Info */}
        <View
          style={[
            styles.nisabCard,
            { marginHorizontal: horizontalPadding, backgroundColor: colors.infoLight },
          ]}
        >
          <Verify size={scale(20)} color={colors.info} variant="Bold" />
          <Text style={[styles.nisabText, { color: colors.info }]}>
            <Text style={styles.boldText}>{t('donasiZakat.nisabZakatMaalLabel')}</Text>{' '}
            {t('donasiZakat.nisabAmount')}
            {'\n'}
            {t('donasiZakat.wealthReachedNisab')}
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + scale(16),
            backgroundColor: colors.surface,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 10,
          },
        ]}
      >
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
          {t('donasiZakat.totalZakatDue').toUpperCase()}
        </Text>
        <View style={styles.totalRow}>
          <Text style={[styles.totalAmount, { color: colors.text }]}>Rp 4.000.000</Text>
          <View style={[styles.rateBadge, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.rateText, { color: colors.success }]}>2.5% Rate</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: colors.error, shadowColor: colors.error }]}
        >
          <Text style={styles.payButtonText}>{t('donasiZakat.payNow')}</Text>
          <ArrowRight2 size={scale(18)} color="#FFF" />
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: colors.textTertiary }]}>
          {t('donasiZakat.disclaimer')}
        </Text>
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
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
  },
  scrollContent: {
    paddingBottom: moderateVerticalScale(120),
  },
  section: {
    marginTop: scale(24),
  },
  pageTitle: {
    fontSize: scale(24),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(8),
  },
  pageDesc: {
    fontSize: scale(14),
    lineHeight: scale(22),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: scale(24),
  },
  progressRow: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: scale(8),
  },
  progressIndicator: {
    height: scale(6),
    borderRadius: scale(3),
  },
  formSection: {
    marginTop: scale(24),
    gap: scale(24),
  },
  inputGroup: {
    gap: scale(8),
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  infoText: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.medium,
  },
  goldPriceLabel: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.regular,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    height: scale(56),
    borderRadius: scale(28), // Fully rounded like in design
  },
  currencyPrefix: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.medium,
    marginRight: scale(8),
  },
  inputField: {
    flex: 1,
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.semiBold,
    padding: 0,
  },
  helperText: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.regular,
    marginTop: scale(4),
  },
  nisabCard: {
    marginTop: scale(32),
    padding: scale(16),
    borderRadius: scale(12),
    flexDirection: 'row',
    gap: scale(12),
    alignItems: 'flex-start',
  },
  nisabText: {
    flex: 1,
    fontSize: scale(13),
    lineHeight: scale(20),
    fontFamily: FontFamily.monasans.regular,
  },
  boldText: {
    fontFamily: FontFamily.monasans.bold,
  },
  footer: {
    paddingHorizontal: scale(24),
    paddingTop: scale(24),
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
  },
  totalLabel: {
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 1,
    marginBottom: scale(4),
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginBottom: scale(24),
  },
  totalAmount: {
    fontSize: scale(32),
    fontFamily: FontFamily.monasans.bold,
  },
  rateBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(6),
  },
  rateText: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
  },
  payButton: {
    height: scale(56),
    borderRadius: scale(28),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(16),
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
  },
  disclaimer: {
    fontSize: scale(11),
    textAlign: 'center',
    fontFamily: FontFamily.monasans.regular,
  },
});

export default ZakatCalculatorScreen;
