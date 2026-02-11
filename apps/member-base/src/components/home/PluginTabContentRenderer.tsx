/**
 * PluginTabContentRenderer
 * Dynamically loads and renders tab content from plugins via getTabPlugin mapping.
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getTabPlugin, PluginRegistry, usePluginComponent } from '@core/config';
import { useTheme } from '@core/theme';

interface PluginTabContentRendererProps {
  tabId: string;
  activeTab: string;
  scrollEnabled?: boolean;
}

export const PluginTabContentRenderer: React.FC<PluginTabContentRendererProps> = ({
  tabId,
  activeTab,
  scrollEnabled = false,
}) => {
  const { colors } = useTheme();
  const pluginMapping = getTabPlugin(tabId);

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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.error, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>
          {error.message || 'Failed to load tab'}
        </Text>
      </View>
    );
  }

  if (!Component) return null;

  return (
    <Component
      isActive={activeTab === tabId}
      isVisible={activeTab === tabId}
      scrollEnabled={scrollEnabled}
    />
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
