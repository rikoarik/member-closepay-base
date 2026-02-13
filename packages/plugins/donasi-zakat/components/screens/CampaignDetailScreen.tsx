import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft2,
  Heart,
  Share,
  Clock,
  Verify,
  Location as LocationIcon,
  ArrowDown2,
  User,
  Send2,
} from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

const { width } = Dimensions.get('window');

export const CampaignDetailScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const horizontalPadding = getHorizontalPadding();

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const HERO_HEIGHT = width * 0.9;

  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [0, -HERO_HEIGHT * 0.5],
    extrapolate: 'clamp',
  });

  const heroScale = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0],
    outputRange: [2, 1],
    extrapolate: 'clamp',
  });

  const donors = [
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
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Parallax Hero Background */}
      <Animated.View
        style={[
          styles.heroContainer,
          {
            backgroundColor: colors.surfaceSecondary,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: HERO_HEIGHT,
            transform: [{ translateY: heroTranslateY }, { scale: heroScale }],
            zIndex: 0,
          },
        ]}
      >
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtCMaehoV4nUbULbWSsWCUXik_e9WvyXZM9w0tgvX-rvs6k5nwln87JIHwEYO1Z1RHMs8ilw_H2UZdwDOFGu-ecb8JP8m3ibdP64BiOmDdMdmVQyyW1KSHHRx3-JKyj5jbVnDRVzfx-iDsGyCCi-7-uFzOvfFgxlenNRL1om4Ttztc3w4mgJ5w048pPO1Wzy4Cl29ePLxX7Cnc8Afp3RraDPA2Hyu5OVbb8HMVtxMGqpJE8cuQT2Ydp7Hto2W3vL5Wr9PNxuFZ96A',
          }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />
      </Animated.View>

      {/* Navbar (Fixed/Sticky) */}
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
          <ArrowLeft2 size={scale(24)} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navButton}>
            <Heart size={scale(24)} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Send2 size={scale(24)} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* Spacer for Hero */}
        <View style={{ height: HERO_HEIGHT, backgroundColor: 'transparent' }} />

        <View style={{ backgroundColor: colors.background, minHeight: '100%' }}>
          {/* Content Card */}
          <View
            style={[
              styles.contentCard,
              { backgroundColor: colors.surface, marginHorizontal: horizontalPadding },
            ]}
          >
            <View style={styles.badgeRow}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>
                  {t('donasiZakat.education')}
                </Text>
              </View>
              <View style={styles.timerBadge}>
                <Clock size={scale(14)} color={colors.textSecondary} />
                <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                  {t('donasiZakat.daysRemaining', { days: 12 })}
                </Text>
              </View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              Bantu Renovasi Sekolah Dasar di Pelosok Desa
            </Text>

            <View style={styles.providerRow}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFtPsd8UxUvNfmtde3YJ--RoBUY8ptLXxN5WfBhn-bspWpoJuZ6NZoLdHwK1mFnAm4nbmUN7ltD3DmSib6L8e3JX-_vtp6ZF3TJqiAa_D9LG4LFGS6H_xk4eZmwIWaiVQPsNgypCl6y8tYA5fJZfdgBwbubg5-SRgRwZdVL2v883qM_BDFKT9GE1oicVltTMRl2XzFU-JBNb6PBNrWA-Y6yDPRcAbnvJiJSaaHA1zDb3q_oxKlqOEm5iWoKWXu5Sa2pwRBvDHwydY',
                }}
                style={styles.providerAvatar}
              />
              <Text style={[styles.providerName, { color: colors.textSecondary }]}>
                Yayasan Peduli Anak
              </Text>
              <Verify size={scale(14)} color={colors.info} variant="Bold" />
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <View>
                  <Text style={[styles.progressLabel, { color: colors.textTertiary }]}>
                    {t('donasiZakat.collected')}
                  </Text>
                  <Text style={[styles.collectedText, { color: colors.primary }]}>
                    Rp 150.000.000
                  </Text>
                </View>
                <View style={styles.targetCol}>
                  <Text style={[styles.progressLabel, { color: colors.textTertiary }]}>
                    {t('donasiZakat.target')}
                  </Text>
                  <Text style={[styles.targetText, { color: colors.text }]}>Rp 200.000.000</Text>
                </View>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colors.borderLight }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: '75%', backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <Text style={[styles.percentageText, { color: colors.primary }]}>75% tercapai</Text>
            </View>
          </View>

          {/* Stories Section */}
          <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('donasiZakat.campaignStory')}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Sekolah Dasar di Desa Suka Makmur sudah berdiri sejak tahun 1980 dan belum pernah
              mengalami renovasi besar. Kondisi atap yang bocor sangat mengganggu kegiatan belajar
              mengajar, terutama saat musim hujan.{'\n\n'}
              Anak-anak terpaksa belajar di teras warga karena takut atap kelas rubuh. Mari bantu
              mereka mendapatkan tempat belajar yang layak dan aman. Donasi Anda akan digunakan
              untuk pembelian material bangunan dan biaya tukang.
            </Text>
            <TouchableOpacity style={styles.readMore}>
              <Text style={[styles.readMoreText, { color: colors.primary }]}>
                {t('donasiZakat.readMore')}
              </Text>
              <ArrowDown2 size={scale(14)} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Donors List */}
          <View
            style={[
              styles.section,
              {
                paddingHorizontal: horizontalPadding,
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('donasiZakat.donors', { count: '1,240' })}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  (navigation as any).navigate('DonorList', {
                    campaignId: '123',
                    campaignTitle: 'Bantu Renovasi Sekolah Dasar di Pelosok Desa',
                  })
                }
              >
                <Text style={[styles.viewAllText, { color: colors.primary }]}>
                  {t('common.viewAll')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.donorList}>
              {donors.map((donor) => (
                <View key={donor.id} style={styles.donorItem}>
                  <View style={styles.donorAvatarContainer}>
                    {donor.avatar ? (
                      <Image source={{ uri: donor.avatar }} style={styles.donorAvatar} />
                    ) : (
                      <View
                        style={[
                          styles.initialsAvatar,
                          {
                            backgroundColor: donor.initials ? colors.infoLight : colors.errorLight,
                          },
                        ]}
                      >
                        {donor.initials ? (
                          <Text style={[styles.initialsText, { color: colors.info }]}>
                            {donor.initials}
                          </Text>
                        ) : (
                          <User size={scale(20)} color={colors.primary} />
                        )}
                      </View>
                    )}
                  </View>
                  <View style={styles.donorInfo}>
                    <View style={styles.donorHeader}>
                      <View>
                        <Text style={[styles.donorName, { color: colors.text }]}>{donor.name}</Text>
                        <Text style={[styles.donorNote, { color: colors.textTertiary }]}>
                          {donor.note}
                        </Text>
                      </View>
                      <Text style={[styles.donorTime, { color: colors.textTertiary }]}>
                        {donor.time}
                      </Text>
                    </View>
                    <Text style={[styles.donorAmount, { color: colors.text }]}>{donor.amount}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Prayer Section */}
          <View
            style={[
              styles.section,
              {
                paddingHorizontal: horizontalPadding,
                paddingBottom: moderateVerticalScale(100),
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('donasiZakat.recentPrayers')}
            </Text>
            <View
              style={[
                styles.prayerCard,
                { backgroundColor: colors.surface, borderColor: colors.primary + '20' },
              ]}
            >
              <Text style={[styles.prayerText, { color: colors.textSecondary }]}>
                "Semoga pembangunan lancar dan menjadi amal jariyah bagi kita semua. Aamiin."
              </Text>
              <Text style={[styles.prayerAuthor, { color: colors.primary }]}>- Siti Aminah</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderLight,
            paddingBottom: insets.bottom + scale(12),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.donateButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
          ]}
          onPress={() =>
            (navigation as any).navigate('DonationInput', {
              campaign: {
                title: 'Bantu Renovasi Sekolah Dasar di Pelosok Desa',
                org: 'Yayasan Peduli Anak',
                image:
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBtCMaehoV4nUbULbWSsWCUXik_e9WvyXZM9w0tgvX-rvs6k5nwln87JIHwEYO1Z1RHMs8ilw_H2UZdwDOFGu-ecb8JP8m3ibdP64BiOmDdMdmVQyyW1KSHHRx3-JKyj5jbVnDRVzfx-iDsGyCCi-7-uFzOvfFgxlenNRL1om4Ttztc3w4mgJ5w048pPO1Wzy4Cl29ePLxX7Cnc8Afp3RraDPA2Hyu5OVbb8HMVtxMGqpJE8cuQT2Ydp7Hto2W3vL5Wr9PNxuFZ96A',
              },
            })
          }
        >
          <Text style={styles.donateButtonText}>{t('donasiZakat.donateNow')}</Text>
          <Heart size={scale(20)} color="#FFF" variant="Bold" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: moderateVerticalScale(20),
  },
  heroContainer: {
    width: '100%',
    height: width * 0.9,
  },
  heroImage: {
    height: '100%',
    // borderBottomLeftRadius: scale(32), // Remove radius from image as overlay handles it?
    // Actually the radius should probably be on the container or overlay if we want the "card" look.
    // Original code had radius on image and overlay.
    // Let's keep it but ensure container doesn't clip if we want that.
    borderBottomLeftRadius: scale(32),
    borderBottomRightRadius: scale(32),
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottomLeftRadius: scale(32),
    borderBottomRightRadius: scale(32),
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(144, 144, 144, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navActions: {
    flexDirection: 'row',
    gap: scale(12),
  },
  contentCard: {
    marginTop: scale(-60),
    borderRadius: scale(24),
    padding: scale(20),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginBottom: scale(12),
  },
  categoryBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(20),
  },
  categoryBadgeText: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  timerText: {
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.medium,
  },
  title: {
    fontSize: scale(20),
    fontFamily: FontFamily.monasans.bold,
    lineHeight: scale(28),
    marginBottom: scale(16),
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(24),
  },
  providerAvatar: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
  },
  providerName: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
  },
  progressSection: {
    gap: scale(8),
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: scale(2),
  },
  collectedText: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.bold,
  },
  targetCol: {
    alignItems: 'flex-end',
  },
  targetText: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.semiBold,
  },
  progressBarBg: {
    height: scale(10),
    borderRadius: scale(5),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: scale(5),
  },
  percentageText: {
    textAlign: 'right',
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.bold,
  },
  section: {
    marginTop: moderateVerticalScale(32),
  },
  sectionTitle: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(12),
  },
  description: {
    fontSize: scale(14),
    lineHeight: scale(22),
    fontFamily: FontFamily.monasans.regular,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(8),
    gap: scale(4),
  },
  readMoreText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.semiBold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  viewAllText: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.semiBold,
  },
  donorList: {
    gap: scale(20),
  },
  donorItem: {
    flexDirection: 'row',
    gap: scale(12),
  },
  donorAvatarContainer: {
    width: scale(40),
    height: scale(40),
  },
  donorAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: scale(20),
  },
  initialsAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  donorInfo: {
    flex: 1,
  },
  donorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scale(2),
  },
  donorName: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  donorNote: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.regular,
  },
  donorTime: {
    fontSize: scale(11),
  },
  donorAmount: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  prayerCard: {
    padding: scale(16),
    borderRadius: scale(16),
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  prayerText: {
    fontSize: scale(14),
    fontStyle: 'italic',
    lineHeight: scale(20),
    fontFamily: FontFamily.monasans.regular,
  },
  prayerAuthor: {
    marginTop: scale(8),
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.semiBold,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: scale(16),
    borderTopWidth: 1,
  },
  donateButton: {
    height: scale(56),
    borderRadius: scale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  donateButtonText: {
    color: '#FFF',
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
  },
});

export default CampaignDetailScreen;
