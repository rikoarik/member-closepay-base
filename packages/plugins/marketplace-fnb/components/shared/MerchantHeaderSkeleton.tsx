/**
 * MerchantHeaderSkeleton Component
 * Skeleton loading placeholder for MerchantHeader
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { scale, moderateVerticalScale } from '@core/config';
import { useTheme } from '@core/theme';

export const MerchantHeaderSkeleton: React.FC = () => {
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

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            {/* Store Image Skeleton */}
            <Animated.View style={[styles.imageSkeleton, { backgroundColor: colors.primaryLight, opacity: shimmerOpacity }]} />

            {/* Store Info Skeleton */}
            <View style={styles.infoContainer}>
                {/* Store Name Skeleton */}
                <Animated.View style={[styles.nameSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />

                {/* Store Description Skeleton */}
                <Animated.View style={[styles.descriptionSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />

                {/* Store Meta Skeleton */}
                <View style={styles.metaContainer}>
                    <Animated.View style={[styles.metaSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity, width: scale(60) }]} />
                    <Animated.View style={[styles.metaSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity, width: scale(80) }]} />
                    <Animated.View style={[styles.metaSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity, width: scale(100) }]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: scale(16),
        marginBottom: moderateVerticalScale(8),
    },
    imageSkeleton: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(12),
        marginBottom: scale(12),
        alignSelf: 'center',
    },
    infoContainer: {
        alignItems: 'center',
    },
    nameSkeleton: {
        height: scale(20),
        width: '70%',
        borderRadius: scale(4),
        marginBottom: scale(8),
    },
    descriptionSkeleton: {
        height: scale(14),
        width: '90%',
        borderRadius: scale(4),
        marginBottom: scale(12),
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: scale(16),
    },
    metaSkeleton: {
        height: scale(12),
        borderRadius: scale(4),
    },
});