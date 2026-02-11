/**
 * BalanceMealTab Component
 * Tab khusus untuk Saldo Makan
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
import { BalanceCard } from '../ui/BalanceCard';
import { useNavigation } from '@react-navigation/native';

interface BalanceMealTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const BalanceMealTab: React.FC<BalanceMealTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [showBalance, setShowBalance] = useState(false);

    const mealTransactions = [
      {
        id: 1,
        merchant: 'Warung Makan Sederhana',
        amount: -35000,
        date: 'Hari ini, 12:00',
        icon: '🍽️',
      },
      { id: 2, merchant: 'Kopi Kenangan', amount: -25000, date: 'Hari ini, 08:30', icon: '☕' },
      { id: 3, merchant: 'Top Up Saldo Makan', amount: 500000, date: 'Kemarin', icon: '⬆️' },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <Text style={[styles.header, { color: colors.text }]}>
              {t('balance.mealBalance') || 'Saldo Makan'}
            </Text>

            <BalanceCard
              title="Saldo Makan"
              balance={2000000}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance(!showBalance)}
              backgroundColor="#10B981"
            />

            <TouchableOpacity
              style={[styles.topupButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('VirtualAccount' as never)}
            >
              <Text style={styles.topupButtonText}>⬆️ Top Up Saldo Makan</Text>
            </TouchableOpacity>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaksi Terakhir</Text>
              {mealTransactions.map((tx) => (
                <View key={tx.id} style={[styles.txItem, { backgroundColor: colors.surface }]}>
                  <Text style={styles.txIcon}>{tx.icon}</Text>
                  <View style={styles.txInfo}>
                    <Text style={[styles.txMerchant, { color: colors.text }]}>{tx.merchant}</Text>
                    <Text style={[styles.txDate, { color: colors.textSecondary }]}>{tx.date}</Text>
                  </View>
                  <Text
                    style={[styles.txAmount, { color: tx.amount > 0 ? '#10B981' : colors.text }]}
                  >
                    {tx.amount > 0 ? '+' : ''}Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.tipCard, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                Gunakan saldo makan Anda untuk transaksi di merchant F&B yang terdaftar
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
);

BalanceMealTab.displayName = 'BalanceMealTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(20),
    marginTop: moderateVerticalScale(8),
  },
  topupButton: {
    marginTop: moderateVerticalScale(16),
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
  },
  topupButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  section: { marginTop: moderateVerticalScale(24) },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  txItem: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  txIcon: { fontSize: 24, marginRight: scale(12) },
  txInfo: { flex: 1 },
  txMerchant: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  txDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  txAmount: { fontSize: getResponsiveFontSize('medium'), fontFamily: FontFamily.monasans.bold },
  tipCard: {
    flexDirection: 'row',
    marginTop: moderateVerticalScale(24),
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
  },
  tipIcon: { fontSize: 24, marginRight: scale(12) },
  tipText: {
    flex: 1,
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    color: '#92400E',
  },
});
