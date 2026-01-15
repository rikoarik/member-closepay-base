import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
    Animated,
    Easing,
    Platform,
    PermissionsAndroid,
    Dimensions,
    UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gallery, Flash } from 'iconsax-react-nativejs';
import {
    scale,
    FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
    Camera,
    useCameraDevice,
    useCodeScanner,
    CameraPermissionStatus,
    requestCameraPermission,
    getCameraPermissionStatus,
} from 'react-native-vision-camera';
import { launchImageLibrary, type ImageLibraryOptions } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

interface QrScanScreenProps {
    isActive: boolean;
    onScanned?: (value: string, type: 'qr' | 'barcode') => void;
    onHeaderActionsReady?: (actions: React.ReactNode) => void;
}

export const QrScanScreen: React.FC<QrScanScreenProps> = ({ isActive, onScanned, onHeaderActionsReady }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const [flashEnabled, setFlashEnabled] = useState(false);
    const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>('not-determined');
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);
    const [scannedValue, setScannedValue] = useState<string | null>(null);
    const [galleryResult, setGalleryResult] = useState<string | null>(null);
    const [scanType, setScanType] = useState<'qr' | 'barcode'>('qr');
    const [isCameraInitializing, setIsCameraInitializing] = useState(true);
    const [zoom, setZoom] = useState(1);

    const scanAnim = useRef(new Animated.Value(0)).current;
    const overlayHeightAnim = useRef(new Animated.Value(260)).current;
    const lastScanned = useRef(0);
    const lastZoomTime = useRef(0);
    const targetZoom = useRef(1);
    const zoomAnim = useRef(new Animated.Value(1)).current;
    const isZoomingRef = useRef(false);

    // Enable LayoutAnimation on Android
    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    // Animate overlay height when scanType changes
    useEffect(() => {
        Animated.timing(overlayHeightAnim, {
            toValue: scanType === 'barcode' ? scale(140) : scale(260),
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    }, [scanType, overlayHeightAnim]);

    // Animation Loop
    useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scanAnim, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scanAnim, {
                        toValue: 0,
                        duration: 2000,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        if (isActive) {
            startAnimation();
        } else {
            scanAnim.setValue(0);
        }
    }, [isActive, scanAnim]);

    const cameraDevice = useCameraDevice('back');
    const format = useMemo(() => {
        return cameraDevice?.formats.find((f: { videoWidth: number; videoHeight: number; maxFps: number; }) =>
            f.videoWidth === 1920 && f.videoHeight === 1080 && f.maxFps >= 60
        ) || cameraDevice?.formats[0];
    }, [cameraDevice]);

    // Check if camera device is ready
    useEffect(() => {
        if (cameraDevice) {
            setIsCameraInitializing(false);
        } else {
            const timer = setTimeout(() => {
                setIsCameraInitializing(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [cameraDevice]);

    // Permission Check
    useEffect(() => {
        const checkAndRequestPermission = async () => {
            try {
                if (Platform.OS === 'android') {
                    const androidPermission = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.CAMERA
                    );

                    if (!androidPermission) {
                        setIsRequestingPermission(true);
                        try {
                            const result = await PermissionsAndroid.request(
                                PermissionsAndroid.PERMISSIONS.CAMERA,
                                {
                                    title: 'Izin Kamera',
                                    message: 'Aplikasi membutuhkan akses kamera untuk memindai kode QR',
                                    buttonPositive: 'Izinkan',
                                    buttonNegative: 'Tolak',
                                }
                            );
                            if (result === PermissionsAndroid.RESULTS.GRANTED) {
                                setCameraPermission('granted');
                            } else {
                                setCameraPermission('denied');
                            }
                        } catch (err) {
                            console.error('[QrScanScreen] Android permission error:', err);
                        } finally {
                            setIsRequestingPermission(false);
                        }
                    } else {
                        setCameraPermission('granted');
                    }
                } else {
                    const status = await getCameraPermissionStatus();
                    setCameraPermission(status);
                    if (status === 'not-determined') {
                        setIsRequestingPermission(true);
                        try {
                            const newStatus = await requestCameraPermission();
                            setCameraPermission(newStatus);
                        } finally {
                            setIsRequestingPermission(false);
                        }
                    }
                }
            } catch (e) {
                console.error('[QrScanScreen] Permission check error:', e);
            }
        };

        if (isActive) {
            checkAndRequestPermission();
        }
    }, [isActive]);

    // Listen for zoom animation changes and update the actual zoom state
    useEffect(() => {
        const listenerId = zoomAnim.addListener(({ value }) => {
            setZoom(value);
        });
        return () => zoomAnim.removeListener(listenerId);
    }, [zoomAnim]);

    // Animate zoom towards target dengan smooth animation seperti Shopee
    const animateZoom = useCallback((target: number) => {
        const maxZoom = cameraDevice?.maxZoom || 4;
        const clampedTarget = Math.max(1, Math.min(target, maxZoom));

        if (Math.abs(targetZoom.current - clampedTarget) < 0.1) {
            return;
        }

        targetZoom.current = clampedTarget;
        isZoomingRef.current = true;

        Animated.timing(zoomAnim, {
            toValue: clampedTarget,
            duration: 400,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: false,
        }).start(() => {
            isZoomingRef.current = false;
        });
    }, [zoomAnim, cameraDevice]);

    // Auto-reset zoom ketika tidak ada deteksi
    useEffect(() => {
        if (!isActive) {
            if (targetZoom.current > 1) {
                animateZoom(1);
            }
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            if (now - lastScanned.current > 500 && targetZoom.current > 1 && !isZoomingRef.current) {
                const currentZoom = targetZoom.current;
                const resetTarget = Math.max(1, currentZoom - 0.2);
                animateZoom(resetTarget);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [animateZoom, isActive]);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128'],
        onCodeScanned: (codes) => {
            if (!codes.length) {
                return;
            }

            const first = codes[0];

            if (!first?.value || first.value.trim().length === 0) {
                return;
            }

            if (!first.frame || !first.frame.width || !first.frame.height) {
                return;
            }

            const { width: codeWidth, height: codeHeight } = first.frame;
            const minCodeSize = scale(20);
            if (codeWidth < minCodeSize || codeHeight < minCodeSize) {
                return;
            }

            lastScanned.current = Date.now();

            // Auto-zoom logic seperti Shopee
            const screenArea = width * height;
            const codeArea = codeWidth * codeHeight;
            const ratio = codeArea / screenArea;

            const now = Date.now();
            const maxZoom = cameraDevice?.maxZoom || 4;

            if (ratio < 0.03 && ratio > 0.0005 && targetZoom.current < maxZoom && (now - lastZoomTime.current > 400)) {
                const idealZoom = Math.min(1 + (0.03 - ratio) * 50, maxZoom);
                const currentZoom = targetZoom.current;
                const zoomStep = 0.15;
                const desiredZoom = Math.min(currentZoom + zoomStep, idealZoom);

                animateZoom(desiredZoom);
                lastZoomTime.current = now;
            }
            else if (ratio > 0.10 && targetZoom.current > 1 && (now - lastZoomTime.current > 400)) {
                const currentZoom = targetZoom.current;
                const resetTarget = Math.max(1, currentZoom - 0.2);
                animateZoom(resetTarget);
                lastZoomTime.current = now;
            }

            setScannedValue(first.value);
            const detectedType = first.type === 'qr' ? 'qr' : 'barcode';
            setScanType(detectedType);

            if (onScanned) {
                onScanned(first.value, detectedType);
            }
        },
    });

    const handlePickFromGallery = useCallback(async () => {
        const options: ImageLibraryOptions = {
            mediaType: 'photo',
            selectionLimit: 1,
            includeBase64: false,
        };
        const result = await launchImageLibrary(options);
        if (result.didCancel || !result.assets?.length) return;

        const asset = result.assets[0];
        const label = asset.fileName || asset.uri || 'Gambar dipilih';
        setGalleryResult(label);
        setScannedValue(label);
    }, []);

    // Expose header actions
    useEffect(() => {
        if (onHeaderActionsReady) {
            onHeaderActionsReady(
                <QrScanHeaderActions
                    flashEnabled={flashEnabled}
                    onToggleFlash={() => setFlashEnabled((p) => !p)}
                    onPickFromGallery={handlePickFromGallery}
                />
            );
        }
    }, [flashEnabled, handlePickFromGallery, onHeaderActionsReady]);

    const permissionDenied = cameraPermission === 'denied' || cameraPermission === 'restricted';
    const canShowCamera =
        isActive &&
        !isCameraInitializing &&
        cameraDevice &&
        cameraPermission === 'granted';

    if (isRequestingPermission) {
        return (
            <View style={[styles.centerBox, styles.absoluteCenter]}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={{ color: 'white', marginTop: 12 }}>
                    {t('qr.requestingPermission') || 'Meminta izin kamera...'}
                </Text>
            </View>
        );
    }

    if (permissionDenied) {
        return (
            <View style={[styles.centerBox, styles.absoluteCenter, { backgroundColor: 'black' }]}>
                <Text style={[styles.permissionText, { color: 'white' }]}>
                    {t('qr.permissionDenied') || 'Izin kamera ditolak. Buka pengaturan.'}
                </Text>
                <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                    onPress={() => Linking.openSettings()}
                >
                    <Text style={[styles.primaryBtnText, { color: colors.surface }]}>
                        {t('qr.openSettings') || 'Buka Settings'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={StyleSheet.absoluteFill}>
            {canShowCamera ? (
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={cameraDevice}
                    isActive={isActive}
                    codeScanner={codeScanner}
                    torch={flashEnabled ? 'on' : 'off'}
                    zoom={zoom}
                    format={format}
                />
            ) : (
                <View style={[styles.cameraFallback, { backgroundColor: 'black' }]}>
                    <ActivityIndicator color={colors.primary} size="large" />
                    <Text style={{ color: 'white', marginTop: 12 }}>
                        {isCameraInitializing ? 'Memuat Kamera...' : 'Kamera tidak tersedia'}
                    </Text>
                </View>
            )}

            {/* Dark Overlay with Scan Window Hole */}
            <View style={styles.overlayContainer} pointerEvents="box-none">
                <View style={styles.overlayTop} pointerEvents="none" />
                <Animated.View style={[styles.overlayMiddle, { height: overlayHeightAnim }]} pointerEvents="none">
                    <View style={styles.overlaySide} pointerEvents="none" />
                    <View style={[
                        styles.scanWindow,
                        scanType === 'barcode' ? styles.scanWindowBarcode : styles.scanWindowQr
                    ]} pointerEvents="none">
                        {/* Corner Markers */}
                        <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} pointerEvents="none" />
                        <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} pointerEvents="none" />
                        <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} pointerEvents="none" />
                        <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} pointerEvents="none" />

                        {/* Scan Line */}
                        <Animated.View
                            style={[
                                styles.scanLine,
                                {
                                    backgroundColor: colors.primary,
                                    transform: [{
                                        translateY: scanAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, scanType === 'barcode' ? scale(140) : scale(260)],
                                        }),
                                    }],
                                },
                            ]}
                            pointerEvents="none"
                        />
                    </View>
                    <View style={styles.overlaySide} pointerEvents="none" />
                </Animated.View>
                <View style={styles.overlayBottom} pointerEvents="none" />
            </View>

            {/* Floating Controls */}
            <View style={[styles.floatingControls, { paddingBottom: insets.bottom + 80 }]}>
                {(scannedValue || galleryResult) && (
                    <View style={[styles.resultToast, { backgroundColor: 'rgba(0,0,0,0.8)', borderColor: colors.primary }]}>
                        <Text style={[styles.resultLabel, { color: '#ccc' }]}>
                            {t('qr.scanResult') || 'Hasil:'}
                        </Text>
                        <Text style={[styles.resultValue, { color: 'white' }]} numberOfLines={1}>
                            {scannedValue || galleryResult}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

// Header actions untuk QrScanScreen
export const QrScanHeaderActions: React.FC<{
    flashEnabled: boolean;
    onToggleFlash: () => void;
    onPickFromGallery: () => void;
}> = ({ flashEnabled, onToggleFlash, onPickFromGallery }) => {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8) }}>
            <TouchableOpacity onPress={onPickFromGallery}>
                <Gallery size={scale(24)} color="white" />
            </TouchableOpacity>

            <View style={{ width: scale(8) }} />
            <TouchableOpacity onPress={onToggleFlash}>
                <Flash
                    size={scale(24)}
                    color={flashEnabled ? '#FFD700' : 'white'}
                    variant={flashEnabled ? "Bold" : "Linear"}
                />
            </TouchableOpacity>
             <View style={{ width: scale(16) }} />
        </View>
    );
};

const styles = StyleSheet.create({
    centerBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    absoluteCenter: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    cameraFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
        pointerEvents: 'box-none',
    },
    overlayTop: {
        flex: 0.7,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    overlayMiddle: {
        flexDirection: 'row',
        height: scale(260),
    },
    overlayBottom: {
        flex: 1.3,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        pointerEvents: 'box-none',
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    scanWindow: {
        borderColor: 'transparent',
    },
    scanWindowQr: {
        width: scale(260),
        height: scale(260)
    },
    scanWindowBarcode: {
        width: scale(300),
        height: scale(140)
    },
    corner: {
        position: 'absolute',
        width: scale(20),
        height: scale(20),
        borderWidth: 4,
        borderColor: 'white'
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0
    },
    scanLine: {
        width: '100%',
        height: 2,
        shadowColor: '#00ff00',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 4,
        shadowRadius: scale(10),
    },
    floatingControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center'
    },
    resultToast: {
        position: 'absolute',
        bottom: scale(120),
        padding: scale(16),
        borderRadius: scale(12),
        borderLeftWidth: scale(4),
        width: '90%',
    },
    resultLabel: {
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.medium
    },
    resultValue: {
        fontSize: scale(16),
        fontFamily: FontFamily.monasans.bold
    },
    permissionText: {
        textAlign: 'center',
        fontSize: scale(14),
        marginBottom: scale(14)
    },
    primaryBtn: {
        paddingVertical: scale(12),
        paddingHorizontal: scale(16),
        borderRadius: scale(12)
    },
    primaryBtnText: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.semiBold
    },
});
