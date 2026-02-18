import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconTransferMemberProps {
  width?: number;
  height?: number;
  color?: string;
  variant?: string;
}

export const IconTransferMember: React.FC<IconTransferMemberProps> = ({
  width = 24,
  height = 24,
  color = '#292D32',
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
      fill={color}
      fillOpacity="0.4"
    />
    <Path
      d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 8.5L22 5.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 8.5L19 5.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
