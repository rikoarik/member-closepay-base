/**
 * Transfer Member Summary Bottom Sheet (Member App)
 * Ringkasan transfer antar member dalam bottom sheet sebelum konfirmasi PIN.
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { BottomSheet } from '@core/config';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
  moderateScale,
} from '@core/config';

export interface TransferMemberSummaryData {
  memberId: string;
  memberName: string;
  memberRefId: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
  note?: string;
}

interface TransferMemberSummaryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  data: TransferMemberSummaryData | null;
  onConfirm: (data: TransferMemberSummaryData) => void;
}

const formatDateTime = (): string => {
  const d = new Date();
  return (
    [
      String(d.getDate()).padStart(2, '0'),
      String(d.getMonth() + 1).padStart(2, '0'),
      d.getFullYear(),
    ].join('/') +
    ' ' +
    [
      String(d.getHours()).padStart(2, '0'),
      String(d.getMinutes()).padStart(2, '0'),
      String(d.getSeconds()).padStart(2, '0'),
    ].join(':')
  );
};

export const TransferMemberSummaryBottomSheet: React.FC<TransferMemberSummaryBottomSheetProps> = ({
  visible,
  onClose,
  data,
  onConfirm,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const formatCurrency = (value: number): string => value.toLocaleString('id-ID');

  const handleConfirm = () => {
    if (!data) return;
    onConfirm(data);
  };

  const memberName = data?.memberName || '';
  const displayMemberId = data?.memberId || data?.memberRefId || '';
  const amount = data?.amount ?? 0;
  const adminFee = data?.adminFee ?? 0;
  const totalAmount = data?.totalAmount ?? 0;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[100]}
      initialSnapPoint={0}
      enablePanDownToClose={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <ArrowLeft2 size={getIconSize('medium')} color={colors.text} variant="Outline" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('analytics.summary')}</Text>
          <View style={styles.headerRight} />
        </View>

        {!data ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {t('topUp.noData')}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
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
                {t('topUp.transactionTypeTransferMember')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('profile.name')}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{memberName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('topUp.memberId')}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{displayMemberId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('topUp.balanceTarget')}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {t('topUp.balanceTargetDefault')}
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
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                {t('topUp.totalAmount')}
              </Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                Rp {formatCurrency(totalAmount)}
              </Text>
            </View>
          </ScrollView>
        )}

        {data && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>
                {t('common.next')} - Rp {formatCurrency(totalAmount)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

const horizontalPadding = getHorizontalPadding();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateVerticalScale(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(24),
  },
  backButton: {
    padding: moderateVerticalScale(8),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: moderateScale(40),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    marginBottom: moderateVerticalScale(24),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  totalRow: {
    marginTop: moderateVerticalScale(8),
    paddingTop: moderateVerticalScale(16),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  detailValue: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  totalLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
  totalValue: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  footer: {
    marginTop: moderateVerticalScale(16),
  },
  confirmButton: {
    width: '100%',
    paddingVertical: moderateVerticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  emptyState: {
    padding: moderateVerticalScale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
});
