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
    LayoutAnimation,
    UIManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Gallery, Flash, ArrowDown2, ArrowLeft, Scanner, ScanBarcode, TickCircle } from 'iconsax-react-nativejs';
import {
    scale,
    getHorizontalPadding,
    ScreenHeader,
    getVerticalPadding,
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

type QrTab = 'display' | 'scan';
type BalanceType = 'plafon' | 'makan' | 'utama';

interface BalanceOption {
    id: BalanceType;
    label: string;
    labelKey: string;
}

export const QrScreen = () => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [activeTab, setActiveTab] = useState<QrTab>('scan');
    const [flashEnabled, setFlashEnabled] = useState(false);
    const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>('not-determined');
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);
    const [scannedValue, setScannedValue] = useState<string | null>(null);
    const [galleryResult, setGalleryResult] = useState<string | null>(null);
    const [selectedBalance, setSelectedBalance] = useState<BalanceType>('plafon');
    const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);
    const [scanType, setScanType] = useState<'qr' | 'barcode'>('qr');
    const [isCameraInitializing, setIsCameraInitializing] = useState(true);
    const [zoom, setZoom] = useState(1);

    const scanAnim = useRef(new Animated.Value(0)).current;
    const overlayHeightAnim = useRef(new Animated.Value(260)).current;
    const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
    const dropdownAnim = useRef(new Animated.Value(0)).current;

    // Enable LayoutAnimation on Android
    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    // Toggle dropdown with animation
    const toggleBalanceDropdown = useCallback(() => {
        setShowBalanceDropdown((prev) => {
            const newValue = !prev;

            Animated.timing(dropdownAnim, {
                toValue: newValue ? 1 : 0,
                duration: 250,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                useNativeDriver: true,
            }).start();

            return newValue;
        });
    }, [dropdownAnim]);

    // Animate tab indicator when activeTab changes
    useEffect(() => {
        Animated.spring(tabIndicatorAnim, {
            toValue: activeTab === 'scan' ? 0 : 1,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
        }).start();
    }, [activeTab, tabIndicatorAnim]);

    // Animate overlay height when scanType changes
    useEffect(() => {
        Animated.timing(overlayHeightAnim, {
            toValue: scanType === 'barcode' ? scale(140) : scale(260),
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false, // height cannot use native driver
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

        if (activeTab === 'scan') {
            startAnimation();
        } else {
            scanAnim.setValue(0);
        }
    }, [activeTab]);

    const balanceOptions: BalanceOption[] = useMemo(
        () => [
            { id: 'plafon', label: t('qr.balancePlafon') || 'Saldo Plafon', labelKey: 'qr.balancePlafon' },
            { id: 'makan', label: t('qr.balanceMakan') || 'Saldo Makan', labelKey: 'qr.balanceMakan' },
            { id: 'utama', label: t('qr.balanceUtama') || 'Saldo Utama', labelKey: 'qr.balanceUtama' },
        ],
        [t]
    );

    const selectedBalanceOption = useMemo(
        () => balanceOptions.find((opt) => opt.id === selectedBalance) || balanceOptions[0],
        [balanceOptions, selectedBalance]
    );

    const cameraDevice = useCameraDevice('back');
    // Auto-select best format for scanning (1080p @ 60fps preferred)
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
                // On Android, use PermissionsAndroid API directly
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
                            console.error('[QrScreen] Android permission error:', err);
                        } finally {
                            setIsRequestingPermission(false);
                        }
                    } else {
                        setCameraPermission('granted');
                    }
                } else {
                    // iOS
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
                console.error('[QrScreen] Permission check error:', e);
            }
        };

        if (activeTab === 'scan') {
            checkAndRequestPermission();
        }
    }, [activeTab]);

    const lastScanned = useRef(0);
    const targetZoom = useRef(1);
    const zoomAnim = useRef(new Animated.Value(1)).current;

    // Listen for zoom animation changes and update the actual zoom state
    useEffect(() => {
        const listenerId = zoomAnim.addListener(({ value }) => {
            setZoom(value);
        });
        return () => zoomAnim.removeListener(listenerId);
    }, [zoomAnim]);

    // Animate zoom towards target
    const animateZoom = useCallback((target: number) => {
        targetZoom.current = target;
        Animated.timing(zoomAnim, {
            toValue: target,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    }, [zoomAnim]);

    // Auto-reset zoom effect
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            // If inactive for > 1s and zoom is active, animate back to 1
            if (now - lastScanned.current > 1000 && targetZoom.current > 1) {
                animateZoom(1);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [animateZoom]);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128'],
        onCodeScanned: (codes) => {
            if (!codes.length) return;

            const first = codes[0];
            lastScanned.current = Date.now();

            // Auto-zoom logic
            if (first.frame) {
                const { width: codeWidth, height: codeHeight } = first.frame;
                const screenArea = width * height;
                const codeArea = codeWidth * codeHeight;
                const ratio = codeArea / screenArea;

                // If code is small, calculate ideal zoom
                if (ratio < 0.08 && targetZoom.current < 4) {
                    const desiredZoom = Math.min(targetZoom.current + 0.5, 4);
                    animateZoom(desiredZoom);
                }
            }

            setScannedValue(first?.value ?? null);
            if (first?.type === 'qr') setScanType('qr');
            else setScanType('barcode');
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

    const permissionDenied = cameraPermission === 'denied' || cameraPermission === 'restricted';
    const canShowCamera =
        activeTab === 'scan' &&
        !isCameraInitializing &&
        cameraDevice &&
        cameraPermission === 'granted';

    const renderScanTab = () => {
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
                        isActive={activeTab === 'scan'}
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
                <View style={styles.overlayContainer}>
                    <View style={styles.overlayTop} />
                    <Animated.View style={[styles.overlayMiddle, { height: overlayHeightAnim }]}>
                        <View style={styles.overlaySide} />
                        <View style={[
                            styles.scanWindow,
                            scanType === 'barcode' ? styles.scanWindowBarcode : styles.scanWindowQr
                        ]}>
                            {/* Corner Markers */}
                            <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
                            <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
                            <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
                            <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />

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
                            />
                        </View>
                        <View style={styles.overlaySide} />
                    </Animated.View>
                    <View style={styles.overlayBottom} />
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
            </View >
        );
    };

    return (
        <View style={[styles.container]}>
            {/* Full Screen Camera Layer */}
            {activeTab === 'scan' ? renderScanTab() : (
                <View style={[styles.centerBox, { backgroundColor: colors.background }]}>
                    <Text style={{ color: colors.text }}>QR Display UI Placeholder</Text>
                </View>
            )}

            {/* Header Overlay */}
            <SafeAreaView style={styles.headerOverlay}>
                <ScreenHeader
                    title={t('qr.title')}
                    onBackPress={() => navigation.goBack()}
                    textColor={activeTab === 'scan' ? 'white' : colors.text}
                    rightComponent={activeTab === 'scan' ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(8) }}>
                            <TouchableOpacity onPress={() => setFlashEnabled((p) => !p)}>
                                <Flash
                                    size={scale(24)}
                                    color={flashEnabled ? '#FFD700' : 'white'}
                                    variant={flashEnabled ? "Bold" : "Linear"}
                                />
                            </TouchableOpacity>
                            <View style={{ width: scale(16) }} />
                            <TouchableOpacity onPress={handlePickFromGallery}>
                                <Gallery size={scale(24)} color="white" />
                            </TouchableOpacity>
                        </View>
                    ) : undefined}
                />

            </SafeAreaView>

            {/* Bottom Tab Switcher Overlay */}
            <View style={[styles.bottomTabOverlay, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
                {/* Balance Selection Section */}
                <View style={{ marginBottom: scale(16) }}>
                    <TouchableOpacity
                        onPress={toggleBalanceDropdown}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: scale(16),
                            paddingVertical: scale(12),
                            backgroundColor: colors.surface,
                            borderRadius: scale(16),
                            borderBottomLeftRadius: showBalanceDropdown ? 0 : scale(16),
                            borderBottomRightRadius: showBalanceDropdown ? 0 : scale(16),
                            borderWidth: 1,
                            borderBottomWidth: showBalanceDropdown ? 0 : 1,
                            borderColor: '#E2E8F0', // Slate-200
                        }}
                    >
                        <View>
                            <Text style={{
                                color: '#94A3B8', // Slate-400
                                fontSize: scale(12),
                                fontFamily: FontFamily.monasans.medium,
                                marginBottom: scale(2)
                            }}>
                                {t('qr.balanceLabel') || 'Pilih Saldo'}
                            </Text>
                            <Text style={{
                                color: colors.text,
                                fontSize: scale(16),
                                fontFamily: FontFamily.monasans.semiBold
                            }}>
                                {selectedBalanceOption.label}
                            </Text>
                        </View>

                        <View style={{ transform: [{ rotate: showBalanceDropdown ? '180deg' : '0deg' }] }}>
                            <ArrowDown2 size={scale(20)} color="#cbd5e1" variant="Linear" />
                        </View>
                    </TouchableOpacity>

                    {showBalanceDropdown && (
                        <Animated.View style={{
                            marginTop: 0,
                            backgroundColor: colors.surface,
                            borderRadius: scale(16),
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
                            borderTopWidth: 1,
                            overflow: 'hidden',
                            opacity: dropdownAnim,
                            transform: [{
                                scaleY: dropdownAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                })
                            }, {
                                translateY: dropdownAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-10, 0],
                                })
                            }],
                        }}>
                            {balanceOptions.map((option, index) => {
                                const isSelected = selectedBalance === option.id;
                                return (
                                    <TouchableOpacity
                                        key={option.id}
                                        onPress={() => {
                                            setSelectedBalance(option.id);
                                            toggleBalanceDropdown();
                                        }}
                                        style={{
                                            paddingHorizontal: scale(16),
                                            paddingVertical: scale(12),
                                            borderBottomWidth: index < balanceOptions.length - 1 ? 1 : 0,
                                            borderBottomColor: '#F1F5F9',
                                            backgroundColor: isSelected ? (colors.primary + '10') : 'transparent',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text style={{
                                            color: isSelected ? colors.primary : colors.text,
                                            fontFamily: FontFamily.monasans.semiBold,
                                            fontSize: scale(14)
                                        }}>
                                            {option.label}
                                        </Text>
                                        {isSelected && (
                                            <TickCircle size={scale(20)} color={colors.primary} variant="Bold" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </Animated.View>
                    )}
                </View>

                {/* Custom Tabs with Icons */}
                <View style={[styles.customTabsContainer]}>
                    <View style={[styles.customTabsWrapper, { backgroundColor: colors.surface }]}>
                        {/* Sliding Indicator */}
                        <Animated.View
                            style={[
                                styles.customTabIndicator,
                                {
                                    backgroundColor: colors.primary,
                                    transform: [{
                                        translateX: tabIndicatorAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, scale(160)],
                                        })
                                    }]
                                }
                            ]}
                        />

                        {/* Scan Tab */}
                        <TouchableOpacity
                            style={styles.customTab}
                            onPress={() => setActiveTab('scan')}
                            activeOpacity={0.8}
                        >
                            <Scanner
                                size={scale(20)}
                                color={activeTab === 'scan' ? 'white' : colors.text}
                                variant={activeTab === 'scan' ? 'Bold' : 'Linear'}
                            />
                            <Text style={[
                                styles.customTabText,
                                { color: activeTab === 'scan' ? 'white' : colors.text }
                            ]}>
                                {t('qr.scan') || 'Pindai'}
                            </Text>
                        </TouchableOpacity>

                        {/* Display Tab */}
                        <TouchableOpacity
                            style={styles.customTab}
                            onPress={() => setActiveTab('display')}
                            activeOpacity={0.8}
                        >
                            <ScanBarcode
                                size={scale(20)}
                                color={activeTab === 'display' ? 'white' : colors.text}
                                variant={activeTab === 'display' ? 'Bold' : 'Linear'}
                            />
                            <Text style={[
                                styles.customTabText,
                                { color: activeTab === 'display' ? 'white' : colors.text }
                            ]}>
                                {t('qr.display') || 'Kode QR'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getHorizontalPadding(),
        paddingVertical: getVerticalPadding()
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: scale(20)
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontFamily: FontFamily.monasans.semiBold
    },
    balanceContainer: {
        alignItems: 'center',
        marginTop: scale(8)
    },
    balancePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: scale(8),
        borderRadius: scale(20),
        gap: scale(8)
    },
    balanceLabelSmall: {
        color: '#ddd',
        fontSize: scale(10),
        fontFamily: FontFamily.monasans.medium
    },
    balanceValueText: {
        color: 'white',
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.bold
    },
    floatingControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center'
    },
    actionRow: {
        flexDirection: 'row',
        gap: scale(40),
        marginBottom: scale(20)
    },
    circleButton: {
        alignItems: 'center',
        gap: scale(4)
    },
    circleButtonText: {
        color: 'white',
        fontSize: scale(12),
        fontFamily: FontFamily.monasans.medium
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
    bottomTabOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        padding: scale(20)
    },
    permissionText: {
        textAlign: 'center',
        fontSize: scale(14),
        marginBottom: scale(14)
    },
    primaryBtn: {
        paddingVertical: scale(12),
        paddingHorizontal: getHorizontalPadding(),
        borderRadius: scale(12)
    },
    primaryBtnText: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.semiBold
    },
    customTabsContainer: {
        width: '100%',
    },
    customTabsWrapper: {
        width: '100%',
        flexDirection: 'row',
        borderRadius: scale(100),
        padding: scale(4),
        position: 'relative',
        overflow: 'hidden',
    },
    customTabIndicator: {
        position: 'absolute',
        top: scale(4),
        bottom: scale(4),
        left: scale(4),
        width: scale(165),
        borderRadius: scale(999),
        zIndex: 0,
    },
    customTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
        paddingVertical: scale(12),
        borderRadius: scale(999),
        zIndex: 1,
    },
    customTabText: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.semiBold
    },
});

export default QrScreen;
