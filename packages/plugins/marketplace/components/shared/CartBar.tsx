/**
 * CartBar Component
 * Floating cart bar showing item count and total for marketplace
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingCart, ArrowRight2 } from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, getHorizontalPadding, FontFamily } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

interface CartBarProps {
    itemCount: number;
    total: number;
    onPress: () => void;
    onCheckout?: () => void;
    visible?: boolean;
}

const formatPrice = (price: number): string => {
    return `Rp ${price.toLocaleString('id-ID')}`;
};

export const CartBar: React.FC<CartBarProps> = ({
    itemCount,
    total,
    onPress,
    onCheckout,
    visible = true,
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const horizontalPadding = getHorizontalPadding();

    if (!visible || itemCount === 0) {
        return null;
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.primary,
                    marginBottom: insets.bottom + moderateVerticalScale(12),
                    marginHorizontal: horizontalPadding,
                },
            ]}
        >
            <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.8}>
                <View style={styles.leftSection}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <ShoppingCart size={scale(20)} color="#FFFFFF" variant="Bold" />
                        <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.badgeText, { color: colors.primary }]}>
                                {itemCount}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.itemCountText}>
                            {itemCount} {t('marketplace.items')}
                        </Text>
                        <Text style={styles.totalText}>{formatPrice(total)}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.checkoutButton, { backgroundColor: colors.surface }]}
                    onPress={onCheckout || onPress}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.checkoutText, { color: colors.primary }]}>
                        {t('marketplace.viewCart')}
                    </Text>
                    <ArrowRight2 size={scale(16)} color={colors.primary} variant="Linear" />
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: scale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scale(12),
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -scale(4),
        right: -scale(4),
        minWidth: scale(20),
        height: scale(20),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(6),
    },
    badgeText: {
        fontSize: scale(11),
        fontFamily: FontFamily.monasans.bold,
    },
    textContainer: {
        marginLeft: scale(12),
    },
    itemCountText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.regular,
        color: 'rgba(255,255,255,0.8)',
    },
    totalText: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
        color: '#FFFFFF',
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: scale(10),
        borderRadius: scale(10),
        gap: scale(4),
    },
    checkoutText: {
        fontSize: scale(13),
        fontFamily: FontFamily.monasans.semiBold,
    },
});

export default CartBar;
