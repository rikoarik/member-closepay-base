/**
 * VenueTerdekatCard Component
 * Vertical card for Venue Terdekat section - Image top, Name and Price bottom (Ayo style)
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { scale, getResponsiveFontSize, FontFamily, SvgLinearGradientView } from '@core/config';
import { Star1, Heart } from 'iconsax-react-nativejs';
import type { SportCenterFacility } from '../../models';

interface VenueTerdekatCardProps {
  facility: SportCenterFacility;
  onPress: (facility: SportCenterFacility) => void;
}

export const VenueTerdekatCard: React.FC<VenueTerdekatCardProps> = ({ facility, onPress }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress(facility)}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        {facility.imageUrl ? (
          <Image source={{ uri: facility.imageUrl }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.border }]} />
        )}

        <View style={styles.ratingBadgeNew}>
          <Star1 size={scale(12)} color="#F59E0B" variant="Bold" />
          <Text style={styles.ratingTextNew}>{facility.rating.toFixed(1)}</Text>
        </View>

        <View style={[styles.distanceBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.distanceText}>{facility.distance || '1.2 km'}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.venueTitle, { color: colors.text }]} numberOfLines={1}>
          {facility.name}
        </Text>

        <View style={styles.cardFooter}>
          <View>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              {t('sportCenter.startingFrom')}
            </Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>
              Rp {facility.pricePerSlot?.toLocaleString('id-ID') || '150.000'}
              <Text style={styles.priceUnit}>/hr</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bookmarkBtn, { backgroundColor: colors.primary + '15' }]}
          >
            <Heart size={scale(18)} color={colors.primary} variant="Linear" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: scale(260),
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: scale(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
  },
  imageWrapper: {
    height: scale(144),
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  ratingBadgeNew: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: 8,
    gap: scale(4),
  },
  ratingTextNew: {
    color: '#000',
    fontSize: scale(10),
    fontFamily: FontFamily?.monasans?.bold ?? 'System',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: scale(8),
    left: scale(8),
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: 8,
  },
  distanceText: {
    color: '#FFF',
    fontSize: scale(10),
    fontFamily: FontFamily?.monasans?.bold ?? 'System',
  },
  cardContent: {
    padding: scale(12),
  },
  venueTitle: {
    fontSize: scale(14),
    fontFamily: FontFamily?.monasans?.bold ?? 'System',
    marginBottom: scale(8),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: scale(10),
    fontFamily: FontFamily?.monasans?.regular ?? 'System',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: scale(14),
    fontFamily: FontFamily?.monasans?.bold ?? 'System',
  },
  priceUnit: {
    fontSize: scale(10),
    fontFamily: FontFamily?.monasans?.regular ?? 'System',
    color: '#94A3B8',
  },
  bookmarkBtn: {
    padding: scale(8),
    borderRadius: 10,
  },
});
