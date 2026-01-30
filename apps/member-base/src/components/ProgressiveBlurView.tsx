import React from 'react';
import { ViewProps } from 'react-native';
// @ts-ignore
import { ProgressiveBlurView as NativeProgressiveBlurView } from '@sbaiahmed1/react-native-blur';

export interface ProgressiveBlurViewProps extends ViewProps {
  startBlur?: number;
  endBlur?: number;
  gradientDirection?: 'vertical' | 'horizontal';
  blurAmount?: number;
  blurStyle?: string;
  tintAmount?: number;
  // Direct Library Props
  blurType?: string;
  direction?: 'blurredTopClearBottom' | 'blurredBottomClearTop' | 'blurredCenterClearTopAndBottom';
  startOffset?: number;
}

export const ProgressiveBlurView: React.FC<ProgressiveBlurViewProps> = ({
  style,
  startBlur,
  endBlur,
  gradientDirection,
  blurAmount,
  blurStyle,
  tintAmount,
  ...props
}) => {
  const overlayColor = tintAmount ? `rgba(255, 255, 255, ${tintAmount})` : undefined;

  return (
    <NativeProgressiveBlurView
      style={style}
      blurType={(blurStyle as any) || 'regular'}
      blurAmount={2} // Fixed amount for now as library uses different scale?
      direction="blurredTopClearBottom"
      overlayColor={overlayColor}
      {...props}
    />
  );
};
