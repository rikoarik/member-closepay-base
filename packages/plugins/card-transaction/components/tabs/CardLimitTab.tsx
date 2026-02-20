/**
 * CardLimitTab Component
 * Tab untuk mengatur limit kartu virtual. Buka "Pengaturan Transaksi Kartu" via sheet.
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { Setting2 } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';
import { CardTransactionSettingsSheet } from '../CardTransactionSettingsSheet';

interface CardLimitTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const CardLimitTab: React.FC<CardLimitTabProps> = React.memo(
  ({ isActive = true, isVisible = true, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [settingsSheetVisible, setSettingsSheetVisible] = useState(false);
    const [onlineEnabled, setOnlineEnabled] = useState(true);
    const [internationalEnabled, setInternationalEnabled] = useState(false);

    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        pointerEvents={isActive ? 'auto' : 'none'}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <View style={{ padding: getHorizontalPadding() }} pointerEvents="box-none">
            <Text style={[styles.header, { color: colors.text }]}>
              {t('home.cardLimit') || 'Limit Kartu'}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.settingsCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => setSettingsSheetVisible(true)}
              android_ripple={null}
            >
              <View style={[styles.settingsCardIcon, { backgroundColor: colors.primaryLight ?? colors.background }]}>
                <Setting2 size={scale(24)} color={colors.primary} variant="Bold" />
              </View>
              <View style={styles.settingsCardText}>
                <Text style={[styles.settingsCardTitle, { color: colors.text }]}>
                  {t('home.transactionCardSettings') || 'Pengaturan Transaksi Kartu'}
                </Text>
                <Text style={[styles.settingsCardDesc, { color: colors.textSecondary }]}>
                  {t('cardTransactionSettings.sheetHint') || 'Atur limit sekali transaksi, harian, bulanan, dan akumulasi'}
                </Text>
              </View>
            </Pressable>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('cardLimitTab.transactionSettings') || 'Pengaturan Transaksi'}
              </Text>

              <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {t('cardLimitTab.onlineTransaction') || 'Transaksi Online'}
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    {t('cardLimitTab.allowOnlinePayment') || 'Izinkan pembayaran online'}
                  </Text>
                </View>
                <Switch
                  value={onlineEnabled}
                  onValueChange={setOnlineEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {t('cardLimitTab.internationalTransaction') || 'Transaksi Internasional'}
                  </Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    {t('cardLimitTab.allowInternational') || 'Izinkan transaksi luar negeri'}
                  </Text>
                </View>
                <Switch
                  value={internationalEnabled}
                  onValueChange={setInternationalEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <CardTransactionSettingsSheet
          visible={settingsSheetVisible}
          onClose={() => setSettingsSheetVisible(false)}
          onSave={() => setSettingsSheetVisible(false)}
        />
      </View>
    );
  }
);

CardLimitTab.displayName = 'CardLimitTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(20),
    marginTop: moderateVerticalScale(8),
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: moderateVerticalScale(24),
    minHeight: 76,
  },
  settingsCardIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(14),
  },
  settingsCardText: { flex: 1 },
  settingsCardTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: 4,
  },
  settingsCardDesc: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  section: { marginBottom: moderateVerticalScale(24) },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
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
});
