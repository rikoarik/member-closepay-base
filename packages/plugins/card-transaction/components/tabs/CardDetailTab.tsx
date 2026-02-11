/**
 * CardDetailTab Component
 * Tab untuk detail kartu virtual
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

interface CardDetailTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const CardDetailTab: React.FC<CardDetailTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [showCardNumber, setShowCardNumber] = useState(false);
    const [showCVV, setShowCVV] = useState(false);

    const cardInfo = [
      { label: 'Nama Pemegang', value: 'John Doe' },
      {
        label: 'Nomor Kartu',
        value: showCardNumber ? '4532 1234 5678 9012' : '•••• •••• •••• 9012',
      },
      { label: 'Berlaku Hingga', value: '12/25' },
      { label: 'CVV', value: showCVV ? '123' : '•••' },
      { label: 'Status', value: 'Aktif' },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <Text style={[styles.header, { color: colors.text }]}>Detail Kartu</Text>

            <View style={[styles.cardVisual, { backgroundColor: '#1F2937' }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>Virtual Card</Text>
                <Text style={styles.cardChip}>💳</Text>
              </View>
              <Text style={styles.cardNumber}>
                {showCardNumber ? '4532 1234 5678 9012' : '•••• •••• •••• 9012'}
              </Text>
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>Pemegang</Text>
                  <Text style={styles.cardName}>JOHN DOE</Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>Exp</Text>
                  <Text style={styles.cardName}>12/25</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.surface }]}
                onPress={() => setShowCardNumber(!showCardNumber)}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  {showCardNumber ? '🙈' : '👁️'} {showCardNumber ? 'Sembunyikan' : 'Lihat'} Nomor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.surface }]}
                onPress={() => setShowCVV(!showCVV)}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  {showCVV ? '🙈' : '👁️'} {showCVV ? 'Sembunyikan' : 'Lihat'} CVV
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Informasi Kartu</Text>
              {cardInfo.map((info, index) => (
                <View key={index} style={[styles.infoRow, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    {info.label}
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{info.value}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={[styles.manageButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.manageButtonText}>Kelola Kartu</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
);

CardDetailTab.displayName = 'CardDetailTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(20),
    marginTop: moderateVerticalScale(8),
  },
  cardVisual: {
    padding: moderateVerticalScale(24),
    borderRadius: 16,
    marginBottom: moderateVerticalScale(16),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(32),
  },
  cardType: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  cardChip: { fontSize: 32 },
  cardNumber: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
    marginBottom: moderateVerticalScale(24),
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 4,
  },
  cardName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: moderateVerticalScale(24),
  },
  actionButton: {
    flex: 1,
    padding: moderateVerticalScale(12),
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  section: { marginBottom: moderateVerticalScale(24) },
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
  infoLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
  },
  infoValue: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  manageButton: {
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
});
