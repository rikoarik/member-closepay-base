import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  variant?: string;
}

export const IconWallet: React.FC<IconProps> = ({ width = 24, height = 24, color = '#292D32' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.5 20H5.5C3.57 20 2 18.43 2 16.5V7.5C2 5.57 3.57 4 5.5 4H18.5C20.43 4 22 5.57 22 7.5V16.5C22 18.43 20.43 20 18.5 20Z"
      fill={color}
      fillOpacity="0.4"
    />
    <Path
      d="M22 9H18.5C17.67 9 17 9.67 17 10.5V13.5C17 14.33 17.67 15 18.5 15H22V9Z"
      fill={color}
    />
    <Path
      d="M19.5 13C19.22 13 19 12.78 19 12.5C19 12.22 19.22 12 19.5 12C19.78 12 20 12.22 20 12.5C20 12.78 19.78 13 19.5 13Z"
      fill="white"
    />
  </Svg>
);
