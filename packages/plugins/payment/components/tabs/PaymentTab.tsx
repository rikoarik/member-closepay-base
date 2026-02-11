/**
 * PaymentTab Component
 * Tab untuk semua jenis metode pembayaran
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';
import { useNavigation } from '@react-navigation/native';

interface PaymentTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const PaymentTab: React.FC<PaymentTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();

    // Payment methods
    const paymentMethods = [
      {
        id: 'qris',
        label: t('payment.qris') || 'Bayar QRIS',
        description: 'Scan QR untuk bayar',
        icon: '📱',
        route: 'QrisPayment',
        color: '#6366F1',
      },
      {
        id: 'transfer',
        label: t('payment.transfer') || 'Transfer',
        description: 'Transfer uang',
        icon: '💸',
        route: 'Transfer',
        color: '#3B82F6',
      },
      {
        id: 'va',
        label: t('payment.virtualAccount') || 'Virtual Account',
        description: 'Top up via VA',
        icon: '🏦',
        route: 'VirtualAccount',
        color: '#10B981',
      },
      {
        id: 'bank',
        label: t('payment.bankTransfer') || 'Transfer Bank',
        description: 'Ke rekening bank',
        icon: '🏛️',
        route: 'Withdraw',
        color: '#F59E0B',
      },
      {
        id: 'member',
        label: t('payment.transferMember') || 'Transfer Member',
        description: 'Ke member lain',
        icon: '👥',
        route: 'TransferMember',
        color: '#8B5CF6',
      },
      {
        id: 'card',
        label: t('payment.virtualCard') || 'Kartu Virtual',
        description: 'Bayar pakai kartu',
        icon: '💳',
        route: 'VirtualCard',
        color: '#EC4899',
      },
    ];

    // Recent payments (mock data)
    const recentPayments = [
      { id: 1, name: 'Transfer ke Budi', amount: 500000, date: '2 jam lalu', type: 'transfer' },
      { id: 2, name: 'QRIS Payment - Toko ABC', amount: 150000, date: 'Kemarin', type: 'qris' },
      { id: 3, name: 'Top Up VA', amount: 1000000, date: '2 hari lalu', type: 'topup' },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ padding: getHorizontalPadding() }}>
            {/* Header */}
            <Text style={[styles.header, { color: colors.text }]}>
              {t('payment.title') || 'Pembayaran'}
            </Text>

            {/* Payment Methods Grid */}
            <View style={styles.methodsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('payment.methods') || 'Metode Pembayaran'}
              </Text>

              <View style={styles.methodsGrid}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.methodCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => navigation.navigate(method.route as never)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[styles.methodIconContainer, { backgroundColor: method.color + '20' }]}
                    >
                      <Text style={styles.methodIcon}>{method.icon}</Text>
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={[styles.methodLabel, { color: colors.text }]}>
                        {method.label}
                      </Text>
                      <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                        {method.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Payments */}
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('payment.recent') || 'Pembayaran Terakhir'}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('TransactionHistory' as never)}
                >
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>
                    {t('common.seeAll') || 'Lihat Semua'}
                  </Text>
                </TouchableOpacity>
              </View>

              {recentPayments.map((payment) => (
                <View
                  key={payment.id}
                  style={[
                    styles.paymentItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.paymentIconContainer}>
                    <Text style={styles.paymentTypeIcon}>
                      {payment.type === 'transfer' ? '💸' : payment.type === 'qris' ? '📱' : '⬆️'}
                    </Text>
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={[styles.paymentName, { color: colors.text }]}>{payment.name}</Text>
                    <Text style={[styles.paymentDate, { color: colors.textSecondary }]}>
                      {payment.date}
                    </Text>
                  </View>
                  <Text style={[styles.paymentAmount, { color: colors.text }]}>
                    Rp {payment.amount.toLocaleString('id-ID')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
);

PaymentTab.displayName = 'PaymentTab';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: moderateVerticalScale(24),
  },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(20),
    marginTop: moderateVerticalScale(8),
  },
  methodsSection: {
    marginBottom: moderateVerticalScale(24),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  methodsGrid: {
    gap: scale(12),
  },
  methodCard: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  methodIconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  methodIcon: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(2),
  },
  methodDescription: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  recentSection: {
    marginTop: moderateVerticalScale(8),
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  seeAllText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  paymentItem: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
    borderWidth: 1,
  },
  paymentIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  paymentTypeIcon: {
    fontSize: 20,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: moderateVerticalScale(2),
  },
  paymentDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  paymentAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});
