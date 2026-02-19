# Payment Plugin

Plugin untuk mengelola berbagai operasi pembayaran dengan dukungan multiple payment methods dan gateway.

## Design reference

- **Stitch** (jika ada): Desain referensi untuk alur Top Up dan VA di **`/stitch-screens/4646509502246199082/`** (Top Up Method Selection, Payment Instructions).
- **Instruksi Pembayaran VA**: Acuan tampilan, tab (Mobile / ATM / Bank Lain), dan langkah per kanal ada di **`packages/plugins/payment/docs/VA_INSTRUCTION_REFERENCE.md`**. Gunakan untuk menyelaraskan `VirtualAccountScreen` (tab Mobile, ATM, Bank Lain + steps).

## 📁 Struktur Folder

```
packages/plugins/payment/
├── components/
│   ├── qr/               # QR payment components
│   │   ├── QrScreen.tsx
│   │   ├── QrScanScreen.tsx
│   │   ├── QrDisplayScreen.tsx
│   │   ├── EditQuickAmountScreen.tsx
│   │   └── index.ts
│   ├── shared/           # Shared components
│   │   ├── BluetoothDeviceSelector.tsx
│   │   ├── NFCLoadingModal.tsx
│   │   ├── PinInput.tsx
│   │   └── index.ts
│   ├── topup/            # Top-up related components
│   │   ├── TopUpScreen.tsx
│   │   ├── TopUpMemberScreen.tsx
│   │   ├── TopUpMemberPinScreen.tsx
│   │   ├── TopUpMemberSummaryScreen.tsx
│   │   ├── TopUpMemberSuccessScreen.tsx
│   │   ├── TopUpMemberPinBottomSheet.tsx
│   │   ├── TopUpMemberSummaryBottomSheet.tsx
│   │   ├── TapKartuSummaryScreen.tsx
│   │   └── index.ts
│   ├── virtual-account/  # Virtual account components
│   │   ├── VirtualAccountScreen.tsx
│   │   └── index.ts
│   └── withdraw/         # Withdraw components
│       ├── WithdrawScreen.tsx
│       ├── WithdrawSuccessScreen.tsx
│       ├── AutoWithdrawModal.tsx
│       ├── WithdrawConfirmModal.tsx
│       └── index.ts
├── services/
│   ├── paymentService.ts     # Core payment operations
│   ├── topUpService.ts       # Top-up operations
│   ├── withdrawService.ts    # Withdraw operations
│   ├── transferService.ts    # Transfer operations
│   ├── cardTransactionService.ts # Card transactions
│   └── nfcBluetoothService.ts    # NFC/Bluetooth services
├── types/
│   └── index.ts             # TypeScript type definitions
├── index.ts                 # Main exports
├── manifest.ts              # Plugin manifest
└── plugin.manifest.json     # Plugin configuration
```

## 🚀 Features

- **Multiple Payment Methods**: QR, Virtual Account, Card, Transfer
- **NFC & Bluetooth**: Support untuk NFC dan Bluetooth payments
- **Top-up System**: Top-up saldo dengan berbagai metode
- **Withdraw Operations**: Penarikan dana dengan konfirmasi
- **Transaction History**: Riwayat transaksi lengkap
- **PIN Security**: PIN-based authentication untuk transaksi
- **Real-time Updates**: Status transaksi real-time

## 📦 Components

### QR Components (`components/qr/`)
- `QrScreen`: Main QR payment screen
- `QrScanScreen`: QR code scanner
- `QrDisplayScreen`: Display QR code untuk payment
- `EditQuickAmountScreen`: Edit quick amount presets

### Top-up Components (`components/topup/`)
- `TopUpScreen`: Main top-up screen
- `TopUpMemberScreen`: Top-up member balance
- `TopUpMemberPinScreen`: PIN input untuk top-up
- `TopUpMemberSummaryScreen`: Summary sebelum konfirmasi
- `TopUpMemberSuccessScreen`: Success screen
- `TapKartuSummaryScreen`: Tap kartu summary

### Withdraw Components (`components/withdraw/`)
- `WithdrawScreen`: Main withdraw screen
- `WithdrawSuccessScreen`: Success confirmation
- `AutoWithdrawModal`: Auto withdraw modal
- `WithdrawConfirmModal`: Confirmation modal

### Shared Components (`components/shared/`)
- `BluetoothDeviceSelector`: Bluetooth device selection
- `NFCLoadingModal`: NFC loading indicator
- `PinInput`: PIN input component

## 🔧 Services

- `paymentService`: Core payment operations dan gateway
- `topUpService`: Top-up balance operations
- `withdrawService`: Withdraw operations
- `transferService`: Transfer between accounts
- `cardTransactionService`: Card-based transactions
- `nfcBluetoothService`: NFC dan Bluetooth connectivity

## 🎯 Usage

```typescript
import {
  TopUpScreen,
  WithdrawScreen,
  paymentService,
  topUpService
} from '@plugins/payment';

// Dalam component
const handleTopUp = async () => {
  await topUpService.topUpBalance(amount, method);
};
```

## 🔗 Dependencies

- `@core/config`: Configuration utilities
- `@core/theme`: Theme system
- `@core/i18n`: Internationalization
- `@core/navigation`: Navigation utilities
- `@plugins/balance`: Balance operations
- `react-native-bluetooth-serial`: Bluetooth connectivity
- `react-native-nfc-manager`: NFC operations

## 🔒 Security Features

- **PIN Authentication**: Required untuk transaksi sensitif
- **NFC Encryption**: Secure NFC communication
- **Transaction Validation**: Server-side validation
- **Audit Trail**: Complete transaction logging