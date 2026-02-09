/**
 * HomeTabSettingsScreen
 * Pengaturan tab beranda (tab switcher) - user memilih maksimal 3 tab yang aktif
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUp2, ArrowDown2 } from 'iconsax-react-nativejs';
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
} from '@core/config';
import { ScreenHeader } from './ScreenHeader';
import {
  loadHomeTabSettings,
  saveHomeTabSettings,
  MAX_HOME_TABS,
  ALL_AVAILABLE_HOME_TABS,
  type AvailableHomeTab,
} from '../../services/homeTabSettingsService';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';

export const HomeTabSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { config } = useConfig();

  const availableTabs = ALL_AVAILABLE_HOME_TABS;

  const [orderedEnabledIds, setOrderedEnabledIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const settings = await loadHomeTabSettings();
        if (cancelled) return;
        if (settings.enabledTabIds.length > 0) {
          setOrderedEnabledIds(settings.enabledTabIds.slice(0, MAX_HOME_TABS));
        } else {
          const fromConfig = (config?.homeTabs || [])
            .filter((t) => t.visible !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((t) => t.id)
            .slice(0, MAX_HOME_TABS);
          setOrderedEnabledIds(fromConfig);
        }
      } catch (error) {
        console.error('Failed to load home tab settings:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [config?.homeTabs]);

  const enabledSet = useMemo(() => new Set(orderedEnabledIds), [orderedEnabledIds]);
  const canEnableMore = orderedEnabledIds.length < MAX_HOME_TABS;

  const handleToggle = useCallback((id: string, currentEnabled: boolean) => {
    if (currentEnabled) {
      setOrderedEnabledIds((prev) => prev.filter((x) => x !== id));
    } else {
      setOrderedEnabledIds((prev) => {
        if (prev.length >= MAX_HOME_TABS) return prev;
        return [...prev, id];
      });
    }
  }, []);

  const handleMove = useCallback((index: number, direction: 'up' | 'down') => {
    setOrderedEnabledIds((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveHomeTabSettings({ enabledTabIds: orderedEnabledIds });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save home tab settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getTabLabel = (tab: AvailableHomeTab) => {
    const translated = t(tab.labelKey);
    return translated && translated !== tab.labelKey ? translated : tab.id;
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
      <ScreenHeader title={t('homeTabSettings.title')} />

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
            styles.maxHint,
            {
              color: colors.textSecondary,
              fontSize: getResponsiveFontSize('small'),
            },
          ]}
        >
          {t('homeTabSettings.maxTabsHint', { max: MAX_HOME_TABS })}
        </Text>

        {availableTabs.map((tab) => {
          const isEnabled = enabledSet.has(tab.id);
          const wouldExceedMax = !isEnabled && !canEnableMore;
          return (
            <View
              key={tab.id}
              style={[
                styles.row,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  minHeight: getMinTouchTarget(),
                },
              ]}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color: colors.text,
                    fontSize: getResponsiveFontSize('medium'),
                  },
                ]}
              >
                {getTabLabel(tab)}
              </Text>
              <Switch
                value={isEnabled}
                onValueChange={() => handleToggle(tab.id, isEnabled)}
                disabled={wouldExceedMax}
                trackColor={{
                  false: colors.border,
                  true: colors.primary,
                }}
                thumbColor={isEnabled ? colors.surface : colors.textTertiary}
                ios_backgroundColor={colors.border}
              />
            </View>
          );
        })}

        {orderedEnabledIds.length > 0 && (
          <>
            <Text
              style={[
                styles.orderTitle,
                {
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                  marginTop: moderateVerticalScale(16),
                  marginBottom: moderateVerticalScale(8),
                },
              ]}
            >
              {t('homeTabSettings.orderTitle')}
            </Text>
            {orderedEnabledIds.map((tabId, index) => {
              const tab = availableTabs.find((t) => t.id === tabId);
              if (!tab) return null;
              const positionKey = index === 0 ? 'positionLeft' : index === 1 ? 'positionCenter' : 'positionRight';
              return (
                <View
                  key={tabId}
                  style={[
                    styles.orderRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      minHeight: getMinTouchTarget(),
                    },
                  ]}
                >
                  <View style={styles.orderTextCol}>
                    <Text
                      style={[
                        styles.orderLabel,
                        {
                          color: colors.textSecondary,
                          fontSize: getResponsiveFontSize('small'),
                        },
                      ]}
                    >
                      {t(`homeTabSettings.${positionKey}`)}
                    </Text>
                    <Text
                      style={[
                        styles.label,
                        {
                          color: colors.text,
                          fontSize: getResponsiveFontSize('medium'),
                        },
                      ]}
                    >
                      {getTabLabel(tab)}
                    </Text>
                  </View>
                  <View style={styles.orderActions}>
                    <TouchableOpacity
                      onPress={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      style={[
                        styles.orderButton,
                        {
                          opacity: index === 0 ? 0.4 : 1,
                          backgroundColor: colors.surfaceSecondary || colors.border,
                        },
                      ]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <ArrowUp2 size={scale(20)} color={colors.text} variant="Bold" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleMove(index, 'down')}
                      disabled={index === orderedEnabledIds.length - 1}
                      style={[
                        styles.orderButton,
                        {
                          opacity: index === orderedEnabledIds.length - 1 ? 0.4 : 1,
                          backgroundColor: colors.surfaceSecondary || colors.border,
                          marginLeft: scale(8),
                        },
                      ]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <ArrowDown2 size={scale(20)} color={colors.text} variant="Bold" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}

        <Text
          style={[
            styles.footerHint,
            {
              color: colors.textTertiary,
              fontSize: getResponsiveFontSize('small'),
            },
          ]}
        >
          {t('homeTabSettings.emptyHint')}
        </Text>
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
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              minHeight: getMinTouchTarget(),
            },
          ]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.saveButtonText,
              {
                color: colors.surface,
                fontSize: getResponsiveFontSize('medium'),
              },
            ]}
          >
            {isSaving ? t('common.loading') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(24),
  },
  maxHint: {
    fontFamily: fontRegular,
    marginBottom: moderateVerticalScale(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: moderateVerticalScale(16),
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
  },
  label: {
    fontFamily: fontRegular,
    flex: 1,
  },
  footerHint: {
    fontFamily: fontRegular,
    marginTop: moderateVerticalScale(8),
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: moderateVerticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: fontSemiBold,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontFamily: fontRegular,
  },
  orderTitle: {
    fontFamily: fontSemiBold,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: moderateVerticalScale(12),
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: moderateVerticalScale(8),
  },
  orderTextCol: {
    flex: 1,
  },
  orderLabel: {
    fontFamily: fontRegular,
    marginBottom: 2,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
