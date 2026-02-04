/**
 * Icon Top Up VA - Akses Cepat
 */
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconTopUpVAProps {
  width?: number;
  height?: number;
  color?: string;
}

export const IconTopUpVA: React.FC<IconTopUpVAProps> = ({
  width = 24,
  height = 24,
  color = '#076409',
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3v10m0 0l4-4m-4 4l-4-4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);
