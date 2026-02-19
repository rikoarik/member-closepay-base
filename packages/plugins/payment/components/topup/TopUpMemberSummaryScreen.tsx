/**
 * Top Up Member Summary Screen
 * Screen untuk menampilkan ringkasan transaksi top up saldo member
 * Responsive untuk semua device termasuk EDC
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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

interface RouteParams {
  tabType: 'id-member' | 'excel' | 'top-kartu' | 'virtual-card';
  balanceTarget: string;
  balanceTargetName: string;
  amount: number;
  memberId?: string;
  memberName?: string;
  cardId?: string;
  cardNumber?: string;
  cardHolderName?: string;
  adminFee?: number;
  totalAmount?: number;
}

export const TopUpMemberSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = route.params as RouteParams;

  const {
    tabType,
    balanceTargetName,
    amount,
    memberId,
    memberName: paramMemberName,
    cardNumber,
    cardHolderName,
    adminFee: paramAdminFee,
    totalAmount: paramTotalAmount,
  } = params || {
    tabType: 'id-member' as const,
    balanceTarget: '',
    balanceTargetName: t('topUp.balanceTargetDefault'),
    amount: 0,
    memberId: '',
    memberName: undefined,
    cardNumber: undefined,
    cardHolderName: undefined,
    adminFee: undefined,
    totalAmount: undefined,
  };

  const isVirtualCard = tabType === 'virtual-card';
  const memberName = isVirtualCard ? (cardHolderName ?? paramMemberName ?? '') : (paramMemberName ?? 'Riko S');
  const displayMemberId = memberId || '1123123';
  const adminFee = isVirtualCard ? (paramAdminFee ?? 0) : Math.round(amount * 0.1);
  const totalAmount = isVirtualCard ? (paramTotalAmount ?? amount + adminFee) : amount - adminFee;

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('id-ID');
  };

  const formatDateTime = (): string => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleNext = () => {
    (navigation as any).navigate('TopUpMemberPin', {
      ...params,
      memberName,
      adminFee,
      totalAmount,
    });
  };

  const maskCardNumber = (num: string) => {
    const cleaned = num.replace(/\s/g, '');
    if (cleaned.length < 8) return num;
    return cleaned.slice(-4).padStart(cleaned.length, '•');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('analytics.summary')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Details */}
        <View
          style={[
            styles.detailsContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('withdraw.date')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{formatDateTime()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('topUp.transactionType')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {isVirtualCard ? t('home.topUpCard') : t('home.topUp')}
            </Text>
          </View>

          {isVirtualCard && cardNumber ? (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('topUp.cardNumber')}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {maskCardNumber(cardNumber)}
              </Text>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {isVirtualCard ? t('topUp.cardHolder') : t('profile.name')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{memberName}</Text>
          </View>

          {!isVirtualCard ? (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('topUp.memberId')}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{displayMemberId}</Text>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('topUp.balanceTarget')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {balanceTargetName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('topUp.totalAmount')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              Rp {formatCurrency(amount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('topUp.adminFee')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              Rp {formatCurrency(adminFee)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
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
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {t('topUp.nextWithAmount', { amount: formatCurrency(totalAmount) })}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(24),
    paddingBottom: moderateVerticalScale(24),
  },
  detailsContainer: {
    padding: moderateScale(20),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  detailLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    flex: 1,
  },
  detailValue: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    flex: 1,
    textAlign: 'right',
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
    color: '#FFFFFF',
  },
});

