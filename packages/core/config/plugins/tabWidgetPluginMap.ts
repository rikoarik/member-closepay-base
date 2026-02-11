/**
 * Tab and Widget to Plugin Mapping
 * Maps tab IDs and widget IDs to their plugin and component for dynamic loading.
 * Add entries as components are migrated to plugins.
 */

export interface TabWidgetPluginMapping {
  pluginId: string;
  componentName: string;
}

export const TAB_TO_PLUGIN_MAP: Record<string, TabWidgetPluginMapping> = {
  'sport-center': { pluginId: 'sport-center', componentName: 'SportCenterTab' },
  'fnb': { pluginId: 'marketplace-fnb', componentName: 'FnBTab' },
  'fnb-order': { pluginId: 'marketplace-fnb', componentName: 'FnBOrderTab' },
  'fnb-history': { pluginId: 'marketplace-fnb', componentName: 'FnBHistoryTab' },
  'fnb-balance': { pluginId: 'marketplace-fnb', componentName: 'FnBBalanceTab' },
  'marketplace': { pluginId: 'marketplace', componentName: 'MarketplaceTab' },
  'marketplace-general': { pluginId: 'marketplace', componentName: 'MarketplaceGeneralTab' },
  'marketplace-balance': { pluginId: 'marketplace', componentName: 'MarketplaceBalanceTab' },
  'marketplace-transaction': { pluginId: 'marketplace', componentName: 'MarketplaceTransactionTab' },
  'virtualcard': { pluginId: 'card-transaction', componentName: 'VirtualCardTab' },
  'kartu-virtual': { pluginId: 'card-transaction', componentName: 'VirtualCardTab' },
  'card-detail': { pluginId: 'card-transaction', componentName: 'CardDetailTab' },
  'detail-kartu': { pluginId: 'card-transaction', componentName: 'CardDetailTab' },
  'card-transaction': { pluginId: 'card-transaction', componentName: 'CardTransactionTab' },
  'transaksi-kartu': { pluginId: 'card-transaction', componentName: 'CardTransactionTab' },
  'card-limit': { pluginId: 'card-transaction', componentName: 'CardLimitTab' },
  'limit-kartu': { pluginId: 'card-transaction', componentName: 'CardLimitTab' },
  'card-topup': { pluginId: 'card-transaction', componentName: 'CardTopupTab' },
  'balance': { pluginId: 'balance', componentName: 'BalanceTab' },
  'saldo': { pluginId: 'balance', componentName: 'BalanceTab' },
  'balance-main': { pluginId: 'balance', componentName: 'BalanceMainTab' },
  'saldo-utama': { pluginId: 'balance', componentName: 'BalanceMainTab' },
  'balance-plafon': { pluginId: 'balance', componentName: 'BalancePlafonTab' },
  'saldo-plafon': { pluginId: 'balance', componentName: 'BalancePlafonTab' },
  'balance-meal': { pluginId: 'balance', componentName: 'BalanceMealTab' },
  'saldo-makan': { pluginId: 'balance', componentName: 'BalanceMealTab' },
  'balance-history': { pluginId: 'balance', componentName: 'BalanceHistoryTab' },
  'riwayat-saldo': { pluginId: 'balance', componentName: 'BalanceHistoryTab' },
  'balance-transfer': { pluginId: 'balance', componentName: 'BalanceTransferTab' },
  'transfer-saldo': { pluginId: 'balance', componentName: 'BalanceTransferTab' },
  'balance-topup': { pluginId: 'balance', componentName: 'BalanceTopupTab' },
  'topup-saldo': { pluginId: 'balance', componentName: 'BalanceTopupTab' },
  'transaction-history': { pluginId: 'balance', componentName: 'TransactionHistoryTab' },
  'riwayat-transaksi': { pluginId: 'balance', componentName: 'TransactionHistoryTab' },
  'transaction-all': { pluginId: 'balance', componentName: 'TransactionAllTab' },
  'semua-transaksi': { pluginId: 'balance', componentName: 'TransactionAllTab' },
  'transaction-card': { pluginId: 'balance', componentName: 'TransactionCardTab' },
  'transaksi-kartu-only': { pluginId: 'balance', componentName: 'TransactionCardTab' },
  'payment': { pluginId: 'payment', componentName: 'PaymentTab' },
  'pembayaran': { pluginId: 'payment', componentName: 'PaymentTab' },
  'payment-qris': { pluginId: 'payment', componentName: 'PaymentQrisTab' },
  'bayar-qris': { pluginId: 'payment', componentName: 'PaymentQrisTab' },
  'payment-transfer': { pluginId: 'payment', componentName: 'PaymentTransferTab' },
  'bayar-transfer': { pluginId: 'payment', componentName: 'PaymentTransferTab' },
  'payment-va': { pluginId: 'payment', componentName: 'PaymentVATab' },
  'bayar-va': { pluginId: 'payment', componentName: 'PaymentVATab' },
  'payment-bank': { pluginId: 'payment', componentName: 'PaymentBankTab' },
  'bayar-bank': { pluginId: 'payment', componentName: 'PaymentBankTab' },
  'payment-member': { pluginId: 'payment', componentName: 'PaymentMemberTab' },
  'bayar-member': { pluginId: 'payment', componentName: 'PaymentMemberTab' },
};

export const WIDGET_TO_PLUGIN_MAP: Record<string, TabWidgetPluginMapping> = {
  'sport-center-featured': { pluginId: 'sport-center', componentName: 'SportCenterFeatured' },
  'marketplace-featured': { pluginId: 'marketplace', componentName: 'MarketplaceFeatured' },
  'fnb-recent-orders': { pluginId: 'marketplace-fnb', componentName: 'FnBRecentOrders' },
  'card-summary': { pluginId: 'card-transaction', componentName: 'CardSummary' },
  'activity-summary': { pluginId: 'balance', componentName: 'ActivitySummary' },
  'savings-goal': { pluginId: 'balance', componentName: 'SavingsGoal' },
  'recent-transactions': { pluginId: 'balance', componentName: 'RecentTransactions' },
};

export function getTabPlugin(tabId: string): TabWidgetPluginMapping | null {
  return TAB_TO_PLUGIN_MAP[tabId] ?? null;
}

export function getWidgetPlugin(widgetId: string): TabWidgetPluginMapping | null {
  return WIDGET_TO_PLUGIN_MAP[widgetId] ?? null;
}
