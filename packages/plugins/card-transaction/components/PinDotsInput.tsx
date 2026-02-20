/**
 * PinDotsInput
 * Input PIN: 6 kotak persegi. Indikator aktif (border + kursor) hanya saat baris di-tap/focus.
 * Tanpa keypad; user input lewat keyboard sistem (number-pad).
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { scale } from '@core/config';

export interface PinDotsInputProps {
  length?: number;
  onComplete?: (pin: string) => void;
  onChange?: (pin: string) => void;
  autoSubmit?: boolean;
}

const BOX_SIZE = scale(40);
const BOX_BORDER_RADIUS = scale(8);
const GAP = scale(8);
const DOT_SIZE = scale(8);

export const PinDotsInput: React.FC<PinDotsInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  autoSubmit = true,
}) => {
  const { colors } = useTheme();
  const [pin, setPin] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '').slice(0, length);
      setPin(digits);
      onChange?.(digits);
      if (digits.length === length && autoSubmit) {
        onComplete?.(digits);
      }
    },
    [length, onChange, onComplete, autoSubmit]
  );

  useEffect(() => {
    if (pin.length === length && !autoSubmit) {
      onComplete?.(pin);
    }
  }, [pin, length, autoSubmit, onComplete]);

  const activeIndex = pin.length;
  const showActive = focused;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
      style={styles.wrapper}
    >
      <View style={styles.boxesRow}>
        {Array.from({ length }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.box,
              {
                width: BOX_SIZE,
                height: BOX_SIZE,
                borderRadius: BOX_BORDER_RADIUS,
                borderWidth: 1.5,
                backgroundColor: colors.surface,
                borderColor: showActive && i === activeIndex ? colors.primary : colors.border,
              },
            ]}
          >
            {pin[i] ? (
              <View
                style={[
                  styles.filledDot,
                  {
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    borderRadius: DOT_SIZE / 2,
                    backgroundColor: colors.text,
                  },
                ]}
              />
            ) : showActive && i === activeIndex ? (
              <View style={[styles.cursor, { backgroundColor: colors.text }]} />
            ) : null}
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={pin}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        caretHidden
        accessibilityLabel="PIN input"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GAP,
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledDot: {
    alignSelf: 'center',
  },
  cursor: {
    width: 2,
    height: scale(22),
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    padding: 0,
  },
});
