import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { scale, moderateVerticalScale, FontFamily, getResponsiveFontSize } from '@core/config';
import { Location, Star1 } from 'iconsax-react-nativejs';
import type { Store } from '../../hooks/useMarketplaceData';

interface StoreCardProps {
    store: Store;
    onPress: (store: Store) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onPress }) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onPress(store)}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: store.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.content}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {store.name}
                </Text>

                <View style={styles.row}>
                    <Location size={scale(14)} color={colors.textSecondary} variant="Linear" />
                    <Text style={[styles.location, { color: colors.textSecondary }]}>
                        {store.location}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.ratingContainer}>
                        <Star1 size={scale(14)} color={colors.warning} variant="Bold" />
                        <Text style={[styles.rating, { color: colors.textSecondary }]}>
                            {store.rating.toFixed(1)}
                        </Text>
                    </View>
                    <Text style={[styles.followers, { color: colors.textSecondary }]}>
                        {store.followers.toLocaleString()} Pengikut
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.visitButton, { borderColor: colors.primary }]}
                onPress={() => onPress(store)}
            >
                <Text style={[styles.visitText, { color: colors.primary }]}>Kunjungi</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(12),
        borderRadius: scale(12),
        borderWidth: 1,
        marginBottom: moderateVerticalScale(12),
    },
    image: {
        width: scale(60),
        height: scale(60),
        borderRadius: scale(30),
        marginRight: scale(12),
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: getResponsiveFontSize('medium'),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: scale(4),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(4),
        gap: scale(4),
    },
    location: {
        fontSize: getResponsiveFontSize('small'),
        fontFamily: FontFamily.monasans.regular,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
    },
    rating: {
        fontSize: getResponsiveFontSize('small'),
        fontFamily: FontFamily.monasans.medium,
    },
    followers: {
        fontSize: getResponsiveFontSize('small'),
        fontFamily: FontFamily.monasans.regular,
    },
    visitButton: {
        paddingHorizontal: scale(16),
        paddingVertical: moderateVerticalScale(6),
        borderRadius: scale(16),
        borderWidth: 1,
    },
    visitText: {
        fontSize: getResponsiveFontSize('small'),
        fontFamily: FontFamily.monasans.medium,
    },
});
