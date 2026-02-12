/**
 * SportCenterScreen Component
 * Main entry point for Sport Center plugin
 * Refactored to Stack Navigator to handle internal navigation
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { Discover, Calendar, Heart } from 'iconsax-react-nativejs';

import { SportCenterExploreScreen } from './SportCenterExploreScreen';
import { SportCenterMyBookingsScreen } from './SportCenterMyBookingsScreen';
import { SportCenterWishlistScreen } from './SportCenterWishlistScreen';
import { SportCenterFacilityDetailScreen } from './SportCenterFacilityDetailScreen';
import { SportCenterBookingDetailScreen } from './SportCenterBookingDetailScreen';
import { SportCenterBookingScreen } from './SportCenterBookingScreen';
import { SportCenterCheckoutScreen } from './SportCenterCheckoutScreen';
import { SportCenterSearchScreen } from './SportCenterSearchScreen';
import { SportCenterSearchResultsScreen } from './SportCenterSearchResultsScreen';
import { SportCenterBookingCheckoutScreen } from './SportCenterBookingCheckoutScreen';
import { SportCenterPaymentSuccessScreen } from './SportCenterPaymentSuccessScreen';
import { PaymentSelectionScreen } from '@core/payment';

import { SportCenterTabBar } from '../navigation/SportCenterTabBar';
import { TabBarProvider } from '../navigation/TabBarContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const SportCenterTabs = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <TabBarProvider>
      <Tab.Navigator
        initialRouteName="SportCenterExplore"
        backBehavior="initialRoute"
        tabBar={(props) => <SportCenterTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          lazy: true,
          // Simple Fade Animation
          // @ts-ignore
          animation: 'fade',
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tab.Screen
          name="SportCenterExplore"
          component={SportCenterExploreScreen}
          options={{
            tabBarLabel: t('sportCenter.explore', { defaultValue: 'Explore' }),
            tabBarIcon: ({ color, size, focused }) => (
              <Discover size={size} color={color} variant={focused ? 'Bold' : 'Linear'} />
            ),
          }}
        />
        <Tab.Screen
          name="SportCenterWishlist"
          component={SportCenterWishlistScreen}
          options={{
            tabBarLabel: t('sportCenter.wishlist', { defaultValue: 'Favorit' }),
            tabBarIcon: ({ color, size, focused }) => (
              <Heart size={size} color={color} variant={focused ? 'Bold' : 'Linear'} />
            ),
          }}
        />
        <Tab.Screen
          name="SportCenterMyBookings"
          component={SportCenterMyBookingsScreen}
          options={{
            tabBarLabel: t('sportCenter.myBookings', { defaultValue: 'Riwayat Booking' }),
            tabBarIcon: ({ color, size, focused }) => (
              <Calendar size={size} color={color} variant={focused ? 'Bold' : 'Linear'} />
            ),
          }}
        />
      </Tab.Navigator>
    </TabBarProvider>
  );
};

export const SportCenterScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="SportCenterTabs"
    >
      <Stack.Screen name="SportCenterTabs" component={SportCenterTabs} />
      <Stack.Screen name="SportCenterFacilityDetail" component={SportCenterFacilityDetailScreen} />
      <Stack.Screen name="SportCenterBookingDetail" component={SportCenterBookingDetailScreen} />
      <Stack.Screen name="SportCenterBooking" component={SportCenterBookingScreen} />
      <Stack.Screen name="SportCenterCheckout" component={SportCenterCheckoutScreen} />
      <Stack.Screen
        name="SportCenterBookingCheckout"
        component={SportCenterBookingCheckoutScreen}
      />
      <Stack.Screen name="SportCenterSearch" component={SportCenterSearchScreen} />
      <Stack.Screen name="SportCenterSearchResults" component={SportCenterSearchResultsScreen} />
      <Stack.Screen name="PaymentSelectionScreen" component={PaymentSelectionScreen} />
      <Stack.Screen name="SportCenterPaymentSuccess" component={SportCenterPaymentSuccessScreen} />
    </Stack.Navigator>
  );
};
