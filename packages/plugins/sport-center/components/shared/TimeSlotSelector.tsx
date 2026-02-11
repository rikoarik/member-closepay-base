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

const SLOT_TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00',
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

  const timesToShow = slots.length > 0
    ? slots.map((s) => s.time)
    : SLOT_TIMES;

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

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('sportCenter.selectTime')}
      </Text>
      <View style={styles.grid}>
        {timesToShow.map((time) => {
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
                  opacity: available ? 1 : 0.6,
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
                    color: isSelected ? colors.surface : colors.text,
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
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateVerticalScale(16),
  },
  title: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(8),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  slot: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    minWidth: scale(70),
    alignItems: 'center',
  },
  slotText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
});
