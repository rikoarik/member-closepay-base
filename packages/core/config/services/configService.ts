/**
 * Core Config - Config Service
 * Service untuk load dan manage app configuration
 */

import { AppConfig, MenuItemConfig } from '../types/AppConfig';
import { getTenantConfig } from './tenantService';
import { TenantConfig } from '../tenants';
import { configEventEmitter } from '../utils/configEventEmitter';
import Config from '../../native/Config';
import { logger } from './loggerService';

export interface ConfigService {
  loadConfig(): Promise<AppConfig>;
  getConfig(): AppConfig | null;
  isFeatureEnabled(feature: string): boolean;
  isModuleEnabled(module: string): boolean;
  getMenuConfig(): MenuItemConfig[];
  refreshConfig(force?: boolean): Promise<void>; // Add force parameter untuk bypass cache
  setConfig(config: AppConfig): void; // Add method to set config directly
  getTenantConfig(): TenantConfig | null; // Get tenant config from current app config
}

/**
 * Default config untuk fallback
 * Digunakan ketika config belum di-load dari API/storage
 */
const DEFAULT_CONFIG: AppConfig = {
  companyInitial: 'DEFAULT',
  companyId: 'default',
  companyName: 'Default Company',
  tenantId: 'default',
  segmentId: 'balance-management',
  enabledFeatures: ['balance', 'payment'],
  enabledModules: ['balance', 'payment'],
  menuConfig: [],
  paymentMethods: ['balance'],
  homeVariant: 'dashboard',
  branding: {
    logo: '',
    appName: 'Closepay Merchant',
  },
  login: {
    showSignUp: true,
    showSocialLogin: false,
    socialLoginProviders: ['google'], // Default only Google, no Facebook
  },
  services: {
    api: {
      baseUrl: Config.API_BASE_URL || 'localhost:3000',
      timeout: 30000,
    },
  },
};

class ConfigServiceImpl implements ConfigService {
  private config: AppConfig | null = null;
  private lastRefreshTime: number = 0;

  /**
   * Load config dari API atau local storage
   * @returns Promise yang resolve dengan AppConfig
   * @note Apps sebaiknya call setConfig() dengan config spesifik mereka
   */
  async loadConfig(): Promise<AppConfig> {
    // TODO: Load config from API or local storage
    // For now, return default config as fallback
    // Apps should call setConfig() with their specific config
    if (!this.config) {
      logger.warn('Using default config. Apps should load and set their specific config.');
      this.config = DEFAULT_CONFIG;
    }
    return this.config;
  }

  /**
   * Set config directly (used by apps to load their specific config)
   * Merges tenant config if tenantId is present
   */
  setConfig(config: AppConfig): void {
    // Merge tenant config if tenantId is present
    if (config.tenantId || config.companyId) {
      const tenantId = config.tenantId || config.companyId;
      const tenantConfig = getTenantConfig(tenantId as string);

      if (tenantConfig) {
        // Merge tenant config into app config
        this.config = {
          ...config,
          tenantId: tenantId,
          enabledFeatures: tenantConfig.enabledFeatures,
          homeVariant: tenantConfig.homeVariant || config.homeVariant,
          branding: {
            ...config.branding,
            logo: tenantConfig.theme.logo || config.branding.logo,
            appName: tenantConfig.theme.appName || config.branding.appName,
            // Preserve primaryColor dari app config (tidak di-override oleh tenant)
            primaryColor: config.branding.primaryColor,
          },
        };
        // Emit event untuk notify subscribers
        configEventEmitter.emit(this.config);
        return;
      }
    }

    this.config = config;
    // Emit event untuk notify subscribers
    configEventEmitter.emit(this.config);
  }

  /**
   * Get tenant config from current app config
   */
  getTenantConfig(): TenantConfig | null {
    const config = this.getConfig();
    if (!config) return null;

    const tenantId = config.tenantId || config.companyId;
    if (!tenantId) return null;

    return getTenantConfig(tenantId);
  }

  getConfig(): AppConfig | null {
    return this.config || DEFAULT_CONFIG; // Return default if not set
  }

  isFeatureEnabled(feature: string): boolean {
    const config = this.getConfig();
    if (!config) return false;
    return config.enabledFeatures.includes(feature);
  }

  isModuleEnabled(module: string): boolean {
    const config = this.getConfig();
    if (!config) return false;
    return config.enabledModules.includes(module);
  }

  getMenuConfig(): MenuItemConfig[] {
    const config = this.getConfig();
    if (!config) return [];
    return config.menuConfig.filter(item => item.visible);
  }

  async refreshConfig(force: boolean = false): Promise<void> {
    // Mock mode: skip API, gunakan config yang sudah ada
    const now = Date.now();
    this.lastRefreshTime = now;
    const config = this.getConfig();
    if (config) {
      configEventEmitter.emit(config);
    }
    return Promise.resolve();
  }
}

export const configService: ConfigService = new ConfigServiceImpl();
