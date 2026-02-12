/**
 * FacilityCard Component
 * Card untuk menampilkan fasilitas sport center (mirip StoreCard)
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { scale, moderateVerticalScale, FontFamily, getResponsiveFontSize } from '@core/config';
import { Location, Star1 } from 'iconsax-react-nativejs';
import type { SportCenterFacility } from '../../models';

interface FacilityCardProps {
  facility: SportCenterFacility;
  onPress: (facility: SportCenterFacility) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onPress }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onPress(facility)}
      activeOpacity={0.7}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: facility.imageUrl }} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
            {(facility.sportType
              ? t(`sportCenter.${facility.sportType}`)
              : facility.category
            ).toUpperCase()}
          </Text>
          <View style={styles.dotSeparator} />
          <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
            {facility.distance || 'Kebayoran'}
          </Text>
        </View>

        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {facility.name}
        </Text>

        <View style={styles.footerRow}>
          <Text style={[styles.price, { color: colors.primary }]}>
            Rp {facility.pricePerSlot?.toLocaleString('id-ID') || '200.000'}
          </Text>
          <View style={styles.ratingRowSmall}>
            <Star1 size={scale(12)} color="#F59E0B" variant="Bold" />
            <Text style={[styles.ratingSmall, { color: colors.text }]}>
              {facility.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: scale(12),
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageWrapper: {
    marginRight: scale(16),
  },
  image: {
    width: scale(96),
    height: scale(96),
    borderRadius: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 0.5,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  locationLabel: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.medium,
  },
  name: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  ratingRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingSmall: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
  },
});
