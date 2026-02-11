/**
 * BalanceTransferTab Component
 * Tab untuk transfer antar saldo
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';

interface BalanceTransferTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const BalanceTransferTab: React.FC<BalanceTransferTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [fromBalance, setFromBalance] = useState('main');
    const [toBalance, setToBalance] = useState('meal');
    const [amount, setAmount] = useState('');

    const balances = [
      { id: 'main', label: 'Saldo Utama', balance: 10000000, icon: '💰', color: '#076409' },
      { id: 'plafon', label: 'Saldo Plafon', balance: 5000000, icon: '💳', color: '#3B82F6' },
      { id: 'meal', label: 'Saldo Makan', balance: 2000000, icon: '🍽️', color: '#10B981' },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <Text style={[styles.header, { color: colors.text }]}>Transfer Antar Saldo</Text>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Dari</Text>
              <View style={styles.balanceSelector}>
                {balances.map((bal) => (
                  <TouchableOpacity
                    key={bal.id}
                    style={[
                      styles.balanceOption,
                      {
                        backgroundColor: fromBalance === bal.id ? bal.color : colors.surface,
                        borderColor: fromBalance === bal.id ? bal.color : colors.border,
                      },
                    ]}
                    onPress={() => setFromBalance(bal.id)}
                  >
                    <Text style={styles.balanceIcon}>{bal.icon}</Text>
                    <Text
                      style={[
                        styles.balanceLabel,
                        { color: fromBalance === bal.id ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {bal.label}
                    </Text>
                    <Text
                      style={[
                        styles.balanceAmount,
                        { color: fromBalance === bal.id ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      Rp {bal.balance.toLocaleString('id-ID')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.swapIconContainer}>
              <Text style={styles.swapIcon}>🔄</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Ke</Text>
              <View style={styles.balanceSelector}>
                {balances.map((bal) => (
                  <TouchableOpacity
                    key={bal.id}
                    style={[
                      styles.balanceOption,
                      {
                        backgroundColor: toBalance === bal.id ? bal.color : colors.surface,
                        borderColor: toBalance === bal.id ? bal.color : colors.border,
                      },
                    ]}
                    onPress={() => setToBalance(bal.id)}
                  >
                    <Text style={styles.balanceIcon}>{bal.icon}</Text>
                    <Text
                      style={[
                        styles.balanceLabel,
                        { color: toBalance === bal.id ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {bal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Jumlah</Text>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Masukkan jumlah"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <TouchableOpacity style={[styles.transferButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.transferButtonText}>Transfer Sekarang</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
);

BalanceTransferTab.displayName = 'BalanceTransferTab';

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
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  balanceSelector: { gap: scale(12) },
  balanceOption: {
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    borderWidth: 2,
  },
  balanceIcon: { fontSize: 32, marginBottom: moderateVerticalScale(8) },
  balanceLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  balanceAmount: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 4,
  },
  swapIconContainer: { alignItems: 'center', marginVertical: moderateVerticalScale(8) },
  swapIcon: { fontSize: 32 },
  amountInput: {
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    borderWidth: 1,
  },
  transferButton: {
    marginTop: moderateVerticalScale(24),
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
  },
  transferButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
});
