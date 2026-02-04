/**
 * Icon Kartu Virtual - Akses Cepat
 */
import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface IconKartuVirtualProps {
  width?: number;
  height?: number;
  color?: string;
}

export const IconKartuVirtual: React.FC<IconKartuVirtualProps> = ({
  width = 24,
  height = 24,
  color = '#076409',
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth={2}
    />
    <Path
      d="M2 10h20"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M6 16h4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);
