/**
 * CartScreen Component
 * Display and manage cart items for marketplace
 */

import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2, Add, Minus, Trash, ShoppingCart } from 'iconsax-react-nativejs';
import {
    scale,
    moderateVerticalScale,
    getHorizontalPadding,
    FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useMarketplaceCart, CartItem } from '../../hooks/useMarketplaceCart';

const formatPrice = (price: number): string => {
    return `Rp ${price.toLocaleString('id-ID')}`;
};

export const CartScreen: React.FC = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const horizontalPadding = getHorizontalPadding();

    const {
        cartItems,
        itemCount,
        subtotal,
        updateQuantity,
        removeItem,
        clearCart,
    } = useMarketplaceCart();

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleCheckout = useCallback(() => {
        // @ts-ignore
        navigation.navigate('Checkout');
    }, [navigation]);

    const renderItem = useCallback(
        ({ item }: { item: CartItem }) => (
            <View style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    {item.product.imageUrl ? (
                        <Image
                            source={{ uri: item.product.imageUrl }}
                            style={styles.itemImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: colors.primaryLight }]}>
                            <Text style={styles.placeholderEmoji}>📦</Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                        {item.product.name}
                    </Text>
                    <Text style={[styles.itemPrice, { color: colors.primary }]}>
                        {formatPrice(item.product.price)}
                    </Text>
                    <Text style={[styles.subtotalText, { color: colors.textSecondary }]}>
                        Subtotal: {formatPrice(item.subtotal)}
                    </Text>
                </View>

                {/* Quantity Controls */}
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={[styles.quantityButton, { backgroundColor: colors.error + '15' }]}
                        onPress={() => removeItem(item.cartId)}
                    >
                        <Trash size={scale(16)} color={colors.error} variant="Linear" />
                    </TouchableOpacity>

                    <View style={styles.quantityRow}>
                        <TouchableOpacity
                            style={[styles.quantityButton, { backgroundColor: colors.primaryLight }]}
                            onPress={() => updateQuantity(item.cartId, item.quantity - 1)}
                        >
                            <Minus size={scale(16)} color={colors.primary} variant="Linear" />
                        </TouchableOpacity>

                        <Text style={[styles.quantityText, { color: colors.text }]}>
                            {item.quantity}
                        </Text>

                        <TouchableOpacity
                            style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                            onPress={() => updateQuantity(item.cartId, item.quantity + 1)}
                        >
                            <Add size={scale(16)} color="#FFFFFF" variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        ),
        [colors, updateQuantity, removeItem]
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <ShoppingCart size={scale(64)} color={colors.textSecondary} variant="Linear" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('marketplace.emptyCart')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t('marketplace.emptyCartDesc')}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: colors.surface,
                        paddingTop: insets.top + moderateVerticalScale(8),
                        paddingHorizontal: horizontalPadding,
                    },
                ]}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            {t('marketplace.cart')}
                        </Text>
                        {itemCount > 0 && (
                            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                                <Text style={[styles.countText, { color: colors.surface }]}>
                                    {itemCount}
                                </Text>
                            </View>
                        )}
                    </View>

                    {itemCount > 0 && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={clearCart}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Trash size={scale(22)} color={colors.error} variant="Linear" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Cart Items */}
            <FlatList
                data={cartItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.cartId}
                contentContainerStyle={[
                    styles.listContent,
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: itemCount > 0 ? moderateVerticalScale(100) : insets.bottom + moderateVerticalScale(20),
                    },
                    cartItems.length === 0 && styles.emptyListContent,
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
            />

            {/* Checkout Footer */}
            {itemCount > 0 && (
                <View
                    style={[
                        styles.footer,
                        {
                            backgroundColor: colors.surface,
                            paddingBottom: insets.bottom + moderateVerticalScale(12),
                            paddingHorizontal: horizontalPadding,
                        },
                    ]}
                >
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                            {t('marketplace.total')} ({itemCount} {t('marketplace.items')})
                        </Text>
                        <Text style={[styles.totalValue, { color: colors.text }]}>
                            {formatPrice(subtotal)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
                        onPress={handleCheckout}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.checkoutButtonText}>
                            {t('marketplace.checkout')}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: moderateVerticalScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: scale(4),
        marginRight: scale(12),
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: scale(20),
        fontFamily: FontFamily.monasans.bold,
    },
    countBadge: {
        marginLeft: scale(8),
        paddingHorizontal: scale(10),
        paddingVertical: scale(4),
        borderRadius: scale(12),
    },
    countText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.bold,
    },
    clearButton: {
        padding: scale(8),
    },
    listContent: {
        paddingTop: moderateVerticalScale(16),
    },
    emptyListContent: {
        flex: 1,
    },
    itemCard: {
        flexDirection: 'row',
        padding: scale(12),
        borderRadius: scale(12),
        marginBottom: scale(12),
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(10),
        overflow: 'hidden',
    },
    itemImage: {
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
        fontSize: scale(32),
    },
    itemInfo: {
        flex: 1,
        marginLeft: scale(12),
        justifyContent: 'center',
    },
    itemName: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.semiBold,
        marginBottom: scale(4),
    },
    itemPrice: {
        fontSize: scale(15),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: scale(2),
    },
    subtotalText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.regular,
    },
    quantityContainer: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    quantityButton: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
        minWidth: scale(24),
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(32),
    },
    emptyTitle: {
        fontSize: scale(20),
        fontFamily: FontFamily.monasans.bold,
        marginTop: scale(20),
        marginBottom: scale(8),
    },
    emptySubtitle: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
        textAlign: 'center',
        lineHeight: scale(20),
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: moderateVerticalScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateVerticalScale(12),
    },
    totalLabel: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
    },
    totalValue: {
        fontSize: scale(18),
        fontFamily: FontFamily.monasans.bold,
    },
    checkoutButton: {
        paddingVertical: moderateVerticalScale(14),
        borderRadius: scale(12),
        alignItems: 'center',
    },
    checkoutButtonText: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
        color: '#FFFFFF',
    },
});

export default CartScreen;
