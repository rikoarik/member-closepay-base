/**
 * SportCenterCategoryTabs Component
 * Horizontal scrollable category tabs with sport icons (Ayo style)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { scale, moderateVerticalScale, FontFamily } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { Game, Element3, Box1, Drop, IconProps } from 'iconsax-react-nativejs';

export type SportCenterCategoryTab = 'all' | 'futsal' | 'badminton' | 'tenis' | 'gym' | 'pool';

const CATEGORIES: {
  id: SportCenterCategoryTab;
  labelKey: string;
  icon: React.ComponentType<IconProps>;
}[] = [
  { id: 'all', labelKey: 'sportCenter.categoryAll', icon: Element3 },
  { id: 'futsal', labelKey: 'sportCenter.futsal', icon: Game },
  { id: 'badminton', labelKey: 'sportCenter.badminton', icon: Game },
  { id: 'tenis', labelKey: 'sportCenter.tenis', icon: Box1 },
  { id: 'gym', labelKey: 'sportCenter.gym', icon: Element3 },
  { id: 'pool', labelKey: 'sportCenter.pool', icon: Drop },
];

interface SportCenterCategoryTabsProps {
  selectedCategory: SportCenterCategoryTab;
  onSelectCategory: (category: SportCenterCategoryTab) => void;
}

export const SportCenterCategoryTabs: React.FC<SportCenterCategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((tab) => {
          const isActive = selectedCategory === tab.id;
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                  elevation: isActive ? 4 : 0,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isActive ? 0.3 : 0,
                  shadowRadius: 8,
                },
              ]}
              onPress={() => onSelectCategory(tab.id)}
              activeOpacity={0.8}
            >
              <IconComponent
                size={scale(18)}
                color={isActive ? colors.surface : colors.text}
                variant={isActive ? 'Bold' : 'Linear'}
              />
              <Text style={[styles.tabText, { color: isActive ? colors.surface : colors.text }]}>
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateVerticalScale(12),
  },
  scrollContent: {
    paddingHorizontal: scale(4),
    gap: scale(8),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderRadius: 100,
    borderWidth: 1,
    gap: scale(8),
  },
  tabText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
});
