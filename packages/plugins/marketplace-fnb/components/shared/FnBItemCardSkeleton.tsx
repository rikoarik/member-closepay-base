/**
 * FnBItemCardSkeleton Component
 * Skeleton loading placeholder for FnBItemCard
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { scale, moderateVerticalScale } from '@core/config';
import { useTheme } from '@core/theme';

export const FnBItemCardSkeleton: React.FC = () => {
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
            {/* Image Skeleton */}
            <View style={styles.imageContainer}>
                <Animated.View style={[styles.imageSkeleton, { backgroundColor: colors.primaryLight, opacity: shimmerOpacity }]} />
            </View>

            {/* Info Skeleton */}
            <View style={styles.infoContainer}>
                {/* Name Skeleton */}
                <Animated.View style={[styles.nameSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />

                {/* Price Skeleton */}
                <Animated.View style={[styles.priceSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />

                {/* Meta Skeleton */}
                <View style={styles.metaContainer}>
                    <Animated.View style={[styles.metaSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />
                    <Animated.View style={[styles.metaSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />
                </View>

                {/* Quantity Controls Skeleton */}
                <View style={styles.quantityContainer}>
                    <Animated.View style={[styles.quantityButtonSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />
                    <Animated.View style={[styles.quantityTextSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />
                    <Animated.View style={[styles.quantityButtonSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: scale(12),
        borderRadius: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: scale(12),
    },
    imageContainer: {
        marginBottom: scale(8),
    },
    imageSkeleton: {
        width: '100%',
        height: scale(120),
        borderRadius: scale(8),
    },
    infoContainer: {
        flex: 1,
    },
    nameSkeleton: {
        height: scale(16),
        width: '80%',
        borderRadius: scale(4),
        marginBottom: scale(6),
    },
    priceSkeleton: {
        height: scale(14),
        width: '40%',
        borderRadius: scale(4),
        marginBottom: scale(8),
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(12),
        gap: scale(12),
    },
    metaSkeleton: {
        height: scale(12),
        width: scale(60),
        borderRadius: scale(4),
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: scale(8),
    },
    quantityButtonSkeleton: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
    },
    quantityTextSkeleton: {
        width: scale(40),
        height: scale(20),
        borderRadius: scale(4),
    },
});