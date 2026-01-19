/**
 * Marketplace FnB Plugin
 * Food & Beverage ordering with dine-in, take away, and delivery options
 */

// Models
export type {
    FnBItem,
    FnBVariant,
    FnBAddon,
    FnBCategory,
    FnBOrder,
    FnBOrderItem,
    OrderType,
    EntryPoint,
    OrderStatus,
    FnBStore,
    FnBQRData,
    OperatingHour,
    DeliverySettings,
} from './models';
export { getAvailableOrderTypes, isStoreOpen, parseFnBQRCode } from './models';

// Hooks
export { useFnBData, useFnBCart, useFnBFavorites } from './hooks';

// Components
export {
    FnBItemCard,
    FnBCategoryTabs,
    FnBCartBar,
    FnBItemDetailSheet,
    MerchantHeader,
} from './components/shared';

// Screens
export { FnBScreen, FnBMerchantDetailScreen, FnBCheckoutScreen, FnBScanScreen, FnBFavoritesScreen } from './components/screens';

// Module definition
export const FnBModule = {
    id: 'marketplace-fnb',
    name: 'F&B Marketplace',
    screens: {
        FnB: 'FnBScreen',
        FnBMerchantDetail: 'FnBMerchantDetailScreen',
        FnBCheckout: 'FnBCheckoutScreen',
        FnBScan: 'FnBScanScreen',
        FnBFavorites: 'FnBFavoritesScreen',
    },
};
