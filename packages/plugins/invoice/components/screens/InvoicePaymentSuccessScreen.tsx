import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { TickCircle, Copy, DocumentDownload } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import {
  scale,
  FontFamily,
  getHorizontalPadding,
  moderateVerticalScale,
  getResponsiveFontSize,
} from '@core/config';
import { useTranslation } from '@core/i18n';

export const InvoicePaymentSuccessScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { amount, transactionId, invoiceId, recipientName, recipientLogo } = route.params as {
    amount: number;
    transactionId: string;
    invoiceId: string;
    recipientName?: string;
    recipientLogo?: string;
  };

  const handleFinish = React.useCallback(() => {
    (navigation as any).navigate('InvoiceList');
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      // Intercept system back button on Android
      const onBackPress = () => {
        handleFinish();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [handleFinish])
  );

  useEffect(() => {
    // Intercept swipe back on iOS and other navigation back events
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // If we are already navigating to InvoiceList via handleFinish, don't intercept
      // This is a bit tricky with nested navigators, but for now we just want to
      // ensure that if they TRY to go back to payment, we redirect them.

      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault();
        handleFinish();
      }
    });

    return unsubscribe;
  }, [navigation, handleFinish]);

  const fontBold = FontFamily?.monasans?.bold ?? 'System';
  const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
  const fontMedium = FontFamily?.monasans?.medium ?? 'System';
  const fontRegular = FontFamily?.monasans?.regular ?? 'System';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.flex1}>
        <View style={styles.content}>
          {/* Success Indicator */}
          <View style={styles.indicatorContainer}>
            <View style={[styles.successCircle, { backgroundColor: '#DCFCE7' }]}>
              <TickCircle size={scale(48)} color="#22C55E" variant="Bold" />
            </View>
          </View>

          {/* Headline Text */}
          <View style={styles.headlineContainer}>
            <Text style={[styles.successText, { color: colors.text }]}>Pembayaran Berhasil</Text>
            <Text style={[styles.amountText, { color: colors.text }]}>
              Rp{amount.toLocaleString('id-ID')}
            </Text>
          </View>

          {/* Transaction Details Card */}
          <View
            style={[
              styles.detailsCard,
              { backgroundColor: colors.surface, borderColor: colors.borderLight },
            ]}
          >
            {/* ID Transaksi */}
            <View
              style={[
                styles.detailRow,
                styles.dashedBottom,
                { borderBottomColor: colors.borderLight },
              ]}
            >
              <View>
                <Text style={[styles.label, { color: colors.textTertiary }]}>ID Transaksi</Text>
                <Text style={[styles.value, { color: colors.text }]}>{transactionId}</Text>
              </View>
              <TouchableOpacity style={styles.copyButton}>
                <Copy size={scale(18)} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Row 2: Waktu Pembayaran */}
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>Waktu Pembayaran</Text>
              <Text style={[styles.valueText, { color: colors.text }]}>
                {new Date().toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}{' '}
                WIB
              </Text>
            </View>

            {/* Row 3: Metode Pembayaran */}
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>Metode Pembayaran</Text>
              <Text style={[styles.valueText, { color: colors.text }]}>Closepay Balance</Text>
            </View>

            {/* Row 4: Penerima */}
            <View style={[styles.infoRow, { marginBottom: 0 }]}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>Penerima</Text>
              <View style={styles.recipientContainer}>
                <View style={[styles.recipientLogo, { backgroundColor: colors.borderLight }]}>
                  {recipientLogo ? (
                    <Image source={{ uri: recipientLogo }} style={styles.logoImage} />
                  ) : (
                    <View style={styles.placeholderLogo} />
                  )}
                </View>
                <Text style={[styles.valueText, { color: colors.text }]} numberOfLines={1}>
                  {recipientName || 'PT Invoice Tagihan'}
                </Text>
              </View>
            </View>
          </View>

          {/* Decorative element */}
          <View style={styles.decorativeContainer}>
            <View style={[styles.decorativeBar, { backgroundColor: colors.borderLight }]} />
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, scale(20)) }]}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleFinish}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { color: colors.surface }]}>Selesai</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.primary + '4D' }]}
            onPress={() => {}} // Download functionality
            activeOpacity={0.8}
          >
            <DocumentDownload size={scale(20)} color={colors.primary} variant="Outline" />
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Download Resi
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: getHorizontalPadding(),
    alignItems: 'center',
    paddingTop: moderateVerticalScale(40),
  },
  indicatorContainer: {
    marginBottom: moderateVerticalScale(32),
  },
  successCircle: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(48),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: moderateVerticalScale(40),
  },
  successText: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(8),
  },
  amountText: {
    fontSize: scale(36),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: -1,
  },
  detailsCard: {
    width: '100%',
    borderRadius: scale(20),
    padding: scale(20),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(20),
    paddingBottom: moderateVerticalScale(20),
  },
  dashedBottom: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(20),
  },
  label: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
  },
  value: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginTop: scale(2),
  },
  valueText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
    textAlign: 'right',
  },
  copyButton: {
    padding: scale(6),
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    flex: 1,
    justifyContent: 'flex-end',
  },
  recipientLogo: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderLogo: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  decorativeContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: moderateVerticalScale(32),
    opacity: 0.3,
  },
  decorativeBar: {
    height: scale(4),
    width: scale(48),
    borderRadius: scale(2),
  },
  footer: {
    paddingHorizontal: getHorizontalPadding(),
    paddingTop: scale(16),
    gap: scale(12),
  },
  primaryButton: {
    width: '100%',
    height: scale(56),
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ee2b4b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
  secondaryButton: {
    width: '100%',
    height: scale(56),
    borderRadius: scale(16),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  secondaryButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
});
