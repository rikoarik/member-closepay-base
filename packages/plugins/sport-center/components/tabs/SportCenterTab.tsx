/**
 * SportCenterTab Component
 * Sport Center tab content in HomeScreen - layout khusus untuk tab (beda dari full screen)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SearchNormal, Location } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  useDimensions,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  useSportCenterData,
  FacilityCard,
  FacilityCardSkeleton,
  SportCenterCategoryTabs,
  VenueTerdekatCard,
  type SportCenterFacility,
  type SportCenterCategoryTab,
} from '@plugins/sport-center';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const MOCK_LOCATION = 'Jakarta Selatan';

interface SportCenterTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const SportCenterTab: React.FC<SportCenterTabProps> = ({
  isActive = true,
  isVisible = true,
  scrollEnabled = true,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const horizontalPadding = getHorizontalPadding();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useDimensions();

  const [selectedCategory, setSelectedCategory] = useState<SportCenterCategoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { facilities, loading, refresh, nearbyFacilities } = useSportCenterData(
    selectedCategory,
    isActive || isVisible
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
      // @ts-ignore - plugin route
      navigation.navigate('SportCenterFacilityDetail', { facilityId: facility.id });
    },
    [navigation]
  );

  const handleMyBookingsPress = useCallback(() => {
    // @ts-ignore - plugin route
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

  const renderHeader = useCallback(
    () => (
      <>
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={[styles.locationChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Location size={scale(16)} color={colors.primary} variant="Linear" />
            <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
              {MOCK_LOCATION}
            </Text>
          </TouchableOpacity>
          <View
            style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <SearchNormal size={scale(18)} color={colors.textSecondary} variant="Linear" />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('marketplace.searchPlaceholder') || 'Cari fasilitas...'}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <SportCenterCategoryTabs
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

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

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory === 'all'
              ? t('sportCenter.nearbyFacilities')
              : t(`sportCenter.${selectedCategory}`)}
          </Text>
        </View>
      </>
    ),
    [
      colors,
      searchQuery,
      selectedCategory,
      nearbyFacilities,
      handleFacilityPress,
      handleMyBookingsPress,
      t,
    ]
  );

  if (!isVisible) return null;

  return (
    <View style={[styles.container, { width: screenWidth }]}>
      <View style={[styles.fixedHeader, { paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.tabTitle, { color: colors.text }]}>
          {t('sportCenter.title')}
        </Text>
      </View>
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderFacility}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: insets.bottom + scale(20),
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  fixedHeader: {
    paddingTop: scale(10),
    paddingBottom: moderateVerticalScale(8),
  },
  tabTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('large'),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: moderateVerticalScale(12),
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    borderRadius: 12,
    borderWidth: 1,
    gap: scale(6),
    maxWidth: scale(140),
  },
  locationText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('small'),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    borderRadius: 12,
    borderWidth: 1,
    gap: scale(8),
  },
  searchInput: {
    flex: 1,
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
    paddingVertical: 0,
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
    marginBottom: moderateVerticalScale(20),
  },
  venueTerdekatList: {
    paddingRight: getHorizontalPadding(),
  },
  listContent: {
    paddingTop: moderateVerticalScale(4),
    flexGrow: 1,
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
