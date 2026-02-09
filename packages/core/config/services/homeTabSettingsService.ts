/**
 * Home Tab Settings Service
 * Menyimpan preferensi user untuk tab beranda (tab switcher) - maksimal 3 tab aktif
 */
import SecureStorage from '../../native/SecureStorage';

const HOME_TAB_SETTINGS_KEY = '@home_tab_settings';

export const MAX_HOME_TABS = 3;

export interface HomeTabSettings {
  enabledTabIds: string[];
}

/**
 * Semua tab yang bisa ditampilkan di home (sesuai renderTabContent di HomeScreen).
 * User memilih on/off maksimal 3 dari list ini.
 */
export interface AvailableHomeTab {
  id: string;
  labelKey: string;
}

export const ALL_AVAILABLE_HOME_TABS: AvailableHomeTab[] = [
  { id: 'beranda', labelKey: 'home.beranda' },
  { id: 'analytics', labelKey: 'home.analytics' },
  { id: 'virtualcard', labelKey: 'home.virtualcard' },
  { id: 'fnb', labelKey: 'home.fnb' },
  { id: 'marketplace', labelKey: 'home.marketplace' },
  { id: 'activity', labelKey: 'home.activity' },
  { id: 'news', labelKey: 'home.news' },
  { id: 'beranda-news', labelKey: 'home.berandaNews' },
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
        };
      }
    }
  } catch (error) {
    console.error('Failed to load home tab settings:', error);
  }
  return { enabledTabIds: [] };
};

/**
 * Save home tab settings ke storage (max 3 IDs)
 */
export const saveHomeTabSettings = async (
  settings: HomeTabSettings
): Promise<void> => {
  try {
    const toSave: HomeTabSettings = {
      enabledTabIds: settings.enabledTabIds.slice(0, MAX_HOME_TABS),
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
