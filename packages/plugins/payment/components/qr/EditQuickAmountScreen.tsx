import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Edit2, Trash, TickCircle } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
  ScreenHeader,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { NavigationProp } from '@core/navigation';

const DEFAULT_QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

type RouteParams = {
  EditQuickAmount: {
    quickAmounts: number[];
  };
};

export const EditQuickAmountScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<'EditQuickAmount'>>();
  const route = useRoute<RouteProp<RouteParams, 'EditQuickAmount'>>();
  const insets = useSafeAreaInsets();

  const initialAmounts = route.params?.quickAmounts || DEFAULT_QUICK_AMOUNTS;

  const [quickAmounts, setQuickAmounts] = useState<number[]>(initialAmounts);
  const [editingAmount, setEditingAmount] = useState<{ index: number; value: number } | null>(null);
  const [newAmount, setNewAmount] = useState('');
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const inputRefs = useRef<{ [key: number]: TextInput | null }>({});
  const itemRefs = useRef<{ [key: number]: View | null }>({});

  const formatCurrency = useCallback((value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue, 10).toLocaleString('id-ID');
  }, []);

  const handleEditAmount = useCallback((index: number, value: number) => {
    setEditingAmount({ index, value });
    setNewAmount(value.toString());
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingAmount && newAmount) {
      const numericValue = parseInt(newAmount.replace(/\D/g, ''), 10);
      if (numericValue > 0) {
        const updated = [...quickAmounts];
        updated[editingAmount.index] = numericValue;
        setQuickAmounts(updated.sort((a, b) => a - b));
        setEditingAmount(null);
        setNewAmount('');
      }
    }
  }, [editingAmount, newAmount, quickAmounts]);

  const handleDeleteAmount = useCallback(
    (index: number) => {
      const updated = quickAmounts.filter((_, i) => i !== index);
      setQuickAmounts(updated.length > 0 ? updated : DEFAULT_QUICK_AMOUNTS);
    },
    [quickAmounts]
  );

  const handleAddAmount = useCallback(() => {
    if (newAmount) {
      const numericValue = parseInt(newAmount.replace(/\D/g, ''), 10);
      if (numericValue > 0 && !quickAmounts.includes(numericValue)) {
        const updated = [...quickAmounts, numericValue];
        setQuickAmounts(updated.sort((a, b) => a - b));
        setNewAmount('');
      }
    }
  }, [newAmount, quickAmounts]);

  const handleSave = useCallback(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setParams({ updatedQuickAmounts: quickAmounts } as any);
    }
    navigation.goBack();
  }, [quickAmounts, navigation]);

  const scrollToInput = useCallback(
    (index: number, keyboardHeight: number = 0) => {
      if (!scrollViewRef.current || !itemRefs.current[index]) return;

      const scrollDelay = Platform.OS === 'ios' ? 250 : 100;
      
      setTimeout(() => {
        const itemRef = itemRefs.current[index];
        if (!itemRef || !scrollViewRef.current) return;

          itemRef.measureLayout(
            scrollViewRef.current as any,
            (x, y, width, height) => {
              const Dimensions = require('react-native').Dimensions;
              const screenHeight = Dimensions.get('window').height;
              const actualKeyboardHeight = keyboardHeight || (Platform.OS === 'ios' ? 336 : 300);
              
              const headerHeight = moderateVerticalScale(70);
              const safeAreaTop = insets.top;
              const safeAreaBottom = insets.bottom;
              const padding = moderateVerticalScale(30);
              
              const visibleAreaTop = safeAreaTop + headerHeight;
              const visibleAreaBottom = screenHeight - actualKeyboardHeight - safeAreaBottom;
              
              const inputTop = y;
              const inputBottom = y + height;
              
              if (inputBottom > visibleAreaBottom - padding) {
                const scrollOffset = Math.max(0, inputBottom - visibleAreaBottom + padding);
                scrollViewRef.current?.scrollTo({
                  y: scrollOffset,
                  animated: true,
                });
              } else if (inputTop < visibleAreaTop + padding) {
                const scrollOffset = Math.max(0, inputTop - visibleAreaTop - padding);
                scrollViewRef.current?.scrollTo({
                  y: scrollOffset,
                  animated: true,
                });
              }
            },
            () => {
              // Error callback - ignore silently
            }
          );
      }, scrollDelay);
    },
    [insets.top, insets.bottom]
  );

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const keyboardHeight = e.endCoordinates?.height || 0;
        if (editingAmount !== null) {
          scrollToInput(editingAmount.index, keyboardHeight);
        }
      }
    );

    return () => {
      keyboardWillShowListener.remove();
    };
  }, [editingAmount, scrollToInput]);

  useEffect(() => {
    const keyboardListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const keyboardHeight = e.endCoordinates?.height || 0;
        if (newAmount && itemRefs.current[-1] && editingAmount === null) {
          scrollToInput(-1, keyboardHeight);
        }
      }
    );

    return () => {
      keyboardListener.remove();
    };
  }, [newAmount, editingAmount, scrollToInput]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('qr.editQuickAmount')}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
            <Text style={[styles.saveButton, { color: colors.primary }]}>
              {t('common.save') || 'Simpan'}
            </Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: getHorizontalPadding(), paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
      >
          {quickAmounts.map((quickAmount, index) => (
            <View
              key={`edit-${quickAmount}-${index}`}
              ref={(ref) => {
                itemRefs.current[index] = ref;
              }}
              style={[
                styles.editAmountItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {editingAmount?.index === index ? (
                <View style={styles.editAmountInputContainer}>
                  <Text style={[styles.editAmountPrefix, { color: colors.text }]}>Rp</Text>
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[styles.editAmountInput, { color: colors.text }]}
                    value={formatCurrency(newAmount)}
                    onChangeText={setNewAmount}
                    placeholder="0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    autoFocus
                    onFocus={() => {
                      setTimeout(() => {
                        scrollToInput(index);
                      }, Platform.OS === 'ios' ? 400 : 300);
                    }}
                  />
                  <TouchableOpacity
                    onPress={handleSaveEdit}
                    activeOpacity={0.7}
                    style={[styles.editAmountSaveButton, { backgroundColor: colors.primary }]}
                  >
                    <TickCircle size={scale(20)} color={colors.surface} variant="Bold" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={[styles.editAmountText, { color: colors.text }]}>
                    Rp {formatCurrency(quickAmount.toString())}
                  </Text>
                  <View style={styles.editAmountActions}>
                    <TouchableOpacity
                      onPress={() => handleEditAmount(index, quickAmount)}
                      activeOpacity={0.7}
                      style={styles.editAmountButton}
                    >
                      <Edit2 size={scale(18)} color={colors.primary} variant="Linear" />
                    </TouchableOpacity>
                    {quickAmounts.length > 1 && (
                      <TouchableOpacity
                        onPress={() => handleDeleteAmount(index)}
                        activeOpacity={0.7}
                        style={styles.editAmountButton}
                      >
                        <Trash size={scale(18)} color={colors.error} variant="Linear" />
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          ))}

          {/* Add New Amount */}
          <View
            ref={(ref) => {
              itemRefs.current[-1] = ref;
            }}
            style={[
              styles.editAmountItem,
              styles.addAmountItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.editAmountInputContainer}>
              <Text style={[styles.editAmountPrefix, { color: colors.text }]}>Rp</Text>
              <TextInput
                ref={(ref) => {
                  inputRefs.current[-1] = ref;
                }}
                style={[styles.editAmountInput, { color: colors.text }]}
                value={formatCurrency(newAmount)}
                onChangeText={setNewAmount}
                    placeholder={t('qr.addQuickAmount')}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    onFocus={() => {
                      setTimeout(() => {
                        scrollToInput(-1);
                      }, Platform.OS === 'ios' ? 400 : 300);
                    }}
              />
              <TouchableOpacity
                onPress={handleAddAmount}
                activeOpacity={0.7}
                disabled={!newAmount || parseInt(newAmount.replace(/\D/g, ''), 10) <= 0}
                style={[
                  styles.editAmountAddButton,
                  {
                    backgroundColor:
                      newAmount && parseInt(newAmount.replace(/\D/g, ''), 10) > 0
                        ? colors.primary
                        : colors.border,
                    opacity: newAmount && parseInt(newAmount.replace(/\D/g, ''), 10) > 0 ? 1 : 0.5,
                  },
                ]}
              >
                <Text style={[styles.addIconText, { color: colors.surface }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: moderateVerticalScale(20),
  },
  saveButton: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  editAmountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(8),
  },
  addAmountItem: {
    borderStyle: 'dashed',
  },
  editAmountText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    flex: 1,
  },
  editAmountActions: {
    flexDirection: 'row',
    gap: scale(12),
  },
  editAmountButton: {
    padding: scale(8),
  },
  editAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: scale(8),
  },
  editAmountPrefix: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
  editAmountInput: {
    flex: 1,
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    padding: 0,
  },
  editAmountSaveButton: {
    padding: scale(8),
    borderRadius: scale(8),
  },
  editAmountAddButton: {
    padding: scale(8),
    borderRadius: scale(8),
    minWidth: scale(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconText: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
  },
});
