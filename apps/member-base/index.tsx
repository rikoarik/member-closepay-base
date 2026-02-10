/**
 * Member Base App App Entry Point
 * Template untuk company-specific app
 *
 * Usage:
 * 1. Copy this template to apps/{your-company-id}/index.tsx
 * 2. Update imports for your app-specific navigator
 * 3. Load your company-specific config
 * 4. Customize branding, plugins, and features
 */

import React, { useState, useEffect, useMemo } from 'react';
import { StatusBar, View, Text, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@core/theme';
import { I18nProvider } from '@core/i18n';
import { SecurityProvider } from '@core/security/SecurityProvider';
import { configService, configRefreshService, logger } from '@core/config';
import { initializePlugins } from '@core/config';
import { createAppNavigator } from '@core/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';
import { NewsDetailScreen } from './src/screens/NewsDetailScreen';
import { NewsScreen } from './src/screens/NewsScreen';
import { SearchScreen, SearchResultsScreen } from '@plugins/marketplace';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/CustomToast';

// Screens from plugins (VirtualAccount, TransferMember, Withdraw, Qr are registered via plugin routes)
import { QrScreen } from '@plugins/payment';
import { TransactionHistoryScreen } from '@plugins/balance';
// Marketplace, ProductDetail, Cart, FnB from plugin routes
// App screens (VirtualCard, VirtualCardDetail, AddVirtualCard come from card-transaction plugin routes)
import { ProfileScreen } from '@core/account';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';

const Stack = createNativeStackNavigator();


/**
 * Load config dengan support hot reload di development
 * Metro bundler akan auto-reload file saat berubah, tapi kita perlu clear cache
 */
const loadAppConfig = (): typeof import('./config/app.config').appConfig => {
  // Dynamic require untuk support hot reload
  // Metro akan auto-reload file saat berubah
  const configModule = require('./config/app.config');
  return configModule.appConfig;
};

function MemberBaseAppContent(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const [pluginsInitialized, setPluginsInitialized] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Create navigator (must be called before any conditional returns)
  const AppNavigator = useMemo(() => {
    const appScreens = (
      <>
        {/* Core Screens */}
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="News" component={NewsScreen} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="SearchResults" component={SearchResultsScreen} />

        {/* Payment & Transfer Screens - VirtualAccount, TransferMember, Withdraw, Qr come from plugin routes */}
        <Stack.Screen name="ScanQr" component={QrScreen} />
        <Stack.Screen name="RequestMoney" component={PlaceholderScreen} />
        <Stack.Screen name="SplitBill" component={PlaceholderScreen} />

        {/* Marketplace & F&B (Marketplace, FnB, ProductDetail, Cart from plugin routes) */}
        {/* Search/SearchResults: app-specific names, plugin uses MarketplaceSearch/MarketplaceSearchResults */}
        {/* Card Screens (VirtualCard from card-transaction plugin) */}
        <Stack.Screen name="CardTopup" component={PlaceholderScreen} />
        <Stack.Screen name="CardLimit" component={PlaceholderScreen} />

        {/* Profile from core createAppNavigator; Settings/Account use same component, different route names */}
        <Stack.Screen name="Settings" component={ProfileScreen} />
        <Stack.Screen name="Account" component={ProfileScreen} />
        <Stack.Screen name="Reports" component={TransactionHistoryScreen} />
      </>
    );

    const Navigator = createAppNavigator({
      tenantId: 'member-base',
      HomeScreen: HomeScreen,
      appScreens: appScreens,
    });
    return Navigator;
  }, []);

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load app-specific config dengan support hot reload
        const appConfig = loadAppConfig();
        configService.setConfig(appConfig);

        setConfigLoaded(true);

        // Initialize plugins based on config
        await initializePlugins();
        setPluginsInitialized(true);
      } catch (error) {
        logger.error('Failed to initialize app', error);
        // Continue with default config
        setConfigLoaded(true);
        setPluginsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Handle app state changes - refresh config saat app menjadi active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App menjadi active, refresh config dari backend
        configRefreshService.refresh().catch((error) => {
          logger.error('Failed to refresh config on app active', error);
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Watch config file changes untuk development (polling approach)
  useEffect(() => {
    if (!__DEV__) return;

    let lastConfig: typeof import('./config/app.config').appConfig | null = null;

    const checkConfigUpdate = () => {
      try {
        const appConfig = loadAppConfig();

        // Deep comparison untuk detect perubahan
        const hasChanged =
          !lastConfig ||
          lastConfig.branding.logo !== appConfig.branding.logo ||
          lastConfig.branding.appName !== appConfig.branding.appName ||
          lastConfig.branding.primaryColor !== appConfig.branding.primaryColor ||
          lastConfig.companyId !== appConfig.companyId ||
          lastConfig.companyName !== appConfig.companyName;

        if (hasChanged) {
          logger.debug('Config file changed, updating...');
          configService.setConfig(appConfig);
          lastConfig = appConfig;
        }
      } catch (error) {
        // Ignore errors saat file sedang di-edit
      }
    };

    checkConfigUpdate();
    const interval = setInterval(checkConfigUpdate, 1000);
    return () => clearInterval(interval);
  }, []);

  // Watch theme color file changes untuk realtime color updates
  useEffect(() => {
    if (!__DEV__) return;

    const loadThemeColor = (): string | null => {
      try {
        const themeColorModule = require('./config/theme.color');
        return themeColorModule.themeColor || null;
      } catch (error) {
        return null;
      }
    };

    let lastThemeColor: string | null = null;

    const checkThemeColorUpdate = () => {
      try {
        const currentColor = loadThemeColor();

        if (currentColor && currentColor !== lastThemeColor) {
          logger.debug('Theme color file changed:', lastThemeColor, '→', currentColor);
          lastThemeColor = currentColor;
        }
      } catch (error) {}
    };

    checkThemeColorUpdate();
    const interval = setInterval(checkThemeColorUpdate, 500);
    return () => clearInterval(interval);
  }, []);

  if (!configLoaded || !pluginsInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Memuat aplikasi...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppNavigator />
      <Toast config={toastConfig} />
    </>
  );
}

function MemberBaseApp(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <SecurityProvider>
            <MemberBaseAppContent />
          </SecurityProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default MemberBaseApp;
