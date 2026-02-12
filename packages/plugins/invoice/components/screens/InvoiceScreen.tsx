/**
 * InvoiceScreen Component
 * Main entry point for Invoice plugin - Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InvoiceListScreen } from './InvoiceListScreen';
import { InvoiceDetailScreen } from './InvoiceDetailScreen';

const Stack = createNativeStackNavigator();

export const InvoiceScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="InvoiceList"
    >
      <Stack.Screen name="InvoiceList" component={InvoiceListScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
    </Stack.Navigator>
  );
};
