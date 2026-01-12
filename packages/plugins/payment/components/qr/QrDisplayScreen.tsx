import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScanBarcode } from 'iconsax-react-nativejs';
import {
    scale,
    moderateScale,
    moderateVerticalScale,
    getHorizontalPadding,
    getMinTouchTarget,
    getResponsiveFontSize,
    FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

const { width } = Dimensions.get('window');

interface QrDisplayScreenProps {
    isActive: boolean;
    selectedBalance?: 'plafon' | 'makan' | 'utama';
}

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

export const QrDisplayScreen: React.FC<QrDisplayScreenProps> = ({ isActive, selectedBalance }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [amount, setAmount] = useState('');
    const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);

    const formatCurrency = useCallback((value: string): string => {
        const numericValue = value.replace(/\D/g, '');
        if (!numericValue) return '';
        return parseInt(numericValue, 10).toLocaleString('id-ID');
    }, []);

    const handleAmountChange = useCallback((text: string) => {
        const numericValue = text.replace(/\D/g, '');
        setAmount(numericValue);
        setSelectedQuickAmount(null);
    }, []);

    const handleQuickAmount = useCallback((quickAmount: number) => {
        setAmount(quickAmount.toString());
        setSelectedQuickAmount(quickAmount);
    }, []);

    const handleGenerateQR = useCallback(() => {
        const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
        if (numericAmount > 0) {
            console.log('Generate QR with amount:', numericAmount, 'Balance:', selectedBalance);
        }
    }, [amount, selectedBalance]);

    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    const displayAmount = numericAmount > 0 ? formatCurrency(amount) : '';
    const canGenerateQR = numericAmount > 0;

    const balanceLabel = useMemo(() => {
        switch (selectedBalance) {
            case 'plafon':
                return t('qr.balancePlafon') || 'Saldo Plafon';
            case 'makan':
                return t('qr.balanceMakan') || 'Saldo Makan';
            case 'utama':
                return t('qr.balanceUtama') || 'Saldo Utama';
            default:
                return t('qr.balancePlafon') || 'Saldo Plafon';
        }
    }, [selectedBalance, t]);

    if (!isActive) {
        return null;
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background, width }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.content, { paddingHorizontal: getHorizontalPadding() }]}>
                    {/* Balance Info Card */}
                    <View style={[styles.balanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
                            {t('qr.selectedBalance') || 'Saldo yang Dipilih'}
                        </Text>
                        <Text style={[styles.balanceValue, { color: colors.text }]}>
                            {balanceLabel}
                        </Text>
                    </View>

                    {/* Nominal Input Section */}
                    <View style={styles.inputSection}>
                        <Text style={[styles.sectionLabel, { color: colors.text }]}>
                            {t('qr.amount') || 'Masukkan Nominal'}
                        </Text>
                        
                        <View style={[styles.amountContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.currencyPrefix, { color: colors.text }]}>Rp</Text>
                            <TextInput
                                style={[styles.amountInput, { color: colors.text }]}
                                value={displayAmount}
                                onChangeText={handleAmountChange}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                selectTextOnFocus
                            />
                        </View>

                        {/* Quick Access Buttons */}
                        <Text style={[styles.quickAccessLabel, { color: colors.textSecondary }]}>
                            {t('qr.quickAmount') || 'Nominal Cepat'}
                        </Text>
                        <View style={styles.quickAccessContainer}>
                            {QUICK_AMOUNTS.map((quickAmount) => {
                                const isSelected = selectedQuickAmount === quickAmount || 
                                    (numericAmount === quickAmount && amount !== '');
                                return (
                                    <TouchableOpacity
                                        key={quickAmount}
                                        style={[
                                            styles.quickAccessButton,
                                            {
                                                backgroundColor: isSelected ? colors.primary : colors.surface,
                                                borderColor: isSelected ? colors.primary : colors.border,
                                            },
                                        ]}
                                        onPress={() => handleQuickAmount(quickAmount)}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={[
                                                styles.quickAccessButtonText,
                                                {
                                                    color: isSelected ? colors.surface : colors.text,
                                                },
                                            ]}
                                        >
                                            {formatCurrency(quickAmount.toString())}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* QR Code Preview Placeholder */}
                    {canGenerateQR && (
                        <View style={styles.qrPreviewSection}>
                            <View style={[styles.qrPreviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={[styles.qrCodePlaceholder, { backgroundColor: colors.background }]}>
                                    <ScanBarcode size={scale(120)} color={colors.textSecondary} variant="Bold" />
                                    <Text style={[styles.qrPlaceholderText, { color: colors.textSecondary }]}>
                                        {t('qr.qrCodePreview') || 'Preview QR Code'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Generate QR Button */}
            <SafeAreaView style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <View style={{ paddingHorizontal: getHorizontalPadding(), paddingBottom: insets.bottom }}>
                    <TouchableOpacity
                        style={[
                            styles.generateButton,
                            {
                                backgroundColor: canGenerateQR ? colors.primary : colors.border,
                                opacity: canGenerateQR ? 1 : 0.5,
                            },
                        ]}
                        onPress={handleGenerateQR}
                        disabled={!canGenerateQR}
                        activeOpacity={0.8}
                    >
                        <ScanBarcode size={scale(20)} color={colors.surface} variant="Bold" />
                        <Text style={[styles.generateButtonText, { color: colors.surface }]}>
                            {t('qr.generateQR') || 'Buat Kode QR'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const minTouchTarget = getMinTouchTarget();
const horizontalPadding = getHorizontalPadding();

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: moderateVerticalScale(24),
        paddingBottom: moderateVerticalScale(100),
    },
    content: {
        flex: 1,
    },
    balanceCard: {
        padding: moderateScale(16),
        borderRadius: scale(16),
        borderWidth: 1,
        marginBottom: moderateVerticalScale(24),
    },
    balanceLabel: {
        fontSize: getResponsiveFontSize('small'),
        fontFamily: FontFamily.monasans.regular,
        marginBottom: moderateVerticalScale(4),
    },
    balanceValue: {
        fontSize: getResponsiveFontSize('medium'),
        fontFamily: FontFamily.monasans.semiBold,
    },
    inputSection: {
        marginBottom: moderateVerticalScale(32),
    },
    sectionLabel: {
        fontSize: getResponsiveFontSize('medium'),
        fontFamily: FontFamily.monasans.semiBold,
        marginBottom: moderateVerticalScale(12),
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: moderateVerticalScale(20),
        borderRadius: scale(16),
        borderWidth: 1,
        marginBottom: moderateVerticalScale(16),
    },
    currencyPrefix: {
        fontSize: getResponsiveFontSize('xlarge'),
        fontFamily: FontFamily.monasans.bold,
        marginRight: scale(12),
    },
    amountInput: {
        flex: 1,
        fontSize: getResponsiveFontSize('xlarge'),
        fontFamily: FontFamily.monasans.bold,
        padding: 0,
    },
    quickAccessLabel: {
        fontSize: getResponsiveFontSize('small'),
        fontFamily: FontFamily.monasans.regular,
        marginBottom: moderateVerticalScale(12),
    },
    quickAccessContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
    },
    quickAccessButton: {
        flex: 1,
        minWidth: scale(100),
        paddingVertical: moderateVerticalScale(12),
        borderRadius: scale(12),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: minTouchTarget,
    },
    quickAccessButtonText: {
        fontSize: getResponsiveFontSize('small'),
        fontFamily: FontFamily.monasans.semiBold,
    },
    qrPreviewSection: {
        marginTop: moderateVerticalScale(8),
    },
    qrPreviewCard: {
        padding: moderateScale(24),
        borderRadius: scale(16),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrCodePlaceholder: {
        width: scale(240),
        height: scale(240),
        borderRadius: scale(16),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: moderateVerticalScale(12),
    },
    qrPlaceholderText: {
        fontSize: getResponsiveFontSize('small'),
        fontFamily: FontFamily.monasans.regular,
        marginTop: moderateVerticalScale(8),
    },
    footer: {
        borderTopWidth: 1,
        paddingTop: moderateVerticalScale(16),
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
        width: '100%',
        paddingVertical: moderateVerticalScale(16),
        borderRadius: scale(16),
        minHeight: minTouchTarget,
    },
    generateButtonText: {
        fontSize: getResponsiveFontSize('medium'),
        fontFamily: FontFamily.monasans.semiBold,
    },
});
