import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  scale,
  moderateVerticalScale,
  FontFamily,
  BottomSheet,
  DatePicker,
  getResponsiveFontSize,
} from '@core/config';
import { CloseCircle, TickCircle, Calendar } from 'iconsax-react-nativejs';

export interface InvoiceFilters {
  status: 'all' | 'lunas' | 'belum_lunas' | 'dicicil' | null;
  sortType: 'invoiceDate' | 'dueDate' | 'createdDate';
  sortOrder: 'asc' | 'desc';
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

interface InvoiceFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: InvoiceFilters) => void;
  initialFilters: InvoiceFilters;
}

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

export const InvoiceFilterBottomSheet: React.FC<
  InvoiceFilterBottomSheetProps
> = ({ visible, onClose, onApply, initialFilters }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [localFilters, setLocalFilters] =
    useState<InvoiceFilters>(initialFilters);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocalFilters(initialFilters);
    }
  }, [visible, initialFilters]);

  const isDatePickerVisible =
    showStartDatePicker || showEndDatePicker;

  const isInvalidRange = useMemo(() => {
    const { startDate, endDate } = localFilters.dateRange;
    if (!startDate || !endDate) return false;
    return startDate > endDate;
  }, [localFilters]);

  const handleApply = () => {
    if (isInvalidRange) return;
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
      status: 'all',
      sortType: 'dueDate',
      sortOrder: 'desc',
      dateRange: { startDate: null, endDate: null },
    });
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleStartDateConfirm = (date: Date) => {
    setLocalFilters((prev) => {
      const endDate = prev.dateRange?.endDate;

      return {
        ...prev,
        dateRange: {
          startDate: date,
          endDate: endDate && date > endDate ? date : endDate,
        },
      };
    });

    setShowStartDatePicker(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        endDate: date,
      },
    }));

    setShowEndDatePicker(false);
  };

  const renderRadioOption = (
    label: string,
    isSelected: boolean,
    onSelect: () => void
  ) => (
    <TouchableOpacity
      style={styles.radioRow}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.radioOuter,
          {
            borderColor: isSelected
              ? colors.primary
              : colors.border,
          },
        ]}
      >
        {isSelected && (
          <View
            style={[
              styles.radioInner,
              { backgroundColor: colors.primary },
            ]}
          />
        )}
      </View>
      <Text
        style={[
          styles.radioLabel,
          { color: colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const statusOptions: {
    label: string;
    value: InvoiceFilters['status'];
  }[] = [
    { label: t('invoice.filterAll'), value: 'all' },
    { label: t('invoice.statusUnpaid'), value: 'belum_lunas' },
    { label: t('invoice.statusPaid'), value: 'lunas' },
    { label: t('invoice.statusInstallment'), value: 'dicicil' },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[95]}
      disableClose={isDatePickerVisible}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            {t('invoice.common.filter')}
          </Text>

          <TouchableOpacity onPress={onClose}>
            <CloseCircle
              size={scale(24)}
              color={colors.textSecondary}
              variant="Linear"
            />
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* DATE RANGE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar
                size={scale(20)}
                color={colors.text}
                variant="Linear"
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text },
                ]}
              >
                {t('news.dateRange') ||
                  'Rentang Tanggal'}
              </Text>
            </View>

            <View style={styles.dateRangeContainer}>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() =>
                  setShowStartDatePicker(true)
                }
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    { color: colors.text },
                  ]}
                >
                  {localFilters.dateRange
                    ?.startDate
                    ? formatDate(
                        localFilters.dateRange
                          .startDate
                      )
                    : t(
                        'news.selectStartDate'
                      ) ||
                      'Tanggal Mulai'}
                </Text>
              </TouchableOpacity>

              <Text
                style={[
                  styles.dateSeparator,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                -
              </Text>

              <TouchableOpacity
                style={[
                  styles.dateButton,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() =>
                  setShowEndDatePicker(true)
                }
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    { color: colors.text },
                  ]}
                >
                  {localFilters.dateRange
                    ?.endDate
                    ? formatDate(
                        localFilters.dateRange
                          .endDate
                      )
                    : t(
                        'news.selectEndDate'
                      ) ||
                      'Tanggal Akhir'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SORT TYPE */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text },
              ]}
            >
              {t('invoice.filterSortType')}
            </Text>

            {renderRadioOption(
              t('invoice.sortInvoiceDate'),
              localFilters.sortType ===
                'invoiceDate',
              () =>
                setLocalFilters((prev) => ({
                  ...prev,
                  sortType: 'invoiceDate',
                }))
            )}

            {renderRadioOption(
              t('invoice.sortDueDate'),
              localFilters.sortType ===
                'dueDate',
              () =>
                setLocalFilters((prev) => ({
                  ...prev,
                  sortType: 'dueDate',
                }))
            )}

            {renderRadioOption(
              t('invoice.sortCreatedDate'),
              localFilters.sortType ===
                'createdDate',
              () =>
                setLocalFilters((prev) => ({
                  ...prev,
                  sortType: 'createdDate',
                }))
            )}
          </View>

          {/* SORT ORDER */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text },
              ]}
            >
              {t('invoice.filterSortOrder')}
            </Text>

            {renderRadioOption(
              t('invoice.sortOldest'),
              localFilters.sortOrder ===
                'asc',
              () =>
                setLocalFilters((prev) => ({
                  ...prev,
                  sortOrder: 'asc',
                }))
            )}

            {renderRadioOption(
              t('invoice.sortNewest'),
              localFilters.sortOrder ===
                'desc',
              () =>
                setLocalFilters((prev) => ({
                  ...prev,
                  sortOrder: 'desc',
                }))
            )}
          </View>
        </ScrollView>

        {/* FOOTER */}
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Text
              style={[
                styles.resetText,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {t('common.reset')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isInvalidRange}
            style={[
              styles.applyButton,
              {
                backgroundColor:
                  isInvalidRange
                    ? colors.border
                    : colors.primary,
              },
            ]}
            onPress={handleApply}
          >
            <Text style={styles.applyText}>
              {t('invoice.common.apply')}
            </Text>
            <TickCircle
              size={scale(20)}
              color="#FFF"
              variant="Bold"
            />
          </TouchableOpacity>
        </View>

        {/* DATE PICKERS */}
        <DatePicker
          visible={showStartDatePicker}
          onClose={() =>
            setShowStartDatePicker(false)
          }
          onConfirm={handleStartDateConfirm}
          value={
            localFilters.dateRange
              ?.startDate
          }
          maximumDate={
            localFilters.dateRange
              ?.endDate || undefined
          }
          title={
            t('news.selectStartDate') ||
            'Pilih Tanggal Mulai'
          }
          yearRange={100}
        />

        <DatePicker
          visible={showEndDatePicker}
          onClose={() =>
            setShowEndDatePicker(false)
          }
          onConfirm={handleEndDateConfirm}
          value={
            localFilters.dateRange
              ?.endDate
          }
          minimumDate={
            localFilters.dateRange
              ?.startDate || undefined
          }
          title={
            t('news.selectEndDate') ||
            'Pilih Tanggal Akhir'
          }
          yearRange={100}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingBottom: moderateVerticalScale(16),
  },

  title: {
    fontSize: scale(18),
    fontFamily: fontBold,
  },

  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: moderateVerticalScale(24),
  },

  section: {
    marginBottom: moderateVerticalScale(24),
  },

  sectionTitle: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
    marginBottom: scale(12),
  },

  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
    gap: scale(12),
  },

  radioOuter: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioInner: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
  },

  radioLabel: {
    fontSize: scale(14),
    fontFamily: fontRegular,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },

  chip: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(100),
    borderWidth: 1,
  },

  chipText: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
  },

  footer: {
    flexDirection: 'row',
    padding: scale(20),
    borderTopWidth: 1,
    gap: scale(16),
  },

  resetButton: {
    flex: 1,
    height: scale(48),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(12),
  },

  resetText: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },

  applyButton: {
    flex: 2,
    height: scale(48),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(12),
    flexDirection: 'row',
    gap: scale(8),
  },

  applyText: {
    color: '#FFF',
    fontSize: scale(14),
    fontFamily: fontBold,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },

  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },

  dateButton: {
    flex: 1,
    padding: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    alignItems: 'center',
  },

  dateButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: fontRegular,
  },

  dateSeparator: {
    fontSize: scale(14),
    fontFamily: fontRegular,
  },
});
