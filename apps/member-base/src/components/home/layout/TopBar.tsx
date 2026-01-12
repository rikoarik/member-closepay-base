/**
 * TopBar Component
 * Header bar dengan logo, notification, dan menu
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NotificationBing, HamburgerMenu } from 'iconsax-react-nativejs';
import {
  getIconSize,
  scale,
  moderateVerticalScale,
  getMinTouchTarget,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { LogoClosepay } from '@core/config/components/icons/LogoClosepay';
import { appConfig } from 'apps/member-base/config/app.config';
import { useTranslation } from '@core/i18n';

interface TopBarProps {
  notificationCount?: number;
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  notificationCount = 0,
  onNotificationPress,
  onMenuPress,
}) => {
  const { colors } = useTheme();
  const minTouchTarget = getMinTouchTarget();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.topBar,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <LogoClosepay width={scale(40)} height={scale(40)} />
        </View>
        <View>
          <Text style={styles.logoText}>{t('home.welcome')},</Text>
          <Text style={styles.logoText}>{appConfig.companyName}</Text>
        </View>
      </View>

      {/* Notification & Menu */}
      <View style={styles.topBarRight}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
        >
          <NotificationBing
            size={getIconSize('medium')}
            color={colors.text}
            variant="Broken"
          />
          {notificationCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={[styles.badgeText, { color: colors.surface }]}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuButton, { backgroundColor: colors.surface }]} onPress={onMenuPress}>
          <HamburgerMenu
            size={getIconSize('medium')}
            color={colors.text}
            variant="Broken"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const minTouchTarget = getMinTouchTarget();

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  logoCircle: {
    width: scale(40),
    height: scale(40),
    position: 'relative',
  },
  logoLayer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    position: 'absolute',
  },

  logoText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  notificationButton: {
    position: 'relative',
    padding: moderateVerticalScale(8),
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: moderateVerticalScale(4),
    right: scale(4),
    borderRadius: scale(10),
    minWidth: scale(20),
    height: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(4),
  },
  badgeText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.bold,
  },
  menuButton: {
    padding: moderateVerticalScale(8),
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    borderRadius: scale(10),
    boxShadow: '0 0 10px 0 rgba(136, 136, 136, 0.1)',
    alignItems: 'center',
  },
});


