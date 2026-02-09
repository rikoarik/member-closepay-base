/**
 * VirtualCardScreen Component
 * Main screen untuk menampilkan list semua virtual cards
 */
import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft2, Eye, EyeSlash, Wifi } from 'iconsax-react-nativejs';
import {
  scale as scaleSize,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
  SvgLinearGradientView,
  scale,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import Svg, { Path } from 'react-native-svg';

// --- Types ---
interface VirtualCardData {
  id: string;
  type: 'Visa' | 'Mastercard';
  holder: string;
  balance: number; // Balance in Rupiah (number)
  number: string;
  colors: string[];
  label: string;
}

// --- Dimensions (single source of truth) ---
const W = Dimensions.get('window').width;
const CARD_W = W * 0.82;
const CARD_H = CARD_W * 1.58;
const PAD = moderateScale(20);
const GAP = scaleSize(16);
const SNAP = CARD_W + GAP * 3;
const LIST_PAD = Math.max(0, (W - CARD_W - GAP * 2) / 2);

// --- Format currency helper ---
const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

// --- Mock data ---
const MOCK_CARDS: VirtualCardData[] = [
  { id: '1', type: 'Visa', holder: 'Jhon Doe', balance: 5400000, number: '**** **** **** 1234', colors: ['#005BEA', '#00C6FB'], label: 'Sales Card' },
  { id: '2', type: 'Visa', holder: 'Jhon Doe', balance: 12350500, number: '**** **** **** 5678', colors: ['#0ba360', '#3cba92'], label: 'Expense Card' },
  { id: '3', type: 'Visa', holder: 'Jhon Doe', balance: 1200000, number: '**** **** **** 9012', colors: ['#FF9A9E', '#FECFEF'], label: 'Gift Card' },
];

// --- Closepay Logo ---
function ClosepayLogo({ width = 24, height = 24 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path d="M12.9794 6.06929C12.1187 5.97277 11.247 6.05583 10.4213 6.31301C9.59569 6.57018 8.8348 6.99568 8.18858 7.56157C7.54235 8.12746 7.02539 8.82098 6.67161 9.59661C6.31782 10.3723 6.13521 11.2125 6.13574 12.0622C6.13574 12.1187 6.13574 12.1752 6.13574 12.2316V21.5281C6.13915 21.8235 6.22648 22.1121 6.38793 22.3615C6.54939 22.6109 6.77855 22.8112 7.04967 22.9399H7.08565C7.33177 23.0541 7.60308 23.1061 7.87492 23.0913C8.14676 23.0764 8.41051 22.9952 8.64218 22.8549C8.87386 22.7146 9.06612 22.5197 9.20148 22.288C9.33684 22.0563 9.41101 21.7951 9.41725 21.5281V17.3987C10.2166 17.8248 11.1024 18.0715 12.0107 18.121C12.9191 18.1704 13.8273 18.0215 14.6698 17.6849C15.5123 17.3483 16.2682 16.8324 16.8827 16.1745C17.4973 15.5166 17.9553 14.733 18.2237 13.8804C18.4921 13.0277 18.5642 12.1273 18.4347 11.244C18.3052 10.3608 17.9774 9.5167 17.475 8.77277C16.9726 8.02885 16.3081 7.40362 15.5294 6.9422C14.7507 6.48078 13.8773 6.19469 12.9722 6.10458L12.9794 6.06929ZM12.1015 14.8716C11.4047 14.825 10.749 14.5315 10.2564 14.0458C9.76392 13.5601 9.46823 12.9153 9.42445 12.2316C9.42086 12.1799 9.42086 12.128 9.42445 12.0763C9.43018 11.3275 9.73894 10.6116 10.2828 10.086C10.5521 9.82579 10.871 9.62014 11.2214 9.48082C11.5717 9.34149 11.9465 9.27121 12.3246 9.27399C12.7026 9.27677 13.0763 9.35256 13.4245 9.49702C13.7726 9.64149 14.0884 9.8518 14.3537 10.116C14.6189 10.3801 14.8286 10.6929 14.9706 11.0366C15.1127 11.3802 15.1843 11.7479 15.1815 12.1187C15.1423 12.8834 14.7966 13.6018 14.2196 14.1175C13.6427 14.6332 12.8813 14.9043 12.1015 14.8716Z" fill="white" fillOpacity={0.9} />
      <Path d="M12.2158 22.3966C12.2178 22.6332 12.272 22.8667 12.3747 23.0808C12.4774 23.2949 12.6263 23.4846 12.8109 23.6369C12.9956 23.7892 13.2117 23.9004 13.4444 23.9629C13.6771 24.0254 13.9208 24.0377 14.1588 23.9989C16.1486 23.6946 18.032 22.9165 19.6441 21.7326C21.2562 20.5488 22.5479 18.9954 23.4061 17.2084C23.5264 16.9622 23.5812 16.6902 23.5654 16.4177C23.5495 16.1451 23.4636 15.881 23.3156 15.6498C23.1676 15.4186 22.9623 15.228 22.7189 15.0957C22.4755 14.9634 22.2019 14.8937 21.9236 14.8931C21.6219 14.8979 21.3275 14.9849 21.0733 15.1445C20.8191 15.304 20.6152 15.5298 20.4844 15.7966C19.8465 17.1118 18.891 18.2544 17.7009 19.1253C16.5108 19.9962 15.122 20.5691 13.6551 20.7942C13.2576 20.844 12.8922 21.0342 12.6273 21.3291C12.3624 21.624 12.2161 22.0035 12.2158 22.3966Z" fill="white" fillOpacity={0.7} />
      <Path d="M11.2447 0.0413948C8.94531 0.231696 6.74713 1.05382 4.90227 2.41348C3.05741 3.77314 1.64055 5.61529 0.814196 7.72867C-0.0121615 9.84205 -0.214566 12.1411 0.230195 14.3621C0.674956 16.5832 1.74887 18.6363 3.32879 20.2861V12.9943C3.22461 12.0731 3.27077 11.1414 3.46552 10.2343C3.85449 8.41288 4.81971 6.75834 6.22361 5.50657C7.62752 4.2548 9.39844 3.46969 11.284 3.26314C13.1695 3.0566 15.0733 3.43917 16.7242 4.35632C18.375 5.27347 19.6885 6.67838 20.4776 8.37081C20.6079 8.64587 20.8164 8.87814 21.0782 9.03969C21.3399 9.20123 21.6436 9.28517 21.9528 9.2814C22.2208 9.2788 22.4841 9.21155 22.7193 9.08559C22.9546 8.95962 23.1546 8.77881 23.3018 8.5591C23.449 8.33939 23.5388 8.08752 23.5634 7.82572C23.5879 7.56391 23.5464 7.30021 23.4424 7.05787C22.3939 4.79818 20.6594 2.91136 18.476 1.65543C16.2927 0.399508 13.7671 -0.164201 11.2447 0.0413948Z" fill="white" fillOpacity={0.5} />
    </Svg>
  );
}

// --- Chip icon ---
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

// --- NFC icon ---
function NfcIcon() {
  return (
    <View style={styles.nfcWrap}>
      <View style={[styles.nfcArc, { width: 18, height: 18 }]} />
      <View style={[styles.nfcArc, { width: 12, height: 12, opacity: 0.7 }]} />
      <View style={[styles.nfcArc, { width: 6, height: 6, opacity: 0.5 }]} />
    </View>
  );
}

// --- Single card (pattern: header | middle chip/nfc | footer number + holder + logo) ---
function CardItem({
  item,
  index,
  scrollX,
  onPress,
}: {
  item: VirtualCardData;
  index: number;
  scrollX: Animated.Value;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const [showBalance, setShowBalance] = React.useState(false);
  const cardScale = scrollX.interpolate({
    inputRange: [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP],
    outputRange: [0.92, 1, 0.92],
    extrapolate: 'clamp',
  });
  const opacity = scrollX.interpolate({
    inputRange: [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP],
    outputRange: [0.88, 1, 0.88],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} style={styles.cardTouchable}>
      <Animated.View style={[styles.cardOuter, { transform: [{ scale: cardScale }], opacity }]}>
        <SvgLinearGradientView colors={item.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBg}>
          <View style={styles.pattern1} />
          <View style={styles.pattern2} />
          <View style={styles.pattern3} />
          <View style={styles.patternLine} />

          <View style={styles.inner}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.brand} numberOfLines={1}>{t('home.closepayBrand')}</Text>
                <Text style={styles.subBrand} numberOfLines={1}>{t('home.member')}</Text>
              </View>
              <View style={{ transform: [{ rotate: '90deg' }] }}>
                <Wifi size={scale(34)} color={'white'} variant="Outline" />
              </View>
            </View>

            <View style={styles.mid}>
              <View style={styles.chipNfc}>
                <ChipIcon />
              </View>
              <View style={styles.balanceWrap}>
                <Text style={styles.balanceLabel}>Saldo</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceAmount}>
                    {showBalance ? formatCurrency(item.balance) : 'Rp ********'}
                  </Text>
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowBalance(!showBalance)}
                    activeOpacity={0.7}
                  >
                    {showBalance ? (
                      <Eye size={scaleSize(18)} color="white" variant="Outline" />
                    ) : (
                      <EyeSlash size={scaleSize(18)} color="white" variant="Outline" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.number} numberOfLines={1}>{item.number}</Text>
              <View style={styles.footerRow}>
                <View style={styles.holderWrap}>
                  <Text style={styles.holderLabel}>{t('home.cardHolder')}</Text>
                  <Text style={styles.holderName} numberOfLines={1}>{item.holder}</Text>
                </View>
                <ClosepayLogo width={44} height={44} />
              </View>
            </View>
          </View>
        </SvgLinearGradientView>
      </Animated.View>
    </TouchableOpacity>
  );
}

export const VirtualCardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCardPress = (card: VirtualCardData) => {
    (navigation as any).navigate('VirtualCardDetail', {
      card: {
        id: card.id,
        cardNumber: card.number,
        cardHolderName: card.holder,
        expiryDate: '12/28',
        gradientColors: card.colors,
      },
    });
  };

  const handleAddCard = () => {
    (navigation as any).navigate('AddVirtualCard');
  };

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    scrollX.setValue(x);
    const index = Math.round(x / SNAP);
    setActiveIndex(Math.min(Math.max(0, index), MOCK_CARDS.length - 1));
  }, [scrollX]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft2 size={scaleSize(24)} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('home.virtualCard')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Card List */}
      {MOCK_CARDS.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('home.virtualCard')}</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('home.addVirtualCard')}
          </Text>
          <TouchableOpacity
            style={[styles.btn, { borderColor: colors.primary }]}
            onPress={handleAddCard}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnText, { color: colors.primary }]}>{t('home.addVirtualCard')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={MOCK_CARDS}
            keyExtractor={(c) => c.id}
            renderItem={({ item, index }) => (
              <CardItem
                item={item}
                index={index}
                scrollX={scrollX}
                onPress={() => handleCardPress(item)}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + moderateVerticalScale(20) }]}
            onScroll={onScroll}
            scrollEventThrottle={16}
            nestedScrollEnabled
            overScrollMode="never"
          />
          <View style={styles.indicatorWrap}>
            {MOCK_CARDS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === activeIndex ? colors.primary : colors.border },
                  i === activeIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <View style={styles.btnWrap}>
            <TouchableOpacity
              style={[styles.btn, { borderColor: colors.primary }]}
              onPress={handleAddCard}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnText, { color: colors.primary }]}>{t('home.addVirtualCard')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: scaleSize(8),
    marginLeft: -scaleSize(8),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
  },
  headerRight: {
    width: scaleSize(40),
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: LIST_PAD,
    paddingVertical: scaleSize(12),
  },
  cardTouchable: {
    marginHorizontal: GAP,
  },
  cardOuter: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: moderateScale(24),
    overflow: 'visible',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12 },
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
  inner: {
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
  mid: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: moderateVerticalScale(4),
  },
  chipNfc: {
    flexDirection: 'row',
    gap: 10,
  },
  balanceWrap: {
    marginTop: moderateVerticalScale(16),
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(10),
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(2),
  },
  balanceAmount: {
    color: 'white',
    fontSize: moderateScale(20),
    fontWeight: '700',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  eyeButton: {
    padding: scaleSize(2),
    minWidth: scaleSize(24),
    minHeight: scaleSize(24),
    justifyContent: 'center',
    alignItems: 'center',
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
  footer: {},
  number: {
    color: 'white',
    fontSize: moderateScale(17),
    fontWeight: '500',
    letterSpacing: 2,
    marginBottom: moderateVerticalScale(6),
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  holderWrap: {
    flex: 1,
    minWidth: 0,
    marginRight: scaleSize(8),
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
  indicatorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
    marginTop: moderateVerticalScale(12),
  },
  dot: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
  },
  dotActive: {
    width: scaleSize(20),
    borderRadius: scaleSize(4),
  },
  btnWrap: {
    marginTop: moderateVerticalScale(16),
    width: '100%',
    paddingHorizontal: scaleSize(20),
    paddingBottom: moderateVerticalScale(20),
  },
  btn: {
    width: '100%',
    paddingVertical: moderateVerticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getHorizontalPadding(),
  },
  emptyTitle: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(8),
  },
  emptyText: {
    fontSize: getResponsiveFontSize('medium'),
    textAlign: 'center',
    marginBottom: moderateVerticalScale(24),
  },
});
