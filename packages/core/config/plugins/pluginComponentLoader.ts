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
    TransactionHistoryScreen: () => import('../../../plugins/balance/components/screens/TransactionHistoryScreen'),
    WithdrawIcon: () => import('../../../plugins/balance/components/ui/WithdrawIcon'),
    TopUpIcon: () => import('../../../plugins/balance/components/ui/TopUpIcon'),
    BalanceCard: () => import('../../../plugins/balance/components/ui/BalanceCard'),
    BalanceDetailScreen: () => import('../../../plugins/balance/components/screens/BalanceDetailScreen'),
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
    TransferMemberPinBottomSheet: () => import('../../../plugins/payment/components/transfer-member/TransferMemberPinBottomSheet'),
    TransferMemberSummaryBottomSheet: () => import('../../../plugins/payment/components/transfer-member/TransferMemberSummaryBottomSheet'),
    TapKartuSummaryScreen: () => import('../../../plugins/payment/components/topup/TapKartuSummaryScreen'),
    QrScreen: () => import('../../../plugins/payment/components/qr/QrScreen'),
    EditQuickAmountScreen: () => import('../../../plugins/payment/components/qr/EditQuickAmountScreen'),
    PinInput: () => import('../../../plugins/payment/components/shared/PinInput'),
    WithdrawConfirmModal: () => import('../../../plugins/payment/components/withdraw/WithdrawConfirmModal'),
    AutoWithdrawModal: () => import('../../../plugins/payment/components/withdraw/AutoWithdrawModal'),
  },
  'marketplace': {
    MarketplaceScreen: () => import('../../../plugins/marketplace/components/screens/MarketplaceScreen'),
    SearchScreen: () => import('../../../plugins/marketplace/components/screens/SearchScreen'),
    SearchResultsScreen: () => import('../../../plugins/marketplace/components/screens/SearchResultsScreen'),
    CartScreen: () => import('../../../plugins/marketplace/components/screens/CartScreen'),
    ProductDetailScreen: () => import('../../../plugins/marketplace/components/screens/ProductDetailScreen'),
    CheckoutScreen: () => import('../../../plugins/marketplace/components/screens/CheckoutScreen'),
    ProductCard: () => import('../../../plugins/marketplace/components/shared/ProductCard'),
    ProductCardSkeleton: () => import('../../../plugins/marketplace/components/shared/ProductCardSkeleton'),
    StoreDetailScreen: () => import('../../../plugins/marketplace/components/screens/StoreDetailScreen'),
    CartBar: () => import('../../../plugins/marketplace/components/shared/CartBar'),
  },
  'marketplace-fnb': {
    FnBMerchantDetailScreen: () => import('../../../plugins/marketplace-fnb/components/screens/FnBMerchantDetailScreen'),
    FnBScreen: () => import('../../../plugins/marketplace-fnb/components/screens/FnBScreen'),
    FnBCheckoutScreen: () => import('../../../plugins/marketplace-fnb/components/screens/FnBCheckoutScreen'),
    FnBScanScreen: () => import('../../../plugins/marketplace-fnb/components/screens/FnBScanScreen'),
    FnBItemCard: () => import('../../../plugins/marketplace-fnb/components/shared/FnBItemCard'),
    FnBCategoryTabs: () => import('../../../plugins/marketplace-fnb/components/shared/FnBCategoryTabs'),
    FnBCartBar: () => import('../../../plugins/marketplace-fnb/components/shared/FnBCartBar'),
    FnBItemDetailSheet: () => import('../../../plugins/marketplace-fnb/components/shared/FnBItemDetailSheet'),
    MerchantHeader: () => import('../../../plugins/marketplace-fnb/components/shared/MerchantHeader'),
    FnBFavoritesScreen: () => import('../../../plugins/marketplace-fnb/components/screens/FnBFavoritesScreen'),
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

  // Check if component is exported (check both components and screens)
  const exports = plugin.exports;
  const isScreen = exports.screens && Object.values(exports.screens).includes(componentName);
  const isComponent = exports.components?.includes(componentName);

  if (!isScreen && !isComponent) {
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

