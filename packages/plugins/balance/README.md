# Balance Plugin

Plugin untuk mengelola balance/ledger system dengan fitur immutable mutations dan audit trail.

## 📁 Struktur Folder

```
packages/plugins/balance/
├── components/
│   ├── screens/           # Screen components
│   │   ├── BalanceDetailScreen.tsx
│   │   └── TransactionHistoryScreen.tsx
│   ├── ui/               # UI components
│   │   ├── BalanceCard.tsx
│   │   ├── TransactionItem.tsx
│   │   ├── TransactionList.tsx
│   │   ├── TransactionItemSkeleton.tsx
│   │   ├── TopUpIcon.tsx
│   │   └── WithdrawIcon.tsx
│   └── shared/           # Shared components (future use)
├── hooks/
│   └── useBalance.ts     # Balance-related hooks
├── models/
│   ├── BalanceAccount.ts # Balance account model
│   ├── BalanceMutation.ts # Mutation model
│   └── TransactionType.ts # Transaction types enum
├── services/
│   ├── balanceService.ts # Balance operations
│   └── mutationService.ts # Mutation operations
├── index.ts              # Main exports
├── manifest.ts           # Plugin manifest
└── plugin.manifest.json  # Plugin configuration
```

## 🚀 Features

- **Immutable Ledger**: Balance mutations tidak bisa diubah/dihapus
- **Single Source of Truth**: Saldo dihitung dari penjumlahan mutations
- **Audit Trail**: Setiap perubahan tercatat dengan timestamp
- **Real-time Updates**: Balance updates secara real-time
- **Transaction History**: Riwayat transaksi dengan filter dan search

## 📦 Components

### Screens
- `BalanceDetailScreen`: Screen detail saldo dengan bottom sheet history
- `TransactionHistoryScreen`: Screen dedicated untuk history transaksi

### UI Components
- `BalanceCard`: Card untuk menampilkan balance dengan toggle show/hide
- `TransactionItem`: Item untuk menampilkan detail transaksi
- `TransactionList`: List container untuk transaksi
- `TransactionItemSkeleton`: Loading skeleton untuk transaksi
- `TopUpIcon`, `WithdrawIcon`: Icon components untuk actions

## 🔧 Services

- `balanceService`: Operasi balance (get, update, dll)
- `mutationService`: Operasi mutations (create, query, dll)

## 🎯 Usage

```typescript
import { BalanceDetailScreen, useBalance, balanceService } from '@plugins/balance';

// Dalam component
const { balance, mutations, refresh } = useBalance();
```

## 🔗 Dependencies

- `@core/config`: Configuration utilities
- `@core/theme`: Theme system
- `@core/i18n`: Internationalization
- `react-native-safe-area-context`: Safe area handling
- `react-native-gesture-handler`: Gesture handling