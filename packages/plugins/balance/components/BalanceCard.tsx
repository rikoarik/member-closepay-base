/**
 * BalanceCard Component
 * Card utama dengan balance, title, dan action buttons - Optimized
 */
import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Eye, EyeSlash, ArrowCircleRight2 } from 'iconsax-react-nativejs';
import { useNavigation } from '@react-navigation/native';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getIconSize,
  getResponsiveFontSize,
  FontFamily,
} from '../../../core/config';
import { useTheme } from '../../../core/theme';
import { useTranslation } from '../../../core/i18n';

interface BalanceCardProps {
  title: string;
  balance: number;
  showBalance: boolean;
  onToggleBalance: () => void;
}

// Pre-calculate icon sizes
const ICON_SIZE_MEDIUM = getIconSize('medium');
const ICON_SIZE_SMALL = scale(20);

// Pre-create Eye icons to avoid re-creation
const EYE_ICON = <Eye size={ICON_SIZE_MEDIUM} color="#FFFFFF" variant="Outline" />;
const EYE_SLASH_ICON = <EyeSlash size={ICON_SIZE_MEDIUM} color="#FFFFFF" variant="Outline" />;

// Custom comparison untuk mencegah re-render yang tidak perlu
const areEqual = (prevProps: BalanceCardProps, nextProps: BalanceCardProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.balance === nextProps.balance &&
    prevProps.showBalance === nextProps.showBalance &&
    prevProps.onToggleBalance === nextProps.onToggleBalance
  );
};

export const BalanceCard: React.FC<BalanceCardProps> = React.memo(({
  title,
  balance,
  showBalance,
  onToggleBalance,
}) => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  // Handler untuk navigate ke Detail (Transaction History)
  const handleDetail = useCallback(() => {
    // @ts-ignore
    navigation.navigate('TransactionHistory');
  }, [navigation]);

  // Memoized formatted balance
  const formattedBalance = useMemo(() => {
    return showBalance
      ? `Rp ${balance.toLocaleString('id-ID')}`
      : 'Rp ********';
  }, [balance, showBalance]);

  // Card background style - menggunakan theme colors
  const cardBackgroundStyle = useMemo(() => [
    styles.cardContainer,
    { backgroundColor: colors.primary }
  ], [colors.primary]);

  // Memoized text styles
  const balanceLabelStyle = useMemo(() => [
    styles.balanceLabel,
    { color: '#FFFFFF', opacity: 0.9 }
  ], []);

  const balanceAmountStyle = useMemo(() => [
    styles.balanceAmount,
    { color: '#FFFFFF' }
  ], []);

  const actionLabelStyle = useMemo(() => [
    styles.balanceActionLabel,
    { color: colors.text, fontFamily: FontFamily.monasans.bold }
  ], []);

  // Detail button background style - putih solid
  const detailButtonStyle = useMemo(() => [
    styles.detailButton,
    {
      backgroundColor: colors.background,
    }
  ], []);

  return (
    <View style={styles.mainCard}>
      <View style={cardBackgroundStyle}>
        {/* Background Pattern Overlay */}
        <Image
          source={require('../../../../assets/effect/noise-bg.png')}
          style={styles.backgroundPattern}
          resizeMode="cover"
        />

        <Image
          source={require('../../../../assets/effect/pattern.png')}
          style={styles.paternPattern}
          resizeMode="stretch"
        />
        
        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Balance Section */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceLeft}>
              <Text style={balanceLabelStyle}>
                {t('home.balance')}
              </Text>
              <View style={styles.balanceRow}>
                <Text style={balanceAmountStyle}>
                  {formattedBalance}
                </Text>
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={onToggleBalance}
                >
                  {showBalance ? EYE_ICON : EYE_SLASH_ICON}
                </TouchableOpacity>
              </View>
            </View>
            {/* Detail Button */}
            <TouchableOpacity
              style={detailButtonStyle}
              onPress={handleDetail}
              activeOpacity={0.7}
            >
              <Text style={actionLabelStyle}>
                {t('home.detail') || 'Detail'}
              </Text>
              <View >
                <ArrowCircleRight2 
                  size={ICON_SIZE_SMALL} 
                  color={colors.text} 
                  variant="Bold"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}, areEqual);

BalanceCard.displayName = 'BalanceCard';

const styles = StyleSheet.create({
  mainCard: {
    position: 'relative',
    zIndex: 1,
  },
  cardContainer: {
    borderRadius: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(12),
    elevation: 6,
    position: 'relative',
    zIndex: 2,
    minHeight: scale(90),
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: scale(16),
    opacity: 0.5,
    mixBlendMode: 'overlay' as const,
  },
  paternPattern: {
    position: 'absolute',
    height: '100%',
    width: '60%',
    top: 2,
    right: 2,
    bottom: 0,
    opacity: 0.3,
  },
  cardContent: {
    padding: scale(16),
    zIndex: 1,
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLeft: {
    flex: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(12),
    paddingHorizontal: scale(8),
    paddingVertical: scale(8),
    borderRadius: scale(10),
    minHeight: scale(30),
  },
  balanceActionLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  balanceLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.bold,
  },
  balanceAmount: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  eyeButton: {
    minWidth: scale(44),
    minHeight: scale(44),
    justifyContent: 'center',
  },
});

