/**
 * Plugin Component Loader
 * Dynamic component loading for plugin components
 * Uses static mapping for Metro bundler compatibility
 * 
 * Component paths are managed in componentLoaderPaths.ts for easier maintenance.
 * To add new components, either:
 * - Edit componentLoaderPaths.ts manually
 * - Run `npm run generate:loaders` to auto-generate from plugin manifests
 * 
 * See PLUGIN_LOADERS.md for detailed documentation.
 */

import { TransferMemberPinBottomSheet } from '@plugins/payment/components/transfer-member';
import { PluginRegistry } from './PluginRegistry';
import type { PluginManifest } from './types';
import React from 'react';

/**
 * Static component loader map for Metro bundler compatibility
 * Metro requires static string literals for dynamic imports
 * This map is generated from COMPONENT_LOADER_PATHS but uses static imports
 */
const STATIC_COMPONENT_LOADERS: Record<string, Record<string, () => Promise<any>>> = {
  balance: {
    BalanceDetailScreen: () => import('../../../plugins/balance/components/screens/BalanceDetailScreen'),
    TransactionHistoryScreen: () => import('../../../plugins/balance/components/screens/TransactionHistoryScreen'),
    WithdrawIcon: () => import('../../../plugins/balance/components/ui/WithdrawIcon'),
    TopUpIcon: () => import('../../../plugins/balance/components/ui/TopUpIcon'),
    BalanceCard: () => import('../../../plugins/balance/components/ui/BalanceCard'),
    BalanceTab: () => import('../../../plugins/balance/components/tabs/BalanceTab'),
    BalanceMainTab: () => import('../../../plugins/balance/components/tabs/BalanceMainTab'),
    BalancePlafonTab: () => import('../../../plugins/balance/components/tabs/BalancePlafonTab'),
    BalanceMealTab: () => import('../../../plugins/balance/components/tabs/BalanceMealTab'),
    BalanceHistoryTab: () => import('../../../plugins/balance/components/tabs/BalanceHistoryTab'),
    BalanceTransferTab: () => import('../../../plugins/balance/components/tabs/BalanceTransferTab'),
    BalanceTopupTab: () => import('../../../plugins/balance/components/tabs/BalanceTopupTab'),
    TransactionHistoryTab: () => import('../../../plugins/balance/components/tabs/TransactionHistoryTab'),
    TransactionAllTab: () => import('../../../plugins/balance/components/tabs/TransactionAllTab'),
    TransactionCardTab: () => import('../../../plugins/balance/components/tabs/TransactionCardTab'),
    ActivitySummary: () => import('../../../plugins/balance/components/widgets/ActivitySummary'),
    SavingsGoal: () => import('../../../plugins/balance/components/widgets/SavingsGoal'),
    RecentTransactions: () => import('../../../plugins/balance/components/widgets/RecentTransactions'),
  },
  'card-transaction': {
    VirtualCardScreen: () => import('../../../plugins/card-transaction/components/screens/VirtualCardScreen'),
    VirtualCardDetailScreen: () => import('../../../plugins/card-transaction/components/screens/VirtualCardDetailScreen'),
    AddVirtualCardScreen: () => import('../../../plugins/card-transaction/components/screens/AddVirtualCardScreen'),
    VirtualCardTab: () => import('../../../plugins/card-transaction/components/tabs/VirtualCardTab'),
    CardDetailTab: () => import('../../../plugins/card-transaction/components/tabs/CardDetailTab'),
    CardTransactionTab: () => import('../../../plugins/card-transaction/components/tabs/CardTransactionTab'),
    CardLimitTab: () => import('../../../plugins/card-transaction/components/tabs/CardLimitTab'),
    CardTopupTab: () => import('../../../plugins/card-transaction/components/tabs/CardTopupTab'),
    CardSummary: () => import('../../../plugins/card-transaction/components/widgets/CardSummary'),
  },
  'donasi-zakat': {
    DonationHubScreen: () => import('../../../plugins/donasi-zakat/components/screens/DonationHubScreen'),
    CampaignDetailScreen: () => import('../../../plugins/donasi-zakat/components/screens/CampaignDetailScreen'),
    DonationInputScreen: () => import('../../../plugins/donasi-zakat/components/screens/DonationInputScreen'),
    DonationHistoryScreen: () => import('../../../plugins/donasi-zakat/components/screens/DonationHistoryScreen'),
    ZakatCalculatorScreen: () => import('../../../plugins/donasi-zakat/components/screens/ZakatCalculatorScreen'),
    ZakatInputScreen: () => import('../../../plugins/donasi-zakat/components/screens/ZakatInputScreen'),
    DonationListScreen: () => import('../../../plugins/donasi-zakat/components/screens/DonationListScreen'),
    DonorListScreen: () => import('../../../plugins/donasi-zakat/components/screens/DonorListScreen'),
  },
  invoice: {
    InvoiceScreen: () => import('../../../plugins/invoice/components/screens/InvoiceScreen'),
    InvoiceListScreen: () => import('../../../plugins/invoice/components/screens/InvoiceListScreen'),
    InvoiceDetailScreen: () => import('../../../plugins/invoice/components/screens/InvoiceDetailScreen'),
    InvoiceCreateScreen: () => import('../../../plugins/invoice/components/screens/InvoiceCreateScreen'),
    InvoicePaymentScreen: () => import('../../../plugins/invoice/components/screens/InvoicePaymentScreen'),
    InvoicePaymentSuccessScreen: () => import('../../../plugins/invoice/components/screens/InvoicePaymentSuccessScreen'),
    InvoiceTab: () => import('../../../plugins/invoice/components/tabs/InvoiceTab'),
    InvoiceFeatured: () => import('../../../plugins/invoice/components/widgets/InvoiceFeatured'),
  },
  marketplace: {
    ProductCard: () => import('../../../plugins/marketplace/components/shared/ProductCard'),
    ProductCardSkeleton: () => import('../../../plugins/marketplace/components/shared/ProductCardSkeleton'),
    CartBar: () => import('../../../plugins/marketplace/components/shared/CartBar'),
    StoreCard: () => import('../../../plugins/marketplace/components/shared/StoreCard'),
    MarketplaceScreen: () => import('../../../plugins/marketplace/components/screens/MarketplaceScreen'),
    SearchScreen: () => import('../../../plugins/marketplace/components/screens/SearchScreen'),
    SearchResultsScreen: () => import('../../../plugins/marketplace/components/screens/SearchResultsScreen'),
    CartScreen: () => import('../../../plugins/marketplace/components/screens/CartScreen'),
    ProductDetailScreen: () => import('../../../plugins/marketplace/components/screens/ProductDetailScreen'),
    StoreDetailScreen: () => import('../../../plugins/marketplace/components/screens/StoreDetailScreen'),
    CheckoutScreen: () => import('../../../plugins/marketplace/components/screens/CheckoutScreen'),
    MarketplaceTab: () => import('../../../plugins/marketplace/components/tabs/MarketplaceTab'),
    MarketplaceGeneralTab: () => import('../../../plugins/marketplace/components/tabs/MarketplaceGeneralTab'),
    MarketplaceBalanceTab: () => import('../../../plugins/marketplace/components/tabs/MarketplaceBalanceTab'),
    MarketplaceTransactionTab: () => import('../../../plugins/marketplace/components/tabs/MarketplaceTransactionTab'),
    MarketplaceFeatured: () => import('../../../plugins/marketplace/components/widgets/MarketplaceFeatured'),
  },
  'marketplace-fnb': {
    FnBItemCard: () => import('../../../plugins/marketplace-fnb/components/shared/FnBItemCard'),
    FnBCategoryTabs: () => import('../../../plugins/marketplace-fnb/components/shared/FnBCategoryTabs'),
    FnBCartBar: () => import('../../../plugins/marketplace-fnb/components/shared/FnBCartBar'),
    FnBItemDetailSheet: () => import('../../../plugins/marketplace-fnb/components/shared/FnBItemDetailSheet'),
    MerchantHeader: () => import('../../../plugins/marketplace-fnb/components/shared/MerchantHeader'),
    FnBFavoritesScreen: () => import('../../../plugins/marketplace-fnb/components/screens/FnBFavoritesScreen'),
    FnBScreen: () => import('../../../plugins/marketplace-fnb/components/screens/FnBScreen'),
    FnBMerchantDetailScreen: () => import('../../../plugins/marketplace-fnb/components/screens/FnBMerchantDetailScreen'),
    FnBCheckoutScreen: () => import('../../../plugins/marketplace-fnb/components/screens/FnBCheckoutScreen'),
    FnBScanScreen: () => import('../../../plugins/marketplace-fnb/components/screens/FnBScanScreen'),
    FnBTab: () => import('../../../plugins/marketplace-fnb/components/tabs/FnBTab'),
    FnBOrderTab: () => import('../../../plugins/marketplace-fnb/components/tabs/FnBOrderTab'),
    FnBHistoryTab: () => import('../../../plugins/marketplace-fnb/components/tabs/FnBHistoryTab'),
    FnBBalanceTab: () => import('../../../plugins/marketplace-fnb/components/tabs/FnBBalanceTab'),
    FnBRecentOrders: () => import('../../../plugins/marketplace-fnb/components/widgets/FnBRecentOrders'),
  },
  payment: {
    TopUpScreen: () => import('../../../plugins/payment/components/topup/TopUpScreen'),
    VirtualAccountScreen: () => import('../../../plugins/payment/components/virtual-account/VirtualAccountScreen'),
    WithdrawScreen: () => import('../../../plugins/payment/components/withdraw/WithdrawScreen'),
    WithdrawSuccessScreen: () => import('../../../plugins/payment/components/withdraw/WithdrawSuccessScreen'),
    TopUpMemberScreen: () => import('../../../plugins/payment/components/topup/TopUpMemberScreen'),
    TopUpMemberSummaryScreen: () => import('../../../plugins/payment/components/topup/TopUpMemberSummaryScreen'),
    TopUpMemberPinScreen: () => import('../../../plugins/payment/components/topup/TopUpMemberPinScreen'),
    TopUpMemberSuccessScreen: () => import('../../../plugins/payment/components/topup/TopUpMemberSuccessScreen'),
    TransferMemberScreen: () => import('../../../plugins/payment/components/transfer-member/TransferMemberScreen'),
    TransferMemberSuccessScreen: () => import('../../../plugins/payment/components/transfer-member/TransferMemberSuccessScreen'),
    TapKartuSummaryScreen: () => import('../../../plugins/payment/components/topup/TapKartuSummaryScreen'),
    QrScreen: () => import('../../../plugins/payment/components/qr/QrScreen'),
    EditQuickAmountScreen: () => import('../../../plugins/payment/components/qr/EditQuickAmountScreen'),
    PinInput: () => import('../../../plugins/payment/components/shared/PinInput'),
    WithdrawConfirmModal: () => import('../../../plugins/payment/components/withdraw/WithdrawConfirmModal'),
    AutoWithdrawModal: () => import('../../../plugins/payment/components/withdraw/AutoWithdrawModal'),
    PaymentTab: () => import('../../../plugins/payment/components/tabs/PaymentTab'),
    PaymentQrisTab: () => import('../../../plugins/payment/components/tabs/PaymentQrisTab'),
    PaymentTransferTab: () => import('../../../plugins/payment/components/tabs/PaymentTransferTab'),
    PaymentVATab: () => import('../../../plugins/payment/components/tabs/PaymentVATab'),
    PaymentBankTab: () => import('../../../plugins/payment/components/tabs/PaymentBankTab'),
    PaymentMemberTab: () => import('../../../plugins/payment/components/tabs/PaymentMemberTab'),
  },
  'sport-center': {
    SportCenterScreen: () => import('../../../plugins/sport-center/components/screens/SportCenterScreen'),
    SportCenterFacilityDetailScreen: () => import('../../../plugins/sport-center/components/screens/SportCenterFacilityDetailScreen'),
    SportCenterBookingScreen: () => import('../../../plugins/sport-center/components/screens/SportCenterBookingScreen'),
    SportCenterCheckoutScreen: () => import('../../../plugins/sport-center/components/screens/SportCenterCheckoutScreen'),
    SportCenterMyBookingsScreen: () => import('../../../plugins/sport-center/components/screens/SportCenterMyBookingsScreen'),
    SportCenterSearchScreen: () => import('../../../plugins/sport-center/components/screens/SportCenterSearchScreen'),
    SportCenterSearchResultsScreen: () => import('../../../plugins/sport-center/components/screens/SportCenterSearchResultsScreen'),
    SportCenterBookingCheckoutScreen: () => import('../../../plugins/sport-center/components/screens/SportCenterBookingCheckoutScreen'),
    SportCenterExploreScreen: () => import('../../../plugins/sport-center/components/screens/SportCenterExploreScreen'),
    SportCenterWishlistScreen: () => import('../../../plugins/sport-center/components/screens/SportCenterWishlistScreen'),
    SportCenterTab: () => import('../../../plugins/sport-center/components/tabs/SportCenterTab'),
    SportCenterFeatured: () => import('../../../plugins/sport-center/components/widgets/SportCenterFeatured'),
  },
};

/**
 * Generate component loader function from static mapping
 * 
 * @param pluginId - Plugin identifier
 * @param componentName - Component name
 * @returns Function that returns a Promise resolving to the component module
 */
function generateComponentLoader(pluginId: string, componentName: string): () => Promise<any> {
  // Access STATIC_COMPONENT_LOADERS using bracket notation to handle plugin IDs with dashes
  // Keys with dashes are quoted in the object literal (e.g., 'marketplace-fnb')
  // but can be accessed using bracket notation with the string value
  const pluginLoaders = STATIC_COMPONENT_LOADERS[pluginId];
  if (!pluginLoaders) {
    throw new Error(`No loader paths found for plugin: ${pluginId}`);
  }

  const loader = pluginLoaders[componentName];
  if (!loader) {
    throw new Error(`No loader path found for component ${componentName} in plugin ${pluginId}`);
  }

  return loader;
}

/**
 * Load plugin component dynamically
 * @param pluginId - Plugin identifier
 * @param componentName - Component name to load
 * @returns Promise resolving to React component
 */
export async function loadPluginComponent(
  pluginId: string,
  componentName: string
): Promise<React.ComponentType<any>> {
  // Check if plugin is enabled
  if (!PluginRegistry.isPluginEnabled(pluginId)) {
    throw new Error(`Plugin ${pluginId} is not enabled`);
  }

  // Get plugin manifest
  const plugin = PluginRegistry.getPlugin(pluginId);
  if (!plugin) {
    throw new Error(`Plugin ${pluginId} not found`);
  }

  // Check if component is exported (screens, components, tabs, widgets)
  const exports = plugin.exports;
  const isScreen = exports.screens && Object.values(exports.screens).includes(componentName);
  const isComponent = exports.components?.includes(componentName);
  const isTab = exports.tabs && Object.values(exports.tabs).includes(componentName);
  const isWidget = exports.widgets && Object.values(exports.widgets).includes(componentName);

  if (!isScreen && !isComponent && !isTab && !isWidget) {
    throw new Error(`Component ${componentName} not exported by plugin ${pluginId}`);
  }

  // Generate loader dynamically from manifest
  const loader = generateComponentLoader(pluginId, componentName);

  try {
    const module = await loader();
    const Component = module[componentName] || module.default;

    if (!Component) {
      throw new Error(`Component ${componentName} not found in module for plugin ${pluginId}`);
    }

    return Component;
  } catch (error) {
    console.error(`Failed to load component ${pluginId}.${componentName}:`, error);
    throw error;
  }
}

/**
 * Get lazy component loader function for React.lazy
 * @param pluginId - Plugin identifier
 * @param componentName - Component name
 * @returns Loader function compatible with React.lazy
 */
export function getPluginComponentLoader(
  pluginId: string,
  componentName: string
): () => Promise<{ default: React.ComponentType<any> }> {
  return async () => {
    const Component = await loadPluginComponent(pluginId, componentName);
    return { default: Component };
  };
}

/**
 * Get all available component loaders for a plugin
 * @param pluginId - Plugin identifier
 * @returns Record of componentName -> loader function
 */
export function getPluginComponentLoaders(
  pluginId: string
): Record<string, () => Promise<any>> {
  const plugin = PluginRegistry.getPlugin(pluginId);
  if (!plugin) {
    return {};
  }

  const loaders: Record<string, () => Promise<any>> = {};
  const componentNames = plugin.exports.components || [];

  componentNames.forEach(componentName => {
    loaders[componentName] = generateComponentLoader(pluginId, componentName);
  });

  return loaders;
}

