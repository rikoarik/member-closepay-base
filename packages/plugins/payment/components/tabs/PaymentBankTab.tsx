/**
 * PaymentBankTab Component
 * Tab untuk transfer bank
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
} from '@core/config';

interface PaymentBankTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const PaymentBankTab: React.FC<PaymentBankTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();

    const banks = ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga'];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={{ padding: getHorizontalPadding() }}>
          <Text style={[styles.header, { color: colors.text }]}>Transfer Bank</Text>
          {banks.map((bank, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.bankItem, { backgroundColor: colors.surface }]}
            >
              <View style={styles.bankIcon}>
                <Text>🏦</Text>
              </View>
              <Text style={[styles.bankName, { color: colors.text }]}>{bank}</Text>
              <Text style={{ color: colors.textSecondary }}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }
);
PaymentBankTab.displayName = 'PaymentBankTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankName: {
    flex: 1,
    fontFamily: FontFamily.monasans.semiBold,
    fontSize: getResponsiveFontSize('medium'),
  },
});
