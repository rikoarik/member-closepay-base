# Dokumentasi: Membuat Web Version

Panduan untuk membangun versi web dari Member Closepay App. **Tidak fokus ke core dulu** — mulai dari struktur web app dan integrasi bertahap.

---

## 1. Strategi Pendekatan

### Opsi A: React Native Web (Code Sharing Maksimal)

- Pakai `react-native-web` — codebase React Native bisa jalan di browser
- **Kelebihan**: Satu codebase (mobile + web)
- **Kekurangan**: Banyak library native (NFC, camera, dll) tidak support web; perlu polyfill / conditional

### Opsi B: Web App Terpisah (Recommended untuk Start)

- Buat web app baru (React + Vite) di `apps/member-web/` atau `web/`
- **Share**: Types, config structure, API services, business logic
- **Pisah**: UI (React DOM vs React Native)
- **Kelebihan**: Bebas stack web, tidak tergantung native modules
- **Kekurangan**: UI perlu ditulis ulang untuk web

### Opsi C: Hybrid — Shared Logic, Different UI

- Mono-repo: `apps/member-base` (RN), `apps/member-web` (React)
- Shared di `packages/`: config types, API client, hooks (non-UI)
- Core tetap tidak diubah; web consume lewat package exports

---

## 2. Rekomendasi: Mulai dengan Opsi B/C

**Prinsip**: Web app sebagai consumer — pakai config types, API, logic dari packages. **Jangan ubah core dulu.**

---

## 3. Struktur Folder yang Disarankan

```
member-closepay-base/
├── apps/
│   ├── member-base/          # RN app (existing)
│   └── member-web/          # Web app (baru)
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   └── App.tsx
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
├── packages/
│   ├── core/                # Jangan ubah dulu
│   ├── plugins/
│   └── shared/              # (opsional) types, utils untuk web
```

---

## 4. Langkah Setup Web App (Tanpa Sentuh Core)

### 4.1 Buat Project Web

```bash
# Di root project
mkdir -p apps/member-web
cd apps/member-web

# Init dengan Vite + React + TypeScript
npm create vite@latest . -- --template react-ts
```

### 4.2 Install Dependencies

```bash
cd apps/member-web
npm install react-router-dom axios
npm install -D @types/react @types/react-dom
```

### 4.3 Konfigurasi Path Alias (Pakai Types dari Packages)

Di `apps/member-web/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../packages/core/config/types'),
      // Tambah sesuai kebutuhan
    },
  },
});
```

### 4.4 Copy Config Structure (Tanpa Import dari Core)

Awalnya, buat **kopi struktur config** di web app:

```
apps/member-web/src/
├── config/
│   └── app.config.ts    # Copy structure dari apps/member-base/config
├── types/
│   └── AppConfig.ts     # Copy interface dari packages/core/config/types
```

Isi `app.config.ts` manual dulu — jangan import dari `@core/config` supaya web tidak tergantung core.

### 4.5 Setup Routing Dasar

```tsx
// apps/member-web/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 5. Mapping Konsep Mobile → Web

| Mobile (RN)           | Web                    |
|----------------------|------------------------|
| HomeScreen           | HomePage (/); tabs → section atau route |
| TabSwitcher          | Nav tabs / sidebar     |
| BerandaTab           | Section Beranda dengan widget |
| QuickAccessButtons   | Grid shortcut cards    |
| Navigation (Stack)   | React Router           |
| useConfig            | Context atau import config langsung |
| SecureStorage        | localStorage / cookie   |

---

## 6. Yang Bisa Dipakai dari Packages (Tanpa Ubah Core)

| Package      | Bisa Dipakai untuk Web? | Cara                        |
|--------------|--------------------------|-----------------------------|
| core/config  | Types, AppConfig        | Copy types ke web; atau export types-only |
| core/i18n    | Logic translation       | Bisa bikin web adapter (baca JSON)        |
| core/theme   | Color system            | Copy logic / generate CSS vars            |
| plugins/*    | API services, models    | Bisa dipakai jika pure TS & tidak RN-only |

**Syarat**: Hanya pakai module yang **tidak** import `react-native`, `react-native-*`, atau native modules.

---

## 7. Prioritas Development (Tanpa Sentuh Core)

1. **Setup dasar** — Vite, React, routing
2. **Config & theme** — Baca config (file/API), terapkan theme colors
3. **Halaman Beranda** — Layout, shortcut grid, widget placeholders
4. **Auth flow** — Login page, simpan token (localStorage)
5. **API integration** — Pakai axios atau fetch; endpoint dari config
6. **Halaman fitur** — Top up, transfer, marketplace, dll (satu per satu)

---

## 8. Contoh `app.config` untuk Web

Buat file `apps/member-web/src/config/app.config.ts`:

```ts
export const appConfig = {
  companyName: 'Member Base App',
  segmentId: 'balance-management',
  branding: {
    primaryColor: '#076409',
    appName: 'Member Base App',
  },
  quickAccessMenu: [
    { id: 'topupva', route: '/topup-va', labelKey: 'home.topUpVA', icon: 'topup', order: 1 },
    { id: 'transfermember', route: '/transfer', labelKey: 'home.transferMember', icon: 'guest', order: 2 },
    // ...
  ],
  berandaWidgets: [
    { id: 'balance-card', visible: true, order: 1 },
    { id: 'quick-access', visible: true, order: 2 },
    { id: 'recent-transactions', visible: true, order: 3 },
    { id: 'news-info', visible: true, order: 4 },
  ],
};
```

---

## 9. Script NPM di Root (Opsional)

Tambahkan di `package.json` root:

```json
{
  "scripts": {
    "web": "npm run dev --workspace=apps/member-web",
    "web:build": "npm run build --workspace=apps/member-web"
  }
}
```

Atau pakai path langsung:

```bash
cd apps/member-web && npm run dev
```

---

## 10. Checklist Sebelum Mulai

- [ ] Node >= 20
- [ ] Buat folder `apps/member-web/`
- [ ] Init Vite + React + TS
- [ ] Copy struktur config & types (tanpa import dari core)
- [ ] Setup routing dasar
- [ ] Buat halaman Beranda dengan layout mirip mobile
- [ ] Jangan ubah `packages/core/` dulu

---

## 11. Referensi

- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Project rules](.cursor/rules/project-rules-comprehensive.mdc) — arsitektur layer & dependency

---

*Dokumen ini fokus ke setup web tanpa mengubah core. Integrasi ke packages/core bisa dilakukan bertahap setelah struktur web stabil.*
