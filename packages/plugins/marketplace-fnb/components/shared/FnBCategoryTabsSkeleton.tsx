/**
 * FnBCategoryTabsSkeleton Component
 * Skeleton loading placeholder for FnBCategoryTabs
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { scale, moderateVerticalScale } from '@core/config';
import { useTheme } from '@core/theme';

export const FnBCategoryTabsSkeleton: React.FC = () => {
    const { colors } = useTheme();
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

    // Create skeleton tabs (5 categories)
    const skeletonTabs = Array.from({ length: 5 }, (_, index) => (
        <Animated.View
            key={index}
            style={[
                styles.tabSkeleton,
                {
                    backgroundColor: colors.border,
                    opacity: shimmerOpacity,
                    width: index % 2 === 0 ? scale(80) : scale(100), // Vary widths
                }
            ]}
        />
    ));

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {skeletonTabs}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: moderateVerticalScale(12),
    },
    scrollContent: {
        paddingHorizontal: scale(4),
        gap: scale(8),
    },
    tabSkeleton: {
        height: scale(36),
        borderRadius: scale(20),
    },
});