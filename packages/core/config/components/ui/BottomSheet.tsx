/**
 * BottomSheet Component
 * FIXED: keyboard-safe (Android & iOS)
 */
import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
  PanResponder,
  Animated,
  Pressable,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { scale, moderateVerticalScale } from '../../utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnapPoint?: number;
  enablePanDownToClose?: boolean;
  disableClose?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = [75],
  initialSnapPoint = 0,
  enablePanDownToClose = true,
  disableClose = false,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const snapPointsInPixels = snapPoints.map(
    (p) => (SCREEN_HEIGHT * (100 - p)) / 100
  );

  const initialPosition =
    snapPointsInPixels[initialSnapPoint] ?? snapPointsInPixels[0];

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  /** 🔥 INI KUNCI */
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const startY = useRef(0);
  const currentY = useRef(initialPosition);

  /* === OPEN / CLOSE === */
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: initialPosition,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialPosition]);

  /* === KEYBOARD HANDLING (REAL FIX) === */
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  /* === PAN === */
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          !disableClose && enablePanDownToClose,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dy) > 6 && !disableClose,
        onPanResponderGrant: () => {
          translateY.stopAnimation((v) => {
            startY.current = v;
            currentY.current = v;
          });
        },
        onPanResponderMove: (_, g) => {
          const y = startY.current + g.dy;
          if (y >= 0 && y <= SCREEN_HEIGHT) {
            currentY.current = y;
            translateY.setValue(y);
          }
        },
        onPanResponderRelease: (_, g) => {
          if (g.vy > 0.6 || currentY.current > SCREEN_HEIGHT * 0.9) {
            Animated.spring(translateY, {
              toValue: SCREEN_HEIGHT,
              useNativeDriver: true,
            }).start(onClose);
          } else {
            Animated.spring(translateY, {
              toValue: initialPosition,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [disableClose, enablePanDownToClose]
  );

  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={disableClose ? undefined : onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* BACKDROP */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={disableClose ? undefined : onClose}
        >
          <Animated.View
            style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0,0,0,0.5)' },
              ]}
            />
          </Animated.View>
        </Pressable>

        {/* SHEET */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              transform: [{ translateY }],
              paddingBottom:
                keyboardHeight +
                insets.bottom +
                moderateVerticalScale(16),
            },
          ]}
          {...panResponder.panHandlers}
        >
          {enablePanDownToClose && !disableClose && (
            <View style={styles.dragHandleContainer}>
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: colors.border },
                ]}
              />
            </View>
          )}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: SCREEN_HEIGHT,
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(10),
  },
  dragHandle: {
    width: scale(40),
    height: scale(4),
    borderRadius: scale(2),
  },
});
