/**
 * FnBCartDetailSheet Component
 * Bottom sheet for viewing and editing cart items
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { CloseCircle, Add, Minus, Trash, ShoppingCart, Edit2 } from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, FontFamily, getHorizontalPadding } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import type { FnBOrderItem } from '../../models';

interface CartItem extends FnBOrderItem {
  cartId: string;
}

interface FnBCartDetailSheetProps {
  visible: boolean;
  cartItems: CartItem[];
  subtotal: number;
  onClose: () => void;
  onUpdateQuantity: (cartId: string, quantity: number) => void;
  onRemoveItem: (cartId: string) => void;
  onEditItem: (cartItem: CartItem) => void;
  onCheckout: () => void;
}

const formatPrice = (price: number): string => {
  return `Rp ${price.toLocaleString('id-ID')}`;
};

export const FnBCartDetailSheet: React.FC<FnBCartDetailSheetProps> = ({
  visible,
  cartItems,
  subtotal,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
  onCheckout,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const horizontalPadding = getHorizontalPadding();

  const handleIncrement = useCallback(
    (cartId: string, currentQty: number) => {
      onUpdateQuantity(cartId, currentQty + 1);
    },
    [onUpdateQuantity]
  );

  const handleDecrement = useCallback(
    (cartId: string, currentQty: number) => {
      if (currentQty <= 1) {
        onRemoveItem(cartId);
      } else {
        onUpdateQuantity(cartId, currentQty - 1);
      }
    },
    [onUpdateQuantity, onRemoveItem]
  );

  const renderCartItem = (cartItem: CartItem, index: number) => {
    const item = cartItem.item;
    const isLast = index === cartItems.length - 1;

    return (
      <TouchableOpacity
        key={cartItem.cartId}
        style={[
          styles.cartItem,
          { borderBottomColor: colors.border },
          isLast && { borderBottomWidth: 0 },
        ]}
        onPress={() => onEditItem(cartItem)}
        activeOpacity={0.7}
      >
        {/* Edit Button overlay (optional) or just rely on row press, but plan asked for explicit button.
                    Let's put an edit button on the right side or top right.
                    Actually, let's put it next to the name or in a visible spot.
                 */}

        {/* Item Image */}
        <View style={styles.itemImageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.placeholderEmoji}>🍽️</Text>
            </View>
          )}
        </View>

        {/* Item Info */}
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Variant info */}
          {cartItem.variant && (
            <Text style={[styles.itemVariant, { color: colors.textSecondary }]}>
              {cartItem.variant.name}
            </Text>
          )}

          {/* Addons info */}
          {cartItem.addons && cartItem.addons.length > 0 && (
            <Text style={[styles.itemVariant, { color: colors.textSecondary }]} numberOfLines={1}>
              + {cartItem.addons.map((a) => a.name).join(', ')}
            </Text>
          )}

          {/* Notes */}
          {cartItem.notes && (
            <Text style={[styles.itemNotes, { color: colors.textSecondary }]} numberOfLines={1}>
              📝 {cartItem.notes}
            </Text>
          )}

          <View style={styles.priceRow}>
            <Text style={[styles.itemPrice, { color: colors.primary }]}>
              {formatPrice(cartItem.subtotal)}
            </Text>

            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => onEditItem(cartItem)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Edit2 size={scale(14)} color={colors.primary} variant="Bold" />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                {t('common.edit') || 'Ubah'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={(e) => {
              e.stopPropagation(); // Prevent opening edit sheet
              handleDecrement(cartItem.cartId, cartItem.quantity);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {cartItem.quantity === 1 ? (
              <Trash size={scale(14)} color={colors.error} variant="Linear" />
            ) : (
              <Minus size={scale(14)} color={colors.text} variant="Linear" />
            )}
          </TouchableOpacity>

          <Text style={[styles.quantityText, { color: colors.text }]}>{cartItem.quantity}</Text>

          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: colors.primary }]}
            onPress={(e) => {
              e.stopPropagation(); // Prevent opening edit sheet
              handleIncrement(cartItem.cartId, cartItem.quantity);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Add size={scale(14)} color={colors.surface} variant="Linear" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View
            style={[
              styles.header,
              { paddingHorizontal: horizontalPadding, borderBottomColor: colors.border },
            ]}
          >
            <View style={styles.headerLeft}>
              <ShoppingCart size={scale(22)} color={colors.text} variant="Bold" />
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {t('fnb.cart') || 'Keranjang'}
              </Text>
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: colors.surface }]}>
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <CloseCircle size={scale(28)} color={colors.textSecondary} variant="Bold" />
            </TouchableOpacity>
          </View>

          {/* Cart Items */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
            showsVerticalScrollIndicator={false}
          >
            {cartItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('fnb.emptyCart') || 'Keranjang kosong'}
                </Text>
              </View>
            ) : (
              cartItems.map((item, index) => renderCartItem(item, index))
            )}
          </ScrollView>

          {/* Bottom Bar - Summary & Checkout */}
          {cartItems.length > 0 && (
            <View
              style={[
                styles.bottomBar,
                {
                  backgroundColor: colors.surface,
                  paddingHorizontal: horizontalPadding,
                  borderTopColor: colors.border,
                },
              ]}
            >
              {/* Subtotal */}
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {t('fnb.subtotal') || 'Subtotal'}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {formatPrice(subtotal)}
                </Text>
              </View>

              {/* Checkout Button */}
              <TouchableOpacity
                style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
                onPress={onCheckout}
                activeOpacity={0.8}
              >
                <Text style={[styles.checkoutButtonText, { color: colors.surface }]}>
                  {t('fnb.checkout') || 'Checkout'} - {formatPrice(subtotal)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '80%',
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: scale(12),
    paddingBottom: scale(8),
  },
  handle: {
    width: scale(40),
    height: scale(4),
    borderRadius: scale(2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateVerticalScale(12),
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  headerTitle: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.bold,
  },
  badge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(12),
    minWidth: scale(24),
    alignItems: 'center',
  },
  badgeText: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: moderateVerticalScale(8),
  },
  emptyContainer: {
    paddingVertical: moderateVerticalScale(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.regular,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: moderateVerticalScale(12),
    borderBottomWidth: 1,
  },
  itemImageContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(8),
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: scale(24),
  },
  itemInfo: {
    flex: 1,
    marginLeft: scale(12),
    marginRight: scale(8),
    justifyContent: 'center',
  },
  itemName: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: scale(2),
  },
  itemVariant: {
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: scale(2),
  },
  itemNotes: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.regular,
    fontStyle: 'italic',
    marginBottom: scale(2),
  },
  itemPrice: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.bold,
    marginTop: scale(4),
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(6),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quantityText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
    marginHorizontal: scale(12),
    minWidth: scale(20),
    textAlign: 'center',
  },
  bottomBar: {
    paddingTop: moderateVerticalScale(12),
    paddingBottom: moderateVerticalScale(20),
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  summaryLabel: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.regular,
  },
  summaryValue: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
  },
  checkoutButton: {
    paddingVertical: moderateVerticalScale(14),
    borderRadius: scale(12),
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scale(4),
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(6),
    gap: scale(4),
  },
  editButtonText: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.medium,
  },
});

export default FnBCartDetailSheet;
