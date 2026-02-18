import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  variant?: string;
}

export const IconDonationBox: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = '#292D32',
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    {/* Heart Symbol - Floating Above */}
    <Path
      d="M12.62 15.11C12.28 15.23 11.72 15.23 11.38 15.11C8.48 14.11 2 9.97 2 5.9C2 4.1 3.49 2.61 5.33 2.61C6.42 2.61 7.39 3.13 8 3.93C8.61 3.13 9.58 2.61 10.67 2.61C12.51 2.61 14 4.1 14 5.9C14 9.97 7.52 14.11 12.62 15.11Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="translate(4, 2)"
    />

    {/* Cupped Hand - Holding the Heart */}
    <Path
      d="M21.93 14.5C21.93 14.5 21.93 14.5 21.93 14.5C21.49 12.69 19.89 11.36 17.96 11.36H17.27C16.89 11.36 16.53 11.53 16.29 11.82L15.34 12.96C15.11 13.24 14.76 13.4 14.39 13.4H9.61C9.24 13.4 8.89 13.24 8.66 12.96L7.71 11.82C7.47 11.53 7.11 11.36 6.73 11.36H6.04C4.11 11.36 2.51 12.69 2.07 14.5C2.07 14.5 2.07 14.5 2.07 14.5C1.94 15.02 2.1 15.56 2.48 15.93L5.43 18.82C7.17 20.52 9.53 21.48 12 21.48C14.47 21.48 16.83 20.52 18.57 18.82L21.52 15.93C21.9 15.56 22.06 15.02 21.93 14.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
