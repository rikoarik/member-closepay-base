import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, TextInput, TouchableOpacity, Text, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SearchNormal, Filter } from 'iconsax-react-nativejs';
import { NewsItem, type News } from '../news/NewsItem';
import { NewsItemSkeleton } from '../news/NewsItemSkeleton';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { CloseCircle } from 'iconsax-react-nativejs';
import { NewsFilterBottomSheet, type NewsFilterState } from './NewsFilterBottomSheet';
import { UI_CONSTANTS } from '@core/config/constants';
import { useNewsData } from '../hooks/useNewsData';

interface NewsTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  onRefreshRequested?: (refreshFn: () => void) => void;
  scrollEnabled?: boolean;
  searchState?: ReturnType<typeof useNewsState>;
  onScroll?: (event: any) => void;
}

const PAGE_SIZE = UI_CONSTANTS.DEFAULT_PAGE_SIZE;
const BATCH_SIZE = 10;

// Exportable Hook for lifting state
export const useNewsState = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState<NewsFilterState>({
    dateRange: { startDate: null, endDate: null },
    sortBy: null,
  });

  const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    searchDebounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    filterVisible,
    setFilterVisible,
    filter,
    setFilter,
  };
};

export const NewsSearchHeader: React.FC<{
  state: ReturnType<typeof useNewsState>;
}> = ({ state }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const horizontalPadding = getHorizontalPadding();

  const {
    searchQuery,
    setSearchQuery,
    setFilterVisible,
    filter,
  } = state;

  return (
    <View style={[styles.searchContainer, { paddingHorizontal: horizontalPadding }]}>
      <View style={styles.searchRow}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SearchNormal size={scale(20)} color={colors.textSecondary} variant="Linear" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('news.searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <CloseCircle size={scale(20)} color={colors.textSecondary} variant="Linear" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: filter.sortBy || filter.dateRange.startDate || filter.dateRange.endDate
                ? colors.primary
                : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setFilterVisible(true)}
        >
          <Filter
            size={scale(20)}
            color={
              filter.sortBy || filter.dateRange.startDate || filter.dateRange.endDate
                ? colors.surface
                : colors.text
            }
            variant="Linear"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const NewsTab: React.FC<NewsTabProps> = ({
  isActive = true,
  isVisible = true,
  onRefreshRequested,
  scrollEnabled = false,
  searchState,
  onScroll,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const horizontalPadding = getHorizontalPadding();

  // Internal state if NOT provided via props
  const internalState = useNewsState();
  const state = searchState || internalState;

  const {
    searchQuery,
    debouncedSearchQuery,
    filterVisible,
    setFilterVisible,
    filter,
    setFilter,
  } = state;

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadedBatches, setLoadedBatches] = useState<number>(1);
  const scrollPositionRef = useRef(0);
  const flatListRef = useRef<FlatList>(null);

  // Reset pagination when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filter]);

  const allNewsData = useNewsData(loadedBatches * 20, isActive, isVisible);

  const processedNews = useMemo(() => {
    if (!isActive && !isVisible) return [];

    let result = [...allNewsData];

    if (debouncedSearchQuery) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (filter.dateRange.startDate || filter.dateRange.endDate) {
      result = result.filter(item => {
        const itemDate = (item as any).createdAt;
        if (!itemDate) return true;
        if (filter.dateRange.startDate && itemDate < filter.dateRange.startDate) return false;
        if (filter.dateRange.endDate) {
          const endDate = new Date(filter.dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (itemDate > endDate) return false;
        }
        return true;
      });
    }

    if (filter.sortBy) {
      result.sort((a, b) => {
        switch (filter.sortBy) {
          case 'newest':
            return ((b as any).createdAt?.getTime() || 0) - ((a as any).createdAt?.getTime() || 0);
          case 'oldest':
            return ((a as any).createdAt?.getTime() || 0) - ((b as any).createdAt?.getTime() || 0);
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [allNewsData, debouncedSearchQuery, filter, isActive, isVisible]);

  const paginatedNews = useMemo(() => {
    if (!isActive && !isVisible) return [];
    const endIndex = currentPage * PAGE_SIZE;
    return processedNews.slice(0, endIndex);
  }, [processedNews, currentPage, isActive, isVisible]);

  const hasMore = paginatedNews.length < processedNews.length;

  useEffect(() => {
    if (refreshing || isInitialLoad) {
      const timer = setTimeout(() => {
        setShowShimmer(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowShimmer(false);
        setIsInitialLoad(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [refreshing, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !refreshing && isActive && !isInitialLoad && paginatedNews.length > 0) {
      setIsLoadingMore(true);

      const neededBatches = Math.ceil((currentPage + 1) * PAGE_SIZE / BATCH_SIZE);
      if (neededBatches > loadedBatches) {
        setLoadedBatches(neededBatches);
      }

      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, hasMore, refreshing, isActive, isInitialLoad, paginatedNews.length, currentPage, loadedBatches]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setLoadedBatches(1);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (onRefreshRequested) {
      onRefreshRequested(onRefresh);
    }
  }, [onRefreshRequested, onRefresh]);

  const handleFilterApply = useCallback((newFilter: NewsFilterState) => {
    setFilter(newFilter);
    setCurrentPage(1);
  }, [setFilter]);

  const renderItem = useCallback(({ item }: { item: News }) => (
    <NewsItem
      news={item}
      onPress={(news) => {
        // @ts-ignore
        navigation.navigate('NewsDetail', { news });
      }}
    />
  ), [navigation]);

  const renderFooter = () => {
    if (isLoadingMore && hasMore) {
      return (
        <View style={styles.footerShimmer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <NewsItemSkeleton key={`skeleton-footer-${index}`} />
          ))}
        </View>
      );
    }
    return null;
  };

  if (!isActive && !isVisible) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NewsSearchHeader state={state} />

      {showShimmer && (refreshing || isInitialLoad) && paginatedNews.length === 0 ? (
        <View
          style={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + moderateVerticalScale(16),
              paddingHorizontal: horizontalPadding,
              paddingTop: moderateVerticalScale(16),
            },
          ]}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <NewsItemSkeleton key={`skeleton-${index}`} />
          ))}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={showShimmer && (refreshing || isInitialLoad) ? [] : paginatedNews}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          disableVirtualization={false}
          onScroll={(event) => {
            scrollPositionRef.current = event.nativeEvent.contentOffset.y;
            if (onScroll) {
              onScroll(event);
            }
          }}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + moderateVerticalScale(16),
              paddingHorizontal: horizontalPadding,
              paddingTop: moderateVerticalScale(16),
            },
          ]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEnabled={scrollEnabled}
          bounces={true}
          directionalLockEnabled={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onScrollBeginDrag={(e) => {
            // Prevent parent scroll interference di iOS
            if (Platform.OS === 'ios') {
              e.stopPropagation();
            }
          }}
          refreshControl={
            scrollEnabled ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            ) : undefined
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            showShimmer && (refreshing || isInitialLoad) ? (
              <View style={styles.emptyContainer}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <NewsItemSkeleton key={`skeleton-loading-${index}`} />
                ))}
              </View>
            ) : paginatedNews.length === 0 && !refreshing && !isLoadingMore && !isInitialLoad ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('news.noNewsFound') || 'Tidak ada berita ditemukan.'}
                </Text>
              </View>
            ) : null
          }
          initialNumToRender={3}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={100}
          windowSize={2}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => {
            const itemHeight = scale(56) + scale(24) + moderateVerticalScale(8);
            return {
              length: itemHeight,
              offset: itemHeight * index,
              index,
            };
          }}
        />
      )}

      <NewsFilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
        initialFilter={filter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  searchContainer: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(8),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    height: scale(44),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  filterButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(8),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerShimmer: {
    paddingTop: moderateVerticalScale(8),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontFamily: FontFamily.monasans.regular,
    fontSize: getResponsiveFontSize('medium'),
    paddingVertical: 0,
  },
  clearButton: {
    padding: scale(4),
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    paddingTop: moderateVerticalScale(16),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  placeholder: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

