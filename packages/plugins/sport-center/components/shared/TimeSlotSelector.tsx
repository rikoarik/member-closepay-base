/**
 * TimeSlotSelector Component
 * Wrap flex grid untuk memilih slot waktu booking - Available, Booked, Selected states (Ayo style)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, moderateVerticalScale, FontFamily, getResponsiveFontSize } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import type { SportCenterTimeSlot } from '../../models';

interface TimeSlotSelectorProps {
  slots: SportCenterTimeSlot[];
  selectedSlot?: string | null;
  selectedSlots?: string[];
  onSelectSlot?: (time: string) => void;
  onSelectSlots?: (times: string[]) => void;
  multiSelect?: boolean;
}

const TIME_GROUPS = [
  { label: 'Pagi', start: 6, end: 11 },
  { label: 'Siang', start: 11, end: 15 },
  { label: 'Sore', start: 15, end: 18 },
  { label: 'Malam', start: 18, end: 24 },
];

const SLOT_TIMES = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
];

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  slots,
  selectedSlot = null,
  selectedSlots = [],
  onSelectSlot,
  onSelectSlots,
  multiSelect = false,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const slotMap = React.useMemo(() => {
    const map = new Map<string, SportCenterTimeSlot>();
    slots.forEach((s) => map.set(s.time, s));
    return map;
  }, [slots]);

  const timesToShow = slots.length > 0 ? slots.map((s) => s.time) : SLOT_TIMES;

  const isSlotSelected = (time: string) => {
    if (multiSelect) return selectedSlots.includes(time);
    return selectedSlot === time;
  };

  const handleSlotPress = (time: string) => {
    const slot = slotMap.get(time);
    if (!slot?.available) return;
    if (multiSelect && onSelectSlots) {
      const newSelected = selectedSlots.includes(time)
        ? selectedSlots.filter((t) => t !== time)
        : [...selectedSlots, time];
      onSelectSlots(newSelected);
    } else if (onSelectSlot) {
      onSelectSlot(time);
    }
  };

  const groupedSlots = React.useMemo(() => {
    const groups: { [key: string]: string[] } = {
      Pagi: [],
      Siang: [],
      Sore: [],
      Malam: [],
    };

    timesToShow.forEach((time) => {
      const hour = parseInt(time.split(':')[0], 10);
      const group = TIME_GROUPS.find((g) => hour >= g.start && hour < g.end);
      if (group) {
        groups[group.label].push(time);
      }
    });

    return groups;
  }, [timesToShow]);

  return (
    <View style={styles.container}>
      {Object.entries(groupedSlots).map(([groupName, times]) => {
        if (times.length === 0) return null;
        return (
          <View key={groupName} style={styles.groupContainer}>
            <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>{groupName}</Text>
            <View style={styles.grid}>
              {times.map((time) => {
                const slot = slotMap.get(time);
                const available = slot ? slot.available : true;
                const isSelected = isSlotSelected(time);

                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.slot,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : available
                          ? colors.surface
                          : colors.surfaceSecondary || colors.border,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => available && handleSlotPress(time)}
                    disabled={!available}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        {
                          color: isSelected
                            ? colors.surface
                            : available
                            ? colors.text
                            : colors.textSecondary,
                          fontFamily: isSelected
                            ? FontFamily.monasans.bold
                            : FontFamily.monasans.medium,
                        },
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateVerticalScale(16),
  },
  groupContainer: {
    marginBottom: moderateVerticalScale(16),
  },
  groupTitle: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(8),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  slot: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
    borderRadius: scale(10),
    borderWidth: 1,
    minWidth: scale(75),
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: {
    fontSize: getResponsiveFontSize('medium'),
  },
});
