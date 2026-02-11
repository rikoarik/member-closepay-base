/**
 * PaymentQrisTab Component
 * Tab khusus untuk pembayaran QRIS
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

interface PaymentQrisTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const PaymentQrisTab: React.FC<PaymentQrisTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const recentQRIS = [
      { id: 1, merchant: 'Toko ABC', amount: 150000, date: 'Hari ini, 14:00', status: 'success' },
      { id: 2, merchant: 'Restoran XYZ', amount: 85000, date: 'Kemarin, 12:30', status: 'success' },
      { id: 3, merchant: 'Mini Market', amount: 45000, date: '2 hari lalu', status: 'success' },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <Text style={[styles.header, { color: colors.text }]}>Bayar QRIS</Text>

            <View style={[styles.qrisCard, { backgroundColor: colors.surface }]}>
              <View style={styles.qrisIcon}>
                <Text style={styles.qrisEmoji}>📱</Text>
              </View>
              <Text style={[styles.qrisTitle, { color: colors.text }]}>Scan QR Code</Text>
              <Text style={[styles.qrisDescription, { color: colors.textSecondary }]}>
                Arahkan kamera ke QRIS untuk mulai pembayaran
              </Text>
              <TouchableOpacity style={[styles.scanButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.scanButtonText}>📷 Buka Kamera</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Riwayat QRIS</Text>
              {recentQRIS.map((tx) => (
                <View key={tx.id} style={[styles.txItem, { backgroundColor: colors.surface }]}>
                  <View style={styles.txIcon}>
                    <Text style={styles.txEmoji}>📱</Text>
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={[styles.txMerchant, { color: colors.text }]}>{tx.merchant}</Text>
                    <Text style={[styles.txDate, { color: colors.textSecondary }]}>{tx.date}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[styles.txAmount, { color: colors.text }]}>
                      Rp {tx.amount.toLocaleString('id-ID')}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#10B98120' }]}>
                      <Text style={styles.statusText}>✓ Berhasil</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.infoCard, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Tentang QRIS</Text>
                <Text style={styles.infoText}>
                  QRIS adalah metode pembayaran digital menggunakan QR Code yang dapat digunakan di
                  berbagai merchant
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
);

PaymentQrisTab.displayName = 'PaymentQrisTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(20),
    marginTop: moderateVerticalScale(8),
  },
  qrisCard: {
    padding: moderateVerticalScale(24),
    borderRadius: 16,
    alignItems: 'center',
  },
  qrisIcon: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: '#6366F120',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  qrisEmoji: { fontSize: 40 },
  qrisTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(8),
  },
  qrisDescription: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    marginBottom: moderateVerticalScale(20),
  },
  scanButton: {
    paddingHorizontal: scale(32),
    paddingVertical: moderateVerticalScale(14),
    borderRadius: 12,
  },
  scanButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  section: { marginTop: moderateVerticalScale(24) },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  txItem: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  txIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  txEmoji: { fontSize: 22 },
  txInfo: { flex: 1 },
  txMerchant: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  txDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  txRight: { alignItems: 'flex-end' },
  txAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: moderateVerticalScale(4),
    borderRadius: 6,
  },
  statusText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    color: '#10B981',
  },
  infoCard: {
    flexDirection: 'row',
    marginTop: moderateVerticalScale(24),
    padding: moderateVerticalScale(16),
    borderRadius: 12,
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
});
