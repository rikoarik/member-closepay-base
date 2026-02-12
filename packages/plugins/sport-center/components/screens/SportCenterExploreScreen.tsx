/**
 * SportCenterScreen Component
 * Discovery/Home layout - Location selector, Search, Categories, Venue Terdekat, Facility list (Ayo style)
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft2,
  SearchNormal,
  Location,
  ArrowDown2,
  Game,
  Element3,
  Calendar,
  People,
  ArrowRight2,
  Drop,
  Box1,
} from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  getMinTouchTarget,
  ScreenHeader,
  SvgLinearGradientView,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useSportCenterData } from '../../hooks';
import {
  FacilityCard,
  FacilityCardSkeleton,
  VenueTerdekatCard,
  SportCenterLocationBottomSheet,
  SportCenterCategoriesBottomSheet,
} from '../shared';
import type { SportCenterFacility } from '../../models';
import type { SportCenterCategoryTab } from '../shared';
import { useTabBar } from '../navigation/TabBarContext';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

const MOCK_LOCATION = 'Setiabudi, Jakarta';

interface SportCenterExploreScreenProps {
  embedded?: boolean;
}

export const SportCenterExploreScreen: React.FC<SportCenterExploreScreenProps> = ({
  embedded = false,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const paddingH = getHorizontalPadding();

  const [selectedCategory, setSelectedCategory] = useState<SportCenterCategoryTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [locationVisible, setLocationVisible] = useState(false);
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(MOCK_LOCATION);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Tab Bar Auto-hide Logic
  const { toggleTabBar } = useTabBar();
  const lastContentOffset = React.useRef(0);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastContentOffset.current;

    if (Math.abs(diff) > 3) {
      if (diff > 0 && currentOffset > 20) {
        // Scrolling down
        toggleTabBar(false);
      } else {
        // Scrolling up
        toggleTabBar(true);
      }
    }
    lastContentOffset.current = currentOffset;
  };

  // Sticky Header Interpolation
  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [scale(80), scale(120)],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [scale(80), scale(120)],
    outputRange: [10, 0],
    extrapolate: 'clamp',
  });

  const categoryForHook = selectedCategory;

  const { facilities, loading, refresh, nearbyFacilities } = useSportCenterData(
    categoryForHook,
    true
  );

  const filteredFacilities = React.useMemo(() => {
    return facilities;
  }, [facilities]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleFacilityPress = useCallback(
    (facility: SportCenterFacility) => {
      // @ts-ignore
      navigation.navigate('SportCenterFacilityDetail', { facilityId: facility.id });
    },
    [navigation]
  );

  const handleMyBookingsPress = useCallback(() => {
    // @ts-ignore
    navigation.navigate('SportCenterMyBookings');
  }, [navigation]);

  const listData = loading ? [] : filteredFacilities;

  const renderFacility = useCallback(
    ({ item }: { item: SportCenterFacility }) => (
      <View style={{ paddingHorizontal: paddingH }}>
        <FacilityCard facility={item} onPress={handleFacilityPress} />
      </View>
    ),
    [handleFacilityPress, paddingH]
  );

  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.skeletonList}>
          {[1, 2, 3].map((i) => (
            <FacilityCardSkeleton key={i} />
          ))}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('sportCenter.comingSoon')}
        </Text>
      </View>
    );
  }, [loading, colors.textSecondary, t]);

  const renderBanners = () => (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerItemLarge}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=800&auto=format&fit=crop',
          }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <SvgLinearGradientView
          colors={['rgba(56, 224, 123, 0.9)', 'transparent']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <View style={styles.bannerContentLarge}>
          <Text style={styles.bannerLabel}>{t('sportCenter.newSeason')}</Text>
          <Text style={styles.bannerTitleLarge}>
            {t('sportCenter.promoTitle').replace(/\\n/g, '\n')}
          </Text>
          <TouchableOpacity style={styles.bannerButtonSmall}>
            <Text style={styles.bannerButtonTextSmall}>{t('sportCenter.claimVoucher')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderVenueTerdekat = useCallback(
    () => (
      <View style={styles.venueTerdekatSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.venueTerdekatList}
        >
          {nearbyFacilities.map((facility) => (
            <VenueTerdekatCard
              key={facility.id}
              facility={facility}
              onPress={handleFacilityPress}
            />
          ))}
        </ScrollView>
      </View>
    ),
    [nearbyFacilities, handleFacilityPress]
  );

  const Header = useCallback(
    () => (
      <View style={styles.content}>
        <View style={{ paddingHorizontal: paddingH }}>
          <View style={styles.topHeader}>
            <View style={styles.locationInfo}>
              <View style={[styles.locationIconBox, { backgroundColor: colors.primary + '15' }]}>
                <Location size={scale(18)} color={colors.primary} variant="Bold" />
              </View>
              <View style={styles.locationTextContent}>
                <Text style={[styles.locationLabelSmall, { color: colors.textSecondary }]}>
                  {t('sportCenter.locationLabel')}
                </Text>
                <TouchableOpacity
                  style={styles.locationSelectorRow}
                  activeOpacity={0.7}
                  onPress={() => setLocationVisible(true)}
                >
                  <Text
                    style={[styles.locationValueSmall, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {currentLocation}
                  </Text>
                  <ArrowDown2 size={scale(14)} color={colors.textSecondary} variant="Linear" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.searchWrap}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SportCenterSearch' as never)}
          >
            <View style={[styles.searchInputRow, { backgroundColor: colors.surface }]}>
              <SearchNormal size={scale(20)} color={colors.textSecondary} />
              <Text style={[styles.searchPlaceholderText, { color: colors.textSecondary }]}>
                {t('sportCenter.searchPlaceholder')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {renderBanners()}

        <View style={{ paddingHorizontal: paddingH }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitleNew, { color: colors.text }]}>
              {t('sportCenter.categoriesTitle')}
            </Text>
            <TouchableOpacity onPress={() => setCategoriesVisible(true)}>
              <Text style={[styles.viewAllBtn, { color: colors.primary }]}>
                {t('common.viewAll')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            <TouchableOpacity
              style={styles.catItem}
              activeOpacity={0.7}
              onPress={() =>
                // @ts-ignore
                navigation.navigate('SportCenterSearchResults', { query: t('sportCenter.futsal') })
              }
            >
              <View style={[styles.catIconBox, { backgroundColor: colors.primary + '15' }]}>
                <Game size={scale(24)} color={colors.primary} variant="Bold" />
              </View>
              <Text style={[styles.catLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                {t('sportCenter.futsal')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.catItem}
              activeOpacity={0.7}
              onPress={() =>
                // @ts-ignore
                navigation.navigate('SportCenterSearchResults', {
                  query: t('sportCenter.basketball'),
                })
              }
            >
              <View style={[styles.catIconBox, { backgroundColor: '#FFF7ED' }]}>
                <Element3 size={scale(24)} color="#F97316" variant="Bold" />
              </View>
              <Text style={[styles.catLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                {t('sportCenter.basketball')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.catItem}
              activeOpacity={0.7}
              onPress={() =>
                // @ts-ignore
                navigation.navigate('SportCenterSearchResults', { query: t('sportCenter.tenis') })
              }
            >
              <View style={[styles.catIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Box1 size={scale(24)} color="#3B82F6" variant="Bold" />
              </View>
              <Text style={[styles.catLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                {t('sportCenter.tenis')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.catItem}
              activeOpacity={0.7}
              onPress={() =>
                // @ts-ignore
                navigation.navigate('SportCenterSearchResults', {
                  query: t('sportCenter.badminton'),
                })
              }
            >
              <View style={[styles.catIconBox, { backgroundColor: '#FAF5FF' }]}>
                <Game size={scale(24)} color="#A855F7" variant="Bold" />
              </View>
              <Text style={[styles.catLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                {t('sportCenter.badminton')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: paddingH }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitleNew, { color: colors.text }]}>
              {t('sportCenter.venueTerdekat')}
            </Text>
            <TouchableOpacity style={styles.seeMoreBtn}>
              <Text style={[styles.viewAllBtn, { color: colors.primary }]}>
                {t('sportCenter.seeMore')}
              </Text>
              <ArrowRight2 size={scale(14)} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {renderVenueTerdekat()}

          <View style={[styles.sectionHeaderRow, { marginTop: moderateVerticalScale(24) }]}>
            <Text style={[styles.sectionTitleNew, { color: colors.text }]}>
              {t('sportCenter.recommendedForYou')}
            </Text>
          </View>
        </View>
      </View>
    ),
    [
      colors,
      t,
      paddingH,
      currentLocation,
      setLocationVisible,
      navigation,
      renderBanners, // renderBanners is now memoized
      setCategoriesVisible,
      renderVenueTerdekat, // renderVenueTerdekat is already memoized
    ]
  );

  return (
    <>
      <SafeAreaView
        edges={['top']}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={{ zIndex: 1 }}>
          <ScreenHeader
            title={t('sportCenter.title')}
            rightComponent={
              <Animated.View
                style={[
                  styles.stickyIcon,
                  {
                    opacity: stickyHeaderOpacity,
                    transform: [{ translateY: stickyHeaderTranslateY }],
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('SportCenterSearch' as never)}
                  style={styles.stickyIconBtn}
                >
                  <SearchNormal size={scale(24)} color={colors.text} variant="Linear" />
                </TouchableOpacity>
              </Animated.View>
            }
          />
        </View>

        <Animated.FlatList
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
            listener: handleScroll, // Attached listener for tab bar auto-hide
          })}
          scrollEventThrottle={16}
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderFacility}
          ListHeaderComponent={Header}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: moderateVerticalScale(50) },
          ]} // Increased padding bottom for scrolling space
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      <SportCenterLocationBottomSheet
        visible={locationVisible}
        onClose={() => setLocationVisible(false)}
        currentLocation={currentLocation}
        onSelectLocation={(loc) => setCurrentLocation(loc)}
      />

      <SportCenterCategoriesBottomSheet
        visible={categoriesVisible}
        onClose={() => setCategoriesVisible(false)}
        selectedCategoryId={selectedCategory}
        onSelectCategory={(catId: any) => {
          setSelectedCategory(catId);
          // Navigate to search results with category name
          // Note: we need to map id to label/query or pass logic to extract it
          let query = '';
          if (catId === 'futsal') query = t('sportCenter.futsal');
          else if (catId === 'basketball') query = t('sportCenter.basketball');
          else if (catId === 'tenis') query = t('sportCenter.tenis');
          else if (catId === 'badminton') query = t('sportCenter.badminton');
          else if (catId === 'gym') query = t('sportCenter.gym');
          else if (catId === 'pool') query = t('sportCenter.pool');
          else if (catId === 'volleyball') query = t('sportCenter.volleyball');
          else if (catId === 'yoga') query = t('sportCenter.yoga');

          if (query) {
            // @ts-ignore
            navigation.navigate('SportCenterSearchResults', { query });
          }
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingTop: moderateVerticalScale(8),
  },
  topHeader: {
    paddingVertical: moderateVerticalScale(12),
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(14),
  },
  locationIconBox: {
    width: scale(44),
    height: scale(44),
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextContent: {
    flex: 1,
  },
  locationLabelSmall: {
    fontSize: scale(10),
    fontFamily: fontSemiBold,
    letterSpacing: 0.5,
    marginBottom: scale(2),
  },
  locationSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  locationValueSmall: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },
  searchWrap: {
    marginVertical: moderateVerticalScale(16),
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: 16,
    gap: scale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchPlaceholderText: {
    flex: 1,
    fontSize: scale(14),
    fontFamily: fontRegular,
  },
  bannerContainer: {
    paddingHorizontal: getHorizontalPadding(),
    marginBottom: moderateVerticalScale(24),
  },
  bannerItemLarge: {
    height: scale(140),
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerContentLarge: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  bannerLabel: {
    color: '#FFF',
    fontSize: scale(10),
    fontFamily: fontSemiBold,
    letterSpacing: 2,
    marginBottom: scale(4),
  },
  bannerTitleLarge: {
    color: '#FFF',
    fontSize: scale(18),
    fontFamily: fontSemiBold,
    lineHeight: scale(24),
    marginBottom: scale(12),
  },
  bannerButtonSmall: {
    backgroundColor: '#FFF',
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonTextSmall: {
    color: '#38e07b',
    fontSize: scale(12),
    fontFamily: fontSemiBold,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  sectionTitleNew: {
    fontSize: scale(18),
    fontFamily: fontSemiBold,
  },
  viewAllBtn: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: scale(12),
    marginBottom: moderateVerticalScale(24),
  },
  catItem: {
    width: (SCREEN_WIDTH - getHorizontalPadding() * 2 - scale(12) * 3) / 4,
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(12),
  },
  catIconBox: {
    width: scale(56),
    height: scale(56),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catLabel: {
    fontSize: scale(11),
    fontFamily: fontSemiBold,
  },
  venueTerdekatSection: {
    marginBottom: moderateVerticalScale(24),
  },
  venueTerdekatList: {
    paddingRight: getHorizontalPadding(),
  },
  listContent: {
    paddingBottom: moderateVerticalScale(100),
  },
  skeletonList: {
    paddingTop: moderateVerticalScale(8),
  },
  emptyContainer: {
    paddingVertical: moderateVerticalScale(32),
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
  },
  stickyIcon: {
    right: getHorizontalPadding(),
    zIndex: 20,
  },
  stickyIconBtn: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'flex-end', // Align icon to right
  },
});
