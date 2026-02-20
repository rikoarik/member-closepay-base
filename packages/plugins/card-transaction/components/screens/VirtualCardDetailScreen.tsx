/**
 * VirtualCardDetailScreen Component
 * Detail screen untuk virtual card dengan informasi lengkap dan menu aksi
 */
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft2,
  Edit2,
  MoneyRecive,
  MoneySend,
  ReceiptItem,
  Scanner,
  DocumentText,
  Lock,
  Edit,
  InfoCircle,
  ArrowRight2,
  DocumentDownload,
  Wifi,
} from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
  SvgLinearGradientView,
  BottomSheet,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import type { RootStackParamList } from '@core/navigation';
import Svg, { Path } from 'react-native-svg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CardTransactionSettingsSheet } from '../CardTransactionSettingsSheet';
import { SetPinOptionsSheet, type SetPinAction } from '../SetPinOptionsSheet';

// Extend RootStackParamList for app-specific route params
type AppRootStackParamList = RootStackParamList & {
  VirtualCardDetail: {
    card: {
      id: string;
      cardNumber: string;
      cardHolderName: string;
      expiryDate: string;
      gradientColors: string[];
      orbColors?: string[];
      avatarUrl?: string;
      /** true = sudah punya PIN (tampil sheet opsi). false/undefined = belum punya PIN → langsung ke Aktifkan PIN */
      hasTransactionPin?: boolean;
    };
  };
};

type VirtualCardDetailRoute = RouteProp<AppRootStackParamList, 'VirtualCardDetail'>;

// Match dimensions from VirtualCardTab
const { width: W } = Dimensions.get('window');
const CARD_W = W * 0.52;
const CARD_H = CARD_W * 1.58;
const PAD = moderateScale(20);

// Closepay Logo Component
function ClosepayLogoSmall({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.9794 6.06929C12.1187 5.97277 11.247 6.05583 10.4213 6.31301C9.59569 6.57018 8.8348 6.99568 8.18858 7.56157C7.54235 8.12746 7.02539 8.82098 6.67161 9.59661C6.31782 10.3723 6.13521 11.2125 6.13574 12.0622C6.13574 12.1187 6.13574 12.1752 6.13574 12.2316V21.5281C6.13915 21.8235 6.22648 22.1121 6.38793 22.3615C6.54939 22.6109 6.77855 22.8112 7.04967 22.9399H7.08565C7.33177 23.0541 7.60308 23.1061 7.87492 23.0913C8.14676 23.0764 8.41051 22.9952 8.64218 22.8549C8.87386 22.7146 9.06612 22.5197 9.20148 22.288C9.33684 22.0563 9.41101 21.7951 9.41725 21.5281V17.3987C10.2166 17.8248 11.1024 18.0715 12.0107 18.121C12.9191 18.1704 13.8273 18.0215 14.6698 17.6849C15.5123 17.3483 16.2682 16.8324 16.8827 16.1745C17.4973 15.5166 17.9553 14.733 18.2237 13.8804C18.4921 13.0277 18.5642 12.1273 18.4347 11.244C18.3052 10.3608 17.9774 9.5167 17.475 8.77277C16.9726 8.02885 16.3081 7.40362 15.5294 6.9422C14.7507 6.48078 13.8773 6.19469 12.9722 6.10458L12.9794 6.06929ZM12.1015 14.8716C11.4047 14.825 10.749 14.5315 10.2564 14.0458C9.76392 13.5601 9.46823 12.9153 9.42445 12.2316C9.42086 12.1799 9.42086 12.128 9.42445 12.0763C9.43018 11.3275 9.73894 10.6116 10.2828 10.086C10.5521 9.82579 10.871 9.62014 11.2214 9.48082C11.5717 9.34149 11.9465 9.27121 12.3246 9.27399C12.7026 9.27677 13.0763 9.35256 13.4245 9.49702C13.7726 9.64149 14.0884 9.8518 14.3537 10.116C14.6189 10.3801 14.8286 10.6929 14.9706 11.0366C15.1127 11.3802 15.1843 11.7479 15.1815 12.1187C15.1423 12.8834 14.7966 13.6018 14.2196 14.1175C13.6427 14.6332 12.8813 14.9043 12.1015 14.8716Z"
        fill="white"
        fillOpacity={0.9}
      />
      <Path
        d="M12.2158 22.3966C12.2178 22.6332 12.272 22.8667 12.3747 23.0808C12.4774 23.2949 12.6263 23.4846 12.8109 23.6369C12.9956 23.7892 13.2117 23.9004 13.4444 23.9629C13.6771 24.0254 13.9208 24.0377 14.1588 23.9989C16.1486 23.6946 18.032 22.9165 19.6441 21.7326C21.2562 20.5488 22.5479 18.9954 23.4061 17.2084C23.5264 16.9622 23.5812 16.6902 23.5654 16.4177C23.5495 16.1451 23.4636 15.881 23.3156 15.6498C23.1676 15.4186 22.9623 15.228 22.7189 15.0957C22.4755 14.9634 22.2019 14.8937 21.9236 14.8931C21.6219 14.8979 21.3275 14.9849 21.0733 15.1445C20.8191 15.304 20.6152 15.5298 20.4844 15.7966C19.8465 17.1118 18.891 18.2544 17.7009 19.1253C16.5108 19.9962 15.122 20.5691 13.6551 20.7942C13.2576 20.844 12.8922 21.0342 12.6273 21.3291C12.3624 21.624 12.2161 22.0035 12.2158 22.3966Z"
        fill="white"
        fillOpacity={0.7}
      />
      <Path
        d="M11.2447 0.0413948C8.94531 0.231696 6.74713 1.05382 4.90227 2.41348C3.05741 3.77314 1.64055 5.61529 0.814196 7.72867C-0.0121615 9.84205 -0.214566 12.1411 0.230195 14.3621C0.674956 16.5832 1.74887 18.6363 3.32879 20.2861V12.9943C3.22461 12.0731 3.27077 11.1414 3.46552 10.2343C3.85449 8.41288 4.81971 6.75834 6.22361 5.50657C7.62752 4.2548 9.39844 3.46969 11.284 3.26314C13.1695 3.0566 15.0733 3.43917 16.7242 4.35632C18.375 5.27347 19.6885 6.67838 20.4776 8.37081C20.6079 8.64587 20.8164 8.87814 21.0782 9.03969C21.3399 9.20123 21.6436 9.28517 21.9528 9.2814C22.2208 9.2788 22.4841 9.21155 22.7193 9.08559C22.9546 8.95962 23.1546 8.77881 23.3018 8.5591C23.449 8.33939 23.5388 8.08752 23.5634 7.82572C23.5879 7.56391 23.5464 7.30021 23.4424 7.05787C22.3939 4.79818 20.6594 2.91136 18.476 1.65543C16.2927 0.399508 13.7671 -0.164201 11.2447 0.0413948Z"
        fill="white"
        fillOpacity={0.5}
      />
    </Svg>
  );
}

// Chip Icon Component (same as VirtualCardTab)
function ChipIcon() {
  return (
    <View style={styles.chip}>
      <View style={styles.chipInner} />
      <View style={[styles.chipLine, styles.chipLineH1]} />
      <View style={[styles.chipLine, styles.chipLineH2]} />
      <View style={[styles.chipLine, styles.chipLineV1]} />
      <View style={[styles.chipLine, styles.chipLineV2]} />
    </View>
  );
}

// NFC Icon Component (same as VirtualCardTab)
function NfcIcon() {
  return (
    <View style={styles.nfcWrap}>
      <View style={[styles.nfcArc, { width: 18, height: 18 }]} />
      <View style={[styles.nfcArc, { width: 12, height: 12, opacity: 0.7 }]} />
      <View style={[styles.nfcArc, { width: 6, height: 6, opacity: 0.5 }]} />
    </View>
  );
}

// --- Modal Component ---
interface VirtualCardInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

function VirtualCardInfoModal({ visible, onClose, onSave }: VirtualCardInfoModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  // Static state for demo as per request
  const [cardName, setCardName] = useState(t('virtualCardDetail.mockCardName'));
  const [description, setDescription] = useState(t('virtualCardDetail.mockDescription'));

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[85]}>
      <View style={{ padding: scale(20) }}>
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {t('home.cardInformation')}
          </Text>
          <View style={styles.modalContent}>
            {/* Nama Kartu */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text, opacity: 0.6 }]}>
                {t('home.cardName')}
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={cardName}
                onChangeText={setCardName}
              />
            </View>

            {/* NFC */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text, opacity: 0.6 }]}>NFC</Text>
              <View style={[styles.modalInfoRow, { backgroundColor: colors.border || '#f5f5f5' }]}>
                <Text style={{ color: colors.text }}>{t('virtualCardDetail.alreadySet')}</Text>
              </View>
            </View>

            {/* Saldo Kartu */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text, opacity: 0.6 }]}>
                {t('home.cardBalance')}
              </Text>
              <Text style={[styles.balanceText, { color: colors.primary }]}>Rp 198.879</Text>
            </View>

            {/* Deskripsi */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text, opacity: 0.6 }]}>
                {t('home.description')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.btnCancel, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.btnTextInfo, { color: colors.text, opacity: 0.6 }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.btnSave, { backgroundColor: colors.primary }]}
              onPress={onSave}
            >
              <Text style={[styles.btnTextInfo, { color: 'white' }]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </BottomSheet>
  );
}

// --- Accumulation Guide Modal ---
interface AccumulationGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

function AccumulationGuideModal({ visible, onClose }: AccumulationGuideModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[100]}>
      <View style={{ padding: scale(20) }}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          {t('home.accumulationGuide')}
        </Text>
        <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
          <View style={styles.modalContent}>
            <Text style={[styles.guideTitle, { color: colors.text }]}>
              {t('virtualCardDetail.accumulationTitle')}
            </Text>
            <Text style={[styles.guideText, { color: colors.textSecondary }]}>
              {t('virtualCardDetail.accumulationDesc')}
            </Text>

            <Text style={[styles.guideTitle, { color: colors.text, marginTop: 12 }]}>
              {t('virtualCardDetail.example')}
            </Text>
            <Text style={[styles.guideText, { color: colors.textSecondary }]}>
              {t('virtualCardDetail.accumulationExample')}
            </Text>

            <View style={[styles.guideNote, { backgroundColor: colors.surface }]}>
              <Text style={[styles.guideText, { color: colors.textSecondary, fontSize: 13 }]}>
                {t('virtualCardDetail.disableFeatureNote')}
              </Text>
            </View>
          </View>
        </KeyboardAwareScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalBtn, styles.btnSave, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.btnTextInfo, { color: 'white' }]}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

interface IdentityCardModalProps {
  visible: boolean;
  onClose: () => void;
}

function IdentityCardModal({ visible, onClose }: IdentityCardModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[100]} disableClose={false}>
      <View style={{ padding: scale(20) }}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          {t('virtualCardDetail.identityCard')}
        </Text>
        <View style={styles.modalContent}>
          {/* Profile Photo */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text, opacity: 0.6 }]}>
              {t('virtualCardDetail.profilePhoto')}
            </Text>
            <View
              style={[
                styles.modalInfoRow,
                { backgroundColor: colors.border || '#f5f5f5', justifyContent: 'flex-start' },
              ]}
            >
              <Text style={{ color: colors.text, opacity: 0.5 }}>
                {t('virtualCardDetail.noFileSelected')}
              </Text>
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text, opacity: 0.6 }]}>
              {t('virtualCardDetail.fullName')}
            </Text>
            <View
              style={[
                styles.modalInfoRow,
                { backgroundColor: colors.border || '#f5f5f5', justifyContent: 'flex-start' },
              ]}
            >
              <Text style={{ color: colors.text }}>Yeni Solikah</Text>
            </View>
          </View>

          {/* Account ID */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text, opacity: 0.6 }]}>
              {t('virtualCardDetail.accountId')}
            </Text>
            <View
              style={[
                styles.modalInfoRow,
                { backgroundColor: colors.border || '#f5f5f5', justifyContent: 'flex-start' },
              ]}
            >
              <Text style={{ color: colors.text }}>-</Text>
            </View>
          </View>
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalBtn, styles.btnSave, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.btnTextInfo, { color: 'white' }]}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

export const VirtualCardDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<VirtualCardDetailRoute>();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const card = route.params?.card;

  const [modalVisible, setModalVisible] = useState(false);
  const [accumulationModalVisible, setAccumulationModalVisible] = useState(false);
  const [identityModalVisible, setIdentityModalVisible] = useState(false);
  const [transactionSettingsVisible, setTransactionSettingsVisible] = useState(false);
  const [setPinSheetVisible, setSetPinSheetVisible] = useState(false);
  const [cardName, setCardName] = useState(t('virtualCardDetail.dailyLimitCard'));
  const [description, setDescription] = useState(t('virtualCardDetail.monthlyShopping'));

  // Mock data/State
  const cardInfo = {
    nfcStatus: t('virtualCardDetail.active'),
    balance: 85350,
    todayTransaction: 0,
    monthlyTransaction: 1500000,
    accumulatedBalance: 50000,
    maxPerTransaction: 2000000,
    maxDaily: 5000000,
    maxMonthly: 10000000,
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMenuPress = (menu: string) => {
    if (menu === 'accumulationGuide') {
      setAccumulationModalVisible(true);
    } else if (menu === 'cardIdentity') {
      setIdentityModalVisible(true);
    } else if (menu === 'topup' && card) {
      (navigation as any).navigate('VirtualCardTopUpAmount', { card });
    } else if (menu === 'withdrawal' && card) {
      (navigation as any).navigate('CardWithdraw', { card });
    } else if (menu === 'history' && card) {
      (navigation as any).navigate('CardTransactionHistory', { card });
    } else if (menu === 'qr' && card) {
      (navigation as any).navigate('CardQr', { card });
    } else if (menu === 'transactionSettings') {
      setTransactionSettingsVisible(true);
    } else if (menu === 'activityLog' && card) {
      (navigation as any).navigate('CardActivityLog', { card });
    } else if (menu === 'setPin' && card) {
      if (card.hasTransactionPin) {
        requestAnimationFrame(() => setSetPinSheetVisible(true));
      } else {
        (navigation as any).navigate('ActivatePin', { card });
      }
    } else {
      console.log('Menu pressed:', menu);
    }
  };

  const handleEdit = () => {
    setModalVisible(true);
  };

  const handleSetPinSelect = (action: SetPinAction) => {
    setSetPinSheetVisible(false);
    if (card) {
      (navigation as any).navigate('SetPinFlow', { card, action });
    }
  };

  const renderInfoRow = (
    label: string,
    value: string | number,
    isCurrency = false,
    isLast = false
  ) => (
    <View
      style={[
        styles.infoRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>
        {isCurrency ? `Rp ${value.toLocaleString('id-ID')}` : value}
      </Text>
    </View>
  );

  const renderActionButton = (title: string, icon: React.ReactNode, key: string) => (
    <TouchableOpacity
      key={key}
      style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleMenuPress(key)}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 0, right: 0 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(12), flex: 1 }}>
        {icon}
        <Text style={[styles.actionButtonText, { color: colors.text }]}>{title}</Text>
      </View>
      <ArrowRight2 size={scale(18)} color={colors.textSecondary} variant="Linear" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('home.virtualCardDetail')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + moderateVerticalScale(24),
            paddingHorizontal: horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card Preview */}
        {card && (
          <View style={styles.cardPreviewContainer}>
            <View style={styles.cardOuter}>
              <SvgLinearGradientView
                colors={card.gradientColors || ['#005BEA', '#00C6FB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardBg}
              >
                <View style={styles.pattern1} />
                <View style={styles.pattern2} />
                <View style={styles.pattern3} />
                <View style={styles.patternLine} />

                <View style={styles.cardInner}>
                  <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                      <Text style={styles.brand} numberOfLines={1}>
                        {t('home.closepayBrand')}
                      </Text>
                      <Text style={styles.subBrand} numberOfLines={1}>
                        {t('home.member')}
                      </Text>
                    </View>

                    <View style={styles.cardHeaderRight}>
                      {card.avatarUrl && (
                        <Image source={{ uri: card.avatarUrl }} style={styles.avatar} />
                      )}
                    </View>
                  </View>

                  <View style={styles.cardMid}>
                    <View style={styles.chipNfc}>
                      <ChipIcon />
                      <View style={{ transform: [{ rotate: '90deg' }], marginLeft: scale(12) }}>
                        <Wifi size={scale(24)} color={colors.surface} variant="Outline" />
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.cardNumber} numberOfLines={1}>
                      {card.cardNumber}
                    </Text>
                    <View style={styles.cardFooterRow}>
                      <View style={styles.holderWrap}>
                        <Text style={styles.holderLabel}>{t('home.cardHolder')}</Text>
                        <Text style={styles.holderName} numberOfLines={1}>
                          {card.cardHolderName}
                        </Text>
                      </View>

                      <ClosepayLogoSmall size={26} />
                    </View>
                  </View>
                </View>
              </SvgLinearGradientView>
            </View>
          </View>
        )}

        {/* Menu Buttons (Grid) */}
        <View style={[styles.menuContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.menuButton]}
            onPress={() => handleMenuPress('withdrawal')}
            activeOpacity={0.7}
          >
            <View
              style={[styles.menuIconContainer, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}
            >
              <MoneySend size={scale(24)} color="#FF6B6B" variant="Bold" />
            </View>
            <Text style={[styles.menuButtonText, { color: colors.text }]}>
              {t('home.withdrawal')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton]}
            onPress={() => handleMenuPress('topup')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.menuIconContainer,
                { backgroundColor: colors.successLight ?? 'rgba(52, 199, 89, 0.1)' },
              ]}
            >
              <MoneyRecive size={scale(24)} color={colors.success} variant="Bold" />
            </View>
            <Text style={[styles.menuButtonText, { color: colors.text }]}>
              {t('home.topUpCard')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton]}
            onPress={() => handleMenuPress('history')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
              <ReceiptItem size={scale(24)} color="#007AFF" variant="Bold" />
            </View>
            <Text style={[styles.menuButtonText, { color: colors.text }]}>
              {t('home.transactionHistory')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton]}
            onPress={() => handleMenuPress('qr')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(88, 86, 214, 0.1)' }]}>
              <Scanner size={scale(24)} color="#5856D6" variant="Bold" />
            </View>
            <Text style={[styles.menuButtonText, { color: colors.text }]}>{t('home.qrCard')}</Text>
          </TouchableOpacity>
        </View>

        {/* Card Information Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('home.cardInformation')}
            </Text>
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Edit size={scale(16)} color={colors.primary} variant="Linear" />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                {t('common.edit')}
              </Text>
            </TouchableOpacity>
          </View>

          {renderInfoRow(t('home.cardName'), cardName)}
          {renderInfoRow(t('home.description'), description)}
          {renderInfoRow(t('home.nfcCard'), cardInfo.nfcStatus)}
          {renderInfoRow(t('home.cardBalance'), cardInfo.balance, true)}
        </View>

        {/* Transaction Limits Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, marginBottom: moderateVerticalScale(16) },
            ]}
          >
            {t('home.transactionLimits')}
          </Text>
          {renderInfoRow(t('home.perTransaction'), cardInfo.maxPerTransaction, true)}
          {renderInfoRow(t('home.daily'), cardInfo.maxDaily, true)}
          {renderInfoRow(t('home.monthly'), cardInfo.maxMonthly, true, true)}
        </View>

        {/* Additional Actions */}
        <View style={styles.actionGroup}>
          {renderActionButton(
            t('home.accumulationGuide'),
            <InfoCircle size={scale(20)} color={colors.primary} variant="Linear" />,
            'accumulationGuide'
          )}
          {renderActionButton(
            t('home.cardIdentityData'),
            <DocumentText size={scale(20)} color={colors.primary} variant="Linear" />,
            'cardIdentity'
          )}
          {renderActionButton(
            t('home.transactionCardSettings'),
            <Edit size={scale(20)} color={colors.primary} variant="Linear" />,
            'transactionSettings'
          )}
          {renderActionButton(
            t('home.cardActivityLog'),
            <ReceiptItem size={scale(20)} color={colors.primary} variant="Linear" />,
            'activityLog'
          )}
          {renderActionButton(
            t('home.setPin'),
            <Lock size={scale(20)} color={colors.primary} variant="Linear" />,
            'setPin'
          )}
          {renderActionButton(
            t('common.download'),
            <DocumentDownload size={scale(20)} color={colors.primary} variant="Linear" />,
            'download'
          )}
        </View>
      </ScrollView>

      <VirtualCardInfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={() => setModalVisible(false)}
      />

      <AccumulationGuideModal
        visible={accumulationModalVisible}
        onClose={() => setAccumulationModalVisible(false)}
      />

      <IdentityCardModal
        visible={identityModalVisible}
        onClose={() => setIdentityModalVisible(false)}
      />

      <CardTransactionSettingsSheet
        visible={transactionSettingsVisible}
        onClose={() => setTransactionSettingsVisible(false)}
        onSave={() => setTransactionSettingsVisible(false)}
      />

      <SetPinOptionsSheet
        visible={setPinSheetVisible}
        onClose={() => setSetPinSheetVisible(false)}
        onSelect={handleSetPinSelect}
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
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: moderateVerticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: scale(8),
    marginLeft: -scale(8),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
  },
  headerRight: {
    width: scale(40),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: moderateVerticalScale(24),
  },

  // Card Styles (Consistent with VirtualCardTab)
  cardPreviewContainer: {
    alignItems: 'center',
    marginBottom: moderateVerticalScale(24),
  },
  cardOuter: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: moderateScale(24),
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
  cardBg: {
    flex: 1,
    borderRadius: moderateScale(24),
    overflow: 'hidden',
  },
  pattern1: {
    position: 'absolute',
    top: -36,
    right: -56,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pattern2: {
    position: 'absolute',
    bottom: -70,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pattern3: {
    position: 'absolute',
    top: '38%',
    right: -16,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  patternLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardInner: {
    flex: 1,
    paddingHorizontal: PAD,
    paddingTop: PAD,
    paddingBottom: PAD + 4,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {},
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: scale(12),
  },
  brand: {
    color: 'white',
    fontSize: moderateScale(16),
    fontFamily: FontFamily.monasans.bold,
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  subBrand: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: moderateScale(10),
    fontFamily: FontFamily.monasans.semiBold,
    marginTop: -2,
    marginLeft: 2,
  },
  cardMid: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: moderateVerticalScale(4),
  },
  chipNfc: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    width: 42,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    position: 'relative',
    overflow: 'hidden',
  },
  chipInner: {
    position: 'absolute',
    top: '14%',
    left: '14%',
    right: '14%',
    bottom: '14%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  chipLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  chipLineH1: { height: 1, left: 0, right: 0, top: '33%' },
  chipLineH2: { height: 1, left: 0, right: 0, top: '66%' },
  chipLineV1: { width: 1, top: 0, bottom: 0, left: '33%' },
  chipLineV2: { width: 1, top: 0, bottom: 0, left: '66%' },
  nfcWrap: {
    width: 20,
    height: 20,
  },
  nfcArc: {
    position: 'absolute',
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: 'white',
    borderRadius: 50,
    transform: [{ rotate: '-45deg' }],
  },
  cardFooter: {},
  cardNumber: {
    color: 'white',
    fontSize: moderateScale(14),
    letterSpacing: 2,
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(6),
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  holderWrap: {
    flex: 1,
    minWidth: 0,
    marginRight: scale(8),
  },
  holderLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(8),
    fontFamily: FontFamily.monasans.regular,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  avatar: {
    width: scale(54),
    height: scale(54),
    borderRadius: scale(27),
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  holderName: {
    color: 'white',
    fontSize: moderateScale(10),
    fontFamily: FontFamily.monasans.semiBold,
    textTransform: 'uppercase',
  },

  // Menu Grid
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuButton: {
    flex: 1,
    aspectRatio: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: scale(8),
    borderRadius: scale(16),
  },
  menuIconContainer: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(8),
  },
  menuButtonText: {
    fontSize: getResponsiveFontSize('xxsmall'),
    fontFamily: FontFamily.monasans.semiBold,
    textAlign: 'center',
  },

  // Information Sections
  section: {
    marginTop: moderateVerticalScale(16),
    padding: scale(20),
    borderRadius: scale(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(8),
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  editButtonText: {
    fontSize: getResponsiveFontSize('xsmall'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(14),
  },
  infoLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    flex: 1,
  },
  infoValue: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.bold,
    textAlign: 'right',
    flex: 1,
  },

  // Action Buttons
  actionGroup: {
    marginTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(16),
    gap: moderateVerticalScale(12),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
    borderRadius: scale(14),
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.semiBold,
  },

  // Modal Styles
  modalTitle: {
    fontSize: moderateScale(18),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(16),
  },
  modalContent: {
    gap: moderateVerticalScale(12),
  },
  inputGroup: {},
  label: {
    fontSize: moderateScale(12),
    marginBottom: moderateVerticalScale(4),
  },
  input: {
    borderWidth: 1,
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    paddingVertical: moderateVerticalScale(10),
    fontSize: moderateScale(14),
  },
  textArea: {
    minHeight: moderateVerticalScale(80),
    textAlignVertical: 'top',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
  },
  balanceText: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.monasans.semiBold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: moderateVerticalScale(16),
  },
  modalBtn: {
    flex: 1,
    paddingVertical: moderateVerticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalInput: {
    flex: 1,
    fontSize: moderateScale(14),
  },
  saveButton: {
    paddingVertical: moderateVerticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    marginTop: moderateVerticalScale(12),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontFamily: FontFamily.monasans.semiBold,
  },
  btnCancel: {
    borderStyle: 'solid',
  },
  btnSave: {},
  btnTextInfo: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.monasans.semiBold,
  },
  guideTitle: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(4),
  },
  guideText: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
    textAlign: 'justify',
  },
  guideNote: {
    marginTop: moderateVerticalScale(16),
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
  },
});
