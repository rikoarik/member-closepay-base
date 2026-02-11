/**
 * BalanceHistoryTab Component
 * Tab untuk riwayat semua perubahan saldo
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

interface BalanceHistoryTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

type BalanceType = 'all' | 'main' | 'plafon' | 'meal';

export const BalanceHistoryTab: React.FC<BalanceHistoryTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [selectedType, setSelectedType] = useState<BalanceType>('all');

    const filters = [
      { id: 'all', label: 'Semua' },
      { id: 'main', label: 'Utama' },
      { id: 'plafon', label: 'Plafon' },
      { id: 'meal', label: 'Makan' },
    ];

    const history = [
      {
        id: 1,
        type: 'main',
        action: 'Top Up',
        amount: 1000000,
        date: 'Hari ini, 10:00',
        icon: '⬆️',
        balanceType: 'Utama',
      },
      {
        id: 2,
        type: 'main',
        action: 'Transfer Keluar',
        amount: -500000,
        date: 'Kemarin, 14:30',
        icon: '💸',
        balanceType: 'Utama',
      },
      {
        id: 3,
        type: 'meal',
        action: 'Pembayaran F&B',
        amount: -35000,
        date: 'Kemarin, 12:00',
        icon: '🍽️',
        balanceType: 'Makan',
      },
      {
        id: 4,
        type: 'meal',
        action: 'Top Up Saldo Makan',
        amount: 500000,
        date: '2 hari lalu',
        icon: '⬆️',
        balanceType: 'Makan',
      },
    ];

    const filteredHistory =
      selectedType === 'all' ? history : history.filter((h) => h.type === selectedType);

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <View style={{ padding: getHorizontalPadding() }}>
          <Text style={[styles.header, { color: colors.text }]}>
            {t('balance.history') || 'Riwayat Saldo'}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: selectedType === filter.id ? colors.primary : colors.surface,
                    borderColor: selectedType === filter.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedType(filter.id as BalanceType)}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: selectedType === filter.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {filteredHistory.map((item) => (
              <View key={item.id} style={[styles.historyItem, { backgroundColor: colors.surface }]}>
                <Text style={styles.historyIcon}>{item.icon}</Text>
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyAction, { color: colors.text }]}>{item.action}</Text>
                  <Text style={[styles.historyMeta, { color: colors.textSecondary }]}>
                    {item.balanceType} • {item.date}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.historyAmount,
                    { color: item.amount > 0 ? '#10B981' : colors.text },
                  ]}
                >
                  {item.amount > 0 ? '+' : ''}Rp {Math.abs(item.amount).toLocaleString('id-ID')}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }
);

BalanceHistoryTab.displayName = 'BalanceHistoryTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  filtersContainer: { marginBottom: moderateVerticalScale(16) },
  filterButton: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: 20,
    borderWidth: 1,
    marginRight: scale(8),
  },
  filterText: { fontSize: getResponsiveFontSize('medium'), fontFamily: FontFamily.monasans.medium },
  historyList: { flex: 1 },
  historyItem: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  historyIcon: { fontSize: 24, marginRight: scale(12) },
  historyInfo: { flex: 1 },
  historyAction: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  historyMeta: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  historyAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
});
