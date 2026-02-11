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
      <Image
        source={{ uri: facility.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {facility.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: facility.isOpen ? colors.success + '20' : colors.error + '20',
              },
            ]}
          >
            <Text
              style={[styles.statusText, { color: facility.isOpen ? colors.success : colors.error }]}
            >
              {facility.isOpen
                ? t('marketplace.storeOpen') || t('sportCenter.open')
                : t('marketplace.storeClosed') || t('sportCenter.closed')}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Location size={scale(14)} color={colors.textSecondary} variant="Linear" />
          <Text style={[styles.location, { color: colors.textSecondary }]}>
            {facility.distance}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <Star1 size={scale(14)} color={colors.warning} variant="Bold" />
            <Text style={[styles.rating, { color: colors.textSecondary }]}>
              {facility.rating.toFixed(1)}
            </Text>
          </View>
          {facility.pricePerSlot && (
            <Text style={[styles.price, { color: colors.primary }]}>
              Rp {facility.pricePerSlot.toLocaleString('id-ID')}/slot
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.visitButton, { borderColor: colors.primary }]}
        onPress={() => onPress(facility)}
      >
        <Text style={[styles.visitText, { color: colors.primary }]}>
          {t('sportCenter.book')}
        </Text>
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
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(4),
    gap: scale(8),
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(8),
  },
  statusText: {
    fontSize: getResponsiveFontSize('xsmall'),
    fontFamily: FontFamily.monasans.medium,
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
  price: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
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
