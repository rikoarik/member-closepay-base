/**
 * CardTopupTab Component
 * Tab untuk topup kartu: daftar kartu virtual, pilih kartu → VirtualCardTopUpAmount (payment)
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { MoneyRecive, ArrowRight2 } from 'iconsax-react-nativejs';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  scale,
  SvgLinearGradientView,
} from '@core/config';

export interface CardTopupCardItem {
  id: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  gradientColors: string[];
  orbColors?: string[];
  avatarUrl?: string;
}

const MOCK_CARDS: CardTopupCardItem[] = [
  {
    id: '1',
    cardNumber: '**** **** **** 1234',
    cardHolderName: 'Jhon Doe',
    expiryDate: '12/28',
    gradientColors: ['#005BEA', '#00C6FB'],
  },
  {
    id: '2',
    cardNumber: '**** **** **** 5678',
    cardHolderName: 'Jhon Doe',
    expiryDate: '12/28',
    gradientColors: ['#0ba360', '#3cba92'],
  },
  {
    id: '3',
    cardNumber: '**** **** **** 9012',
    cardHolderName: 'Jhon Doe',
    expiryDate: '12/28',
    gradientColors: ['#FF9A9E', '#FECFEF'],
  },
];

export const CardTopupTab: React.FC<{ isActive?: boolean }> = React.memo(({ isActive = true }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleSelectCard = (card: CardTopupCardItem) => {
    (navigation as any).navigate('VirtualCardTopUpAmount', { card });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      pointerEvents={isActive ? 'auto' : 'none'}
    >
      <View style={{ padding: getHorizontalPadding() }}>
        <Text style={[styles.header, { color: colors.text }]}>
          {t('home.topUpCard') || 'Isi Ulang Kartu'}
        </Text>
        <Text style={[styles.subheader, { color: colors.textSecondary }]}>
          {t('virtualCardDetail.selectCardToTopUp') || 'Pilih kartu untuk isi ulang dari saldo utama'}
        </Text>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {MOCK_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.8}
              onPress={() => handleSelectCard(card)}
              style={[styles.cardRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.cardPreview}>
                <SvgLinearGradientView
                  colors={card.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardPreviewInner}>
                    <Text style={styles.cardNumberPreview} numberOfLines={1}>
                      {card.cardNumber}
                    </Text>
                    <Text style={styles.cardHolderPreview} numberOfLines={1}>
                      {card.cardHolderName}
                    </Text>
                  </View>
                </SvgLinearGradientView>
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                  {t('home.cardHolder') || 'Pemegang Kartu'}
                </Text>
                <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
                  {card.cardHolderName}
                </Text>
                <Text style={[styles.cardNumber, { color: colors.textSecondary }]} numberOfLines={1}>
                  {card.cardNumber}
                </Text>
              </View>
              <View style={styles.arrowWrap}>
                <MoneyRecive size={scale(22)} color={colors.primary} variant="Bold" />
                <ArrowRight2 size={scale(18)} color={colors.textSecondary} variant="Linear" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
});

CardTopupTab.displayName = 'CardTopupTab';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(4),
    marginTop: moderateVerticalScale(8),
  },
  subheader: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(16),
  },
  list: { flex: 1 },
  listContent: { paddingBottom: moderateVerticalScale(24) },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
  },
  cardPreview: {
    width: scale(80),
    height: scale(50),
    borderRadius: scale(8),
    overflow: 'hidden',
    marginRight: scale(12),
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: scale(6),
  },
  cardPreviewInner: {},
  cardNumberPreview: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FontFamily.monasans.medium,
  },
  cardHolderPreview: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.monasans.regular,
  },
  cardInfo: { flex: 1 },
  cardLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: 2,
  },
  cardName: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  cardNumber: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: 2,
  },
  arrowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
});
