import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  variant?: string;
}

export const IconTransfer: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#292D32',
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.5 2C20.43 2 22 3.57 22 5.5V10.5C22 12.43 20.43 14 18.5 14H14.5V2H18.5Z"
      fill={color}
      fillOpacity="0.4"
    />
    <Path
      d="M22 6L2 6"
      stroke={color}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.5 22H5.5C3.57 22 2 20.43 2 18.5V13.5C2 11.57 3.57 10 5.5 10H14.5C16.43 10 18 11.57 18 13.5V18.5C18 20.43 16.43 22 14.5 22H9.5"
      fill={color}
      fillOpacity="0.2"
    />
    <Path
      d="M8.5 14.5L12.5 18.5M12.5 14.5L8.5 18.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
