/**
 * FnBCartBar Component
 * Floating bottom bar showing cart summary with order button
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ShoppingCart } from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, FontFamily, getHorizontalPadding } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

interface FnBCartBarProps {
    itemCount: number;
    total: number;
    onPress: () => void;
    onCheckout: () => void;
    visible?: boolean;
}

const formatPrice = (price: number): string => {
    return `Rp ${price.toLocaleString('id-ID')}`;
};

export const FnBCartBar: React.FC<FnBCartBarProps> = ({
    itemCount,
    total,
    onPress,
    onCheckout,
    visible = true,
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const translateY = useRef(new Animated.Value(100)).current;
    const horizontalPadding = getHorizontalPadding();

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: visible && itemCount > 0 ? 0 : 100,
            useNativeDriver: true,
            friction: 8,
            tension: 100,
        }).start();
    }, [visible, itemCount, translateY]);

    if (itemCount === 0) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: colors.primary,
                    paddingHorizontal: horizontalPadding,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={styles.content}>
                {/* Left - Cart info (Opens detail sheet) */}
                <TouchableOpacity
                    style={styles.leftContent}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <ShoppingCart size={scale(18)} color={colors.surface} variant="Bold" />
                        <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.badgeText, { color: colors.primary }]}>{itemCount}</Text>
                        </View>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.itemCountText, { color: colors.surface }]}>
                            {itemCount} {t('fnb.items') || 'item'}
                        </Text>
                        <Text style={[styles.totalText, { color: colors.surface }]}>
                            {formatPrice(total)}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Right - Order button (Direct checkout) */}
                <TouchableOpacity
                    style={[styles.orderButton, { backgroundColor: colors.surface }]}
                    onPress={onCheckout}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.orderButtonText, { color: colors.primary }]}>
                        {t('fnb.order') || 'Pesan'}
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: moderateVerticalScale(12),
        paddingBottom: moderateVerticalScale(24),
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -scale(4),
        right: -scale(4),
        minWidth: scale(18),
        height: scale(18),
        borderRadius: scale(9),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(4),
    },
    badgeText: {
        fontSize: scale(10),
        fontFamily: FontFamily.monasans.bold,
    },
    textContainer: {
        flex: 1,
    },
    itemCountText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.regular,
        opacity: 0.9,
    },
    totalText: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
    },
    orderButton: {
        paddingHorizontal: scale(24),
        paddingVertical: scale(12),
        borderRadius: scale(10),
    },
    orderButtonText: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.bold,
    },
});
