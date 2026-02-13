import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft2, SearchNormal1, Filter, Flash, TickCircle } from 'iconsax-react-nativejs';
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

// Mock data (same as Hub for consistency)
const ALL_PROGRAMS = [
  {
    id: '1',
    title: 'Beasiswa Yatim Dhuafa',
    description: 'Bantu pendidikan 100 anak yatim agar terus bersekolah.',
    collected: 125400000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD8ArbmmzhIfLvGPJi0fjUBwntV29SShuZPqtIbe3G0m-zyAS27XXh3a8Pg_HOw3NYA84bgIxHw4TpSEeCMXX5Udj4MQ153UOah7YGFyYrxmICMp_U8KSNNxGbkn5ra9e8WA87Ri-y7myI-4P8yNdEExwixZNU96Q9db4murBz6_X9EP5kiykZNo6iX9saeh0QICFIZIjjG_fghlJh2cpEeBNn1L3GWRKNowMAbLkqAfVljrNTe1R2MTnbUYq6DOlBNWplDFz8IKko',
    progress: 0.85,
    provider: 'BAZNAS',
    category: 'zakat',
  },
  {
    id: '2',
    title: 'Bangun Masjid Desa Pelosok',
    description: 'Wakaf tunai untuk penyelesaian pembangunan masjid Al-Ikhlas.',
    collected: 45000000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6mjpv1YlPfMjDrHHPkazSmkzQu9jsaq5zSXVdrWzbEhmDrtCtl86U5JDg5se42Cr0iGQcRyf1B09qh6eXr4MDi7iPH26GMZFVQDvOf3Y-HNPhcqyceEVnXMH1ETPLuxBpZ8wQSOYvQMpa2uYoznhVlZJCwisZe6gOtepv9rXH3s0SR56b2TfzhXBnxTemp1Sk4a1kHvR7HcXLFD5eNI94Kh9THr9Osu8dphFfKllXliT1dn3nrwluA6Rg-qtGihva1eMfWWhBy6s',
    progress: 0.4,
    provider: 'Lembaga Wakaf',
    category: 'wakaf',
  },
  {
    id: '3',
    title: 'Bantu Korban Banjir Demak',
    description: 'Ribuan warga mengungsi membutuhkan bantuan pangan dan obat.',
    collected: 50000000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLxjHyBSV2oMAqBPeQKxGXhrgDaONA18BF7IoejqLS8CpI9Ogx3W2EL3Lika9C6JezqxCkflvzi-fKSd7lbhxj2rY82vEIWmGZhnLZ_aETnSTC33979fw4Xl3eHxbPciaNXOUr6qbc-bncIZPR3eD2PextcSz4R8_d0mWSX4JM17xBVUd-Nw-ZMuOuvei8QFY3UWI3wHOFx5DrVpgN9ARTbGfmWGJIrgBdRLwQDrIS4Rp8W9g7EQ3KC_nPR1W9Uhl_QCgHiv0RTC0',
    progress: 0.65,
    provider: 'Dompet Dhuafa',
    category: 'sedekah',
    urgent: true,
  },
  {
    id: '4',
    title: 'Pembangunan Jembatan Gantung',
    description: 'Memudahkan akses sekolah bagi warga desa terpencil.',
    collected: 75000000,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-pGhzg_U2hD8H7qGzI0Q1N7XN2z5R-l8oX7b0m8pE4Pz3-n9H8j1K3oV7i-t9F7C2kLqm5w7r9B6yW4p1m5y5i3B8y6-m5w4p1m5y5i3',
    progress: 0.3,
    provider: 'Aksi Cepat Tanggap',
    category: 'sosial',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'zakat', label: 'Zakat' },
  { id: 'sedekah', label: 'Sedekah' },
  { id: 'wakaf', label: 'Wakaf' },
  { id: 'sosial', label: 'Sosial' },
];

export const DonationListScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const horizontalPadding = getHorizontalPadding();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'all');

  const filteredPrograms = useMemo(() => {
    return ALL_PROGRAMS.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  const renderItem = ({ item }: { item: (typeof ALL_PROGRAMS)[0] }) => (
    <TouchableOpacity
      style={[
        styles.programCard,
        { backgroundColor: colors.surface, borderColor: colors.borderLight },
      ]}
      onPress={() => (navigation as any).navigate('CampaignDetail', { id: item.id })}
    >
      <View style={styles.programImageContainer}>
        <Image source={{ uri: item.image }} style={styles.programImage} />
        {item.urgent && (
          <View style={[styles.urgentBadge, { backgroundColor: colors.error }]}>
            <Flash size={scale(10)} color="#FFF" variant="Bold" />
            <Text style={styles.urgentBadgeText}>{t('donasiZakat.emergency')}</Text>
          </View>
        )}
      </View>
      <View style={styles.programDetails}>
        <View>
          <Text style={[styles.programTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.programDesc, { color: colors.textTertiary }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={styles.programProgress}>
          <View style={styles.programStatRow}>
            <Text style={[styles.programCollected, { color: colors.primary }]}>
              Rp {item.collected.toLocaleString('id-ID')}
            </Text>
            <Text style={[styles.programLabel, { color: colors.textTertiary }]}>
              {t('donasiZakat.collected')}
            </Text>
          </View>
          <View style={[styles.programProgressBarBg, { backgroundColor: colors.borderLight }]}>
            <View
              style={[
                styles.programProgressBarFill,
                { width: `${item.progress * 100}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('donasiZakat.allPrograms') || 'Semua Program'} />

      <View style={[styles.searchContainer, { paddingHorizontal: horizontalPadding }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.borderLight },
          ]}
        >
          <SearchNormal1 size={scale(20)} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari program donasi..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.primary + '10' }]}>
          <Filter size={scale(20)} color={colors.primary} variant="Bold" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.id)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === item.id ? colors.primary : colors.surface,
                  borderColor: selectedCategory === item.id ? colors.primary : colors.borderLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === item.id ? '#FFF' : colors.textSecondary },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredPrograms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <SearchNormal1 size={scale(48)} color={colors.borderLight} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Program tidak ditemukan
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: scale(16),
    marginBottom: scale(16),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    height: scale(50),
    borderRadius: scale(12),
    borderWidth: 1,
    gap: scale(12),
  },
  searchInput: {
    flex: 1,
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
    padding: 0,
  },
  filterBtn: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    marginBottom: scale(20),
  },
  categoryChip: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    borderWidth: 1,
    marginRight: scale(10),
  },
  categoryChipText: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.bold,
  },
  listContent: {
    paddingBottom: scale(40),
    gap: scale(16),
  },
  programCard: {
    flexDirection: 'row',
    padding: scale(12),
    borderRadius: scale(16),
    borderWidth: 1,
    gap: scale(16),
  },
  programImageContainer: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  programImage: {
    width: '100%',
    height: '100%',
  },
  urgentBadge: {
    position: 'absolute',
    top: scale(4),
    left: scale(4),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(4),
    gap: scale(2),
  },
  urgentBadgeText: {
    color: '#FFF',
    fontSize: scale(8),
    fontFamily: FontFamily.monasans.bold,
  },
  programDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  programTitle: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(4),
  },
  programDesc: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.regular,
  },
  programProgress: {
    marginTop: scale(12),
  },
  programStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  programCollected: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
  },
  programLabel: {
    fontSize: scale(10),
  },
  programProgressBarBg: {
    height: scale(6),
    borderRadius: scale(3),
    overflow: 'hidden',
  },
  programProgressBarFill: {
    height: '100%',
    borderRadius: scale(3),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(60),
    gap: scale(16),
  },
  emptyText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
  },
});

export default DonationListScreen;
