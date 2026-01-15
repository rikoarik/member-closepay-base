/**
 * FnBItemDetailSheet Component
 * Bottom sheet for item details with variant/addon selection
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    Modal,
    Pressable,
} from 'react-native';
import { CloseCircle, Add, Minus } from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, FontFamily, getHorizontalPadding } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import type { FnBItem, FnBVariant, FnBAddon } from '../../models';

interface FnBItemDetailSheetProps {
    item: FnBItem | null;
    visible: boolean;
    initialQuantity?: number;
    initialVariant?: FnBVariant;
    initialAddons?: FnBAddon[];
    initialNotes?: string;
    onClose: () => void;
    onAddToCart: (
        item: FnBItem,
        quantity: number,
        variant?: FnBVariant,
        addons?: FnBAddon[],
        notes?: string
    ) => void;
}

const formatPrice = (price: number): string => {
    return `Rp ${price.toLocaleString('id-ID')}`;
};

export const FnBItemDetailSheet: React.FC<FnBItemDetailSheetProps> = ({
    item,
    visible,
    initialQuantity = 0,
    initialVariant,
    initialAddons = [],
    initialNotes = '',
    onClose,
    onAddToCart,
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const horizontalPadding = getHorizontalPadding();

    // Determine if editing existing cart item
    const isEditing = initialQuantity > 0;

    const [quantity, setQuantity] = useState(isEditing ? initialQuantity : 1);
    const [selectedVariant, setSelectedVariant] = useState<FnBVariant | undefined>(initialVariant);
    const [selectedAddons, setSelectedAddons] = useState<FnBAddon[]>(initialAddons);
    const [notes, setNotes] = useState(initialNotes);

    // Reset state when item changes or sheet opens
    React.useEffect(() => {
        if (item && visible) {
            setQuantity(initialQuantity > 0 ? initialQuantity : 1);
            // If editing, use initial props, otherwise default to first variant if available
            if (isEditing) {
                setSelectedVariant(initialVariant);
                setSelectedAddons(initialAddons);
                setNotes(initialNotes);
            } else {
                setSelectedVariant(item.variants?.[0]);
                setSelectedAddons([]);
                setNotes('');
            }
        }
    }, [item, visible, initialQuantity, initialVariant, initialAddons, initialNotes, isEditing]);

    const toggleAddon = useCallback((addon: FnBAddon) => {
        setSelectedAddons((prev) => {
            const exists = prev.find((a) => a.id === addon.id);
            if (exists) {
                return prev.filter((a) => a.id !== addon.id);
            }
            return [...prev, addon];
        });
    }, []);

    const totalPrice = useMemo(() => {
        if (!item) return 0;
        let price = item.price;
        if (selectedVariant) {
            price += selectedVariant.price;
        }
        if (selectedAddons.length > 0) {
            price += selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
        }
        return price * quantity;
    }, [item, selectedVariant, selectedAddons, quantity]);

    const handleAddToCart = useCallback(() => {
        if (!item) return;
        onAddToCart(item, quantity, selectedVariant, selectedAddons, notes || undefined);
        onClose();
    }, [item, quantity, selectedVariant, selectedAddons, notes, onAddToCart, onClose]);

    if (!item) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => { }}>
                    {/* Drag handle */}
                    <View style={styles.handleContainer}>
                        <View style={[styles.handle, { backgroundColor: colors.border }]} />
                    </View>

                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <CloseCircle size={scale(28)} color={colors.textSecondary} variant="Bold" />
                    </TouchableOpacity>

                    {/* Scrollable content */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        bounces={true}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Image */}
                        {item.imageUrl && (
                            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                        )}

                        <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>
                            {/* Availability Badge */}
                            {!item.isAvailable && (
                                <View style={[styles.unavailableBadge, { backgroundColor: colors.error }]}>
                                    <Text style={[styles.unavailableBadgeText, { color: colors.surface }]}>
                                        Stok Habis
                                    </Text>
                                </View>
                            )}

                            {/* Name and price */}
                            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                            <Text style={[styles.price, { color: colors.primary }]}>
                                {formatPrice(item.price)}
                            </Text>

                            {/* Meta info row */}
                            <View style={styles.metaRow}>
                                {item.rating !== undefined && (
                                    <View style={styles.metaItem}>
                                        <Text style={styles.starIcon}>⭐</Text>
                                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                            {item.rating.toFixed(1)}
                                        </Text>
                                    </View>
                                )}
                                {item.sold !== undefined && (
                                    <View style={styles.metaItem}>
                                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                            {item.sold}+ terjual
                                        </Text>
                                    </View>
                                )}
                                {item.preparationTime !== undefined && (
                                    <View style={styles.metaItem}>
                                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                            ⏱️ {item.preparationTime} menit
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {item.description && (
                                <Text style={[styles.description, { color: colors.textSecondary }]}>
                                    {item.description}
                                </Text>
                            )}

                            {/* Variants */}
                            {item.variants && item.variants.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        {t('fnb.variant') || 'Varian'}
                                    </Text>
                                    {item.variants.map((variant) => {
                                        const isSelected = selectedVariant?.id === variant.id;
                                        return (
                                            <TouchableOpacity
                                                key={variant.id}
                                                style={[
                                                    styles.optionRow,
                                                    {
                                                        backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                                                        borderColor: isSelected ? colors.primary : colors.border,
                                                    },
                                                ]}
                                                onPress={() => setSelectedVariant(variant)}
                                            >
                                                <View
                                                    style={[
                                                        styles.radio,
                                                        {
                                                            borderColor: isSelected ? colors.primary : colors.border,
                                                            backgroundColor: isSelected ? colors.primary : 'transparent',
                                                        },
                                                    ]}
                                                >
                                                    {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.surface }]} />}
                                                </View>
                                                <Text style={[styles.optionText, { color: colors.text }]}>
                                                    {variant.name}
                                                </Text>
                                                {variant.price > 0 && (
                                                    <Text style={[styles.optionPrice, { color: colors.textSecondary }]}>
                                                        +{formatPrice(variant.price)}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Addons */}
                            {item.addons && item.addons.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                        {t('fnb.addons') || 'Tambahan'}
                                    </Text>
                                    {item.addons.map((addon) => {
                                        const isSelected = selectedAddons.some((a) => a.id === addon.id);
                                        return (
                                            <TouchableOpacity
                                                key={addon.id}
                                                style={[
                                                    styles.optionRow,
                                                    {
                                                        backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                                                        borderColor: isSelected ? colors.primary : colors.border,
                                                    },
                                                ]}
                                                onPress={() => toggleAddon(addon)}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        {
                                                            borderColor: isSelected ? colors.primary : colors.border,
                                                            backgroundColor: isSelected ? colors.primary : 'transparent',
                                                        },
                                                    ]}
                                                >
                                                    {isSelected && (
                                                        <Text style={{ color: colors.surface, fontSize: scale(10) }}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={[styles.optionText, { color: colors.text }]}>
                                                    {addon.name}
                                                </Text>
                                                <Text style={[styles.optionPrice, { color: colors.textSecondary }]}>
                                                    +{formatPrice(addon.price)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Notes */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    {t('fnb.notes') || 'Catatan'}
                                </Text>
                                <TextInput
                                    style={[
                                        styles.notesInput,
                                        {
                                            backgroundColor: colors.background,
                                            color: colors.text,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    placeholder="Contoh: tidak pedas, tanpa bawang"
                                    placeholderTextColor={colors.textSecondary}
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                    numberOfLines={2}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* Fixed bottom bar */}
                    <View style={[
                        styles.bottomBar,
                        {
                            backgroundColor: colors.surface,
                            paddingHorizontal: horizontalPadding,
                            borderTopColor: colors.border,
                        }
                    ]}>
                        {/* Quantity */}
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={[styles.quantityButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                            >
                                <Minus size={scale(18)} color={colors.text} variant="Linear" />
                            </TouchableOpacity>
                            <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
                            <TouchableOpacity
                                style={[styles.quantityButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                onPress={() => setQuantity((q) => q + 1)}
                            >
                                <Add size={scale(18)} color={colors.surface} variant="Linear" />
                            </TouchableOpacity>
                        </View>

                        {/* Add to cart button */}
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: colors.primary }]}
                            onPress={handleAddToCart}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.addButtonText, { color: colors.surface }]}>
                                {isEditing
                                    ? `${t('fnb.updateCart') || 'Simpan Perubahan'} - ${formatPrice(totalPrice)}`
                                    : `${t('fnb.addToCart') || 'Tambah'} - ${formatPrice(totalPrice)}`
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        maxHeight: '85%',
        borderTopLeftRadius: scale(24),
        borderTopRightRadius: scale(24),
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: scale(12),
        paddingBottom: scale(8),
    },
    handle: {
        width: scale(40),
        height: scale(4),
        borderRadius: scale(2),
    },
    closeButton: {
        position: 'absolute',
        top: scale(12),
        right: scale(16),
        zIndex: 10,
    },
    scrollContent: {
        paddingBottom: scale(16),
    },
    image: {
        width: '100%',
        height: scale(200),
        marginTop: scale(8),
    },
    content: {
        paddingTop: moderateVerticalScale(16),
    },
    name: {
        fontSize: scale(20),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: scale(4),
    },
    price: {
        fontSize: scale(18),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: scale(8),
    },
    description: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
        lineHeight: scale(20),
        marginBottom: moderateVerticalScale(16),
    },
    unavailableBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: scale(10),
        paddingVertical: scale(4),
        borderRadius: scale(4),
        marginBottom: scale(8),
    },
    unavailableBadgeText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.semiBold,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: scale(12),
        gap: scale(12),
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        fontSize: scale(12),
        marginRight: scale(4),
    },
    metaText: {
        fontSize: scale(13),
        fontFamily: FontFamily.monasans.medium,
    },
    section: {
        marginBottom: moderateVerticalScale(16),
    },
    sectionTitle: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.semiBold,
        marginBottom: scale(8),
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(12),
        borderRadius: scale(10),
        borderWidth: 1,
        marginBottom: scale(8),
    },
    radio: {
        width: scale(20),
        height: scale(20),
        borderRadius: scale(10),
        borderWidth: 2,
        marginRight: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
    },
    checkbox: {
        width: scale(20),
        height: scale(20),
        borderRadius: scale(4),
        borderWidth: 2,
        marginRight: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        flex: 1,
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.medium,
    },
    optionPrice: {
        fontSize: scale(13),
        fontFamily: FontFamily.monasans.medium,
    },
    notesInput: {
        borderWidth: 1,
        borderRadius: scale(10),
        padding: scale(12),
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
        minHeight: scale(60),
        textAlignVertical: 'top',
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: moderateVerticalScale(12),
        paddingBottom: moderateVerticalScale(20),
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: scale(12),
    },
    quantityButton: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(8),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    quantityText: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
        marginHorizontal: scale(16),
        minWidth: scale(24),
        textAlign: 'center',
    },
    addButton: {
        flex: 1,
        paddingVertical: scale(14),
        borderRadius: scale(10),
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.bold,
    },
});
