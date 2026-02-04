/**
 * Icon Transfer Member - Akses Cepat
 */
import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconTransferMemberProps {
  width?: number;
  height?: number;
  color?: string;
}

export const IconTransferMember: React.FC<IconTransferMemberProps> = ({
  width = 24,
  height = 24,
  color = '#076409',
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="3" stroke={color} strokeWidth={2} />
    <Circle cx="15" cy="17" r="3" stroke={color} strokeWidth={2} />
    <Path
      d="M12 10l3 4m0 0l-3 4m3-4H6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
