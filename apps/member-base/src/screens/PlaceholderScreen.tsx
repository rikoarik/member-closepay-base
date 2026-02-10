/**
 * PlaceholderScreen - Screen placeholder untuk fitur yang belum diimplementasi
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@core/theme';
import { useRoute } from '@react-navigation/native';
import { ScreenHeader } from '@core/config/components/ui/ScreenHeader';

export const PlaceholderScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const routeName = (route.params as { title?: string })?.title ?? route.name ?? 'Fitur';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={routeName} />
      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Fitur ini akan segera tersedia.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
});
