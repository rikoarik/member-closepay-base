/**
 * Plugin Marketplace - Complete marketplace with search and product browsing
 * Module untuk marketplace lengkap dengan search dan browsing produk
 */

// Export semua public API
export { MarketplaceScreen } from './components/screens/MarketplaceScreen';
export { SearchScreen } from './components/screens/SearchScreen';
export { SearchResultsScreen } from './components/screens/SearchResultsScreen';
export { ProductCard } from './components/shared/ProductCard';
export type { Product } from './components/shared/ProductCard';
export { ProductCardSkeleton } from './components/shared/ProductCardSkeleton';
export { useMarketplaceData, getCategories } from './hooks/useMarketplaceData';
export { useSearch } from './hooks/useSearch';

// Module definition
export const MarketplaceModule = {
  id: 'marketplace',
  name: 'Marketplace',
  screens: {
    Marketplace: 'MarketplaceScreen',
    Search: 'SearchScreen',
    SearchResults: 'SearchResultsScreen',
  },
};