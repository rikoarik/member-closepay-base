import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Star1, Clock, Location, TickCircle } from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, getHorizontalPadding, FontFamily } from '@core/config';
import { useTheme } from '@core/theme';
import type { FnBStore } from '../../models';

interface MerchantHeaderProps {
  store: FnBStore;
}

export const MerchantHeader: React.FC<MerchantHeaderProps> = ({ store }) => {
  const { colors } = useTheme();
  const horizontalPadding = getHorizontalPadding();

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
      {/* Merchant Info Card */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        {/* Header: Name & Status */}
        <View style={styles.headerRow}>
          <View style={styles.nameContainer}>
            <Text style={[styles.storeName, { color: colors.text }]} numberOfLines={1}>
              {store.name}
            </Text>
            {/* Verified Badge */}
            <TickCircle size={scale(16)} color={colors.primary} variant="Bold" />
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: store.isOpen
                  ? colors.successContainer || '#E8F5E9'
                  : colors.errorContainer || '#FFEBEE',
              },
            ]}
          >
            <Text
              style={[styles.statusText, { color: store.isOpen ? colors.success : colors.error }]}
            >
              {store.isOpen ? 'Buka' : 'Tutup'}
            </Text>
          </View>
        </View>

        {/* Description/Tags */}
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {store.description}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Meta Info Row */}
        <View style={styles.metaRow}>
          {/* Rating */}
          <View style={styles.metaItem}>
            <Star1 size={scale(18)} color={colors.warning} variant="Bold" />
            <Text style={[styles.metaValue, { color: colors.text }]}>4.8</Text>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}> (1.2k)</Text>
          </View>

          {/* Distance */}
          <View style={styles.metaItem}>
            <Location size={scale(18)} color={colors.primary} variant="Bulk" />
            <Text style={[styles.metaValue, { color: colors.text }]}>2.5 km</Text>
          </View>

          {/* Delivery Time */}
          <View style={styles.metaItem}>
            <Clock size={scale(18)} color={colors.primary} variant="Bulk" />
            <Text style={[styles.metaValue, { color: colors.text }]}>15-20 mnt</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateVerticalScale(16),
  },
  infoCard: {
    borderRadius: scale(16),
    padding: scale(16),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scale(8),
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(12),
    gap: scale(6),
  },
  storeName: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.bold,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(20),
  },
  statusText: {
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.semiBold,
  },
  description: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: scale(16),
    lineHeight: scale(18),
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: scale(16),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaValue: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.semiBold,
    marginLeft: scale(6),
  },
  metaLabel: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.regular,
  },
});
