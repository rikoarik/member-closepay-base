/**
 * TransactionItemSkeleton Component
 * Skeleton loading placeholder for TransactionItem
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { scale, moderateVerticalScale } from '@core/config';
import { useTheme } from '@core/theme';

export const TransactionItemSkeleton: React.FC = () => {
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
            {/* Icon Container */}
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Animated.View style={[styles.iconSkeleton, { backgroundColor: colors.primary, opacity: shimmerOpacity }]} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <Animated.View style={[styles.titleSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />
                    <Animated.View style={[styles.amountSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />
                </View>

                {/* Description */}
                <Animated.View style={[styles.descriptionSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />

                {/* Date */}
                <Animated.View style={[styles.dateSkeleton, { backgroundColor: colors.border, opacity: shimmerOpacity }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(16),
        borderRadius: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: scale(12),
    },
    iconContainer: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    iconSkeleton: {
        width: scale(24),
        height: scale(24),
        borderRadius: scale(6),
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(6),
    },
    titleSkeleton: {
        height: scale(16),
        width: '60%',
        borderRadius: scale(4),
    },
    amountSkeleton: {
        height: scale(16),
        width: scale(80),
        borderRadius: scale(4),
    },
    descriptionSkeleton: {
        height: scale(14),
        width: '80%',
        borderRadius: scale(4),
        marginBottom: scale(4),
    },
    dateSkeleton: {
        height: scale(12),
        width: scale(100),
        borderRadius: scale(4),
    },
});