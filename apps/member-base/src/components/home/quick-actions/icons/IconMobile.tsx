import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  variant?: string;
}

export const IconMobile: React.FC<IconProps> = ({ width = 24, height = 24, color = '#292D32' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2H16C18.8284 2 20.2426 2 21.1213 2.87868C22 3.75736 22 5.17157 22 8V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16V8C2 5.17157 2 3.75736 2.87868 2.87868C3.75736 2 5.17157 2 8 2Z"
      fill={color}
      fillOpacity="0.4"
    />
    <Path
      d="M10 18H14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect x="5" y="5" width="14" height="10" rx="2" fill={color} />
  </Svg>
);
