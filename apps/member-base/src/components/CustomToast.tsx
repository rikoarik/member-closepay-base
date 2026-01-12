/**
 * Custom Toast Component
 * Toast notification dengan desain modern sesuai design
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';
import { TickCircle, InfoCircle, Danger, Warning2, CloseCircle } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import {
  scale,
  moderateVerticalScale,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';

interface CustomToastProps extends BaseToastProps {
  type: 'success' | 'info' | 'warning' | 'error';
}

const CustomToast = ({ text1, text2, type, onHide }: CustomToastProps) => {
  const { colors } = useTheme();

  // Color mapping sesuai type
  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          border: colors.success || '#22C55E',
          background: colors.successLight || '#D1FAE5',
          text: colors.success || '#22C55E',
          iconBg: colors.success || '#22C55E',
        };
      case 'info':
        return {
          border: colors.info || colors.primary || '#3B82F6',
          background: colors.infoLight || '#DBEAFE',
          text: colors.info || colors.primary || '#3B82F6',
          iconBg: colors.info || colors.primary || '#3B82F6',
        };
      case 'warning':
        return {
          border: colors.warning || '#F59E0B',
          background: colors.warningLight || '#FEF3C7',
          text: colors.warning || '#F59E0B',
          iconBg: colors.warning || '#F59E0B',
        };
      case 'error':
        return {
          border: colors.error || '#EF4444',
          background: colors.errorLight || '#FEE2E2',
          text: colors.error || '#EF4444',
          iconBg: colors.error || '#EF4444',
        };
      default:
        return {
          border: colors.primary,
          background: colors.infoLight || colors.surface,
          text: colors.text,
          iconBg: colors.primary,
        };
    }
  };

  const toastColors = getColors();

  // Icon mapping
  const getIcon = () => {
    const iconSize = scale(20);
    const iconColor = '#FFFFFF';
    
    switch (type) {
      case 'success':
        return <TickCircle size={iconSize} color={iconColor} variant="Bold" />;
      case 'info':
        return <InfoCircle size={iconSize} color={iconColor} variant="Bold" />;
      case 'warning':
        return <Warning2 size={iconSize} color={iconColor} variant="Bold" />;
      case 'error':
        return <Danger size={iconSize} color={iconColor} variant="Bold" />;
      default:
        return <InfoCircle size={iconSize} color={iconColor} variant="Bold" />;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: toastColors.background,
          borderLeftWidth: scale(4),
          borderLeftColor: toastColors.border,
        },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: toastColors.iconBg },
        ]}
      >
        {getIcon()}
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        {text1 && (
          <Text
            style={[
              styles.text1,
              { color: toastColors.text },
            ]}
            numberOfLines={2}
          >
            {text1}
          </Text>
        )}
        {text2 && (
          <Text
            style={[
              styles.text2,
              { color: toastColors.text },
            ]}
            numberOfLines={2}
          >
            {text2}
          </Text>
        )}
      </View>

      {/* Dismiss Button */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={() => onHide?.()}
        activeOpacity={0.7}
      >
        <CloseCircle size={scale(20)} color={toastColors.text} variant="Bold" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(12),
    marginHorizontal: scale(16),
    minHeight: scale(56),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text1: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: scale(2),
  },
  text2: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  dismissButton: {
    padding: scale(4),
    marginLeft: scale(8),
  },
});

// Toast config untuk react-native-toast-message
export const toastConfig = {
  success: (props: BaseToastProps) => (
    <CustomToast {...props} type="success" />
  ),
  error: (props: BaseToastProps) => (
    <CustomToast {...props} type="error" />
  ),
  info: (props: BaseToastProps) => (
    <CustomToast {...props} type="info" />
  ),
  warning: (props: BaseToastProps) => (
    <CustomToast {...props} type="warning" />
  ),
};
