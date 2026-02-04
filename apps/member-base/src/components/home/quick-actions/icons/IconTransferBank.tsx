/**
 * Icon Transfer Bank - Akses Cepat
 */
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconTransferBankProps {
  width?: number;
  height?: number;
  color?: string;
}

export const IconTransferBank: React.FC<IconTransferBankProps> = ({
  width = 24,
  height = 24,
  color = '#076409',
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 19V5m0 0l-5 5m5-5l5 5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 12h14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);
