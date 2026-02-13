import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft2,
  Clock,
  Wallet,
  Refresh,
  Heart,
  Card,
  Flash,
  Filter,
  Add,
} from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, getHorizontalPadding, FontFamily, ScreenHeader } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

const { width } = Dimensions.get('window');

export const DonationHubScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const categories = [
    { id: 'zakat-maal', name: t('donasiZakat.zakatMaal'), icon: Wallet, color: colors.primary },
    {
      id: 'zakat-fitrah',
      name: t('donasiZakat.zakatFitrah'),
      icon: Refresh,
      color: colors.primary,
    },
    { id: 'sedekah', name: t('donasiZakat.sedekah'), icon: Heart, color: colors.primary },
  ];

  const ongoingCampaigns = [
    {
      id: '1',
      title: 'Beasiswa Yatim Dhuafa',
      description: 'Bantu pendidikan 100 anak yatim agar terus bersekolah.',
      collected: 125400000,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD8ArbmmzhIfLvGPJi0fjUBwntV29SShuZPqtIbe3G0m-zyAS27XXh3a8Pg_HOw3NYA84bgIxHw4TpSEeCMXX5Udj4MQ153UOah7YGFyYrxmICMp_U8KSNNxGbkn5ra9e8WA87Ri-y7myI-4P8yNdEExwixZNU96Q9db4murBz6_X9EP5kiykZNo6iX9saeh0QICFIZIjjG_fghlJh2cpEeBNn1L3GWRKNowMAbLkqAfVljrNTe1R2MTnbUYq6DOlBNWplDFz8IKko',
      progress: 0.85,
      provider: 'BAZNAS',
    },
    {
      id: '2',
      title: 'Bangun Masjid Desa Pelosok',
      description: 'Wakaf tunai untuk penyelesaian pembangunan masjid Al-Ikhlas.',
      collected: 45000000,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD6mjpv1YlPfMjDrHHPkazSmkzQu9jsaq5zSXVdrWzbEhmDrtCtl86U5JDg5se42Cr0iGQcRyf1B09qh6eXr4MDi7iPH26GMZFVQDvOf3Y-HNPhcqyceEVnXMH1ETPLuxBpZ8wQSOYvQMpa2uYoznhVlZJCwisZe6gOtepv9rXH3s0SR56b2TfzhXBnxTemp1Sk4a1kHvR7HcXLFD5eNI94Kh9THr9Osu8dphFfKllXliT1dn3nrwluA6Rg-qtGihva1eMfWWhBy6s',
      progress: 0.4,
      provider: '',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('donasiZakat.title')}
        rightComponent={
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('DonationHistory')}
            style={styles.headerButton}
          >
            <Clock size={scale(24)} color={colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Urgent Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionSubtitle, { color: colors.primary }]}>
            {t('donasiZakat.urgent')}
          </Text>
          <TouchableOpacity>
            <Text style={[styles.viewAll, { color: colors.textTertiary }]}>
              {t('common.viewAll')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.heroCard, { shadowColor: colors.success }]}
          onPress={() => (navigation as any).navigate('CampaignDetail', { id: 'urgent-1' })}
        >
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLxjHyBSV2oMAqBPeQKxGXhrgDaONA18BF7IoejqLS8CpI9Ogx3W2EL3Lika9C6JezqxCkflvzi-fKSd7lbhxj2rY82vEIWmGZhnLZ_aETnSTC33979fw4Xl3eHxbPciaNXOUr6qbc-bncIZPR3eD2PextcSz4R8_d0mWSX4JM17xBVUd-Nw-ZMuOuvei8QFY3UWI3wHOFx5DrVpgN9ARTbGfmWGJIrgBdRLwQDrIS4Rp8W9g7EQ3KC_nPR1W9Uhl_QCgHiv0RTC0',
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <View style={[styles.urgentBadge, { backgroundColor: colors.errorContainer }]}>
              <Flash size={scale(12)} color="#FFF" variant="Bold" />
              <Text style={styles.urgentBadgeText}>{t('donasiZakat.emergency')}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle}>Bantu Korban Banjir Demak</Text>
              <Text
                style={[styles.heroDescription, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                Ribuan warga mengungsi membutuhkan bantuan pangan dan obat.
              </Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBarBackground, { backgroundColor: '#ffffff33' }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: '65%', backgroundColor: colors.success },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>65%</Text>
              </View>
              <View style={styles.heroStats}>
                <Text style={[styles.statText, { color: colors.textTertiary }]}>
                  {t('donasiZakat.collected')}: <Text style={styles.statHighlight}>Rp 50jt</Text>
                </Text>
                <Text style={[styles.statText, { color: colors.textTertiary }]}>
                  {t('donasiZakat.target')}: Rp 75jt
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
              <View style={[styles.categoryIconContainer, { backgroundColor: cat.color + '15' }]}>
                <cat.icon size={scale(32)} color={cat.color} variant="Bold" />
              </View>
              <Text style={[styles.categoryName, { color: colors.textSecondary }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calculator Promo */}
        <TouchableOpacity
          style={[styles.calculatorCard, { backgroundColor: colors.text }]}
          onPress={() => (navigation as any).navigate('ZakatCalculator')}
        >
          <View style={styles.calculatorInfo}>
            <View style={styles.calculatorHeader}>
              <View
                style={[styles.calculatorIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              >
                <Wallet size={scale(14)} color="#FFF" />
              </View>
              <Text style={styles.calculatorTitle}>{t('donasiZakat.zakatCalculator')}</Text>
            </View>
            <Text style={[styles.calculatorDesc, { color: colors.textTertiary }]}>
              {t('donasiZakat.zakatCalcDesc')}
            </Text>
            <View style={[styles.calculateBtn, { backgroundColor: colors.success }]}>
              <Text style={[styles.calculateBtnText, { color: colors.text }]}>
                {t('donasiZakat.calculateNow')}
              </Text>
            </View>
          </View>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4Xj_E4_k9fjgZaIaxJHMR0EYJwHtBTRL4mH1uiOhl8-ospyk4p41tYK-9usNhfWoSAuwQTYQJLebYzR4eOJiwkLnmzNA56GvVM5O0pNfnxP7xCbrS0R-lHFxB05bDAQ-dERiFkBIXa6fVc4KMLB6Url_YxhnLb94piaRh4o62Dc44eevueS5CYHN2Q10INkRpdd8wDagZtFOvNfGE_bmtV2cL20XvSjvOOJ923IJ8Mj8TEm5qkPmJko3bBFig7oLKaayfXGCV9Vg',
            }}
            style={styles.calculatorImage}
          />
        </TouchableOpacity>

        {/* Selected Programs */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('donasiZakat.selectedPrograms')}
          </Text>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.surfaceSecondary }]}
          >
            <Filter size={scale(20)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.programList}>
          {ongoingCampaigns.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={[
                styles.programCard,
                { backgroundColor: colors.surface, borderColor: colors.borderLight },
              ]}
              onPress={() => (navigation as any).navigate('CampaignDetail', { id: program.id })}
            >
              <View style={styles.programImageContainer}>
                <Image source={{ uri: program.image }} style={styles.programImage} />
                {program.provider ? (
                  <View
                    style={[styles.providerBadge, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
                  >
                    <Flash size={scale(10)} color={colors.errorContainer} variant="Bold" />
                    <Text style={[styles.providerText, { color: colors.textSecondary }]}>
                      {program.provider}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.programDetails}>
                <View>
                  <Text style={[styles.programTitle, { color: colors.text }]} numberOfLines={1}>
                    {program.title}
                  </Text>
                  <Text
                    style={[styles.programDesc, { color: colors.textTertiary }]}
                    numberOfLines={2}
                  >
                    {program.description}
                  </Text>
                </View>
                <View style={styles.programProgress}>
                  <View style={styles.programStatRow}>
                    <Text style={[styles.programCollected, { color: colors.primary }]}>
                      Rp {program.collected.toLocaleString('id-ID')}
                    </Text>
                    <Text style={[styles.programLabel, { color: colors.textTertiary }]}>
                      {t('donasiZakat.collected')}
                    </Text>
                  </View>
                  <View
                    style={[styles.programProgressBarBg, { backgroundColor: colors.borderLight }]}
                  >
                    <View
                      style={[
                        styles.programProgressBarFill,
                        { width: `${program.progress * 100}%`, backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.viewMorePrograms, { borderColor: colors.primary + '33' }]}>
          <Text style={[styles.viewMoreText, { color: colors.primary }]}>
            {t('donasiZakat.viewMorePrograms')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.success, shadowColor: colors.success }]}
      >
        <Add size={scale(32)} color={colors.text} variant="Outline" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: moderateVerticalScale(12),
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.bold,
  },
  scrollContent: {
    paddingHorizontal: getHorizontalPadding(),
    paddingBottom: moderateVerticalScale(40),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: moderateVerticalScale(24),
    marginBottom: moderateVerticalScale(12),
  },
  sectionSubtitle: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 1.2,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.bold,
  },
  viewAll: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.semiBold,
  },
  heroCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: scale(16),
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: scale(20),
    justifyContent: 'space-between',
  },
  urgentBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(20),
    gap: scale(4),
  },
  urgentBadgeText: {
    color: '#FFF',
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
  },
  heroInfo: {
    marginTop: 'auto',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: scale(20),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(4),
  },
  heroDescription: {
    fontSize: scale(12),
    marginBottom: scale(12),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(8),
  },
  progressBarBackground: {
    flex: 1,
    height: scale(8),
    borderRadius: scale(4),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: scale(4),
  },
  progressText: {
    color: '#FFF',
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.medium,
  },
  statHighlight: {
    color: '#FFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: moderateVerticalScale(24),
  },
  categoryItem: {
    width: '23%',
    alignItems: 'center',
    gap: scale(8),
  },
  categoryIconContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.semiBold,
    textAlign: 'center',
  },
  calculatorCard: {
    marginTop: moderateVerticalScale(32),
    borderRadius: scale(24),
    padding: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  calculatorInfo: {
    flex: 1,
    zIndex: 1,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(8),
  },
  calculatorIconWrap: {
    padding: scale(4),
    borderRadius: scale(6),
  },
  calculatorTitle: {
    color: '#FFF',
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  calculatorDesc: {
    fontSize: scale(12),
    marginBottom: scale(16),
    lineHeight: scale(18),
  },
  calculateBtn: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: scale(8),
    alignSelf: 'flex-start',
  },
  calculateBtnText: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
  },
  calculatorImage: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(12),
    opacity: 0.8,
  },
  filterButton: {
    padding: scale(4),
    borderRadius: scale(20),
  },
  programList: {
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
  providerBadge: {
    position: 'absolute',
    top: scale(4),
    right: scale(4),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(4),
    gap: scale(2),
  },
  providerText: {
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
  viewMorePrograms: {
    marginTop: moderateVerticalScale(24),
    width: '100%',
    paddingVertical: scale(12),
    borderWidth: 1,
    borderRadius: scale(12),
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.semiBold,
  },
  fab: {
    position: 'absolute',
    bottom: scale(34),
    right: scale(24),
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default DonationHubScreen;
