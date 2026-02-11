/**
 * BerandaNewsInfo Component
 * Komponen untuk menampilkan info berita horizontal di tab beranda
 * Menggunakan data yang sama dengan NewsTab
 */
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NewsInfo, type NewsItem } from '@core/config';
import { useNewsData } from '../hooks/useNewsData';
import type { News } from '../news/NewsItem';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
  moderateVerticalScale,
  scale,
  useRefreshRegistry,
} from '@core/config';
import { ArrowLeft2 } from 'iconsax-react-nativejs';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@core/navigation';

// Extend RootStackParamList untuk app-specific routes
type AppRootStackParamList = RootStackParamList & {
  News: undefined;
  NewsDetail: { news: News };
};

type NavigationProp = NativeStackNavigationProp<AppRootStackParamList>;

export interface BerandaNewsInfoProps {
  /**
   * Show NewsInfo component (default: true)
   */
  showNewsInfo?: boolean;
  /**
   * Callback when news item is pressed
   * Jika tidak ada, akan navigate ke NewsDetailScreen
   */
  onNewsPress?: (item: NewsItem) => void;
  /**
   * Callback when "Lihat Semua" button is pressed
   * Akan navigasi ke NewsScreen (halaman berdiri sendiri)
   * Jika tidak ada, akan menggunakan navigation default
   */
  onViewAllPress?: () => void;
  /**
   * Jumlah news yang ditampilkan (default: 5)
   */
  limit?: number;
  /**
   * Callback untuk refresh data
   * Akan dipanggil saat user melakukan pull-to-refresh
   */
  onRefresh?: () => void | Promise<void>;
  /**
   * @deprecated Use RefreshRegistryContext - register via useRefreshRegistry
   * Callback untuk expose refresh function ke parent (legacy)
   */
  onRefreshRequested?: (refreshFn: () => void) => void;
}

export const BerandaNewsInfo: React.FC<BerandaNewsInfoProps> = React.memo(({
  showNewsInfo = true,
  onNewsPress,
  onViewAllPress,
  limit = 5,
  onRefresh,
  onRefreshRequested,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const horizontalPadding = getHorizontalPadding();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Key untuk force re-render data
  
  // Default handler untuk navigate ke NewsScreen
  const handleViewAll = () => {
    if (onViewAllPress) {
      onViewAllPress();
    } else {
      // Default: navigate ke NewsScreen
      // Menggunakan CommonActions untuk navigate yang lebih reliable
      try {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'News',
            params: undefined,
          })
        );
      } catch (error) {
        console.error('Navigation dispatch error:', error);
        // Fallback: coba dengan navigate langsung (pattern sama dengan HomeScreen)
        try {
          (navigation as any).navigate('News' as never);
        } catch (fallbackError) {
          console.error('Fallback navigation error:', fallbackError);
        }
      }
    }
  };

  // Default handler untuk navigate ke NewsDetailScreen
  const handleNewsPress = (item: NewsItem) => {
    if (onNewsPress) {
      onNewsPress(item);
    } else {
      // Default: navigate ke NewsDetailScreen
      // Convert NewsItem ke News format (sama dengan format di NewsTab)
      // Format date: "25 April 2024. 09:00"
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const day = item.date.getDate();
      const month = monthNames[item.date.getMonth()];
      const year = item.date.getFullYear();
      const hours = String(item.date.getHours()).padStart(2, '0');
      const minutes = String(item.date.getMinutes()).padStart(2, '0');
      const formattedDate = `${day} ${month} ${year}. ${hours}:${minutes}`;

      const news: News = {
        id: item.id,
        title: item.title,
        description: item.description,
        date: formattedDate,
        imageUrl: item.imageUrl,
      };

      try {
        // Menggunakan CommonActions untuk navigate yang lebih reliable
        navigation.dispatch(
          CommonActions.navigate({
            name: 'NewsDetail',
            params: { news },
          })
        );
      } catch (error) {
        console.error('Navigation dispatch error:', error);
        // Fallback: coba dengan navigate langsung (pattern sama dengan HomeScreen)
        try {
          (navigation as any).navigate('NewsDetail' as never, { news });
        } catch (fallbackError) {
          console.error('Fallback navigation error:', fallbackError);
        }
      }
    }
  };
  
  // Handler untuk refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Trigger refresh dengan mengubah key untuk force re-render
      setRefreshKey(prev => prev + 1);
      
      // Jika ada custom refresh handler, panggil juga
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      // Simulate refresh delay
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }
  }, [onRefresh]);

  const refreshRegistry = useRefreshRegistry();

  React.useEffect(() => {
    if (onRefreshRequested) {
      onRefreshRequested(handleRefresh);
    }
  }, [onRefreshRequested, handleRefresh]);

  React.useEffect(() => {
    if (!refreshRegistry) return;
    const unregister = refreshRegistry.registerRefreshCallback('news-info', handleRefresh);
    return unregister;
  }, [refreshRegistry, handleRefresh]);

  // Menggunakan data yang sama dengan NewsTab
  // refreshKey digunakan untuk force re-render saat refresh
  // Pass refreshKey ke useNewsData untuk trigger refresh
  const newsData = useNewsData(limit, true, true, refreshKey);

  // Convert News ke NewsItem format
  // refreshKey ditambahkan sebagai dependency untuk force re-render saat refresh
  const displayNewsItems: NewsItem[] = useMemo(() => {
    return newsData.map((news) => {
      // Parse date string ke Date object
      // Format: "25 April 2024. 09:00"
      const dateMatch = news.date.match(/(\d+)\s+(\w+)\s+(\d+)\.\s+(\d+):(\d+)/);
      let date = new Date();
      
      if (dateMatch) {
        const day = parseInt(dateMatch[1], 10);
        const monthName = dateMatch[2];
        const year = parseInt(dateMatch[3], 10);
        const hours = parseInt(dateMatch[4], 10);
        const minutes = parseInt(dateMatch[5], 10);
        
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const month = monthNames.indexOf(monthName);
        
        if (month >= 0) {
          date = new Date(year, month, day, hours, minutes);
        }
      }

      return {
        id: news.id,
        title: news.title,
        description: news.description,
        imageUrl: news.imageUrl,
        date: date,
      };
    });
  }, [newsData, refreshKey]); // refreshKey sebagai dependency untuk force re-render

  // Jika showNewsInfo false, jangan render apapun
  if (!showNewsInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header dengan title dan tombol Lihat Semua */}
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.newsInfo') || 'Info Berita'}
        </Text>
        <TouchableOpacity
          onPress={handleViewAll}
          style={styles.viewAllButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            {t('home.viewAll')}
          </Text>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ArrowLeft2 
              size={16} 
              color={colors.primary} 
              variant="Outline"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* NewsInfo Component */}
      <NewsInfo
        items={displayNewsItems}
        onNewsPress={handleNewsPress}
        style={{ paddingHorizontal: 0 }}
        showTitle={false}
        imageHeight={moderateVerticalScale(120)}
      />
    </View>
  );
});

BerandaNewsInfo.displayName = 'BerandaNewsInfo';

const styles = StyleSheet.create({
  container: {
    marginTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  viewAllText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
});

