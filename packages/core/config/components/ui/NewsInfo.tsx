/**
 * NewsInfo Component
 * Horizontal scrollable news cards component
 * Reusable component untuk menampilkan info berita dengan horizontal scroll
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
} from '../../utils/responsive';
import { FontFamily } from '../../utils/fonts';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: Date;
  url?: string;
}

export interface NewsInfoProps {
  /**
   * Array of news items to display
   */
  items: NewsItem[];
  /**
   * Title text (default: "Info Berita")
   */
  title?: string;
  /**
   * Callback when news item is pressed
   */
  onNewsPress?: (item: NewsItem) => void;
  /**
   * Custom container style
   */
  style?: ViewStyle;
  /**
   * Show title (default: true)
   */
  showTitle?: boolean;
  /**
   * Card width (default: auto based on screen)
   */
  cardWidth?: number;
  /**
   * Image height (default: 160)
   */
  imageHeight?: number;
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x200/CCCCCC/FFFFFF?text=News';

const formatNewsDate = (date: Date, t: (key: string) => string): string => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const monthNames = [
    t('common.months.january'),
    t('common.months.february'),
    t('common.months.march'),
    t('common.months.april'),
    t('common.months.may'),
    t('common.months.june'),
    t('common.months.july'),
    t('common.months.august'),
    t('common.months.september'),
    t('common.months.october'),
    t('common.months.november'),
    t('common.months.december'),
  ];

  const monthName = monthNames[month] || 'Unknown';
  return `${day} ${monthName} ${year}, ${hours}.${minutes}`;
};

export const NewsInfo: React.FC<NewsInfoProps> = React.memo(({
  items,
  title,
  onNewsPress,
  style,
  showTitle = true,
  cardWidth,
  imageHeight,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const horizontalPadding = getHorizontalPadding();
  
  // Calculate card width based on screen size
  const calculatedCardWidth = cardWidth || (scale(280));

  const displayTitle = title || t('home.newsInfo');

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {showTitle && (
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          {displayTitle}
        </Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingLeft: horizontalPadding,
            paddingRight: horizontalPadding,
          },
        ]}
        style={styles.scrollView}
        decelerationRate="fast"
        snapToInterval={calculatedCardWidth + scale(12)}
        snapToAlignment="start"
        bounces={false}
        nestedScrollEnabled={true}
        scrollEnabled={true}
        directionalLockEnabled={false}
        onScrollBeginDrag={(e) => {
          // Prevent parent scroll when scrolling horizontally
          e.stopPropagation();
        }}
      >
        {items.map((item, index) => (
          <NewsCard
            key={item.id || index}
            item={item}
            width={calculatedCardWidth}
            imageHeight={imageHeight}
            colors={colors}
            onPress={onNewsPress}
            formatDate={(date) => formatNewsDate(date, t)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

NewsInfo.displayName = 'NewsInfo';

interface NewsCardProps {
  item: NewsItem;
  width: number;
  imageHeight?: number;
  colors: any;
  onPress?: (item: NewsItem) => void;
  formatDate: (date: Date) => string;
}

const NewsCard: React.FC<NewsCardProps> = React.memo(({
  item,
  width,
  imageHeight,
  colors,
  onPress,
  formatDate,
}) => {
  const [imageError, setImageError] = useState(false);

  // Default image height atau custom dari prop
  const cardImageHeight = imageHeight !== undefined 
    ? imageHeight 
    : moderateVerticalScale(160);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          marginRight: scale(12),
        },
      ]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: imageError ? PLACEHOLDER_IMAGE : (item.imageUrl || PLACEHOLDER_IMAGE) }}
        style={[styles.cardImage, { height: cardImageHeight }]}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />
      <View style={styles.cardContent}>
        <Text
          style={[styles.cardTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.cardDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
          {formatDate(item.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

NewsCard.displayName = 'NewsCard';

const styles = StyleSheet.create({
  container: {
    marginTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(16),
  },
  title: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(12),
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: moderateVerticalScale(8),
  },
  card: {
    borderRadius: scale(12),
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: moderateScale(12),
  },
  cardTitle: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(6),
    lineHeight: moderateScale(20),
  },
  cardDescription: {
    fontSize: getResponsiveFontSize('xsmall'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(8),
    lineHeight: moderateScale(18),
  },
  cardDate: {
    fontSize: getResponsiveFontSize('xsmall'),
    fontFamily: FontFamily.monasans.regular,
  },
});

