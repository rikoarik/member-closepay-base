import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft2,
  ArrowRight2,
  Wallet,
  ArrowDown2,
  Heart,
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

export const DonationInputScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const initialAmount = route.params?.amount || '100.000';
  const type = route.params?.type;

  const campaign = route.params?.campaign || {
    title:
      type === 'fitrah'
        ? t('donasiZakat.zakatFitrah')
        : type === 'sedekah'
        ? t('donasiZakat.sedekah')
        : type === 'wakaf'
        ? t('donasiZakat.wakaf')
        : 'Pembangunan Masjid Al-Ikhlas',
    org: type ? 'Closepay Foundation' : 'Yayasan Amanah Berbagi',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGsA3HjbsfgXhGvBKMo5ZoZal1gnDXX-hT42Tx9M2MhCol2o2XUzmnsvrvUHnf0nRxYAzSuwyKyI3YtPP6Bt8-eyeO5jZ39qzknrCZLdgDl7wwNYKRn_ABNwrt5sblqj5ok7IA_Ak-F4hyAtZuM5pPQFVBkiJQp1Haymip9np0fOGhA25GR7xpgW1x_ALg2U4FBnWc0Z-5Z6cvKg7oZfKRR2JsBCfYbGU5_gugXSCwbaXlIPbMQpQI4Bd5aGrcpS4so9Gukae2L0',
  };

  const [amount, setAmount] = useState(initialAmount);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '');
    if (numeric === '') {
      setAmount('0');
      return;
    }
    setAmount(formatIDR(parseInt(numeric, 10)));
  };

  const quickAmounts = ['50.000', '100.000', '500.000', '1.000.000'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <ScreenHeader title={type ? campaign.title : t('donasiZakat.inputDonation')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Campaign Preview Card */}
        <View
          style={[
            styles.campaignCard,
            { backgroundColor: colors.primary + '08', borderColor: colors.primary + '10' },
          ]}
        >
          <Image source={{ uri: campaign.image }} style={styles.campaignImage} />
          <View style={styles.campaignText}>
            <Text style={[styles.campaignLabel, { color: colors.primary }]}>
              {type ? t('donasiZakat.totalDonation').toUpperCase() : 'DONASI UNTUK'}
            </Text>
            <Text style={[styles.campaignTitle, { color: colors.text }]} numberOfLines={1}>
              {campaign.title}
            </Text>
            <Text style={[styles.campaignOrg, { color: colors.textSecondary }]}>
              {campaign.org}
            </Text>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={[styles.amountLabel, { color: colors.textTertiary }]}>NOMINAL DONASI</Text>
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
          <View style={[styles.progressIndicator, { backgroundColor: colors.primary + '20' }]}>
            <View style={[styles.progressBar, { backgroundColor: colors.primary, width: '66%' }]} />
          </View>
        </View>

        {/* Predefined Amount Chips Grid */}
        <View style={[styles.chipsGrid, { paddingHorizontal: horizontalPadding }]}>
          {quickAmounts.concat(['Lainnya']).map((q) => (
            <TouchableOpacity
              key={q}
              style={[
                styles.gridChip,
                amount === q
                  ? { backgroundColor: colors.surface, borderColor: colors.primary }
                  : { borderColor: 'transparent', backgroundColor: colors.primary + '08' },
              ]}
              onPress={() => q !== 'Lainnya' && setAmount(q)}
            >
              <Text
                style={[
                  styles.gridChipText,
                  amount === q ? { color: colors.primary } : { color: colors.textSecondary },
                ]}
              >
                {q === 'Lainnya' ? q : `Rp${q.replace('.000', 'rb')}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message Area */}
        <View style={[styles.messageSection, { paddingHorizontal: horizontalPadding }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Pesan / Doa Baik (Opsional)
          </Text>
          <TextInput
            style={[
              styles.messageInput,
              { backgroundColor: colors.surfaceSecondary, color: colors.text },
            ]}
            placeholder="Semoga bermanfaat dan menjadi berkah bagi sesama..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Anonymous Toggle */}
        <View
          style={[
            styles.toggleCard,
            {
              marginHorizontal: horizontalPadding,
              backgroundColor: colors.surfaceSecondary + '50',
              borderColor: colors.borderLight,
            },
          ]}
        >
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIconWrap, { backgroundColor: colors.primary + '10' }]}>
              <EyeSlash size={scale(20)} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                Donasi sebagai anonim
              </Text>
              <Text style={[styles.toggleSub, { color: colors.textTertiary }]}>
                Nama Anda tidak akan ditampilkan
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
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + scale(12), borderTopColor: colors.borderLight },
        ]}
      >
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            {t('donasiZakat.totalDonation')}
          </Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>Rp {amount}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
          ]}
        >
          <Text style={styles.submitBtnText}>Kirim Donasi</Text>
          <Heart size={scale(18)} color="#FFF" variant="Bold" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: scale(12),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: scale(20),
    fontFamily: FontFamily.monasans.bold,
  },
  placeholder: {
    width: scale(40),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: moderateVerticalScale(140),
  },
  campaignCard: {
    marginHorizontal: scale(20),
    marginTop: scale(16),
    marginBottom: scale(32),
    padding: scale(12),
    borderRadius: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
    borderWidth: 1,
  },
  campaignImage: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(10),
  },
  campaignText: {
    flex: 1,
  },
  campaignLabel: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 1,
    marginBottom: scale(2),
  },
  campaignTitle: {
    fontSize: scale(15),
    fontFamily: FontFamily.monasans.bold,
    lineHeight: scale(20),
  },
  campaignOrg: {
    fontSize: scale(13),
    fontFamily: FontFamily.monasans.medium,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: scale(40),
  },
  amountLabel: {
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 2,
    marginBottom: scale(12),
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyPrefix: {
    fontSize: scale(24),
    fontFamily: FontFamily.monasans.bold,
    marginRight: scale(8),
  },
  amountInput: {
    fontSize: scale(48),
    fontFamily: FontFamily.monasans.bold,
    padding: 0,
    textAlign: 'center',
  },
  progressIndicator: {
    height: scale(4),
    width: scale(96),
    borderRadius: scale(2),
    marginTop: scale(16),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: scale(2),
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
    marginBottom: scale(40),
  },
  gridChip: {
    width: '30.5%',
    paddingVertical: scale(14),
    borderRadius: scale(12),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridChipText: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  messageSection: {
    marginBottom: scale(24),
  },
  sectionLabel: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(8),
    marginLeft: scale(4),
  },
  messageInput: {
    borderRadius: scale(16),
    padding: scale(16),
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.medium,
    height: scale(100),
    textAlignVertical: 'top',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
    borderRadius: scale(16),
    borderWidth: 1,
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
    fontSize: scale(15),
    fontFamily: FontFamily.monasans.bold,
  },
  toggleSub: {
    fontSize: scale(12),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: scale(24),
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
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
    gap: scale(10),
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

export default DonationInputScreen;
