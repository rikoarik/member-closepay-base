/**
 * MarketplaceScreen Component
 * Halaman utama marketplace dengan bottom tab: Explore, Riwayat, Wishlist, Cicilan
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { Discover, Calendar, Heart, Wallet } from 'iconsax-react-nativejs';

import { MarketplaceExploreScreen } from './MarketplaceExploreScreen';
import { MarketplaceRiwayatScreen } from './MarketplaceRiwayatScreen';
import { MarketplaceWishlistScreen } from './MarketplaceWishlistScreen';
import { MarketplaceCicilanScreen } from './MarketplaceCicilanScreen';
import { MarketplaceTabBar } from '../navigation/MarketplaceTabBar';
import { TabBarProvider } from '../navigation/TabBarContext';

const Tab = createBottomTabNavigator();

export const MarketplaceScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <TabBarProvider>
      <Tab.Navigator
        initialRouteName="MarketplaceExplore"
        backBehavior="initialRoute"
        tabBar={(props) => <MarketplaceTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          lazy: true,
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tab.Screen
          name="MarketplaceExplore"
          component={MarketplaceExploreScreen}
          options={{
            tabBarLabel: t('marketplace.explore', { defaultValue: 'Explore' }),
            tabBarIcon: ({ color, size, focused }) => (
              <Discover size={size} color={color} variant={focused ? 'Bold' : 'Linear'} />
            ),
          }}
        />
        <Tab.Screen
          name="MarketplaceRiwayat"
          component={MarketplaceRiwayatScreen}
          options={{
            tabBarLabel: t('marketplace.riwayat', { defaultValue: 'Riwayat' }),
            tabBarIcon: ({ color, size, focused }) => (
              <Calendar size={size} color={color} variant={focused ? 'Bold' : 'Linear'} />
            ),
          }}
        />
        <Tab.Screen
          name="MarketplaceWishlist"
          component={MarketplaceWishlistScreen}
          options={{
            tabBarLabel: t('marketplace.wishlist', { defaultValue: 'Favorit' }),
            tabBarIcon: ({ color, size, focused }) => (
              <Heart size={size} color={color} variant={focused ? 'Bold' : 'Linear'} />
            ),
          }}
        />
        <Tab.Screen
          name="MarketplaceCicilan"
          component={MarketplaceCicilanScreen}
          options={{
            tabBarLabel: t('marketplace.cicilan', { defaultValue: 'Cicilan' }),
            tabBarIcon: ({ color, size, focused }) => (
              <Wallet size={size} color={color} variant={focused ? 'Bold' : 'Linear'} />
            ),
          }}
        />
      </Tab.Navigator>
    </TabBarProvider>
  );
};
