---
description: Project rules dan guidelines untuk Closepay V2 Member Base App
---

# Closepay V2 - Member Base App - Project Rules

## Arsitektur Layer (Hierarchy)

```
┌─────────────────────────────────────────┐
│           APPS (Company-Specific)       │  apps/{companyInitial}/
├─────────────────────────────────────────┤
│         PLUGINS (Domain-Specific)       │  packages/plugins/{module}/
├─────────────────────────────────────────┤
│         FEATURES (Generic)*             │  packages/features/{module}/ (planned)
├─────────────────────────────────────────┤
│           CORE (Foundation)             │  packages/core/{module}/
└─────────────────────────────────────────┘
```

### Core Modules (`packages/core/`)

- `auth` - Authentication, JWT token management
- `config` - Configuration system, plugin loader, responsive utilities
- `account` - User profile, company, outlet management
- `notification` - Notification service dan components
- `theme` - Theming system (dark/light mode)
- `i18n` - Internationalization (Indonesian & English)
- `security` - FreeRASP integration
- `native` - Native config access (environment variables)
- `navigation` - Navigation utilities

### Plugins (`packages/plugins/`)

- `balance` - Balance ledger (core plugin, immutable)
- `payment` - Payment gateway (core plugin, single entry point)
- `card-transaction` - Card payment processing
- `kso` - Operational cooperation
- `order` - Order processing
- `marketplace` - Marketplace

---

## Dependency Rules (STRICT)

### ✅ ALLOWED

```
Apps → Plugins → Features → Core
```

### ❌ FORBIDDEN

- Core → Features ❌
- Core → Plugins ❌
- Core → Apps ❌
- Features → Plugins ❌
- Features → Apps ❌
- Plugins → Apps ❌

---

## Accent Color System (STRICT)

### Single Source of Truth

- Accent color: `apps/{companyId}/config/app.config.ts` → `branding.primaryColor`

### ✅ DO - Gunakan Theme Colors

```typescript
// Active/Selected States
backgroundColor: isActive ? colors.primary : colors.surface
borderColor: isActive ? colors.primary : colors.border
color: isActive ? colors.surface : colors.text

// Primary Action Buttons
<TouchableOpacity style={{ backgroundColor: colors.primary }}>
  <Text style={{ color: colors.surface }}>Simpan</Text>
</TouchableOpacity>

// Icons
<ArrowDown2 size={20} color={colors.primary} variant="Bold" />
```

### ❌ DON'T - Jangan Hardcode Colors

```typescript
// SALAH
backgroundColor: isActive ? '#0066CC' : colors.surface;
const selectedTextColor = '#FFFFFF';

// SALAH - Hardcode di StyleSheet
const styles = StyleSheet.create({
  button: { backgroundColor: '#0066CC' }, // JANGAN!
});

// SALAH - Pre-create icon dengan hardcoded color
const ICON_INSTANCES = {
  payIPL: <ArrowDown2 size={20} color="#3B82F6" variant="Bold" />,
};
```

---

## Code Comments Rules

### ✅ DO - Komentar yang Diperbolehkan

- Logic kompleks yang tidak jelas
- Business logic yang perlu penjelasan
- Workaround atau temporary fix
- Public API atau export (JSDoc)

### ❌ DON'T - Komentar yang Tidak Diperlukan

- Code yang sudah jelas
- Import statements
- Simple operations
- Komentar yang hanya mengulang code

### Prinsip

- Komentar menjelaskan **"mengapa"**, bukan **"apa"**
- Gunakan nama variabel/fungsi yang jelas daripada komentar

---

## Naming Conventions

| Type               | Convention               | Example                    |
| ------------------ | ------------------------ | -------------------------- |
| Modules/Folders    | kebab-case               | `balance-management`       |
| Components         | PascalCase               | `ProfileScreen.tsx`        |
| Utilities/Services | camelCase                | `authService.ts`           |
| Types/Interfaces   | PascalCase               | `UserProfile`, `AppConfig` |
| Hooks              | camelCase + `use` prefix | `useAuth`, `useTheme`      |
| Constants          | SCREAMING_SNAKE_CASE     | `API_BASE_URL`             |

---

## Import Rules

### Path Aliases

```typescript
// Core imports
import { useAuth } from '@core/auth';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { scale, moderateScale } from '@core/config';

// Plugin imports
import { TransactionHistoryScreen } from '@plugins/balance';
import { TopUpScreen } from '@plugins/payment';
```

### ✅ BENAR - Import dari index

```typescript
import { useAuth, authService, LoginScreen } from '@core/auth';
```

### ❌ SALAH - Import langsung dari file

```typescript
import { useAuth } from '@core/auth/hooks/useAuth';
```

---

## Balance & Payment System

### Balance Plugin (Ledger)

- 🔒 **Immutable**: Mutasi tidak bisa diubah/dihapus
- 📊 **Single Source of Truth**: Saldo = penjumlahan semua mutasi
- ❌ **No Direct Access**: Tidak ada operasi uang langsung ke balance service

### Payment Plugin (Gateway)

- 🚪 **Single Entry Point**: Semua operasi uang melalui payment service
- 🔄 **Auto Update Ledger**: Semua operasi update balance/ledger
- 🔗 **Dependency**: Payment plugin depends on balance plugin

### Flow Transaksi

```
User Action → Plugin → plugins/payment → plugins/balance → Backend API
```

---

## TypeScript Rules

### ✅ DO

- Gunakan strict typing
- Define interfaces untuk semua contracts
- Export types dari index.ts

### ❌ DON'T

- Avoid `any` type
- Jangan skip type definitions

---

## Responsive Design

```typescript
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  useDimensions,
} from '@core/config';

// Scale based on screen width
const size = scale(24);

// Moderate scale for fonts
const fontSize = moderateScale(16);

// Responsive padding
const padding = getHorizontalPadding();

// Reactive dimensions
const { width, height, isTablet } = useDimensions();
```

---

## Checklist Sebelum Commit

- [ ] Tidak ada hardcoded hex colors untuk interactive elements
- [ ] Semua active states menggunakan `colors.primary`
- [ ] Import dari index.ts, bukan file langsung
- [ ] TypeScript strict typing (no `any`)
- [ ] Dependency rules dipatuhi (Plugins → Core)
- [ ] Component menggunakan responsive utilities
- [ ] Translations tersedia untuk ID & EN
- [ ] Komentar hanya untuk logic kompleks
