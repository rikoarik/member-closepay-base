/**
 * ProductCardSkeleton Component
 * Shimmer loading untuk ProductCard
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
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  const ShimmerBox = ({ style }: { style: any }) => (
    <View style={[style, { backgroundColor: colors.surfaceSecondary || colors.border, overflow: 'hidden', borderRadius: style.borderRadius || scale(4) }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.surface,
            opacity,
            transform: [{ translateX }],
            width: '50%',
          },
        ]}
      />
    </View>
  );

  return (
    <View style={[styles.container, { width: cardWidth, backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Image Skeleton */}
      <ShimmerBox style={styles.imageSkeleton} />

      {/* Content Skeleton */}
      <View style={styles.content}>
        {/* Name Skeleton - Line 1 */}
        <ShimmerBox style={styles.nameSkeleton1} />
        {/* Name Skeleton - Line 2 */}
        <ShimmerBox style={styles.nameSkeleton2} />

        {/* Price Skeleton */}
        <ShimmerBox style={styles.priceSkeleton} />

        {/* Footer Skeleton */}
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
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
    overflow: 'hidden',
  },
  imageSkeleton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 0,
  },
  content: {
    padding: scale(12),
  },
  nameSkeleton1: {
    width: '90%',
    height: getResponsiveFontSize('small') * 1.2,
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(4),
  },
  nameSkeleton2: {
    width: '70%',
    height: getResponsiveFontSize('small') * 1.2,
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(8),
  },
  priceSkeleton: {
    width: '60%',
    height: getResponsiveFontSize('medium') * 1.2,
    borderRadius: scale(4),
    marginBottom: moderateVerticalScale(4),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: moderateVerticalScale(4),
  },
  ratingSkeleton: {
    width: scale(40),
    height: getResponsiveFontSize('small') * 1.2,
    borderRadius: scale(4),
  },
  soldSkeleton: {
    width: scale(50),
    height: getResponsiveFontSize('small') * 1.2,
    borderRadius: scale(4),
  },
});
