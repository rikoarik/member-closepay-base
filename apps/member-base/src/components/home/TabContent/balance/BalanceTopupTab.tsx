/**
 * BalanceTopupTab Component
 * Tab untuk top up saldo
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
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

interface BalanceTopupTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const BalanceTopupTab: React.FC<BalanceTopupTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [selectedAmount, setSelectedAmount] = useState(0);

    const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

    const topupMethods = [
      {
        id: 'va',
        label: 'Virtual Account',
        description: 'Transfer via VA Bank',
        icon: '🏦',
        route: 'VirtualAccount',
      },
      {
        id: 'card',
        label: 'Kartu Kredit/Debit',
        description: 'Bayar dengan kartu',
        icon: '💳',
        route: 'CardPayment',
      },
      {
        id: 'bank',
        label: 'Transfer Bank',
        description: 'Manual transfer',
        icon: '🏛️',
        route: 'BankTransfer',
      },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <Text style={[styles.header, { color: colors.text }]}>Top Up Saldo</Text>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Pilih Nominal</Text>
              <View style={styles.amountsGrid}>
                {quickAmounts.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.amountCard,
                      {
                        backgroundColor:
                          selectedAmount === amount ? colors.primary : colors.surface,
                        borderColor: selectedAmount === amount ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedAmount(amount)}
                  >
                    <Text
                      style={[
                        styles.amountText,
                        { color: selectedAmount === amount ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      Rp {amount.toLocaleString('id-ID')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Metode Top Up</Text>
              {topupMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => navigation.navigate(method.route as never)}
                >
                  <View style={styles.methodIcon}>
                    <Text style={styles.methodEmoji}>{method.icon}</Text>
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={[styles.methodLabel, { color: colors.text }]}>{method.label}</Text>
                    <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                      {method.description}
                    </Text>
                  </View>
                  <Text style={styles.methodArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedAmount > 0 && (
              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Total Top Up
                </Text>
                <Text style={[styles.summaryAmount, { color: colors.primary }]}>
                  Rp {selectedAmount.toLocaleString('id-ID')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
);

BalanceTopupTab.displayName = 'BalanceTopupTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(24),
    marginTop: moderateVerticalScale(8),
  },
  section: { marginBottom: moderateVerticalScale(24) },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  amountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
  },
  amountCard: {
    width: '48%',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  amountText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  methodCard: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
    borderWidth: 1,
  },
  methodIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  methodEmoji: { fontSize: 24 },
  methodInfo: { flex: 1 },
  methodLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  methodDescription: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  methodArrow: {
    fontSize: 32,
    color: '#9CA3AF',
  },
  summaryCard: {
    padding: moderateVerticalScale(20),
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    marginTop: moderateVerticalScale(16),
  },
  summaryLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(8),
  },
  summaryAmount: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
  },
});
