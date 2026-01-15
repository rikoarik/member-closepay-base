# Plugin Marketplace

Complete marketplace plugin with search and product browsing functionality.

## Overview

This plugin provides all the necessary components, hooks, and screens for implementing a marketplace with product search and browsing capabilities.

## Features

- ✅ Product browsing with pagination
- ✅ Complete search experience (entry + results)
- ✅ Search history and recommendations
- ✅ Product cards with ratings and pricing
- ✅ Category filtering
- ✅ Responsive design
- ✅ Mock data for development

## Usage

### Components

#### ProductCard
Display individual product information.

```typescript
import { ProductCard, Product } from '@plugins/marketplace';

const MyComponent = () => {
  const product: Product = {
    id: '1',
    name: 'Sample Product',
    price: 100000,
    imageUrl: 'https://example.com/image.jpg',
    rating: 4.5,
    sold: 150
  };

  return <ProductCard product={product} onPress={() => {}} />;
};
```

#### ProductCardSkeleton
Loading skeleton for product cards.

```typescript
import { ProductCardSkeleton } from '@plugins/marketplace';

const LoadingComponent = () => (
  <ProductCardSkeleton />
);
```

### Screens

#### MarketplaceScreen
Standalone marketplace screen with product grid.

```typescript
import { MarketplaceScreen } from '@plugins/marketplace';

// Screen will be automatically registered in navigation
```

#### SearchScreen
Search entry screen with history and recommendations.

```typescript
import { SearchScreen } from '@plugins/marketplace';

// Screen will be automatically registered in navigation
```

#### SearchResultsScreen
Search results screen with filtering.

```typescript
import { SearchResultsScreen } from '@plugins/marketplace';

// Screen will be automatically registered in navigation
```

### Hooks

#### useMarketplaceData
Get marketplace products with pagination.

```typescript
import { useMarketplaceData } from '@plugins/marketplace';

const MyComponent = () => {
  const products = useMarketplaceData(20, true, true); // limit, isActive, isVisible

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
};
```

#### useSearch
Search hook for marketplace functionality.

```typescript
import { useSearch } from '@plugins/marketplace';

const MyComponent = () => {
  const {
    searchText,
    setSearchText,
    handleSearchSubmit
  } = useSearch();

  return (
    <TextInput
      value={searchText}
      onChangeText={setSearchText}
      onSubmitEditing={handleSearchSubmit}
      placeholder="Search products..."
    />
  );
};
```

#### getCategories
Get available product categories.

```typescript
import { getCategories } from '@plugins/marketplace';

const categories = getCategories(); // ['Semua', 'Elektronik', 'Fashion', ...]
```

## Dependencies

- `@core/config` - Responsive utilities and theming
- `@core/theme` - Theme colors and styling
- `@core/i18n` - Internationalization
- `payment` plugin - Payment functionality

## Configuration

Enable this plugin in your app config:

```typescript
// apps/your-app/config/app.config.ts
export const appConfig = {
  enabledModules: ['balance', 'payment', 'marketplace'],
  // ... other config
};
```

## File Structure

```
packages/plugins/marketplace/
├── components/
│   ├── screens/
│   │   ├── MarketplaceScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── SearchResultsScreen.tsx
│   └── shared/
│       ├── ProductCard.tsx
│       └── ProductCardSkeleton.tsx
├── hooks/
│   ├── useMarketplaceData.ts
│   └── useSearch.ts
├── plugin.manifest.json
├── index.ts
└── README.md
```

## Development

### Adding New Components

1. Create component in appropriate folder
2. Export from `index.ts`
3. Update `plugin.manifest.json` exports
4. Run `npm run generate:loaders` to update component loader paths

### Adding New Screens

1. Create screen component
2. Export from `index.ts`
3. Add route to `plugin.manifest.json`
4. Screen will be automatically registered in navigation

## API Reference

### Product Interface

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  rating?: number;
  sold?: number;
  category?: string;
  discount?: number;
  storeName?: string;
}
```

## Migration from Legacy Code

If you're migrating from the old app-level marketplace code:

```typescript
// OLD (deprecated)
import { ProductCard } from '../components/home/products/ProductCard';

// NEW (recommended)
import { ProductCard } from '@plugins/marketplace';
```

The old files still exist as re-exports for backward compatibility but will be removed in future versions.