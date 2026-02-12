/**
 * SportCenterFacilityDetailScreen Component
 * Detail fasilitas dengan desain baru (Hero Image, Custom Tabs, Facilities, Sticky Footer)
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
  Platform,
  StatusBar,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import { useRef, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft2,
  Location,
  Star1,
  Send2,
  Heart,
  Gps,
  Wifi,
  Car,
  Drop,
  Sun1,
  Coffee,
  TickCircle,
  Calendar,
  DirectUp,
} from 'iconsax-react-nativejs';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  getMinTouchTarget,
  ScreenHeader,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { getFacilityById } from '../../hooks';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// function to get localized amenities
const getLocalizedAmenities = (t: any) => [
  { id: 'wifi', icon: Wifi, label: t('sportCenter.amenityWifi') },
  { id: 'parking', icon: Car, label: t('sportCenter.amenityParking') },
  { id: 'shower', icon: Drop, label: t('sportCenter.amenityShower') },
  { id: 'ac', icon: Sun1, label: t('sportCenter.amenityAC') },
  { id: 'canteen', icon: Coffee, label: t('sportCenter.amenityCanteen') },
];

export const SportCenterFacilityDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'description' | 'schedule'>('description');
  const tabOffset = useRef(new Animated.Value(0)).current;
  const [tabContainerWidth, setTabContainerWidth] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scheduleY, setScheduleY] = useState(0);

  const handleTabPress = (tab: 'description' | 'schedule') => {
    setActiveTab(tab);
    Animated.timing(tabOffset, {
      toValue: tab === 'description' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (tab === 'schedule' && scheduleY > 0) {
      scrollViewRef.current?.scrollTo({ y: scheduleY, animated: true });
    }
  };

  const params = route.params as { facilityId?: string } | undefined;
  const facilityId = params?.facilityId;

  // --- Schedule Logic State ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]); // Changed to array for multi-select

  const facility = useMemo(() => {
    if (!facilityId) return null;
    return getFacilityById(facilityId);
  }, [facilityId]);

  // Initialize selected court if available
  useEffect(() => {
    if (facility?.courts && facility.courts.length > 0 && !selectedCourtId) {
      setSelectedCourtId(facility.courts[0].id);
    }
  }, [facility, selectedCourtId]);

  const handleBookingPress = () => {
    if (facility) {
      // @ts-ignore
      navigation.navigate('SportCenterBookingCheckout', {
        facilityId: facility.id,
        date: selectedDate.toISOString(),
        slots: selectedSlots, // Pass array of slots
        courtId: selectedCourtId,
      });
    }
  };

  // Generate next 14 days
  const dates = useMemo(() => {
    const result = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      result.push(d);
    }
    return result;
  }, []);

  // Generate time slots based on open/close time
  const timeSlots = useMemo(() => {
    if (!facility) return [];
    const startHour = parseInt(facility.openTime.split(':')[0], 10);
    const endHour = parseInt(facility.closeTime.split(':')[0], 10);
    const slots = [];
    for (let i = startHour; i < endHour; i++) {
      const timeString = `${i.toString().padStart(2, '0')}:00`;
      // Mock availability: Randomly disable some slots for realism
      // purely deterministic based on date + court + time hash for stable usage
      const hash =
        selectedDate.getDate() + (selectedCourtId ? selectedCourtId.charCodeAt(0) : 0) + i;
      const isBooked = hash % 5 === 0;
      slots.push({ time: timeString, price: facility.pricePerSlot, isBooked });
    }
    return slots;
  }, [facility, selectedDate, selectedCourtId]);

  const handleSlotPress = (time: string) => {
    if (selectedSlots.includes(time)) {
      setSelectedSlots(selectedSlots.filter((t) => t !== time));
    } else {
      setSelectedSlots([...selectedSlots, time].sort()); // Keep sorted
    }
  };

  const imageUrl =
    facility?.imageUrl ||
    'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=800&auto=format&fit=crop';

  const MOCK_IMAGES = useMemo(
    () => [
      imageUrl,
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579952318543-7dcad88ca821?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
    ],
    [imageUrl]
  );

  const carouselData = useMemo(() => {
    // [last, ...real, first] for infinite jump
    return [MOCK_IMAGES[MOCK_IMAGES.length - 1], ...MOCK_IMAGES, MOCK_IMAGES[0]];
  }, [MOCK_IMAGES]);

  const [activeIndex, setActiveIndex] = useState(1); // Start at real first item
  const flatListRef = useRef<FlatList>(null);

  // Handle auto centering on start
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
    }, 100);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(contentOffset / viewSize);

    if (index === 0) {
      // Left edge jump
      flatListRef.current?.scrollToIndex({ index: carouselData.length - 2, animated: false });
      setActiveIndex(carouselData.length - 2);
    } else if (index === carouselData.length - 1) {
      // Right edge jump
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
      setActiveIndex(1);
    } else {
      setActiveIndex(index);
    }
  };

  const displayIndex =
    activeIndex === 0
      ? MOCK_IMAGES.length
      : activeIndex === carouselData.length - 1
      ? 1
      : activeIndex;
  const currentPhotoLabel = t('sportCenter.photosCount', {
    current:
      displayIndex === 0
        ? MOCK_IMAGES.length
        : displayIndex > MOCK_IMAGES.length
        ? 1
        : displayIndex,
    total: MOCK_IMAGES.length,
  });

  if (!facility) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader
          title={t('sportCenter.facilityDetail', { defaultValue: 'Detail Fasilitas' })}
          style={{ paddingTop: insets.top }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{ color: colors.textSecondary, fontFamily: fontSemiBold, fontSize: scale(14) }}
          >
            {t('sportCenter.facilityNotFound')}
          </Text>
        </View>
      </View>
    );
  }

  // Calculate Total Price
  const totalSlots = selectedSlots.length;
  const startPrice = facility.pricePerSlot || 150000;
  const totalPrice = totalSlots > 0 ? startPrice * totalSlots : startPrice;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Standard Screen Header */}
      <ScreenHeader
        title={facility.name}
        style={{ paddingTop: insets.top }}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => {
                /* share logic */
              }}
            >
              <Send2 size={scale(20)} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                /* favorite logic */
              }}
            >
              <Heart size={scale(20)} color={colors.text} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: moderateVerticalScale(100) }}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <FlatList
            ref={flatListRef}
            data={carouselData}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `img-${index}`}
            onMomentumScrollEnd={handleScroll}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.heroImage} resizeMode="cover" />
            )}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />

          {/* Image Pagination Indicator */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{currentPhotoLabel}</Text>
          </View>
        </View>

        {/* Content Area */}
        <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
          {/* Main Info */}
          <View style={styles.mainInfoSection}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]}>{facility.name}</Text>
              <View style={[styles.ratingBadge, { backgroundColor: colors.primary + '20' }]}>
                <Star1 size={scale(14)} color={colors.primary} variant="Bold" />
                <Text style={[styles.ratingText, { color: colors.primary }]}>
                  {facility.rating.toFixed(1)}
                </Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <View style={{ marginTop: 2 }}>
                <Location size={scale(20)} color={colors.textSecondary} variant="Bold" />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                  {facility.address || 'Jl. Gatot Subroto No. 12, South Jakarta, Indonesia'}
                </Text>
                <TouchableOpacity style={styles.seeMapBtn}>
                  <Text style={[styles.seeMapText, { color: colors.primary }]}>
                    {t('sportCenter.seeOnMap')}
                  </Text>
                  <Gps size={scale(14)} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Facilities Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.facilitiesScrollContent}
            style={styles.facilitiesScroll}
          >
            {getLocalizedAmenities(t).map((amenity, index) => (
              <View key={index} style={styles.facilityItem}>
                <View style={[styles.facilityIconBox, { backgroundColor: colors.surface }]}>
                  <amenity.icon size={scale(24)} color={colors.primary} />
                </View>
                <Text style={[styles.facilityLabel, { color: colors.textSecondary }]}>
                  {amenity.label}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Tab Switcher */}
          <View
            style={[styles.tabContainer, { backgroundColor: colors.surface }]}
            onLayout={(e) => {
              setTabContainerWidth(e.nativeEvent.layout.width);
              // Calculate Y position: Layout Y (relative to Content) + Hero Height (fixed at scale(320))
              const y = e.nativeEvent.layout.y + scale(320);
              setScheduleY(y);
            }}
          >
            {/* Animated Indicator */}
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  width: (tabContainerWidth - scale(8)) / 2, // subtract padding
                  height: scale(38),
                  top: scale(4),
                  bottom: scale(4),
                  backgroundColor: colors.primary,
                  transform: [
                    {
                      translateX: tabOffset.interpolate({
                        inputRange: [0, 1],
                        outputRange: [scale(4), tabContainerWidth / 2],
                      }),
                    },
                  ],
                },
              ]}
            />

            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => handleTabPress('description')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'description' ? colors.surface : colors.textSecondary },
                ]}
              >
                {t('sportCenter.descriptionTab')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabButton} onPress={() => handleTabPress('schedule')}>
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'schedule' ? colors.surface : colors.textSecondary },
                ]}
              >
                {t('sportCenter.scheduleTab')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'description' ? (
            <View style={styles.tabContent}>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('sportCenter.aboutVenue')}
                </Text>
                <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                  {facility.description || t('sportCenter.defaultDescription')}
                </Text>
              </View>

              <View style={styles.specsGrid}>
                <View
                  style={[
                    styles.specItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
                    {t('sportCenter.floorType')}
                  </Text>
                  <Text style={[styles.specValue, { color: colors.text }]}>Vinyl Premium</Text>
                </View>
                <View
                  style={[
                    styles.specItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
                    {t('sportCenter.fieldSize')}
                  </Text>
                  <Text style={[styles.specValue, { color: colors.text }]}>20m x 40m</Text>
                </View>
              </View>
              <View
                style={[
                  styles.specItem,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
                  {t('sportCenter.openingHours')}
                </Text>
                <Text style={[styles.specValue, { color: colors.text }]}>
                  {facility.openTime} - {facility.closeTime}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('sportCenter.venueRules')}
                </Text>
                <View style={styles.rulesList}>
                  <View style={styles.ruleItem}>
                    <TickCircle size={scale(18)} color={colors.primary} variant="Bold" />
                    <Text style={[styles.ruleText, { color: colors.textSecondary }]}>
                      {t('sportCenter.ruleAttire')}
                    </Text>
                  </View>
                  <View style={styles.ruleItem}>
                    <TickCircle size={scale(18)} color={colors.primary} variant="Bold" />
                    <Text style={[styles.ruleText, { color: colors.textSecondary }]}>
                      {t('sportCenter.ruleNoSmoking')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.mapPreviewContainer}>
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNW1Mq31bvl7yK0IEpyTA997S_WJ5N8YbIbzvygqt0kI6Nm1L980noM2k3w__GL3j2qLMM8aOiWXsYZjKjMXazR5hywZd16CqVWS3YMjoTo0_qMGDTrHnjnE5-pfg348ZEZXGVXvZUEOixs5y1NwO7It97r8Pi3hzwNTA1MkbfL52e6-ztiwFJx3Es9HcfMmb7v0myRF96dakmoOWhgUt4tXXxJiZNuQTxqjGg6bUSO5d7xxCbA8L8LiObY3WsNsoE7Cc-mWbpqRk',
                  }}
                  style={styles.mapImage}
                  resizeMode="cover"
                />
                <View style={styles.mapOverlay}>
                  <TouchableOpacity
                    style={[styles.openMapBtn, { backgroundColor: colors.background }]}
                  >
                    <DirectUp size={scale(16)} color={colors.primary} />
                    <Text style={[styles.openMapText, { color: colors.text }]}>
                      {t('sportCenter.openDirections')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.tabContent}>
              {/* Date Selector */}
              <View style={styles.dateSelectorContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('sportCenter.selectDate')}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dateListContent}
                >
                  {dates.map((date, index) => {
                    const isSelected =
                      date.getDate() === selectedDate.getDate() &&
                      date.getMonth() === selectedDate.getMonth();
                    const locale = language === 'en' ? 'en-US' : 'id-ID';
                    const dayName = date.toLocaleDateString(locale, { weekday: 'short' });
                    const dayNumber = date.getDate();
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateItem,
                          isSelected && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                          },
                          !isSelected && {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => {
                          setSelectedDate(date);
                          setSelectedSlots([]); // Reset slot on date change
                        }}
                      >
                        <Text
                          style={[
                            styles.dayNameText,
                            { color: isSelected ? '#FFF' : colors.textSecondary },
                          ]}
                        >
                          {dayName}
                        </Text>
                        <Text
                          style={[
                            styles.dayNumberText,
                            { color: isSelected ? '#FFF' : colors.text },
                          ]}
                        >
                          {dayNumber}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Court Selector (if applicable) */}
              {facility.courts && facility.courts.length > 0 && (
                <View style={styles.courtSelectorContainer}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('sportCenter.selectCourt')}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.courtListContent}
                  >
                    {facility.courts.map((court) => {
                      const isSelected = court.id === selectedCourtId;
                      return (
                        <TouchableOpacity
                          key={court.id}
                          style={[
                            styles.courtItem,
                            isSelected && {
                              backgroundColor: colors.primary + '15',
                              borderColor: colors.primary,
                            },
                            !isSelected && {
                              backgroundColor: colors.surface,
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() => {
                            setSelectedCourtId(court.id);
                            setSelectedSlots([]); // Reset slot on court change
                          }}
                        >
                          <Text
                            style={[
                              styles.courtNameText,
                              {
                                color: isSelected ? colors.primary : colors.textSecondary,
                                fontFamily: isSelected ? fontBold : fontSemiBold,
                              },
                            ]}
                          >
                            {court.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Time Slots */}
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('sportCenter.timeSlots') || 'Time Slots'}
                </Text>
                <View style={styles.timeSlotGrid}>
                  {timeSlots.map((slot, index) => {
                    const isSelected = selectedSlots.includes(slot.time);
                    const isBooked = slot.isBooked;

                    return (
                      <TouchableOpacity
                        key={index}
                        disabled={isBooked}
                        style={[
                          styles.timeSlotItem,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          isSelected && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                          },
                          isBooked && {
                            backgroundColor: colors.border + '40',
                            borderColor: 'transparent',
                          },
                        ]}
                        onPress={() => handleSlotPress(slot.time)}
                      >
                        <Text
                          style={[
                            styles.timeSlotText,
                            { color: colors.text },
                            isSelected && { color: '#FFF' },
                            isBooked && {
                              color: colors.textSecondary + '80',
                              textDecorationLine: 'line-through',
                            },
                          ]}
                        >
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Footer CTA */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background + 'F2', // Translucent
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <View style={styles.priceContainer}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
            {totalSlots > 0 ? t('common.total') || 'Total' : t('sportCenter.priceStartsFrom')}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceValue, { color: colors.primary }]}>
              Rp{' '}
              {totalPrice.toLocaleString('id-ID', { compactDisplay: 'short' }).replace(',000', 'k')}
            </Text>
            <Text style={[styles.priceUnit, { color: colors.textSecondary }]}>
              {totalSlots > 0 ? `(${totalSlots} Jam)` : t('sportCenter.perHour')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.checkScheduleBtn,
            { backgroundColor: colors.primary },
            activeTab === 'schedule' &&
              totalSlots === 0 && { backgroundColor: '#E2E8F0', opacity: 1 }, // slate-200
          ]}
          onPress={() => {
            if (activeTab === 'description') {
              handleTabPress('schedule');
            } else if (totalSlots > 0) {
              handleBookingPress();
            }
          }}
          disabled={activeTab === 'schedule' && totalSlots === 0}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.checkScheduleText,
              activeTab === 'schedule' && totalSlots === 0 && { color: colors.textSecondary },
            ]}
          >
            {activeTab === 'description'
              ? t('sportCenter.checkSchedule')
              : t('sportCenter.bookNow') || 'Book Now'}
          </Text>
          <Calendar size={scale(18)} color="#FFF" variant="Bold" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  heroContainer: {
    height: scale(320),
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    gap: scale(16),
    alignItems: 'center',
    paddingRight: scale(4),
  },
  imageCounter: {
    position: 'absolute',
    bottom: scale(30), // Lifted up properly
    right: scale(20),
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: 20,
  },
  imageCounterText: {
    color: '#FFF',
    fontSize: scale(10),
    fontFamily: fontSemiBold,
    letterSpacing: 1,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingTop: moderateVerticalScale(24),
    paddingHorizontal: getHorizontalPadding(),
  },
  mainInfoSection: {
    marginBottom: moderateVerticalScale(24),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: moderateVerticalScale(8),
  },
  title: {
    fontSize: scale(22),
    fontFamily: fontBold,
    flex: 1,
    marginRight: scale(10),
    lineHeight: scale(28),
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: 8,
    gap: scale(4),
  },
  ratingText: {
    fontSize: scale(12),
    fontFamily: fontBold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(8),
  },
  locationTextContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: scale(13),
    fontFamily: fontRegular,
    lineHeight: scale(20),
  },
  seeMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(4),
    gap: scale(4),
  },
  seeMapText: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
  },
  facilitiesScroll: {
    marginBottom: moderateVerticalScale(24),
    marginHorizontal: -getHorizontalPadding(),
  },
  facilitiesScrollContent: {
    paddingHorizontal: getHorizontalPadding(),
    gap: scale(16),
  },
  facilityItem: {
    alignItems: 'center',
    gap: scale(8),
    minWidth: scale(70),
  },
  facilityIconBox: {
    width: scale(56),
    height: scale(56),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityLabel: {
    fontSize: scale(11),
    fontFamily: fontSemiBold,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: scale(4),
    borderRadius: 12,
    marginBottom: moderateVerticalScale(20),
  },
  tabButton: {
    flex: 1,
    paddingVertical: scale(10),
    alignItems: 'center',
    borderRadius: 10,
    zIndex: 1,
  },
  tabIndicator: {
    position: 'absolute',
    borderRadius: 10,
    zIndex: 0,
  },
  tabText: {
    fontSize: scale(13),
    fontFamily: fontSemiBold,
  },
  tabContent: {
    paddingBottom: moderateVerticalScale(24),
  },
  section: {
    marginBottom: moderateVerticalScale(20),
  },
  sectionTitle: {
    fontSize: scale(16),
    fontFamily: fontBold,
    marginBottom: moderateVerticalScale(8),
  },
  descriptionText: {
    fontSize: scale(13),
    fontFamily: fontRegular,
    lineHeight: scale(22),
  },
  specsGrid: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: moderateVerticalScale(8),
  },
  specItem: {
    flex: 1,
    padding: scale(16),
    borderRadius: 16,
    borderWidth: 1,
  },
  specLabel: {
    fontSize: scale(10),
    fontFamily: fontBold,
    letterSpacing: 1,
    marginBottom: scale(6),
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },
  rulesList: {
    gap: scale(8),
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  ruleText: {
    fontSize: scale(13),
    fontFamily: fontRegular,
    flex: 1,
  },
  mapPreviewContainer: {
    height: scale(160),
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginTop: moderateVerticalScale(10),
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: 100,
    gap: scale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  openMapText: {
    fontSize: scale(12),
    fontFamily: fontBold,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingTop: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(16),
    borderTopWidth: 1,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: scale(10),
    fontFamily: fontBold,
    letterSpacing: 1,
    marginBottom: scale(2),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: scale(4),
  },
  priceValue: {
    fontSize: scale(18),
    fontFamily: fontBold,
  },
  priceUnit: {
    fontSize: scale(12),
    fontFamily: fontRegular,
  },
  checkScheduleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(14),
    borderRadius: 16,
    gap: scale(8),
  },
  checkScheduleText: {
    color: '#FFF',
    fontSize: scale(14),
    fontFamily: fontBold,
  },
  dateSelectorContainer: {
    marginBottom: moderateVerticalScale(24),
  },
  dateListContent: {
    paddingHorizontal: getHorizontalPadding(),
    gap: scale(10),
  },
  dateItem: {
    width: scale(54),
    height: scale(72),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dayNameText: {
    fontSize: scale(11),
    fontFamily: fontSemiBold,
    marginBottom: scale(4),
    textTransform: 'uppercase',
  },
  dayNumberText: {
    fontSize: scale(18),
    fontFamily: fontBold,
  },
  courtSelectorContainer: {
    marginBottom: moderateVerticalScale(24),
  },
  courtListContent: {
    paddingHorizontal: getHorizontalPadding(),
    gap: scale(10),
  },
  courtItem: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: 12,
    borderWidth: 1,
  },
  courtNameText: {
    fontSize: scale(13),
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  timeSlotItem: {
    width: (SCREEN_WIDTH - getHorizontalPadding() * 2 - scale(10) * 3) / 4, // 4 columns
    height: scale(40),
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: scale(11),
    fontFamily: fontSemiBold,
  },
});
