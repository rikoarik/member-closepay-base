/**
 * PaymentTransferTab Component
 * Tab khusus untuk transfer uang
 */
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';

interface PaymentTransferTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const PaymentTransferTab: React.FC<PaymentTransferTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');

    const recentRecipients = [
      { id: 1, name: 'Budi Santoso', phone: '081234567890', avatar: '👤' },
      { id: 2, name: 'Siti Nurhaliza', phone: '085678901234', avatar: '👤' },
      { id: 3, name: 'Ahmad Yani', phone: '089012345678', avatar: '👤' },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <Text style={[styles.header, { color: colors.text }]}>Transfer</Text>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Nomor HP / ID Member
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="08xxxxxxxxx atau ID Member"
                  placeholderTextColor={colors.textSecondary}
                  value={recipient}
                  onChangeText={setRecipient}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Jumlah</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Masukkan jumlah"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <TouchableOpacity
                style={[styles.transferButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.transferButtonText}>Transfer Sekarang</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Penerima Terakhir</Text>
              {recentRecipients.map((person) => (
                <TouchableOpacity
                  key={person.id}
                  style={[styles.recipientCard, { backgroundColor: colors.surface }]}
                  onPress={() => setRecipient(person.phone)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{person.avatar}</Text>
                  </View>
                  <View style={styles.recipientInfo}>
                    <Text style={[styles.recipientName, { color: colors.text }]}>
                      {person.name}
                    </Text>
                    <Text style={[styles.recipientPhone, { color: colors.textSecondary }]}>
                      {person.phone}
                    </Text>
                  </View>
                  <Text style={styles.selectIcon}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
);

PaymentTransferTab.displayName = 'PaymentTransferTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(24),
    marginTop: moderateVerticalScale(8),
  },
  form: { marginBottom: moderateVerticalScale(24) },
  formGroup: { marginBottom: moderateVerticalScale(20) },
  label: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(8),
  },
  input: {
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    borderWidth: 1,
  },
  transferButton: {
    marginTop: moderateVerticalScale(8),
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
  },
  transferButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    color: '#FFFFFF',
  },
  section: {},
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  recipientCard: {
    flexDirection: 'row',
    padding: moderateVerticalScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  avatar: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  avatarText: { fontSize: 24 },
  recipientInfo: { flex: 1 },
  recipientName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  recipientPhone: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  selectIcon: { fontSize: 32, color: '#9CA3AF' },
});
