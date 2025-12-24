/**
 * QrScanButton Component
 * Tombol QR Scan yang muncul di tengah bawah HomeScreen (di atas FAB)
 * Dapat dikonfigurasi show/hide melalui config
 */
import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from '@core/theme';
import { useConfig } from '@core/config';
import { moderateScale } from '../../utils/responsive';
import { QrScanIcon } from '../icons';

interface QrScanButtonProps {
    onPress?: () => void;
    size?: number;
    backgroundColor?: string;
}

export const QrScanButton: React.FC<QrScanButtonProps> = ({
    onPress,
    size = 64,
    backgroundColor,
}) => {
    const { colors } = useTheme();
    const { config } = useConfig();

    // Check if QR button should be shown from config
    const showQrButton = config?.showQrButton ?? true;

    if (!showQrButton) {
        return null;
    }

    // Use configured background color or fall back to theme primary
    const bgColor = backgroundColor || colors.primary;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        width: moderateScale(size),
                        height: moderateScale(size),
                        borderRadius: moderateScale(size / 2),
                        backgroundColor: bgColor,
                    },
                ]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <QrScanIcon
                    width={moderateScale(30)}
                    height={moderateScale(30)}
                    fill={'#FAFAFA'}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: moderateScale(50), // Above FAB
        alignSelf: 'center',
        zIndex: 100,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default QrScanButton;
