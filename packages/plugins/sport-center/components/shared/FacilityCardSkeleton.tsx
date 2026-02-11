/**
 * FacilityCardSkeleton Component
 * Shimmer loading untuk FacilityCard
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@core/theme';
import { scale, moderateVerticalScale, getResponsiveFontSize } from '@core/config';

export const FacilityCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

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

  const ShimmerBox = ({ style }: { style: object }) => (
    <Animated.View
      style={[
        style,
        {
          backgroundColor: colors.surfaceSecondary || colors.border,
          opacity,
          borderRadius: scale(4),
        },
      ]}
    />
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <ShimmerBox style={styles.image} />
      <View style={styles.content}>
        <ShimmerBox style={styles.name} />
        <ShimmerBox style={styles.location} />
        <View style={styles.footer}>
          <ShimmerBox style={styles.rating} />
          <ShimmerBox style={styles.price} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
  },
  image: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    marginRight: scale(12),
  },
  content: {
    flex: 1,
  },
  name: {
    width: '70%',
    height: getResponsiveFontSize('medium') * 1.2,
    marginBottom: scale(8),
  },
  location: {
    width: '50%',
    height: getResponsiveFontSize('small') * 1.2,
    marginBottom: scale(8),
  },
  footer: {
    flexDirection: 'row',
    gap: scale(12),
  },
  rating: {
    width: scale(40),
    height: getResponsiveFontSize('small') * 1.2,
  },
  price: {
    width: scale(60),
    height: getResponsiveFontSize('small') * 1.2,
  },
});
