import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@core/theme';
import { scale, moderateVerticalScale, FontFamily } from '@core/config';
import { useTabBar } from './TabBarContext';

const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

export const SportCenterTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors } = useTheme();
  const { isVisible } = useTabBar();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isVisible ? 0 : moderateVerticalScale(100), // Hide by moving down
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          transform: [{ translateY }],
          shadowColor: '#000', // Re-apply shadow here as it's the animated container
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

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
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const Icon = options.tabBarIcon;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
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
              style={[styles.label, { color: isFocused ? colors.primary : colors.textSecondary }]}
            >
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: moderateVerticalScale(40),
    marginHorizontal: scale(20),
    left: 0,
    right: 0,
    borderRadius: scale(50),
    height: moderateVerticalScale(70),
    paddingBottom: moderateVerticalScale(10), // Padding to center content vertically
    paddingTop: moderateVerticalScale(10),
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateVerticalScale(4),
  },
  label: {
    fontFamily: fontSemiBold,
    fontSize: scale(10),
    marginTop: scale(4),
  },
});
