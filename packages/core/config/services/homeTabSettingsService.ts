/**
 * Home Tab Settings Service
 * Tengah fixed = Beranda. Kiri & kanan = dropdown pilih tab.
 */
import SecureStorage from '../../native/SecureStorage';
import type { BerandaWidgetConfig } from '../types/AppConfig';

const HOME_TAB_SETTINGS_KEY = '@home_tab_settings';

export const MAX_HOME_TABS = 3;
export const BERANDA_TAB_ID = 'beranda';

export interface HomeTabSettings {
  enabledTabIds: string[];
  berandaWidgets?: BerandaWidgetConfig[];
}

/**
 * Tab untuk dropdown kiri & kanan (Beranda tidak termasuk - fixed di tengah)
 */
export interface AvailableHomeTab {
  id: string;
  labelKey: string;
}

export const ALL_AVAILABLE_HOME_TABS: AvailableHomeTab[] = [
  { id: 'analytics', labelKey: 'home.analytics' },
  { id: 'virtualcard', labelKey: 'home.virtualcard' },
  { id: 'fnb', labelKey: 'home.fnb' },
  { id: 'marketplace', labelKey: 'home.marketplace' },
  { id: 'activity', labelKey: 'home.activity' },
  { id: 'news', labelKey: 'home.news' },
  { id: 'beranda-news', labelKey: 'home.berandaNews' },
];

export const DEFAULT_BERANDA_WIDGETS: BerandaWidgetConfig[] = [
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
];

/**
 * Load home tab settings dari storage
 */
export const loadHomeTabSettings = async (): Promise<HomeTabSettings> => {
  try {
    const stored = await SecureStorage.getItem(HOME_TAB_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as HomeTabSettings;
      if (Array.isArray(parsed.enabledTabIds)) {
        return {
          enabledTabIds: parsed.enabledTabIds.slice(0, MAX_HOME_TABS),
          berandaWidgets: parsed.berandaWidgets,
        };
      }
    }
  } catch (error) {
    console.error('Failed to load home tab settings:', error);
  }
  return { enabledTabIds: [] };
};

/**
 * Save home tab settings - format: [leftTabId, 'beranda', rightTabId]
 */
export const saveHomeTabSettings = async (
  settings: HomeTabSettings
): Promise<void> => {
  try {
    const toSave: HomeTabSettings = {
      enabledTabIds: settings.enabledTabIds.slice(0, MAX_HOME_TABS),
      berandaWidgets: settings.berandaWidgets,
    };
    await SecureStorage.setItem(HOME_TAB_SETTINGS_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Failed to save home tab settings:', error);
    throw error;
  }
};

/**
 * Get enabled tab IDs (max 3) - returns empty array if no override (app will use config)
 */
export const getEnabledHomeTabIds = async (): Promise<string[]> => {
  const settings = await loadHomeTabSettings();
  return settings.enabledTabIds;
};
