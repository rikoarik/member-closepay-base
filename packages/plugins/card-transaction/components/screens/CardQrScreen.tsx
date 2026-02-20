/**
 * CardQrScreen
 * QR Kartu dengan 2 mode: ID Member dan Kartu Identitas (ID Card)
 */
import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft2, Scanner, Profile, Card } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  getHorizontalPadding,
  getMinTouchTarget,
  FontFamily,
  getResponsiveFontSize,
  scale,
  moderateVerticalScale,
} from '@core/config';

const QR_SIZE = 200;
const QR_API = 'https://api.qrserver.com/v1/create-qr-code/';

type CardParam = {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate?: string;
  gradientColors?: string[];
};

type RouteParams = {
  CardQr: { card: CardParam };
};

type QrMode = 'member' | 'idcard';

function buildPayload(mode: QrMode, card: CardParam): string {
  if (mode === 'member') {
    return JSON.stringify({ type: 'member', memberId: card.id });
  }
  return JSON.stringify({ type: 'idcard', idCardRef: card.id, cardNumber: card.cardNumber });
}

export const CardQrScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CardQr'>>();
  const card = route.params?.card;

  const [mode, setMode] = useState<QrMode>('member');

  const payload = useMemo(() => (card ? buildPayload(mode, card) : ''), [mode, card]);
  const qrUri = useMemo(
    () => (payload ? `${QR_API}?size=${QR_SIZE}x${QR_SIZE}&data=${encodeURIComponent(payload)}` : null),
    [payload]
  );

  const handleBack = () => navigation.goBack();
  const paddingH = getHorizontalPadding();
  const minTouch = getMinTouchTarget();

  if (!card) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { paddingHorizontal: paddingH }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <ArrowLeft2 size={scale(24)} color={colors.text} variant="Outline" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('home.qrCard') || 'QR Kartu'}</Text>
          <View style={{ width: minTouch }} />
        </View>
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('common.error')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: paddingH }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ArrowLeft2 size={scale(24)} color={colors.text} variant="Outline" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('home.qrCard') || 'QR Kartu'}</Text>
        <View style={{ width: minTouch }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: paddingH }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.segmentRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              mode === 'member' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setMode('member')}
          >
            <Profile size={scale(20)} color={mode === 'member' ? colors.surface : colors.text} variant="Bold" />
            <Text
              style={[styles.segmentLabel, { color: mode === 'member' ? colors.surface : colors.text }]}
            >
              {t('cardQr.idMember') || 'ID Member'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              mode === 'idcard' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setMode('idcard')}
          >
            <Card size={scale(20)} color={mode === 'idcard' ? colors.surface : colors.text} variant="Bold" />
            <Text
              style={[styles.segmentLabel, { color: mode === 'idcard' ? colors.surface : colors.text }]}
            >
              {t('cardQr.identityCard') || 'Kartu Identitas'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.qrCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.qrTitle, { color: colors.text }]}>
            {mode === 'member'
              ? (t('cardQr.idMember') || 'ID Member')
              : (t('cardQr.identityCard') || 'Kartu Identitas')}
          </Text>
          {qrUri ? (
            <View style={[styles.qrWrap, { backgroundColor: colors.background }]}>
              <Image source={{ uri: qrUri }} style={styles.qrImage} resizeMode="contain" />
            </View>
          ) : (
            <View style={[styles.qrPlaceholder, { backgroundColor: colors.background }]}>
              <Scanner size={scale(48)} color={colors.textSecondary} variant="Linear" />
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                {t('common.loading') || 'Memuat...'}
              </Text>
            </View>
          )}
          <Text style={[styles.qrHint, { color: colors.textSecondary }]}>
            {mode === 'member'
              ? (t('cardQr.idMemberHint') || 'Tunjukkan QR ini untuk identifikasi ID Member')
              : (t('cardQr.idCardHint') || 'Tunjukkan QR ini untuk identifikasi kartu identitas')}
          </Text>
        </View>

        <View style={[styles.cardContext, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardContextLabel, { color: colors.textSecondary }]}>
            {t('home.cardHolder') || 'Pemegang Kartu'}
          </Text>
          <Text style={[styles.cardContextName, { color: colors.text }]} numberOfLines={1}>
            {card.cardHolderName}
          </Text>
          <Text style={[styles.cardContextNumber, { color: colors.textSecondary }]} numberOfLines={1}>
            {card.cardNumber}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateVerticalScale(12),
  },
  backBtn: {
    minWidth: getMinTouchTarget(),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: getResponsiveFontSize('medium'), fontFamily: FontFamily.monasans.regular },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: moderateVerticalScale(32) },
  segmentRow: {
    flexDirection: 'row',
    borderRadius: scale(12),
    borderWidth: 1,
    padding: scale(4),
    marginBottom: moderateVerticalScale(24),
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(8),
  },
  segmentLabel: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  qrCard: {
    padding: scale(24),
    borderRadius: scale(16),
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  qrTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(16),
  },
  qrWrap: {
    width: QR_SIZE,
    height: QR_SIZE,
    borderRadius: scale(12),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  qrImage: {
    width: QR_SIZE,
    height: QR_SIZE,
  },
  qrPlaceholder: {
    width: QR_SIZE,
    height: QR_SIZE,
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  placeholderText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: scale(8),
  },
  qrHint: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  cardContext: {
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  cardContextLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: 2,
  },
  cardContextName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  cardContextNumber: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
});
