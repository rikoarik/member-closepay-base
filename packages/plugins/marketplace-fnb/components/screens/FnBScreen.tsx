/**
 * FnBScreen Component
 * Premium Marketplace Landing Page (Superapp Style)
 */

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, FlatList, TextInput, StatusBar, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
    ArrowLeft2,
    SearchNormal,
    ArrowDown2,
    Heart,
    Star1,
    Clock,
    DiscountShape,
    TruckFast,
    ScanBarcode
} from 'iconsax-react-nativejs';
import {
    scale,
    moderateVerticalScale,
    getHorizontalPadding,
    FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import type { EntryPoint } from '../../models';

interface FnBScreenProps {
    entryPoint?: EntryPoint;
}

const { width } = Dimensions.get('window');

// --- Mock Data ---

const BANNERS = [
    { id: '1', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', title: 'Diskon 50%', subtitle: 'Spesial Hari Ini' },
    { id: '2', imageUrl: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800', title: 'Gratis Ongkir', subtitle: 'Min. Belanja 50rb' },
    { id: '3', imageUrl: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800', title: 'Menu Baru', subtitle: 'Cobain Sekarang' },
];

const CATEGORIES = [
    { id: '1', name: 'Terdekat', icon: '📍', color: '#E8F5E9' },
    { id: '2', name: 'Terlaris', icon: '🔥', color: '#FFEBEE' },
    { id: '3', name: 'Promo', icon: '🏷️', color: '#FFF3E0' },
    { id: '4', name: 'Baru', icon: '✨', color: '#E3F2FD' },
    { id: '5', name: 'Sehat', icon: '🥗', color: '#F3E5F5' },
    { id: '6', name: 'Minuman', icon: '🥤', color: '#E0F7FA' },
    { id: '7', name: 'Snack', icon: '🍟', color: '#FFF8E1' },
    { id: '8', name: 'Roti', icon: '🍞', color: '#FBE9E7' },
];

const STORES = [
    {
        id: 'store-001',
        name: 'Warung Makan Sederhana',
        description: 'Indonesian • 0.5 km',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
        isOpen: true,
        time: '15-20 min',
        promo: 'Diskon 20%'
    },
    {
        id: 'store-002',
        name: 'Burger King Clone',
        description: 'Fast Food • 1.2 km',
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
        isOpen: true,
        time: '20-30 min',
        promo: 'Gratis Ongkir'
    },
    {
        id: 'store-003',
        name: 'Kopi Kenangan Mantan',
        description: 'Coffee • 0.8 km',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
        isOpen: true,
        time: '10-15 min',
        promo: null
    },
    {
        id: 'store-004',
        name: 'Pizza Hut Delivery',
        description: 'Pizza • 2.5 km',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
        isOpen: true,
        time: '30-40 min',
        promo: 'Beli 1 Gratis 1'
    },
];

export const FnBScreen: React.FC<FnBScreenProps> = ({ entryPoint = 'browse' }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const horizontalPadding = getHorizontalPadding();
    const [searchQuery, setSearchQuery] = useState('');

    const handleBack = () => {
        navigation.goBack();
    };

    const handleMerchantPress = () => {
        // @ts-ignore
        navigation.navigate('FnBMerchantDetail', { entryPoint });
    };


    const handleScanPress = useCallback(() => {
        // Navigate to dedicated FnB scan screen
        // @ts-ignore
        navigation.navigate('FnBScan');
    }, [navigation]);

    const handleFavoritesPress = useCallback(() => {
        // Navigate to favorites screen
        // @ts-ignore
        navigation.navigate('FnBFavorites');
    }, [navigation]);

    // --- Render Items ---

    const renderBanner = ({ item }: { item: typeof BANNERS[0] }) => (
        <TouchableOpacity style={styles.bannerContainer} activeOpacity={0.9}>
            <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.bannerContent}>
                <View style={[styles.bannerBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                </View>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
        <TouchableOpacity style={styles.categoryItem} activeOpacity={0.7}>
            <View style={[styles.categoryIconContainer, { backgroundColor: item.color }]}>
                <Text style={styles.categoryIcon}>{item.icon}</Text>
            </View>
            <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderHorizontalStore = ({ item }: { item: typeof STORES[0] }) => (
        <TouchableOpacity
            style={[styles.horizontalStoreCard, { backgroundColor: colors.surface }]}
            onPress={handleMerchantPress}
            activeOpacity={0.8}
        >
            <View style={styles.horizontalImageContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.horizontalStoreImage} />
                {item.promo && (
                    <View style={styles.promoBadge}>
                        <DiscountShape size={scale(12)} color="#FFF" variant="Bold" />
                        <Text style={styles.promoText}>{item.promo}</Text>
                    </View>
                )}
                <View style={styles.timeBadge}>
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>
            </View>
            <View style={styles.horizontalStoreInfo}>
                <Text style={[styles.storeName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <View style={styles.ratingRow}>
                    <Star1 size={scale(12)} color="#FFC107" variant="Bold" />
                    <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
                    <Text style={[styles.dot, { color: colors.textSecondary }]}>•</Text>
                    <Text style={[styles.descText, { color: colors.textSecondary }]} numberOfLines={1}>{item.description}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderVerticalStore = (store: typeof STORES[0]) => (
        <TouchableOpacity
            key={store.id}
            style={[styles.verticalStoreCard, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
            onPress={handleMerchantPress}
            activeOpacity={0.7}
        >
            <Image source={{ uri: store.imageUrl }} style={styles.verticalStoreImage} />
            <View style={styles.verticalStoreContent}>
                <Text style={[styles.storeName, { color: colors.text }]} numberOfLines={1}>{store.name}</Text>
                <Text style={[styles.descText, { color: colors.textSecondary, marginTop: scale(2) }]} numberOfLines={1}>{store.description}</Text>

                <View style={styles.verticalMetaRow}>
                    <View style={styles.metaItem}>
                        <Star1 size={scale(14)} color="#FFC107" variant="Bold" />
                        <Text style={[styles.ratingText, { color: colors.text }]}>{store.rating}</Text>
                    </View>
                    <View style={[styles.metaItem, { marginLeft: scale(12) }]}>
                        <Clock size={scale(14)} color={colors.textSecondary} variant="Linear" />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{store.time}</Text>
                    </View>
                    <View style={[styles.metaItem, { marginLeft: scale(12) }]}>
                        <TruckFast size={scale(14)} color={colors.primary} variant="Bold" />
                        <Text style={[styles.metaText, { color: colors.primary }]}>Free</Text>
                    </View>
                </View>

                {store.promo && (
                    <View style={[styles.smallPromoBadge, { backgroundColor: '#FFF3E0' }]}>
                        <DiscountShape size={scale(12)} color="#F57C00" variant="Bold" />
                        <Text style={[styles.smallPromoText, { color: '#F57C00' }]}>{store.promo}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Custom Header with Location */}
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: colors.surface,
                        paddingTop: insets.top + moderateVerticalScale(8),
                        paddingBottom: moderateVerticalScale(8),
                        paddingHorizontal: horizontalPadding
                    }
                ]}
            >
                <View style={styles.locationRow}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.locationContainer}>
                        <View style={styles.locationLabelRow}>
                            <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Diantar ke</Text>
                            <ArrowDown2 size={scale(12)} color={colors.primary} variant="Linear" />
                        </View>
                        <View style={styles.addressRow}>
                            <Text style={[styles.addressText, { color: colors.text }]} numberOfLines={1}>
                                Rumah (Jl. Mawar No. 12)
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton} onPress={handleFavoritesPress}>
                            <Heart size={scale(24)} color={colors.text} variant="Linear" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                    <SearchNormal size={scale(20)} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Mau makan apa hari ini?"
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + scale(20) }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Categories */}
                <View style={styles.categoryContainer}>
                    <FlatList
                        data={CATEGORIES}
                        renderItem={renderCategory}
                        keyExtractor={item => item.id}
                        numColumns={4}
                        scrollEnabled={false}
                        columnWrapperStyle={styles.categoryColumnWrapper}
                    />
                </View>

                {/* Banners */}
                <View style={styles.bannerSection}>
                    <FlatList
                        data={BANNERS}
                        renderItem={renderBanner}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
                        ItemSeparatorComponent={() => <View style={{ width: scale(12) }} />}
                        snapToInterval={scale(280) + scale(12)}
                        decelerationRate="fast"
                    />
                </View>

                {/* Nearest / Popular (Horizontal) */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginHorizontal: horizontalPadding }]}>Terlaris di Sekitarmu 🌟</Text>
                </View>
                <FlatList
                    data={STORES}
                    renderItem={renderHorizontalStore}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
                    ItemSeparatorComponent={() => <View style={{ width: scale(12) }} />}
                />

                {/* Promo Section (Horizontal) */}
                <View style={[styles.sectionHeader, { marginTop: moderateVerticalScale(24) }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginHorizontal: horizontalPadding }]}>Lagi Ada Promo 🤑</Text>
                </View>
                <FlatList
                    data={[...STORES].reverse()}
                    renderItem={renderHorizontalStore}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
                    ItemSeparatorComponent={() => <View style={{ width: scale(12) }} />}
                />

                {/* All Stores (Vertical) */}
                <View style={[styles.sectionHeader, { marginTop: moderateVerticalScale(24) }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginHorizontal: horizontalPadding }]}>Semua Restoran</Text>
                </View>
                <View style={{ paddingHorizontal: horizontalPadding }}>
                    {STORES.map(store => renderVerticalStore(store))}
                    {STORES.map(store => renderVerticalStore({ ...store, id: `${store.id}-dup` }))}
                </View>

            </ScrollView>
            <TouchableOpacity
                style={[styles.scanButton, { backgroundColor: colors.primary }]}
                onPress={handleScanPress}
            >
                <ScanBarcode size={scale(34)} color={colors.surface} variant="Outline" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomLeftRadius: scale(20),
        borderBottomRightRadius: scale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 10,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateVerticalScale(12),
    },
    backButton: {
        marginRight: scale(12),
    },
    locationContainer: {
        flex: 1,
    },
    locationLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationLabel: {
        fontSize: scale(10),
        fontFamily: FontFamily.monasans.regular,
    },
    addressRow: {
        marginTop: scale(2),
    },
    addressText: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.bold,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: scale(4),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(12),
        borderRadius: scale(12),
        height: scale(44),
    },
    searchInput: {
        flex: 1,
        fontFamily: FontFamily.monasans.regular,
        fontSize: scale(14),
        marginLeft: scale(8),
        paddingVertical: 0,
    },
    scrollContent: {
        paddingTop: moderateVerticalScale(16),
    },
    categoryContainer: {
        paddingHorizontal: getHorizontalPadding(),
        marginBottom: moderateVerticalScale(20),
    },
    categoryColumnWrapper: {
        justifyContent: 'space-between',
        marginBottom: moderateVerticalScale(16),
    },
    categoryItem: {
        alignItems: 'center',
        width: '22%',
    },
    categoryIconContainer: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(16),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    categoryIcon: {
        fontSize: scale(24),
    },
    categoryName: {
        fontSize: scale(11),
        fontFamily: FontFamily.monasans.regular,
        textAlign: 'center',
    },
    bannerSection: {
        marginBottom: moderateVerticalScale(24),
    },
    bannerContainer: {
        width: scale(280),
        height: scale(140),
        borderRadius: scale(16),
        overflow: 'hidden',
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerContent: {
        position: 'absolute',
        bottom: scale(12),
        left: scale(12),
    },
    bannerBadge: {
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(6),
        alignSelf: 'flex-start',
        marginBottom: scale(4),
    },
    bannerTitle: {
        color: '#FFF',
        fontSize: scale(10),
        fontFamily: FontFamily.monasans.bold,
    },
    bannerSubtitle: {
        color: '#FFF',
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.bold,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    sectionHeader: {
        marginBottom: moderateVerticalScale(12),
    },
    sectionTitle: {
        fontSize: scale(18),
        fontFamily: FontFamily.monasans.bold,
    },
    horizontalStoreCard: {
        width: scale(200),
        borderRadius: scale(12),
        overflow: 'hidden',
        paddingBottom: scale(12),
    },
    horizontalImageContainer: {
        width: '100%',
        height: scale(110),
        position: 'relative',
    },
    horizontalStoreImage: {
        width: '100%',
        height: '100%',
        borderRadius: scale(12),
    },
    promoBadge: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#F44336',
        borderBottomRightRadius: scale(12),
        borderTopLeftRadius: scale(12),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
    },
    promoText: {
        color: '#FFF',
        fontSize: scale(10),
        fontFamily: FontFamily.monasans.bold,
        marginLeft: scale(4),
    },
    timeBadge: {
        position: 'absolute',
        bottom: scale(8),
        right: scale(8),
        backgroundColor: '#FFF',
        borderRadius: scale(12),
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    timeText: {
        fontSize: scale(10),
        fontFamily: FontFamily.monasans.bold,
    },
    horizontalStoreInfo: {
        paddingTop: scale(8),
        paddingHorizontal: scale(4),
    },
    storeName: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: scale(4),
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: scale(11),
        fontFamily: FontFamily.monasans.bold,
        marginLeft: scale(4),
    },
    dot: {
        fontSize: scale(11),
        marginHorizontal: scale(4),
    },
    descText: {
        fontSize: scale(11),
        fontFamily: FontFamily.monasans.regular,
        flex: 1,
    },
    verticalStoreCard: {
        flexDirection: 'row',
        paddingVertical: moderateVerticalScale(16),
        borderBottomWidth: 1,
    },
    verticalStoreImage: {
        width: scale(100),
        height: scale(100),
        borderRadius: scale(12),
    },
    verticalStoreContent: {
        flex: 1,
        marginLeft: scale(12),
        justifyContent: 'center',
    },
    verticalMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: scale(8),
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: scale(11),
        fontFamily: FontFamily.monasans.regular,
        marginLeft: scale(4),
    },
    smallPromoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: scale(8),
        paddingHorizontal: scale(6),
        paddingVertical: scale(2),
        borderRadius: scale(4),
        alignSelf: 'flex-start',
    },
    smallPromoText: {
        fontSize: scale(10),
        fontFamily: FontFamily.monasans.semiBold,
        marginLeft: scale(4),
    },
    scanButton: {
        position: 'absolute',
        bottom: moderateVerticalScale(54),
        alignSelf: 'center',
        width: scale(80),
        height: scale(55),
        borderRadius: scale(2000),
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
});

export default FnBScreen;
