import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

/**
 * PaymentSelectionScreen
 * Allows users to select a payment method.
 */
export const PaymentSelectionScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {t('payment.selectMethod', { defaultValue: 'Select Payment Method' })}
      </Text>
      {/* TODO: Implement payment selection logic */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
