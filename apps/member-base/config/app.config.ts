/**
 * Member Base App Configuration
 * 
 * Konfigurasi aplikasi untuk Member Base App.
 * File ini menentukan semua aspek konfigurasi aplikasi termasuk:
 * - Identitas perusahaan dan tenant
 * - Fitur dan modul yang diaktifkan
 * - Konfigurasi UI (tabs, menu, branding)
 * - Konfigurasi layanan (API, auth, features)
 * - Konfigurasi support dan QR button
 */

import type { AppConfig } from '../../../packages/core/config/types/AppConfig';
import Config from '../../../packages/core/native/Config';

export const appConfig: AppConfig = {
  // ============================================================================
  // COMPANY & TENANT IDENTIFICATION
  // ============================================================================
  companyInitial: 'TKIFTP', // Company initial (uppercase) - PRIMARY IDENTIFIER
  companyId: 'tki-ftp', // Company ID (kebab-case) - Auto-generated from companyInitial if not provided
  companyName: 'TKIFTP',
  tenantId: 'tki-ftp',
  segmentId: 'balance-management',

  // ============================================================================
  // FEATURES & MODULES
  // ============================================================================
  enabledFeatures: [], // Feature flags (currently unused)
  enabledModules: [
    'balance',
    'payment',
    'card-transaction',
    'marketplace',
    'marketplace-fnb',
  ],

  // ============================================================================
  // UI CONFIGURATION
  // ============================================================================
  
  // Home screen variant
  homeVariant: 'dashboard', // Options: 'dashboard' | 'simple' | 'member' | 'custom'

  // Home tabs configuration (for member variant)
  // Tabs akan ditampilkan di home screen dengan urutan sesuai order
  homeTabs: [
    {
      id: 'analytics',
      label: 'F&B',
      visible: true,
      order: 1,
    },
    {
      id: 'beranda',
      label: 'Beranda',
      visible: true,
      order: 2,
    },
    {
      id: 'virtualcard',
      label: 'Kartu Virtual',
      visible: true,
      order: 3,
    },
   
  ],

  // Menu configuration (bottom navigation / drawer menu)
  menuConfig: [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      route: 'Home',
      visible: true,
      order: 2,
    },
  ],

  // QR Button configuration
  showQrButton: true, // Show/hide QR scan button on home screen

  // Akses Cepat (Quick Access) - hanya untuk member balance-management
  quickAccessMenu: [
    { id: 'topupva', route: 'VirtualAccount', labelKey: 'home.topUpVA', icon: 'topup', order: 1 },
    { id: 'transfermember', route: 'TransferMember', labelKey: 'home.transferMember', icon: 'guest', order: 2 },
    { id: 'kartuvirtual', route: 'VirtualCard', labelKey: 'home.kartuVirtual', icon: 'payment', order: 3 },
    { id: 'transferbank', route: 'Withdraw', labelKey: 'home.transferBank', icon: 'withdraw', order: 4 },
    { id: 'marketplace', route: 'Marketplace', labelKey: 'home.marketplace', icon: 'marketplace', order: 5 },
    { id: 'fnb', route: 'FnB', labelKey: 'home.fnb', icon: 'fnb', order: 6 },
  ],

  // ============================================================================
  // BRANDING
  // ============================================================================
  branding: {
    logo: 'assets/logo.png', // Logo path (relative path or URL)
    appName: 'Member Base App',
    primaryColor: '#076409', // Accent color - digunakan untuk semua warna interaktif (button, indicator, active states)
  },

  // ============================================================================
  // BALANCE CARD COLORS CONFIGURATION
  // ============================================================================
  /**
   * Background colors for different balance card types.
   * Maps balance account title to background color.
   * If not specified, uses branding.primaryColor as default.
   */
  balanceCardColors: {
    'Saldo Utama': '#076409', // Green (default/primary)
    'Saldo Plafon': '#3B82F6', // Blue
    'Saldo Makan': '#10B981', // Green (lighter shade)
  },

  // ============================================================================
  // PAYMENT CONFIGURATION
  // ============================================================================
  paymentMethods: [
    'balance',
    'bank_transfer',
    'virtual_account',
  ],

  // ============================================================================
  // AUTHENTICATION CONFIGURATION
  // ============================================================================
  login: {
    showSignUp: true, // Show/hide sign up link
    showSocialLogin: true, // Show/hide social login buttons
    socialLoginProviders: ['google'], // Available providers: 'google' (Facebook tidak didukung)
  },

  // ============================================================================
  // SERVICES CONFIGURATION
  // ============================================================================
  services: {
    // API Configuration
    api: {
      // Base URL dari environment variable (.env.staging atau .env.production)
      // Fallback ke production URL untuk safety
      baseUrl: Config.API_BASE_URL || 'https://api.solusiuntuknegeri.com',
      timeout: 30000, // Request timeout dalam milliseconds
    },

    // Authentication Service
    auth: {
      useMock: true, // Gunakan mock data (no API calls) untuk development
    },

    // Feature Flags
    features: {
      pushNotification: true, // Enable push notifications
      analytics: true, // Enable analytics tracking
      crashReporting: false, // Enable crash reporting
    },
  },

  // ============================================================================
  // SUPPORT CONFIGURATION
  // ============================================================================
  support: {
    whatsappNumber: Config.SUPPORT_WHATSAPP_NUMBER || '6289526643223', // Format: country code + number tanpa +
    email: Config.SUPPORT_EMAIL || 'support@closepay.com',
  },
};
