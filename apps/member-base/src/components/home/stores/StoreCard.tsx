import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Location } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getResponsiveFontSize,
  FontFamily,
  getHorizontalPadding,
  useDimensions,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

export interface Store {
  id: string;
  name: string;
  imageUrl?: string;
  rating?: number;
  distance?: number;
  address?: string;
  category?: string;
  isOpen?: boolean;
}

interface StoreCardProps {
  store: Store;
  onPress?: (store: Store) => void;
  /** Optional width untuk horizontal scroll (compact) */
  width?: number;
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/80x80/CCCCCC/FFFFFF?text=Store';

const StoreCardComponent: React.FC<StoreCardProps> = ({ store, onPress, width }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth } = useDimensions();
  const horizontalPadding = getHorizontalPadding();

  const cardWidth = width ?? screenWidth - horizontalPadding * 2;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: cardWidth,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress?.(store)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: store.imageUrl || PLACEHOLDER_IMAGE }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {store.name}
          </Text>
          {store.isOpen !== undefined && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: store.isOpen ? colors.successLight : colors.errorLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: store.isOpen ? colors.success : colors.error,
                  },
                ]}
              >
                {store.isOpen ? t('marketplace.storeOpen') || 'Buka' : t('marketplace.storeClosed') || 'Tutup'}
              </Text>
            </View>
          )}
        </View>

        {store.category && (
          <Text style={[styles.category, { color: colors.textSecondary }]} numberOfLines={1}>
            {store.category}
          </Text>
        )}

        <View style={styles.footer}>
          {store.rating !== undefined && (
            <View style={styles.ratingContainer}>
              <Text style={[styles.starIcon, { color: colors.warning }]}>★</Text>
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {store.rating.toFixed(1)}
              </Text>
            </View>
          )}
          {store.distance !== undefined && (
            <View style={styles.distanceContainer}>
              <Location size={scale(14)} color={colors.textSecondary} variant="Linear" />
              <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
                {store.distance.toFixed(1)} {t('marketplace.distanceUnit') || 'km'}
              </Text>
            </View>
          )}
        </View>

        {store.address && (
          <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
            {store.address}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const StoreCard = React.memo(StoreCardComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
  },
  image: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(8),
    marginRight: scale(12),
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(4),
  },
  name: {
    flex: 1,
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginRight: scale(8),
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(4),
  },
  statusText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  category: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(4),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginBottom: moderateVerticalScale(4),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  starIcon: {
    fontSize: getResponsiveFontSize('small'),
  },
  ratingText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  distanceText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  address: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
});
