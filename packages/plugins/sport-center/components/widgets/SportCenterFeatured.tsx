/**
 * SportCenterFeatured - Widget Sport Center di Beranda
 * Menampilkan fasilitas terdekat (horizontal scroll)
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { Star1, Location } from 'iconsax-react-nativejs';
import {
  getResponsiveFontSize,
  FontFamily,
  moderateVerticalScale,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';
import { getNearbyFacilities } from '@plugins/sport-center';

interface SportCenterFeaturedProps {
  isActive?: boolean;
  isVisible?: boolean;
}

export const SportCenterFeatured: React.FC<SportCenterFeaturedProps> = React.memo(
  ({ isActive = true, isVisible = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();

    const nearbyFacilities = useMemo(() => getNearbyFacilities(3), []);

    const handleFacilityPress = (facilityId: string) => {
      navigation.navigate('SportCenterFacilityDetail' as never, { facilityId });
    };

    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('sportCenter.title')}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SportCenter' as never)}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              {t('common.viewAll')}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {nearbyFacilities.map((facility) => (
            <TouchableOpacity
              key={facility.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleFacilityPress(facility.id)}
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
              <Text style={[styles.cardLabel, { color: colors.text }]} numberOfLines={2}>
                {facility.name}
              </Text>
              <View style={styles.cardMeta}>
                <Star1 size={scale(12)} color={colors.warning} variant="Bold" />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {facility.rating.toFixed(1)}
                </Text>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  • {facility.distance}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }
);

SportCenterFeatured.displayName = 'SportCenterFeatured';

const styles = StyleSheet.create({
  section: {
    marginBottom: moderateVerticalScale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  seeAll: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  list: {
    gap: scale(12),
  },
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
  cardLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    padding: scale(8),
    paddingBottom: scale(4),
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: scale(8),
    paddingBottom: scale(8),
  },
  metaText: {
    fontSize: getResponsiveFontSize('xsmall'),
    fontFamily: FontFamily.monasans.regular,
  },
});
