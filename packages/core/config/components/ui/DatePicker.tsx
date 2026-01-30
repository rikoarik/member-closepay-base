/**
 * DatePicker Component
 * Reusable date picker dengan scrollable picker untuk tahun, bulan, dan hari
 * Tidak menggunakan library eksternal
 * Optimized with FlatList for performance
 */
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
} from '../../utils/responsive';
import { FontFamily } from '../../utils/fonts';

const PICKER_ITEM_HEIGHT = scale(40);
const VISIBLE_ITEMS = 5;

export interface DatePickerProps {
  /**
   * Modal visible state
   */
  visible: boolean;

  /**
   * Callback ketika modal ditutup
   */
  onClose: () => void;

  /**
   * Callback ketika date dipilih (dipanggil saat OK ditekan)
   */
  onConfirm: (date: Date) => void;

  /**
   * Initial date value
   */
  value?: Date | null;

  /**
   * Minimum date yang bisa dipilih
   */
  minimumDate?: Date | null;

  /**
   * Maximum date yang bisa dipilih
   */
  maximumDate?: Date | null;

  /**
   * Title untuk picker
   */
  title?: string;

  /**
   * Range tahun (dari tahun sekarang mundur)
   * Default: 100 tahun
   */
  yearRange?: number;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  visible,
  onClose,
  onConfirm,
  value,
  minimumDate,
  maximumDate,
  title,
  yearRange = 100,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Generate date options
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - yearRange; i--) {
      years.push(i);
    }
    return years;
  };

  const generateMonths = () => {
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return monthNames.map((name, index) => ({ name, value: index + 1 }));
  };

  const generateDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const years = useMemo(() => generateYears(), [yearRange]);
  const months = useMemo(() => generateMonths(), []);

  // Initialize selected date
  const getInitialDate = (date: Date | null) => {
    const d = date || new Date();
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  };

  // Initialize state immediately when value changes, not just on mount
  const [dateState, setDateState] = useState(() => getInitialDate(value || null));

  // Update state immediately when value changes (before modal opens)
  useEffect(() => {
    const initialDate = value || new Date();
    setDateState({
      year: initialDate.getFullYear(),
      month: initialDate.getMonth() + 1,
      day: initialDate.getDate(),
    });
  }, [value]);

  const days = useMemo(
    () => generateDays(dateState.year, dateState.month),
    [dateState.year, dateState.month]
  );

  // Filter years based on min/max dates
  const filteredYears = useMemo(() => {
    let filtered = years;
    if (minimumDate) {
      const minYear = minimumDate.getFullYear();
      filtered = filtered.filter((y) => y >= minYear);
    }
    if (maximumDate) {
      const maxYear = maximumDate.getFullYear();
      filtered = filtered.filter((y) => y <= maxYear);
    }
    return filtered;
  }, [years, minimumDate, maximumDate]);

  // Refs for scroll list
  const yearListRef = useRef<FlatList>(null);
  const monthListRef = useRef<FlatList>(null);
  const dayListRef = useRef<FlatList>(null);

  // Initial scroll indices
  const initialScrollPositions = useMemo(() => {
    if (!visible) return null;
    const yearIndex = Math.max(
      0,
      filteredYears.findIndex((y) => y === dateState.year)
    );
    const monthIndex = Math.max(0, dateState.month - 1);
    const dayIndex = Math.max(0, dateState.day - 1);
    return { yearIndex, monthIndex, dayIndex };
  }, [visible, dateState.year, dateState.month, dateState.day, filteredYears]);

  const handleConfirm = () => {
    const newDate = new Date(dateState.year, dateState.month - 1, dateState.day);

    // Validate against min/max dates
    if (minimumDate && newDate < minimumDate) {
      return; // Don't confirm if before minimum
    }
    if (maximumDate && newDate > maximumDate) {
      return; // Don't confirm if after maximum
    }

    onConfirm(newDate);
    onClose();
  };

  const handleYearChange = (year: number) => {
    const maxDay = generateDays(year, dateState.month).length;
    const newDay = Math.min(dateState.day, maxDay);
    setDateState({ ...dateState, year, day: newDay });
  };

  const handleMonthChange = (month: number) => {
    const maxDay = generateDays(dateState.year, month).length;
    const newDay = Math.min(dateState.day, maxDay);
    setDateState({ ...dateState, month, day: newDay });
  };

  const handleDayChange = (day: number) => {
    setDateState({ ...dateState, day });
  };

  // Check if date is valid
  const isDateValid = () => {
    const newDate = new Date(dateState.year, dateState.month - 1, dateState.day);
    if (minimumDate && newDate < minimumDate) return false;
    if (maximumDate && newDate > maximumDate) return false;
    return true;
  };

  // Optimized getItemLayout for fixed height items
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: PICKER_ITEM_HEIGHT,
      offset: PICKER_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item, index, isSelected, onPress, label, fontFamily }: any) => (
      <TouchableOpacity
        style={[
          styles.pickerItem,
          {
            backgroundColor: isSelected ? colors.primaryLight || colors.surface : 'transparent',
          },
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.pickerItemText,
            {
              color: isSelected ? colors.primary : colors.text,
              fontFamily:
                fontFamily ||
                (isSelected ? FontFamily.monasans.semiBold : FontFamily.monasans.regular),
            },
          ]}
        >
          {label(item)}
        </Text>
      </TouchableOpacity>
    ),
    [colors]
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      hardwareAccelerated
    >
      <View style={styles.modal}>
        {Platform.OS === 'ios' && (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="systemThinMaterial"
            blurAmount={10}
            overlayColor="rgba(255, 255, 255, 0.5)"
          />
        )}
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={onClose}>
                <Text style={[styles.button, { color: colors.textSecondary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>
                {title || t('common.selectDate') || 'Pilih Tanggal'}
              </Text>
              <TouchableOpacity onPress={handleConfirm} disabled={!isDateValid()}>
                <Text
                  style={[
                    styles.button,
                    {
                      color: isDateValid()
                        ? colors.primary
                        : colors.textTertiary || colors.textSecondary,
                    },
                  ]}
                >
                  {t('common.ok')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <View style={styles.pickerRow}>
                {/* Year Picker */}
                <View style={styles.pickerColumn}>
                  <FlatList
                    ref={yearListRef}
                    data={filteredYears}
                    keyExtractor={(item) => item.toString()}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={PICKER_ITEM_HEIGHT}
                    decelerationRate="fast"
                    getItemLayout={getItemLayout}
                    initialScrollIndex={initialScrollPositions?.yearIndex}
                    contentContainerStyle={styles.pickerContent}
                    renderItem={({ item }) =>
                      renderItem({
                        item,
                        isSelected: dateState.year === item,
                        onPress: () => handleYearChange(item),
                        label: (i: number) => i.toString(),
                      })
                    }
                  />
                </View>

                {/* Month Picker */}
                <View style={styles.pickerColumn}>
                  <FlatList
                    ref={monthListRef}
                    data={months}
                    keyExtractor={(item) => item.value.toString()}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={PICKER_ITEM_HEIGHT}
                    decelerationRate="fast"
                    getItemLayout={getItemLayout}
                    initialScrollIndex={initialScrollPositions?.monthIndex}
                    contentContainerStyle={styles.pickerContent}
                    renderItem={({ item }) =>
                      renderItem({
                        item,
                        isSelected: dateState.month === item.value,
                        onPress: () => handleMonthChange(item.value),
                        label: (i: any) => i.name,
                      })
                    }
                  />
                </View>

                {/* Day Picker */}
                <View style={styles.pickerColumn}>
                  <FlatList
                    ref={dayListRef}
                    data={days}
                    keyExtractor={(item) => item.toString()}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={PICKER_ITEM_HEIGHT}
                    decelerationRate="fast"
                    getItemLayout={getItemLayout}
                    initialScrollIndex={initialScrollPositions?.dayIndex}
                    contentContainerStyle={styles.pickerContent}
                    renderItem={({ item }) =>
                      renderItem({
                        item,
                        isSelected: dateState.day === item,
                        onPress: () => handleDayChange(item),
                        label: (i: number) => i.toString(),
                      })
                    }
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  container: {
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    paddingBottom: moderateVerticalScale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: moderateVerticalScale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  button: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  pickerContainer: {
    paddingVertical: moderateVerticalScale(16),
  },
  pickerRow: {
    flexDirection: 'row',
    height: PICKER_ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  pickerColumn: {
    flex: 1,
    position: 'relative',
  },
  pickerContent: {
    paddingVertical: PICKER_ITEM_HEIGHT * 2, // Padding untuk center alignment
  },
  pickerItem: {
    height: PICKER_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(8),
    marginHorizontal: scale(4),
  },
  pickerItemText: {
    fontSize: getResponsiveFontSize('medium'),
  },
});
