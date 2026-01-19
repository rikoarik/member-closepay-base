/**
 * CheckoutScreen Component
 * Handles direct checkout for Buy Now purchases
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft2, Location, Wallet3, TickCircle } from 'iconsax-react-nativejs';
import {
    scale,
    moderateVerticalScale,
    getHorizontalPadding,
    FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import type { Product } from '../shared/ProductCard';

type CheckoutRouteParams = {
    Checkout: {
        product: Product;
        quantity: number;
    };
};

const formatPrice = (price: number): string => {
    return `Rp ${price.toLocaleString('id-ID')}`;
};

const SHIPPING_FEE = 15000;

const PAYMENT_METHODS = [
    { id: 'cod', name: 'Cash on Delivery (COD)', icon: '💵' },
    { id: 'transfer', name: 'Transfer Bank', icon: '🏦' },
    { id: 'ewallet', name: 'E-Wallet', icon: '📱' },
];

export const CheckoutScreen: React.FC = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<CheckoutRouteParams, 'Checkout'>>();
    const insets = useSafeAreaInsets();
    const horizontalPadding = getHorizontalPadding();

    const params = route.params || {};
    const { product, quantity = 1 } = params as CheckoutRouteParams['Checkout'];

    if (!product) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text }}>Produk tidak ditemukan</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 20 }}>
                    <Text style={{ color: colors.primary }}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const [address, setAddress] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<string>('cod');

    const subtotal = product.price * quantity;
    const total = subtotal + SHIPPING_FEE;

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handlePlaceOrder = useCallback(() => {
        // TODO: Implement actual order submission
        console.log('Order placed:', {
            product,
            quantity,
            address,
            paymentMethod: selectedPayment,
            total,
        });
        // Navigate to success screen or back
        navigation.goBack();
    }, [product, quantity, address, selectedPayment, total, navigation]);

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
                    onPress={handleBack}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {t('marketplace.checkout')}
                </Text>

                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: insets.bottom + moderateVerticalScale(100),
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Order Summary */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('marketplace.orderSummary')}
                    </Text>

                    <View style={styles.productRow}>
                        <Image
                            source={{
                                uri: product.imageUrl || 'https://via.placeholder.com/100x100/CCCCCC/FFFFFF?text=Product',
                            }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />

                        <View style={styles.productInfo}>
                            <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                                {product.name}
                            </Text>
                            <Text style={[styles.productPrice, { color: colors.primary }]}>
                                {formatPrice(product.price)}
                            </Text>
                            <Text style={[styles.quantityText, { color: colors.textSecondary }]}>
                                {t('marketplace.quantity')}: {quantity}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                            Subtotal
                        </Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            {formatPrice(subtotal)}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                            {t('marketplace.shippingFee')}
                        </Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            {formatPrice(SHIPPING_FEE)}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.summaryRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>
                            {t('marketplace.total')}
                        </Text>
                        <Text style={[styles.totalValue, { color: colors.primary }]}>
                            {formatPrice(total)}
                        </Text>
                    </View>
                </View>

                {/* Shipping Address */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <Location size={scale(20)} color={colors.primary} variant="Bold" />
                        <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: scale(8) }]}>
                            {t('marketplace.shippingAddress')}
                        </Text>
                    </View>

                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                                color: colors.text,
                            },
                        ]}
                        placeholder={t('marketplace.enterAddress')}
                        placeholderTextColor={colors.textSecondary}
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Payment Method */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <Wallet3 size={scale(20)} color={colors.primary} variant="Bold" />
                        <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: scale(8) }]}>
                            {t('marketplace.paymentMethod')}
                        </Text>
                    </View>

                    {PAYMENT_METHODS.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentOption,
                                {
                                    borderColor: selectedPayment === method.id ? colors.primary : colors.border,
                                    backgroundColor: selectedPayment === method.id ? colors.primaryLight : 'transparent',
                                },
                            ]}
                            onPress={() => setSelectedPayment(method.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.paymentIcon}>{method.icon}</Text>
                            <Text
                                style={[
                                    styles.paymentName,
                                    {
                                        color: selectedPayment === method.id ? colors.primary : colors.text,
                                    },
                                ]}
                            >
                                {method.name}
                            </Text>
                            {selectedPayment === method.id && (
                                <TickCircle size={scale(20)} color={colors.primary} variant="Bold" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Bar */}
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
                <View style={styles.totalContainer}>
                    <Text style={[styles.bottomTotalLabel, { color: colors.textSecondary }]}>
                        {t('marketplace.total')}
                    </Text>
                    <Text style={[styles.bottomTotalValue, { color: colors.primary }]}>
                        {formatPrice(total)}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.placeOrderButton, { backgroundColor: colors.primary }]}
                    onPress={handlePlaceOrder}
                    activeOpacity={0.8}
                >
                    <Text style={styles.placeOrderButtonText}>
                        {t('marketplace.placeOrder')}
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
        flex: 1,
        fontSize: scale(20),
        fontFamily: FontFamily.monasans.bold,
        textAlign: 'center',
    },
    headerSpacer: {
        width: scale(32),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: moderateVerticalScale(16),
    },
    section: {
        borderRadius: scale(12),
        padding: scale(16),
        marginBottom: moderateVerticalScale(16),
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(12),
    },
    sectionTitle: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
    },
    productRow: {
        flexDirection: 'row',
        marginBottom: scale(12),
    },
    productImage: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(8),
    },
    productInfo: {
        flex: 1,
        marginLeft: scale(12),
        justifyContent: 'center',
    },
    productName: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.semiBold,
        marginBottom: scale(4),
    },
    productPrice: {
        fontSize: scale(15),
        fontFamily: FontFamily.monasans.bold,
        marginBottom: scale(2),
    },
    quantityText: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.regular,
    },
    divider: {
        height: 1,
        marginVertical: scale(12),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    summaryLabel: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
    },
    summaryValue: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.semiBold,
    },
    totalLabel: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
    },
    totalValue: {
        fontSize: scale(18),
        fontFamily: FontFamily.monasans.bold,
    },
    input: {
        borderRadius: scale(8),
        borderWidth: 1,
        padding: scale(12),
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
        minHeight: scale(80),
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(12),
        borderRadius: scale(8),
        borderWidth: 2,
        marginBottom: scale(8),
    },
    paymentIcon: {
        fontSize: scale(24),
        marginRight: scale(12),
    },
    paymentName: {
        flex: 1,
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.medium,
    },
    bottomBar: {
        paddingTop: moderateVerticalScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateVerticalScale(12),
    },
    bottomTotalLabel: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.regular,
    },
    bottomTotalValue: {
        fontSize: scale(20),
        fontFamily: FontFamily.monasans.bold,
    },
    placeOrderButton: {
        paddingVertical: moderateVerticalScale(14),
        borderRadius: scale(12),
        alignItems: 'center',
    },
    placeOrderButtonText: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold,
        color: '#FFFFFF',
    },
});

export default CheckoutScreen;
