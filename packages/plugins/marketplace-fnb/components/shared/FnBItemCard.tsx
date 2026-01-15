/**
 * FnBItemCard Component
 * Displays a food/beverage item in a card format with quantity controls
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Add, Minus } from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, FontFamily } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import type { FnBItem } from '../../models';

interface FnBItemCardProps {
    item: FnBItem;
    quantity?: number;
    onPress: (item: FnBItem) => void;
    onAdd?: (item: FnBItem) => void;
    onRemove?: (item: FnBItem) => void;
    onQuickAdd?: (item: FnBItem) => void;
}

const formatPrice = (price: number): string => {
    return `Rp ${price.toLocaleString('id-ID')}`;
};

export const FnBItemCard: React.FC<FnBItemCardProps> = ({
    item,
    quantity = 0,
    onPress,
    onAdd,
    onRemove,
    onQuickAdd,
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const handleAdd = () => {
        if (!item.isAvailable) return;

        // If item has variants, open detail sheet
        if (item.variants && item.variants.length > 0 && quantity === 0) {
            onPress(item);
        } else if (onAdd) {
            onAdd(item);
        } else if (onQuickAdd) {
            onQuickAdd(item);
        }
    };

    const handleRemove = () => {
        if (onRemove && quantity > 0) {
            onRemove(item);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.surface }]}
            onPress={() => onPress(item)}
            activeOpacity={0.8}
        >
            {/* Image */}
            <View style={styles.imageContainer}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: colors.primaryLight }]}>
                        <Text style={styles.placeholderEmoji}>🍽️</Text>
                    </View>
                )}

                {/* Sold out badge */}
                {!item.isAvailable && (
                    <View style={[styles.soldOutBadge, { backgroundColor: colors.error }]}>
                        <Text style={[styles.soldOutText, { color: colors.surface }]}>
                            {t('fnb.soldOut') || 'Habis'}
                        </Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
                <Text
                    style={[styles.name, { color: colors.text }]}
                    numberOfLines={2}
                >
                    {item.name}
                </Text>

                <Text style={[styles.price, { color: colors.primary }]}>
                    {formatPrice(item.price)}
                </Text>

                {/* Rating and sold */}
                {(item.rating || item.sold) && (
                    <View style={styles.metaContainer}>
                        {item.rating && (
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                ⭐ {item.rating.toFixed(1)}
                            </Text>
                        )}
                        {item.sold && (
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                • {item.sold} terjual
                            </Text>
                        )}
                    </View>
                )}

                {/* Quantity Controls */}
                {item.isAvailable && (
                    <View style={styles.quantityControlContainer}>
                        {quantity > 0 ? (
                            // Show minus, quantity, plus when item is in cart
                            <View style={styles.quantityControls}>
                                <TouchableOpacity
                                    style={[styles.quantityButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                                    onPress={handleRemove}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Minus size={scale(16)} color={colors.text} variant="Linear" />
                                </TouchableOpacity>

                                <Text style={[styles.quantityText, { color: colors.text }]}>
                                    {quantity}
                                </Text>

                                <TouchableOpacity
                                    style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                                    onPress={handleAdd}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Add size={scale(16)} color={colors.surface} variant="Linear" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // Show add button when item not in cart
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: colors.primary }]}
                                onPress={handleAdd}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Add size={scale(16)} color={colors.surface} variant="Linear" />
                                <Text style={[styles.addButtonText, { color: colors.surface }]}>
                                    Tambah
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%',
        borderRadius: scale(12),
        overflow: 'hidden',
        marginBottom: moderateVerticalScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderEmoji: {
        fontSize: scale(40),
    },
    soldOutBadge: {
        position: 'absolute',
        top: scale(8),
        left: scale(8),
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(4),
    },
    soldOutText: {
        fontSize: scale(10),
        fontFamily: FontFamily.monasans.semiBold,
    },
    infoContainer: {
        padding: scale(10),
    },
    name: {
        fontSize: scale(13),
        fontFamily: FontFamily.monasans.semiBold,
        lineHeight: scale(18),
        marginBottom: scale(4),
    },
    price: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: scale(4),
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: scale(8),
    },
    metaText: {
        fontSize: scale(11),
        fontFamily: FontFamily.monasans.regular,
        marginRight: scale(4),
    },
    quantityControlContainer: {
        marginTop: scale(4),
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButton: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(8),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    quantityText: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
        marginHorizontal: scale(16),
        minWidth: scale(24),
        textAlign: 'center',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scale(8),
        paddingHorizontal: scale(12),
        borderRadius: scale(8),
    },
    addButtonText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.semiBold,
        marginLeft: scale(4),
    },
});
