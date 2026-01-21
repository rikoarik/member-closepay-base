/**
 * CartScreen Component
 * Display and manage cart items for marketplace
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SectionList,
    FlatList,
    Alert,
    Animated,
    Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2, Add, Minus, Trash, ShoppingCart, TickCircle, ArrowDown2, ArrowUp2, ArrowRight2 } from 'iconsax-react-nativejs';
import {
    scale,
    moderateVerticalScale,
    getHorizontalPadding,
    FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useMarketplaceCart, CartItem } from '../../hooks/useMarketplaceCart';
import { getAllStores } from '../../hooks/useMarketplaceData';
import type { Product } from '../shared/ProductCard';

const formatPrice = (price: number): string => { // ... existing code
    return `Rp ${price.toLocaleString('id-ID')}`;
};

export const CartScreen: React.FC = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const horizontalPadding = getHorizontalPadding();
    const [showPriceDetails, setShowPriceDetails] = React.useState(false);
    const animationController = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animationController, {
            toValue: showPriceDetails ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }).start();
    }, [showPriceDetails]);

    const arrowRotation = animationController.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const detailsOpacity = animationController;
    const detailsTranslateY = animationController.interpolate({
        inputRange: [0, 1],
        outputRange: [10, 0],
    });

    const {
        cartItems,
        itemCount,
        subtotal,
        updateQuantity,
        removeItem,
        clearCart,
        toggleSelection,
        toggleStoreSelection,
        selectAll,
        removeSelected,
        isAllSelected,
        selectedCount,
    } = useMarketplaceCart();

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleCheckout = useCallback(() => {
        if (selectedCount === 0) {
            Alert.alert(t('common.error'), t('marketplace.selectItemToCheckout'));
            return;
        }
        // @ts-ignore
        navigation.navigate('Checkout');
    }, [navigation, selectedCount, t]);

    const handleRemoveSelected = useCallback(() => {
        if (selectedCount === 0) return;
        
        Alert.alert(
            t('common.delete'),
            t('marketplace.deleteSelectedConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.delete'), style: 'destructive', onPress: removeSelected },
            ]
        );
    }, [selectedCount, removeSelected, t]);

    const handleProductPress = useCallback((product: unknown) => {
        // @ts-ignore
        navigation.navigate('ProductDetail', { product });
    }, [navigation]);

    const handleStorePress = useCallback((storeName: string) => {
        const allStores = getAllStores();
        // Since we don't have store ID in item, we fallback to name search
        // In real app, item.storeId would be available
        const store = allStores.find(s => s.name === storeName) || {
            id: 'generic-store',
            name: storeName,
            imageUrl: 'https://via.placeholder.com/150',
            rating: 4.5,
            followers: 100,
            location: 'Unknown'
        };
        
        // @ts-ignore
        navigation.navigate('StoreDetail', { store });
    }, [navigation]);

    const groupedItems = useMemo(() => {
        const groups: { [key: string]: CartItem[] } = {};
        cartItems.forEach((item) => {
            const storeName = item.product.storeName || 'Other';
            if (!groups[storeName]) {
                groups[storeName] = [];
            }
            groups[storeName].push(item);
        });

        return Object.keys(groups).map((storeName) => ({
            title: storeName,
            data: groups[storeName],
        }));
    }, [cartItems]);

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

                    {selectedCount > 0 && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={handleRemoveSelected}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={{ color: colors.error, fontFamily: FontFamily.monasans.medium, fontSize: scale(14) }}>
                                {t('common.delete')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                
                {/* Select All Row - REMOVED from Header */}
            </View>

            {/* Cart Items */}
            <FlatList
                data={groupedItems}
                renderItem={({ item: group }) => {
                    const isStoreSelected = group.data.every((item) => item.selected);
                    
                    return (
                        <View style={[styles.storeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            {/* Store Header */}
                            <View style={[styles.storeHeader]}>
                                <TouchableOpacity
                                    style={styles.checkbox}
                                    onPress={() => toggleStoreSelection(group.title)}
                                >
                                    <TickCircle
                                        size={scale(20)}
                                        color={isStoreSelected ? colors.primary : colors.textSecondary}
                                        variant={isStoreSelected ? 'Bold' : 'Linear'}
                                    />
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.storeInfoContainer}
                                    onPress={() => handleStorePress(group.title)}
                                >
                                    <Text style={[styles.storeName, { color: colors.text }]}>{group.title}</Text>
                                    <ArrowRight2 size={scale(16)} color={colors.textSecondary} variant="Linear" />
                                </TouchableOpacity>
                            </View>

                            {/* Store Items */}
                            {group.data.map((item, index) => (
                                <View 
                                    key={item.cartId} 
                                    style={[
                                        styles.itemRow, 
                                        index !== group.data.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                                    ]}
                                >
                                    {/* Checkbox */}
                                    <TouchableOpacity
                                        style={styles.itemCheckbox}
                                        onPress={() => toggleSelection(item.cartId)}
                                    >
                                        <TickCircle
                                            size={scale(20)}
                                            color={item.selected ? colors.primary : colors.textSecondary}
                                            variant={item.selected ? 'Bold' : 'Linear'}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={styles.itemContentContainer}
                                        onPress={() => handleProductPress(item.product)}
                                        activeOpacity={0.7}
                                    >
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
                                            
                                            {/* Quantity Controls - Moved Here */}
                                            <View style={styles.quantityContainer}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.quantityButton, 
                                                        { backgroundColor: item.quantity === 1 ? colors.error + '15' : colors.primaryLight }
                                                    ]}
                                                    onPress={(e) => {
                                                        e.stopPropagation(); // Prevent navigating to product detail
                                                        item.quantity === 1 ? removeItem(item.cartId) : updateQuantity(item.cartId, item.quantity - 1);
                                                    }}
                                                >
                                                    {item.quantity === 1 ? (
                                                        <Trash size={scale(14)} color={colors.error} variant="Linear" />
                                                    ) : (
                                                        <Minus size={scale(14)} color={colors.primary} variant="Linear" />
                                                    )}
                                                </TouchableOpacity>

                                                <Text style={[styles.quantityText, { color: colors.text }]}>
                                                    {item.quantity}
                                                </Text>

                                                <TouchableOpacity
                                                    style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                                                    onPress={(e) => {
                                                        e.stopPropagation(); // Prevent navigating to product detail
                                                        updateQuantity(item.cartId, item.quantity + 1);
                                                        if (!item.selected) {
                                                            toggleSelection(item.cartId);
                                                        }
                                                    }}
                                                >
                                                    <Add size={scale(14)} color="#FFFFFF" variant="Linear" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    );
                }}
                keyExtractor={(item) => item.title}
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
                    <Animated.View 
                        style={[
                            styles.priceDetailsContainer, 
                            { 
                                backgroundColor: colors.surface, 
                                borderTopColor: colors.border,
                                opacity: detailsOpacity,
                                transform: [{ translateY: detailsTranslateY }],
                            }
                        ]}
                        pointerEvents={showPriceDetails ? 'auto' : 'none'}
                    >
                        <View style={styles.priceDetailRow}>
                            <Text style={[styles.priceDetailLabel, { color: colors.textSecondary }]}>{t('marketplace.subtotal')}</Text>
                            <Text style={[styles.priceDetailValue, { color: colors.text }]}>{formatPrice(subtotal)}</Text>
                        </View>
                        <View style={styles.priceDetailRow}>
                            <Text style={[styles.priceDetailLabel, { color: colors.textSecondary }]}>Discount</Text>
                            <Text style={[styles.priceDetailValue, { color: colors.primary }]}>-Rp 0</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    </Animated.View>

                    <View style={styles.footerContent}>
                        {/* Select All (Bottom Left) */}
                        <TouchableOpacity
                            style={styles.footerSelectAll}
                            onPress={() => selectAll(!isAllSelected)}
                        >
                            <TickCircle
                                size={scale(24)}
                                color={isAllSelected ? colors.primary : colors.textSecondary}
                                variant={isAllSelected ? 'Bold' : 'Linear'}
                            />
                            <Text style={[styles.footerSelectAllText, { color: colors.text }]}>
                                {t('common.filterAll')}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.footerRightSection}>
                            <TouchableOpacity 
                                style={styles.totalContainer}
                                onPress={() => setShowPriceDetails(!showPriceDetails)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.totalLabel, { color: colors.text }]} numberOfLines={1}>
                                    {t('marketplace.total')}
                                </Text>
                                <View style={styles.totalValueContainer}>
                                    <Text style={[styles.totalValue, { color: colors.primary }]}>
                                        {formatPrice(subtotal)}
                                    </Text>
                                    <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
                                        <ArrowUp2 size={scale(14)} color={colors.textSecondary} variant="Linear" />
                                    </Animated.View>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.checkoutButton, 
                                    { backgroundColor: selectedCount > 0 ? colors.primary : colors.textSecondary }
                                ]}
                                onPress={handleCheckout}
                                activeOpacity={0.8}
                                disabled={selectedCount === 0}
                            >
                                <Text style={styles.checkoutButtonText}>
                                    {t('marketplace.checkout')} ({selectedCount})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    selectAllRow: {
        marginTop: moderateVerticalScale(12),
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectAllText: {
        marginLeft: scale(8),
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.medium,
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
    storeCard: {
        borderRadius: scale(12),
        marginBottom: scale(12),
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    storeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(10),
    },
    storeInfoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        marginLeft: scale(8),
    },
    itemRow: {
        flexDirection: 'row',
        padding: scale(10),
    },
    itemContentContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    storeName: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.bold,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemCheckbox: {
        marginRight: scale(8),
        justifyContent: 'center',
    },
    imageContainer: {
        width: scale(70),
        height: scale(70),
        borderRadius: scale(8),
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
        fontSize: scale(24),
    },
    itemInfo: {
        flex: 1,
        marginLeft: scale(10),
        justifyContent: 'center',
        gap: scale(4),
    },
    itemName: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.semiBold,
        marginBottom: scale(2),
    },
    itemPrice: {
        fontSize: scale(13),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: scale(4),
    },
    subtotalText: {
        fontSize: scale(11),
        fontFamily: FontFamily.monasans.regular,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        marginTop: scale(2),
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    quantityButton: {
        width: scale(26),
        height: scale(26),
        borderRadius: scale(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.bold,
        minWidth: scale(20),
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
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerSelectAll: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerSelectAllText: {
        marginLeft: scale(8),
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.regular,
    },
    footerRightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    totalContainer: {
        alignItems: 'flex-end',
        marginRight: scale(12),
    },
    totalLabel: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.regular,
        marginBottom: scale(2),
    },
    totalValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
    },
    totalValue: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
    },
    checkoutButton: {
        paddingVertical: moderateVerticalScale(10),
        paddingHorizontal: scale(12),
        borderRadius: scale(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkoutButtonText: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
        color: '#FFFFFF',
    },
    priceDetailsContainer: {
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        padding: scale(16),
        borderTopWidth: 1,
        paddingBottom: scale(24),
    },
    priceDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: scale(8),
    },
    priceDetailLabel: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
    },
    priceDetailValue: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.medium,
    },
    divider: {
        height: 1,
        marginTop: scale(8),
        marginBottom: scale(30),
    },
});

export default CartScreen;
