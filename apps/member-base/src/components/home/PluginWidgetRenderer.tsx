/**
 * PluginWidgetRenderer
 * Dynamically loads and renders beranda widgets from plugins via getWidgetPlugin mapping.
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getWidgetPlugin, PluginRegistry, usePluginComponent } from '@core/config';
import { useTheme } from '@core/theme';

interface PluginWidgetRendererProps {
  widgetId: string;
  isActive?: boolean;
  isVisible?: boolean;
}

export const PluginWidgetRenderer: React.FC<PluginWidgetRendererProps> = ({
  widgetId,
  isActive = true,
  isVisible = true,
}) => {
  const { colors } = useTheme();
  const pluginMapping = getWidgetPlugin(widgetId);

  if (!pluginMapping || !PluginRegistry.isPluginEnabled(pluginMapping.pluginId)) {
    return null;
  }

  const { Component, loading, error } = usePluginComponent({
    pluginId: pluginMapping.pluginId,
    componentName: pluginMapping.componentName,
  });

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (error || !Component) return null;

  return (
    <Component
      key={widgetId}
      isActive={isActive}
      isVisible={isVisible}
    />
  );
};

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
