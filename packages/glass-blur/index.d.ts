import { ViewProps } from 'react-native';
import React from 'react';

export interface ProgressiveBlurViewProps extends ViewProps {
  style?: ViewProps['style'];
  startBlur?: number;
  endBlur?: number;
}

export const ProgressiveBlurView: React.FC<ProgressiveBlurViewProps>;
