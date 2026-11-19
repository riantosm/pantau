# Project Plan & Technical Blueprint: Pantau

> Jawaban untuk **Take-Home Test — Software Developer** (lihat `Take-Home Test - Software Developer.pdf`).
> Nama app **Pantau** hanya nama kerja dan bisa diganti kapan saja.

## 1. Ringkasan Produk

**Pantau** adalah aplikasi peta untuk menampilkan dan mengelola entitas yang memiliki lokasi geografis,
misalnya kendaraan, perangkat IoT, atau lokasi fasilitas. Setiap entitas punya identitas, atribut dasar,
status, dan koordinat.

### Functional requirement (dari soal) → fitur

| Requirement di soal | Fitur di Pantau |
|---|---|
| Menampilkan entitas ke dalam map | Peta penuh dengan marker. Warna = status, ikon = jenis. Daftar entitas di sidebar tersinkron dengan peta |
| Menambah, menghapus, update entitas pada map | **Tambah**: klik titik di peta, lalu isi form (lat/lng terisi otomatis). **Ubah**: form + marker bisa digeser. **Hapus**: dialog konfirmasi |
| Melihat detail entitas pada map | Klik marker atau item daftar, lalu panel detail terbuka dan peta *fly-to* ke lokasi |
| Validasi input di backend dan frontend | FE: `zod` + `react-hook-form` (pesan per field). BE: Gin binding + `go-playground/validator`. Error BE dipetakan ke field form |
| *(tambahan)* Kelola jenis entitas | CRUD master data **Jenis** (nama + ikon) dari tombol "Kelola jenis" di sidebar. Filter, ikon daftar, dan pilihan di form entitas mengikuti data jenis. Jenis yang masih dipakai entitas tidak bisa dihapus |

### Wajib dari soal
- Frontend **React + TypeScript**, backend **Go**, data disimpan dan diambil lewat backend.
- Dokumentasi: cara menjalankan, alasan memilih library, workflow Agentic AI, dan fitur yang belum selesai.
- Ada `CLAUDE.md` di repo karena pengerjaan memakai Agentic AI.
- Deadline **2 hari** setelah soal diterima (soal diterima 18 Nov 2026, jadi ± **20 Nov 2026**; pastikan jam tepatnya).
- Pengiriman: link repo Git (+ link demo) lewat email ke dua alamat di PDF. Email dikirim sendiri olehmu.

---

## 2. Arsitektur & Tech Stack

```
┌────────────────────┐   HTTPS/JSON   ┌────────────────────┐   mongo driver   ┌──────────────────────┐
│ React + Vite (TS)  │ ─────────────▶ │  Go API (Gin)      │ ───────────────▶ │ MongoDB Atlas (M0)   │
│ Netlify (gratis)   │ ◀───────────── │  Render Free       │ ◀─────────────── │ 2dsphere index       │
└────────────────────┘                └────────────────────┘                  └──────────────────────┘
```

| Bagian | Pilihan | Alasan |
|---|---|---|
| Frontend | React + Vite + TypeScript, scaffold dengan skill `/init-react` | Wajib dari soal. Vite cepat, dan konvensinya sudah dipakai di project lain (atomic design, alias `@/`, Tailwind v4, `netlify.toml`) |
| Map | `leaflet` + `react-leaflet` | Gratis tanpa API key, ringan, dokumentasi banyak, mudah membuat marker kustom dan event klik peta |
| Tile peta | CARTO Dark Matter (berbasis OpenStreetMap) | Gratis dan gelap, cocok dengan tema Midnight Vault, sehingga marker berwarna terlihat jelas |
| State | Redux Toolkit + **RTK Query** | RTK Query mengurus fetch, cache, loading/error, dan *invalidate* otomatis setelah create/update/delete. State UI (entitas terpilih, mode tambah, filter) disimpan di slice biasa |
| Form + validasi FE | `react-hook-form` + `zod` | Skema validasi sekali tulis, type-safe, dan error per field |
| Styling | Tailwind CSS v4 + token tema **Midnight Vault** (gelap, versi terang) | Sesuai konvensi. Semua warna lewat token `@theme`, jadi tidak ada hex yang tersebar di komponen |
| Font | Playfair Display (judul ≥ 28px, angka) + Inter (UI) dari Google Fonts | Kombinasi serif–sans membuat UI tidak terlihat seperti template SaaS biasa |
| Ikon | `lucide-react` | Sesuai konvensi, ada ikon truck, cpu, building |
| Backend | Go 1.23+ + **Gin** | Paling ramah untuk pemula Go, contoh di internet sangat banyak, dan validasi bawaan lewat tag struct |
| Validasi BE | `go-playground/validator` (bawaan Gin) | Aturan cukup ditulis sebagai tag, misalnya `binding:"required,min=3,max=100"` |
| DB driver | `go.mongodb.org/mongo-driver/v2` | Driver resmi MongoDB |
| CORS | `github.com/gin-contrib/cors` | Mengizinkan origin Netlify dari env |
| Config | `github.com/joho/godotenv` (lokal saja) | Membaca `.env` saat development. Di Render cukup env var |
| Database | MongoDB Atlas M0 | Gratis selamanya (512 MB), punya tipe **GeoJSON** + index `2dsphere` untuk data lokasi |
| Hosting | Netlify (FE), Render Free Web Service (BE), Atlas M0 (DB) | Semua gratis tanpa kartu kredit |

---

## 3. Model Data

### Entity (dokumen MongoDB, koleksi `entities`)

```json
{
  "_id": "ObjectId(\"6740a1...\")",
  "name": "Truk Logistik B 9123 XY",
  "typeId": "ObjectId(\"6740b001...\")",
  "status": "active",
  "description": "Rute Bandung - Jakarta",
  "location": { "type": "Point", "coordinates": [107.6191, -6.9175] },
  "attributes": { "plat": "B 9123 XY", "driver": "Andi" },
  "createdAt": "2026-11-18T10:00:00Z",
  "updatedAt": "2026-11-18T10:00:00Z"
}
```

- `typeId`: referensi ke koleksi `entity_types` (lihat di bawah).
- `status`: `active` (Aktif) · `inactive` (Nonaktif) · `maintenance` (Perawatan). Tetap enum karena tiap status punya arti dan bentuk marker sendiri.
- `attributes`: pasangan key-value bebas (opsional), misalnya plat nomor, baterai, atau kapasitas.
- Index: `{ location: "2dsphere" }`, `{ typeId: 1, status: 1 }`.

### Jenis (koleksi `entity_types`)

```json
{
  "_id": "ObjectId(\"6740b001...\")",
  "name": "Kendaraan",
  "icon": "truck",
  "createdAt": "2026-11-18T10:00:00Z",
  "updatedAt": "2026-11-18T10:00:00Z"
}
```

- `icon`: salah satu dari `truck`, `cpu`, `building`, `pin`, `box`, `radio`. Frontend memetakan nama ini ke ikon lucide.
- Index unik `{ name: 1 }` dengan collation `{ locale: "id", strength: 2 }`, sehingga "kendaraan" dan "Kendaraan" dianggap sama.
- Seed awal: Kendaraan (`truck`), Perangkat IoT (`cpu`), Fasilitas (`building`).
- **Hapus jenis** hanya boleh kalau `countDocuments({ typeId })` = 0. Kalau tidak, backend membalas `409 TYPE_IN_USE`.
- Response `GET /entity-types` menyertakan `entityCount`, supaya UI bisa menampilkan "3 entitas memakai jenis ini" dan menonaktifkan tombol hapus.

> ⚠️ **Urutan koordinat.** GeoJSON memakai `[longitude, latitude]`, sedangkan Leaflet memakai `[lat, lng]`.
> Supaya tidak tertukar, **API memakai `latitude` dan `longitude` eksplisit**. Konversi ke GeoJSON hanya
> terjadi di dalam backend (repository).

### Aturan validasi (sama di FE dan BE)

| Field | Aturan |
|---|---|
| `name` | Wajib, di-*trim*, 3–100 karakter |
| `typeId` | Wajib, ObjectID valid, dan jenisnya harus ada di `entity_types` (kalau tidak: `fields.typeId = "jenis tidak ditemukan"`) |
| `status` | Wajib, salah satu dari `active`, `inactive`, `maintenance` |
| `description` | Opsional, maks. 500 karakter |
| `latitude` | Wajib, angka −90 sampai 90 |
| `longitude` | Wajib, angka −180 sampai 180 |
| `attributes` | Opsional, maks. 10 pasang. Key 1–30 karakter (unik), value maks. 100 karakter |
| `:id` (path) | Harus ObjectID valid. Kalau tidak → `400 INVALID_ID`; tidak ditemukan → `404 NOT_FOUND` |

**Validasi Jenis:**

| Field | Aturan |
|---|---|
| `name` | Wajib, di-*trim*, 2–50 karakter, unik (tanpa beda huruf besar/kecil). Kembar → `409 NAME_TAKEN` |
| `icon` | Wajib, salah satu dari `truck`, `cpu`, `building`, `pin`, `box`, `radio` |

> ⚠️ **Jebakan Go/Gin.** Tag `required` menganggap angka `0` sebagai kosong, padahal `latitude: 0`
> itu valid (garis khatulistiwa). Pakai **pointer** `*float64` supaya bisa membedakan "tidak diisi" dan "nol".

---

## 4. Desain REST API

Base URL: `/api/v1`. Semua respons berformat JSON.

| Method | Endpoint | Keterangan | Sukses |
|---|---|---|---|
| `GET` | `/healthz` | Cek server + ping Mongo. Dipakai Render health check dan untuk "membangunkan" server | `200` |
| `GET` | `/api/v1/entities?typeId=&status=&q=` | Daftar entitas. `q` = cari nama (case-insensitive) | `200` |
| `GET` | `/api/v1/entities/:id` | Detail satu entitas | `200` |
| `POST` | `/api/v1/entities` | Buat entitas | `201` |
| `PUT` | `/api/v1/entities/:id` | Ubah entitas (seluruh field) | `200` |
| `DELETE` | `/api/v1/entities/:id` | Hapus entitas | `204` |
| `GET` | `/api/v1/entity-types` | Daftar jenis + `entityCount` per jenis | `200` |
| `GET` | `/api/v1/entity-types/:id` | Detail satu jenis | `200` |
| `POST` | `/api/v1/entity-types` | Buat jenis `{ name, icon }` | `201` |
| `PUT` | `/api/v1/entity-types/:id` | Ubah nama/ikon jenis | `200` |
| `DELETE` | `/api/v1/entity-types/:id` | Hapus jenis (hanya jika tidak dipakai) | `204` |

**Request body (POST/PUT):**
```json
{
  "name": "Sensor Suhu Gudang A",
  "typeId": "6740b002...",
  "status": "active",
  "description": "Sensor suhu & kelembapan",
  "latitude": -6.9147,
  "longitude": 107.6098,
  "attributes": { "baterai": "82%" }
}
```

**Respons sukses:**
```json
{ "data": { "id": "6740a1...", "name": "...", "latitude": -6.9147, "longitude": 107.6098, "...": "..." } }
{ "data": [ ... ], "total": 12 }
```

**Respons error (format tunggal):**
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
| `VALIDATION_ERROR` | 400 | Body tidak valid. `fields` berisi pesan per field |
| `BAD_JSON` | 400 | Body bukan JSON yang valid |
| `INVALID_ID` | 400 | `:id` bukan ObjectID |
| `NOT_FOUND` | 404 | Entitas atau jenis tidak ada |
| `NAME_TAKEN` | 409 | Nama jenis sudah dipakai |
| `TYPE_IN_USE` | 409 | Jenis masih dipakai entitas. `details.entityCount` berisi jumlahnya |
| `INTERNAL` | 500 | Error lain (detailnya hanya di log server) |

---

## 5. Struktur Repo (monorepo)

```
pantau/
├── backend/
│   ├── cmd/
│   │   ├── server/main.go        # entrypoint: baca config → konek Mongo → jalankan HTTP
│   │   └── seed/main.go          # isi ±12 data contoh (Bandung & Jakarta)
│   ├── internal/
│   │   ├── config/config.go      # baca env (PORT, MONGODB_URI, MONGODB_DB, ALLOWED_ORIGINS)
│   │   ├── database/mongo.go     # koneksi + buat index
│   │   ├── entity/
│   │   │   ├── model.go          # struct Entity (bentuk di DB) + GeoPoint
│   │   │   ├── dto.go            # struct request/response + tag validasi
│   │   │   ├── repository.go     # query Mongo (interface → mudah di-mock untuk test)
│   │   │   ├── handler.go        # handler Gin: List, Get, Create, Update, Delete
│   │   │   └── handler_test.go   # test pakai httptest + repository palsu
│   │   ├── entitytype/           # pola sama: model, dto, repository, handler, test
│   │   │                         # + cek "masih dipakai" sebelum hapus
│   │   ├── httpx/errors.go       # helper format error + terjemahan pesan validator
│   │   └── server/router.go      # route, CORS, middleware
│   ├── .env.example
│   ├── go.mod / go.sum
│   └── Dockerfile                # opsional, untuk docker-compose lokal
├── frontend/                     # hasil /init-react (React + Vite + TS)
│   ├── src/
│   │   ├── components/{atoms,molecules,organisms}/   # MapView, EntityMarker, EntityList, EntityForm, ...
│   │   ├── features/entities/    # RTK Query api slice, zod schema, types, ui slice
│   │   └── pages/MapPage.tsx
│   ├── .env.example              # VITE_API_URL
│   └── netlify.toml
├── README.md                     # dokumentasi untuk penguji
├── CLAUDE.md                     # instruksi Agentic AI (wajib dari soal)
├── TASKS.md                      # progres kerja
└── pantau_project_plan.md        # dokumen ini
```

**Alur request di backend (untuk pemula Go):**
`router.go` → `handler.go` (bind JSON + validasi) → `repository.go` (query Mongo) → kembali ke handler → JSON.
Sengaja tanpa *service layer* karena logikanya masih CRUD sederhana. Lebih sedikit lapisan berarti lebih mudah dijelaskan saat interview.

---

## 6. UI/UX

Desain lengkap ada di artifact [Pantau — UI/UX Design](https://claude.ai/artifact/PTAyQ4EPYt4tHhrVb8Pr7X): prototipe desktop interaktif, 2 layar mobile, alur → API, state & feedback, dan design system.

**Tema: Midnight Vault, versi terang.**

| Token | Hex | Dipakai untuk |
|---|---|---|
| `bg` / `map` | `#16171c` / `#1a1c21` | Latar halaman / dasar peta |
| `card` / `raised` | `#1b1d23` / `#22242b` | Panel kanan, kartu / input, baris terpilih |
| `line` / `line-strong` | `#2c2e36` / `#3a3d47` | Garis rambut / outline pill & input |
| `fg-strong` / `fg` / `fg-muted` / `fg-faint` | `#ffffff` / `#e6e7ec` / `#9da0ad` / `#848796` | Judul / body / label / placeholder |
| `copper` | `#cc9166` | Hanya eyebrow kategori (jenis entitas, "Langkah 1 dari 2") |
| `ok` / `warn` / `bad` | `#8fb59a` / `#d4b06a` / `#e59a9a` | Aktif (●) / Perawatan (◆) / error & hapus |

**Aturan:**
- Tombol putih terisi hanya satu per layar.
- Serif hanya untuk teks ≥ 28px.
- Tanpa bayangan. Pemisah antarbagian memakai tingkat permukaan + garis 1px.
- Tombol, input, dan tag berbentuk pill. Kartu memakai radius 10px.
- Status selalu ditampilkan lewat warna + bentuk + teks: Nonaktif = lingkaran kosong.

- **Desktop (≥ 1024 px):** top bar (logo, ringkasan jumlah per status, tombol **+ Tambah Entitas**),
  sidebar kiri (cari, filter chip jenis/status, daftar entitas), peta di tengah, panel kanan untuk detail/form.
- **Mobile:** peta penuh + bottom sheet (daftar ↔ detail ↔ form) + tombol tambah mengambang.
- **Alur tambah:** klik *Tambah*, lalu masuk **mode pilih lokasi** (kursor crosshair + banner petunjuk).
  Klik di peta untuk memasang pin sementara, lalu form terbuka dengan lat/lng terisi. Pin bisa digeser; field lat/lng ikut berubah.
- **Alur ubah:** dari panel detail klik *Ubah*. Form terisi data lama dan marker bisa digeser.
- **Alur hapus:** dari panel detail klik *Hapus*, lalu konfirmasi dengan nama entitas. Hasilnya muncul sebagai toast.
- **Kelola jenis:** tombol "Kelola jenis" di sidebar membuka panel master data. Isinya daftar jenis (ikon, nama, jumlah entitas pemakai), form inline nama + pilih ikon, dan tombol hapus yang nonaktif kalau jenis masih dipakai. Chip filter dan pilihan di form entitas langsung ikut berubah.
- **State wajib:** loading (skeleton), server bangun dari tidur (banner "Menyiapkan server… ±50 detik"),
  kosong, error + coba lagi, error validasi per field, toast sukses/gagal.
- **Bahasa:** UI berbahasa Indonesia, nilai enum di API berbahasa Inggris.

---

## 7. Deploy (semua gratis)

### MongoDB Atlas (M0)
1. Buat project → cluster **M0 Free**, region **AWS Singapore (ap-southeast-1)**.
2. *Database Access*: buat user + password.
3. *Network Access*: izinkan `0.0.0.0/0`, karena IP keluar Render free tidak tetap.
4. Salin connection string `mongodb+srv://...` → `MONGODB_URI`.

### Render (backend Go)
1. New → **Web Service** → hubungkan repo GitHub.
2. Root Directory `backend`, Runtime **Go**, Region **Singapore**, Instance **Free**.
3. Build: `go build -tags netgo -ldflags '-s -w' -o app ./cmd/server` · Start: `./app`.
4. Env: `MONGODB_URI`, `MONGODB_DB=pantau`, `ALLOWED_ORIGINS=https://<site>.netlify.app`, `GIN_MODE=release`.
   `PORT` diisi otomatis oleh Render.
5. Health check path: `/healthz`.

> Free instance **tidur setelah ±15 menit tanpa trafik**, dan request pertama bisa butuh ±30–60 detik.
> Ditangani dengan banner "Menyiapkan server" di FE + catatan di README.

### Netlify (frontend)
1. Import repo, lalu isi Base directory `frontend`, Build `yarn build`, Publish `dist`.
2. Env: `VITE_API_URL=https://<service>.onrender.com/api/v1`.
3. `netlify.toml` berisi redirect SPA `/* → /index.html 200`.
4. Setelah dapat URL Netlify, perbarui `ALLOWED_ORIGINS` di Render.

---

## 8. Testing

- **Backend:** `go test ./...`. Table-driven test untuk validasi (nama kosong, lat 91, type salah, `latitude: 0` valid)
  dan test handler dengan `httptest` + repository palsu (201, 400, 404, 204).
  Untuk jenis: nama kembar → 409 `NAME_TAKEN`, hapus jenis yang dipakai → 409 `TYPE_IN_USE`, entitas dengan `typeId` tak dikenal → 400.
- **Frontend:** `yarn build` (type-check) + `yarn lint`. Opsional: Vitest untuk skema `zod`.
- **Manual E2E di production:** tambah, lihat detail, ubah (geser pin), hapus, coba input salah, lalu refresh untuk memastikan data tersimpan.

---

## 9. Risiko & Jebakan

| Risiko | Penanganan |
|---|---|
| Urutan `[lng, lat]` vs `[lat, lng]` tertukar | API pakai `latitude`/`longitude` eksplisit, konversi hanya di repository |
| `required` Gin menolak `0` | Pakai `*float64` |
| Ikon marker default Leaflet rusak saat di-bundle Vite | Pakai `L.divIcon` kustom (sekalian berwarna sesuai status) |
| CORS gagal di production | `ALLOWED_ORIGINS` dari env, uji dari URL Netlify sungguhan |
| Render cold start | Banner di FE, ping `/healthz` saat app dibuka, catatan di README |
| Atlas menolak koneksi | Network Access `0.0.0.0/0` |
| Waktu 2 hari, baru belajar Go | Deploy backend lebih awal (Hari 1), fitur bonus hanya jika sempat |

---

## 10. Roadmap (2 hari)

| Kapan | Target |
|---|---|
| Hari 0 (18 Nov, sore) | Plan + TASKS + desain UI disetujui · install Go · Tour of Go dasar · akun Atlas/Render/Netlify/GitHub |
| Hari 1 (19 Nov, pagi–siang) | Backend: fondasi → CRUD + validasi + test → **deploy Render** |
| Hari 1 (19 Nov, sore–malam) | Frontend: scaffold, layout, peta + marker + daftar + detail |
| Hari 2 (20 Nov, pagi–siang) | Frontend: tambah/ubah/hapus + validasi + semua state |
| Hari 2 (20 Nov, sore) | Deploy Netlify · uji E2E · README + CLAUDE.md · kirim email |

**Bonus jika sempat:** seed data, filter berdasarkan area peta (bbox + `$geoWithin`), docker-compose lokal, Vitest FE,
cluster marker kalau datanya banyak.

---

## 11. Dokumentasi Agentic AI (untuk README)

Ditulis apa adanya:
1. **Perencanaan:** AI membaca soal, lalu menyusun plan, TASKS, dan desain UI. Semuanya direview dan disetujui manual.
2. **Implementasi:** dikerjakan per tugas di `TASKS.md`. AI menulis kode, lalu kode dibaca dan dijalankan sendiri sebelum tugas ditandai OK.
3. **Belajar Go:** AI dipakai untuk menjelaskan konsep (struct tag, error handling, context, pointer) di kode yang dibuat.
4. **Batasan:** keputusan arsitektur, review akhir, pembuatan akun, dan deploy dilakukan sendiri.
5. `CLAUDE.md` di repo berisi konvensi yang diikuti AI selama pengerjaan.
