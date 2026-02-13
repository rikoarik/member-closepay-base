import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft2, User, Heart } from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  ScreenHeader,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

// Mock data for donors
const MOCK_DONORS = [
  {
    id: '1',
    name: 'Hamba Allah',
    note: 'Bismillah semoga berkah',
    amount: 'Rp 50.000',
    time: '2 menit lalu',
    avatar: null,
  },
  {
    id: '2',
    name: 'Budi Santoso',
    note: 'Semangat adik-adik!',
    amount: 'Rp 100.000',
    time: '5 menit lalu',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUjze3HjUBtFxSz-sCQXn3iOnNEHhUBXLuocCYNkQMaOXBG3lz7g6mJUGqWLUEGc28ri46a1R5qZ5T0hNj4xBsfWXd8BL2KIK9h9WMFqrHNmNvmsupUKUJUXv2WuVug-AcR01B9vYEtAlc_GbWbgkp_HXiMAIrj-Kx4nshdOIew8uNpkb-eQo0sE_bCbChmjg2b2oovELygM__wzVjpZ-ZpKgJFM28HIVEMquTs_VTsuyHvMDBgrIcdhxTvvvXyKJp9jbrQFtEQJ4',
  },
  {
    id: '3',
    name: 'Rina Kartika',
    note: 'Patungan seikhlasnya',
    amount: 'Rp 25.000',
    time: '15 menit lalu',
    avatar: null,
    initials: 'RK',
  },
  {
    id: '4',
    name: 'Ahmad Fauzi',
    note: 'Semoga bermanfaat bagi sesama.',
    amount: 'Rp 200.000',
    time: '1 jam lalu',
    avatar: null,
  },
  {
    id: '5',
    name: 'Siti Aminah',
    note: 'Titip doa buat keluarga.',
    amount: 'Rp 500.000',
    time: '2 jam lalu',
    avatar: null,
    initials: 'SA',
  },
  {
    id: '6',
    name: 'Donatur Anonim',
    note: null,
    amount: 'Rp 10.000',
    time: '3 jam lalu',
    avatar: null,
  },
];

export const DonorListScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const horizontalPadding = getHorizontalPadding();

  const campaignTitle = route.params?.campaignTitle || 'Program Donasi';

  const renderItem = ({ item }: { item: (typeof MOCK_DONORS)[0] }) => (
    <View style={[styles.donorItem, { borderBottomColor: colors.borderLight }]}>
      <View style={styles.donorAvatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.donorAvatar} />
        ) : (
          <View
            style={[
              styles.initialsAvatar,
              {
                backgroundColor: item.initials ? colors.infoLight : colors.errorLight,
              },
            ]}
          >
            {item.initials ? (
              <Text style={[styles.initialsText, { color: colors.info }]}>{item.initials}</Text>
            ) : (
              <User size={scale(24)} color={colors.primary} />
            )}
          </View>
        )}
      </View>
      <View style={styles.donorInfo}>
        <View style={styles.donorHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.donorName, { color: colors.text }]}>{item.name}</Text>
            {item.note && (
              <Text style={[styles.donorNote, { color: colors.textTertiary }]} numberOfLines={2}>
                "{item.note}"
              </Text>
            )}
          </View>
          <Text style={[styles.donorTime, { color: colors.textTertiary }]}>{item.time}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.donorAmount, { color: colors.text }]}>{item.amount}</Text>
          <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '15' }]}>
            <Heart size={scale(10)} color={colors.success} variant="Bold" />
            <Text style={[styles.verifiedText, { color: colors.success }]}>Terverifikasi</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('donasiZakat.donors', { count: MOCK_DONORS.length.toString() }).split(' (')[0]}
      />

      <FlatList
        data={MOCK_DONORS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: scale(40),
  },
  donorItem: {
    flexDirection: 'row',
    paddingVertical: scale(20),
    borderBottomWidth: 1,
    gap: scale(16),
  },
  donorAvatarContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    overflow: 'hidden',
  },
  donorAvatar: {
    width: '100%',
    height: '100%',
  },
  initialsAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
  },
  donorInfo: {
    flex: 1,
  },
  donorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(8),
  },
  donorName: {
    fontSize: scale(15),
    fontFamily: FontFamily.monasans.bold,
  },
  donorNote: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.regular,
    fontStyle: 'italic',
    marginTop: scale(2),
  },
  donorTime: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.medium,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donorAmount: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(6),
    gap: scale(4),
  },
  verifiedText: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
  },
});

export default DonorListScreen;
