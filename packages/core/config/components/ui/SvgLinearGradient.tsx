/**
 * Fabric-safe linear gradient using react-native-svg.
 * Use this instead of react-native-linear-gradient when New Architecture (Fabric) is enabled,
 * as react-native-linear-gradient does not register a Fabric component and causes RCTComponentViewRegistry crashes.
 */
import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';

export interface SvgLinearGradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  children?: React.ReactNode;
}

let gradientIdCounter = 0;

export function SvgLinearGradientView({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children,
}: SvgLinearGradientProps) {
  const rawId = React.useId?.() ?? `grad-${++gradientIdCounter}`;
  const gradientId = `lg-${String(rawId).replace(/[^a-zA-Z0-9-_]/g, '')}`;
  const x1 = `${start.x * 100}%`;
  const y1 = `${start.y * 100}%`;
  const x2 = `${end.x * 100}%`;
  const y2 = `${end.y * 100}%`;

  return (
    <View style={[styles.container, style]}>
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <Defs>
          <SvgLinearGradient id={gradientId} x1={x1} y1={y1} x2={x2} y2={y2}>
            {colors.map((color, index) => (
              <Stop
                key={index}
                offset={colors.length === 1 ? 0 : index / (colors.length - 1)}
                stopColor={color}
              />
            ))}
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill={`url(#${gradientId})`} />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
