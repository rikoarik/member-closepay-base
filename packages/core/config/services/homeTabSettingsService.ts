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
  { id: 'sport-center', labelKey: 'home.sportCenter' },
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
  { id: 'sport-center-featured', visible: true, order: 16 },
];

function isStringArray(arr: unknown): arr is string[] {
  return Array.isArray(arr) && arr.every((x) => typeof x === 'string');
}

function sanitizeEnabledTabIds(ids: unknown): string[] {
  if (!isStringArray(ids)) return [];
  return ids
    .slice(0, MAX_HOME_TABS)
    .map((id) => (typeof id === 'string' ? id.trim() : ''))
    .filter(Boolean);
}

function sanitizeBerandaWidgets(widgets: unknown): BerandaWidgetConfig[] | undefined {
  if (!Array.isArray(widgets)) return undefined;
  const out: BerandaWidgetConfig[] = [];
  const seen = new Set<string>();
  for (const w of widgets) {
    if (!w || typeof w !== 'object') continue;
    const id = typeof (w as BerandaWidgetConfig).id === 'string' ? (w as BerandaWidgetConfig).id.trim() : '';
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const visible = (w as BerandaWidgetConfig).visible !== false;
    const order = typeof (w as BerandaWidgetConfig).order === 'number' ? (w as BerandaWidgetConfig).order : out.length + 1;
    out.push({ id, visible, order });
  }
  return out.length > 0 ? out.sort((a, b) => a.order - b.order) : undefined;
}

/**
 * Load home tab settings dari storage. Sanitizes and validates stored data.
 */
export const loadHomeTabSettings = async (): Promise<HomeTabSettings> => {
  try {
    const stored = await SecureStorage.getItem(HOME_TAB_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as HomeTabSettings;
      const enabledTabIds = sanitizeEnabledTabIds(parsed?.enabledTabIds);
      const berandaWidgets = sanitizeBerandaWidgets(parsed?.berandaWidgets);
      return {
        enabledTabIds,
        berandaWidgets,
      };
    }
  } catch (error) {
    console.error('Failed to load home tab settings:', error);
  }
  return { enabledTabIds: [] };
};

/**
 * Validates settings before save. Returns null if invalid.
 */
export function validateHomeTabSettings(settings: HomeTabSettings): HomeTabSettings | null {
  const raw = settings.enabledTabIds;
  if (!Array.isArray(raw) || raw.length < MAX_HOME_TABS) return null;
  const left = typeof raw[0] === 'string' ? raw[0].trim() : '';
  const center = typeof raw[1] === 'string' ? raw[1].trim() : '';
  const right = typeof raw[2] === 'string' ? raw[2].trim() : '';
  if (!left || !center || !right) return null;
  if (center !== BERANDA_TAB_ID && center !== 'home') return null;
  if (left === right) return null;
  const berandaWidgets = sanitizeBerandaWidgets(settings.berandaWidgets);
  return {
    enabledTabIds: [left, BERANDA_TAB_ID, right],
    berandaWidgets: berandaWidgets && berandaWidgets.length > 0 ? berandaWidgets : undefined,
  };
}

/**
 * Save home tab settings - format: [leftTabId, 'beranda', rightTabId]. Validates before writing.
 */
export const saveHomeTabSettings = async (
  settings: HomeTabSettings
): Promise<void> => {
  const toSave = validateHomeTabSettings(settings);
  if (!toSave) {
    throw new Error('Invalid tab settings: need left, beranda, right (left ≠ right)');
  }
  try {
    await SecureStorage.setItem(HOME_TAB_SETTINGS_KEY, JSON.stringify({
      enabledTabIds: toSave.enabledTabIds,
      berandaWidgets: toSave.berandaWidgets,
    }));
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

/**
 * Validates and normalizes enabled tab IDs against a list of valid IDs (for left/right only; beranda is fixed center).
 * Returns [left, beranda, right] with no duplicates and only valid IDs.
 */
export function validateEnabledTabIds(
  enabledTabIds: string[],
  validTabIds: string[]
): string[] {
  const validSet = new Set(validTabIds.filter((id) => id && id !== BERANDA_TAB_ID && id !== 'home'));
  if (validSet.size === 0) return [];

  const [left = '', , right = ''] = enabledTabIds.slice(0, MAX_HOME_TABS);
  const ids = Array.from(validSet);

  const leftId = left && validSet.has(left) ? left : ids[0];
  let rightId = right && validSet.has(right) ? right : ids[ids.length > 1 ? 1 : 0];
  if (rightId === leftId) {
    rightId = ids.find((id) => id !== leftId) ?? ids[0];
  }

  return [leftId, BERANDA_TAB_ID, rightId];
}
