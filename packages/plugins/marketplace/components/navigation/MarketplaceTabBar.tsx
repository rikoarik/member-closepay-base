import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  ScrollView,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@core/theme';
import { scale, moderateVerticalScale, getHorizontalPadding, FontFamily } from '@core/config';
import { useTabBar } from './TabBarContext';

const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

export const MarketplaceTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors } = useTheme();
  const { isVisible } = useTabBar();
  const translateY = useRef(new Animated.Value(0)).current;
  const routes = state?.routes ?? [];
  const horizontalPadding = getHorizontalPadding();

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isVisible ? 0 : moderateVerticalScale(100),
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  if (routes.length === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          bottom: moderateVerticalScale(40),
          transform: [{ translateY }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 12,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        style={styles.scrollView}
      >
        {routes.map((route, index) => {
          const { options } = descriptors[route.key] ?? {};
          const label = String(
            options?.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options?.title !== undefined
                ? options.title
                : route.name ?? ''
          );
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const Icon = options?.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? label}
              testID={`tab-${route.name}`}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              {Icon && (
                <Icon
                  focused={isFocused}
                  color={isFocused ? colors.primary : colors.textSecondary}
                  size={scale(24)}
                />
              )}
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.label, { color: isFocused ? colors.primary : colors.textSecondary }]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    marginHorizontal: scale(20),
    left: 0,
    right: 0,
    borderRadius: scale(28),
    height: scale(56),
    paddingVertical: scale(8),
    borderTopWidth: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
  },
  tabItem: {
    minWidth: scale(72),
    maxWidth: scale(96),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(2),
    paddingHorizontal: scale(6),
  },
  label: {
    fontFamily: fontSemiBold,
    fontSize: scale(10),
    marginTop: scale(2),
    textAlign: 'center',
  },
});
