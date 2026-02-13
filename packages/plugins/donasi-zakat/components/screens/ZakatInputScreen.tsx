import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft2,
  Clock,
  ArrowDown2,
  InfoCircle,
  Wallet,
  EyeSlash,
} from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  ScreenHeader,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

export const ZakatInputScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const initialAmount = route.params?.amount || '0';
  const initialType = route.params?.category || 'maal';

  const [amount, setAmount] = useState(initialAmount);
  const [zakatType, setZakatType] = useState(initialType);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '');
    if (numeric === '') {
      setAmount('0');
      return;
    }
    setAmount(formatIDR(parseInt(numeric, 10)));
  };

  const zakatTypes = [
    { label: 'Zakat Maal (Harta)', value: 'maal' },
    { label: 'Zakat Fitrah', value: 'fitrah' },
    { label: 'Zakat Profesi (Penghasilan)', value: 'profesi' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      <ScreenHeader
        title="Bayar Zakat"
        rightComponent={
          <TouchableOpacity onPress={() => (navigation as any).navigate('DonationHistory')}>
            <Clock size={scale(22)} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: colors.primary + '10' }]}>
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: colors.primary }]}>
              Suci Hartamu, Tenangkan Jiwamu
            </Text>
            <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>
              Zakat memberdayakan ummat dan mensucikan rezeki.
            </Text>
          </View>
          <View style={[styles.patternCircle, { backgroundColor: colors.primary + '08' }]} />
        </View>

        <View style={[styles.form, { paddingHorizontal: horizontalPadding }]}>
          {/* Jenis Zakat */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Jenis Zakat</Text>
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => {
                // Simplified selection
                Alert.alert(
                  'Pilih Jenis Zakat',
                  '',
                  zakatTypes.map((t) => ({
                    text: t.label,
                    onPress: () => setZakatType(t.value),
                  }))
                );
              }}
            >
              <Text style={[styles.selectorText, { color: colors.text }]}>
                {zakatTypes.find((t) => t.value === zakatType)?.label}
              </Text>
              <ArrowDown2 size={scale(20)} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Amount Input Card */}
          <View
            style={[
              styles.amountCard,
              { backgroundColor: colors.primary + '05', borderColor: colors.primary + '15' },
            ]}
          >
            <Text style={[styles.amountLabel, { color: colors.primary }]}>Nominal Zakat</Text>
            <View style={styles.amountInputRow}>
              <Text style={[styles.currencyPrefix, { color: colors.textTertiary }]}>Rp</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={[styles.amountFooter, { borderTopColor: colors.primary + '15' }]}>
              <TouchableOpacity
                style={styles.nisabLink}
                onPress={() => (navigation as any).navigate('ZakatCalculator')}
              >
                <InfoCircle size={scale(14)} color={colors.primary} variant="Outline" />
                <Text style={[styles.nisabLinkText, { color: colors.primary }]}>
                  Cek Nishab & Ketentuan
                </Text>
              </TouchableOpacity>
              <Text style={[styles.rateLabel, { color: colors.textTertiary }]}>WAJIB 2.5%</Text>
            </View>
          </View>

          {/* Niat Card */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Niat Zakat</Text>
            <View
              style={[
                styles.niatCard,
                { backgroundColor: colors.surface, shadowColor: colors.text },
              ]}
            >
              <Text style={[styles.niatArabic, { color: colors.text }]}>
                نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى
              </Text>
              <Text style={[styles.niatLatin, { color: colors.textSecondary }]}>
                "Nawaitu an ukhrija zakata maali fardhan lillahi ta’ala..."
              </Text>
              <Text style={[styles.niatTranslation, { color: colors.textTertiary }]}>
                (Saya berniat mengeluarkan zakat harta saya, fardhu karena Allah Ta'ala)
              </Text>
            </View>
          </View>

          {/* Anonymous Toggle */}
          <View style={[styles.toggleRow, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleIconWrap, { backgroundColor: colors.surface }]}>
                <EyeSlash size={scale(20)} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.toggleTitle, { color: colors.text }]}>
                  Tunaikan sebagai Anonim
                </Text>
                <Text style={[styles.toggleSub, { color: colors.textTertiary }]}>
                  NAMA TIDAK AKAN DITAMPILKAN
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor="#FFF"
              ios_backgroundColor={colors.borderLight}
              onValueChange={setIsAnonymous}
              value={isAnonymous}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderLight,
            paddingBottom: insets.bottom + scale(16),
          },
        ]}
      >
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Pembayaran</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>Rp {amount}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
          ]}
          onPress={() => Alert.alert('Payment coming soon')}
        >
          <Wallet size={scale(20)} color="#FFF" variant="Bold" />
          <Text style={styles.submitBtnText}>Bayar Zakat Sekarang</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scale(140),
  },
  banner: {
    marginHorizontal: scale(20),
    marginTop: scale(16),
    borderRadius: scale(16),
    padding: scale(20),
    height: scale(110),
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerTextContainer: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.bold,
    lineHeight: scale(22),
  },
  bannerDesc: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.regular,
    marginTop: scale(4),
  },
  patternCircle: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    position: 'absolute',
    right: scale(-20),
    bottom: scale(-40),
  },
  form: {
    marginTop: scale(24),
    gap: scale(24),
  },
  inputGroup: {
    gap: scale(8),
  },
  label: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.bold,
    marginLeft: scale(4),
  },
  selector: {
    height: scale(56),
    borderRadius: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
  },
  selectorText: {
    fontSize: scale(15),
    fontFamily: FontFamily.monasans.bold,
  },
  amountCard: {
    padding: scale(20),
    borderRadius: scale(16),
    borderWidth: 1,
  },
  amountLabel: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(12),
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: scale(24),
    fontFamily: FontFamily.monasans.bold,
    marginRight: scale(8),
  },
  amountInput: {
    fontSize: scale(36),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
    padding: 0,
  },
  amountFooter: {
    marginTop: scale(16),
    paddingTop: scale(16),
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nisabLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  nisabLinkText: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.medium,
  },
  rateLabel: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 0.5,
  },
  niatCard: {
    padding: scale(16),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: '#F1F1F1',
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  niatArabic: {
    fontSize: scale(20),
    textAlign: 'right',
    marginBottom: scale(12),
    lineHeight: scale(36),
  },
  niatLatin: {
    fontSize: scale(14),
    fontStyle: 'italic',
    fontFamily: FontFamily.monasans.regular,
    lineHeight: scale(20),
  },
  niatTranslation: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.regular,
    marginTop: scale(8),
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
    borderRadius: scale(16),
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  toggleIconWrap: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  toggleSub: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
    marginTop: scale(2),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: scale(20),
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
    paddingHorizontal: scale(8),
  },
  totalLabel: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
  },
  totalAmount: {
    fontSize: scale(20),
    fontFamily: FontFamily.monasans.bold,
  },
  submitBtn: {
    height: scale(56),
    borderRadius: scale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(12),
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: scale(16),
    fontFamily: FontFamily.monasans.bold,
  },
});

export default ZakatInputScreen;
