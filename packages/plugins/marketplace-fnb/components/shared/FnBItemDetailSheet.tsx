/**
 * FnBItemDetailSheet Component
 * Full-screen modal for item details with variant/addon selection (Grab-style)
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    Modal,
    StatusBar,
    Platform,
    KeyboardAvoidingView,
    Keyboard,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, Add, Minus, Heart } from 'iconsax-react-nativejs';
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
    isFavorite?: boolean;
    onClose: () => void;
    onAddToCart: (
        item: FnBItem,
        quantity: number,
        variant?: FnBVariant,
        addons?: FnBAddon[],
        notes?: string
    ) => void;
    onToggleFavorite?: (item: FnBItem) => void;
}

const formatPrice = (price: number): string => {
    return `Rp ${price.toLocaleString('id-ID')}`;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FnBItemDetailSheet: React.FC<FnBItemDetailSheetProps> = ({
    item,
    visible,
    initialQuantity = 0,
    initialVariant,
    initialAddons = [],
    initialNotes = '',
    isFavorite = false,
    onClose,
    onAddToCart,
    onToggleFavorite,
}) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const horizontalPadding = getHorizontalPadding();
    const scrollViewRef = useRef<ScrollView>(null);
    const prevVisibleRef = useRef(false);

    // Determine if editing existing cart item - needs to be recalculated when props change
    const isEditing = useMemo(() => initialQuantity > 0, [initialQuantity]);

    const [quantity, setQuantity] = useState(isEditing ? initialQuantity : 1);
    const [selectedVariant, setSelectedVariant] = useState<FnBVariant | undefined>(initialVariant);
    const [selectedAddons, setSelectedAddons] = useState<FnBAddon[]>(initialAddons);
    const [notes, setNotes] = useState(initialNotes);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    // Reset state when sheet opens (visible changes from false to true)
    useEffect(() => {
        // Only reset when sheet becomes visible (not on every prop change)
        if (visible && !prevVisibleRef.current && item) {
            setQuantity(initialQuantity > 0 ? initialQuantity : 1);
            // If editing, use initial props, otherwise default to first variant if available
            if (initialQuantity > 0) {
                setSelectedVariant(initialVariant);
                setSelectedAddons(initialAddons);
                setNotes(initialNotes);
            } else {
                setSelectedVariant(item.variants?.[0]);
                setSelectedAddons([]);
                setNotes('');
            }
            // Scroll to top when opening
            scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
        }
        prevVisibleRef.current = visible;
    }, [visible, item, initialQuantity, initialVariant, initialAddons, initialNotes]);

    // Keyboard listeners for better scroll behavior
    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

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
        Keyboard.dismiss();
        onAddToCart(item, quantity, selectedVariant, selectedAddons, notes || undefined);
        onClose();
    }, [item, quantity, selectedVariant, selectedAddons, notes, onAddToCart, onClose]);

    const handleClose = useCallback(() => {
        Keyboard.dismiss();
        onClose();
    }, [onClose]);

    if (!item) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent
            />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={0}
                >
                    {/* Header with back button - overlays image */}
                    <View
                        style={[
                            styles.header,
                            {
                                paddingTop: insets.top + scale(8),
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
                            onPress={handleClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <ArrowLeft2 size={scale(24)} color="#FFFFFF" variant="Linear" />
                        </TouchableOpacity>

                        {/* Favorite button */}
                        {onToggleFavorite && item && (
                            <TouchableOpacity
                                style={[styles.favoriteButton, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
                                onPress={() => onToggleFavorite(item)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Heart
                                    size={scale(24)}
                                    color={isFavorite ? '#E53935' : '#FFFFFF'}
                                    variant={isFavorite ? 'Bold' : 'Linear'}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Scrollable content */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.scrollContent,
                            {
                                paddingBottom: keyboardVisible
                                    ? moderateVerticalScale(20)
                                    : insets.bottom + scale(100),
                            },
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="interactive"
                        bounces={true}
                        overScrollMode="always"
                    >
                        {/* Hero Image */}
                        <View style={styles.imageContainer}>
                            {item.imageUrl ? (
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.imagePlaceholder, { backgroundColor: colors.primaryLight }]}>
                                    <Text style={styles.placeholderEmoji}>🍽️</Text>
                                </View>
                            )}
                        </View>

                        {/* Content */}
                        <View style={[styles.content, { backgroundColor: colors.surface }]}>
                            <View style={{ paddingHorizontal: horizontalPadding }}>
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
                            </View>

                            {/* Divider */}
                            <View style={[styles.divider, { backgroundColor: colors.background }]} />

                            <View style={{ paddingHorizontal: horizontalPadding }}>
                                {/* Variants */}
                                {item.variants && item.variants.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                                {t('fnb.variant') || 'Pilih Varian'}
                                            </Text>
                                            <View style={[styles.requiredBadge, { backgroundColor: colors.error }]}>
                                                <Text style={[styles.requiredText, { color: colors.surface }]}>Wajib</Text>
                                            </View>
                                        </View>
                                        {item.variants.map((variant) => {
                                            const isSelected = selectedVariant?.id === variant.id;
                                            return (
                                                <TouchableOpacity
                                                    key={variant.id}
                                                    style={[
                                                        styles.optionRow,
                                                        {
                                                            backgroundColor: isSelected ? colors.primaryLight : colors.background,
                                                            borderColor: isSelected ? colors.primary : colors.border,
                                                        },
                                                    ]}
                                                    onPress={() => setSelectedVariant(variant)}
                                                    activeOpacity={0.7}
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
                                                        <Text style={[styles.optionPrice, { color: colors.primary }]}>
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
                                        <View style={styles.sectionHeader}>
                                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                                {t('fnb.addons') || 'Tambahan'}
                                            </Text>
                                            <Text style={[styles.optionalText, { color: colors.textSecondary }]}>Opsional</Text>
                                        </View>
                                        {item.addons.map((addon) => {
                                            const isSelected = selectedAddons.some((a) => a.id === addon.id);
                                            return (
                                                <TouchableOpacity
                                                    key={addon.id}
                                                    style={[
                                                        styles.optionRow,
                                                        {
                                                            backgroundColor: isSelected ? colors.primaryLight : colors.background,
                                                            borderColor: isSelected ? colors.primary : colors.border,
                                                        },
                                                    ]}
                                                    onPress={() => toggleAddon(addon)}
                                                    activeOpacity={0.7}
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
                                                            <Text style={{ color: colors.surface, fontSize: scale(10), fontWeight: 'bold' }}>✓</Text>
                                                        )}
                                                    </View>
                                                    <Text style={[styles.optionText, { color: colors.text }]}>
                                                        {addon.name}
                                                    </Text>
                                                    <Text style={[styles.optionPrice, { color: colors.primary }]}>
                                                        +{formatPrice(addon.price)}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}

                                {/* Notes */}
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                            {t('fnb.notes') || 'Catatan untuk Penjual'}
                                        </Text>
                                        <Text style={[styles.optionalText, { color: colors.textSecondary }]}>Opsional</Text>
                                    </View>
                                    <TextInput
                                        style={[
                                            styles.notesInput,
                                            {
                                                backgroundColor: colors.background,
                                                color: colors.text,
                                                borderColor: colors.border,
                                            },
                                        ]}
                                        placeholder="Contoh: tidak pedas, tanpa bawang..."
                                        placeholderTextColor={colors.textSecondary}
                                        value={notes}
                                        onChangeText={setNotes}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Fixed bottom bar */}
                    <View
                        style={[
                            styles.bottomBar,
                            {
                                backgroundColor: colors.surface,
                                paddingHorizontal: horizontalPadding,
                                paddingBottom: insets.bottom + scale(12),
                                borderTopColor: colors.border,
                            },
                        ]}
                    >
                        {/* Quantity */}
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.quantityButton,
                                    {
                                        backgroundColor: colors.background,
                                        borderColor: colors.border,
                                    },
                                ]}
                                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                                activeOpacity={0.7}
                            >
                                <Minus size={scale(20)} color={colors.text} variant="Linear" />
                            </TouchableOpacity>
                            <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
                            <TouchableOpacity
                                style={[
                                    styles.quantityButton,
                                    {
                                        backgroundColor: colors.primary,
                                        borderColor: colors.primary,
                                    },
                                ]}
                                onPress={() => setQuantity((q) => q + 1)}
                                activeOpacity={0.7}
                            >
                                <Add size={scale(20)} color={colors.surface} variant="Linear" />
                            </TouchableOpacity>
                        </View>

                        {/* Add to cart button */}
                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                {
                                    backgroundColor: item.isAvailable === false ? colors.border : colors.primary,
                                },
                            ]}
                            onPress={handleAddToCart}
                            activeOpacity={0.8}
                            disabled={item.isAvailable === false}
                        >
                            <Text style={[styles.addButtonText, { color: colors.surface }]}>
                                {isEditing
                                    ? `${t('fnb.updateCart') || 'Simpan'} - ${formatPrice(totalPrice)}`
                                    : `${t('fnb.addToCart') || 'Tambah'} - ${formatPrice(totalPrice)}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: scale(16),
        paddingBottom: scale(12),
    },
    backButton: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        position: 'absolute',
        top: 0,
        right: scale(16),
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    imageContainer: {
        width: '100%',
        height: SCREEN_HEIGHT * 0.35,
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
        fontSize: scale(80),
    },
    content: {
        flex: 1,
        borderTopLeftRadius: scale(24),
        borderTopRightRadius: scale(24),
        marginTop: -scale(24),
        paddingTop: moderateVerticalScale(20),
    },
    unavailableBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: scale(12),
        paddingVertical: scale(6),
        borderRadius: scale(6),
        marginBottom: scale(12),
    },
    unavailableBadgeText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.semiBold,
    },
    name: {
        fontSize: scale(24),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: scale(6),
    },
    price: {
        fontSize: scale(22),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: scale(12),
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: scale(16),
        gap: scale(16),
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        fontSize: scale(14),
        marginRight: scale(4),
    },
    metaText: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.medium,
    },
    description: {
        fontSize: scale(15),
        fontFamily: FontFamily.monasans.regular,
        lineHeight: scale(22),
        marginBottom: moderateVerticalScale(8),
    },
    divider: {
        height: scale(8),
        marginVertical: moderateVerticalScale(16),
    },
    section: {
        marginBottom: moderateVerticalScale(20),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: scale(12),
    },
    sectionTitle: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
    },
    requiredBadge: {
        paddingHorizontal: scale(8),
        paddingVertical: scale(3),
        borderRadius: scale(4),
    },
    requiredText: {
        fontSize: scale(11),
        fontFamily: FontFamily.monasans.semiBold,
    },
    optionalText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.regular,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(14),
        borderRadius: scale(12),
        borderWidth: 1.5,
        marginBottom: scale(10),
    },
    radio: {
        width: scale(22),
        height: scale(22),
        borderRadius: scale(11),
        borderWidth: 2,
        marginRight: scale(14),
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: scale(10),
        height: scale(10),
        borderRadius: scale(5),
    },
    checkbox: {
        width: scale(22),
        height: scale(22),
        borderRadius: scale(6),
        borderWidth: 2,
        marginRight: scale(14),
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        flex: 1,
        fontSize: scale(15),
        fontFamily: FontFamily.monasans.medium,
    },
    optionPrice: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.semiBold,
    },
    notesInput: {
        borderWidth: 1.5,
        borderRadius: scale(12),
        padding: scale(14),
        fontSize: scale(15),
        fontFamily: FontFamily.monasans.regular,
        minHeight: scale(90),
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: scale(12),
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: scale(14),
    },
    quantityButton: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    quantityText: {
        fontSize: scale(18),
        fontFamily: FontFamily.monasans.bold,
        marginHorizontal: scale(16),
        minWidth: scale(28),
        textAlign: 'center',
    },
    addButton: {
        flex: 1,
        paddingVertical: scale(16),
        borderRadius: scale(12),
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
    },
});
