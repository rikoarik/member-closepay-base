/**
 * FnBCheckoutScreen Component
 * Checkout screen with order type selection based on entry point
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft2, Shop, Truck, Box } from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, getHorizontalPadding, FontFamily } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useFnBData, useFnBCart } from '../../hooks';
import { getAvailableOrderTypes } from '../../models';
import type { OrderType, EntryPoint } from '../../models';

const formatPrice = (price: number): string => {
  return `Rp ${price.toLocaleString('id-ID')}`;
};

interface OrderTypeOption {
  id: OrderType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const FnBCheckoutScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  // Get entry point from route params
  const entryPoint: EntryPoint = (route.params as any)?.entryPoint || 'browse';

  // Hooks
  const { store } = useFnBData(entryPoint);
  const { cartItems, subtotal, itemCount, clearCart, getTotal } = useFnBCart(entryPoint);

  // Get available order types based on entry point
  const availableOrderTypes = useMemo(() => getAvailableOrderTypes(entryPoint), [entryPoint]);

  // Local state
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(availableOrderTypes[0]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Order type options
  const orderTypeOptions: OrderTypeOption[] = useMemo(() => {
    const allOptions: OrderTypeOption[] = [
      {
        id: 'dine-in',
        label: t('fnb.dineIn') || 'Dine In',
        description: t('fnb.dineInDesc') || 'Makan di tempat',
        icon: (
          <Shop
            size={scale(24)}
            color={selectedOrderType === 'dine-in' ? colors.surface : colors.primary}
            variant="Bold"
          />
        ),
      },
      {
        id: 'take-away',
        label: t('fnb.takeAway') || 'Take Away',
        description: t('fnb.takeAwayDesc') || 'Ambil sendiri',
        icon: (
          <Box
            size={scale(24)}
            color={selectedOrderType === 'take-away' ? colors.surface : colors.primary}
            variant="Bold"
          />
        ),
      },
      {
        id: 'delivery',
        label: t('fnb.delivery') || 'Delivery',
        description: t('fnb.deliveryDesc') || 'Antar ke alamat',
        icon: (
          <Truck
            size={scale(24)}
            color={selectedOrderType === 'delivery' ? colors.surface : colors.primary}
            variant="Bold"
          />
        ),
      },
    ];

    return allOptions.filter((opt) => availableOrderTypes.includes(opt.id));
  }, [availableOrderTypes, selectedOrderType, colors, t]);

  // Calculate fees
  const serviceFee = 2000;
  const deliveryFee = selectedOrderType === 'delivery' && store?.delivery ? store.delivery.fee : 0;
  const total = getTotal(deliveryFee, serviceFee);

  // Validate form
  const isFormValid = useMemo(() => {
    // Check if store is open
    if (!store?.isOpen) return false;

    if (!customerName.trim()) return false;

    if (selectedOrderType === 'dine-in' && !tableNumber.trim()) return false;
    if (selectedOrderType === 'delivery' && (!phoneNumber.trim() || !deliveryAddress.trim()))
      return false;

    return true;
  }, [customerName, tableNumber, phoneNumber, deliveryAddress, selectedOrderType, store?.isOpen]);

  // Handle order
  const handleOrder = useCallback(async () => {
    // Check if store is open
    if (!store?.isOpen) {
      Alert.alert(
        'Toko Tutup',
        t('fnb.cannotOrderClosedStore') || 'Tidak dapat memesan dari toko yang sedang tutup.'
      );
      return;
    }

    if (!isFormValid) {
      Alert.alert('Error', 'Mohon lengkapi semua data yang diperlukan');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to submit order
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));

      // Here you would normally send order to API
      Alert.alert(
        'Pesanan Berhasil',
        `Pesanan Anda sedang diproses.\n\nTotal: ${formatPrice(total)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal memproses pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, total, clearCart, navigation, store?.isOpen, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            paddingTop: insets.top + moderateVerticalScale(8),
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('fnb.checkout') || 'Checkout'}
        </Text>
        <View style={{ width: scale(24) }} />
      </View>

      {/* Store Closed Banner */}
      {store && !store.isOpen && (
        <View
          style={[
            styles.closedBanner,
            { backgroundColor: colors.error + '15', borderColor: colors.error },
          ]}
        >
          <Text style={[styles.closedBannerText, { color: colors.error }]}>
            {t('fnb.storeClosedMessage') ||
              'Toko ini sedang tutup dan tidak dapat menerima pesanan saat ini.'}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: moderateVerticalScale(100),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('fnb.orderType') || 'Tipe Pesanan'}
          </Text>

          {/* Entry point indicator */}
          <Text style={[styles.entryPointHint, { color: colors.textSecondary }]}>
            {entryPoint === 'scan-qr'
              ? '📍 Anda sedang di lokasi (via QR scan)'
              : '📱 Pesan dari aplikasi'}
          </Text>

          {orderTypeOptions.map((option) => {
            const isSelected = selectedOrderType === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.orderTypeCard,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedOrderType(option.id)}
              >
                <View
                  style={[
                    styles.orderTypeIcon,
                    { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.primaryLight },
                  ]}
                >
                  {option.icon}
                </View>
                <View style={styles.orderTypeInfo}>
                  <Text
                    style={[
                      styles.orderTypeLabel,
                      { color: isSelected ? colors.surface : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.orderTypeDesc,
                      { color: isSelected ? colors.surface : colors.textSecondary },
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informasi Pemesan</Text>

          <Text style={[styles.inputLabel, { color: colors.text }]}>Nama Pemesan *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
            ]}
            placeholder={t('fnb.namePlaceholder') || 'Masukkan nama Anda'}
            placeholderTextColor={colors.textSecondary}
            value={customerName}
            onChangeText={setCustomerName}
          />

          {/* Conditional fields based on order type */}
          {selectedOrderType === 'dine-in' && (
            <>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('fnb.tableNumber') || 'Nomor Meja'} *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder={t('fnb.tableNumberPlaceholder') || 'Contoh: 12'}
                placeholderTextColor={colors.textSecondary}
                value={tableNumber}
                onChangeText={setTableNumber}
                keyboardType="number-pad"
              />
            </>
          )}

          {selectedOrderType === 'take-away' && (
            <>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('fnb.pickupTime') || 'Waktu Pengambilan'}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder={t('fnb.pickupTimePlaceholder') || 'Contoh: 15 menit lagi'}
                placeholderTextColor={colors.textSecondary}
                value={pickupTime}
                onChangeText={setPickupTime}
              />
            </>
          )}

          {selectedOrderType === 'delivery' && (
            <>
              <Text style={[styles.inputLabel, { color: colors.text }]}>No. Telepon *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="08xxxxxxxxxx"
                placeholderTextColor={colors.textSecondary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('fnb.deliveryAddress') || 'Alamat Pengiriman'} *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder={t('fnb.addressPlaceholder') || 'Masukkan alamat lengkap'}
                placeholderTextColor={colors.textSecondary}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
                numberOfLines={3}
              />
            </>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('fnb.orderSummary') || 'Ringkasan Pesanan'}
          </Text>

          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            {cartItems.map((cartItem, index) => (
              <View key={cartItem.cartId} style={styles.summaryItem}>
                <Text style={[styles.summaryItemQty, { color: colors.textSecondary }]}>
                  {cartItem.quantity}x
                </Text>
                <Text style={[styles.summaryItemName, { color: colors.text }]} numberOfLines={1}>
                  {cartItem.item.name}
                  {cartItem.variant && ` (${cartItem.variant.name})`}
                </Text>
                <Text style={[styles.summaryItemPrice, { color: colors.text }]}>
                  {formatPrice(cartItem.subtotal)}
                </Text>
              </View>
            ))}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t('fnb.subtotal') || 'Subtotal'}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatPrice(subtotal)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t('fnb.serviceFee') || 'Biaya Layanan'}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatPrice(serviceFee)}
              </Text>
            </View>

            {selectedOrderType === 'delivery' && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {t('fnb.deliveryFee') || 'Ongkos Kirim'}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {formatPrice(deliveryFee)}
                </Text>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                {t('fnb.total') || 'Total'}
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {formatPrice(total)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + moderateVerticalScale(12),
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.orderButton,
            {
              backgroundColor: isFormValid && !isSubmitting ? colors.primary : colors.border,
            },
          ]}
          onPress={handleOrder}
          disabled={!isFormValid || isSubmitting}
        >
          <Text
            style={[
              styles.orderButtonText,
              { color: isFormValid && !isSubmitting ? colors.surface : colors.textSecondary },
            ]}
          >
            {isSubmitting
              ? 'Memproses...'
              : `${t('fnb.payNow') || 'Bayar Sekarang'} - ${formatPrice(total)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingBottom: moderateVerticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.bold,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: moderateVerticalScale(20),
  },
  sectionTitle: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(12),
  },
  entryPointHint: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: scale(12),
  },
  orderTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(14),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: scale(10),
  },
  orderTypeIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  orderTypeInfo: {
    flex: 1,
  },
  orderTypeLabel: {
    fontSize: scale(15),
    fontFamily: FontFamily.monasans.semiBold,
  },
  orderTypeDesc: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.regular,
    marginTop: scale(2),
  },
  inputLabel: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: scale(6),
    marginTop: scale(12),
  },
  input: {
    borderWidth: 1,
    borderRadius: scale(10),
    paddingHorizontal: scale(14),
    paddingVertical: scale(12),
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.regular,
  },
  textArea: {
    minHeight: scale(80),
    textAlignVertical: 'top',
  },
  summaryCard: {
    borderRadius: scale(12),
    padding: scale(16),
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  summaryItemQty: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.medium,
    width: scale(30),
  },
  summaryItemName: {
    flex: 1,
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.medium,
    marginRight: scale(8),
  },
  summaryItemPrice: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.semiBold,
  },
  divider: {
    height: 1,
    marginVertical: scale(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(6),
  },
  summaryLabel: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.regular,
  },
  summaryValue: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.medium,
  },
  totalLabel: {
    fontSize: scale(15),
    fontFamily: FontFamily.monasans.bold,
  },
  totalValue: {
    fontSize: scale(17),
    fontFamily: FontFamily.monasans.bold,
  },
  bottomBar: {
    paddingTop: moderateVerticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 10,
  },
  orderButton: {
    paddingVertical: scale(16),
    borderRadius: scale(12),
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: scale(15),
    fontFamily: FontFamily.monasans.bold,
  },
  closedBanner: {
    marginHorizontal: scale(16),
    marginTop: scale(12),
    padding: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  closedBannerText: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.medium,
    textAlign: 'center',
  },
});

export default FnBCheckoutScreen;
