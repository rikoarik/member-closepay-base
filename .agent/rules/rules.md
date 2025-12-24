---
trigger: always_on
---

Closepay V2 – Workspace Rules (SHORT VERSION)
1. Layer Architecture (STRICT)

Hierarchy

APPS → PLUGINS → FEATURES → CORE


Rules

CORE ❌ tidak tahu FEATURES / PLUGINS

FEATURES ❌ tidak tahu PLUGINS

PLUGINS ✅ boleh pakai FEATURES & CORE

APPS ✅ hanya config, assets, wiring

2. Responsibility per Layer
CORE (packages/core/)

Generic & reusable

Auth, Config, Account, Theme, i18n, Security

❌ Tidak ada logic domain

❌ Tidak ada payment / balance logic

FEATURES (packages/features/)

Abstraksi generik lintas domain

Model & flow umum (catalog, order, reporting)

❌ Tidak ada domain-specific logic

PLUGINS (packages/plugins/)

Domain-specific logic & UI

Bisa panggil Core & plugin lain

Bisa di-enable/disable via AppConfig

APPS (apps/{company})

Company config, branding, feature flags

❌ Tidak ada business logic

3. Dependency Rules (WAJIB)
✅ BOLEH

Plugin → Core

Plugin → Plugin

App → Core / Plugin

❌ DILARANG

Core → Feature / Plugin

Feature → Plugin

Reverse dependency apa pun

4. Balance & Payment (CORE PLUGINS)
Balance Plugin

Ledger only (immutable)

Single source of truth

No direct money operation

Payment Plugin

Single entry point semua uang

Update ledger via balance plugin

Idempotent

❌ Tidak langsung mutasi balance

Universal Flow

User → Plugin → Payment → Balance → Backend

5. Folder Contract (WAJIB)

Setiap module HARUS punya:

index.ts (public API)

types/ (contracts)

services/ (logic)

components/ (jika UI)

6. TypeScript Rules

✅ DO

Strict typing

Interface untuk semua contract

❌ DON'T

any

Skip typing

Mixed JS/TS tanpa alasan

7. Import Rules

Import hanya dari index.ts

Relative path only

Dilarang deep import

8. Theme & Accent Color (STRICT)
Single Source of Truth
apps/{company}/config/app.config.ts
branding.primaryColor

WAJIB

Active / selected → colors.primary

Text di atas primary → colors.surface

Indicator / icon active → colors.primary

DILARANG

Hardcoded hex (#fff, #0066cc)

Hardcoded colors di StyleSheet

Pre-created icon dengan warna tetap

9. Error Handling

Handle di service layer

Format konsisten

Message user-friendly

10. Configuration Driven

Semua feature via AppConfig

Enable/disable plugin via config

❌ Jangan hardcode behavior

11. Golden Rules (HARD STOP)

Core ≠ Domain

Payment ≠ Ledger

Plugin extend, bukan modify core

No circular dependency

No hardcoded colors

No shortcut


🔐 Closepay V2 – Security Rules (ADD-ON, HARD RULES)
12. Security Boundary (HARD)
❌ Mobile App TIDAK PERNAH dipercaya

Client = untrusted

Semua logic finance harus assume client compromised

Implikasi:

Decompile = expected

Hooking = expected

Replay = expected

13. Money Authority (STRICT)
❌ DILARANG di Client

Hitung saldo

Hitung fee / diskon

Validasi pembayaran

Generate signature / checksum

Finalize transaksi

✅ WAJIB di Backend

Amount validation

Signature generation

Ledger mutation

Payment final state

Mobile hanya request + render state

14. Payment Security Flow (WAJIB)
Client
  → Intent (no amount trust)
    → Payment Plugin
      → Backend
        → Gateway
        → Ledger (immutable)
      ← Signed Result
  ← Render status


Rules:

❌ Client tidak boleh menentukan hasil

❌ Client tidak boleh finalize payment

✅ Backend = single authority

15. Token & Credential Rules
❌ DILARANG di Client

API secret

Private key

Static token

Gateway key

HMAC secret

✅ BOLEH

Short-lived access token

Rotating refresh token

Public identifiers only

16. Signature & Integrity
Signature Rules

Signature SELALU dari backend

Signature 1x pakai (idempotent)

Payload signed HARUS diverifikasi ulang di backend

❌ Client generate signature = HARD VIOLATION

17. Ledger Rules (Immutable)

Ledger append-only

No update / overwrite

No delete

Semua perubahan via Payment Plugin

Ledger ≠ Balance UI
Ledger = audit truth

18. Anti-Tampering (Best-Effort)

Client BOLEH:

Deteksi root / emulator

Deteksi debugger

Deteksi hook (best effort)

Client TIDAK BOLEH:

Block payment logic

Mengubah hasil transaksi

Deteksi = signal, bukan keputusan

19. Network Security
WAJIB

HTTPS only

TLS modern

OPTIONAL (High Value)

Certificate pinning

Replay protection

Request nonce

20. Configuration Security
❌ DILARANG

Hardcode endpoint sensitif

Hardcode feature behavior

Hardcode payment routing

✅ WAJIB

Semua via AppConfig

Feature flag dari server (jika perlu)

21. Error & Logging (Finance Safe)
❌ DILARANG

Error detail teknis ke user

Stacktrace

Gateway response raw

✅ WAJIB

User-friendly message

Internal error code

Correlation ID (server)

22. Decompile Assumption Rule

Assume attacker can read everything in APK

Design rule:

Tidak ada security by obscurity

Tidak ada logic critical di client

Tidak ada “hidden trick” di JS

Jika logic bocor TIDAK BOLEH fatal

23. Golden Security Rules (HARD STOP)

❌ Client menentukan uang
❌ Client validasi payment
❌ Client generate signature
❌ Client jadi source of truth
❌ Hardcoded secret
❌ Trust mobile state

✅ Server authoritative
✅ Ledger immutable
✅ Payment idempotent
✅ Config driven
✅ Assume compromise