<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/logo-dark.svg">
    <img src="docs/brand/logo-light.svg" alt="Pantau" width="300">
  </picture>
</p>

<p align="center">
  Aplikasi peta untuk menampilkan dan mengelola entitas yang punya lokasi geografis.<br>
  🚚 kendaraan · 📡 perangkat IoT · 🏢 fasilitas · dan jenis lain yang bisa ditambah sendiri
</p>

<p align="center">
  <a href="https://pantau-map.netlify.app"><img alt="Demo live" src="https://img.shields.io/badge/demo-pantau--map.netlify.app-cc9166?style=flat-square&logo=netlify&logoColor=white"></a>
  <a href="https://pantau-2am8.onrender.com/healthz"><img alt="API" src="https://img.shields.io/badge/API-Render-46E3B7?style=flat-square&logo=render&logoColor=white"></a>
</p>

<p align="center">
  <img alt="Go" src="https://img.shields.io/badge/Go-1.27-00ADD8?style=flat-square&logo=go&logoColor=white">
  <img alt="Gin" src="https://img.shields.io/badge/Gin-1.12-008ECF?style=flat-square&logo=gin&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white">
  <img alt="Leaflet" src="https://img.shields.io/badge/Leaflet-1.9-199900?style=flat-square&logo=leaflet&logoColor=white">
</p>

Setiap entitas punya **nama, jenis, status, deskripsi, atribut bebas** (key–value), dan **koordinat**.
Frontend **React + TypeScript**, backend **Go**, database **MongoDB**.

| | URL |
|---|---|
| 🌐 Aplikasi (Netlify) | https://pantau-map.netlify.app |
| 🔌 API (Render) | https://pantau-2am8.onrender.com/api/v1 · health check `/healthz` |

> [!NOTE]
> Backend memakai Render **Free**: server tidur setelah ±15 menit tanpa trafik, jadi request pertama bisa
> butuh ±30–60 detik. Aplikasi menampilkan banner **"Menyiapkan server… N dtk"** selama menunggu. ⏳

| Desktop | Mobile |
|---|---|
| <img src="docs/screenshots/desktop.png" alt="Tampilan desktop: sidebar daftar entitas, peta, legenda status" width="620"> | <img src="docs/screenshots/mobile.png" alt="Tampilan mobile: peta dengan bottom sheet daftar entitas" width="210"> |

## 🚀 Coba dalam 2 menit

Langsung di https://pantau-map.netlify.app. Kalau muncul banner "Menyiapkan server…", tunggu sampai data tampil.

1. **Lihat detail:** klik marker di peta atau baris di daftar. Peta terbang ke lokasi dan panel detail terbuka.
   Coba juga cari `sensor`, atau filter per jenis/status. Marker di peta ikut tersaring.
2. **Tambah:** **Tambah entitas** → klik titik di peta → isi nama, pilih jenis → **Simpan entitas**.
   Untuk melihat validasi, coba simpan dengan nama kosong atau latitude `91`.
3. **Ubah:** di panel detail → **Ubah** → geser pin putih atau ganti status → **Simpan perubahan**.
4. **Hapus:** di panel detail → **Hapus** → **Ya, hapus**.
5. **Kelola jenis** (di sidebar): tambah jenis bernama `kendaraan`. Backend menolak dengan `409 NAME_TAKEN`, dan
   pesannya muncul di input nama. Tombol hapus nonaktif untuk jenis yang masih dipakai entitas.
6. **Validasi backend tanpa frontend:**
   ```bash
   curl -X POST https://pantau-2am8.onrender.com/api/v1/entities \
     -H "Content-Type: application/json" -d '{"name":"ab","latitude":91}'
   ```
7. **Mobile:** buka di ponsel (atau mode perangkat di DevTools). Daftar ada di bottom sheet yang bisa ditarik
   naik/turun, dan form tambah/ubah tampil di sheet tinggi dengan pin tetap terlihat.

> [!TIP]
> 🧹 Database dipakai bersama. Mohon hapus kembali entitas atau jenis uji setelah mencoba. Data contoh bisa
> dikembalikan dengan `go run ./cmd/seed -reset`.

---

## 🧭 Daftar isi

1. ✨ [Fitur](#-fitur)
2. 🔧 [Cara menjalankan](#-cara-menjalankan)
3. 🧱 [Arsitektur & API](#-arsitektur--api)
4. 🔒 [Validasi di frontend dan backend](#-validasi-di-frontend-dan-backend)
5. 📚 [Alasan pemilihan library](#-alasan-pemilihan-library)
6. 🤖 [Workflow Agentic AI](#-workflow-agentic-ai)
7. 🚧 [Fitur yang belum selesai & batasan](#-fitur-yang-belum-selesai--batasan)
8. 📁 [Struktur repo](#-struktur-repo)

---

## ✨ Fitur

Sesuai functional requirement soal:

| Requirement | Implementasi |
|---|---|
| 🗺️ Menampilkan entitas di peta | Marker per entitas di peta Leaflet. Warna **dan bentuk** berbeda per status: Aktif = lingkaran, Perawatan = wajik, Nonaktif = lingkaran kosong. Peta otomatis menampilkan semua entitas saat dibuka |
| ➕ Menambah entitas di peta | **Tambah entitas** → klik titik di peta (atau isi koordinat manual) → isi form. Pin lokasi bisa digeser, koordinat di form ikut berubah, dan sebaliknya |
| ✏️ Mengubah entitas di peta | Detail → **Ubah**: form terisi data lama, pin bisa digeser ke lokasi baru |
| 🗑️ Menghapus entitas | Detail → **Hapus** → dialog konfirmasi yang menyebut nama entitas |
| 🔍 Melihat detail di peta | Klik marker atau baris daftar → peta terbang ke lokasi, panel detail berisi status, deskripsi, koordinat (bisa disalin), atribut, waktu dibuat/diubah |
| 🔒 Validasi FE & BE | Aturan yang sama di `zod` (browser) dan `validator` (Go). Error dari backend dipetakan ke input yang sama. Lihat [Validasi](#-validasi-di-frontend-dan-backend) |

Tambahan:

- 🏷️ **Jenis entitas sebagai master data** (panel *Kelola jenis*): tambah, ubah nama/ikon, hapus. Nama jenis unik
  tanpa membedakan huruf besar/kecil (`409 NAME_TAKEN`), dan jenis yang masih dipakai entitas tidak bisa
  dihapus (`409 TYPE_IN_USE`, tombol hapus juga dinonaktifkan di UI).
- 🔎 **Pencarian & filter** berdasarkan nama, jenis, dan status. Filter ikut menyaring marker di peta.
- 📱 **Responsif**: desktop (top bar · sidebar · peta · panel kanan) dan mobile (peta penuh + bottom sheet yang
  bisa ditarik naik/turun).
- 🧩 **Keadaan lengkap**: loading (skeleton), server sedang bangun, gagal memuat + *Coba lagi*, database kosong,
  hasil filter kosong, dan toast sukses/gagal.
- ♿ **Aksesibilitas dasar**: status tidak hanya dibedakan warna, marker bisa difokus dengan keyboard, dialog
  memfokuskan tombol *Batal* dan bisa ditutup dengan Escape, input memakai label dan `aria-describedby` untuk error.

---

## 🔧 Cara menjalankan

### 📋 Prasyarat

| Tool | Versi yang dipakai |
|---|---|
| Go | 1.27 |
| Node.js | 24 (minimal 20.19, kebutuhan Vite 8) |
| Yarn | 1.22 (classic) |
| MongoDB | MongoDB Atlas (gratis, M0) **atau** MongoDB lokal |

### 1. 🐹 Backend (Go)

```bash
cd backend
cp .env.example .env
```

Isi `.env`:

| Variabel | Contoh | Keterangan |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/` atau `mongodb://localhost:27017` | Wajib |
| `MONGODB_DB` | `pantau` | Nama database |
| `PORT` | `8080` | |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Origin frontend yang diizinkan CORS, dipisah koma |
| `GIN_MODE` | `debug` | `release` di production |

```bash
go run ./cmd/seed          # isi 3 jenis + 12 entitas contoh (dilewati kalau sudah ada data)
go run ./cmd/seed -reset   # kosongkan lalu isi ulang
go run ./cmd/server        # API di http://localhost:8080
go test ./...              # unit test
```

Saat start, server mengecek koneksi MongoDB dan membuat index (`2dsphere` untuk lokasi, index unik untuk nama
jenis). Cek dengan `curl http://localhost:8080/healthz` → `{"db":"up","status":"ok"}`.

### 2. 💻 Frontend (React)

```bash
cd frontend
cp .env.example .env       # VITE_API_BASE_URL=http://localhost:8080/api/v1
yarn install
yarn dev                   # http://localhost:5173
```

| Perintah | Fungsi |
|---|---|
| `yarn dev` | Dev server |
| `yarn build` | Type-check (`tsc -b`) + build produksi ke `dist/` |
| 💻 `yarn test` | Unit test (Vitest) |
| `yarn lint` / `yarn format` | ESLint / Prettier |

Frontend juga bisa langsung diarahkan ke API production dengan
`VITE_API_BASE_URL=https://pantau-2am8.onrender.com/api/v1` (origin `http://localhost:5173` sudah diizinkan).
Tile peta Stadia tidak butuh API key di `localhost`.

### 🌐 Deploy (semua tier gratis)

| Bagian | Platform | Konfigurasi |
|---|---|---|
| 🔌 API | Render Web Service, region Singapore | [`render.yaml`](render.yaml) (Blueprint). Env: `MONGODB_URI` (rahasia, diisi di dashboard), `MONGODB_DB`, `ALLOWED_ORIGINS`, `GIN_MODE=release`. Health check `/healthz` |
| 💻 Frontend | Netlify, base directory `frontend` | [`frontend/netlify.toml`](frontend/netlify.toml): build, Node 24, `VITE_API_BASE_URL`, redirect SPA, cache aset |
| 🍃 Database | MongoDB Atlas M0 | Network Access `0.0.0.0/0` karena IP keluar Render Free tidak tetap |
| 🗺️ Tile peta | Stadia Maps | Domain Netlify didaftarkan di akun Stadia (tanpa API key di kode) |

---

## 🧱 Arsitektur & API

```
┌──────────────────────┐  HTTPS / JSON  ┌──────────────────────┐  mongo-driver  ┌───────────────────────┐
│ React + Vite + TS    │ ─────────────▶ │ Go + Gin             │ ─────────────▶ │ MongoDB Atlas         │
│ Netlify              │ ◀───────────── │ Render               │ ◀───────────── │ GeoJSON + 2dsphere    │
└──────────────────────┘                └──────────────────────┘                └───────────────────────┘
```

**Backend:** `router → handler (bind JSON + validasi) → repository (query Mongo) → JSON`. Sengaja tanpa
*service layer* karena logikanya masih CRUD. Repository berupa **interface**, sehingga handler diuji dengan
repository palsu (in-memory) tanpa database. Package `entity` butuh "jenis ada?" dan package `entitytype` butuh
"berapa entitas memakai jenis ini?": masing-masing mendefinisikan interface kecil sendiri, lalu keduanya
disambungkan di `router.go`, jadi tidak ada import siklus.

**Lokasi** disimpan sebagai GeoJSON `{ type: "Point", coordinates: [lng, lat] }`, tetapi API selalu memakai
`latitude` dan `longitude` eksplisit supaya urutan `[lng, lat]` (GeoJSON) vs `[lat, lng]` (Leaflet) tidak
tertukar. Konversi hanya terjadi di backend.

**Frontend:** satu halaman. Data mengalir lewat pola `type → service (axios) → slice (Redux) → hook`, dan
komponen hanya memakai hook. Mode halaman (`lihat → pilih lokasi → form`, `kelola jenis`) disimpan di Redux,
dan isi panel dirender sekali: di panel kanan (desktop) atau bottom sheet (mobile).

### 🔌 Endpoint

Base URL `/api/v1`. Sukses: `{ "data": … }` atau `{ "data": [...], "total": n }`.

| Method | Endpoint | Keterangan | Sukses |
|---|---|---|---|
| `GET` | `/healthz` | Status server + ping MongoDB (di luar `/api/v1`, juga menerima `HEAD`) | 200 |
| `GET` | `/entities?typeId=&status=&q=` | Daftar entitas, terbaru di atas. `q` = cari nama tanpa beda huruf besar/kecil | 200 |
| `GET` | `/entities/:id` | Detail | 200 |
| `POST` | `/entities` | Buat | 201 |
| `PUT` | `/entities/:id` | Ubah seluruh field | 200 |
| `DELETE` | `/entities/:id` | Hapus | 204 |
| `GET` | `/entity-types` | Daftar jenis A–Z + `entityCount` | 200 |
| `GET` | `/entity-types/:id` | Detail jenis | 200 |
| `POST` | `/entity-types` | Buat `{ name, icon }` | 201 |
| `PUT` | `/entity-types/:id` | Ubah nama/ikon | 200 |
| `DELETE` | `/entity-types/:id` | Hapus, hanya jika tidak dipakai | 204 |

Contoh body entitas:

```json
{
  "name": "Sensor Suhu Gudang A",
  "typeId": "6740b0020000000000000000",
  "status": "active",
  "description": "Sensor suhu & kelembapan",
  "latitude": -6.9147,
  "longitude": 107.6098,
  "attributes": { "Baterai": "82%" }
}
```

### ❗ Format error (satu bentuk untuk semua endpoint)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "fields": { "name": "minimal 3 karakter", "latitude": "harus antara -90 dan 90" }
  }
}
```

| Kode | HTTP | Kapan |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Body tidak valid. `fields` berisi pesan per field (bahasa Indonesia) |
| `BAD_JSON` | 400 | Body kosong / bukan JSON |
| `INVALID_ID` | 400 | `:id` bukan ObjectID |
| `NOT_FOUND` | 404 | Entitas / jenis / endpoint tidak ada |
| `NAME_TAKEN` | 409 | Nama jenis sudah dipakai (tanpa beda huruf besar/kecil) |
| `TYPE_IN_USE` | 409 | Jenis masih dipakai. `details.entityCount` berisi jumlahnya |
| `INTERNAL` | 500 | Error lain (detail hanya di log server) |

---

## 🔒 Validasi di frontend dan backend

Aturannya sama di kedua sisi:

| Field | Aturan |
|---|---|
| `name` | Wajib, di-*trim*, 3–100 karakter |
| `typeId` | Wajib, ObjectID valid, dan jenisnya harus ada (dicek ke database) |
| `status` | `active` · `maintenance` · `inactive` |
| `description` | Opsional, maks. 500 karakter |
| `latitude` / `longitude` | Wajib, angka −90…90 / −180…180. `0` valid (khatulistiwa) |
| `attributes` | Opsional, maks. 10 pasang. Nama 1–30 karakter dan tidak kembar, nilai maks. 100 karakter |
| Jenis: `name` / `icon` | 2–50 karakter, unik · salah satu dari `truck`, `cpu`, `building`, `pin`, `box`, `radio` |

- **Frontend** (`frontend/src/schemas/*.schema.ts`): `zod` + `react-hook-form`. Pesan muncul di bawah input,
  ada ringkasan "Periksa N isian yang ditandai", dan fokus pindah ke isian pertama yang salah. Koordinat
  menerima koma desimal (`-6,9`).
- **Backend** (`backend/internal/*/dto.go`, `internal/httpx`): tag `validate` milik `go-playground/validator`
  dengan pesan bahasa Indonesia, plus validasi yang butuh database (jenis harus ada, nama jenis unik lewat
  index unik MongoDB). Tipe data salah (mis. `"latitude": "abc"`) dilaporkan di field-nya, bukan sebagai JSON rusak.
- **Error backend dipetakan ke input yang sama di frontend.** Contohnya `409 NAME_TAKEN` muncul di input nama
  jenis. Backend tetap memvalidasi penuh walaupun frontend sudah memeriksa, karena API bisa dipanggil langsung:

```bash
curl -X POST https://pantau-2am8.onrender.com/api/v1/entities \
  -H "Content-Type: application/json" -d '{"name":"ab","latitude":91}'
# → 400 VALIDATION_ERROR, fields: latitude, longitude, name, status, typeId
```

> [!IMPORTANT]
> 🪤 Jebakan Go yang ditangani: tag `required` menganggap `0` sebagai kosong, padahal `latitude: 0` valid.
> Karena itu `latitude`/`longitude` di DTO memakai `*float64`, sehingga "tidak dikirim" (`nil`) bisa dibedakan dari `0`.

### 🧪 Testing

| Bagian | Isi |
|---|---|
| 🐹 `go test ./...` | Test tabel validasi entitas (termasuk `latitude: 0`, tipe data salah, atribut), alur GET/PUT/DELETE/404, filter daftar, jenis (409 `NAME_TAKEN`, 409 `TYPE_IN_USE`, `entityCount`), dan parsing `ALLOWED_ORIGINS`. Memakai `httptest` + repository palsu |
| `yarn test` | 14 test Vitest: skema `zod` (batas koordinat, koma desimal, trim, atribut kembar), util filter, `cn()` |
| 🌐 Manual E2E di production | Tambah → refresh (data tersimpan) → ubah → hapus → input salah, dari situs Netlify ke API Render |

---

## 📚 Alasan pemilihan library

### 🐹 Backend

| Library | Alasan |
|---|---|
| **Gin** | Framework HTTP Go yang paling banyak contohnya, cocok untuk yang baru belajar Go. Routing grup (`/api/v1`), middleware, dan helper JSON sudah tersedia |
| **go-playground/validator** | Aturan validasi cukup ditulis sebagai tag struct. Dipakai sebagai instance sendiri di `internal/httpx`: nama field diambil dari tag `json`, ada tag kustom (`objectid`, `lat`, `lng`), dan pesan diterjemahkan ke bahasa Indonesia |
| **mongo-driver v2** | Driver resmi MongoDB untuk Go |
| **gin-contrib/cors** | CORS dengan daftar origin dari env (`ALLOWED_ORIGINS`), jadi bisa beda antara lokal dan production |
| **godotenv** | Membaca `.env` saat development. Di Render, nilainya dari env var dashboard |

### 🍃 Database: MongoDB

Data entitas cocok sebagai dokumen: atribut bebas (`attributes`) tidak perlu tabel tambahan. MongoDB punya tipe
**GeoJSON** dan index **2dsphere** untuk data lokasi, sehingga query area (`$geoWithin`, `$near`) bisa ditambah
nanti tanpa mengubah skema. Atlas M0 gratis dan bisa diakses dari Render.

### 💻 Frontend

| Library | Alasan |
|---|---|
| **React 19 + Vite + TypeScript** | Wajib dari soal (React + TS). Vite membuat dev server dan build cepat. Proyek di-*scaffold* dengan skill `/init-react` milik saya supaya struktur dan konvensinya sama dengan proyek saya yang lain |
| **Leaflet + react-leaflet** | Library peta open-source tanpa API key, ringan, dan mudah membuat marker kustom (`L.divIcon`), event klik peta, dan marker yang bisa digeser, yang semuanya dibutuhkan untuk tambah/ubah lokasi |
| **Stadia Maps (Alidade Smooth Dark)** | Tile peta gelap yang cocok dengan tema UI. Rencana awal memakai CARTO Dark Matter, tetapi saat pengerjaan CARTO ternyata sudah mewajibkan API key. Stadia gratis untuk non-komersial, tanpa kunci di localhost, dan di production cukup mendaftarkan domain |
| **Redux Toolkit** (+ redux-persist) | State data (entitas, jenis) dan state UI (filter, entitas terpilih, mode tambah/ubah, toast) dipakai lintas komponen. Polanya mengikuti konvensi proyek saya: service → slice → hook. redux-persist ikut terpasang dari konvensi, tetapi whitelist-nya kosong karena aplikasi ini tanpa login |
| **axios** | Instance dengan base URL dan timeout 90 detik (untuk cold start Render), plus helper membaca format error backend (`getApiErrorMessage`, `getApiFieldErrors`) |
| **react-hook-form + zod** | Skema validasi ditulis sekali dan type-safe. Error per field mudah ditampilkan, dan error dari backend bisa disuntikkan ke field yang sama dengan `setError` |
| **Tailwind CSS v4** | Styling cepat dengan token tema di satu file (`src/css/index.css`). Komponen hanya memakai nama token (`bg-surface`, `text-text-muted`), tanpa hex tersebar |
| **lucide-react** | Ikon konsisten, termasuk ikon jenis entitas (truk, chip, gedung, …) |
| **@fontsource** (Inter, Playfair Display) | Font di-bundle bersama aplikasi, tanpa request ke Google Fonts |
| **react-router-dom** | Saat ini hanya satu halaman, tetapi sudah ada lazy route + redirect path tak dikenal, dan siap kalau nanti ada halaman lain |
| **Vitest + Testing Library**, **ESLint + Prettier** | Test unit sejalan dengan Vite. Lint dan format menjaga konsistensi kode |

### 🎨 Desain UI

Desain dibuat lebih dulu sebelum coding: prototipe desktop interaktif, layar mobile, alur → API, state &
feedback, dan design system. Tema **"Midnight Vault"** (gelap, serif + sans, aksen copper) dipilih supaya
tidak terlihat seperti template dashboard umum. Aturan desainnya: maksimal satu tombol putih per layar, serif
hanya untuk teks ≥ 28px, tanpa bayangan, dan status selalu memakai warna + bentuk + teks.

Semua aturan itu (token warna, tipografi, komponen, status, peta, responsif, aksesibilitas, copy, dan checklist)
didokumentasikan di 🎨 [`frontend/DESIGN_SYSTEM.md`](frontend/DESIGN_SYSTEM.md) supaya pengembangan berikutnya
tetap konsisten.

---

## 🤖 Workflow Agentic AI

Pengerjaan memakai **Claude Code** (aplikasi desktop, model Claude Opus) sebagai agen yang bisa membaca/menulis
file, menjalankan perintah terminal, dan mengoperasikan browser. Peran saya sebagai pengarah dan reviewer:
memutuskan, mengecek hasil, dan meminta revisi.

**Alurnya:**

1. **Perencanaan.** AI membaca PDF soal lalu menyusun [`pantau_project_plan.md`](pantau_project_plan.md)
   (arsitektur, model data, API, deploy, risiko) dan [`TASKS.md`](TASKS.md) (10 tugas dengan kriteria cek).
   Saya memilih stack (MongoDB, Netlify + Render gratis) dan menyetujui plan.
2. **Desain sebelum kode.** AI membuat desain UI/UX sebagai artifact (prototipe interaktif + mobile + design
   system). Saya menolak tema pertama karena terlalu generik, memilih tema dari referensi yang saya berikan,
   lalu meminta revisi (warna kurang gelap, ringkasan angka mobile jadi grid 3 kolom, menambah CRUD jenis).
3. **Implementasi per tugas dengan gerbang review.** Setiap tugas di `TASKS.md` dikerjakan sampai selesai,
   diuji, lalu berhenti menunggu saya: **OK** (commit & lanjut) atau **revisi**. Commit dan push hanya
   dilakukan setelah saya setujui.
4. **Verifikasi oleh AI**, bukan sekadar menulis kode:
   - backend: `go test`, lalu `curl` ke semua endpoint (termasuk input salah) secara lokal dan di production;
   - frontend: `yarn lint`, `yarn build`, `yarn test`, lalu dicek langsung di browser (desktop 1440 px dan
     mobile 390 px) memakai data API sungguhan;
   - E2E di production setelah deploy.
5. **Bug yang ditemukan AI saat verifikasi** (dan diperbaiki sebelum saya review), antara lain:
   - `RootState` Redux diam-diam menjadi `any` karena `persistReducer()` ditulis langsung di `configureStore()`;
   - marker tergambar ±130 px dari titik aslinya karena CSS menimpa `position: absolute` milik Leaflet;
   - tile CARTO ternyata butuh API key, sehingga diganti Stadia;
   - CORS 403 di production karena `ALLOWED_ORIGINS` diisi dengan `/` di akhir, sehingga backend sekarang merapikannya otomatis;
   - latitude salah ketik diam-diam tertimpa posisi pin saat form disimpan;
   - badge Netlify menutupi tombol Simpan.
6. **Revisi dari saya** setelah mencoba sendiri, misalnya bottom sheet mobile dibuat bisa ditarik supaya daftar
   terlihat lebih banyak, dan sheet kembali ringkas setelah memilih entitas supaya marker terlihat.
7. **Belajar Go.** Karena Go baru bagi saya, kode backend diberi komentar penjelasan (bahasa Indonesia) tentang
   pointer, interface, error handling, dan `context`, dan AI menjelaskan konsepnya saat diminta.

**Sejauh mana AI dipakai:** saya berperan sebagai pengarah dan reviewer: menentukan stack, desain, dan cakupan
fitur, memecah pekerjaan menjadi tugas, lalu menguji dan mereview hasil setiap tugas sebelum di-commit.
Implementasi kode, test, dan draf dokumentasi dikerjakan agen AI berdasarkan arahan tersebut, dan saya meminta
revisi bila hasilnya belum sesuai. Pembuatan akun dan kredensial (GitHub, MongoDB Atlas, Render, Netlify, Stadia),
pengisian env var dan koneksi deploy di dashboard, serta pengiriman submission saya lakukan sendiri. AI tidak
pernah memegang password atau connection string.

**Aturan untuk AI** ada di [`CLAUDE.md`](CLAUDE.md) (root) dan [`frontend/CLAUDE.md`](frontend/CLAUDE.md):
konvensi kode, perintah, batasan (tidak commit/deploy tanpa izin, tidak commit `.env`), dan format pesan commit.
Riwayat commit (`git log`) mengikuti urutan tugas di `TASKS.md`.

---

## 🚧 Fitur yang belum selesai & batasan

| Item | Status |
|---|---|
| Query berdasarkan area peta (bbox `$geoWithin`) | ⏳ Belum. Index `2dsphere` sudah ada, tetapi daftar masih dimuat semua lalu disaring di browser. Cukup untuk data puluhan–ratusan entitas, belum untuk ribuan |
| Pagination API & cluster marker | ⏳ Belum, dengan alasan yang sama |
| Docker / docker-compose untuk jalan lokal | ⏳ Belum. Jalan lokal memakai Go + Node langsung (lihat [Cara menjalankan](#-cara-menjalankan)) |
| Test otomatis komponen React & E2E (Playwright) | ⏳ Belum. Test FE baru untuk skema validasi dan util. E2E dilakukan manual di browser |
| Autentikasi / hak akses | 🚫 Di luar cakupan soal. Semua orang yang membuka situs bisa mengubah data |
| Hapus jenis vs tambah entitas bersamaan | ⚠️ Cek "jenis masih dipakai" lalu hapus belum dalam satu transaksi. Kalau ada entitas dibuat tepat di antara dua langkah itu, jenisnya tetap terhapus. Risiko kecil untuk skala aplikasi ini |
| Cold start Render Free | ⚠️ Request pertama setelah server tidur bisa ±30–60 detik. Ditangani dengan banner dan timeout 90 detik, bukan dihilangkan |
| Desain UI/UX | ℹ️ Dibuat sebagai artifact Claude (privat). Bisa dibagikan kalau dibutuhkan. Aturan lengkapnya didokumentasikan di [`frontend/DESIGN_SYSTEM.md`](frontend/DESIGN_SYSTEM.md) |

---

## 📁 Struktur repo

```
.
├── backend/                     Go API
│   ├── cmd/server/              entrypoint HTTP server
│   ├── cmd/seed/                data contoh (3 jenis, 12 entitas)
│   └── internal/
│       ├── config/              env → Config
│       ├── database/            koneksi MongoDB + index
│       ├── entity/              model, DTO + validasi, repository, handler, test
│       ├── entitytype/          sama, untuk jenis entitas
│       ├── httpx/               format error, bind JSON, validator + pesan Indonesia
│       └── server/              router, CORS, /healthz
├── frontend/                    React + Vite + TS (lihat frontend/CLAUDE.md & DESIGN_SYSTEM.md)
│   └── src/
│       ├── app/                 router, ErrorBoundary, pages/MapPage
│       ├── components/          atoms & molecules generik (atomic design)
│       ├── layouts/map/         komponen halaman peta (MapView, EntityForm, MobileSheet, …)
│       ├── hooks/ redux/ services/ schemas/ types/ utils/ constants/
│       └── css/index.css        token tema Midnight Vault (Tailwind v4)
├── docs/brand/                  logo Pantau (SVG terang/gelap + ikon)
├── docs/screenshots/            gambar untuk README
├── render.yaml                  Blueprint Render (backend)
├── CLAUDE.md                    instruksi untuk agen AI (root)
├── TASKS.md                     daftar tugas & progres
└── pantau_project_plan.md       rencana teknis lengkap
```
