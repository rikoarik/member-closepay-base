/**
 * SportCenterFacilityDetailScreen Component
 * Detail fasilitas dengan image carousel, Tab switcher (Informasi/Jadwal), facility icons (Ayo style)
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft2, Location, Star1, Clock, Car, Buildings2, Home2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  getMinTouchTarget,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { TabSwitcher } from '@core/config';
import { getFacilityById } from '../../hooks';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - getHorizontalPadding() * 2;

const AMENITY_ICON_MAP = {
  toilet: Home2,
  parkir: Car,
  musholla: Buildings2,
};

export const SportCenterFacilityDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const paddingH = getHorizontalPadding();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'informasi' | 'jadwal'>('informasi');

  const params = route.params as { facilityId?: string } | undefined;
  const facilityId = params?.facilityId;

  const facility = useMemo(() => {
    if (!facilityId) return null;
    return getFacilityById(facilityId);
  }, [facilityId]);

  const images = useMemo(() => {
    if (!facility) return [];
    if (facility.images && facility.images.length > 0) return facility.images;
    if (facility.imageUrl) return [facility.imageUrl];
    return [];
  }, [facility]);

  const handleBookingPress = () => {
    if (facility) {
      // @ts-ignore
      navigation.navigate('SportCenterBooking', {
        facilityId: facility.id,
        facilityName: facility.name,
        pricePerSlot: facility.pricePerSlot ?? 50000,
        courts: facility.courts ?? [],
      });
    }
  };

  if (!facility) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backPlaceholder}>
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {t('sportCenter.comingSoon')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const tabs = [
    { id: 'informasi', label: t('sportCenter.informasi') },
    { id: 'jadwal', label: t('sportCenter.jadwal') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: paddingH }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {t('sportCenter.facilityDetail')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: paddingH }]}
        showsVerticalScrollIndicator={false}
      >
        {images.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={[styles.carousel, { width: IMAGE_WIDTH + paddingH * 2 }]}
            contentContainerStyle={styles.carouselContent}
          >
            {images.map((uri, index) => (
              <View key={index} style={[styles.carouselItem, { width: IMAGE_WIDTH }]}>
                <Image
                  source={{ uri }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={[styles.facilityName, { color: colors.text }]}>
              {facility.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: facility.isOpen ? colors.success + '20' : colors.error + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: facility.isOpen ? colors.success : colors.error },
                ]}
              >
                {facility.isOpen ? t('sportCenter.open') : t('sportCenter.closed')}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Location size={scale(16)} color={colors.textSecondary} variant="Linear" />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {facility.distance}
              </Text>
            </View>
          </View>

          {facility.amenityIcons && facility.amenityIcons.length > 0 && (
            <View style={styles.amenityRow}>
              {facility.amenityIcons.map((amenity) => {
                const IconComponent = AMENITY_ICON_MAP[amenity.id];
                if (!IconComponent) return null;
                return (
                  <View
                    key={amenity.id}
                    style={[styles.amenityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <IconComponent size={scale(18)} color={colors.primary} variant="Linear" />
                    <Text style={[styles.amenityLabel, { color: colors.textSecondary }]}>
                      {t(amenity.labelKey)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <TabSwitcher
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as 'informasi' | 'jadwal')}
            variant="segmented"
          />

          {activeTab === 'informasi' && (
            <View style={styles.tabContent}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Star1 size={scale(16)} color={colors.warning} variant="Bold" />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {facility.rating.toFixed(1)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={scale(16)} color={colors.textSecondary} variant="Linear" />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {facility.openTime} - {facility.closeTime}
                  </Text>
                </View>
              </View>

              {facility.description && (
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  {facility.description}
                </Text>
              )}

              {facility.address && (
                <View style={styles.addressRow}>
                  <Location size={scale(16)} color={colors.textSecondary} variant="Linear" />
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {facility.address}
                  </Text>
                </View>
              )}

              {facility.pricePerSlot != null && (
                <Text style={[styles.price, { color: colors.primary }]}>
                  Rp {facility.pricePerSlot.toLocaleString('id-ID')} / slot
                </Text>
              )}
            </View>
          )}

          {activeTab === 'jadwal' && (
            <View style={styles.tabContent}>
              <Text style={[styles.jadwalPlaceholder, { color: colors.textSecondary }]}>
                {t('sportCenter.pilihJadwal')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingHorizontal: paddingH,
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.bookingButton,
            {
              backgroundColor: facility.isOpen ? colors.primary : colors.border,
              minHeight: getMinTouchTarget(),
            },
          ]}
          onPress={handleBookingPress}
          disabled={!facility.isOpen}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.bookingButtonText,
              {
                color: facility.isOpen ? colors.surface : colors.textSecondary,
                fontSize: getResponsiveFontSize('medium'),
              },
            ]}
          >
            {t('sportCenter.pilihJadwal')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
    gap: scale(12),
  },
  backButton: { padding: scale(4) },
  backPlaceholder: { padding: scale(12) },
  headerTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
    flex: 1,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: moderateVerticalScale(100),
  },
  carousel: {
    marginHorizontal: -getHorizontalPadding(),
    marginBottom: moderateVerticalScale(16),
  },
  carouselContent: {
    paddingHorizontal: getHorizontalPadding(),
  },
  carouselItem: {
    marginRight: getHorizontalPadding(),
  },
  heroImage: {
    width: '100%',
    height: scale(200),
    borderRadius: 12,
  },
  infoSection: {
    marginBottom: moderateVerticalScale(24),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
    gap: scale(8),
  },
  facilityName: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('large'),
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
  },
  statusText: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('xsmall'),
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(16),
    marginBottom: moderateVerticalScale(12),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  metaText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('small'),
  },
  amenityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: moderateVerticalScale(16),
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(8),
    borderWidth: 1,
    gap: scale(6),
  },
  amenityLabel: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('xsmall'),
  },
  tabContent: {
    marginTop: moderateVerticalScale(16),
  },
  description: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
    marginBottom: moderateVerticalScale(12),
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(8),
    marginBottom: moderateVerticalScale(8),
  },
  addressText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('small'),
    flex: 1,
  },
  price: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
  },
  jadwalPlaceholder: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
  },
  footer: {
    paddingVertical: moderateVerticalScale(16),
    borderTopWidth: 1,
  },
  bookingButton: {
    borderRadius: 12,
    paddingVertical: moderateVerticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingButtonText: {
    fontFamily: fontSemiBold,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
  },
});
