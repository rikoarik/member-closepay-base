import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft2,
  ArrowRight2,
  Wallet,
  Card,
  Bank,
  ArrowDown2,
  Lock,
} from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { scale, getHorizontalPadding, FontFamily, moderateVerticalScale } from '@core/config';

// Icons mapping based on user design
// GoPay: Wallet (Blue)
// OVO: Wallet/Card (Purple)
// Dana: Wallet (Sky)
// VA: Bank (Slate)
// CC: Card (Slate)

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

type PaymentMethod = 'gopay' | 'ovo' | 'dana' | 'va-bca' | 'va-mandiri' | 'va-bni' | 'cc';

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  icon: any; // Icon component
  color: string;
  bgColor: string;
  type: 'wallet' | 'va' | 'cc';
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'gopay',
    label: 'GoPay',
    icon: Wallet,
    color: '#3B82F6', // blue-500
    bgColor: '#EFF6FF', // blue-50
    type: 'wallet',
  },
  {
    id: 'ovo',
    label: 'OVO',
    icon: Wallet, // Using Wallet as generic for now
    color: '#A855F7', // purple-500
    bgColor: '#FAF5FF', // purple-50
    type: 'wallet',
  },
  {
    id: 'dana',
    label: 'Dana',
    icon: Wallet,
    color: '#0EA5E9', // sky-500
    bgColor: '#F0F9FF', // sky-50
    type: 'wallet',
  },
  {
    id: 'va-bca',
    label: 'BCA Virtual Account',
    icon: Bank,
    color: '#475569', // slate-600
    bgColor: '#F8FAFC', // slate-50
    type: 'va',
  },
  {
    id: 'va-mandiri',
    label: 'Mandiri Virtual Account',
    icon: Bank,
    color: '#475569',
    bgColor: '#F8FAFC',
    type: 'va',
  },
  {
    id: 'va-bni',
    label: 'BNI Virtual Account',
    icon: Bank,
    color: '#475569',
    bgColor: '#F8FAFC',
    type: 'va',
  },
  {
    id: 'cc',
    label: 'Kartu Kredit / Debit',
    icon: Card,
    color: '#475569',
    bgColor: '#F8FAFC',
    type: 'cc',
  },
];

export const PaymentSelectionScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const params = route.params as
    | {
        totalAmount: number;
        targetScreen?: string;
        targetParams?: any;
      }
    | undefined;
  const totalAmount = params?.totalAmount || 0;
  const targetScreen = params?.targetScreen;
  const targetParams = params?.targetParams;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('gopay');

  const renderSection = (title: string, type: 'wallet' | 'va' | 'cc') => {
    const methods = PAYMENT_METHODS.filter((m) => m.type === type);

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
        <View style={styles.methodList}>
          {methods.map((method) => {
            const isSelected = selectedMethod === method.id;
            const Icon = method.icon;

            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primary : '#F1F5F9', // slate-100
                  },
                  isSelected && { backgroundColor: colors.primary + '0D' }, // primary with low opacity
                ]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.8}
              >
                <View style={styles.methodLeft}>
                  <View style={[styles.iconBox, { backgroundColor: method.bgColor }]}>
                    <Icon size={scale(20)} color={method.color} variant="Bold" />
                  </View>
                  <Text style={[styles.methodLabel, { color: colors.text }]}>{method.label}</Text>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: isSelected ? colors.primary : '#CBD5E1' }, // slate-300
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F6F8F7' }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 12), backgroundColor: 'rgba(255,255,255,0.8)' },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pilih Metode Pembayaran</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + scale(120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              TOTAL TAGIHAN
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              Rp {totalAmount.toLocaleString('id-ID')}
            </Text>
          </View>
          <TouchableOpacity style={styles.detailButton}>
            <Text style={[styles.detailButtonText, { color: colors.primary }]}>Detail</Text>
            <ArrowDown2 size={scale(16)} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {renderSection('Dompet Digital', 'wallet')}
        {renderSection('Virtual Account', 'va')}
        {renderSection('Kartu Kredit/Debit', 'cc')}

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Lock size={scale(14)} color={colors.textSecondary} variant="Bold" />
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            Secure & Encrypted Payment
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: 'rgba(255,255,255,0.9)',
            paddingBottom: Math.max(insets.bottom, 24),
            borderColor: '#F1F5F9',
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            if (targetScreen) {
              // @ts-ignore
              navigation.replace(targetScreen, targetParams);
            } else {
              console.log('Pay with', selectedMethod);
              navigation.goBack();
            }
          }}
        >
          <View>
            <Text style={styles.payTotalLabel}>TOTAL BAYAR</Text>
            <Text style={styles.payTotalValue}>Rp {totalAmount.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.payAction}>
            <Text style={styles.payActionText}>Bayar Sekarang</Text>
            <ArrowRight2 size={scale(20)} color="#FFF" variant="Bold" />
          </View>
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
    paddingHorizontal: scale(16),
    paddingBottom: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9', // slate-200
    zIndex: 10,
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: scale(16),
    fontFamily: fontSemiBold,
    flex: 1,
    textAlign: 'center',
    marginRight: scale(40), // Balance back button
  },
  headerSpacer: {
    width: 0,
  },
  contentContainer: {
    padding: scale(16),
    gap: scale(24),
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9', // slate-100
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: scale(10),
    fontFamily: fontSemiBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: scale(2),
  },
  summaryValue: {
    fontSize: scale(18),
    fontFamily: fontBold,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  detailButtonText: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
  },
  section: {
    gap: scale(12),
  },
  sectionTitle: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: scale(4),
  },
  methodList: {
    gap: scale(8),
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  iconBox: {
    width: scale(40),
    height: scale(40),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodLabel: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },
  radioOuter: {
    width: scale(20),
    height: scale(20),
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioInner: {
    width: scale(10),
    height: scale(10),
    borderRadius: 5,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    opacity: 0.5,
    paddingTop: scale(8),
  },
  securityText: {
    fontSize: scale(9),
    fontFamily: fontBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(24),
    paddingTop: scale(24),
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(16),
    paddingHorizontal: scale(24),
    borderRadius: 12,
    shadowColor: '#38e07b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  payTotalLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: scale(9),
    fontFamily: fontBold,
    textTransform: 'uppercase',
    marginBottom: scale(2),
  },
  payTotalValue: {
    color: '#FFF',
    fontSize: scale(14),
    fontFamily: fontBold,
  },
  payAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  payActionText: {
    color: '#FFF',
    fontSize: scale(16),
    fontFamily: fontBold,
  },
});
