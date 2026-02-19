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
    'sport-center',
    'invoice',
    'donasi-zakat',
  ],

  // ============================================================================
  // UI CONFIGURATION
  // ============================================================================
  
  // Home screen variant
  homeVariant: 'dashboard', // Options: 'dashboard' | 'simple' | 'member' | 'custom'

  // Home tabs configuration (for member variant)
  // Tabs akan ditampilkan di home screen dengan urutan sesuai order
  // 35+ kombinasi tab untuk berbagai kebutuhan
  homeTabs: [
    // ========== BERANDA & DASHBOARD ==========
    {
      id: 'beranda',
      label: 'Beranda',
      visible: true,
      order: 1,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      visible: false,
      order: 2,
    },
    
    // ========== MARKETPLACE - GENERAL ==========
    {
      id: 'marketplace',
      label: 'Marketplace',
      visible: true,
      order: 3,
    },
    {
      id: 'marketplace-general',
      label: 'Belanja',
      visible: false,
      order: 4,
    },
    {
      id: 'marketplace-balance',
      label: 'Market Saldo',
      visible: false,
      order: 5,
    },
    {
      id: 'marketplace-transaction',
      label: 'Transaksi Market',
      visible: false,
      order: 6,
    },
    
    // ========== MARKETPLACE - F&B ==========
    {
      id: 'analytics',
      label: 'F&B',
      visible: true,
      order: 7,
    },
    {
      id: 'fnb',
      label: 'Food & Beverage',
      visible: false,
      order: 8,
    },
    {
      id: 'fnb-order',
      label: 'Pesan Makanan',
      visible: false,
      order: 9,
    },
    {
      id: 'fnb-history',
      label: 'Riwayat F&B',
      visible: false,
      order: 10,
    },
    {
      id: 'fnb-balance',
      label: 'Saldo F&B',
      visible: false,
      order: 11,
    },
    
    // ========== BALANCE & SALDO ==========
    {
      id: 'balance',
      label: 'Saldo',
      visible: false,
      order: 12,
    },
    {
      id: 'balance-main',
      label: 'Saldo Utama',
      visible: false,
      order: 13,
    },
    {
      id: 'balance-plafon',
      label: 'Saldo Plafon',
      visible: false,
      order: 14,
    },
    {
      id: 'balance-meal',
      label: 'Saldo Makan',
      visible: false,
      order: 15,
    },
    {
      id: 'balance-history',
      label: 'Riwayat Saldo',
      visible: false,
      order: 16,
    },
    {
      id: 'balance-transfer',
      label: 'Transfer Saldo',
      visible: false,
      order: 17,
    },
    {
      id: 'balance-topup',
      label: 'Top Up',
      visible: false,
      order: 18,
    },
    
    // ========== VIRTUAL CARD ==========
    {
      id: 'sport-center',
      label: 'Sport Center',
      visible: false,
      order: 18,
    },
    {
      id: 'virtualcard',
      label: 'Kartu Virtual',
      visible: true,
      order: 19,
    },
    {
      id: 'card-detail',
      label: 'Detail Kartu',
      visible: false,
      order: 20,
    },
    {
      id: 'card-transaction',
      label: 'Transaksi Kartu',
      visible: false,
      order: 21,
    },
    {
      id: 'card-topup',
      label: 'Isi Ulang Kartu',
      visible: false,
      order: 22,
    },
    {
      id: 'card-limit',
      label: 'Limit Kartu',
      visible: false,
      order: 23,
    },
    
    // ========== PAYMENT & PEMBAYARAN ==========
    {
      id: 'payment',
      label: 'Pembayaran',
      visible: false,
      order: 24,
    },
    {
      id: 'payment-qris',
      label: 'Bayar QRIS',
      visible: false,
      order: 25,
    },
    {
      id: 'payment-transfer',
      label: 'Transfer',
      visible: false,
      order: 26,
    },
    {
      id: 'payment-va',
      label: 'Virtual Account',
      visible: false,
      order: 27,
    },
    {
      id: 'payment-bank',
      label: 'Transfer Bank',
      visible: false,
      order: 28,
    },
    {
      id: 'payment-member',
      label: 'Transfer Member',
      visible: false,
      order: 29,
    },
    
    // ========== TRANSACTIONS & HISTORY ==========
    {
      id: 'transactions',
      label: 'Transaksi',
      visible: false,
      order: 30,
    },
    {
      id: 'transaction-history',
      label: 'Riwayat Transaksi',
      visible: false,
      order: 31,
    },
    {
      id: 'transaction-all',
      label: 'Semua Transaksi',
      visible: false,
      order: 32,
    },
    {
      id: 'transaction-card',
      label: 'Transaksi Kartu',
      visible: false,
      order: 33,
    },
    {
      id: 'transaction-payment',
      label: 'Transaksi Bayar',
      visible: false,
      order: 34,
    },
    {
      id: 'transaction-marketplace',
      label: 'Transaksi Belanja',
      visible: false,
      order: 35,
    },
    
    // ========== PROMO & REWARDS ==========
    {
      id: 'promo',
      label: 'Promo',
      visible: false,
      order: 36,
    },
    {
      id: 'rewards',
      label: 'Hadiah',
      visible: false,
      order: 37,
    },
    {
      id: 'voucher',
      label: 'Voucher',
      visible: false,
      order: 38,
    },
    {
      id: 'cashback',
      label: 'Cashback',
      visible: false,
      order: 39,
    },
    
    // ========== PROFILE & SETTINGS ==========
    {
      id: 'profile',
      label: 'Profil',
      visible: false,
      order: 40,
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      visible: false,
      order: 41,
    },
    {
      id: 'account',
      label: 'Akun Saya',
      visible: false,
      order: 42,
    },
    
    // ========== ANALYTICS & REPORTS ==========
    {
      id: 'analytics-dashboard',
      label: 'Analitik',
      visible: false,
      order: 43,
    },
    {
      id: 'reports',
      label: 'Laporan',
      visible: false,
      order: 44,
    },
    {
      id: 'statistics',
      label: 'Statistik',
      visible: false,
      order: 45,
    },
    
    // ========== QUICK ACTIONS ==========
    {
      id: 'withdraw',
      label: 'Tarik Tunai',
      visible: false,
      order: 46,
    },
    {
      id: 'scan-qr',
      label: 'Scan QR',
      visible: false,
      order: 47,
    },
    {
      id: 'request-money',
      label: 'Minta Uang',
      visible: false,
      order: 48,
    },
    {
      id: 'split-bill',
      label: 'Patungan',
      visible: false,
      order: 49,
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
    {
      id: 'sport-center',
      label: 'Sport Center',
      icon: 'sportcenter',
      route: 'SportCenter',
      visible: true,
      order: 3,
    },
  ],

  // QR Button configuration
  showQrButton: true, // Show/hide QR scan button on home screen

  // Beranda widgets - bisa diatur on/off dan urutan di Profile > Pengaturan Tab Beranda
  berandaWidgets: [
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
    { id: 'invoice-featured', visible: true, order: 17 },
  ],

  // Akses Cepat (Quick Access) - hanya untuk member balance-management
  quickAccessMenu: [
    { id: 'topupva', route: 'VirtualAccount', labelKey: 'home.topUpVA', icon: 'topup', order: 1 },
    { id: 'transfermember', route: 'TransferMember', labelKey: 'home.transferMember', icon: 'guest', order: 2 },
    { id: 'kartuvirtual', route: 'VirtualCard', labelKey: 'home.kartuVirtual', icon: 'payment', order: 3 },
    { id: 'transferbank', route: 'Withdraw', labelKey: 'home.transferBank', icon: 'withdraw', order: 4 },
    { id: 'marketplace', route: 'Marketplace', labelKey: 'home.marketplace', icon: 'marketplace', order: 5 },
    { id: 'fnb', route: 'FnB', labelKey: 'home.fnb', icon: 'fnb', order: 6 },
    { id: 'sportcenter', route: 'SportCenter', labelKey: 'home.sportCenter', icon: 'sportcenter', order: 7 },
    { id: 'invoice', route: 'Invoice', labelKey: 'home.invoice', icon: 'invoice', order: 8 },
    { id: 'donasizakat', route: 'DonationHub', labelKey: 'home.donasiZakat', icon: 'heart', order: 9 },
  ],

  // Atur fitur pilihan: drag-to-reorder (enableDrag), fixed top slots (fixedTopCount)
  quickMenu: {
    enableDrag: true,
    fixedTopCount: 3,
  },

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
