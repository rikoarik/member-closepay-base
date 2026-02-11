# Sport Center Plugin

Plugin untuk booking fasilitas olahraga - gym, lapangan, kolam renang.

## Fitur

- Screen Sport Center dengan kategori: Gym, Lapangan, Kolam Renang
- Dapat ditampilkan sebagai tab di Beranda
- Dapat diakses via navigasi (route: `/sport-center`)

## Dependencies

- `balance`
- `payment`

## Konfigurasi

1. Tambahkan `sport-center` ke `enabledModules` di `app.config.ts`
2. Tambahkan tab `sport-center` ke `homeTabs` (optional, untuk tampil di tab Beranda)
3. Pilih "Sport Center" di Pengaturan Tab Beranda untuk menampilkan di slot kiri/kanan

## Struktur

```
sport-center/
├── components/
│   └── screens/
│       ├── SportCenterScreen.tsx
│       └── index.ts
├── plugin.manifest.json
├── manifest.ts
├── index.ts
└── README.md
```
