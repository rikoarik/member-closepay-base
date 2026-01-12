/**
 * HomeScreen Component
 * Dashboard screen sesuai design
 * Responsive untuk semua device termasuk EDC
 */
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Text,
  RefreshControl,
  InteractionManager,
  BackHandler,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@core/theme";
import { useTranslation } from "@core/i18n";
import {
  moderateVerticalScale,
  getHorizontalPadding,
  TabSwitcher,
  useDimensions,
  type Tab,
  useConfig,
  useRefreshWithConfig,
} from "@core/config";
import {
  TopBar,
  AnalyticsTab,
  BerandaTab,
  AktivitasTab,
} from "../components/home";
import { useNotifications } from "@core/notification";
import Toast from 'react-native-toast-message';
import { QrScanIcon } from "@core/config/components/icons";
import { scale, moderateScale } from "@core/config";

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth } = useDimensions();
  const pagerRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fabOpacity = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

  const { config } = useConfig();
  const homeTabs = React.useMemo(() => {
    return config?.homeTabs || [];
  }, [config?.homeTabs]);

  const tabs: Tab[] = React.useMemo(() => {
    return homeTabs
      .filter((tab) => tab.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((tab) => {
        const i18nKey = `home.${tab.id}`;
        const translatedLabel = t(i18nKey);
        const label =
          translatedLabel && translatedLabel !== i18nKey
            ? translatedLabel
            : tab.label;
        return { id: tab.id, label };
      });
  }, [homeTabs, t]);

  const [activeTab, setActiveTab] = useState<string>("home");
  const tabRefreshFunctionsRef = useRef<{ [key: string]: () => void }>({});
  const hasSetOrder2TabRef = useRef(false);
  const backPressTimeRef = useRef<number>(0);
  const DOUBLE_BACK_PRESS_DELAY = 2000;

  // Animate FAB show/hide based on activeTab
  const shouldShowFab = config?.showQrButton !== false && 
    (activeTab === "beranda" || activeTab === "home");

  useEffect(() => {
    if (shouldShowFab) {
      // Show animation
      Animated.parallel([
        Animated.timing(fabOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(fabScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(fabOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shouldShowFab, fabOpacity, fabScale]);
  
  // Set activeTab ke tab dengan order 2 (di tengah) saat tabs pertama kali ter-load
  useEffect(() => {
    // Reset flag jika tabs berubah (misalnya config reload)
    if (tabs.length > 0 && !hasSetOrder2TabRef.current) {
      // Tab dengan order 2 (index 1) adalah tab di tengah, atau tab pertama jika < 2 tabs
      const order2TabId = tabs.length >= 2 ? tabs[1].id : tabs[0].id;
      
      // Hanya update jika activeTab belum sesuai
      if (activeTab !== order2TabId) {
        setActiveTab(order2TabId);
      }
      hasSetOrder2TabRef.current = true;
    }
  }, [tabs, activeTab]);
  

  const registerTabRefresh = useCallback(
    (tabId: string, refreshFn: () => void) => {
      tabRefreshFunctionsRef.current[tabId] = refreshFn;
    },
    []
  );

  const { refresh: handleRefresh, isRefreshing: refreshing } =
    useRefreshWithConfig({
      onRefresh: async () => {
        // Call refresh function of active tab
        const refreshFn = tabRefreshFunctionsRef.current[activeTab];
        if (refreshFn) {
          refreshFn();
        }
      },
      enableConfigRefresh: true,
    });

  const renderTabContent = useCallback(
    (tabId: string, index: number) => {
      const tabConfig = homeTabs.find((tab) => tab.id === tabId);

      if (tabId === "beranda" || tabId === "home") {
        // Find news tab ID untuk navigasi
        const newsTabId = tabs.find(tab => 
          tab.id === "news" || 
          tab.id === "berita" || 
          tabConfig?.id === "news" || 
          tabConfig?.id === "berita"
        )?.id || "news";
        
        return (
          <View style={{ width: screenWidth, flex: 1 }}>
            <BerandaTab 
              isActive={activeTab === tabId}
              onNavigateToNews={() => {
                // Navigate ke NewsScreen (halaman berdiri sendiri)
                (navigation as any).navigate('News' as never);
              }}
            />
          </View>
        );
      }

      if (tabId === "activity" || tabId === "aktivitas") {
        return (
          <View style={{ width: screenWidth, flex: 1 }}>
            <AktivitasTab
              isActive={activeTab === tabId}
              isVisible={activeTab === tabId}
            />
          </View>
        );
      }

      if (tabId === "analytics" || tabId === "analitik") {
        return (
          <View style={{ width: screenWidth, flex: 1 }}>
            <AnalyticsTab
              isActive={activeTab === tabId}
              isVisible={activeTab === tabId}
            />
          </View>
        );
      }

      if (tabConfig?.component) {
        return (
          <View
            style={{ width: screenWidth, padding: getHorizontalPadding() }}
          >
            <Text style={{ color: colors.text }}>{tabConfig.label}</Text>
          </View>
        );
      }
      // Default: simple text content
      return (
        <View
          style={{
            width: screenWidth,
            padding: getHorizontalPadding(),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16 }}>
            {tabConfig?.label || tabId}
          </Text>
        </View>
      );
    },
    [
      homeTabs,
      screenWidth,
      activeTab,
      colors,
      registerTabRefresh,
    ]
  );

  const handleMenuPress = () => {
    navigation.navigate("Profile" as never);
  };

  const handleNotificationPress = () => {
    navigation.navigate("Notifications" as never);
  };

  const handleQrPress = () => {
    navigation.navigate("Qr" as never);
  };

  const getTabIndex = useCallback(
    (tabId: string) => {
      return tabs.findIndex((tab) => tab.id === tabId);
    },
    [tabs]
  );

  const activeTabIndex = useMemo(
    () => tabs.findIndex((t) => t.id === activeTab),
    [tabs, activeTab]
  );

  const shouldRenderTab = useCallback(
    (tabId: string, index: number) => {
      return Math.abs(index - activeTabIndex) <= 1;
    },
    [activeTabIndex]
  );

  const handlePagerMomentumEnd = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);

      if (tabs[index] && tabs[index].id !== activeTab) {
        setActiveTab(tabs[index].id);
      }
    },
    [screenWidth, tabs, activeTab]
  );

  const tabChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const handleTabChange = useCallback(
    (tabId: string) => {
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }

      setActiveTab(tabId);
      tabChangeTimeoutRef.current = setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          if (pagerRef.current) {
            const index = getTabIndex(tabId);
            if (index >= 0) {
              pagerRef.current.scrollTo({
                x: index * screenWidth,
                animated: true,
              });
            }
          }
        });
      }, 50);
    },
    [screenWidth, getTabIndex]
  );

  useEffect(() => {
    return () => {
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }
    };
  }, []);

  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (pagerRef.current && tabs.length >= 2 && hasSetOrder2TabRef.current && !hasInitializedRef.current) {
      const middleTabIndex = 1;
      setTimeout(() => {
        if (pagerRef.current) {
          pagerRef.current.scrollTo({
            x: middleTabIndex * screenWidth,
            animated: false,
          });
        }
      }, 0);
      hasInitializedRef.current = true;
    }
  }, [screenWidth, tabs, activeTab]);

  const { unreadCount, refresh: refreshNotifications } = useNotifications();

  useFocusEffect(
    React.useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications])
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        const homeTabId = tabs.find(tab => tab.id === 'home' || tab.id === 'beranda')?.id;
        const isHomeTab = homeTabId && activeTab === homeTabId;

        if (!isHomeTab && homeTabId) {
          setActiveTab(homeTabId);
          const homeIndex = tabs.findIndex(tab => tab.id === homeTabId);
          if (homeIndex >= 0 && pagerRef.current) {
            pagerRef.current.scrollTo({
              x: homeIndex * screenWidth,
              animated: true,
            });
          }
          return true;
        }

        const now = Date.now();
        if (backPressTimeRef.current && (now - backPressTimeRef.current) < DOUBLE_BACK_PRESS_DELAY) {
          if (Platform.OS === 'android') {
            BackHandler.exitApp();
          }
          return true;
        } else {
          backPressTimeRef.current = now;
          Toast.show({
            type: 'info',
            text1: t('common.pressAgainToExit') || 'Tekan sekali lagi untuk keluar',
            position: 'bottom',
            visibilityTime: 2000,
          });
          return true;
        }
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
        backPressTimeRef.current = 0;
      };
    }, [activeTab, tabs, screenWidth])
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[2]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        scrollEventThrottle={16}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Spacer for native indicator */}
        <View style={styles.refreshIndicatorContainer} />

        {/* TopBar - Not sticky */}
        <View
          style={[
            styles.topBarContainer,
            {
              paddingHorizontal: getHorizontalPadding(),
              backgroundColor: colors.background,
            },
          ]}
        >
          <TopBar
            notificationCount={unreadCount}
            onNotificationPress={handleNotificationPress}
            onMenuPress={handleMenuPress}
          />
        </View>

        {/* Tab Switcher - Sticky */}
        {tabs.length > 0 && (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.background },
              { paddingHorizontal: getHorizontalPadding() },
            ]}
          >
            <TabSwitcher
              variant="segmented"
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              scrollX={scrollX}
              pagerWidth={screenWidth}
            />
          </View>
        )}

        {/* Pager horizontal dengan scroll vertikal per tab */}
        <View>
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
            snapToInterval={screenWidth}
            removeClippedSubviews={true}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            onMomentumScrollEnd={handlePagerMomentumEnd}
          >
            {tabs.map((tab, index) => {
              // Lazy loading: hanya render tab aktif dan tab adjacent
              if (!shouldRenderTab(tab.id, index)) {
                return (
                  <View
                    key={tab.id}
                    style={{ width: screenWidth, flex: 1 }}
                    pointerEvents="none"
                  />
                );
              }

              return (
                <View
                  key={tab.id}
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents={activeTab === tab.id ? "auto" : "none"}
                >
                  {renderTabContent(tab.id, index)}
                </View>
              );
            })}
          </Animated.ScrollView>
        </View>
      </ScrollView>

      {/* FAB QR Button - Only show on beranda/home tab with smooth animation */}
      {config?.showQrButton !== false && (
        <Animated.View
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
              opacity: fabOpacity,
              transform: [{ scale: fabScale }],
            },
          ]}
          pointerEvents={shouldShowFab ? 'auto' : 'none'}
        >
          <TouchableOpacity
            onPress={handleQrPress}
            activeOpacity={0.8}
            style={styles.fabTouchable}
          >
            <QrScanIcon
              width={scale(26)}
              height={scale(26)}
              fill={colors.surface}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContent: {
    width: "100%",
  },
  refreshIndicatorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: moderateVerticalScale(8),
  },
  topBarContainer: {
    paddingBottom: moderateVerticalScale(8),
    paddingTop: 0,
    marginTop: -moderateVerticalScale(6),
  },
  section: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(16),
  },
  fab: {
    position: 'absolute',
    bottom: moderateVerticalScale(54),
    alignSelf: 'center',
    width: scale(80),
    height: scale(55),
    borderRadius: scale(2000),
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
