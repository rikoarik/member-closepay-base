/**
 * FnBMerchantDetailScreen Component
 * Main screen for FnB marketplace with menu grid, category tabs, and floating cart
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity, TextInput, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2, SearchNormal, CloseCircle } from 'iconsax-react-nativejs';
import {
    scale,
    moderateVerticalScale,
    getHorizontalPadding,
    FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useFnBData, useFnBCart, useFnBFavorites } from '../../hooks';
import { FnBItemCard, FnBCategoryTabs, FnBCartBar, FnBItemDetailSheet, FnBCartDetailSheet, MerchantHeader, FnBItemCardSkeleton, FnBCategoryTabsSkeleton, MerchantHeaderSkeleton } from '../shared';
import type { FnBItem, FnBVariant, FnBAddon, FnBOrderItem, EntryPoint } from '../../models';

interface CartItem extends FnBOrderItem {
    cartId: string;
}

interface FnBMerchantDetailScreenProps {
    entryPoint?: EntryPoint;
}

export const FnBMerchantDetailScreen: React.FC<FnBMerchantDetailScreenProps> = ({ entryPoint = 'browse' }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const horizontalPadding = getHorizontalPadding();

    // Data hooks
    const {
        filteredItems,
        categories,
        store,
        loading,
        selectedCategory,
        setSelectedCategory,
        refresh,
    } = useFnBData(entryPoint);

    const {
        cartItems,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        updateItem,
        getItemQuantity,
        incrementItem,
        decrementItem,
    } = useFnBCart(entryPoint);

    const { isFavorite, toggleFavorite } = useFnBFavorites();

    // Local state
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FnBItem | null>(null);
    const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
    const [showItemDetail, setShowItemDetail] = useState(false);
    const [showCartDetail, setShowCartDetail] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    // Filter items based on search query
    const searchedItems = useMemo(() => {
        if (!searchQuery.trim()) return filteredItems;

        const query = searchQuery.toLowerCase().trim();
        return filteredItems.filter((item) =>
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        );
    }, [filteredItems, searchQuery]);

    // Handlers
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    const handleItemPress = useCallback((item: FnBItem) => {
        setSelectedItem(item);
        setShowItemDetail(true);
    }, []);

    const handleAddItem = useCallback((item: FnBItem) => {
        if (item.variants && item.variants.length > 0) {
            setSelectedItem(item);
            setShowItemDetail(true);
        } else {
            incrementItem(item);
        }
    }, [incrementItem]);

    const handleRemoveItem = useCallback((item: FnBItem) => {
        decrementItem(item.id);
    }, [decrementItem]);

    const handleAddToCart = useCallback(
        (item: FnBItem, quantity: number, variant?: FnBVariant, addons?: FnBAddon[], notes?: string) => {
            if (editingCartItem) {
                updateItem(editingCartItem.cartId, quantity, variant, addons, notes);
                setEditingCartItem(null);
            } else {
                addItem(item, quantity, variant, addons, notes);
            }
        },
        [addItem, updateItem, editingCartItem]
    );

    const handleCloseItemDetail = useCallback(() => {
        setShowItemDetail(false);
        setSelectedItem(null);
        setEditingCartItem(null);
    }, []);

    const handleEditCartItem = useCallback((cartItem: CartItem) => {
        setEditingCartItem(cartItem);
        setSelectedItem(cartItem.item);
        setShowCartDetail(false);
        setShowItemDetail(true);
    }, []);

    const handleCartPress = useCallback(() => {
        setShowCartDetail(true);
    }, []);

    const handleCloseCartDetail = useCallback(() => {
        setShowCartDetail(false);
    }, []);

    const handleCartCheckout = useCallback(() => {
        setShowCartDetail(false);
        // @ts-ignore
        navigation.navigate('FnBCheckout', { entryPoint });
    }, [navigation, entryPoint]);

    const toggleSearch = useCallback(() => {
        setIsSearchActive((prev) => {
            if (prev) {
                setSearchQuery('');
            }
            return !prev;
        });
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: FnBItem }) => (
            <FnBItemCard
                item={item}
                quantity={getItemQuantity(item.id)}
                isFavorite={isFavorite(item.id)}
                onPress={handleItemPress}
                onAdd={handleAddItem}
                onRemove={handleRemoveItem}
                onToggleFavorite={toggleFavorite}
            />
        ),
        [handleItemPress, handleAddItem, handleRemoveItem, getItemQuantity, isFavorite, toggleFavorite]
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header - Fixed Navigation Bar */}
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: colors.surface,
                        paddingTop: insets.top + moderateVerticalScale(8),
                        paddingHorizontal: horizontalPadding,
                        zIndex: 10,
                    },
                ]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
                    </TouchableOpacity>

                    {isSearchActive ? (
                        <View style={[styles.searchInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <SearchNormal size={scale(18)} color={colors.textSecondary} variant="Linear" />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder={t('fnb.searchMenu') || 'Cari menu...'}
                                placeholderTextColor={colors.textSecondary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                    <CloseCircle size={scale(18)} color={colors.textSecondary} variant="Bold" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View style={styles.headerTitleContainer}>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>
                                {store?.name || t('fnb.title') || 'Pesan Makanan'}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.searchButton, { backgroundColor: isSearchActive ? colors.primary : colors.background }]}
                        onPress={toggleSearch}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        {isSearchActive ? (
                            <Text style={[styles.searchButtonText, { color: colors.surface }]}></Text>
                        ) : (
                            <SearchNormal size={scale(20)} color={colors.text} variant="Linear" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Menu Grid */}
            <FlatList
                data={searchedItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={[
                    styles.listContent,
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: itemCount > 0 ? scale(120) : insets.bottom + scale(20),
                    },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListHeaderComponent={
                    <View>
                        {loading ? (
                            <>
                                <MerchantHeaderSkeleton />
                                <FnBCategoryTabsSkeleton />
                            </>
                        ) : (
                            <>
                                {store && <MerchantHeader store={store} />}
                                <FnBCategoryTabs
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={setSelectedCategory}
                                />
                            </>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    loading ? (
                        // Show skeleton loading when loading
                        <View style={styles.loadingContainer}>
                            {Array.from({ length: 6 }, (_, index) => (
                                <FnBItemCardSkeleton key={`skeleton-${index}`} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {searchQuery
                                    ? `Tidak ada menu "${searchQuery}" ditemukan`
                                    : 'Tidak ada menu ditemukan'
                                }
                            </Text>
                        </View>
                    )
                }
            />

            {/* Floating Cart Bar */}
            <FnBCartBar
                itemCount={itemCount}
                total={subtotal}
                onPress={handleCartPress}
                onCheckout={handleCartCheckout}
                visible={itemCount > 0}
            />

            {/* Item Detail Sheet */}
            <FnBItemDetailSheet
                item={editingCartItem ? editingCartItem.item : selectedItem}
                visible={showItemDetail}
                initialQuantity={editingCartItem ? editingCartItem.quantity : 0}
                initialVariant={editingCartItem?.variant}
                initialAddons={editingCartItem?.addons}
                initialNotes={editingCartItem?.notes}
                isFavorite={selectedItem ? isFavorite(selectedItem.id) : false}
                onClose={handleCloseItemDetail}
                onAddToCart={handleAddToCart}
                onToggleFavorite={toggleFavorite}
            />

            {/* Cart Detail Sheet */}
            <FnBCartDetailSheet
                visible={showCartDetail}
                cartItems={cartItems}
                subtotal={subtotal}
                onClose={handleCloseCartDetail}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onEditItem={handleEditCartItem}
                onCheckout={handleCartCheckout}
            />


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: moderateVerticalScale(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: scale(4),
        marginRight: scale(8),
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: scale(18),
        fontFamily: FontFamily.monasans.bold,
    },
    searchButton: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: scale(8),
    },
    searchButtonText: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.bold,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(12),
        height: scale(40),
        borderRadius: scale(10),
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
        marginLeft: scale(8),
        marginRight: scale(8),
        paddingVertical: 0,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    listContent: {
        paddingTop: moderateVerticalScale(16),
        flexGrow: 1,
    },
    loadingContainer: {
        paddingTop: moderateVerticalScale(8),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: moderateVerticalScale(60),
    },
    emptyText: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
    },
});

export default FnBMerchantDetailScreen;
