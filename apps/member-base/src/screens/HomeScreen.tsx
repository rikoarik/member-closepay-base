/**
 * HomeScreen Component
 * Dashboard screen sesuai design
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Text,
  BackHandler,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  TabSwitcher,
  useDimensions,
  type Tab,
  useConfig,
  useRefreshWithConfig,
  loadHomeTabSettings,
  MAX_HOME_TABS,
  getTabPlugin,
  PluginRegistry,
} from '@core/config';
import {
  TopBar,
  AnalyticsTab,
  BerandaTab,
  NewsTab,
  AktivitasTab,
  BerandaNewsInfo,
  DashboardTab,
  TransactionsTab,
} from '../components/home';
import { PluginTabContentRenderer } from '../components/home/PluginTabContentRenderer';
import { useNewsState } from '../components/home';
import { useNotifications } from '@core/notification';
import Toast from 'react-native-toast-message';
import { QrScanIcon } from '@core/config/components/icons';
import { scale, moderateScale } from '@core/config';
import { useBalance } from '@plugins/balance';

const HomeScreenComponent = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = useDimensions();
  // State for News Tab (Lifted Up)
  const newsState = useNewsState();

  const pagerRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fabOpacity = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  const { config } = useConfig();
  const [enabledTabIdsFromSettings, setEnabledTabIdsFromSettings] = useState<string[] | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const { balance, isLoading: balanceLoading } = useBalance();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadHomeTabSettings().then((settings) => {
        if (!cancelled) setEnabledTabIdsFromSettings(settings.enabledTabIds);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const configHomeTabs = React.useMemo(() => {
    const raw = config?.homeTabs || [];
    return raw
      .filter((tab) => tab.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [config?.homeTabs]);

  const homeTabs = React.useMemo(() => {
    if (enabledTabIdsFromSettings === null) return configHomeTabs;
    if (enabledTabIdsFromSettings.length === 0) return configHomeTabs;
    const orderedIds = enabledTabIdsFromSettings.slice(0, MAX_HOME_TABS);
    const tabById = new Map(configHomeTabs.map((tab) => [tab.id, tab]));
    return orderedIds.map((id) => {
      const fromConfig = tabById.get(id);
      if (fromConfig) return fromConfig;
      return { id, label: id, visible: true as const };
    });
  }, [configHomeTabs, enabledTabIdsFromSettings]);

  const tabs: Tab[] = React.useMemo(() => {
    return homeTabs.map((tab) => {
      const i18nKey = `home.${tab.id}`;
      const translatedLabel = t(i18nKey);
      const label = translatedLabel && translatedLabel !== i18nKey ? translatedLabel : tab.label;
      return { id: tab.id, label };
    });
  }, [homeTabs, t]);

  const [activeTab, setActiveTab] = useState<string>('home');
  const tabRefreshFunctionsRef = useRef<{ [key: string]: () => void }>({});
  const hasSetOrder2TabRef = useRef(false);
  const backPressTimeRef = useRef<number>(0);
  const DOUBLE_BACK_PRESS_DELAY = 2000;

  // Animate FAB show/hide based on activeTab
  const shouldShowFab =
    config?.showQrButton !== false && (activeTab === 'beranda' || activeTab === 'home');

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
    if (tabs.length > 0 && !hasSetOrder2TabRef.current) {
      const order2TabId = tabs.length >= 2 ? tabs[1].id : tabs[0].id;
      if (activeTab !== order2TabId) {
        setActiveTab(order2TabId);
      }
      hasSetOrder2TabRef.current = true;
    }
  }, [tabs, activeTab]);

  // Saat daftar tab berubah (mis. setelah simpan dari Pengaturan), pastikan activeTab masih ada di list
  useEffect(() => {
    if (tabs.length === 0) return;
    const idx = tabs.findIndex((t) => t.id === activeTab);
    if (idx < 0) {
      const fallbackId = tabs.length >= 2 ? tabs[1].id : tabs[0].id;
      setActiveTab(fallbackId);
    }
  }, [tabs, activeTab]);

  // Scroll pager ke tab default (tengah) agar indicator dan konten sinkron
  const hasInitialPagerScrollRef = useRef(false);
  useEffect(() => {
    if (hasInitialPagerScrollRef.current || tabs.length === 0) return;
    const index = tabs.findIndex((t) => t.id === activeTab);
    if (index < 0) return;
    hasInitialPagerScrollRef.current = true;
    scrollX.setValue(index * screenWidth);
    requestAnimationFrame(() => {
      pagerRef.current?.scrollTo({ x: index * screenWidth, animated: false });
    });
  }, [activeTab, tabs, screenWidth, scrollX]);

  const registerTabRefresh = useCallback((tabId: string, refreshFn: () => void) => {
    tabRefreshFunctionsRef.current[tabId] = refreshFn;
  }, []);

  const { refresh: handleRefresh, isRefreshing: refreshing } = useRefreshWithConfig({
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

      const pluginMapping = getTabPlugin(tabId);
      if (
        pluginMapping &&
        PluginRegistry.isPluginEnabled(pluginMapping.pluginId)
      ) {
        return (
          <PluginTabContentRenderer
            tabId={tabId}
            activeTab={activeTab}
            scrollEnabled={false}
          />
        );
      }

      if (tabId === 'beranda' || tabId === 'home') {
        return (
          <BerandaTab
            isActive={activeTab === tabId}
            onNavigateToNews={() => {
              navigation.navigate('News' as never);
            }}
            scrollEnabled={false}
          />
        );
      }

      if (tabId === 'beranda-news') {
        return (
          <BerandaNewsInfo
            showNewsInfo={true}
            onNewsPress={() => {
              navigation.navigate('News' as never);
            }}
            onViewAllPress={() => {
              navigation.navigate('News' as never);
            }}
            limit={6}
          />
        );
      }

      if (tabId === 'activity' || tabId === 'aktivitas') {
        return (
          <AktivitasTab
            isActive={activeTab === tabId}
            isVisible={activeTab === tabId}
            scrollEnabled={false}
          />
        );
      }

      if (tabId === 'news' || tabId === 'berita') {
        return (
          <NewsTab
            isActive={activeTab === tabId}
            isVisible={activeTab === tabId}
            searchState={newsState}
            scrollEnabled={false}
          />
        );
      }

      if (tabId === 'analytics' || tabId === 'analitik') {
        return <AnalyticsTab isActive={activeTab === tabId} scrollEnabled={false} />;
      }

      if (tabId === 'dashboard') {
        return (
          <DashboardTab
            isActive={activeTab === tabId}
            isVisible={activeTab === tabId}
            scrollEnabled={false}
          />
        );
      }

      if (tabId === 'transactions') {
        return (
          <TransactionsTab
            title={t('balance.mainBalance') || 'Saldo Utama'}
            balance={balance?.balance ?? 0}
            showBalance={showBalance}
            onToggleBalance={() => setShowBalance((v) => !v)}
            onBalanceDetailPress={() => navigation.navigate('TransactionHistory' as never)}
            isLoading={balanceLoading}
            isActive={activeTab === tabId}
            isVisible={activeTab === tabId}
          />
        );
      }

      if (tabConfig?.component) {
        return (
          <View style={{ width: screenWidth, padding: getHorizontalPadding() }}>
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
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16 }}>{tabConfig?.label || tabId}</Text>
        </View>
      );
    },
    [homeTabs, screenWidth, activeTab, colors, registerTabRefresh, newsState, navigation, showBalance, balance, balanceLoading, t]
  );

  const handleMenuPress = () => {
    navigation.navigate('Profile' as never);
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications' as never);
  };

  const handleQrPress = () => {
    navigation.navigate('Qr' as never);
  };

  const activeTabIndex = useMemo(
    () => tabs.findIndex((t) => t.id === activeTab),
    [tabs, activeTab]
  );

  const getTabIndex = useCallback(
    (tabId: string) => {
      return tabs.findIndex((tab) => tab.id === tabId);
    },
    [tabs]
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

  const tabChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTabChange = useCallback(
    (tabId: string) => {
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current);
      }

      setActiveTab(tabId);
      tabChangeTimeoutRef.current = setTimeout(() => {
        if (pagerRef.current) {
          const index = getTabIndex(tabId);
          if (index >= 0) {
            pagerRef.current.scrollTo({
              x: index * screenWidth,
              animated: true,
            });
          }
        }
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
    if (
      pagerRef.current &&
      tabs.length >= 2 &&
      hasSetOrder2TabRef.current &&
      !hasInitializedRef.current
    ) {
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
      const id = requestAnimationFrame(() => {
        refreshNotifications();
      });
      return () => cancelAnimationFrame(id);
    }, [refreshNotifications])
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        const homeTabId = tabs.find((tab) => tab.id === 'home' || tab.id === 'beranda')?.id;
        const isHomeTab = homeTabId && activeTab === homeTabId;

        if (!isHomeTab && homeTabId) {
          setActiveTab(homeTabId);
          const homeIndex = tabs.findIndex((tab) => tab.id === homeTabId);
          if (homeIndex >= 0 && pagerRef.current) {
            pagerRef.current.scrollTo({
              x: homeIndex * screenWidth,
              animated: true,
            });
          }
          return true;
        }

        const now = Date.now();
        if (backPressTimeRef.current && now - backPressTimeRef.current < DOUBLE_BACK_PRESS_DELAY) {
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
      {/* Main ScrollView dengan sticky header di TabSwitcher */}
      <ScrollView
        style={[styles.scrollView]}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        directionalLockEnabled={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        {...(Platform.OS === 'ios' && {
          contentInsetAdjustmentBehavior: 'automatic',
          automaticallyAdjustContentInsets: false,
          automaticallyAdjustKeyboardInsets: false,
        })}
      >
        {/* TopBar - Bisa di-scroll */}
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

        {/* Tab Switcher - Sticky Header */}
        <View
          style={{
            zIndex: 1,
            backgroundColor: colors.background,
          }}
        >
          {tabs.length > 0 && (
            <View
              style={{
                paddingHorizontal: getHorizontalPadding(),
                paddingVertical: moderateVerticalScale(12),
              }}
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
        </View>

        {/* Tab Content - Horizontal Pager untuk swipe antar tab */}
        <View style={styles.tabContentContainer}>
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
            removeClippedSubviews={false} // Changed to false to prevent clipping nested scroll
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: true,
            })}
            onMomentumScrollEnd={handlePagerMomentumEnd}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {tabs.map((tab, index) => {
              // Lazy loading: hanya render tab aktif dan tab adjacent
              if (!shouldRenderTab(tab.id, index)) {
                return (
                  <View key={tab.id} style={{ width: screenWidth, flex: 1 }} pointerEvents="none" />
                );
              }

              return (
                <View
                  key={tab.id}
                  style={{ width: screenWidth, flex: 1 }}
                  pointerEvents={activeTab === tab.id ? 'auto' : 'none'}
                >
                  {renderTabContent(tab.id, index)}
                </View>
              );
            })}
          </Animated.ScrollView>
        </View>
      </ScrollView>

      {/* FAB QR Button */}
      {config?.showQrButton !== false && (
        <Animated.View
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
              opacity: fabOpacity,
              zIndex: 2,
              transform: [{ scale: fabScale }],
            },
          ]}
          pointerEvents={shouldShowFab ? 'auto' : 'none'}
        >
          <TouchableOpacity onPress={handleQrPress} activeOpacity={0.8} style={styles.fabTouchable}>
            <QrScanIcon width={scale(26)} height={scale(26)} fill={colors.surface} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export const HomeScreen = memo(HomeScreenComponent);

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
    width: '100%',
  },
  refreshIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateVerticalScale(8),
  },
  topBarContainer: {
    paddingBottom: moderateVerticalScale(8),
  },
  section: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(16),
  },
  tabContentContainer: {
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
