/**
 * Core Config - AppConfig Types
 * Types untuk aplikasi configuration
 */

import { TenantId } from '../tenants';
import { toCompanyId, validateCompanyInitial, type ValidationResult } from '../utils/companyUtils';

export interface AppConfig {
  companyInitial: string; // Company initial/short code (e.g., 'MB', 'TKIFTP') - PRIMARY IDENTIFIER
  companyId?: string; // Company ID (kebab-case) - Auto-generated from companyInitial if not provided
  companyName: string;
  tenantId?: TenantId; // Tenant ID for multi-tenant support
  segmentId: 'balance-management' | 'campus' | 'fnb' | 'umroh' | 'community' | 'retribution' | 'koperasi' | 'tourism' | 'sport-center' | 'retail';

  // Feature flags
  enabledFeatures: string[];
  enabledModules: string[];

  // Home variant from tenant config
  homeVariant?: 'dashboard' | 'simple' | 'member' | 'custom';

  // Home tabs configuration (for member variant)
  homeTabs?: HomeTabConfig[];

  // Menu configuration
  menuConfig: MenuItemConfig[];

  // Payment methods
  paymentMethods: string[];

  // Branding
  branding: BrandingConfig;

  /**
   * Balance card background colors configuration.
   * Maps balance account title/type to background color.
   * Example: { 'Saldo Plafon': '#3B82F6', 'Saldo Makan': '#10B981' }
   * If not specified, uses branding.primaryColor as default.
   */
  balanceCardColors?: Record<string, string>;

  // Login configuration
  login?: LoginConfig;

  // API services
  services: ServiceConfig;

  // Plugin-specific configs
  plugins?: Record<string, PluginConfig>;

  // QR Button configuration
  showQrButton?: boolean; // Show/hide QR scan button on home screen

  /**
   * Akses Cepat (Quick Access) – tombol di Beranda.
   * Hanya item di array ini yang tampil; urutan ikut `order`.
   * Untuk sembunyikan: hapus item dari array. Untuk tambah: tambah object { id, route, labelKey, icon, order }.
   */
  quickAccessMenu?: QuickAccessMenuItemConfig[];

  /**
   * Quick menu settings screen (Atur fitur pilihan): drag & fixed slots.
   * - enableDrag: allow drag-to-reorder (default true). If false, only tap to add/remove.
   * - fixedTopCount: number of main menu items at top that cannot be changed (default 3). Menu utama gabisa di ubah.
   * - editableSlotCount: number of slots that can be edited (dashed boxes). 3 or 4, default 4. Total slots = fixedTopCount + editableSlotCount.
   */
  quickMenu?: {
    enableDrag?: boolean;
    fixedTopCount?: number;
    editableSlotCount?: number;
  };

  /**
   * Tampilkan item "Atur menu" (Quick Menu Settings) di menu Profil / Pengaturan.
   * Jika false, item ini tidak muncul di daftar menu setting.
   * Default: true (tetap tampil).
   */
  showQuickMenuSettingsInProfile?: boolean;

  /**
   * Beranda (Home) widgets configuration.
   * Widgets shown on Beranda tab - can differ per segment.
   * When not set, uses default: balance-card, quick-access, recent-transactions, news-info.
   */
  berandaWidgets?: BerandaWidgetConfig[];

  // Support configuration
  support?: {
    whatsappNumber?: string; // WhatsApp number for customer support (format: country code + number without +)
    email?: string; // Support email
    phone?: string; // Support phone number
  };
}

export interface MenuItemConfig {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
  route?: string;
  order?: number;
  module?: string;
  feature?: string;
  screen?: string;
}

export interface BrandingConfig {
  logo: string;
  appName: string;
  splashImage?: string;
  primaryColor?: string; // Accent color - Theme Service akan auto-generate primaryLight & primaryDark
}

export interface LoginConfig {
  showSignUp?: boolean; // Show/hide sign up link
  showSocialLogin?: boolean; // Show/hide social login buttons
  socialLoginProviders?: string[]; // List of social login providers (e.g., ['google', 'facebook'])
}

export interface ServiceConfig {
  api: {
    baseUrl: string;
    companyEndpoint?: string;
    timeout?: number;
  };
  auth?: {
    useMock?: boolean;
  };
  features?: {
    pushNotification?: boolean;
    analytics?: boolean;
    crashReporting?: boolean;
  };
}

export interface PluginConfig {
  [key: string]: any;
}

export interface HomeTabConfig {
  id: string;
  label: string;
  component?: string; // Component name to render (optional, defaults to id)
  visible?: boolean; // Default: true
  order?: number; // Order in tabs
}

export interface QrButtonConfig {
  backgroundColor?: string; // Background color of QR button
  iconColor?: string; // Icon color (default: #FAFAFA)
  size?: number; // Button size in dp
}

/**
 * Satu item Akses Cepat (tombol di Beranda).
 * - id: unik (e.g. 'topupva', 'marketplace')
 * - route: nama screen di navigator (e.g. 'TopUp', 'Marketplace')
 * - labelKey: key i18n untuk label (e.g. 'home.topUpVA')
 * - icon: nama icon (e.g. 'topup', 'fnb')
 * - order: urutan tampil (1, 2, 3, ...)
 */
export interface QuickAccessMenuItemConfig {
  id: string;
  route: string;
  labelKey: string;
  icon?: string;
  order?: number;
}

/** Beranda widget config - id maps to widget component, visible & order control display */
export interface BerandaWidgetConfig {
  id: string;
  visible?: boolean;
  order?: number;
}

/**
 * Normalize AppConfig: ensure companyId is generated from companyInitial if not provided
 * 
 * @param config Partial AppConfig (may be missing companyId)
 * @returns Complete AppConfig with companyId auto-generated if missing
 * 
 * @example
 * normalizeAppConfig({ companyInitial: 'TKIFTP', companyName: 'TKIFTP' })
 * // => { companyInitial: 'TKIFTP', companyId: 'tki-ftp', companyName: 'TKIFTP', ... }
 */
export function normalizeAppConfig(config: Partial<AppConfig>): AppConfig {
  if (!config.companyInitial) {
    throw new Error('companyInitial is required');
  }

  // Validate companyInitial format
  const validation = validateCompanyInitial(config.companyInitial);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid companyInitial format');
  }

  // Auto-generate companyId if not provided
  const companyId = config.companyId || toCompanyId(config.companyInitial);

  return {
    ...config,
    companyInitial: config.companyInitial,
    companyId,
  } as AppConfig;
}
