# Referensi Tampilan: Instruksi Pembayaran VA

Dokumen ini menjadi acuan tampilan layar **Instruksi Pembayaran** (Virtual Account) agar konsisten dengan kanal **Mobile**, **ATM**, dan **Bank Lain**.

---

## 1. Layout Umum (Tampilan)

Urutan blok dari atas ke bawah:

| Blok | Isi |
|------|-----|
| **Header** | Back, judul "Instruksi Pembayaran", placeholder kanan |
| **Kartu bank** | Label "Transfer Bank", nama bank, badge status (Pending) |
| **Kartu VA** | Label "Nomor Virtual Account", nomor VA + tombol Copy, countdown "Selesaikan pembayaran dalam HH:MM:SS", label "Nama Rekening", nama rekening |
| **Cara Transfer** | Judul "Cara Transfer" + **3 tab**: **Mobile** \| **ATM** \| **Bank Lain** → di bawah tab: langkah 1–5/6 sesuai tab aktif |

- Kartu pakai pola `card`: `borderRadius: scale(12)`, border, padding, spacing seperti di Top Up.
- Warna dari theme (`colors.primary`, `colors.surface`, dll).

---

## 2. Tab: Mobile | ATM | Bank Lain

Tiga kanal pembayaran VA yang standar:

| Tab | Label tampilan | Keterangan |
|-----|----------------|------------|
| **Mobile** | `m-{nama bank}` (contoh: m-BCA, M-BNI, Mobile Banking) | Transfer lewat aplikasi mobile banking **bank yang sama** dengan VA. |
| **ATM** | **ATM** | Transfer lewat mesin ATM **bank yang sama** dengan VA. |
| **Bank Lain** | **Bank Lain** | Transfer dari **bank lain** (ATM/mobile/internet banking bank lain ke VA). |

- Satu baris tab, aktif pakai warna primary (underline atau background).
- Tab mengikuti pola tab yang dipakai di app (mis. underline seperti saat ini atau `TabSwitcher` dari core).

---

## 3. Konten per Tab

### 3.1 Tab **Mobile** (M-Banking / Mobile Banking)

Instruksi untuk bayar VA lewat **aplikasi mobile banking bank penerima VA**.

Contoh alur (referensi BCA/NICEPay/umum):

1. Login ke aplikasi M-Banking / mobile banking Anda.
2. Pilih menu **Transfer** atau **Pembayaran**.
3. Pilih **Virtual Account** atau **Pembayaran VA**.
4. Masukkan **nomor Virtual Account** (sesuai layar).
5. Periksa detail transaksi (nomor VA, nominal, nama).
6. Konfirmasi pembayaran (PIN/OTP) dan transaksi selesai.

Keys i18n: `virtualAccount.mStep1` … `virtualAccount.mStep6` (atau setara).

---

### 3.2 Tab **ATM**

Instruksi untuk bayar VA lewat **ATM bank yang sama** dengan VA (bukan bank lain).

Contoh alur:

1. Masukkan kartu ATM dan PIN.
2. Pilih menu **Pembayaran/Pembelian** atau **Lainnya** → **Transfer**.
3. Pilih **Virtual Account** / **VA Billing** / **Institusi**.
4. Masukkan **nomor Virtual Account**.
5. Periksa detail transaksi di layar.
6. Konfirmasi pembayaran dan ambil struk.

Keys i18n: `virtualAccount.step1` … `virtualAccount.step6`.

---

### 3.3 Tab **Bank Lain**

Instruksi untuk bayar VA dari **bank lain** (transfer antarbank: ATM bank lain, mobile/internet banking bank lain).

**Via ATM Bank Lain:**

1. Masukkan kartu ATM dan PIN.
2. Pilih **Transaksi Lainnya** → **Transfer**.
3. Pilih **Transfer ke Bank Lain** (masukkan kode bank tujuan jika diminta).
4. Masukkan **nomor Virtual Account** sebagai rekening tujuan.
5. Masukkan nominal dan konfirmasi; selesaikan transaksi.

**Via Mobile/Internet Banking Bank Lain:**

1. Login ke aplikasi mobile/internet banking bank Anda.
2. Pilih **Transfer** → **Transfer ke Bank Lain**.
3. Pilih bank tujuan (bank penerima VA).
4. Masukkan **nomor Virtual Account** dan nominal.
5. Konfirmasi dan kirim.

Keys i18n: `virtualAccount.bankLainStep1` … `virtualAccount.bankLainStep5` (atau jumlah yang disepakati).

---

## 4. Ringkasan Referensi

- **Tampilan**: Header → Kartu bank → Kartu VA (nomor + copy + timer + nama rekening) → Blok "Cara Transfer" dengan 3 tab.
- **Tab**: **Mobile** (m-{bank}) | **ATM** | **Bank Lain**.
- **Mobile**: langkah M-Banking/mobile banking bank yang sama (mStep1–6).
- **ATM**: langkah ATM bank yang sama (step1–6).
- **Bank Lain**: langkah transfer dari bank lain, ATM atau mobile/IB (bankLainStep1–5).

Dengan ini, tampilan, tab, dan konten Mobile / ATM / Bank Lain punya acuan yang jelas dan konsisten.
