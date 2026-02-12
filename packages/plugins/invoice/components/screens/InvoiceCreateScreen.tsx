import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft2,
  User,
  SearchNormal,
  Calendar,
  DocumentText, // Replaced Note
  Send2, // Replaced Send
  Money,
} from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { scale, FontFamily, getResponsiveFontSize, DatePicker, ScreenHeader } from '@core/config';
import { useTranslation } from '@core/i18n';
import { InvoiceAddItemBottomSheet, InvoiceItem } from '../sheets/InvoiceAddItemBottomSheet';
import { Add, Edit2, Trash, Ticket, CloseCircle } from 'iconsax-react-nativejs';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

type TargetType = 'member' | 'merchant';

export const InvoiceCreateScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Form State
  const [targetType, setTargetType] = useState<TargetType>('member');
  const [recipient, setRecipient] = useState('');
  const [billName, setBillName] = useState('');
  const [amount, setAmount] = useState('');
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [note, setNote] = useState('');
  const [allowInstallment, setAllowInstallment] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [showAddItemSheet, setShowAddItemSheet] = useState(false);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddItem = (item: InvoiceItem) => {
    if (editingItem) {
      setInvoiceItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    } else {
      setInvoiceItems((prev) => [...prev, { ...item, id: Date.now().toString() }]);
    }
    setEditingItem(null);
  };

  const handleEditItem = (item: InvoiceItem) => {
    setEditingItem(item);
    setShowAddItemSheet(true);
  };

  const addTag = () => {
    if (tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleDeleteItem = (id: string) => {
    setInvoiceItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate total amount from items if any
  React.useEffect(() => {
    if (invoiceItems.length > 0) {
      const total = invoiceItems.reduce((acc, item) => acc + (item.amount - item.discount), 0);
      setAmount(total.toString());
    }
  }, [invoiceItems]);

  const handleCreate = () => {
    // TODO: Implement create logic
    console.log('Create Invoice:', {
      targetType,
      recipient,
      billName,
      amount,
      invoiceDate,
      dueDate,
      note,
      allowInstallment,
      items: invoiceItems,
      tags,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ScreenHeader title={t('invoice.createTitle')} />
      <KeyboardAwareScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + scale(40) }]}
        enableOnAndroid={true}
        extraScrollHeight={scale(100)}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('invoice.createDescription')}
        </Text>

        {/* Target Type Toggle */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('invoice.sendTo')}</Text>
          <View style={[styles.toggleContainer, { backgroundColor: colors.inputBackground }]}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                targetType === 'member' && [
                  styles.toggleButtonActive,
                  { backgroundColor: colors.background },
                ],
                targetType === 'member' && {
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
              ]}
              onPress={() => setTargetType('member')}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: targetType === 'member' ? colors.primary : colors.textSecondary },
                ]}
              >
                {t('invoice.targetMember')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                targetType === 'merchant' && [
                  styles.toggleButtonActive,
                  { backgroundColor: colors.background },
                ],
                targetType === 'merchant' && {
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
              ]}
              onPress={() => setTargetType('merchant')}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: targetType === 'merchant' ? colors.primary : colors.textSecondary },
                ]}
              >
                {t('invoice.targetMerchant')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recipient Selector */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('invoice.selectRecipient')}</Text>
          <TouchableOpacity
            style={[
              styles.inputContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => {
              // TODO: Open member/merchant search
            }}
          >
            <SearchNormal size={scale(20)} color={colors.textTertiary} />
            <Text
              style={[
                styles.inputText,
                { color: recipient ? colors.text : colors.textSecondary, flex: 1 },
              ]}
            >
              {recipient || t('invoice.searchRecipientPlaceholder')}
            </Text>
            <View style={{ transform: [{ rotate: '-90deg' }] }}>
              <ArrowLeft2 size={scale(16)} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bill Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('invoice.billName')}</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
            placeholder={t('invoice.billNamePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={billName}
            onChangeText={setBillName}
          />
        </View>

        {/* Invoice Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
              {t('invoice.items') || 'Item Tagihan'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEditingItem(null);
                setShowAddItemSheet(true);
              }}
            >
              <Text style={[styles.actionText, { color: colors.primary }]}>
                {t('common.add') || '+ Tambah Item'}
              </Text>
            </TouchableOpacity>
          </View>

          {invoiceItems.length > 0 ? (
            <View style={styles.itemsList}>
              {invoiceItems.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                    <View style={styles.itemActions}>
                      <TouchableOpacity onPress={() => handleEditItem(item)}>
                        <Edit2 size={scale(16)} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteItem(item.id!)}>
                        <Trash size={scale(16)} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                      Rp {item.amount.toLocaleString('id-ID')}
                      {item.discount > 0 && (
                        <Text style={{ color: colors.error }}>
                          {' '}
                          - Rp {item.discount.toLocaleString('id-ID')} (Disc)
                        </Text>
                      )}
                    </Text>
                    <Text style={[styles.itemTotal, { color: colors.primary }]}>
                      Rp {(item.amount - item.discount).toLocaleString('id-ID')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.emptyItemsContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                setEditingItem(null);
                setShowAddItemSheet(true);
              }}
            >
              <Add size={scale(24)} color={colors.textSecondary} />
              <Text style={[styles.emptyItemsText, { color: colors.textSecondary }]}>
                {t('invoice.addItemHint') || 'Belum ada item, ketuk untuk menambah'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('invoice.amount')}</Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: invoiceItems.length > 0 ? colors.background : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.currencyPrefix, { color: colors.textTertiary }]}>Rp</Text>
            <TextInput
              style={[
                styles.amountInput,
                { color: invoiceItems.length > 0 ? colors.textSecondary : colors.text },
              ]}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={
                invoiceItems.length > 0 ? parseInt(amount || '0').toLocaleString('id-ID') : amount
              }
              onChangeText={(text) => {
                if (invoiceItems.length === 0) {
                  setAmount(text.replace(/[^0-9]/g, ''));
                }
              }}
              keyboardType="number-pad"
              editable={invoiceItems.length === 0}
            />
          </View>
          {invoiceItems.length > 0 && (
            <Text style={[styles.helperText, { color: colors.textSecondary, marginTop: scale(4) }]}>
              *Total dihitung otomatis dari item tagihan
            </Text>
          )}
        </View>

        {/* Invoice Date */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('invoice.billingDate')}</Text>
          <TouchableOpacity
            style={[
              styles.inputContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setShowInvoiceDatePicker(true)}
          >
            <Calendar size={scale(20)} color={colors.textTertiary} />
            <Text
              style={[
                styles.inputText,
                { color: invoiceDate ? colors.text : colors.textSecondary },
              ]}
            >
              {invoiceDate ? invoiceDate.toLocaleDateString('id-ID') : t('invoice.selectDate')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Due Date */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('invoice.dueDate')}</Text>
          <TouchableOpacity
            style={[
              styles.inputContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={scale(20)} color={colors.textTertiary} />
            <Text
              style={[styles.inputText, { color: dueDate ? colors.text : colors.textSecondary }]}
            >
              {dueDate ? dueDate.toLocaleDateString('id-ID') : t('invoice.selectDate')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('invoice.note')} ({t('common.optional')})
          </Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
            placeholder={t('invoice.notePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
          <View
            style={[
              styles.tagInputContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.tagIcon}>
              <Ticket size={scale(18)} color={colors.textTertiary} />
            </View>
            <TextInput
              style={[styles.tagInput, { color: colors.text }]}
              placeholder={'Tambahkan tag...'}
              placeholderTextColor={colors.textSecondary}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addTag} disabled={!tagInput.trim()}>
              <Add
                size={scale(20)}
                color={tagInput.trim() ? colors.primary : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.helperText, { color: colors.textSecondary, marginTop: scale(4) }]}>
            Tekan enter untuk menambah tags
          </Text>

          {/* Tags List */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor: colors.surface + '20',
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <CloseCircle size={scale(14)} color={colors.textSecondary} variant="Bold" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Installment Toggle */}
        <View
          style={[
            styles.installmentCard,
            { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' },
          ]}
        >
          <View style={styles.installmentContent}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
              <Money size={scale(20)} color={colors.primary} variant="Bold" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.installmentTitle, { color: colors.text }]}>
                {t('invoice.allowInstallment')}
              </Text>
              <Text style={[styles.installmentSubtitle, { color: colors.textSecondary }]}>
                {t('invoice.allowInstallmentDesc')}
              </Text>
            </View>
          </View>
          <Switch
            value={allowInstallment}
            onValueChange={setAllowInstallment}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={Platform.OS === 'android' ? colors.surface : ''}
            ios_backgroundColor={colors.border}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderLight,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              opacity: !recipient || !amount || !billName ? 0.6 : 1,
            },
          ]}
          onPress={handleCreate}
          disabled={!recipient || !amount || !billName}
        >
          <Text style={[styles.submitButtonText, { color: colors.surface }]}>
            {t('invoice.createAndSend')}
          </Text>
          <Send2 size={scale(20)} color={colors.surface} variant="Bold" />
        </TouchableOpacity>
      </View>

      <DatePicker
        visible={showInvoiceDatePicker}
        value={invoiceDate}
        onConfirm={(date) => {
          setShowInvoiceDatePicker(false);
          setInvoiceDate(date);
        }}
        onClose={() => {
          setShowInvoiceDatePicker(false);
        }}
        title={t('invoice.selectDate')}
      />

      <InvoiceAddItemBottomSheet
        visible={showAddItemSheet}
        onClose={() => {
          setShowAddItemSheet(false);
          setEditingItem(null);
        }}
        onSave={handleAddItem}
        initialItem={editingItem}
      />

      <DatePicker
        visible={showDatePicker}
        value={dueDate}
        onConfirm={(date) => {
          setShowDatePicker(false);
          setDueDate(date);
        }}
        onClose={() => {
          setShowDatePicker(false);
        }}
        title={t('invoice.selectDate')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderBottomWidth: 1,
  },
  backButton: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'), // 18
    fontFamily: fontBold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(20),
  },
  description: {
    fontSize: getResponsiveFontSize('small'), // 14
    fontFamily: fontRegular,
    marginBottom: scale(24),
  },
  section: {
    marginBottom: scale(20),
  },
  label: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: fontSemiBold,
    marginBottom: scale(8),
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: scale(4),
    borderRadius: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: scale(10),
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    // shadow applied in inline style
  },
  toggleText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: fontSemiBold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: scale(16),
    height: scale(50),
    gap: scale(12),
  },
  inputText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: fontRegular,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: scale(16),
    height: scale(50),
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: fontRegular,
  },
  currencyPrefix: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: fontSemiBold,
  },
  amountInput: {
    flex: 1,
    fontSize: getResponsiveFontSize('large'),
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    height: scale(120),
    textAlignVertical: 'top',
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: fontRegular,
  },

  helperText: {
    fontSize: scale(12),
    fontFamily: fontRegular,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  actionText: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },
  itemsList: {
    gap: scale(12),
  },
  itemCard: {
    padding: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  itemName: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: scale(12),
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: scale(12),
    fontFamily: fontRegular,
  },
  itemTotal: {
    fontSize: scale(14),
    fontFamily: fontBold,
  },
  itemTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginTop: scale(6),
    flexWrap: 'wrap',
  },
  itemTag: {
    fontSize: scale(11),
    fontFamily: fontRegular,
  },
  emptyItemsContainer: {
    padding: scale(20),
    borderRadius: scale(8),
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
  },
  emptyItemsText: {
    fontSize: scale(14),
    fontFamily: fontRegular,
  },

  installmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: scale(24),
  },
  installmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    flex: 1,
  },
  iconBox: {
    padding: scale(8),
    borderRadius: 20,
  },
  installmentTitle: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: fontSemiBold,
  },
  installmentSubtitle: {
    fontSize: scale(10),
    fontFamily: fontRegular,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    boxShadow: '0px -4px 8px rgba(0, 0, 0, 0.1)',
    padding: scale(20),
    borderTopWidth: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(16),
    borderRadius: 16,
    gap: scale(8),
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: fontBold,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: scale(12),
    height: scale(50),
    gap: scale(8),
  },
  tagIcon: {
    marginRight: scale(4),
  },
  tagInput: {
    flex: 1,
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: fontRegular,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginTop: scale(12),
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: 20,
    gap: scale(6),
  },
  tagText: {
    fontSize: scale(12),
    fontFamily: fontRegular,
  },
});
