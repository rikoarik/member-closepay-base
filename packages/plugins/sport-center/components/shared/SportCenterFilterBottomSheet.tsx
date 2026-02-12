import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { scale, moderateVerticalScale, FontFamily, BottomSheet } from '@core/config';
import { CloseCircle, TickCircle } from 'iconsax-react-nativejs';

export interface SportCenterFilters {
  minPrice: number | null;
  maxPrice: number | null;
  rating: number | null;
  isOpenOnly: boolean;
  sortBy: 'nearest' | 'rating' | 'price' | null;
}

interface SportCenterFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SportCenterFilters) => void;
  initialFilters: SportCenterFilters;
}

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

export const SportCenterFilterBottomSheet: React.FC<SportCenterFilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [localFilters, setLocalFilters] = useState<SportCenterFilters>(initialFilters);

  const toggleSort = (sort: SportCenterFilters['sortBy']) => {
    setLocalFilters((prev) => ({ ...prev, sortBy: prev.sortBy === sort ? null : sort }));
  };

  const toggleRating = (rating: number) => {
    setLocalFilters((prev) => ({ ...prev, rating: prev.rating === rating ? null : rating }));
  };

  const setPriceRange = (min: number | null, max: number | null) => {
    setLocalFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
  };

  const handleReset = () => {
    setLocalFilters({
      minPrice: null,
      maxPrice: null,
      rating: null,
      isOpenOnly: false,
      sortBy: null,
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[85]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('sportCenter.filterTitle')}</Text>
          <TouchableOpacity onPress={onClose}>
            <CloseCircle size={scale(24)} color={colors.textSecondary} variant="Linear" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* SORT BY */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('sportCenter.sortBy')}
            </Text>
            <View style={styles.chipRow}>
              {[
                { label: t('sportCenter.sortNearest'), value: 'nearest' },
                { label: t('sportCenter.sortHighestRating'), value: 'rating' },
                { label: t('sportCenter.sortLowestPrice'), value: 'price' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.chip,
                    {
                      borderColor:
                        localFilters.sortBy === item.value ? colors.primary : colors.border,
                      backgroundColor:
                        localFilters.sortBy === item.value ? colors.primary + '10' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleSort(item.value as any)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          localFilters.sortBy === item.value
                            ? colors.primary
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* RATING */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('marketplace.rating')}
            </Text>
            <View style={styles.chipRow}>
              {[4.5, 4.0, 3.5].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.chip,
                    {
                      borderColor: localFilters.rating === r ? colors.primary : colors.border,
                      backgroundColor:
                        localFilters.rating === r ? colors.primary + '10' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleRating(r)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: localFilters.rating === r ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {r}+ ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* PRICE RANGE */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('sportCenter.priceRange')}
            </Text>
            <View style={styles.chipRow}>
              {[
                { label: t('sportCenter.priceUnder50'), min: 0, max: 50000 },
                { label: t('sportCenter.price50to100'), min: 50000, max: 100000 },
                { label: t('sportCenter.priceOver100'), min: 100000, max: null },
              ].map((item, idx) => {
                const isSelected =
                  localFilters.minPrice === item.min && localFilters.maxPrice === item.max;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.chip,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primary + '10' : 'transparent',
                      },
                    ]}
                    onPress={() => setPriceRange(item.min, item.max)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* OPEN NOW */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setLocalFilters((prev) => ({ ...prev, isOpenOnly: !prev.isOpenOnly }))}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                {t('sportCenter.openNow')}
              </Text>
              <TickCircle
                size={scale(24)}
                color={localFilters.isOpenOnly ? colors.primary : colors.textSecondary}
                variant={localFilters.isOpenOnly ? 'Bold' : 'Linear'}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={[styles.resetText, { color: colors.textSecondary }]}>
              {t('common.reset')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleApply}
          >
            <Text style={styles.applyText}>{t('news.apply')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingBottom: moderateVerticalScale(16),
  },
  title: {
    fontSize: scale(18),
    fontFamily: fontBold,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: moderateVerticalScale(24),
  },
  section: {
    marginBottom: moderateVerticalScale(24),
  },
  sectionTitle: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
    marginBottom: scale(12),
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  chip: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(100),
    borderWidth: 1,
  },
  chipText: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: scale(20),
    borderTopWidth: 1,
    gap: scale(16),
  },
  resetButton: {
    flex: 1,
    height: scale(48),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(12),
  },
  resetText: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },
  applyButton: {
    flex: 2,
    height: scale(48),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(12),
  },
  applyText: {
    color: '#FFF',
    fontSize: scale(14),
    fontFamily: fontBold,
  },
});
