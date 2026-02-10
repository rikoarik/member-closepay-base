/**
 * CardTopupTab Component
 * Tab untuk topup kartu
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
} from '@core/config';

export const CardTopupTab: React.FC<any> = React.memo(({ isActive = true }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      pointerEvents={isActive ? 'auto' : 'none'}
    >
      <View style={{ padding: getHorizontalPadding() }}>
        <Text style={[styles.header, { color: colors.text }]}>Isi Ulang Kartu</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.text, { color: colors.text }]}>
            Pilih sumber dana untuk top up kartu virtual Anda
          </Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]}>
            <Text style={styles.btnText}>Dari Saldo Utama</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(8),
  },
  card: { padding: 24, borderRadius: 16, alignItems: 'center' },
  text: { textAlign: 'center', marginBottom: 24, fontFamily: FontFamily.monasans.regular },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#FFF', fontFamily: FontFamily.monasans.semiBold },
});
