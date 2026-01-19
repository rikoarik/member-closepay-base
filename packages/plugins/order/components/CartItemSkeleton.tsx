/**
 * CartItemSkeleton Component
 * Skeleton loading placeholder for cart items
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { scale, moderateVerticalScale } from '@core/config';
import { useTheme } from '@core/theme';

export const CartItemSkeleton: React.FC = () => {
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
        <View
            style={[
                styles.item,
                {
                    borderBottomColor: colors.border,
                },
            ]}
        >
            <Animated.View style={[styles.nameSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />
            <Animated.View style={[styles.quantitySkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />
            <Animated.View style={[styles.priceSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateVerticalScale(12),
        borderBottomWidth: 1,
    },
    nameSkeleton: {
        flex: 1,
        height: scale(16),
        borderRadius: scale(4),
    },
    quantitySkeleton: {
        width: scale(40),
        height: scale(14),
        borderRadius: scale(4),
        marginHorizontal: scale(8),
    },
    priceSkeleton: {
        width: scale(80),
        height: scale(16),
        borderRadius: scale(4),
    },
});