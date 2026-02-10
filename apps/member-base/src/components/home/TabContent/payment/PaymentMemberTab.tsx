/**
 * PaymentMemberTab Component
 * Tab khusus untuk transfer ke member lain
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

interface PaymentMemberTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const PaymentMemberTab: React.FC<PaymentMemberTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [memberId, setMemberId] = useState('');
    const [amount, setAmount] = useState('');

    const frequentMembers = [
      { id: 1, name: 'Budi Hartono', memberId: 'MB001234', avatar: '👤' },
      { id: 2, name: 'Siti Aminah', memberId: 'MB005678', avatar: '👤' },
      { id: 3, name: 'Agus Salim', memberId: 'MB009012', avatar: '👤' },
    ];

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={{ padding: getHorizontalPadding() }}>
            <Text style={[styles.header, { color: colors.text }]}>Transfer Member</Text>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  ID Member Tujuan
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
                  placeholder="Masukkan ID Member"
                  placeholderTextColor={colors.textSecondary}
                  value={memberId}
                  onChangeText={setMemberId}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Jumlah Transfer</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <TouchableOpacity
                style={[styles.transferButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.transferButtonText}>Lanjutkan Transfer</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Member Favorit</Text>
              {frequentMembers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[styles.memberCard, { backgroundColor: colors.surface }]}
                  onPress={() => setMemberId(member.memberId)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{member.avatar}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                    <Text style={[styles.memberIdText, { color: colors.textSecondary }]}>
                      {member.memberId}
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

PaymentMemberTab.displayName = 'PaymentMemberTab';

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
  memberCard: {
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
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  memberIdText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  selectIcon: { fontSize: 32, color: '#9CA3AF' },
});
