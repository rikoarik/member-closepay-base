/**
 * SportCenterCategoriesBottomSheet Component
 * Bottom sheet untuk memilih kategori olahraga
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { scale, moderateVerticalScale, FontFamily, BottomSheet } from '@core/config';
import {
  Game,
  Element3,
  Box1,
  Drop,
  People,
  CloseCircle,
  TickCircle,
} from 'iconsax-react-nativejs';

interface CategoryItem {
  id: string;
  labelKey: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface SportCenterCategoriesBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
  selectedCategoryId: string;
}

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

export const SportCenterCategoriesBottomSheet: React.FC<SportCenterCategoriesBottomSheetProps> = ({
  visible,
  onClose,
  onSelectCategory,
  selectedCategoryId,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const CATEGORIES: CategoryItem[] = [
    {
      id: 'all',
      labelKey: 'sportCenter.categoryAll',
      icon: People,
      color: '#E11D48',
      bgColor: '#FFF1F2',
    },
    {
      id: 'futsal',
      labelKey: 'sportCenter.futsal',
      icon: Game,
      color: colors.primary,
      bgColor: colors.primary + '15',
    },
    {
      id: 'basketball',
      labelKey: 'sportCenter.basketball',
      icon: Element3,
      color: '#F97316',
      bgColor: '#FFF7ED',
    },
    {
      id: 'tenis',
      labelKey: 'sportCenter.tenis',
      icon: Box1,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      id: 'badminton',
      labelKey: 'sportCenter.badminton',
      icon: Game,
      color: '#A855F7',
      bgColor: '#FAF5FF',
    },
    {
      id: 'gym',
      labelKey: 'sportCenter.gym',
      icon: Element3,
      color: '#22C55E',
      bgColor: '#F0FDF4',
    },
    {
      id: 'pool',
      labelKey: 'sportCenter.pool',
      icon: Drop,
      color: '#06B6D4',
      bgColor: '#ECFEFF',
    },
    {
      id: 'volleyball',
      labelKey: 'sportCenter.volleyball',
      icon: Game,
      color: '#F43F5E',
      bgColor: '#FFF1F2',
    },
    {
      id: 'yoga',
      labelKey: 'sportCenter.yoga',
      icon: People,
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
    },
  ];

  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  // 20 is the paddingHorizontal of the container
  const containerPadding = scale(20);
  const gap = scale(12);
  const itemWidth = (SCREEN_WIDTH - containerPadding * 2 - gap * 3) / 4;

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[scale(90)]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('sportCenter.categoriesTitle')}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <CloseCircle size={scale(24)} color={colors.textSecondary} variant="Linear" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.grid}>
            {CATEGORIES.map((item) => {
              const isSelected = selectedCategoryId === item.id;
              const Icon = item.icon;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.categoryItem, { width: itemWidth }]}
                  onPress={() => {
                    onSelectCategory(item.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
                    <Icon size={scale(24)} color={item.color} variant="Bold" />
                  </View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: isSelected ? colors.primary : colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {t(item.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
    fontFamily: fontBold,
  },
  scrollContent: {
    paddingBottom: moderateVerticalScale(40),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
    justifyContent: 'flex-start',
  },
  categoryItem: {
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(12),
  },
  iconBox: {
    width: scale(56),
    height: scale(56),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: scale(11),
    fontFamily: fontSemiBold,
    textAlign: 'center',
  },
});
