/**
 * Reusable PIN Input Component
 * Component untuk input PIN yang bisa digunakan di berbagai transaksi
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import {
  scale,
  moderateVerticalScale,
  getMinTouchTarget,
  getResponsiveFontSize,
  FontFamily,
  getIconSize,
} from '@core/config';
import { TagCross } from 'iconsax-react-nativejs';

export interface PinInputProps {
  /** Length of PIN (default: 6) */
  length?: number;
  /** Callback when PIN is complete */
  onComplete?: (pin: string) => void;
  /** Callback when PIN changes */
  onChange?: (pin: string) => void;
  /** Show forgot PIN link */
  showForgotPin?: boolean;
  /** Callback when forgot PIN is pressed */
  onForgotPin?: () => void;
  /** Auto submit when complete */
  autoSubmit?: boolean;
  /** Delay before auto submit (ms) */
  autoSubmitDelay?: number;
}

export const PinInput: React.FC<PinInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  showForgotPin = true,
  onForgotPin,
  autoSubmit = true,
  autoSubmitDelay = 300,
}) => {
  const { colors } = useTheme();
  const [pin, setPin] = useState<string[]>([]);

  const handleNumberPress = useCallback(
    (number: string) => {
      if (pin.length < length) {
        const newPin = [...pin, number];
        setPin(newPin);
        const pinString = newPin.join('');
        onChange?.(pinString);

        if (newPin.length === length && autoSubmit) {
          setTimeout(() => {
            onComplete?.(pinString);
          }, autoSubmitDelay);
        }
      }
    },
    [pin, length, onChange, onComplete, autoSubmit, autoSubmitDelay]
  );

  const handleDelete = useCallback(() => {
    if (pin.length > 0) {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      onChange?.(newPin.join(''));
    }
  }, [pin, onChange]);

  const handleForgotPin = useCallback(() => {
    onForgotPin?.();
  }, [onForgotPin]);

  // Manual submit when PIN is complete (if autoSubmit is false)
  useEffect(() => {
    if (pin.length === length && !autoSubmit) {
      const pinString = pin.join('');
      onComplete?.(pinString);
    }
  }, [pin.length, length, autoSubmit, onComplete]);

  const renderPinDots = () => {
    return (
      <View style={styles.pinContainer}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: pin[index] ? colors.primary : colors.surface,
                borderColor: pin[index] ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'delete'],
    ];

    return (
      <View style={styles.keypad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => {
              if (key === '') {
                return <View key={`empty-${rowIndex}`} style={styles.keypadKey} />;
              }

              if (key === 'delete') {
                return (
                  <TouchableOpacity
                    key="delete"
                    style={[
                      styles.keypadKey,
                      styles.deleteButton,
                      {
                        backgroundColor: colors.surface, // Keep transparent/background color
                      },
                    ]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                    disabled={pin.length === 0}
                  >
                    <View style={[styles.deleteButtonIcon, { backgroundColor: colors.surface }]}>
                      <TagCross size={getIconSize('large')} color={colors.error} variant="Linear" />
                    </View>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.keypadKey,
                    {
                      backgroundColor: colors.surface,
                    },
                  ]}
                  onPress={() => handleNumberPress(key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.keypadKeyText,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* PIN Input Display */}
      {renderPinDots()}

      {/* Forgot PIN Link */}
      {showForgotPin && (
        <TouchableOpacity
          style={styles.forgotPinContainer}
          onPress={handleForgotPin}
          activeOpacity={0.7}
        >
          <Text style={[styles.forgotPinText, { color: colors.primary }]}>Lupa PIN?</Text>
        </TouchableOpacity>
      )}

      {/* Keypad */}
      {renderKeypad()}
    </View>
  );
};

const minTouchTarget = getMinTouchTarget();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pinContainer: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(8),
   
  },
  pinDot: {
    width: scale(40),
    height: scale(50),
    borderRadius: scale(8),
    borderWidth: 1.5,
  },
  forgotPinContainer: {
    alignItems: 'center',
    marginTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(60),
  },
  forgotPinText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  keypad: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: scale(450),
    paddingHorizontal: scale(24),
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateVerticalScale(24),
    paddingHorizontal: scale(12),
  },
  keypadKey: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
  },
  keypadKeyText: {
    fontSize: scale(28),
    fontFamily: FontFamily.monasans.semiBold,
  },
  deleteButton: {
    // Delete button styling
  },
  deleteButtonIcon: {
    width: scale(24),
    height: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(12),
    padding: scale(8),
  },
  deleteButtonText: {
    fontSize: scale(24),
    fontFamily: FontFamily.monasans.bold,
  },
});
