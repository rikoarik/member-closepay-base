import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  scale,
  moderateVerticalScale,
  FontFamily,
  BottomSheet,
  getResponsiveFontSize,
} from '@core/config';
import { CloseCircle, Add, Ticket } from 'iconsax-react-nativejs';

export interface InvoiceItem {
  id?: string;
  name: string;
  amount: number;
  discount: number;
}

interface InvoiceAddItemBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: InvoiceItem) => void;
  initialItem?: InvoiceItem | null;
}

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

export const InvoiceAddItemBottomSheet: React.FC<InvoiceAddItemBottomSheetProps> = ({
  visible,
  onClose,
  onSave,
  initialItem,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (visible) {
      if (initialItem) {
        setName(initialItem.name);
        setAmount(initialItem.amount.toString());
        setDiscount(initialItem.discount.toString());
      } else {
        resetForm();
      }
    }
  }, [visible, initialItem]);

  const resetForm = () => {
    setName('');
    setAmount('');
    setDiscount('');
    setNameError('');
  };

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(t('common.required'));
      return;
    }

    const item: InvoiceItem = {
      id: initialItem?.id, // Keep ID if editing
      name: name.trim(),
      amount: parseInt(amount.replace(/[^0-9]/g, '') || '0', 10),
      discount: parseInt(discount.replace(/[^0-9]/g, '') || '0', 10),
    };

    onSave(item);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[100]} enablePanDownToClose={true}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {initialItem ? 'Edit Item Tagihan' : 'Tambah Item Tagihan'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <CloseCircle size={scale(24)} color={colors.textSecondary} variant="Linear" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Item Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('invoice.itemName') || 'Nama Item'} <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: nameError ? colors.error : colors.border,
                  color: colors.text,
                },
              ]}
              placeholder={'Masukkan Nama Item'}
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (text) setNameError('');
              }}
            />
            {nameError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{nameError}</Text>
            ) : null}
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('invoice.amount') || 'Nominal'}
            </Text>
            <View
              style={[
                styles.currencyInputContainer,
                { backgroundColor: colors.inputBackground, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.currencyPrefix, { color: colors.textTertiary }]}>Rp</Text>
              <TextInput
                style={[styles.currencyInput, { color: colors.text }]}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                value={amount}
                onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Discount */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('invoice.discount') || 'Diskon'}
            </Text>
            <View
              style={[
                styles.currencyInputContainer,
                { backgroundColor: colors.inputBackground, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.currencyPrefix, { color: colors.textTertiary }]}>Rp</Text>
              <TextInput
                style={[styles.currencyInput, { color: colors.text }]}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                value={discount}
                onChangeText={(text) => setDiscount(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </ScrollView>

        {/* FOOTER */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveButtonText, { color: colors.surface }]}>
              {t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
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
  inputGroup: {
    marginBottom: moderateVerticalScale(16),
  },
  label: {
    fontSize: scale(14),
    fontFamily: fontRegular,
    marginBottom: moderateVerticalScale(8),
  },
  input: {
    borderWidth: 1,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(12),
    fontSize: scale(14),
    fontFamily: fontRegular,
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
  },
  currencyPrefix: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
    marginRight: scale(8),
  },
  currencyInput: {
    flex: 1,
    paddingVertical: moderateVerticalScale(12),
    fontSize: scale(14),
    fontFamily: fontRegular,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    paddingVertical: moderateVerticalScale(2), // slight adjustment for icon alignment
  },
  tagIcon: {
    marginRight: scale(8),
  },
  tagInput: {
    flex: 1,
    paddingVertical: moderateVerticalScale(10),
    fontSize: scale(14),
    fontFamily: fontRegular,
  },
  helperText: {
    fontSize: scale(12),
    fontFamily: fontRegular,
    marginTop: moderateVerticalScale(4),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginTop: moderateVerticalScale(12),
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(100),
    gap: scale(6),
  },
  tagText: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
  },
  errorText: {
    fontSize: scale(12),
    fontFamily: fontRegular,
    marginTop: moderateVerticalScale(4),
  },
  footer: {
    padding: scale(20),
    borderTopWidth: 1,
  },
  saveButton: {
    height: scale(48),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(12),
  },
  saveButtonText: {
    fontSize: scale(16),
    fontFamily: fontBold,
  },
});
