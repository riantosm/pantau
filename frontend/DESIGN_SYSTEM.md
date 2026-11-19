# 🎨 Design System: Midnight Vault

Panduan visual Pantau. **Semua UI baru wajib mengikuti dokumen ini.** Kalau butuh sesuatu yang belum ada
(warna, ukuran, komponen), tambahkan dulu di sini dan di `src/css/index.css`, baru dipakai di komponen.

- Sumber token: [`src/css/index.css`](src/css/index.css) (Tailwind v4, tanpa `tailwind.config`)
- Sumber logo: [`../docs/brand/`](../docs/brand) · komponen [`BrandMark`](src/components/atoms/BrandMark/index.tsx)
- Desain awal: artifact "Pantau: UI/UX Design" (prototipe desktop, mobile, alur, state, design system)

---

## 🧭 Prinsip

1. **Satu tema gelap.** Tidak ada mode terang dan tidak ada `dark:`. Semua warna lewat token.
2. **Peta adalah panggung utama.** Panel dan kontrol memakai permukaan gelap yang tenang supaya marker
   berwarna menonjol.
3. **Tenang, bukan ramai.** Tanpa bayangan, tanpa gradien, tanpa ilustrasi dekoratif. Hierarki dibangun dari
   tingkat permukaan, garis 1px, ukuran huruf, dan pasangan serif–sans.
4. **Status tidak pernah hanya warna.** Selalu warna + bentuk + teks.

### 6 aturan wajib

| #   | Aturan                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tombol putih terisi (`Button variant="primary"`) **maksimal satu per layar**, untuk aksi utama (Tambah / Simpan)           |
| 2   | Serif (`font-serif`, Playfair Display) **hanya untuk teks ≥ 28px**: judul, nama entitas, angka ringkasan, nama app         |
| 3   | Copper (`text-copper`) **hanya untuk eyebrow kategori** (komponen `Eyebrow`), bukan tombol, ikon, atau link                |
| 4   | **Tanpa bayangan.** Pisahkan lapisan dengan `bg` → `surface` → `surface-2` + garis `border` 1px                            |
| 5   | Tombol, input, chip, badge = **pill** (`rounded-control`). Kartu = `rounded-card` (10px). Textarea = `rounded-area` (16px) |
| 6   | Status selalu **warna + bentuk + teks** (`StatusMark` + label / `StatusBadge`)                                             |

---

## 🎨 Warna

Gunakan **nama token** sebagai kelas Tailwind (`bg-surface`, `text-text-muted`, `border-danger-line`).
Hex di bawah hanya untuk referensi. **Jangan** menulis hex, `bg-[#…]`, atau warna palet Tailwind (`bg-gray-800`) di komponen.

### Permukaan (belakang → depan)

| Token           | Hex                   | Dipakai untuk                                                                            |
| --------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| `bg`            | `#16171c`             | Latar halaman, top bar, sidebar                                                          |
| `map`           | `#1a1c21`             | Latar area peta sebelum tile termuat                                                     |
| `surface`       | `#1b1d23`             | Panel kanan, bottom sheet, kartu, dialog, legenda                                        |
| `surface-2`     | `#22242b`             | Input, kartu di dalam panel (koordinat, form jenis), baris terpilih, tombol kontrol peta |
| `border`        | `#2c2e36`             | Garis pemisah 1px, garis kartu                                                           |
| `border-strong` | `#3a3d47`             | Garis input, chip, tombol ikon, cincin logo                                              |
| `scrim`         | `rgb(12 13 16 / .66)` | Latar di belakang dialog                                                                 |

### Teks (terang → redup)

| Token         | Hex       | Dipakai untuk                                                |
| ------------- | --------- | ------------------------------------------------------------ |
| `text-strong` | `#ffffff` | Judul, nama entitas, angka, teks di input, chip aktif        |
| `text`        | `#e6e7ec` | Teks isi default                                             |
| `text-2`      | `#cdcfd6` | Legenda peta                                                 |
| `text-3`      | `#b5b8c2` | Paragraf deskripsi (biasanya `font-light`), chip tidak aktif |
| `text-muted`  | `#9da0ad` | Label field, keterangan, status koneksi                      |
| `text-faint`  | `#848796` | Placeholder, penghitung karakter, atribusi peta              |

### Aksen & status

| Token                      | Hex                   | Dipakai untuk                                       |
| -------------------------- | --------------------- | --------------------------------------------------- |
| `primary` / `primary-fg`   | `#ffffff` / `#000000` | Tombol utama putih + teksnya                        |
| `copper`                   | `#cc9166`             | Eyebrow kategori saja                               |
| `success` / `success-line` | `#8fb59a` / `#56735e` | Status **Aktif**, ikon toast sukses                 |
| `warning` / `warning-line` | `#d4b06a` / `#6e5c38` | Status **Perawatan**, indikator "menghubungkan"     |
| `neutral` / `neutral-line` | `#848796` / `#3a3d47` | Status **Nonaktif**                                 |
| `danger` / `danger-line`   | `#e59a9a` / `#5a3434` | Hapus, pesan error, toast gagal, kartu gagal memuat |
| `danger-input`             | `#b06464`             | Garis input yang tidak valid                        |

> Pola `*-line` dipakai untuk **garis** badge/tombol, dan warna utamanya untuk **teks/isi**.
> Contoh: badge Aktif = `border-success-line text-success`.

---

## 🔤 Tipografi

| Font                 | Token                 | Sumber                         |
| -------------------- | --------------------- | ------------------------------ |
| Playfair Display 400 | `font-serif`          | `@fontsource/playfair-display` |
| Inter Variable       | `font-sans` (default) | `@fontsource-variable/inter`   |

| Peran                                          | Kelas                                                      | Contoh                         |
| ---------------------------------------------- | ---------------------------------------------------------- | ------------------------------ |
| Angka ringkasan (desktop)                      | `font-serif text-[40px] leading-none tracking-[0.01em]`    | 8 · 2 · 2                      |
| Judul panel (desktop)                          | `font-serif text-[34px] leading-[1.13] tracking-[0.01em]`  | Truk Logistik 01, Entitas baru |
| Angka ringkasan (mobile)                       | `font-serif text-[32px] leading-none`                      |                                |
| Judul panel (mobile), dialog, kartu pesan peta | `font-serif text-[30px] leading-[1.1–1.13]`                | Hapus entitas?                 |
| Nama app                                       | `font-serif text-[28px] leading-none`                      | Pantau                         |
| Isi                                            | `text-[15px] leading-normal` (default `body`)              |                                |
| Tombol md, input kecil, toast                  | `text-sm` (14px)                                           |                                |
| **Eyebrow**                                    | `text-[13px] font-semibold tracking-[-0.02em] text-copper` | Kendaraan · Langkah 1 dari 2   |
| Label field, chip, legenda                     | `text-[13px]`                                              |                                |
| Hint, error field, badge, penghitung           | `text-xs` (12px)                                           | `wajib diisi` · `12/100`       |
| Atribusi peta                                  | `text-[11px] text-text-faint`                              |                                |
| Angka & koordinat                              | tambah `tabular-nums`                                      | -6.90320, 107.59200            |

Serif di bawah 28px **dilarang**. Untuk penekanan kecil, pakai `font-medium` atau `text-text-strong`.

---

## 📐 Bentuk, ukuran, jarak

| Token             | Nilai  | Untuk                                                  |
| ----------------- | ------ | ------------------------------------------------------ |
| `rounded-control` | 9999px | Tombol, input, chip, badge, tombol ikon, toast, banner |
| `rounded-card`    | 10px   | Kartu, panel, dialog, legenda, sudut atas bottom sheet |
| `rounded-area`    | 16px   | Textarea                                               |

| Elemen                    | Tinggi                                         |
| ------------------------- | ---------------------------------------------- |
| Button `sm` / `md` / `lg` | 32 / 40 / 48px                                 |
| IconButton `sm` / `md`    | 32 / 38px                                      |
| Input `sm` / `md`         | 36 / 40px                                      |
| SearchField `md` / `lg`   | 38 / 44px                                      |
| Chip                      | ±30px (`py-[5px]`), di form ±34px (`py-[7px]`) |

**Jarak** (kelipatan 4px Tailwind):

- Padding panel: `px-6` desktop, `px-5` mobile. Kepala panel `py-4`.
- Jarak antar-bagian dalam panel: `gap-[18px]`–`gap-[22px]`. Antar-field form: `gap-[18px]`.
- Baris daftar: `px-6 py-3` (desktop), `px-5 py-3` (mobile), dipisah `border-b border-border`.
- Footer aksi panel: `px-6 py-4 border-t border-border`, tombol `gap-2`.

---

## 🧩 Komponen

Komponen generik ada di `src/components` (atomic design). Komponen khusus halaman peta ada di `src/layouts/map`.
**Gunakan komponen yang sudah ada sebelum membuat yang baru.**

### Atoms

| Komponen            | Varian / props                                                                                                        | Aturan pakai                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BrandMark`         | `size`, `spinning`                                                                                                    | Logo. Selalu bersama teks "Pantau" atau label. `spinning` hanya untuk memuat                                                                                                           |
| `Button`            | `primary` · `outline` · `subtle` · `dashed` · `danger` · `danger-solid`; `sm` · `md` · `lg`; `isLoading`, `fullWidth` | `primary` maks. satu per layar. `outline` untuk aksi kedua (Batal, Ubah). `dashed` untuk "+ Tambah …" sekunder. `danger` untuk tombol Hapus, `danger-solid` hanya di dialog konfirmasi |
| `IconButton`        | `subtle` · `raised` · `danger`; `sm` · `md`                                                                           | Wajib `aria-label`. `raised` untuk kontrol di atas peta                                                                                                                                |
| `Chip`              | `pressed`, `leading`                                                                                                  | Filter dan pilihan tunggal. Aktif = garis + teks putih                                                                                                                                 |
| `StatusMark`        | `status`, `sm` · `md` · `lg`                                                                                          | Bentuk status, tidak pernah berdiri tanpa teks                                                                                                                                         |
| `StatusBadge`       | `status`                                                                                                              | Pill bergaris + label status                                                                                                                                                           |
| `Eyebrow`           |                                                                                                                       | Satu-satunya pemakaian copper                                                                                                                                                          |
| `Input`, `TextArea` | `invalid`, `size`                                                                                                     | Selalu di dalam `FormField` atau punya `aria-label`                                                                                                                                    |

### Molecules

| Komponen        | Untuk                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------- |
| `FormField`     | Label + input + error (`aria-describedby` via `errorId()` dari `utils/form`) + penghitung |
| `SearchField`   | Pencarian pill dengan ikon dan label tersembunyi                                          |
| `EmptyState`    | Pesan kosong/gagal di dalam daftar (eyebrow + kalimat + aksi)                             |
| `ConfirmDialog` | Konfirmasi tindakan permanen. Fokus awal ke **Batal**, Escape menutup                     |
| `ToastView`     | Pesan singkat di bawah tengah peta. Sukses 3,5 detik, gagal 6 detik                       |
| `LoadingScreen` | `full` (logo berputar + nama app) · `inline`                                              |

### Pola layout (layouts/map)

| Pola                           | Isi                                                                       |
| ------------------------------ | ------------------------------------------------------------------------- |
| Kepala panel (`PanelHeader`)   | Eyebrow + tombol tutup (×), lalu judul serif                              |
| Footer aksi                    | Batal (`outline`, `flex-1`) + Simpan (`primary`, `flex-[2]`)              |
| Kartu pesan peta (`MapNotice`) | Judul serif 30px + kalimat `font-light text-text-3` + satu aksi `outline` |
| Banner server bangun           | Pill `surface-2` + spinner + "Menyiapkan server…" + detik                 |

---

## 🚦 Status entitas

| Status        | Label     | Bentuk                                             | Warna     | Badge                                 |
| ------------- | --------- | -------------------------------------------------- | --------- | ------------------------------------- |
| `active`      | Aktif     | ● lingkaran penuh                                  | `success` | `border-success-line text-success`    |
| `maintenance` | Perawatan | ◆ wajik (persegi diputar 45°, sedikit lebih kecil) | `warning` | `border-warning-line text-warning`    |
| `inactive`    | Nonaktif  | ○ lingkaran kosong                                 | `neutral` | `border-neutral-line text-text-muted` |

Urutan tampil selalu Aktif → Perawatan → Nonaktif (`ENTITY_STATUSES`). Label dari `ENTITY_STATUS_LABEL`,
jangan ditulis ulang di komponen.

---

## 🗺️ Peta

- **Tile:** Stadia Maps _Alidade Smooth Dark_ (`constants/map.ts`). Jangan ganti ke tile terang.
- **Marker:** `L.divIcon` dengan kelas `.pantau-marker--<status>` (`css/index.css`). Ukuran titik 14px (wajik 12px),
  area klik 32px. Bentuk dan warnanya sama dengan `StatusMark`.
- **Terpilih:** cincin tipis putih 40% + label nama (tooltip pill `surface-2`) di kanan marker.
- **Saat memilih lokasi / mengisi form:** marker lain diredupkan 45% dan tidak bisa diklik, kursor crosshair.
- **Pin lokasi draf:** titik putih 18px + cincin 46px, label pill **putih** ("Lokasi baru" / "Lokasi"). Bisa digeser.
- **Kontrol:** kanan atas, `IconButton raised md` bertumpuk (perbesar, perkecil, tampilkan semua).
- **Legenda:** kiri bawah, kartu `surface` bergaris. **Atribusi** wajib tampil (OSM, OpenMapTiles, Stadia).
- Jangan set `position` pada kelas marker: Leaflet memakai `position: absolute`.

---

## 📱 Layout & responsif

|                       | Desktop (≥ `lg` 1024px)                                      | Mobile (< 1024px)                                                         |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Kepala                | Top bar: logo + nama + tagline · status API · Tambah entitas | Di atas peta: logo + nama · status API (pill) · pencarian                 |
| Daftar                | Sidebar kiri 340px                                           | Bottom sheet: ringkas 320px ↔ luas `100dvh − 140px` (bisa ditarik)        |
| Detail / form / jenis | Panel kanan 380px (400px di `xl`)                            | Bottom sheet. Form & jenis: `100dvh − 108px`, peta tetap terlihat di atas |
| Tambah entitas        | Tombol di top bar                                            | Tombol mengambang di atas sheet, hilang saat sheet luas                   |

**Lapisan (z-index):** peta `0` · pane Leaflet `400–700` · overlay di atas peta `1000` · bottom sheet `1100` ·
dialog `3000`. Overlay di atas peta harus `pointer-events-none` di wadah dan `pointer-events-auto` di isinya.

Isi panel dirender **sekali**: di panel kanan (desktop) **atau** bottom sheet (mobile), lewat `useIsDesktop()`.

---

## ✨ Ikon & gerak

- **Ikon:** `lucide-react`, `strokeWidth={1.5}`, ukuran 14–18px (diatur lewat `[&_svg]:size-*` di parent).
  Ikon jenis entitas dipetakan di `constants/entity-icons.ts` (truck, cpu, building, pin, box, radio).
- **Gerak:** singkat dan fungsional saja. Tinggi sheet `300ms ease-out`, fly-to peta `0.8s`, spinner memuat.
  Tidak ada animasi dekoratif.

---

## ♿ Aksesibilitas

- Fokus keyboard: garis putih 2px, `outline-offset` 2px (global di `css/index.css`). Jangan dihapus.
- Kontras: teks penting minimal `text-text-muted` di atas `bg`/`surface`. `text-faint` hanya untuk placeholder/info sekunder.
- Tombol ikon wajib `aria-label`. Input wajib label (terlihat atau `sr-only`). Error dihubungkan lewat `aria-describedby`.
- Pilihan berbentuk chip memakai `aria-pressed`. Dialog: `role="alertdialog"` + `aria-modal` + judul `aria-labelledby`.
- Disabled: `opacity-40` + `cursor-not-allowed`. Sertakan `title` yang menjelaskan alasannya (mis. "masih dipakai 4 entitas").

---

## ✍️ Bahasa & copy

- Bahasa Indonesia, kalimat pendek, huruf kapital hanya di awal kalimat (_sentence case_).
- Tombol = kata kerja + objek: "Tambah entitas", "Simpan perubahan", "Isi koordinat manual", "Ya, hapus".
- Error field: huruf kecil, tanpa titik: `wajib diisi`, `minimal 3 karakter`, `harus antara -90 dan 90`.
  Aturan dan pesannya harus sama dengan backend.
- Toast: `Entitas "Nama" ditambahkan`, `Perubahan disimpan`, `Gagal menghapus. Entitas sudah tidak ada.`
- Dialog hapus selalu menyebut nama objek dan bahwa tindakan tidak bisa dibatalkan.

---

## ✅ Checklist sebelum UI baru dianggap selesai

- [ ] Hanya token warna. Tidak ada hex/`bg-[#…]`/warna palet Tailwind, tidak ada `dark:`
- [ ] Maksimal satu tombol putih di layar itu
- [ ] Serif hanya untuk teks ≥ 28px, copper hanya untuk eyebrow
- [ ] Tidak ada `shadow-*`; bentuk pill / 10px / 16px sesuai elemen
- [ ] Status tampil dengan warna + bentuk + teks
- [ ] Memakai komponen yang sudah ada (Button, Chip, FormField, …) sebelum membuat baru
- [ ] Keadaan lengkap: memuat, kosong, gagal (+ Coba lagi), sukses (toast)
- [ ] Dicek di desktop ≥ 1024px **dan** mobile 390px
- [ ] Bisa dipakai dengan keyboard; label & `aria-*` lengkap
- [ ] Copy bahasa Indonesia sesuai pola di atas

### Boleh / jangan

| ✅ Boleh                                                           | ❌ Jangan                                |
| ------------------------------------------------------------------ | ---------------------------------------- |
| `className="bg-surface-2 text-text-muted"`                         | `className="bg-[#22242b] text-gray-400"` |
| `<Eyebrow>Kendaraan</Eyebrow>`                                     | Teks copper untuk link atau tombol       |
| `<StatusBadge status="active" />`                                  | Titik hijau tanpa label                  |
| `border border-border` untuk memisahkan                            | `shadow-md`                              |
| `<Button variant="outline">Batal</Button>` di samping Simpan putih | Dua tombol putih bersebelahan            |
| `font-serif text-[30px]` untuk judul dialog                        | `font-serif text-sm`                     |
