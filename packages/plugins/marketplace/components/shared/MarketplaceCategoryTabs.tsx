import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import {
    scale,
    moderateVerticalScale,
    getHorizontalPadding,
    FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';

interface MarketplaceCategoryTabsProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export const MarketplaceCategoryTabs: React.FC<MarketplaceCategoryTabsProps> = ({
    categories,
    selectedCategory,
    onSelectCategory,
}) => {
    const { colors } = useTheme();
    const horizontalPadding = getHorizontalPadding();

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingHorizontal: horizontalPadding },
                ]}
            >
                {categories.map((category) => {
                    const isSelected = selectedCategory === category;
                    return (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.tab,
                                isSelected && { backgroundColor: colors.primary },
                                !isSelected && {
                                    backgroundColor: colors.background,
                                    borderWidth: 1,
                                    borderColor: colors.border
                                }
                            ]}
                            onPress={() => onSelectCategory(category)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    { color: isSelected ? '#FFFFFF' : colors.text },
                                    isSelected && styles.tabTextSelected,
                                ]}
                            >
                                {category}
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
        paddingVertical: moderateVerticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    scrollView: {
        flexGrow: 0,
    },
    scrollContent: {
        gap: scale(8),
        flexDirection: 'row',
        alignItems: 'center',
    },
    tab: {
        paddingHorizontal: scale(16),
        paddingVertical: moderateVerticalScale(8),
        borderRadius: scale(20),
    },
    tabText: {
        fontSize: scale(13),
        fontFamily: FontFamily.monasans.medium,
    },
    tabTextSelected: {
        fontFamily: FontFamily.monasans.semiBold,
    },
});
