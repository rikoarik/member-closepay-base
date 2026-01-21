/**
 * Plugin Marketplace - Complete marketplace with search and product browsing
 * Module untuk marketplace lengkap dengan search dan browsing produk
 */

// Export semua public API
export { MarketplaceScreen } from './components/screens/MarketplaceScreen';
export { SearchScreen } from './components/screens/SearchScreen';
export { SearchResultsScreen } from './components/screens/SearchResultsScreen';
export { CartScreen } from './components/screens/CartScreen';
export { ProductDetailScreen } from './components/screens/ProductDetailScreen';
export { StoreDetailScreen } from './components/screens/StoreDetailScreen';
export { CheckoutScreen } from './components/screens/CheckoutScreen';
export { ProductCard } from './components/shared/ProductCard';
export type { Product } from './components/shared/ProductCard';
export { ProductCardSkeleton } from './components/shared/ProductCardSkeleton';
export { CartBar } from './components/shared/CartBar';
export { useMarketplaceData, getCategories } from './hooks/useMarketplaceData';
export { useSearch } from './hooks/useSearch';
export { useMarketplaceCart } from './hooks/useMarketplaceCart';

// Module definition
export const MarketplaceModule = {
  id: 'marketplace',
  name: 'Marketplace',
  screens: {
    Marketplace: 'MarketplaceScreen',
    Search: 'SearchScreen',
    SearchResults: 'SearchResultsScreen',
    Cart: 'CartScreen',
    ProductDetail: 'ProductDetailScreen',
    StoreDetail: 'StoreDetailScreen',
    Checkout: 'CheckoutScreen',
  },
};