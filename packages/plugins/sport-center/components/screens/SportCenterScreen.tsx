/**
 * SportCenterScreen Component
 * Discovery/Home layout - Location selector, Search, Categories, Venue Terdekat, Facility list (Ayo style)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2, SearchNormal, Location } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  getMinTouchTarget,
  ScreenHeader,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useSportCenterData } from '../../hooks';
import {
  FacilityCard,
  FacilityCardSkeleton,
  SportCenterCategoryTabs,
  VenueTerdekatCard,
} from '../shared';
import type { SportCenterFacility } from '../../models';
import type { SportCenterCategoryTab } from '../shared';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

const MOCK_LOCATION = 'Jakarta Selatan';

interface SportCenterScreenProps {
  embedded?: boolean;
}

export const SportCenterScreen: React.FC<SportCenterScreenProps> = ({ embedded = false }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const paddingH = getHorizontalPadding();

  const [selectedCategory, setSelectedCategory] = useState<SportCenterCategoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const categoryForHook = selectedCategory;
  const { facilities, loading, refresh, nearbyFacilities } = useSportCenterData(
    categoryForHook,
    true
  );

  const filteredFacilities = React.useMemo(() => {
    if (!searchQuery.trim()) return facilities;
    const q = searchQuery.toLowerCase().trim();
    return facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
    );
  }, [facilities, searchQuery]);

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
      <FacilityCard facility={item} onPress={handleFacilityPress} />
    ),
    [handleFacilityPress]
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

  const renderVenueTerdekat = useCallback(() => (
    <View style={styles.venueTerdekatSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('sportCenter.venueTerdekat')}
        </Text>
        <TouchableOpacity onPress={handleMyBookingsPress}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            {t('sportCenter.myBookings')}
          </Text>
        </TouchableOpacity>
      </View>
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
  ), [
    colors.text,
    colors.primary,
    nearbyFacilities,
    handleFacilityPress,
    handleMyBookingsPress,
    t,
  ]);

  const renderHeader = () => (
    <>
     
      <View style={[styles.content, { paddingHorizontal: paddingH }]}>
        <TouchableOpacity
          style={[styles.locationSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Location size={scale(18)} color={colors.primary} variant="Linear" />
          <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
            {MOCK_LOCATION}
          </Text>
        </TouchableOpacity>

        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SearchNormal size={scale(20)} color={colors.textSecondary} variant="Linear" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('marketplace.searchPlaceholder') || 'Cari fasilitas...'}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <SportCenterCategoryTabs
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {embedded && (
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('sportCenter.title')}
          </Text>
        )}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('sportCenter.subtitle')}
        </Text>

        {renderVenueTerdekat()}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory === 'all'
              ? t('sportCenter.nearbyFacilities')
              : t(`sportCenter.${selectedCategory}`)}
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('sportCenter.title')} />
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderFacility}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, { paddingBottom: moderateVerticalScale(32) }]}
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
    gap: scale(12),
  },
  backButton: { 
    minWidth: getMinTouchTarget(),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'center',
   },
  title: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('large'),
  },
  content: {
    paddingTop: moderateVerticalScale(8),
    paddingBottom: moderateVerticalScale(16),
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
    gap: scale(8),
  },
  locationText: {
    flex: 1,
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
    gap: scale(8),
  },
  searchInput: {
    flex: 1,
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
    paddingVertical: 0,
  },
  subtitle: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('small'),
    marginBottom: moderateVerticalScale(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  sectionTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
  },
  seeAll: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
  },
  venueTerdekatSection: {
    marginBottom: moderateVerticalScale(24),
  },
  venueTerdekatList: {
    paddingRight: getHorizontalPadding(),
  },
  listContent: {
    paddingHorizontal: getHorizontalPadding(),
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
});
