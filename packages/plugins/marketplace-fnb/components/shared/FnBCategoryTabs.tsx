/**
 * FnBCategoryTabs Component
 * Horizontal scrollable category tabs with animated indicator
 */

import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { scale, moderateVerticalScale, FontFamily } from '@core/config';
import { useTheme } from '@core/theme';
import type { FnBCategory } from '../../models';

interface FnBCategoryTabsProps {
    categories: FnBCategory[];
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
}

export const FnBCategoryTabs: React.FC<FnBCategoryTabsProps> = ({
    categories,
    selectedCategory,
    onSelectCategory,
}) => {
    const { colors } = useTheme();
    const scrollRef = useRef<ScrollView>(null);

    const handleCategoryPress = useCallback((categoryId: string, index: number) => {
        onSelectCategory(categoryId);
    }, [onSelectCategory]);

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {categories.map((category, index) => {
                    const isActive = selectedCategory === category.id;
                    return (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.tab,
                                {
                                    backgroundColor: isActive ? colors.primary : colors.surface,
                                    borderColor: isActive ? colors.primary : colors.border,
                                },
                            ]}
                            onPress={() => handleCategoryPress(category.id, index)}
                            activeOpacity={0.8}
                        >
                            {category.icon && (
                                <Text style={styles.icon}>{category.icon}</Text>
                            )}
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color: isActive ? colors.surface : colors.text,
                                    },
                                ]}
                            >
                                {category.name}
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
        paddingHorizontal: scale(14),
        paddingVertical: scale(8),
        borderRadius: scale(20),
        borderWidth: 1,
    },
    icon: {
        fontSize: scale(14),
        marginRight: scale(6),
    },
    tabText: {
        fontSize: scale(13),
        fontFamily: FontFamily.monasans.semiBold,
    },
});
