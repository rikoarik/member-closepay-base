/**
 * CardLimitTab Component
 * Tab untuk mengatur limit kartu virtual
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';

interface CardLimitTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const CardLimitTab: React.FC<CardLimitTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [dailyLimit, setDailyLimit] = useState('5000000');
    const [monthlyLimit, setMonthlyLimit] = useState('20000000');
    const [onlineEnabled, setOnlineEnabled] = useState(true);
    const [internationalEnabled, setInternationalEnabled] = useState(false);

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <Text style={[styles.header, { color: colors.text }]}>Limit Kartu</Text>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Limit Transaksi</Text>

              <View style={[styles.limitCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>
                  Limit Harian
                </Text>
                <TextInput
                  style={[styles.limitInput, { color: colors.text, borderColor: colors.border }]}
                  value={dailyLimit}
                  onChangeText={setDailyLimit}
                  keyboardType="numeric"
                />
                <Text style={[styles.limitHint, { color: colors.textSecondary }]}>
                  Maks. Rp 10.000.000/hari
                </Text>
              </View>

              <View style={[styles.limitCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>
                  Limit Bulanan
                </Text>
                <TextInput
                  style={[styles.limitInput, { color: colors.text, borderColor: colors.border }]}
                  value={monthlyLimit}
                  onChangeText={setMonthlyLimit}
                  keyboardType="numeric"
                />
                <Text style={[styles.limitHint, { color: colors.textSecondary }]}>
                  Maks. Rp 50.000.000/bulan
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Pengaturan Transaksi
              </Text>

              <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Transaksi Online
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Izinkan pembayaran online
                  </Text>
                </View>
                <Switch
                  value={onlineEnabled}
                  onValueChange={setOnlineEnabled}
                  trackColor={{ false: '#D1D5DB', true: colors.primary }}
                />
              </View>

              <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Transaksi Internasional
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Izinkan transaksi luar negeri
                  </Text>
                </View>
                <Switch
                  value={internationalEnabled}
                  onValueChange={setInternationalEnabled}
                  trackColor={{ false: '#D1D5DB', true: colors.primary }}
                />
              </View>
            </View>

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
);

CardLimitTab.displayName = 'CardLimitTab';

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
  limitCard: {
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    marginBottom: moderateVerticalScale(12),
  },
  limitLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(8),
  },
  limitInput: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    padding: moderateVerticalScale(12),
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: moderateVerticalScale(8),
  },
  limitHint: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  settingCard: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  saveButton: {
    marginTop: moderateVerticalScale(8),
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
});
