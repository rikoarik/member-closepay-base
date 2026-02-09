/**
 * AddVirtualCardScreen
 * Form buat kartu virtual: Nama Kartu, Deskripsi, Jenis Kartu,
 * live preview kartu, dan pilihan warna (gradient).
 * Domain: card-transaction plugin.
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2, Wifi } from 'iconsax-react-nativejs';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { scale, moderateScale, moderateVerticalScale, SvgLinearGradientView } from '@core/config';

const { width: W } = Dimensions.get('window');
const CARD_PREVIEW_W = W * 0.82;
const CARD_PREVIEW_H = CARD_PREVIEW_W * 1.58;
const PAD = moderateScale(20);

const COLOR_PRESETS: { label: string; colors: [string, string] }[] = [
  { label: 'Biru', colors: ['#005BEA', '#00C6FB'] },
  { label: 'Hijau', colors: ['#0ba360', '#3cba92'] },
  { label: 'Pink', colors: ['#FF9A9E', '#FECFEF'] },
  { label: 'Ungu', colors: ['#667eea', '#764ba2'] },
  { label: 'Oranye', colors: ['#f093fb', '#f5576c'] },
  { label: 'Teal', colors: ['#11998e', '#38ef7d'] },
  { label: 'Biru Gelap', colors: ['#2C3E50', '#4CA1AF'] },
  { label: 'Emas', colors: ['#D4A574', '#F7DC6F'] },
  { label: 'Koral', colors: ['#ff6b6b', '#feca57'] },
  { label: 'Lavender', colors: ['#a8edea', '#fed6e3'] },
  { label: 'Sunset', colors: ['#fa709a', '#fee140'] },
  { label: 'Ocean', colors: ['#2193b0', '#6dd5ed'] },
  { label: 'Merah', colors: ['#eb3349', '#f45c43'] },
  { label: 'Tosca', colors: ['#134e5e', '#71b280'] },
  { label: 'Violet', colors: ['#4776E6', '#8E54E9'] },
  { label: 'Peach', colors: ['#ED4264', '#FFEDBC'] },
  { label: 'Midnight', colors: ['#232526', '#414345'] },
  { label: 'Mint', colors: ['#56ab2f', '#a8e063'] },
  { label: 'Rose', colors: ['#f857a6', '#ff5858'] },
  { label: 'Slate', colors: ['#485563', '#29323c'] },
  { label: 'Amber', colors: ['#f7971e', '#ffd200'] },
  { label: 'Indigo', colors: ['#4b6cb7', '#182848'] },
  { label: 'Sage', colors: ['#7f7fd5', '#86a8e7'] },
  { label: 'Crimson', colors: ['#834d9b', '#d04ed6'] },
  { label: 'Forest', colors: ['#0f2027', '#203a43'] },
  { label: 'Candy', colors: ['#ff9a9e', '#fad0c4'] },
  { label: 'Aurora', colors: ['#00c6ff', '#0072ff'] },
  { label: 'Tangerine', colors: ['#ff9966', '#ff5e62'] },
  { label: 'Plum', colors: ['#667eea', '#f093fb'] },
  { label: 'Sea', colors: ['#2e3192', '#1bffff'] },
  { label: 'Warm', colors: ['#ff6a00', '#ee0979'] },
  { label: 'Navy', colors: ['#1e3c72', '#2a5298'] },
];

function ClosepayLogoSmall({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12.9794 6.06929C12.1187 5.97277 11.247 6.05583 10.4213 6.31301C9.59569 6.57018 8.8348 6.99568 8.18858 7.56157C7.54235 8.12746 7.02539 8.82098 6.67161 9.59661C6.31782 10.3723 6.13521 11.2125 6.13574 12.0622C6.13574 12.1187 6.13574 12.1752 6.13574 12.2316V21.5281C6.13915 21.8235 6.22648 22.1121 6.38793 22.3615C6.54939 22.6109 6.77855 22.8112 7.04967 22.9399H7.08565C7.33177 23.0541 7.60308 23.1061 7.87492 23.0913C8.14676 23.0764 8.41051 22.9952 8.64218 22.8549C8.87386 22.7146 9.06612 22.5197 9.20148 22.288C9.33684 22.0563 9.41101 21.7951 9.41725 21.5281V17.3987C10.2166 17.8248 11.1024 18.0715 12.0107 18.121C12.9191 18.1704 13.8273 18.0215 14.6698 17.6849C15.5123 17.3483 16.2682 16.8324 16.8827 16.1745C17.4973 15.5166 17.9553 14.733 18.2237 13.8804C18.4921 13.0277 18.5642 12.1273 18.4347 11.244C18.3052 10.3608 17.9774 9.5167 17.475 8.77277C16.9726 8.02885 16.3081 7.40362 15.5294 6.9422C14.7507 6.48078 13.8773 6.19469 12.9722 6.10458L12.9794 6.06929ZM12.1015 14.8716C11.4047 14.825 10.749 14.5315 10.2564 14.0458C9.76392 13.5601 9.46823 12.9153 9.42445 12.2316C9.42086 12.1799 9.42086 12.128 9.42445 12.0763C9.43018 11.3275 9.73894 10.6116 10.2828 10.086C10.5521 9.82579 10.871 9.62014 11.2214 9.48082C11.5717 9.34149 11.9465 9.27121 12.3246 9.27399C12.7026 9.27677 13.0763 9.35256 13.4245 9.49702C13.7726 9.64149 14.0884 9.8518 14.3537 10.116C14.6189 10.3801 14.8286 10.6929 14.9706 11.0366C15.1127 11.3802 15.1843 11.7479 15.1815 12.1187C15.1423 12.8834 14.7966 13.6018 14.2196 14.1175C13.6427 14.6332 12.8813 14.9043 12.1015 14.8716Z" fill="white" fillOpacity={0.9} />
      <Path d="M12.2158 22.3966C12.2178 22.6332 12.272 22.8667 12.3747 23.0808C12.4774 23.2949 12.6263 23.4846 12.8109 23.6369C12.9956 23.7892 13.2117 23.9004 13.4444 23.9629C13.6771 24.0254 13.9208 24.0377 14.1588 23.9989C16.1486 23.6946 18.032 22.9165 19.6441 21.7326C21.2562 20.5488 22.5479 18.9954 23.4061 17.2084C23.5264 16.9622 23.5812 16.6902 23.5654 16.4177C23.5495 16.1451 23.4636 15.881 23.3156 15.6498C23.1676 15.4186 22.9623 15.228 22.7189 15.0957C22.4755 14.9634 22.2019 14.8937 21.9236 14.8931C21.6219 14.8979 21.3275 14.9849 21.0733 15.1445C20.8191 15.304 20.6152 15.5298 20.4844 15.7966C19.8465 17.1118 18.891 18.2544 17.7009 19.1253C16.5108 19.9962 15.122 20.5691 13.6551 20.7942C13.2576 20.844 12.8922 21.0342 12.6273 21.3291C12.3624 21.624 12.2161 22.0035 12.2158 22.3966Z" fill="white" fillOpacity={0.7} />
      <Path d="M11.2447 0.0413948C8.94531 0.231696 6.74713 1.05382 4.90227 2.41348C3.05741 3.77314 1.64055 5.61529 0.814196 7.72867C-0.0121615 9.84205 -0.214566 12.1411 0.230195 14.3621C0.674956 16.5832 1.74887 18.6363 3.32879 20.2861V12.9943C3.22461 12.0731 3.27077 11.1414 3.46552 10.2343C3.85449 8.41288 4.81971 6.75834 6.22361 5.50657C7.62752 4.2548 9.39844 3.46969 11.284 3.26314C13.1695 3.0566 15.0733 3.43917 16.7242 4.35632C18.375 5.27347 19.6885 6.67838 20.4776 8.37081C20.6079 8.64587 20.8164 8.87814 21.0782 9.03969C21.3399 9.20123 21.6436 9.28517 21.9528 9.2814C22.2208 9.2788 22.4841 9.21155 22.7193 9.08559C22.9546 8.95962 23.1546 8.77881 23.3018 8.5591C23.449 8.33939 23.5388 8.08752 23.5634 7.82572C23.5879 7.56391 23.5464 7.30021 23.4424 7.05787C22.3939 4.79818 20.6594 2.91136 18.476 1.65543C16.2927 0.399508 13.7671 -0.164201 11.2447 0.0413948Z" fill="white" fillOpacity={0.5} />
    </Svg>
  );
}

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

function NfcIcon() {
  return (
    <View style={styles.nfcWrap}>
      <View style={[styles.nfcArc, { width: 18, height: 18 }]} />
      <View style={[styles.nfcArc, { width: 12, height: 12, opacity: 0.7 }]} />
      <View style={[styles.nfcArc, { width: 6, height: 6, opacity: 0.5 }]} />
    </View>
  );
}

function LiveCardPreview({
  colors,
  cardName,
  holderName,
}: {
  colors: [string, string];
  cardName: string;
  holderName: string;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.cardOuter}>
      <SvgLinearGradientView colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBg}>
        <View style={styles.pattern1} />
        <View style={styles.pattern2} />
        <View style={styles.pattern3} />
        <View style={styles.patternLine} />
        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.brand} numberOfLines={1}>{cardName || t('home.closepayBrand')}</Text>
              <Text style={styles.subBrand} numberOfLines={1}>{t('home.member')}</Text>
            </View>
            <View style={{ transform: [{ rotate: '90deg' }] }}>
              <Wifi size={scale(34)} color={'white'} variant="Outline" />
            </View>
          </View>
          <View style={styles.cardMid}>
            <View style={styles.chipNfc}>
              <ChipIcon />
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardNumber}>**** **** **** 1234</Text>
            <View style={styles.cardFooterRow}>
              <View style={styles.holderWrap}>
                <Text style={styles.holderLabel}>{t('home.cardHolder')}</Text>
                <Text style={styles.holderName} numberOfLines={1}>{holderName || t('home.myName')}</Text>
              </View>
              <ClosepayLogoSmall size={44} />
            </View>
          </View>
        </View>
      </SvgLinearGradientView>
    </View>
  );
}

export function AddVirtualCardScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [cardName, setCardName] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [identityModalVisible, setIdentityModalVisible] = useState(false);
  const [namaLengkap, setNamaLengkap] = useState('');
  const [idAkun, setIdAkun] = useState('');

  const gradientColors = COLOR_PRESETS[colorIndex].colors;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft2 size={scale(24)} color={colors.text} variant="Outline" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('home.createVirtualCard')}</Text>
        </View>

        <KeyboardAwareScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: moderateVerticalScale(40) + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={40}
          showsVerticalScrollIndicator={false}
        >
          <LiveCardPreview
            colors={gradientColors}
            cardName={cardName || t('home.closepayBrand')}
            holderName={namaLengkap || t('home.myName')}
          />

          <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>{t('home.cardColor')}</Text>
          <TouchableOpacity
            style={[styles.colorPickerTrigger, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setColorPickerVisible(true)}
            activeOpacity={0.7}
          >
            <SvgLinearGradientView
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.colorPickerPreview}
            />
            <Text style={[styles.colorPickerTriggerText, { color: colors.text }]}>
              {COLOR_PRESETS[colorIndex].label} • {t('home.tapToChange')}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.formTitle, { color: colors.text }]}>
            {t('home.completeFormToCreateCard')}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>{t('home.cardName')}</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder={t('home.enterCardName')}
            placeholderTextColor={colors.textSecondary}
            value={cardName}
            onChangeText={setCardName}
          />

          <Text style={[styles.label, { color: colors.text }]}>{t('home.cardDescription')}</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder={t('home.enterCardDescription')}
            placeholderTextColor={colors.textSecondary}
            value={cardDescription}
            onChangeText={setCardDescription}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.label, { color: colors.text }]}>{t('home.cardType')}</Text>
          <View style={[styles.cardTypeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardTypeRow}>
              <Text style={[styles.cardTypeText, { color: colors.text }]}>{t('home.identityCard')}</Text>
              <TouchableOpacity onPress={() => setIdentityModalVisible(true)}>
                <Text style={[styles.cardTypeLink, { color: colors.primary }]}>{t('home.completeData')} &gt;</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.cardTypeDivider, { backgroundColor: colors.border }]} />
            <View style={styles.cardTypeRow}>
              <Text style={[styles.cardTypeText, { color: colors.text }]}>{t('home.dontHaveTransactionCard')}</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text style={[styles.cardTypeLink, { color: colors.primary }]}>{t('home.createNow')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.nextBtnText}>{t('common.next')}</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </View>

      <Modal
        visible={identityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIdentityModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIdentityModalVisible(false)}>
          <Pressable
            style={[styles.modalBox, { backgroundColor: colors.surface, paddingBottom: insets.bottom + moderateVerticalScale(20) }]}
            onPress={(e) => e.stopPropagation()}
          >
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps="handled"
              enableOnAndroid={true}
              enableAutomaticScroll={true}
              extraScrollHeight={20}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('home.identityCard')}</Text>
              </View>
              <Text style={[styles.label, { color: colors.text }]}>{t('home.profilePhoto')}</Text>
              <TouchableOpacity style={[styles.fileBtn, { borderColor: colors.border }]}>
                <Text style={[styles.fileBtnText, { color: colors.primary }]}>{t('home.selectFile')}</Text>
              </TouchableOpacity>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('home.noFileSelected')}</Text>
              <Text style={[styles.label, { color: colors.text }]}>{t('home.fullName')}</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                placeholder={t('home.myName')}
                placeholderTextColor={colors.textSecondary}
                value={namaLengkap}
                onChangeText={setNamaLengkap}
              />
              <Text style={[styles.label, { color: colors.text }]}>{t('home.accountId')}</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                placeholder="123123123"
                placeholderTextColor={colors.textSecondary}
                value={idAkun}
                onChangeText={setIdAkun}
                keyboardType="number-pad"
              />
            </KeyboardAwareScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn, { borderColor: colors.error }]}
                onPress={() => setIdentityModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.error }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={() => setIdentityModalVisible(false)}
              >
                <Text style={styles.saveBtnText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={colorPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setColorPickerVisible(false)}
      >
        <Pressable style={styles.colorPickerBackdrop} onPress={() => setColorPickerVisible(false)}>
          <Pressable
            style={[
              styles.colorPickerModalBox,
              { backgroundColor: colors.surface, paddingBottom: insets.bottom + moderateVerticalScale(20) },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.colorPickerModalTitle, { color: colors.text }]}>{t('home.selectCardColor')}</Text>
            <ScrollView
              style={styles.colorPickerScroll}
              contentContainerStyle={styles.colorPickerGrid}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {COLOR_PRESETS.map((preset, i) => (
                <TouchableOpacity
                  key={preset.label}
                  style={[
                    styles.colorPickerItem,
                    colorIndex === i && { borderColor: colors.primary, borderWidth: 3 },
                  ]}
                  onPress={() => {
                    setColorIndex(i);
                    setColorPickerVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <SvgLinearGradientView
                    colors={preset.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.colorPickerItemGradient}
                  />
                  <Text style={[styles.colorPickerItemLabel, { color: colors.text }]}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.colorPickerDoneBtn, { backgroundColor: colors.primary }]}
              onPress={() => setColorPickerVisible(false)}
            >
              <Text style={styles.colorPickerDoneBtnText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    paddingVertical: scale(8),
    paddingRight: scale(12),
    marginLeft: -scale(4),
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '700', flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: PAD, paddingBottom: moderateVerticalScale(40) },

  cardOuter: {
    width: CARD_PREVIEW_W,
    height: CARD_PREVIEW_H,
    alignSelf: 'center',
    borderRadius: moderateScale(24),
    overflow: 'visible',
    marginBottom: moderateVerticalScale(20),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 10 },
    }),
  },
  cardBg: { flex: 1, borderRadius: moderateScale(24), overflow: 'hidden' },
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
  brand: {
    color: 'white',
    fontSize: moderateScale(24),
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  subBrand: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: moderateScale(11),
    fontWeight: '600',
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
    fontSize: moderateScale(17),
    fontWeight: '500',
    letterSpacing: 2,
    marginBottom: moderateVerticalScale(6),
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
    fontSize: moderateScale(10),
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  holderName: {
    color: 'white',
    fontSize: moderateScale(14),
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  colorLabel: { fontSize: moderateScale(14), fontWeight: '600', marginBottom: scale(8) },
  colorPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    padding: scale(12),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(20),
  },
  colorPickerPreview: {
    width: 40,
    height: 40,
    borderRadius: moderateScale(8),
  },
  colorPickerTriggerText: { fontSize: moderateScale(14), fontWeight: '500', flex: 1 },

  formTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: moderateVerticalScale(20),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: scale(8),
    marginTop: moderateVerticalScale(12),
  },
  input: {
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    fontSize: moderateScale(15),
    minHeight: scale(48),
  },
  textArea: {
    minHeight: scale(100),
    paddingTop: scale(12),
    textAlignVertical: 'top',
  },
  cardTypeCard: {
    borderRadius: moderateScale(12),
    borderWidth: 1,
    padding: scale(16),
    marginBottom: moderateVerticalScale(20),
  },
  cardTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTypeText: { fontSize: moderateScale(14), fontWeight: '500' },
  cardTypeLink: { fontSize: moderateScale(14), fontWeight: '600' },
  cardTypeDivider: {
    height: 1,
    marginVertical: scale(12),
  },
  nextBtn: {
    paddingVertical: scale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginTop: moderateVerticalScale(20),
  },
  nextBtnText: { color: 'white', fontSize: moderateScale(16), fontWeight: '600' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: scale(24),
  },
  modalBox: {
    borderRadius: moderateScale(16),
    padding: PAD,
    maxHeight: '80%',
  },
  modalScrollContent: { paddingBottom: moderateVerticalScale(16) },
  modalHeader: { marginBottom: moderateVerticalScale(16) },
  modalTitle: { fontSize: moderateScale(18), fontWeight: '700' },
  hint: { fontSize: moderateScale(12), marginTop: -8, marginBottom: moderateVerticalScale(12) },
  fileBtn: {
    borderWidth: 1,
    borderRadius: moderateScale(10),
    paddingVertical: scale(10),
    alignItems: 'center',
  },
  fileBtnText: { fontSize: moderateScale(14), fontWeight: '600' },
  modalActions: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: moderateVerticalScale(20),
  },
  modalBtn: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { borderWidth: 1 },
  cancelBtnText: { fontSize: moderateScale(15), fontWeight: '600' },
  saveBtn: {},
  saveBtnText: { color: 'white', fontSize: moderateScale(15), fontWeight: '600' },

  colorPickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  colorPickerModalBox: {
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: PAD,
    maxHeight: '80%',
  },
  colorPickerModalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginBottom: moderateVerticalScale(20),
    textAlign: 'center',
  },
  colorPickerScroll: {
    maxHeight: moderateVerticalScale(400),
    marginBottom: moderateVerticalScale(12),
  },
  colorPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
    paddingBottom: moderateVerticalScale(8),
  },
  colorPickerItem: {
    width: (W - PAD * 2 - scale(12) * 3) / 4,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorPickerItemGradient: {
    width: '100%',
    height: 80,
  },
  colorPickerItemLabel: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: scale(8),
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  colorPickerDoneBtn: {
    paddingVertical: scale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginTop: moderateVerticalScale(12),
  },
  colorPickerDoneBtnText: { color: 'white', fontSize: moderateScale(16), fontWeight: '600' },
});
