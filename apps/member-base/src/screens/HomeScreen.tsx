/**
 * HomeScreen Component
 * Dashboard screen sesuai design
 * Responsive untuk semua device termasuk EDC
 * 
 * Arsitektur:
 * - TopBar: Collapsible (animasi hide/show berdasarkan scroll)
 * - TabSwitcher: Static (selalu visible)
 * - Tab Content: Independent scroll per tab
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
  StyleSheet,
  Animated,
  Text,
  RefreshControl,
  InteractionManager,
  BackHandler,
  Platform,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
  NewsTab,
  AktivitasTab,
} from "../components/home";
import { useNewsState, NewsSearchHeader } from "../components/home/TabContent/NewsTab";
import { useNotifications } from "@core/notification";
import Toast from 'react-native-toast-message';
import { QrScanIcon } from "@core/config/components/icons";
import { scale } from "@core/config";

// Tinggi TopBar untuk animasi
const TOPBAR_HEIGHT = moderateVerticalScale(60);

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth } = useDimensions();
  const insets = useSafeAreaInsets();

  // State for News Tab (Lifted Up)
  const newsState = useNewsState();

  const pagerRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fabOpacity = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

  // Animated value untuk TopBar collapsible (height-based)
  const topBarHeight = useRef(new Animated.Value(TOPBAR_HEIGHT)).current;
  const isHeaderHidden = useRef(false);
  const lastScrollY = useRef(0);

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

  // Handler scroll dari tab manapun - untuk collapsible header
  const handleTabScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;
    const SCROLL_THRESHOLD = 8;

    if (Math.abs(diff) < SCROLL_THRESHOLD) {
      lastScrollY.current = currentScrollY;
      return;
    }

    if (diff > 0 && currentScrollY > 50) {
      // Scrolling DOWN - collapse header (height -> 0)
      if (!isHeaderHidden.current) {
        isHeaderHidden.current = true;
        Animated.timing(topBarHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false, // height animation requires false
        }).start();
      }
    } else if (diff < -SCROLL_THRESHOLD) {
      // Scrolling UP - expand header (height -> TOPBAR_HEIGHT)
      if (isHeaderHidden.current) {
        isHeaderHidden.current = false;
        Animated.timing(topBarHeight, {
          toValue: TOPBAR_HEIGHT,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }

    lastScrollY.current = currentScrollY;
  }, [topBarHeight]);

  // Set activeTab ke tab dengan order 2 (di tengah) saat tabs pertama kali ter-load
  useEffect(() => {
    if (tabs.length > 0 && !hasSetOrder2TabRef.current) {
      const order2TabId = tabs.length >= 2 ? tabs[1].id : tabs[0].id;
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
        const refreshFn = tabRefreshFunctionsRef.current[activeTab];
        if (refreshFn) {
          refreshFn();
        }
      },
      enableConfigRefresh: true,
    });

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

  const renderTabContent = useCallback(
    (tabId: string, index: number) => {
      const tabConfig = homeTabs.find((tab) => tab.id === tabId);
      const isActive = activeTab === tabId;

      if (tabId === "beranda" || tabId === "home") {
        return (
          <View style={{ width: screenWidth, flex: 1 }}>
            <BerandaTab
              isActive={isActive}
              onNavigateToNews={() => {
                navigation.navigate("News" as never);
              }}
              onScroll={handleTabScroll}
              scrollEnabled={true}
            />
          </View>
        );
      }

      if (tabId === "activity" || tabId === "aktivitas") {
        return (
          <View style={{ width: screenWidth, flex: 1 }}>
            <AktivitasTab
              isActive={isActive}
              isVisible={isActive}
              scrollEnabled={true}
              onScroll={handleTabScroll}
            />
          </View>
        );
      }

      if (tabId === "news" || tabId === "berita") {
        return (
          <View style={{ width: screenWidth, flex: 1 }}>
            <NewsTab
              isActive={isActive}
              isVisible={isActive}
              searchState={newsState}
              renderHeader={false}
              scrollEnabled={true}
              onScroll={handleTabScroll}
            />
          </View>
        );
      }

      if (tabId === "analytics" || tabId === "analitik") {
        return (
          <View style={{ width: screenWidth, flex: 1 }}>
            <AnalyticsTab
              isActive={isActive}
              isVisible={isActive}
            />
          </View>
        );
      }

      // Default content
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
    [homeTabs, screenWidth, activeTab, colors, newsState, handleTabScroll]
  );

  const handlePagerMomentumEnd = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);

      if (tabs[index] && tabs[index].id !== activeTab) {
        setActiveTab(tabs[index].id);
        lastScrollY.current = 0;
      }
    },
    [screenWidth, tabs, activeTab]
  );

  const tabChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }

      setActiveTab(tabId);
      lastScrollY.current = 0;

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
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* TopBar - Collapsible dengan height animation */}
      <Animated.View
        style={[
          styles.topBarContainer,
          {
            paddingHorizontal: getHorizontalPadding(),
            backgroundColor: colors.background,
            height: topBarHeight,
            overflow: 'hidden',
          },
        ]}
      >
        <TopBar
          notificationCount={unreadCount}
          onNotificationPress={handleNotificationPress}
          onMenuPress={handleMenuPress}
        />
      </Animated.View>

      {/* Tab Switcher - Static (selalu visible) */}
      <View
        style={[
          styles.tabSwitcherContainer,
          {
            backgroundColor: colors.background,
            paddingHorizontal: getHorizontalPadding(),
          },
        ]}
      >
        {tabs.length > 0 && (
          <TabSwitcher
            variant="segmented"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            scrollX={scrollX}
            pagerWidth={screenWidth}
          />
        )}
        {(activeTab === 'news' || activeTab === 'berita') && (
          <NewsSearchHeader state={newsState} />
        )}
      </View>

      {/* Pager - setiap tab punya scroll sendiri */}
      <Animated.ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        decelerationRate="fast"
        snapToInterval={screenWidth}
        removeClippedSubviews={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={handlePagerMomentumEnd}
        style={styles.pager}
      >
        {tabs.map((tab, index) => {
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

      {/* FAB QR Button */}
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
  topBarContainer: {
    paddingBottom: moderateVerticalScale(8),
  },
  tabSwitcherContainer: {
    paddingTop: moderateVerticalScale(8),
    paddingBottom: moderateVerticalScale(16),
  },
  pager: {
    flex: 1,
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
