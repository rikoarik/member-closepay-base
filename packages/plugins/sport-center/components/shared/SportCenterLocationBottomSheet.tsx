/**
 * SportCenterLocationBottomSheet Component
 * Bottom sheet untuk memilih lokasi (City/Area)
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { scale, moderateVerticalScale, FontFamily, BottomSheet } from '@core/config';
import { SearchNormal, Flash, Location, CloseCircle } from 'iconsax-react-nativejs';

interface SportCenterLocationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: string) => void;
  currentLocation: string;
}

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

const POPULAR_CITIES = [
  'Jakarta',
  'Bandung',
  'Surabaya',
  'Medan',
  'Yogyakarta',
  'Bali',
  'Semarang',
  'Makassar',
];

export const SportCenterLocationBottomSheet: React.FC<SportCenterLocationBottomSheetProps> = ({
  visible,
  onClose,
  onSelectLocation,
  currentLocation,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = POPULAR_CITIES.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[95]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('sportCenter.selectLocationLabel')}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <CloseCircle size={scale(24)} color={colors.textSecondary} variant="Linear" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchInputRow, { backgroundColor: colors.background }]}>
            <SearchNormal size={scale(20)} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('sportCenter.searchLocationPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <CloseCircle size={scale(18)} color={colors.textSecondary} variant="Bold" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Use Current Location */}
          <TouchableOpacity
            style={[styles.currentLocationBtn, { borderBottomColor: colors.border }]}
            onPress={() => {
              onSelectLocation('Setiabudi, Jakarta'); // Mock current location
              onClose();
            }}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <Flash size={scale(20)} color={colors.primary} variant="Bold" />
            </View>
            <View style={styles.currentLocationText}>
              <Text style={[styles.currentLocationTitle, { color: colors.text }]}>
                {t('sportCenter.useCurrentLocation')}
              </Text>
              <Text style={[styles.currentLocationDesc, { color: colors.textSecondary }]}>
                Setiabudi, Jakarta Selatan
              </Text>
            </View>
          </TouchableOpacity>

          {/* Popular Cities */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('sportCenter.popularCities')}
            </Text>
            <View style={styles.cityGrid}>
              {filteredCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.cityChip,
                    {
                      backgroundColor: currentLocation.includes(city)
                        ? colors.primary
                        : colors.surface,
                      borderColor: currentLocation.includes(city) ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    onSelectLocation(city);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.cityText,
                      { color: currentLocation.includes(city) ? '#FFF' : colors.text },
                    ]}
                  >
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(16),
  },
  title: {
    fontSize: scale(18),
    fontFamily: fontSemiBold,
  },
  searchContainer: {
    marginVertical: moderateVerticalScale(8),
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    height: scale(48),
    borderRadius: 12,
    gap: scale(10),
  },
  searchInput: {
    flex: 1,
    fontSize: scale(14),
    fontFamily: fontRegular,
    paddingVertical: 0,
  },
  scrollContent: {
    paddingBottom: moderateVerticalScale(32),
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(20),
    borderBottomWidth: 1,
    gap: scale(16),
  },
  iconBox: {
    width: scale(44),
    height: scale(44),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationText: {
    flex: 1,
  },
  currentLocationTitle: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
    marginBottom: scale(2),
  },
  currentLocationDesc: {
    fontSize: scale(12),
    fontFamily: fontRegular,
  },
  section: {
    marginTop: moderateVerticalScale(24),
  },
  sectionTitle: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: moderateVerticalScale(16),
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  cityChip: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: 20,
    borderWidth: 1,
  },
  cityText: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },
});
