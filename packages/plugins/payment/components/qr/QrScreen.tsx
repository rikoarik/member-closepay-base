import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
    Platform,
    UIManager,
    ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowDown2, ArrowLeft2, Scanner, ScanBarcode, TickCircle } from 'iconsax-react-nativejs';
import {
    scale,
    ScreenHeader,
    FontFamily,
    getHorizontalPadding,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { QrScanScreen } from './QrScanScreen';
import { QrDisplayScreen } from './QrDisplayScreen';

const { width } = Dimensions.get('window');

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
    const [selectedBalance, setSelectedBalance] = useState<BalanceType>('plafon');
    const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);
    const [scanHeaderActions, setScanHeaderActions] = useState<React.ReactNode>(null);

    const dropdownAnim = useRef(new Animated.Value(0)).current;
    const scrollX = useRef(new Animated.Value(0)).current;
    const pagerRef = useRef<ScrollView | null>(null);
    const tabLayouts = useRef<{ [key: string]: { x: number; width: number } }>({});
    const isScrollingRef = useRef(false);

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

    // Animate tab indicator berdasarkan scroll position (smooth saat swipe dan klik)
    const tabIndicatorTranslateX = scrollX.interpolate({
        inputRange: [0, width],
        outputRange: [
            tabLayouts.current['scan']?.x || 0,
            tabLayouts.current['display']?.x || scale(160),
        ],
        extrapolate: 'clamp',
    });

    // Interpolasi untuk Scan Tab (index 0)
    const scanTabActiveOpacity = scrollX.interpolate({
        inputRange: [-width, 0, width],
        outputRange: [0, 1, 0],
        extrapolate: 'clamp',
    });

    const scanTabInactiveOpacity = scrollX.interpolate({
        inputRange: [-width, 0, width],
        outputRange: [1, 0, 1],
        extrapolate: 'clamp',
    });

    // Interpolasi untuk Display Tab (index 1)
    const displayTabActiveOpacity = scrollX.interpolate({
        inputRange: [0, width, width * 2],
        outputRange: [0, 1, 0],
        extrapolate: 'clamp',
    });

    const displayTabInactiveOpacity = scrollX.interpolate({
        inputRange: [0, width, width * 2],
        outputRange: [1, 0, 1],
        extrapolate: 'clamp',
    });

    // Handle pager scroll end untuk update activeTab
    const handlePagerMomentumEnd = useCallback(
        (event: any) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / width);
            const newTab: QrTab = index === 0 ? 'scan' : 'display';
            if (newTab !== activeTab) {
                setActiveTab(newTab);
            }
        },
        [activeTab]
    );

    // Sync scroll position saat activeTab berubah
    useEffect(() => {
        if (pagerRef.current && !isScrollingRef.current) {
            const index = activeTab === 'scan' ? 0 : 1;
            const targetX = index * width;
            
            isScrollingRef.current = true;
            pagerRef.current.scrollTo({
                x: targetX,
                animated: true,
            });
            
            // Reset scrolling flag after animation completes
            setTimeout(() => {
                isScrollingRef.current = false;
            }, 300);
        }
    }, [activeTab, width]);


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

    const handleScanned = useCallback((value: string, type: 'qr' | 'barcode') => {
        // Handle scanned QR/barcode
        console.log('Scanned:', value, type);
    }, []);

    return (
        <View style={styles.container}>
            {/* Horizontal Pager untuk Swipe */}
            <Animated.ScrollView
                ref={pagerRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={8}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                directionalLockEnabled={true}
                decelerationRate="fast"
                snapToInterval={width}
                removeClippedSubviews={true}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                )}
                onMomentumScrollEnd={handlePagerMomentumEnd}
                style={StyleSheet.absoluteFill}
            >
                {/* Scan Tab */}
                <View style={{ width }} pointerEvents={activeTab === 'scan' ? 'auto' : 'none'}>
                    <QrScanScreen 
                        isActive={activeTab === 'scan'} 
                        onScanned={handleScanned}
                        onHeaderActionsReady={setScanHeaderActions}
                    />
                </View>

                {/* Display Tab */}
                <View style={{ width }} pointerEvents={activeTab === 'display' ? 'auto' : 'none'}>
                    <QrDisplayScreen isActive={activeTab === 'display'} selectedBalance={selectedBalance} />
                </View>
            </Animated.ScrollView>

            {/* Header Overlay */}
            <SafeAreaView style={styles.headerOverlay}>
                <View style={[styles.headerContainer, { paddingEnd: getHorizontalPadding() }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <View style={{ position: 'relative', width: scale(24), height: scale(24), alignItems: 'center', justifyContent: 'center' }}>
                            {/* White icon (for scan tab) */}
                            <Animated.View style={{ opacity: scanTabActiveOpacity, position: 'absolute' }}>
                                <ArrowLeft2
                                    size={scale(24)}
                                    color="white"
                                    variant="Linear"
                                />
                            </Animated.View>
                            {/* Dark icon (for display tab) */}
                            <Animated.View style={{ opacity: displayTabActiveOpacity }}>
                                <ArrowLeft2
                                    size={scale(24)}
                                    color={colors.text}
                                    variant="Linear"
                                />
                            </Animated.View>
                        </View>
                    </TouchableOpacity>
                    
                    <View style={{ flex: 1, position: 'relative', alignItems: 'flex-start', justifyContent: 'center' }}>
                        {/* White title (for scan tab) */}
                        <Animated.Text
                            style={[
                                styles.headerTitle,
                                {
                                    color: 'white',
                                    opacity: scanTabActiveOpacity,
                                    position: 'absolute',
                                },
                            ]}
                        >
                            {t('qr.title')}
                        </Animated.Text>
                        {/* Dark title (for display tab) */}
                        <Animated.Text
                            style={[
                                styles.headerTitle,
                                {
                                    color: colors.text,
                                    opacity: displayTabActiveOpacity,
                                },
                            ]}
                        >
                            {t('qr.title')}
                        </Animated.Text>
                    </View>
                    
                    {activeTab === 'scan' && scanHeaderActions && (
                        <View style={styles.rightComponent}>
                            {scanHeaderActions}
                        </View>
                    )}
                </View>
            </SafeAreaView>

            {/* Bottom Tab Switcher Overlay */}
            <View 
                style={[styles.bottomTabOverlay, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}
            >
                {/* Balance Selection Section */}
                <View style={{ marginBottom: scale(16) }} pointerEvents="auto">
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
                            borderColor: '#E2E8F0',
                        }}
                    >
                        <View>
                            <Text style={{
                                color: '#94A3B8',
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
                <View style={styles.customTabsContainer}>
                    <View style={[styles.customTabsWrapper, { backgroundColor: colors.surface }]}>
                        {/* Sliding Indicator */}
                        <Animated.View
                            style={[
                                styles.customTabIndicator,
                                {
                                    backgroundColor: colors.primary,
                                    width: tabLayouts.current[activeTab]?.width || scale(160),
                                    transform: [{
                                        translateX: tabIndicatorTranslateX
                                    }]
                                }
                            ]}
                            pointerEvents="none"
                        />

                        {/* Scan Tab */}
                        <TouchableOpacity
                            key="scan"
                            style={styles.customTab}
                            onPress={() => {
                                if (activeTab !== 'scan') {
                                    setActiveTab('scan');
                                }
                            }}
                            activeOpacity={0.9}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            onLayout={(event) => {
                                const { x, width: tabWidth } = event.nativeEvent.layout;
                                tabLayouts.current['scan'] = { x, width: tabWidth };
                            }}
                        >
                            <View style={[styles.tab, {
                                paddingHorizontal: scale(8),
                                paddingVertical: scale(12),
                            }]} pointerEvents="box-none">
                                {/* Icon Container */}
                                <View style={styles.iconContainer} pointerEvents="none">
                                    <Animated.View style={[styles.iconOverlay, { opacity: scanTabInactiveOpacity }]} pointerEvents="none">
                                        <Scanner
                                            size={scale(20)}
                                            color={colors.text}
                                            variant="Linear"
                                        />
                                    </Animated.View>
                                    <Animated.View style={[styles.iconOverlay, { opacity: scanTabActiveOpacity }]} pointerEvents="none">
                                        <Scanner
                                            size={scale(20)}
                                            color="white"
                                            variant="Bold"
                                        />
                                    </Animated.View>
                                </View>
                                
                                {/* Text Container */}
                                <View style={styles.textContainer} pointerEvents="none">
                                    <Animated.Text style={[
                                        styles.customTabText,
                                        {
                                            color: colors.text,
                                            opacity: scanTabInactiveOpacity,
                                        }
                                    ]}>
                                        {t('qr.scan') || 'Pindai'}
                                    </Animated.Text>
                                    <Animated.Text style={[
                                        styles.customTabText,
                                        styles.activeTabText,
                                        {
                                            color: 'white',
                                            opacity: scanTabActiveOpacity,
                                        }
                                    ]}>
                                        {t('qr.scan') || 'Pindai'}
                                    </Animated.Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Display Tab */}
                        <TouchableOpacity
                            key="display"
                            style={styles.customTab}
                            onPress={() => {
                                if (activeTab !== 'display') {
                                    setActiveTab('display');
                                }
                            }}
                            activeOpacity={0.9}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            onLayout={(event) => {
                                const { x, width: tabWidth } = event.nativeEvent.layout;
                                tabLayouts.current['display'] = { x, width: tabWidth };
                            }}
                        >
                            <View style={[styles.tab, {
                                paddingHorizontal: scale(8),
                                paddingVertical: scale(12),
                            }]} pointerEvents="box-none">
                                {/* Icon Container */}
                                <View style={styles.iconContainer} pointerEvents="none">
                                    <Animated.View style={[styles.iconOverlay, { opacity: displayTabInactiveOpacity }]} pointerEvents="none">
                                        <ScanBarcode
                                            size={scale(20)}
                                            color={colors.text}
                                            variant="Linear"
                                        />
                                    </Animated.View>
                                    <Animated.View style={[styles.iconOverlay, { opacity: displayTabActiveOpacity }]} pointerEvents="none">
                                        <ScanBarcode
                                            size={scale(20)}
                                            color="white"
                                            variant="Bold"
                                        />
                                    </Animated.View>
                                </View>
                                
                                {/* Text Container */}
                                <View style={styles.textContainer} pointerEvents="none">
                                    <Animated.Text style={[
                                        styles.customTabText,
                                        {
                                            color: colors.text,
                                            opacity: displayTabInactiveOpacity,
                                        }
                                    ]}>
                                        {t('qr.display') || 'Kode QR'}
                                    </Animated.Text>
                                    <Animated.Text style={[
                                        styles.customTabText,
                                        styles.activeTabText,
                                        {
                                            color: 'white',
                                            opacity: displayTabActiveOpacity,
                                        }
                                    ]}>
                                        {t('qr.display') || 'Kode QR'}
                                    </Animated.Text>
                                </View>
                            </View>
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
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: scale(8),
        minWidth: scale(40),
        minHeight: scale(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: scale(18),
        fontFamily: FontFamily.monasans.bold,
        marginLeft: scale(8),
    },
    rightComponent: {
        minWidth: scale(40),
        alignItems: 'flex-end',
    },
    bottomTabOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 1000,
        padding: scale(20),
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
        overflow: 'visible',
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
        borderRadius: scale(999),
        zIndex: 1,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
        minHeight: scale(40),
    },
    iconContainer: {
        width: scale(20),
        height: scale(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        minHeight: scale(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    customTabText: {
        fontSize: scale(14),
        fontFamily: FontFamily.monasans.semiBold
    },
    activeTabText: {
        position: 'absolute',
    },
});

export default QrScreen;
