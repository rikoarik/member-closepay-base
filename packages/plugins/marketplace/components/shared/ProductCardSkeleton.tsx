/**
 * ProductCardSkeleton Component
 * Shimmer loading untuk ProductCard - matches ProductCard layout exactly
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@core/theme';
import {
  scale,
  moderateVerticalScale,
  getResponsiveFontSize,
  getHorizontalPadding,
  useDimensions,
} from '@core/config';

export const ProductCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const { width: screenWidth } = useDimensions();
  const horizontalPadding = getHorizontalPadding();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const cardWidth = (screenWidth - horizontalPadding * 2 - scale(12)) / 2;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  const ShimmerBox = ({ style }: { style: any }) => (
    <Animated.View
      style={[
        style,
        {
          backgroundColor: colors.surfaceSecondary || colors.border,
          opacity,
          borderRadius: style.borderRadius ?? scale(4),
        },
      ]}
    />
  );

  return (
    <View
      style={[
        styles.container,
        {
          width: cardWidth,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Image Skeleton - matches ProductCard aspectRatio: 2 */}
      <ShimmerBox style={styles.imageSkeleton} />

      {/* Content Skeleton */}
      <View style={styles.content}>
        {/* Name Skeleton - single line like ProductCard */}
        <ShimmerBox style={styles.nameSkeleton} />

        {/* Price Skeleton */}
        <ShimmerBox style={styles.priceSkeleton} />

        {/* Footer Skeleton - rating and sold */}
        <View style={styles.footer}>
          <ShimmerBox style={styles.ratingSkeleton} />
          <ShimmerBox style={styles.soldSkeleton} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(10), // Match ProductCard
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
    overflow: 'hidden',
    minHeight: moderateVerticalScale(190), // Match ProductCard
    elevation: 2, // Match ProductCard
  },
  imageSkeleton: {
    width: '100%',
    aspectRatio: 2, // Match ProductCard image aspectRatio
    borderRadius: 0,
  },
  content: {
    flex: 1,
    padding: scale(10), // Match ProductCard content padding
    justifyContent: 'space-between', // Match ProductCard
  },
  nameSkeleton: {
    width: '85%',
    height: getResponsiveFontSize('small') * 1.2,
    borderRadius: scale(4),
  },
  priceSkeleton: {
    width: '55%',
    height: getResponsiveFontSize('medium') * 1.2,
    borderRadius: scale(4),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Match ProductCard
    justifyContent: 'space-between', // Match ProductCard
    flexWrap: 'wrap',
  },
  ratingSkeleton: {
    width: scale(45),
    height: getResponsiveFontSize('xxxsmall') * 1.2,
    borderRadius: scale(4),
  },
  soldSkeleton: {
    width: scale(55),
    height: getResponsiveFontSize('xxxsmall') * 1.2,
    borderRadius: scale(4),
  },
});