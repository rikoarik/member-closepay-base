/**
 * HomeTabSettingsScreen
 * Tengah fixed = Beranda. Kiri & kanan = dropdown. Widget Beranda bisa diatur.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDown2, ArrowUp2, InfoCircle } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  useConfig,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  FontFamily,
  scale,
  getIconSize,
} from '@core/config';
import { ScreenHeader } from './ScreenHeader';
import {
  loadHomeTabSettings,
  saveHomeTabSettings,
  BERANDA_TAB_ID,
  ALL_AVAILABLE_HOME_TABS,
  DEFAULT_BERANDA_WIDGETS,
  type AvailableHomeTab,
} from '../../services/homeTabSettingsService';
import type { BerandaWidgetConfig } from '../../types/AppConfig';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

const WIDGET_IDS = [
  'greeting-card',
  'balance-card',
  'quick-access',
  'recent-transactions',
  'news-info',
  'promo-banner',
  'store-nearby',
  'card-summary',
  'activity-summary',
  'savings-goal',
  'referral-banner',
  'rewards-points',
  'voucher-available',
  'fnb-recent-orders',
  'marketplace-featured',
  'sport-center-featured',
] as const;

type Slot = 'left' | 'right';

export const HomeTabSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { config } = useConfig();

  const [leftTabId, setLeftTabId] = useState<string>('');
  const [rightTabId, setRightTabId] = useState<string>('');
  const [berandaWidgets, setBerandaWidgets] = useState<BerandaWidgetConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dropdownSlot, setDropdownSlot] = useState<Slot | null>(null);
  const [showTabsInfo, setShowTabsInfo] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const knownWidgetIds = useMemo(() => new Set(WIDGET_IDS), []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const settings = await loadHomeTabSettings();
        if (cancelled) return;
        if (settings.enabledTabIds.length >= 3) {
          const [left, center, right] = settings.enabledTabIds;
          if (center === BERANDA_TAB_ID || center === 'home') {
            setLeftTabId(left || '');
            setRightTabId(right || '');
          } else {
            setLeftTabId(settings.enabledTabIds[0] || '');
            setRightTabId(settings.enabledTabIds[2] || settings.enabledTabIds[1] || '');
          }
        } else if (settings.enabledTabIds.length > 0) {
          setLeftTabId(settings.enabledTabIds[0] || '');
          setRightTabId(settings.enabledTabIds[1] || '');
        } else {
          const fromConfig = (config?.homeTabs || [])
            .filter((tab) => tab.visible !== false && tab.id !== BERANDA_TAB_ID && tab.id !== 'home')
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setLeftTabId(fromConfig[0]?.id || ALL_AVAILABLE_HOME_TABS[0]?.id || '');
          setRightTabId(fromConfig[1]?.id || ALL_AVAILABLE_HOME_TABS[1]?.id || '');
        }
        const rawWidgets = settings.berandaWidgets?.length
          ? settings.berandaWidgets
          : config?.berandaWidgets ?? DEFAULT_BERANDA_WIDGETS;
        const sanitized = rawWidgets.filter((w) => w?.id && (knownWidgetIds as Set<string>).has(w.id));
        const merged = [...DEFAULT_BERANDA_WIDGETS];
        const byId = new Map(sanitized.map((w) => [w.id, w]));
        WIDGET_IDS.forEach((id, i) => {
          const existing = byId.get(id);
          merged[i] = existing
            ? { id: existing.id, visible: existing.visible !== false, order: (existing.order ?? i + 1) }
            : { id, visible: true, order: i + 1 };
        });
        setBerandaWidgets(merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      } catch (error) {
        console.error('Failed to load home tab settings:', error);
        if (!cancelled) setBerandaWidgets(DEFAULT_BERANDA_WIDGETS);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [config?.homeTabs, config?.berandaWidgets, knownWidgetIds]);

  const handleSave = async () => {
    if (isSaving) return;
    const ids = allAvailableTabs.map((t) => t.id);
    if (ids.length < 2) {
      setSaveError(t('homeTabSettings.noTabsConfigured') || 'Tidak ada tab dikonfigurasi.');
      return;
    }
    let left = (leftTabId && ids.includes(leftTabId)) ? leftTabId : ids[0];
    let right = (rightTabId && ids.includes(rightTabId)) ? rightTabId : (ids[1] ?? ids[0]);
    if (left === right) {
      right = ids.find((id) => id !== left) ?? ids[0];
    }
    if (left === right) {
      setSaveError('Pilih tab yang berbeda untuk Kiri dan Kanan.');
      return;
    }
    const enabledTabIds: [string, string, string] = [left, BERANDA_TAB_ID, right];
    setSaveError(null);
    setIsSaving(true);
    try {
      await saveHomeTabSettings({
        enabledTabIds,
        berandaWidgets: berandaWidgets.length > 0 ? berandaWidgets : undefined,
      });
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : (t('common.error') || 'Terjadi kesalahan');
      setSaveError(message);
      console.error('Failed to save home tab settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getTabLabel = useCallback(
    (tab: AvailableHomeTab) => {
      const translated = t(tab.labelKey);
      return translated && translated !== tab.labelKey ? translated : tab.id;
    },
    [t]
  );

  const allAvailableTabs = useMemo(() => {
    const fromConfig = (config?.homeTabs || [])
      .filter((tab) => tab.id !== BERANDA_TAB_ID && tab.id !== 'home')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (fromConfig.length > 0) {
      return fromConfig.map((tab) => ({ id: tab.id, label: tab.label }));
    }
    return ALL_AVAILABLE_HOME_TABS.map((tab) => {
      const translated = t(tab.labelKey);
      return { id: tab.id, label: translated && translated !== tab.labelKey ? translated : tab.id };
    });
  }, [config?.homeTabs, t]);

  const getTabLabelById = useCallback(
    (id: string) => {
      if (id === BERANDA_TAB_ID) return t('homeTabSettings.slotCenter');
      const i18nLabel = t(`home.${id}`);
      if (i18nLabel && i18nLabel !== `home.${id}`) return i18nLabel;
      const tab = allAvailableTabs.find((t) => t.id === id);
      return tab?.label ?? id;
    },
    [allAvailableTabs, t]
  );

  const dropdownOptions = allAvailableTabs.filter(
    (tab) => tab.id !== (dropdownSlot === 'left' ? rightTabId : leftTabId)
  );

  useEffect(() => {
    if (allAvailableTabs.length === 0) return;
    const validIds = new Set(allAvailableTabs.map((t) => t.id));
    let changed = false;
    let nextLeft = leftTabId;
    let nextRight = rightTabId;
    if (leftTabId && !validIds.has(leftTabId)) {
      nextLeft = allAvailableTabs[0]?.id ?? '';
      changed = true;
    }
    if (rightTabId && !validIds.has(rightTabId)) {
      nextRight = allAvailableTabs.find((t) => t.id !== nextLeft)?.id ?? allAvailableTabs[1]?.id ?? '';
      changed = true;
    }
    if (nextLeft && nextRight && nextLeft === nextRight) {
      nextRight = allAvailableTabs.find((t) => t.id !== nextLeft)?.id ?? allAvailableTabs[0]?.id ?? '';
      changed = true;
    }
    if (changed) {
      setLeftTabId(nextLeft);
      setRightTabId(nextRight);
    }
  }, [allAvailableTabs, leftTabId, rightTabId]);

  const getEnabledTabIds = useCallback((): string[] => {
    const ids = allAvailableTabs.map((t) => t.id);
    let left = leftTabId && ids.includes(leftTabId) ? leftTabId : ids[0];
    let right = rightTabId && ids.includes(rightTabId) ? rightTabId : ids[ids.length > 1 ? 1 : 0];
    if (left === right) {
      right = ids.find((id) => id !== left) ?? ids[0];
    }
    return [left || 'marketplace', BERANDA_TAB_ID, right || 'fnb'];
  }, [leftTabId, rightTabId, allAvailableTabs]);

  const canSave = allAvailableTabs.length >= 2;

  const handleSelectTab = (id: string) => {
    setSaveError(null);
    if (dropdownSlot === 'left') setLeftTabId(id);
    else if (dropdownSlot === 'right') setRightTabId(id);
    setDropdownSlot(null);
  };

  const handleWidgetToggle = (widgetId: string, visible: boolean) => {
    setBerandaWidgets((prev) => {
      const existing = prev.find((w) => w.id === widgetId);
      if (existing) {
        return prev.map((w) => (w.id === widgetId ? { ...w, visible } : w));
      }
      const order = prev.length + 1;
      return [...prev, { id: widgetId, visible, order }].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });
  };

  const getWidgetVisible = (widgetId: string) => {
    const w = berandaWidgets.find((x) => x.id === widgetId);
    return w?.visible !== false;
  };

  const orderedWidgets = useMemo(() => {
    const withOrder =
      berandaWidgets.length > 0
        ? [...berandaWidgets].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : DEFAULT_BERANDA_WIDGETS;
    const ordered = withOrder.map((w) => w.id);
    WIDGET_IDS.forEach((id) => {
      if (!ordered.includes(id)) ordered.push(id);
    });
    return ordered;
  }, [berandaWidgets]);

  const { activeWidgets, inactiveWidgets } = useMemo(() => {
    const active: string[] = [];
    const inactive: string[] = [];
    orderedWidgets.forEach((id) => {
      if (getWidgetVisible(id)) active.push(id);
      else inactive.push(id);
    });
    return { activeWidgets: active, inactiveWidgets: inactive };
  }, [orderedWidgets, berandaWidgets]);

  const handleWidgetMove = useCallback((widgetId: string, direction: 'up' | 'down') => {
    setBerandaWidgets((prev) => {
      const base = prev.length ? prev : DEFAULT_BERANDA_WIDGETS;
      const list = [...base].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const ids = list.map((w) => w.id);
      const idx = ids.indexOf(widgetId);
      if (idx < 0) return prev;
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= ids.length) return prev;
      [ids[idx], ids[target]] = [ids[target], ids[idx]];
      return ids.map((id, i) => {
        const existing = list.find((w) => w.id === id);
        return { id, visible: existing?.visible !== false, order: i + 1 };
      });
    });
  }, []);

  const getWidgetLabel = (widgetId: string) => {
    const mapped: Record<string, string> = {
      'greeting-card': 'homeTabSettings.widgetGreetingCard',
      'balance-card': 'homeTabSettings.widgetBalanceCard',
      'quick-access': 'homeTabSettings.widgetQuickAccess',
      'recent-transactions': 'homeTabSettings.widgetRecentTransactions',
      'news-info': 'homeTabSettings.widgetNewsInfo',
      'promo-banner': 'homeTabSettings.widgetPromoBanner',
      'store-nearby': 'homeTabSettings.widgetStoreNearby',
      'card-summary': 'homeTabSettings.widgetCardSummary',
      'activity-summary': 'homeTabSettings.widgetActivitySummary',
      'savings-goal': 'homeTabSettings.widgetSavingsGoal',
      'referral-banner': 'homeTabSettings.widgetReferralBanner',
      'rewards-points': 'homeTabSettings.widgetRewardsPoints',
      'voucher-available': 'homeTabSettings.widgetVoucherAvailable',
      'fnb-recent-orders': 'homeTabSettings.widgetFnBRecentOrders',
      'marketplace-featured': 'homeTabSettings.widgetMarketplaceFeatured',
      'sport-center-featured': 'homeTabSettings.widgetSportCenterFeatured',
    };
    return t(mapped[widgetId] || widgetId);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('homeTabSettings.title')} />
        <View style={styles.centered}>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('homeTabSettings.title')}
        rightComponent={
          <TouchableOpacity
            onPress={() => setShowTabsInfo(true)}
            style={{ padding: scale(8), minWidth: getMinTouchTarget(), minHeight: getMinTouchTarget(), justifyContent: 'center', alignItems: 'center' }}
          >
            <InfoCircle size={getIconSize('medium')} color={colors.primary} variant="Bold" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: getHorizontalPadding() },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text, fontSize: getResponsiveFontSize('medium') },
          ]}
        >
          {t('homeTabSettings.title')}
        </Text>
        <Text
          style={[
            styles.sectionHint,
            { color: colors.textSecondary, fontSize: getResponsiveFontSize('small') },
          ]}
        >
          {t('homeTabSettings.tabsSectionHint')}
        </Text>

        <View style={styles.slotRow}>
          <View style={styles.slotItem}>
            <Text
              style={[
                styles.slotLabel,
                { color: colors.textSecondary, fontSize: getResponsiveFontSize('small') },
              ]}
            >
              {t('homeTabSettings.slotLeft')}
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  minHeight: getMinTouchTarget(),
                },
              ]}
              onPress={() => setDropdownSlot('left')}
              activeOpacity={0.7}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.dropdownText,
                  { color: colors.text, fontSize: getResponsiveFontSize('medium') },
                ]}
              >
                {leftTabId ? getTabLabelById(leftTabId) : t('homeTabSettings.slotLeft')}
              </Text>
              <ArrowDown2 size={scale(18)} color={colors.textSecondary} variant="Linear" />
            </TouchableOpacity>
          </View>

          <View style={styles.slotItem}>
            <Text
              style={[
                styles.slotLabel,
                { color: colors.textSecondary, fontSize: getResponsiveFontSize('small') },
              ]}
            >
              {t('homeTabSettings.slotCenter')}
            </Text>
            <View
              style={[
                styles.dropdown,
                styles.dropdownDisabled,
                {
                  backgroundColor: colors.surfaceSecondary || colors.surface,
                  borderColor: colors.border,
                  minHeight: getMinTouchTarget(),
                },
              ]}
            >
              <Text
                style={[
                  styles.dropdownText,
                  { color: colors.text, fontSize: getResponsiveFontSize('medium') },
                ]}
              >
                {t('homeTabSettings.slotCenter')}
              </Text>
            </View>
          </View>

          <View style={styles.slotItem}>
            <Text
              style={[
                styles.slotLabel,
                { color: colors.textSecondary, fontSize: getResponsiveFontSize('small') },
              ]}
            >
              {t('homeTabSettings.slotRight')}
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  minHeight: getMinTouchTarget(),
                },
              ]}
              onPress={() => setDropdownSlot('right')}
              activeOpacity={0.7}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.dropdownText,
                  { color: colors.text, fontSize: getResponsiveFontSize('medium') },
                ]}
              >
                {rightTabId ? getTabLabelById(rightTabId) : t('homeTabSettings.slotRight')}
              </Text>
              <ArrowDown2 size={scale(18)} color={colors.textSecondary} variant="Linear" />
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
              fontSize: getResponsiveFontSize('medium'),
              marginTop: moderateVerticalScale(20),
            },
          ]}
        >
          {t('homeTabSettings.widgetTitle')}
        </Text>
        <Text
          style={[
            styles.sectionSubHint,
            {
              color: colors.textSecondary,
              fontSize: getResponsiveFontSize('small'),
            },
          ]}
        >
          {t('homeTabSettings.widgetHint')}
        </Text>

        <View style={styles.widgetList}>
          {activeWidgets.length > 0 && (
            <>
              <Text
                style={[
                  styles.widgetSectionLabel,
                  { color: colors.primary, fontSize: getResponsiveFontSize('small') },
                ]}
              >
                {t('homeTabSettings.widgetActiveSection')}
              </Text>
              {activeWidgets.map((widgetId, index) => (
                <View
                  key={widgetId}
                  style={[
                    styles.widgetRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      minHeight: getMinTouchTarget(),
                    },
                  ]}
                >
                  <View style={styles.widgetOrderControls}>
                    <TouchableOpacity
                      onPress={() => handleWidgetMove(widgetId, 'up')}
                      disabled={index === 0}
                      style={[
                        styles.orderButton,
                        {
                          backgroundColor: colors.surfaceSecondary || colors.border,
                          opacity: index === 0 ? 0.4 : 1,
                        },
                      ]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <ArrowUp2 size={scale(18)} color={colors.text} variant="Bold" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleWidgetMove(widgetId, 'down')}
                      disabled={index === activeWidgets.length - 1}
                      style={[
                        styles.orderButton,
                        {
                          backgroundColor: colors.surfaceSecondary || colors.border,
                          opacity: index === activeWidgets.length - 1 ? 0.4 : 1,
                          marginTop: scale(4),
                        },
                      ]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <ArrowDown2 size={scale(18)} color={colors.text} variant="Bold" />
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={[
                      styles.widgetLabel,
                      { color: colors.text, fontSize: getResponsiveFontSize('medium') },
                    ]}
                  >
                    {getWidgetLabel(widgetId) || widgetId}
                  </Text>
                  <Switch
                    value={true}
                    onValueChange={(v) => handleWidgetToggle(widgetId, v)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.surface}
                    ios_backgroundColor={colors.border}
                  />
                </View>
              ))}
            </>
          )}
          {inactiveWidgets.length > 0 && (
            <>
              <Text
                style={[
                  styles.widgetSectionLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: getResponsiveFontSize('small'),
                    marginTop: activeWidgets.length > 0 ? moderateVerticalScale(16) : 0,
                  },
                ]}
              >
                {t('homeTabSettings.widgetInactiveSection')}
              </Text>
              {inactiveWidgets.map((widgetId) => (
                <View
                  key={widgetId}
                  style={[
                    styles.widgetRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      minHeight: getMinTouchTarget(),
                      opacity: 0.85,
                    },
                  ]}
                >
                  <View style={[styles.widgetOrderControls, { minWidth: scale(32) }]} />
                  <Text
                    style={[
                      styles.widgetLabel,
                      { color: colors.textSecondary, fontSize: getResponsiveFontSize('medium') },
                    ]}
                  >
                    {getWidgetLabel(widgetId) || widgetId}
                  </Text>
                  <Switch
                    value={false}
                    onValueChange={(v) => handleWidgetToggle(widgetId, v)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.textTertiary}
                    ios_backgroundColor={colors.border}
                  />
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingHorizontal: getHorizontalPadding(),
            paddingBottom: insets.bottom + moderateVerticalScale(16),
            paddingTop: moderateVerticalScale(16),
          },
        ]}
      >
        {saveError ? (
          <Text
            numberOfLines={2}
            style={[styles.saveErrorText, { color: colors.error }]}
          >
            {saveError}
          </Text>
        ) : null}
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              minHeight: getMinTouchTarget(),
              opacity: canSave && !isSaving ? 1 : 0.6,
            },
          ]}
          onPress={handleSave}
          disabled={!canSave || isSaving}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.saveButtonText,
              { color: colors.surface, fontSize: getResponsiveFontSize('medium') },
            ]}
          >
            {isSaving ? t('common.loading') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={dropdownSlot !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownSlot(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDropdownSlot(null)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: colors.text, fontSize: getResponsiveFontSize('medium') },
              ]}
            >
              {dropdownSlot === 'left'
                ? t('homeTabSettings.slotLeft')
                : t('homeTabSettings.slotRight')}
            </Text>
            <ScrollView
              style={styles.modalOptionsScroll}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
            {dropdownOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.modalOption,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => handleSelectTab(option.id)}
                activeOpacity={0.7}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.modalOptionText,
                    { color: colors.text, fontSize: getResponsiveFontSize('medium') },
                  ]}
                >
                  {getTabLabelById(option.id)}
                </Text>
              </TouchableOpacity>
            ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showTabsInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTabsInfo(false)}
      >
        <Pressable
          style={[styles.modalBackdrop, styles.infoModalBackdrop]}
          onPress={() => setShowTabsInfo(false)}
        >
          <View
            style={[
              styles.infoModalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.infoModalIconWrap, { backgroundColor: colors.primaryLight || colors.primary + '20' }]}>
              <InfoCircle size={scale(28)} color={colors.primary} variant="Bold" />
            </View>
            <Text style={[styles.infoModalTitle, { color: colors.text }]}>
              {t('home.tabsTutorialTitle')}
            </Text>
            <View style={styles.infoModalList}>
              {[
                t('home.tabsTutorialStep1'),
                t('home.tabsTutorialStep2'),
                t('home.tabsTutorialStep3'),
              ].map((label, i) => (
                <View
                  key={i}
                  style={[
                    styles.infoModalRow,
                    { borderBottomColor: colors.border, borderBottomWidth: i < 2 ? StyleSheet.hairlineWidth : 0 },
                  ]}
                >
                  <View style={[styles.infoModalStepBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.infoModalStepNum, { color: colors.surface }]}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.infoModalBullet, { color: colors.text }]}>{label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.infoModalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowTabsInfo(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.infoModalButtonText, { color: colors.surface }]}>
                {t('common.ok')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: moderateVerticalScale(16), paddingBottom: moderateVerticalScale(24) },
  sectionHint: { fontFamily: fontRegular, marginBottom: moderateVerticalScale(12) },
  sectionTitle: { fontFamily: fontSemiBold, marginBottom: moderateVerticalScale(4) },
  sectionSubHint: { fontFamily: fontRegular, marginBottom: moderateVerticalScale(12) },
  slotRow: { flexDirection: 'row', gap: scale(12) },
  slotItem: { flex: 1 },
  slotLabel: { fontFamily: fontRegular, marginBottom: moderateVerticalScale(4) },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: moderateVerticalScale(12),
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownDisabled: { opacity: 0.9 },
  dropdownText: { fontFamily: fontRegular, flex: 1, minWidth: 0 },
  widgetList: { gap: moderateVerticalScale(10) },
  widgetSectionLabel: {
    fontFamily: fontSemiBold,
    marginBottom: moderateVerticalScale(6),
  },
  widgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: moderateVerticalScale(14),
    borderRadius: 12,
    borderWidth: 1,
  },
  widgetOrderControls: { marginRight: 12 },
  orderButton: {
    width: scale(32),
    height: scale(28),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetLabel: { fontFamily: fontRegular, flex: 1 },
  footer: { borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.1)' },
  saveErrorText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('small'),
    marginBottom: moderateVerticalScale(8),
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: moderateVerticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { fontFamily: fontSemiBold },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint: { fontFamily: fontRegular },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: moderateVerticalScale(32),
    paddingHorizontal: getHorizontalPadding(),
    maxHeight: '70%',
  },
  modalOptionsScroll: {
    maxHeight: moderateVerticalScale(320),
  },
  modalTitle: {
    fontFamily: fontSemiBold,
    marginBottom: moderateVerticalScale(16),
    marginTop: moderateVerticalScale(16),
  },
  modalOption: {
    paddingVertical: moderateVerticalScale(16),
    borderBottomWidth: 1,
  },
  modalOptionText: { fontFamily: fontRegular },
  infoModalBackdrop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(24),
  },
  infoModalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    paddingVertical: moderateVerticalScale(28),
    paddingHorizontal: scale(24),
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  infoModalIconWrap: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  infoModalTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('large'),
    marginBottom: moderateVerticalScale(20),
    textAlign: 'center',
  },
  infoModalList: {
    width: '100%',
    marginBottom: moderateVerticalScale(24),
  },
  infoModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
    gap: scale(12),
  },
  infoModalStepBadge: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoModalStepNum: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('small'),
  },
  infoModalBullet: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
    flex: 1,
  },
  infoModalButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: moderateVerticalScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getMinTouchTarget(),
  },
  infoModalButtonText: { fontFamily: fontSemiBold, fontSize: getResponsiveFontSize('medium') },
});
