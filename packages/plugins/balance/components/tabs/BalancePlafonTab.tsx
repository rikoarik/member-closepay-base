/**
 * BalancePlafonTab Component
 * Tab khusus untuk Saldo Plafon
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
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

interface BalancePlafonTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const BalancePlafonTab: React.FC<BalancePlafonTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [showBalance, setShowBalance] = useState(false);

    const plafonInfo = [
      { label: 'Total Plafon', value: 'Rp 5.000.000', color: colors.text },
      { label: 'Terpakai', value: 'Rp 0', color: '#10B981' },
      { label: 'Tersedia', value: 'Rp 5.000.000', color: '#3B82F6' },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <Text style={[styles.header, { color: colors.text }]}>
              {t('balance.plafonBalance') || 'Saldo Plafon'}
            </Text>

            <BalanceCard
              title="Saldo Plafon"
              balance={5000000}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance(!showBalance)}
              backgroundColor="#3B82F6"
            />

            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Informasi Plafon</Text>
              {plafonInfo.map((info, index) => (
                <View key={index} style={[styles.infoRow, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    {info.label}
                  </Text>
                  <Text style={[styles.infoValue, { color: info.color }]}>
                    {showBalance ? info.value : '••••••••'}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.noteCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.noteTitle, { color: colors.text }]}>
                ℹ️ Tentang Saldo Plafon
              </Text>
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                Saldo plafon adalah limit kredit yang dapat Anda gunakan untuk transaksi. Anda dapat
                mengatur dan memantau penggunaan plafon di sini.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
);

BalancePlafonTab.displayName = 'BalancePlafonTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(20),
    marginTop: moderateVerticalScale(8),
  },
  infoSection: { marginTop: moderateVerticalScale(24) },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    marginBottom: moderateVerticalScale(8),
  },
  infoLabel: { fontSize: getResponsiveFontSize('medium'), fontFamily: FontFamily.monasans.regular },
  infoValue: { fontSize: getResponsiveFontSize('medium'), fontFamily: FontFamily.monasans.bold },
  noteCard: {
    marginTop: moderateVerticalScale(24),
    padding: moderateVerticalScale(16),
    borderRadius: 12,
  },
  noteTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(8),
  },
  noteText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: 20,
  },
});
