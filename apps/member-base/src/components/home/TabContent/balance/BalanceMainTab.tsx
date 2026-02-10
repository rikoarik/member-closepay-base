/**
 * BalanceMainTab Component
 * Tab khusus untuk Saldo Utama dengan detail dan quick actions
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

interface BalanceMainTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const BalanceMainTab: React.FC<BalanceMainTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [showBalance, setShowBalance] = useState(false);

    const quickActions = [
      { id: 'topup', label: 'Top Up', icon: '⬆️', route: 'VirtualAccount', color: '#10B981' },
      { id: 'transfer', label: 'Transfer', icon: '💸', route: 'TransferMember', color: '#3B82F6' },
      { id: 'withdraw', label: 'Tarik Tunai', icon: '⬇️', route: 'Withdraw', color: '#F59E0B' },
      {
        id: 'history',
        label: 'Riwayat',
        icon: '📜',
        route: 'TransactionHistory',
        color: '#8B5CF6',
      },
    ];

    const recentActivity = [
      {
        id: 1,
        type: 'topup',
        title: 'Top Up',
        amount: 1000000,
        date: 'Hari ini, 10:00',
        icon: '⬆️',
      },
      {
        id: 2,
        type: 'transfer',
        title: 'Transfer ke Budi',
        amount: -500000,
        date: 'Kemarin, 14:30',
        icon: '💸',
      },
      {
        id: 3,
        type: 'withdraw',
        title: 'Tarik ke Bank',
        amount: -200000,
        date: '2 hari lalu',
        icon: '⬇️',
      },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <Text style={[styles.header, { color: colors.text }]}>
              {t('balance.mainBalance') || 'Saldo Utama'}
            </Text>

            <BalanceCard
              title="Saldo Utama"
              balance={10000000}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance(!showBalance)}
              backgroundColor="#076409"
            />

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Aksi Cepat</Text>
              <View style={styles.actionsGrid}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => navigation.navigate(action.route as never)}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                      <Text style={styles.actionEmoji}>{action.icon}</Text>
                    </View>
                    <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Aktivitas Terakhir</Text>
              {recentActivity.map((item) => (
                <View
                  key={item.id}
                  style={[styles.activityItem, { backgroundColor: colors.surface }]}
                >
                  <Text style={styles.activityIcon}>{item.icon}</Text>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                      {item.date}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.activityAmount,
                      { color: item.amount > 0 ? '#10B981' : colors.text },
                    ]}
                  >
                    {item.amount > 0 ? '+' : ''}Rp {Math.abs(item.amount).toLocaleString('id-ID')}
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

BalanceMainTab.displayName = 'BalanceMainTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(20),
    marginTop: moderateVerticalScale(8),
  },
  section: { marginTop: moderateVerticalScale(24) },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(12) },
  actionCard: {
    width: '48%',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  actionEmoji: { fontSize: 24 },
  actionLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  activityItem: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  activityIcon: { fontSize: 24, marginRight: scale(12) },
  activityInfo: { flex: 1 },
  activityTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  activityDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
});
