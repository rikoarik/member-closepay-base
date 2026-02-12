import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, InfoCircle, TickCircle } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { scale, FontFamily, ScreenHeader } from '@core/config';
import { useTranslation } from '@core/i18n';
import { paymentService } from '@plugins/payment';
import { getInvoiceById } from '../../hooks';
import type { Invoice } from '../../models';
import { InvoicePaymentPinBottomSheet } from '../sheets/InvoicePaymentPinBottomSheet';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';
const fontExtraBold = fontBold;

export const InvoicePaymentScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const params = route.params as { invoiceId?: string; invoice?: Invoice } | undefined;
  const invoiceId = params?.invoiceId || params?.invoice?.id;
  const invoiceData = invoiceId ? getInvoiceById(invoiceId) : params?.invoice;

  if (!invoiceData) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      >
        <ScreenHeader title={t('invoice.paymentTitle')} />
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>Invoice not found</Text>
        </View>
      </View>
    );
  }

  // Local state for payment amount
  // Default to full remaining amount
  const initialAmount = invoiceData.amount - (invoiceData.amountPaid || 0);
  const allowInstallment = invoiceData.allowInstallment ?? false;

  // Mode: Full Payment vs Manual (Installment)
  // If installment NOT allowed, force Pay Full Mode (true)
  // If installment allowed, default to Pay Full Mode (true)
  const [isPayFullMode, setIsPayFullMode] = useState<boolean>(true);
  const [payAmount, setPayAmount] = useState<string>(initialAmount.toString());
  const [showPinSheet, setShowPinSheet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Effect to handle mode switching
  useEffect(() => {
    if (isPayFullMode) {
      setPayAmount(initialAmount.toString());
    }
  }, [isPayFullMode, initialAmount]);

  const handleModeToggle = () => {
    if (!allowInstallment) return; // Cannot toggle if installment not allowed
    setIsPayFullMode((prev) => !prev);
  };

  const handleAmountChange = (text: string) => {
    // Only allow changing amount if NOT in Pay Full Mode
    if (isPayFullMode) return;

    // Only allow numeric input
    const numeric = text.replace(/\D/g, '');
    setPayAmount(numeric);
  };

  const handlePayNow = () => {
    setShowPinSheet(true);
  };

  const handlePinComplete = async (pin: string) => {
    setShowPinSheet(false);
    setIsProcessing(true);

    try {
      const amountNum = parseInt(payAmount.replace(/\D/g, ''), 10);
      const result = await paymentService.payWithBalance(amountNum, invoiceData.id, {
        invoiceNumber: invoiceData.invoiceNumber,
        pin,
      });

      if (result.status === 'success') {
        (navigation as any).navigate('InvoicePaymentSuccess', {
          amount: amountNum,
          transactionId: result.transactionId,
          invoiceId: invoiceData.id,
          recipientName: invoiceData.billedFrom,
          invoiceNumber: invoiceData.invoiceNumber,
        });
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      // TODO: Show error toast/alert
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedAmount = useMemo(() => {
    const val = parseInt(payAmount.replace(/\D/g, ''), 10);
    if (isNaN(val)) return 'Rp0';
    return `Rp${val.toLocaleString('id-ID')}`;
  }, [payAmount]);

  const dueDateFormatted = new Date(invoiceData.dueDate).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ScreenHeader title={t('invoice.paymentTitle')} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Nominal Bayar Section */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.textTertiary }]}>
            {t('invoice.paymentAmount')?.toUpperCase()}
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.amountInput,
                {
                  color: isPayFullMode ? colors.textSecondary : colors.text,
                  opacity: isPayFullMode ? 0.7 : 1,
                },
              ]}
              value={formattedAmount}
              onChangeText={(text) => handleAmountChange(text)}
              keyboardType="numeric"
              editable={!isPayFullMode}
            />

            {/* Pay Full Toggle / Status */}
            <TouchableOpacity
              style={styles.fullPaymentBadge}
              activeOpacity={allowInstallment ? 0.7 : 1}
              onPress={handleModeToggle}
              disabled={!allowInstallment}
            >
              <TickCircle
                size={scale(16)}
                color={isPayFullMode ? colors.success : colors.textTertiary}
                variant={isPayFullMode ? 'Bold' : 'Linear'}
              />
              <Text
                style={[
                  styles.fullPaymentText,
                  { color: isPayFullMode ? colors.textSecondary : colors.textTertiary },
                ]}
              >
                {t('invoice.payFull')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Warning if installment not allowed */}
        {!allowInstallment && (
          <View style={[styles.warningBox, { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }]}>
            <InfoCircle size={scale(20)} color="#F59E0B" variant="Bold" />
            <Text style={[styles.warningText, { color: '#92400E' }]}>
              {t('invoice.installmentNotAllowed')}
            </Text>
          </View>
        )}

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View
            style={[
              styles.detailRow,
              {
                borderBottomColor: colors.borderLight,
                borderBottomWidth: 1,
                paddingBottom: scale(16),
              },
            ]}
          >
            <View>
              <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>
                {t('invoice.invoiceId')?.toUpperCase()}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {invoiceData.invoiceNumber || invoiceData.id}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>
                {t('invoice.dueDate')?.toUpperCase()}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{dueDateFormatted}</Text>
            </View>
          </View>

          <View style={{ paddingTop: scale(16) }}>
            <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>
              {t('invoice.totalToPay')?.toUpperCase()}
            </Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>
              Rp {initialAmount.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.payButton,
            { backgroundColor: isProcessing ? colors.border : colors.primary },
          ]}
          activeOpacity={0.8}
          onPress={handlePayNow}
          disabled={isProcessing}
        >
          <Text style={[styles.payButtonText, { color: colors.surface }]}>
            {isProcessing ? 'Memproses...' : t('invoice.payNow')}
          </Text>
        </TouchableOpacity>

        {/* Home Indicator bar handled by OS mostly, but added spacing */}
      </View>

      <InvoicePaymentPinBottomSheet
        visible={showPinSheet}
        onClose={() => setShowPinSheet(false)}
        onComplete={handlePinComplete}
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
    paddingHorizontal: scale(20),
    paddingBottom: scale(10),
    backgroundColor: 'transparent',
  },
  backBtn: {
    padding: scale(4),
    marginLeft: -scale(4),
  },
  headerTitle: {
    fontFamily: fontSemiBold,
    fontSize: scale(16),
  },
  content: {
    paddingHorizontal: scale(24),
    paddingTop: scale(20),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Input Section
  inputSection: {
    marginBottom: scale(32),
  },
  label: {
    fontFamily: fontBold,
    fontSize: scale(10),
    letterSpacing: 1.5,
    marginBottom: scale(12),
  },
  inputWrapper: {
    position: 'relative',
  },
  amountInput: {
    fontFamily: fontBold,
    fontSize: scale(32),
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  fullPaymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(12),
    gap: scale(6),
  },
  fullPaymentText: {
    fontFamily: fontSemiBold,
    fontSize: scale(12),
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    padding: scale(12),
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: scale(32),
  },
  warningText: {
    flex: 1,
    fontFamily: fontSemiBold,
    fontSize: scale(12),
    lineHeight: scale(16),
  },

  // Details
  detailsSection: {
    gap: scale(24),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontFamily: fontBold,
    fontSize: scale(10),
    letterSpacing: 1.5,
    marginBottom: scale(4),
  },
  detailValue: {
    fontFamily: fontSemiBold,
    fontSize: scale(14),
  },
  totalAmount: {
    fontFamily: fontExtraBold,
    fontSize: scale(24),
    marginTop: scale(8),
  },

  // Bottom
  bottomContainer: {
    paddingHorizontal: scale(24),
    paddingTop: scale(16),
    boxShadow: '0px -4px 8px rgba(0, 0, 0, 0.05)',
  },
  payButton: {
    height: scale(56),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F87171', // Primary color shadow ideally
  },
  payButtonText: {
    fontFamily: fontBold,
    fontSize: scale(15),
  },
});
