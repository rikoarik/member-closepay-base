/**
 * Top Up Screen
 * Pemilihan metode Top Up VA (balance card + daftar bank/kanal).
 * Setelah user pilih bank/ATM/M Banking → navigate ke VirtualAccount.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2, ArrowDown2, Card, Wallet, Buildings2 } from 'iconsax-react-nativejs';
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
import { useBalance } from '@core/config/plugins/contracts';

interface BankItem {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

const BANKS: BankItem[] = [
  { id: 'bca', name: 'Bank Central Asia', shortName: 'BCA', color: '#0066AE' },
  { id: 'bca2', name: 'Bank Central Asia', shortName: 'BCA', color: '#0066AE' },
  { id: 'bca3', name: 'Bank Central Asia', shortName: 'BCA', color: '#0066AE' },
  { id: 'bni', name: 'Bank Negara Indonesia', shortName: 'BNI', color: '#F26522' },
  { id: 'bri', name: 'Bank Rakyat Indonesia', shortName: 'BRI', color: '#003A70' },
  { id: 'bri2', name: 'Bank Rakyat Indonesia', shortName: 'BRI', color: '#003A70' },
];

export const TopUpScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { balance } = useBalance();
  const [expandedBankId, setExpandedBankId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedBankId((prev) => (prev === id ? null : id));
  };

  type Channel = 'atm' | 'mbanking' | 'bankLain';
  const handleSelectMethod = (bankId: string, channel: Channel) => {
    goToVirtualAccount(bankId, channel);
  };

  const goToVirtualAccount = (bankId: string, channel: Channel) => {
    // @ts-ignore - navigation type akan di-setup nanti
    navigation.navigate('VirtualAccount', { bankId, channel });
  };

  const renderChannelList = (currentBankId: string) => (
    <View style={[styles.channelList, { borderTopColor: colors.border }]}>
      <TouchableOpacity
        style={[styles.channelRow, { borderBottomColor: colors.border }]}
        onPress={() => handleSelectMethod(currentBankId, 'atm')}
        activeOpacity={0.7}
      >
        <Card size={getIconSize('medium')} color={colors.success} variant="Bold" />
        <Text style={[styles.channelLabel, { color: colors.text }]}>
          {t('virtualAccount.channelATM')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.channelRow, { borderBottomColor: colors.border }]}
        onPress={() => handleSelectMethod(currentBankId, 'mbanking')}
        activeOpacity={0.7}
      >
        <Wallet size={getIconSize('medium')} color={colors.success} variant="Bold" />
        <Text style={[styles.channelLabel, { color: colors.text }]}>
          {t('virtualAccount.channelMBanking')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.channelRow}
        onPress={() => handleSelectMethod(currentBankId, 'bankLain')}
        activeOpacity={0.7}
      >
        <Buildings2 size={getIconSize('medium')} color={colors.success} variant="Bold" />
        <Text style={[styles.channelLabel, { color: colors.text }]}>
          {t('virtualAccount.channelBankLain')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('home.topUp')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
       
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('virtualAccount.topUpWithVAThrough')}
        </Text>

        {/* Semua bank: klik row = expand/collapse seperti yang paling atas */}
        {BANKS.map((bank) => (
          <View
            key={bank.id}
            style={[
              styles.bankCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.bankRow}
              onPress={() => toggleExpand(bank.id)}
              activeOpacity={0.7}
            >
              <View style={styles.bankRowLeft}>
                <View style={[styles.bankLogo, { backgroundColor: bank.color }]}>
                  <Text style={styles.bankLogoText}>{bank.shortName}</Text>
                </View>
                <Text style={[styles.bankName, { color: colors.text }]}>
                  {bank.name}
                </Text>
              </View>
              <View style={[styles.chevronWrap, { transform: [{ rotate: expandedBankId === bank.id ? '180deg' : '0deg' }] }]}>
                <ArrowDown2 size={CHEVRON_SIZE} color={colors.textSecondary} variant="Outline" />
              </View>
            </TouchableOpacity>

            {expandedBankId === bank.id && renderChannelList(bank.id)}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TopUpScreen;

const minTouchTarget = getMinTouchTarget();
const horizontalPadding = getHorizontalPadding();
const CHEVRON_SIZE = getIconSize('medium');

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
    paddingBottom: moderateVerticalScale(32),
  },
  balanceCard: {
    borderRadius: scale(16),
    padding: scale(20),
    marginTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(16),
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: moderateVerticalScale(4),
    opacity: 0.95,
  },
  balanceAmount: {
    fontSize: moderateScale(28),
    fontFamily: FontFamily.monasans.bold,
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(16),
    paddingLeft: scale(4),
  },
  bankCard: {
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
    overflow: 'hidden',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
    minHeight: minTouchTarget,
  },
  bankRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankLogo: {
    width: scale(48),
    height: scale(32),
    borderRadius: scale(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  bankLogoText: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  bankName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
    flex: 1,
  },
  chevronWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: minTouchTarget,
  },
  channelList: {
    borderTopWidth: 1,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
    borderBottomWidth: 1,
  },
  channelLabel: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.monasans.medium,
    marginLeft: scale(16),
  },
});
