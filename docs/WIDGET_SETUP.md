# Dokumentasi: Setup Widget Beranda

Panduan untuk konfigurasi dan pengaturan widget di tab Beranda.

---

## 1. Overview

Widget Beranda ditampilkan di tab **Beranda** (slot tengah) pada Home Screen. Pengguna dapat:
- Mengaktifkan/menonaktifkan widget
- Mengubah urutan tampilan widget
- Pengaturan disimpan di local storage per user

---

## 2. Format Konfigurasi

### 2.1 BerandaWidgetConfig (AppConfig)

Di `apps/{company}/config/app.config.ts`:

```typescript
berandaWidgets: [
  { id: 'balance-card', visible: true, order: 1 },
  { id: 'quick-access', visible: true, order: 2 },
  { id: 'recent-transactions', visible: true, order: 3 },
  { id: 'news-info', visible: true, order: 4 },
],
```

| Field   | Type    | Deskripsi                                      |
|---------|---------|------------------------------------------------|
| `id`    | string  | Unique widget ID (lihat daftar di bawah)       |
| `visible` | boolean | Default: true. Tampilkan/sembunyikan widget  |
| `order` | number  | Urutan tampilan (1 = paling atas)              |

### 2.2 Widget IDs yang Tersedia

| ID                   | Deskripsi                                      |
|----------------------|------------------------------------------------|
| `greeting-card`      | Sapaan (pagi/siang/malam + nama user)          |
| `balance-card`       | Kartu saldo utama                              |
| `quick-access`       | Tombol akses cepat (topup, transfer, dll)      |
| `recent-transactions`| Daftar transaksi terakhir                      |
| `news-info`          | Berita & informasi                             |
| `promo-banner`       | Promo & banner                                |
| `store-nearby`       | Toko terdekat (horizontal scroll)              |
| `card-summary`       | Ringkasan kartu virtual                        |
| `activity-summary`   | Ringkasan aktivitas (transaksi hari ini)        |
| `savings-goal`       | Target menabung dengan progress bar            |
| `referral-banner`    | Ajak teman / referral program                  |
| `rewards-points`     | Poin rewards / loyalty                        |
| `voucher-available` | Voucher tersedia (horizontal scroll)          |
| `fnb-recent-orders`  | Pesanan F&B terakhir                          |
| `marketplace-featured` | Produk unggulan / best seller               |

---

## 3. Storage

### 3.1 Key Storage

```
@home_tab_settings
```

### 3.2 Format Data

```json
{
  "enabledTabIds": ["marketplace", "beranda", "fnb"],
  "berandaWidgets": [
    { "id": "balance-card", "visible": true, "order": 1 },
    { "id": "quick-access", "visible": true, "order": 2 },
    { "id": "recent-transactions", "visible": false, "order": 3 },
    { "id": "news-info", "visible": true, "order": 4 }
  ]
}
```

- **enabledTabIds**: Tab kiri, tengah (beranda), kanan
- **berandaWidgets**: Override user — jika kosong, pakai config default

### 3.3 Prioritas

1. **User override** — dari `loadHomeTabSettings()` → `berandaWidgets`
2. **App config** — `config.berandaWidgets`
3. **Default** — `DEFAULT_BERANDA_WIDGETS` di `homeTabSettingsService`

---

## 4. Mengatur Widget dari UI

### 4.1 Lokasi Pengaturan

**Profile** → **Pengaturan Tab Beranda** (`HomeTabSettings`) → bagian "Widget Beranda"

### 4.2 Fitur

- Switch on/off per widget
- Tombol ↑↓ untuk ubah urutan
- Simpan → storage + navigasi kembali

---

## 5. Menambah Widget Baru

### 5.1 Update homeTabSettingsService

Di `packages/core/config/services/homeTabSettingsService.ts`:

```typescript
export const DEFAULT_BERANDA_WIDGETS: BerandaWidgetConfig[] = [
  { id: 'balance-card', visible: true, order: 1 },
  { id: 'quick-access', visible: true, order: 2 },
  { id: 'recent-transactions', visible: true, order: 3 },
  { id: 'news-info', visible: true, order: 4 },
  { id: 'widget-baru', visible: true, order: 5 },  // tambah di sini
];
```

### 5.2 Update HomeTabSettingsScreen

Di `packages/core/config/components/ui/HomeTabSettingsScreen.tsx`:

```typescript
const WIDGET_IDS = [
  'balance-card',
  'quick-access',
  'recent-transactions',
  'news-info',
  'widget-baru',  // tambah di sini
] as const;
```

### 5.3 Update i18n

Di `packages/core/i18n/locales/id.ts` dan `en.ts`:

```typescript
homeTabSettings: {
  // ...
  widgetWidgetBaru: 'Label Widget Baru',
},
```

### 5.4 Buat file widget di `home/widgets/`

```
apps/member-base/src/components/home/widgets/
├── WidgetBaru.tsx   # Komponen widget baru
└── index.ts         # Export widget
```

### 5.5 Render di BerandaTab

Di `apps/member-base/src/components/home/TabContent/beranda/BerandaTab.tsx`:

```tsx
import { WidgetBaru } from '../../widgets';

// Dalam content:
if (widget.id === 'widget-baru') {
  return <WidgetBaru key="widget-baru" />;
}
```

### 5.5 Update App Config (opsional)

Di `apps/{company}/config/app.config.ts`:

```typescript
berandaWidgets: [
  // ...
  { id: 'widget-baru', visible: true, order: 5 },
],
```

---

## 6. Integrasi Web

Untuk web app (`apps/member-web` atau sejenis):

- **Storage**: Gunakan `localStorage` dengan key `@home_tab_settings`
- **Format**: Sama seperti storage di atas
- **Render**: Baca `berandaWidgets` dari config + localStorage override, render sesuai ID

---

## 7. Diagram Alur

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ App Config       │     │ HomeTabSettingsScreen│     │ BerandaTab      │
│ berandaWidgets   │────▶│ User atur widget     │────▶│ loadHomeTab     │
│ (default)        │     │ Simpan ke storage    │     │ Settings()      │
└─────────────────┘     └──────────────────────┘     └────────┬────────┘
         │                           │                        │
         │                           ▼                        ▼
         │                  @home_tab_settings           widgetOverride
         │                  (berandaWidgets)                   │
         │                           │                        │
         └──────────────────────────┴────────────────────────┘
                                    │
                                    ▼
                    Prioritas: override > config > default
```

---

## 8. Referensi File

| File | Deskripsi |
|------|-----------|
| `packages/core/config/types/AppConfig.ts` | Interface `BerandaWidgetConfig` |
| `packages/core/config/services/homeTabSettingsService.ts` | Load/save settings, `DEFAULT_BERANDA_WIDGETS` |
| `packages/core/config/components/ui/HomeTabSettingsScreen.tsx` | UI pengaturan tab + widget |
| `apps/member-base/src/components/home/TabContent/beranda/BerandaTab.tsx` | Tab Beranda - render widget dari config |
| `apps/member-base/src/components/home/widgets/` | Folder widget Beranda (GreetingCard, PromoBanner, dll) |

---

*Terakhir diperbarui: 2025-02*
