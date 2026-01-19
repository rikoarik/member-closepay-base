/**
 * FnBFavoritesScreen Component
 * Displays list of favorite FnB products
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
import { ArrowLeft2, Heart, Trash } from 'iconsax-react-nativejs';
import {
    scale,
    moderateVerticalScale,
    getHorizontalPadding,
    FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useFnBFavorites } from '../../hooks';

const formatPrice = (price: number): string => {
    return `Rp ${price.toLocaleString('id-ID')}`;
};

export const FnBFavoritesScreen: React.FC = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const horizontalPadding = getHorizontalPadding();

    const { favoriteItems, removeFavorite, clearFavorites, favoritesCount } = useFnBFavorites();

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleRemove = useCallback(
        (itemId: string) => {
            removeFavorite(itemId);
        },
        [removeFavorite]
    );

    const renderItem = useCallback(
        ({ item }: { item: typeof favoriteItems[0] }) => (
            <View style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: colors.primaryLight }]}>
                            <Text style={styles.placeholderEmoji}>🍽️</Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={[styles.itemPrice, { color: colors.primary }]}>
                        {formatPrice(item.price)}
                    </Text>
                    {item.rating && (
                        <View style={styles.ratingRow}>
                            <Text style={styles.starIcon}>⭐</Text>
                            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                                {item.rating.toFixed(1)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Remove Button */}
                <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: colors.error + '15' }]}
                    onPress={() => handleRemove(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Heart size={scale(20)} color={colors.error} variant="Bold" />
                </TouchableOpacity>
            </View>
        ),
        [colors, handleRemove]
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Heart size={scale(64)} color={colors.textSecondary} variant="Linear" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('fnb.noFavorites') || 'Belum Ada Favorit'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t('fnb.noFavoritesDesc') || 'Tambahkan menu favorit kamu dengan menekan ikon hati'}
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
                            {t('fnb.favorites') || 'Menu Favorit'}
                        </Text>
                        {favoritesCount > 0 && (
                            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                                <Text style={[styles.countText, { color: colors.surface }]}>
                                    {favoritesCount}
                                </Text>
                            </View>
                        )}
                    </View>

                    {favoritesCount > 0 && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={clearFavorites}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Trash size={scale(22)} color={colors.error} variant="Linear" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Favorites List */}
            <FlatList
                data={favoriteItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: insets.bottom + moderateVerticalScale(20),
                    },
                    favoriteItems.length === 0 && styles.emptyListContent,
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
            />
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
        fontSize: scale(15),
        fontFamily: FontFamily.monasans.semiBold,
        marginBottom: scale(4),
    },
    itemPrice: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: scale(4),
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        fontSize: scale(12),
        marginRight: scale(4),
    },
    ratingText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.medium,
    },
    removeButton: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
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
});

export default FnBFavoritesScreen;
