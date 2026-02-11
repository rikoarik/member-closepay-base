/**
 * BerandaTab Component
 * Tab beranda dengan quick access buttons dan konten beranda.
 * Widgets: user override dari settings > config > default.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import {
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  useConfig,
  loadHomeTabSettings,
  RefreshRegistryProvider,
  useRefreshRegistry,
} from '@core/config';
import { QuickAccessButtons } from '../../quick-actions/QuickAccessButtons';
import { BalanceCard } from '@plugins/balance/components/ui/BalanceCard';
import { useTranslation } from '@core/i18n';
import {
  BerandaNewsInfo,
  GreetingCard,
  PromoBanner,
  StoreNearby,
  ReferralBanner,
  RewardsPoints,
  VoucherAvailable,
  type BerandaNewsInfoProps,
} from '../../widgets';
import { PluginWidgetRenderer } from '../../PluginWidgetRenderer';

interface BerandaTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  /**
   * Callback untuk navigasi ke NewsTab saat "Lihat Semua" diklik
   */
  onNavigateToNews?: () => void;
  newsInfoProps?: Omit<BerandaNewsInfoProps, 'onViewAllPress'>;
  /**
   * Callback untuk scroll event (untuk collapsible header)
   */
  onScroll?: (event: any) => void;
  /**
   * Enable/disable scroll
   */
  scrollEnabled?: boolean;
}

const DEFAULT_BERANDA_WIDGETS = [
  { id: 'greeting-card', visible: true, order: 1 },
  { id: 'balance-card', visible: true, order: 2 },
  { id: 'quick-access', visible: true, order: 3 },
  { id: 'recent-transactions', visible: true, order: 4 },
  { id: 'news-info', visible: true, order: 5 },
  { id: 'promo-banner', visible: true, order: 6 },
  { id: 'store-nearby', visible: true, order: 7 },
  { id: 'card-summary', visible: true, order: 8 },
  { id: 'activity-summary', visible: true, order: 9 },
  { id: 'savings-goal', visible: true, order: 10 },
  { id: 'referral-banner', visible: true, order: 11 },
  { id: 'rewards-points', visible: true, order: 12 },
  { id: 'voucher-available', visible: true, order: 13 },
  { id: 'fnb-recent-orders', visible: true, order: 14 },
  { id: 'marketplace-featured', visible: true, order: 15 },
  { id: 'sport-center-featured', visible: true, order: 16 },
];

const BerandaTabContent: React.FC<BerandaTabProps> = React.memo(
  ({
    isActive = true,
    isVisible = true,
    onNavigateToNews,
    newsInfoProps,
    onScroll,
    scrollEnabled = true,
  }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const horizontalPadding = getHorizontalPadding();
    const { t } = useTranslation();
    const { config } = useConfig();
    const [widgetOverride, setWidgetOverride] = React.useState<
      Array<{ id: string; visible?: boolean; order?: number }> | null
    >(null);

    useFocusEffect(
      useCallback(() => {
        let cancelled = false;
        loadHomeTabSettings().then((settings) => {
          if (!cancelled && settings.berandaWidgets?.length) {
            setWidgetOverride(settings.berandaWidgets);
          } else {
            setWidgetOverride(null);
          }
        });
        return () => {
          cancelled = true;
        };
      }, [])
    );

    const [showBalance, setShowBalance] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const refreshRegistry = useRefreshRegistry();

    const handleRefresh = useCallback(async () => {
      setRefreshing(true);
      try {
        if (refreshRegistry) {
          await refreshRegistry.refreshAll();
        }
      } catch (error) {
        console.error('Refresh error:', error);
      } finally {
        setTimeout(() => setRefreshing(false), 1000);
      }
    }, [refreshRegistry]);

    const berandaWidgets = useMemo(() => {
      const widgets = widgetOverride ?? config?.berandaWidgets ?? DEFAULT_BERANDA_WIDGETS;
      return [...widgets]
        .filter((w) => w.visible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }, [widgetOverride, config?.berandaWidgets]);

    const content = (
      <>
        {berandaWidgets.map((widget) => {
          if (widget.id === 'greeting-card') {
            return <GreetingCard key="greeting-card" />;
          }
          if (widget.id === 'balance-card') {
            return (
              <BalanceCard
                key="balance-card"
                title={t('balance.mainBalance') || 'Saldo Utama'}
                balance={10000000000}
                showBalance={showBalance}
                onToggleBalance={() => setShowBalance((v) => !v)}
              />
            );
          }
          if (widget.id === 'quick-access') {
            return (
              <View key="quick-access" style={styles.menuItem}>
                <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                  {t('home.quickAccess')}
                </Text>
                <QuickAccessButtons />
              </View>
            );
          }
          if (widget.id === 'recent-transactions') {
            return (
              <PluginWidgetRenderer
                key="recent-transactions"
                widgetId="recent-transactions"
                isActive={isActive}
                isVisible={isVisible}
              />
            );
          }
          if (widget.id === 'news-info') {
            return (
              <BerandaNewsInfo
                key="news-info"
                {...newsInfoProps}
                onViewAllPress={onNavigateToNews}
              />
            );
          }
          if (widget.id === 'promo-banner') {
            return <PromoBanner key="promo-banner" />;
          }
          if (widget.id === 'store-nearby') {
            return <StoreNearby key="store-nearby" />;
          }
          if (widget.id === 'card-summary') {
            return (
              <PluginWidgetRenderer
                key="card-summary"
                widgetId="card-summary"
                isActive={isActive}
                isVisible={isVisible}
              />
            );
          }
          if (widget.id === 'activity-summary') {
            return (
              <PluginWidgetRenderer
                key="activity-summary"
                widgetId="activity-summary"
                isActive={isActive}
                isVisible={isVisible}
              />
            );
          }
          if (widget.id === 'savings-goal') {
            return (
              <PluginWidgetRenderer
                key="savings-goal"
                widgetId="savings-goal"
                isActive={isActive}
                isVisible={isVisible}
              />
            );
          }
          if (widget.id === 'referral-banner') {
            return <ReferralBanner key="referral-banner" />;
          }
          if (widget.id === 'rewards-points') {
            return <RewardsPoints key="rewards-points" />;
          }
          if (widget.id === 'voucher-available') {
            return <VoucherAvailable key="voucher-available" />;
          }
          if (widget.id === 'fnb-recent-orders') {
            return (
              <PluginWidgetRenderer
                key="fnb-recent-orders"
                widgetId="fnb-recent-orders"
                isActive={isActive}
                isVisible={isVisible}
              />
            );
          }
          if (widget.id === 'marketplace-featured') {
            return (
              <PluginWidgetRenderer
                key="marketplace-featured"
                widgetId="marketplace-featured"
                isActive={isActive}
                isVisible={isVisible}
              />
            );
          }
          if (widget.id === 'sport-center-featured') {
            return (
              <PluginWidgetRenderer
                key="sport-center-featured"
                widgetId="sport-center-featured"
                isActive={isActive}
                isVisible={isVisible}
              />
            );
          }
          return null;
        })}
      </>
    );

    // Jika scrollEnabled={false}, render konten tanpa ScrollView wrapper
    // (untuk digunakan dengan parent ScrollView dengan sticky header)
    if (!scrollEnabled) {
      return (
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + moderateVerticalScale(24),
              paddingHorizontal: horizontalPadding,
              paddingTop: moderateVerticalScale(16),
            },
          ]}
          pointerEvents={isActive ? 'auto' : 'none'}
        >
          {content}
        </View>
      );
    }

    // Default: render dengan ScrollView
    return (
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
        contentContainerStyle={{
          paddingBottom: insets.bottom + moderateVerticalScale(24),
          paddingHorizontal: horizontalPadding,
          paddingTop: moderateVerticalScale(16),
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        pointerEvents={isActive ? 'auto' : 'none'}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollEnabled={scrollEnabled}
      >
        {content}
      </ScrollView>
    );
  }
);

BerandaTabContent.displayName = 'BerandaTabContent';

export const BerandaTab: React.FC<BerandaTabProps> = React.memo((props) => (
  <RefreshRegistryProvider>
    <BerandaTabContent {...props} />
  </RefreshRegistryProvider>
));

BerandaTab.displayName = 'BerandaTab';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  section: {
    marginBottom: moderateVerticalScale(16),
  },
  menuItemTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: moderateVerticalScale(8),
  },
  menuItem: {
    marginTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(16),
    paddingVertical: moderateVerticalScale(16),
  },
});
