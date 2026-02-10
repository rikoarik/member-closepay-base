/**
 * PaymentVATab Component
 * Tab khusus untuk top up via Virtual Account
 */
import React from 'react';
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

interface PaymentVATabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const PaymentVATab: React.FC<PaymentVATabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const banks = [
      { id: 'bca', name: 'BCA', vaNumber: '80777 1234567890', color: '#0066AE' },
      { id: 'bni', name: 'BNI', vaNumber: '988 7654321098765', color: '#F26522' },
      { id: 'mandiri', name: 'Mandiri', vaNumber: '70012 9876543210', color: '#003D79' },
      { id: 'bri', name: 'BRI', vaNumber: '26213 5678901234', color: '#003A70' },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <Text style={[styles.header, { color: colors.text }]}>Virtual Account</Text>

            <View style={[styles.infoCard, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Cara Top Up via VA</Text>
                <Text style={styles.infoText}>
                  Gunakan nomor VA di bawah untuk transfer dari mobile/internet banking Anda
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Pilih Bank</Text>
              {banks.map((bank) => (
                <View key={bank.id} style={[styles.bankCard, { backgroundColor: colors.surface }]}>
                  <View style={[styles.bankLogo, { backgroundColor: bank.color }]}>
                    <Text style={styles.bankName}>{bank.name}</Text>
                  </View>
                  <View style={styles.bankInfo}>
                    <Text style={[styles.bankLabel, { color: colors.textSecondary }]}>
                      Nomor VA
                    </Text>
                    <Text style={[styles.vaNumber, { color: colors.text }]}>{bank.vaNumber}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.copyButton, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.copyButtonText}>📋</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={[styles.stepsCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.stepsTitle, { color: colors.text }]}>Langkah Top Up:</Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                1. Pilih bank dan salin nomor VA
              </Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                2. Buka mobile/internet banking
              </Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                3. Transfer ke nomor VA
              </Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                4. Saldo otomatis masuk
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
);

PaymentVATab.displayName = 'PaymentVATab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(20),
    marginTop: moderateVerticalScale(8),
  },
  infoCard: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    marginBottom: moderateVerticalScale(24),
  },
  infoIcon: { fontSize: 24, marginRight: scale(12) },
  infoContent: { flex: 1 },
  infoTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    color: '#1E40AF',
  },
  section: {},
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  bankCard: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  bankLogo: {
    width: scale(56),
    height: scale(56),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  bankName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  bankInfo: { flex: 1 },
  bankLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  vaNumber: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginTop: 4,
  },
  copyButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: { fontSize: 20 },
  stepsCard: {
    marginTop: moderateVerticalScale(16),
    padding: moderateVerticalScale(20),
    borderRadius: 12,
  },
  stepsTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  stepText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(8),
  },
});
