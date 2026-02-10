/**
 * DashboardTab Component
 * Alternatif dashboard dengan overview lengkap
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
import { BalanceCard } from '@plugins/balance/components/ui/BalanceCard';
import { useNavigation } from '@react-navigation/native';

interface DashboardTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const DashboardTab: React.FC<DashboardTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [showBalance, setShowBalance] = useState(false);

    // Quick stats
    const stats = [
      {
        id: 'income',
        label: t('dashboard.income') || 'Pemasukan',
        value: 'Rp 5.5jt',
        change: '+12%',
        isPositive: true,
        icon: '📈',
      },
      {
        id: 'expense',
        label: t('dashboard.expense') || 'Pengeluaran',
        value: 'Rp 3.2jt',
        change: '-8%',
        isPositive: false,
        icon: '📉',
      },
      {
        id: 'transactions',
        label: t('dashboard.transactions') || 'Transaksi',
        value: '24',
        change: 'Bulan ini',
        isPositive: true,
        icon: '💳',
      },
    ];

    // Quick actions
    const quickActions = [
      { id: 'topup', label: 'Top Up', icon: '⬆️', route: 'VirtualAccount' },
      { id: 'transfer', label: 'Transfer', icon: '💸', route: 'TransferMember' },
      { id: 'qris', label: 'QRIS', icon: '📱', route: 'QrisPayment' },
      { id: 'marketplace', label: 'Belanja', icon: '🛒', route: 'Marketplace' },
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
            <View style={styles.headerSection}>
              <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                  {t('dashboard.greeting') || 'Selamat Datang'}
                </Text>
                <Text style={[styles.userName, { color: colors.text }]}>John Doe</Text>
              </View>
            </View>

            {/* Main Balance */}
            <View style={styles.balanceSection}>
              <BalanceCard
                title={t('balance.mainBalance') || 'Saldo Utama'}
                balance={10000000}
                showBalance={showBalance}
                onToggleBalance={() => setShowBalance(!showBalance)}
                backgroundColor="#076409"
              />
            </View>

            {/* Quick Stats */}
            <View style={styles.statsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('dashboard.overview') || 'Ringkasan'}
              </Text>
              <View style={styles.statsGrid}>
                {stats.map((stat) => (
                  <View
                    key={stat.id}
                    style={[styles.statCard, { backgroundColor: colors.surface }]}
                  >
                    <Text style={styles.statIcon}>{stat.icon}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      {stat.label}
                    </Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                    <Text
                      style={[
                        styles.statChange,
                        { color: stat.isPositive ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {stat.change}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('dashboard.quickActions') || 'Aksi Cepat'}
              </Text>
              <View style={styles.actionsGrid}>
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
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                    <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Activity Summary */}
            <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>
                {t('dashboard.recentActivity') || 'Aktivitas Terakhir'}
              </Text>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>💸</Text>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityName, { color: colors.text }]}>
                    Transfer ke Budi
                  </Text>
                  <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                    2 jam lalu
                  </Text>
                </View>
                <Text style={[styles.activityAmount, { color: colors.text }]}>-Rp 500.000</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>📱</Text>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityName, { color: colors.text }]}>QRIS Payment</Text>
                  <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                    Kemarin
                  </Text>
                </View>
                <Text style={[styles.activityAmount, { color: colors.text }]}>-Rp 150.000</Text>
              </View>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('TransactionHistory' as never)}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  {t('common.seeAll') || 'Lihat Semua'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
);

DashboardTab.displayName = 'DashboardTab';

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
  headerSection: {
    marginTop: moderateVerticalScale(8),
    marginBottom: moderateVerticalScale(16),
  },
  greeting: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(4),
  },
  userName: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
  },
  balanceSection: {
    marginBottom: moderateVerticalScale(24),
  },
  statsSection: {
    marginBottom: moderateVerticalScale(24),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  statsGrid: {
    flexDirection: 'row',
    gap: scale(12),
  },
  statCard: {
    flex: 1,
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: moderateVerticalScale(8),
  },
  statLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(4),
  },
  statValue: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(2),
  },
  statChange: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
  },
  actionsSection: {
    marginBottom: moderateVerticalScale(24),
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
  },
  actionCard: {
    width: '23%',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: moderateVerticalScale(8),
  },
  actionLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    textAlign: 'center',
  },
  activityCard: {
    padding: moderateVerticalScale(16),
    borderRadius: 12,
  },
  activityTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
  },
  activityIcon: {
    fontSize: 24,
    marginRight: scale(12),
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: moderateVerticalScale(2),
  },
  activityDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  activityAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  seeAllButton: {
    alignItems: 'center',
    paddingTop: moderateVerticalScale(8),
  },
  seeAllText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
});
