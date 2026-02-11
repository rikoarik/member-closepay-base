/**
 * BalanceTab Component
 * Tab untuk menampilkan semua jenis saldo dengan detail dan aksi cepat
 */
import React, { useState } from 'react';
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
import { BalanceCard } from '../ui/BalanceCard';
import { useNavigation } from '@react-navigation/native';

interface BalanceTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const BalanceTab: React.FC<BalanceTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [showBalance, setShowBalance] = useState(false);

    // Quick actions untuk balance
    const quickActions = [
      {
        id: 'topup',
        label: t('balance.topUp') || 'Top Up',
        icon: '⬆️',
        route: 'VirtualAccount',
        color: '#10B981',
      },
      {
        id: 'transfer',
        label: t('balance.transfer') || 'Transfer',
        icon: '💸',
        route: 'TransferMember',
        color: '#3B82F6',
      },
      {
        id: 'withdraw',
        label: t('balance.withdraw') || 'Tarik Tunai',
        icon: '⬇️',
        route: 'Withdraw',
        color: '#F59E0B',
      },
      {
        id: 'history',
        label: t('balance.history') || 'Riwayat',
        icon: '📜',
        route: 'TransactionHistory',
        color: '#8B5CF6',
      },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <View style={{ padding: getHorizontalPadding() }}>
          {/* Header */}
          <Text style={[styles.header, { color: colors.text }]}>
            {t('balance.title') || 'Saldo Saya'}
          </Text>

          {/* Balance Cards */}
          <View style={styles.balanceSection}>
            <BalanceCard
              title={t('balance.mainBalance') || 'Saldo Utama'}
              balance={10000000}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance(!showBalance)}
              backgroundColor="#076409"
            />

            <BalanceCard
              title={t('balance.plafonBalance') || 'Saldo Plafon'}
              balance={5000000}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance(!showBalance)}
              backgroundColor="#3B82F6"
            />

            <BalanceCard
              title={t('balance.mealBalance') || 'Saldo Makan'}
              balance={2000000}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance(!showBalance)}
              backgroundColor="#10B981"
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('balance.quickActions') || 'Aksi Cepat'}
            </Text>

            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.actionCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => navigation.navigate(action.route as never)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}
                  >
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Balance Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>
              {t('balance.totalBalance') || 'Total Saldo'}
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.text }]}>
              {showBalance ? 'Rp 17.000.000' : '••••••••'}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

BalanceTab.displayName = 'BalanceTab';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(20),
    marginTop: moderateVerticalScale(8),
  },
  balanceSection: {
    gap: moderateVerticalScale(12),
    marginBottom: moderateVerticalScale(24),
  },
  quickActionsSection: {
    marginBottom: moderateVerticalScale(24),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
  },
  actionCard: {
    width: '48%',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionIconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
    textAlign: 'center',
  },
  summaryCard: {
    padding: moderateVerticalScale(20),
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: moderateVerticalScale(8),
  },
  summaryAmount: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
  },
});
