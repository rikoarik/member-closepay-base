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
   * Quick Access (Akses Cepat) menu items for home screen.
   * When set, only these items are shown; order preserved.
   * Used e.g. for member balance-management: topupva, transfermember, kartu virtual, transferbank.
   */
  quickAccessMenu?: QuickAccessMenuItemConfig[];

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

/** Single item for Akses Cepat: id (unique), route (screen name), labelKey (i18n key) */
export interface QuickAccessMenuItemConfig {
  id: string;
  route: string;
  labelKey: string;
  icon?: string;
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
