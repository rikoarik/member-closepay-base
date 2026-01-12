# Plugin Loader Management Guide

Panduan lengkap untuk mengelola plugin component loaders. Dokumentasi ini membantu developer baru memahami dan menggunakan sistem plugin loader dengan mudah.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Two Approaches](#two-approaches)
- [Common Patterns](#common-patterns)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

## Overview

### Apa itu Plugin Loaders?

Plugin loaders adalah sistem untuk memuat komponen React dari plugin secara dinamis. Karena React Native Metro bundler memerlukan static import paths, kita perlu mapping path untuk setiap komponen.

### Kenapa Perlu Sistem Ini?

1. **Metro Bundler Requirement**: Metro memerlukan static import paths yang diketahui saat build time
2. **Dynamic Loading**: Plugin system memungkinkan load komponen secara dinamis berdasarkan konfigurasi
3. **Type Safety**: Mapping path memastikan komponen dapat ditemukan dengan benar
4. **Maintainability**: Centralized configuration memudahkan maintenance

### File Structure

```
packages/core/config/plugins/
├── componentLoaderPaths.ts    # Centralized path mapping (EDIT THIS)
├── pluginComponentLoader.ts   # Loader implementation (DON'T EDIT)
├── pluginLoader.ts            # Plugin manifest loader
└── PLUGIN_LOADERS.md          # This file
```

## Quick Start

### Menambahkan Component Baru (Recommended - Auto-Generate)

**Step 1:** Tambahkan komponen ke `plugin.manifest.json`

```json
{
  "exports": {
    "components": [
      "YourNewComponent"
    ]
  }
}
```

**Step 2:** Pastikan file komponen ada di struktur yang benar

```
packages/plugins/{pluginId}/components/
  └── YourNewComponent.tsx
```

**Step 3:** Run generate script

```bash
npm run generate:loaders
```

**Step 4:** Review generated file (optional)

File `componentLoaderPaths.ts` akan otomatis ter-update dengan path yang benar.

**Done!** Komponen sekarang bisa digunakan via plugin system.

### Menambahkan Component Baru (Manual)

**Step 1:** Tambahkan komponen ke `plugin.manifest.json` (sama seperti di atas)

**Step 2:** Edit `componentLoaderPaths.ts`

```typescript
export const COMPONENT_LOADER_PATHS: Record<string, Record<string, string>> = {
  yourPlugin: {
    // ... existing components
    YourNewComponent: '../../../plugins/yourPlugin/components/YourNewComponent',
  },
};
```

**Step 3:** Pastikan path benar (relative dari `packages/core/config/plugins/`)

**Done!** Komponen siap digunakan.

## Two Approaches

### Approach 1: Auto-Generate (Recommended)

**Kapan menggunakan:**
- Menambahkan komponen baru yang mengikuti konvensi struktur folder standar
- Ingin proses otomatis dan cepat
- Bekerja dengan banyak komponen sekaligus

**Cara kerja:**
1. Script scan semua plugin di `packages/plugins/`
2. Baca `plugin.manifest.json` untuk setiap plugin
3. Cari file komponen berdasarkan common patterns
4. Generate `componentLoaderPaths.ts` otomatis

**Keuntungan:**
- Otomatis dan cepat
- Mengurangi human error
- Konsisten dengan struktur yang ada

**Keterbatasan:**
- Hanya bekerja untuk struktur folder standar
- Komponen dengan struktur custom perlu ditambahkan manual

### Approach 2: Manual Edit

**Kapan menggunakan:**
- Komponen dengan struktur folder custom/non-standard
- Perlu kontrol penuh atas path mapping
- Debugging path yang salah

**Cara kerja:**
1. Edit `componentLoaderPaths.ts` langsung
2. Tambahkan mapping manual
3. Pastikan path benar

**Keuntungan:**
- Kontrol penuh
- Support struktur custom
- Fleksibel

**Keterbatasan:**
- Manual, lebih lambat
- Berpotensi human error
- Perlu pengetahuan tentang path structure

## Common Patterns

### Pattern 1: Flat Structure

Komponen langsung di `components/` folder:

```
packages/plugins/balance/components/
  ├── BalanceCard.tsx
  ├── TopUpIcon.tsx
  └── WithdrawIcon.tsx
```

**Mapping:**
```typescript
balance: {
  BalanceCard: '../../../plugins/balance/components/BalanceCard',
  TopUpIcon: '../../../plugins/balance/components/TopUpIcon',
}
```

### Pattern 2: Nested by Feature

Komponen di folder berdasarkan feature:

```
packages/plugins/payment/components/
  ├── topup/
  │   ├── TopUpScreen.tsx
  │   └── TopUpMemberScreen.tsx
  ├── withdraw/
  │   └── WithdrawScreen.tsx
  └── shared/
      └── PinInput.tsx
```

**Mapping:**
```typescript
payment: {
  TopUpScreen: '../../../plugins/payment/components/topup/TopUpScreen',
  TopUpMemberScreen: '../../../plugins/payment/components/topup/TopUpMemberScreen',
  WithdrawScreen: '../../../plugins/payment/components/withdraw/WithdrawScreen',
  PinInput: '../../../plugins/payment/components/shared/PinInput',
}
```

### Pattern 3: Component Folder

Komponen di folder sendiri:

```
packages/plugins/catalog/components/
  ├── CategoryList/
  │   └── CategoryList.tsx
  └── ProductCard/
      └── ProductCard.tsx
```

**Mapping:**
```typescript
catalog: {
  CategoryList: '../../../plugins/catalog/components/CategoryList/CategoryList',
  ProductCard: '../../../plugins/catalog/components/ProductCard/ProductCard',
}
```

## Examples

### Example 1: Menambahkan Screen Component Baru

**Scenario:** Menambahkan `OrderDetailScreen` ke plugin `order`

**Step 1:** Buat file komponen

```typescript
// packages/plugins/order/components/OrderDetailScreen.tsx
export const OrderDetailScreen = () => {
  // ... component implementation
};
```

**Step 2:** Update `plugin.manifest.json`

```json
{
  "exports": {
    "components": [
      "OrderDetailScreen"
    ]
  },
  "routes": [
    {
      "name": "OrderDetail",
      "component": "OrderDetailScreen"
    }
  ]
}
```

**Step 3:** Run generate script

```bash
npm run generate:loaders
```

**Result:** Path otomatis ter-generate di `componentLoaderPaths.ts`

### Example 2: Menambahkan Shared Component

**Scenario:** Menambahkan `LoadingSpinner` ke plugin `payment` di folder `shared`

**Step 1:** Buat file di folder shared

```typescript
// packages/plugins/payment/components/shared/LoadingSpinner.tsx
export const LoadingSpinner = () => {
  // ... component implementation
};
```

**Step 2:** Update manifest

```json
{
  "exports": {
    "components": [
      "LoadingSpinner"
    ]
  }
}
```

**Step 3:** Run generate script (akan auto-detect folder `shared`)

**Result:** Path otomatis ter-generate:
```typescript
payment: {
  LoadingSpinner: '../../../plugins/payment/components/shared/LoadingSpinner',
}
```

### Example 3: Manual Edit untuk Custom Structure

**Scenario:** Komponen ada di struktur custom: `components/modals/custom/MyModal.tsx`

**Step 1:** Tambahkan ke manifest

**Step 2:** Manual edit `componentLoaderPaths.ts`

```typescript
myPlugin: {
  MyModal: '../../../plugins/myPlugin/components/modals/custom/MyModal',
}
```

**Done!** Custom path sudah ter-mapping.

## Troubleshooting

### Error: "No loader path found for component X in plugin Y"

**Penyebab:**
- Komponen tidak ada di `componentLoaderPaths.ts`
- Path salah atau file tidak ditemukan

**Solusi:**
1. Pastikan komponen ada di `plugin.manifest.json` (`exports.components`)
2. Run `npm run generate:loaders` untuk auto-generate
3. Atau manual tambahkan ke `componentLoaderPaths.ts`
4. Verify path benar (file harus ada di lokasi tersebut)

### Error: "Component X not exported by plugin Y"

**Penyebab:**
- Komponen tidak terdaftar di `plugin.manifest.json`

**Solusi:**
1. Edit `packages/plugins/{pluginId}/plugin.manifest.json`
2. Tambahkan komponen ke `exports.components`
3. Run `npm run generate:loaders`

### Error: "Failed to load component X"

**Penyebab:**
- File komponen tidak ada di path yang di-mapping
- Export komponen salah (bukan default atau named export)

**Solusi:**
1. Verify file ada di path yang benar
2. Check export statement:
   ```typescript
   // ✅ Correct
   export const MyComponent = () => { ... };
   export default MyComponent;
   
   // ❌ Wrong - missing export
   const MyComponent = () => { ... };
   ```
3. Verify path di `componentLoaderPaths.ts` benar

### Generate Script Tidak Menemukan Komponen

**Penyebab:**
- Struktur folder tidak mengikuti pattern standar
- File komponen belum dibuat

**Solusi:**
1. Pastikan file komponen sudah dibuat
2. Check struktur folder mengikuti pattern umum:
   - `components/{ComponentName}.tsx`
   - `components/{folder}/{ComponentName}.tsx`
3. Jika struktur custom, tambahkan manual ke `componentLoaderPaths.ts`
4. Atau modifikasi script untuk support pattern baru

### Path Relative Salah

**Penyebab:**
- Path dihitung dari lokasi yang salah

**Solusi:**
- Path harus relative dari `packages/core/config/plugins/`
- Format: `../../../plugins/{pluginId}/components/...`
- Jangan include extension (`.tsx` atau `.ts`)

## Advanced Usage

### Menambahkan Plugin Baru

**Step 1:** Buat plugin structure

```
packages/plugins/my-plugin/
  ├── components/
  │   └── MyComponent.tsx
  ├── plugin.manifest.json
  └── index.ts
```

**Step 2:** Update `pluginLoader.ts`

Tambahkan manifest loader:
```typescript
export const MANIFEST_LOADERS = {
  // ... existing plugins
  'my-plugin': () => import('../../../plugins/my-plugin/plugin.manifest.json').then(m => m as { default: PluginManifest }),
};
```

**Step 3:** Update `componentLoaderPaths.ts`

Run `npm run generate:loaders` atau manual tambahkan mapping.

**Step 4:** Enable plugin di `app.config.ts`

```typescript
enabledModules: ['my-plugin']
```

### Custom Path Patterns

Jika plugin menggunakan struktur folder custom, bisa modifikasi script `generate-plugin-loaders.js` untuk menambahkan pattern baru di `PATH_PATTERNS` array.

### Integration dengan Navigation

Komponen yang terdaftar di `componentLoaderPaths.ts` otomatis bisa digunakan untuk navigation routes. Pastikan:
1. Komponen terdaftar di `plugin.manifest.json` → `routes`
2. Path mapping ada di `componentLoaderPaths.ts`
3. Plugin enabled di `app.config.ts`

## Best Practices

1. **Gunakan Auto-Generate**: Selalu gunakan `npm run generate:loaders` jika memungkinkan
2. **Review Generated Code**: Setelah generate, review file untuk memastikan paths benar
3. **Follow Naming Conventions**: Gunakan PascalCase untuk komponen, kebab-case untuk plugin ID
4. **Keep Paths Updated**: Setelah menambahkan komponen baru, langsung run generate script
5. **Document Custom Paths**: Jika menggunakan path custom, tambahkan comment di `componentLoaderPaths.ts`
6. **Test After Changes**: Setelah update paths, test navigasi/loading komponen untuk memastikan bekerja

## Related Files

- `componentLoaderPaths.ts` - Path mapping configuration
- `pluginComponentLoader.ts` - Loader implementation
- `pluginLoader.ts` - Plugin manifest loader
- `scripts/generate-plugin-loaders.js` - Auto-generation script
- `packages/core/config/README.md` - Main config documentation

## Getting Help

Jika mengalami masalah:
1. Check error message di console
2. Verify file structure sesuai dokumentasi
3. Check troubleshooting section di atas
4. Review examples untuk scenario serupa
5. Check file `componentLoaderPaths.ts` untuk melihat format yang benar

---

**Last Updated:** 2025-01-01  
**Version:** 1.0.0

