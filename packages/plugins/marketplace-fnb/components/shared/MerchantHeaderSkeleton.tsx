/**
 * MerchantHeaderSkeleton Component
 * Skeleton loading placeholder for MerchantHeader
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { scale, moderateVerticalScale, getHorizontalPadding } from '@core/config';
import { useTheme } from '@core/theme';

export const MerchantHeaderSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const horizontalPadding = getHorizontalPadding();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      {/* Info Card Skeleton - matches MerchantHeader layout */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        {/* Header Row: Name & Status */}
        <View style={styles.headerRow}>
          <Animated.View
            style={[
              styles.nameSkeleton,
              { backgroundColor: colors.border, opacity: shimmerOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.statusSkeleton,
              { backgroundColor: colors.border, opacity: shimmerOpacity },
            ]}
          />
        </View>

        {/* Description Skeleton */}
        <Animated.View
          style={[
            styles.descriptionSkeleton,
            { backgroundColor: colors.border, opacity: shimmerOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.descriptionSkeleton2,
            { backgroundColor: colors.border, opacity: shimmerOpacity },
          ]}
        />

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Meta Row Skeleton */}
        <View style={styles.metaRow}>
          <Animated.View
            style={[
              styles.metaSkeleton,
              { backgroundColor: colors.border, opacity: shimmerOpacity, width: scale(70) },
            ]}
          />
          <Animated.View
            style={[
              styles.metaSkeleton,
              { backgroundColor: colors.border, opacity: shimmerOpacity, width: scale(60) },
            ]}
          />
          <Animated.View
            style={[
              styles.metaSkeleton,
              { backgroundColor: colors.border, opacity: shimmerOpacity, width: scale(70) },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateVerticalScale(16),
  },
  infoCard: {
    borderRadius: scale(16),
    padding: scale(16),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  nameSkeleton: {
    height: scale(22),
    width: '60%',
    borderRadius: scale(6),
  },
  statusSkeleton: {
    height: scale(24),
    width: scale(50),
    borderRadius: scale(12),
  },
  descriptionSkeleton: {
    height: scale(14),
    width: '100%',
    borderRadius: scale(4),
    marginBottom: scale(6),
  },
  descriptionSkeleton2: {
    height: scale(14),
    width: '70%',
    borderRadius: scale(4),
    marginBottom: scale(16),
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: scale(16),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaSkeleton: {
    height: scale(18),
    borderRadius: scale(4),
  },
});
