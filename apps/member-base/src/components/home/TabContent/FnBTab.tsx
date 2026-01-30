/**
 * FnBTab Component
 * Main FnB marketplace screen in HomeScreen
 * Shows store grid with search/filter header and QR scan
 */

import React, { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Text, TouchableOpacity, TextInput, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Shop, Star1, Location, Clock, SearchNormal, CloseCircle, ScanBarcode } from 'iconsax-react-nativejs';
import {
    scale,
    moderateVerticalScale,
    getHorizontalPadding,
    FontFamily,
    useDimensions,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { QrScanIcon } from '@core/config/components/icons';

interface FnBTabProps {
    isActive: boolean;
    isVisible: boolean;
    scrollEnabled?: boolean;
}

// Store data interface
interface FnBStoreItem {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    rating: number;
    distance: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    category: string;
}

// Filter options
type StoreFilter = 'all' | 'food' | 'drink' | 'open' | 'rating';

// Skeleton Loading Component with Shimmer Animation
const StoreCardSkeleton: React.FC = () => {
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
        <Animated.View style={[
            styles.storeCard,
            {
                backgroundColor: colors.surface,
                opacity: shimmerOpacity,
                marginBottom: scale(8),
            }
        ]}>
            {/* Store Icon Skeleton */}
            <View style={[styles.storeIconContainer, { backgroundColor: colors.border }]}>
                <Animated.View style={[styles.skeletonIcon, { backgroundColor: colors.primaryLight, opacity: shimmerOpacity }]} />
            </View>

            {/* Store Info Skeleton */}
            <View style={[styles.storeInfo, styles.listStoreInfo]}>
                {/* Header Row: Name + Badge */}
                <View style={styles.storeHeader}>
                    <Animated.View style={[{
                        height: scale(16),
                        width: '60%',
                        backgroundColor: colors.border,
                        borderRadius: scale(4),
                        opacity: shimmerOpacity
                    }]} />
                    <Animated.View style={[{
                        height: scale(18),
                        width: scale(40),
                        backgroundColor: colors.border,
                        borderRadius: scale(4),
                        opacity: shimmerOpacity
                    }]} />
                </View>

                {/* Description */}
                <Animated.View style={[{
                    height: scale(12),
                    width: '80%',
                    backgroundColor: colors.border,
                    borderRadius: scale(4),
                    marginTop: scale(6),
                    opacity: shimmerOpacity
                }]} />

                {/* Meta Row */}
                <View style={[styles.storeMetaRow, { marginTop: scale(8) }]}>
                    <Animated.View style={[{
                        height: scale(12),
                        width: scale(35),
                        backgroundColor: colors.border,
                        borderRadius: scale(4),
                        marginRight: scale(12),
                        opacity: shimmerOpacity
                    }]} />
                    <Animated.View style={[{
                        height: scale(12),
                        width: scale(45),
                        backgroundColor: colors.border,
                        borderRadius: scale(4),
                        marginRight: scale(12),
                        opacity: shimmerOpacity
                    }]} />
                    <Animated.View style={[{
                        height: scale(12),
                        width: scale(70),
                        backgroundColor: colors.border,
                        borderRadius: scale(4),
                        opacity: shimmerOpacity
                    }]} />
                </View>
            </View>
        </Animated.View>
    );
};

const MOCK_STORES: FnBStoreItem[] = [
    {
        id: 'store-001',
        name: 'Warung Makan Sederhana',
        description: 'Makanan rumahan autentik',
        rating: 4.8,
        distance: '0.5 km',
        isOpen: true,
        openTime: '08:00',
        closeTime: '22:00',
        category: 'Makanan',
    },
    {
        id: 'store-002',
        name: 'Kedai Kopi Nusantara',
        description: 'Kopi lokal berkualitas',
        rating: 4.6,
        distance: '0.8 km',
        isOpen: true,
        openTime: '07:00',
        closeTime: '23:00',
        category: 'Minuman',
    },
    {
        id: 'store-003',
        name: 'Bakso Pak Kumis',
        description: 'Bakso dan mie ayam legendaris',
        rating: 4.9,
        distance: '1.2 km',
        isOpen: false,
        openTime: '10:00',
        closeTime: '21:00',
        category: 'Makanan',
    },
    {
        id: 'store-004',
        name: 'Sate Klathak Bu Muri',
        description: 'Sate kambing asli Jogja',
        rating: 4.7,
        distance: '1.5 km',
        isOpen: true,
        openTime: '16:00',
        closeTime: '22:00',
        category: 'Makanan',
    },
    {
        id: 'store-005',
        name: 'Es Teler 77',
        description: 'Minuman segar khas Indonesia',
        rating: 4.5,
        distance: '2.0 km',
        isOpen: true,
        openTime: '10:00',
        closeTime: '21:00',
        category: 'Minuman',
    },
];

export const FnBTab: React.FC<FnBTabProps> = ({ isActive, isVisible, scrollEnabled = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { width: screenWidth } = useDimensions();
    const horizontalPadding = getHorizontalPadding();
    const insets = useSafeAreaInsets();

    // Cache untuk mencegah refetch saat tab switch
    const dataCache = useRef<{ stores: FnBStoreItem[]; timestamp: number } | null>(null);
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Local state
    const [stores, setStores] = useState<FnBStoreItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<StoreFilter>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const loadStores = useCallback(async (forceRefresh = false) => {
        // Check cache first (unless force refresh)
        if (!forceRefresh && dataCache.current) {
            const now = Date.now();
            const isCacheValid = (now - dataCache.current.timestamp) < CACHE_DURATION;

            if (isCacheValid && dataCache.current.stores.length > 0) {
                setStores(dataCache.current.stores);
                setIsInitialLoad(false);
                return;
            }
        }

        // Don't reload if already have data and not forcing refresh
        if (!forceRefresh && stores.length > 0) return;

        setIsInitialLoad(true);
        try {
            // Simulate API call with realistic delay
            await new Promise<void>((resolve) => setTimeout(() => resolve(), forceRefresh ? 800 : 1200));

            // Update cache
            dataCache.current = {
                stores: MOCK_STORES,
                timestamp: Date.now()
            };

            setStores(MOCK_STORES);
        } catch (error) {
            // Handle error - could show error state
            console.error('Failed to load stores:', error);
        } finally {
            setIsInitialLoad(false);
        }
    }, [stores.length]);

    // Load data when tab becomes active
    useEffect(() => {
        if (isActive) {
            loadStores();
        } else if (isVisible) {
            // Pre-load data when tab is visible but not active (for smoother switching)
            // Only if we don't have cached data
            if (!dataCache.current || dataCache.current.stores.length === 0) {
                loadStores();
            }
        }
    }, [isActive, isVisible, loadStores]);

    // Show loading state based on visibility and data availability
    const shouldShowLoading = isVisible && (isInitialLoad || stores.length === 0);

    // Filtered stores based on search and filter
    const filteredStores = useMemo(() => {
        if (shouldShowLoading || stores.length === 0) return [];

        return stores.filter((store) => {
            const matchesSearch = searchQuery === '' ||
                store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                store.description.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesFilter = true;
            switch (activeFilter) {
                case 'food':
                    matchesFilter = store.category === 'Makanan';
                    break;
                case 'drink':
                    matchesFilter = store.category === 'Minuman';
                    break;
                case 'open':
                    matchesFilter = store.isOpen;
                    break;
                case 'rating':
                    matchesFilter = store.rating >= 4.5;
                    break;
                default:
                    matchesFilter = true;
            }

            return matchesSearch && matchesFilter;
        });
    }, [stores, searchQuery, activeFilter, shouldShowLoading]);

    const handleStorePress = useCallback((store: FnBStoreItem) => {
        // Navigate to FnB store menu screen
        // @ts-ignore
        navigation.navigate('FnBMerchantDetail', { storeId: store.id, storeName: store.name, entryPoint: 'browse' });
    }, [navigation]);

    const handleScanPress = useCallback(() => {
        // Navigate to dedicated FnB scan screen
        // @ts-ignore
        navigation.navigate('FnBScan');
    }, [navigation]);

    const handleFilterPress = useCallback((filter: StoreFilter) => {
        setActiveFilter(filter);
        setShowFilters(false);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    const renderStoreCard = useCallback(
        ({ item }: { item: FnBStoreItem }) => (
            <TouchableOpacity
                style={[
                    styles.storeCard,
                    { backgroundColor: colors.surface }
                ]}
                onPress={() => handleStorePress(item)}
                activeOpacity={0.8}
            >
                <View style={[styles.storeIconContainer, { backgroundColor: colors.primaryLight }]}>
                    <Shop size={scale(28)} color={colors.primary} variant="Bold" />
                </View>

                <View style={[styles.storeInfo, styles.listStoreInfo]}>
                    <View style={styles.storeHeader}>
                        <Text style={[styles.listStoreName, { color: colors.text }]} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: item.isOpen ? colors.success : colors.error },
                            ]}
                        >
                            <Text style={[styles.statusText, { color: colors.surface }]}>
                                {item.isOpen ? 'Buka' : 'Tutup'}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.storeDescription, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.description}
                    </Text>

                    <View style={styles.storeMetaRow}>
                        <View style={styles.metaItem}>
                            <Star1 size={scale(12)} color="#FFB800" variant="Bold" />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                {item.rating.toFixed(1)}
                            </Text>
                        </View>

                        <View style={styles.metaItem}>
                            <Location size={scale(12)} color={colors.textSecondary} variant="Linear" />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                {item.distance}
                            </Text>
                        </View>

                        <View style={styles.metaItem}>
                            <Clock size={scale(12)} color={colors.textSecondary} variant="Linear" />
                            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                {item.openTime} - {item.closeTime}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        ),
        [colors, handleStorePress]
    );

    if (!isVisible) {
        return null;
    }

    const filterOptions: { key: StoreFilter; label: string }[] = [
        { key: 'all', label: 'Semua' },
        { key: 'food', label: 'Makanan' },
        { key: 'drink', label: 'Minuman' },
        { key: 'open', label: 'Buka' },
        { key: 'rating', label: 'Rating Tinggi' },
    ];

    return (
        <View style={[styles.container, { width: screenWidth }]}>
            {/* Fixed Header */}
            <View
                style={[
                    styles.fixedHeader,
                    {
                        paddingTop: scale(10),
                        paddingHorizontal: horizontalPadding,
                    },
                ]}
            >
                {/* Title Row */}
                {/* <View style={styles.titleRow}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        {t('fnb.title') || 'Pesan Makanan'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.viewToggleButton, { backgroundColor: colors.primary }]}
                        onPress={toggleViewMode}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        {viewMode === 'grid' ? (
                            <Element3 size={scale(18)} color={colors.surface} variant="Bold" />
                        ) : (
                            <HamburgerMenu size={scale(18)} color={colors.surface} variant="Bold" />
                        )}
                    </TouchableOpacity>
                </View> */}

                <View style={styles.searchRow}>
                    <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border, flex: 1 }]}>
                        <SearchNormal size={scale(20)} color={colors.textSecondary} variant="Linear" />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder={t('fnb.searchPlaceholder') || 'Cari restoran atau menu...'}
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <CloseCircle size={scale(20)} color={colors.textSecondary} variant="Bold" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[styles.scanButton, { backgroundColor: colors.primary }]}
                        onPress={handleScanPress}
                    >
                        <ScanBarcode size={scale(34)} color={colors.surface} variant="Outline" />
                    </TouchableOpacity>
                </View>

                {/* Filter Row */}
                <View style={styles.filterRow}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScrollContent}
                        nestedScrollEnabled={true}
                        bounces={true}
                    >
                        {filterOptions.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.filterChip,
                                    {
                                        backgroundColor: activeFilter === option.key ? colors.primary : colors.surface,
                                        borderColor: activeFilter === option.key ? colors.primary : colors.border,
                                    },
                                ]}
                                onPress={() => handleFilterPress(option.key)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        {
                                            color: activeFilter === option.key ? colors.surface : colors.text,
                                        },
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {/* Store List */}
            {shouldShowLoading ? (
                <View style={[styles.listContent, {
                    paddingHorizontal: horizontalPadding,
                    paddingBottom: insets.bottom + scale(20),
                }]}>
                    <StoreCardSkeleton />
                    <StoreCardSkeleton />
                    <StoreCardSkeleton />
                    <StoreCardSkeleton />
                    <StoreCardSkeleton />
                </View>
            ) : (
                <FlatList
                    data={filteredStores}
                    renderItem={renderStoreCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent,
                        {
                            paddingHorizontal: horizontalPadding,
                            paddingTop: moderateVerticalScale(16),
                            paddingBottom: insets.bottom + scale(20),
                        },
                    ]}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={scrollEnabled}
                    nestedScrollEnabled={false}
                    scrollEventThrottle={16}
                    bounces={true}
                    alwaysBounceVertical={true}
                    ItemSeparatorComponent={() => <View style={{ height: scale(8) }} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {searchQuery || activeFilter !== 'all'
                                    ? 'Tidak ada toko yang sesuai filter'
                                    : 'Tidak ada toko ditemukan'
                                }
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fixedHeader: {
        paddingBottom: moderateVerticalScale(12),
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: scale(12),
    },
    headerTitle: {
        fontSize: scale(18),
        fontFamily: FontFamily.monasans.bold,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    viewToggleButton: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(10),
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButton: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleIcon: {
        fontSize: scale(16),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        marginBottom: scale(12),
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(14),
        borderRadius: scale(14),
        borderWidth: 1.5,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
        marginLeft: scale(10),
        marginRight: scale(10),
        paddingVertical: 0,
    },
    filterRow: {
        marginBottom: scale(4),
    },
    filterScrollContent: {
        paddingRight: scale(16),
        gap: scale(8),
    },
    filterChip: {
        paddingHorizontal: scale(14),
        paddingVertical: scale(6),
        borderRadius: scale(20),
        borderWidth: 1,
    },
    filterChipText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.semiBold,
    },
    listContent: {
        paddingTop: moderateVerticalScale(4),
        flexGrow: 1,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        gap: scale(8),
    },
    storeCard: {
        padding: scale(12),
        borderRadius: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        flexDirection: 'row',
    },
    storeIconContainer: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    storeInfo: {
        alignItems: 'flex-start',
    },
    listStoreInfo: {
        alignItems: 'flex-start',
        flex: 1,
        marginLeft: scale(12),
    },
    storeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: scale(4),
        width: '100%',
    },
    storeName: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.semiBold,
        textAlign: 'center',
        marginBottom: scale(2),
    },
    listStoreName: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.semiBold,
        textAlign: 'left',
        marginBottom: scale(4),
    },
    statusBadge: {
        paddingHorizontal: scale(8),
        paddingVertical: scale(3),
        borderRadius: scale(4),
    },
    statusText: {
        fontSize: scale(10),
        fontFamily: FontFamily.monasans.semiBold,
    },
    storeDescription: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.regular,
        marginBottom: scale(6),
    },
    storeMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    gridStoreMetaRow: {
        justifyContent: 'center',
        marginTop: scale(4),
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: scale(12),
    },
    metaText: {
        fontSize: scale(11),
        fontFamily: FontFamily.monasans.regular,
        marginLeft: scale(4),
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
        textAlign: 'center',
    },
    skeletonIcon: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(8),
    },
    skeletonText: {
        borderRadius: scale(4),
    },
    skeletonName: {
        height: scale(14),
        width: '70%',
        marginBottom: scale(2),
    },
    skeletonDesc: {
        height: scale(12),
        width: '90%',
        marginBottom: scale(6),
    },
    skeletonMeta: {
        height: scale(10),
        width: scale(40),
        marginRight: scale(12),
    },
    skeletonBadge: {
        height: scale(16),
        width: scale(40),
        borderRadius: scale(8),
    },
});

export default FnBTab;
