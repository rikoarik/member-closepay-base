/**
 * VenueTerdekatCard Component
 * Vertical card for Venue Terdekat section - Image top, Name and Price bottom (Ayo style)
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { scale, getResponsiveFontSize, FontFamily } from '@core/config';
import type { SportCenterFacility } from '../../models';

interface VenueTerdekatCardProps {
  facility: SportCenterFacility;
  onPress: (facility: SportCenterFacility) => void;
}

export const VenueTerdekatCard: React.FC<VenueTerdekatCardProps> = ({ facility, onPress }) => {
  const { colors } = useTheme();

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
      activeOpacity={0.7}
    >
      {facility.imageUrl ? (
        <Image
          source={{ uri: facility.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.border }]} />
      )}
      <View style={styles.cardContent}>
        <Text style={[styles.cardLabel, { color: colors.text }]} numberOfLines={2}>
          {facility.name}
        </Text>
        {facility.pricePerSlot != null && (
          <Text style={[styles.cardPrice, { color: colors.primary }]}>
            Rp {facility.pricePerSlot.toLocaleString('id-ID')}/slot
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: scale(140),
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: scale(12),
  },
  cardImage: {
    width: '100%',
    height: scale(80),
  },
  cardImagePlaceholder: {
    width: '100%',
    height: scale(80),
  },
  cardContent: {
    padding: scale(8),
  },
  cardLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily?.monasans?.semiBold ?? 'System',
    marginBottom: scale(4),
  },
  cardPrice: {
    fontSize: getResponsiveFontSize('xsmall'),
    fontFamily: FontFamily?.monasans?.semiBold ?? 'System',
  },
});
