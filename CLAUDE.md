# 🤖 CLAUDE.md

Pantau: aplikasi peta untuk menampilkan dan mengelola entitas berlokasi (take-home test Software Developer).
Monorepo: `backend/` (Go + Gin + MongoDB) dan `frontend/` (React + Vite + TS). Konvensi frontend yang lebih
rinci ada di [`frontend/CLAUDE.md`](frontend/CLAUDE.md); file itu juga berlaku saat bekerja di `frontend/`.

Dokumen kerja: [`TASKS.md`](TASKS.md) (progres per tugas), [`pantau_project_plan.md`](pantau_project_plan.md)
(blueprint: model data, API, deploy), [`README.md`](README.md) (untuk penguji).

## 🛠️ Commands

```bash
# backend (butuh backend/.env, lihat backend/.env.example)
cd backend
go run ./cmd/server        # API :8080
go run ./cmd/seed [-reset] # data contoh
go test ./...
go vet ./... && gofmt -l .

# frontend (butuh frontend/.env, lihat frontend/.env.example)
cd frontend
yarn dev | yarn build | yarn test | yarn lint | yarn format
```

## 📏 Aturan kerja

- Kerjakan per tugas di `TASKS.md`: selesaikan, uji, lalu tunggu user bilang **OK** atau **revisi**.
  Status: ⬜ belum · 🔄 dikerjakan · 👀 menunggu review · ✅ OK.
- **Jangan** `git commit`, `git push`, deploy, atau menjalankan dev server tanpa izin eksplisit user di chat.
- Pesan commit: bahasa Indonesia, langsung ke isi (mis. `Tambah endpoint healthz dan koneksi Mongo`).
  **Tanpa** prefiks "Tugas x:", **tanpa** trailer `Co-Authored-By`, **tanpa** baris "Generated with …".
- Jangan commit `.env` (sudah di `.gitignore`). Kredensial (Atlas, Render, Netlify, Stadia) dibuat dan diisi user sendiri.
- Data di MongoDB Atlas adalah data production. Data uji yang dibuat saat testing harus dihapus lagi.
- Sebelum menyatakan selesai: backend `go vet` + `go test ./...`; frontend `yarn lint` + `yarn build` + `yarn test`;
  perubahan UI dicek di browser (desktop ≥ 1024 px **dan** mobile 390 px).

## 🐹 Backend (Go)

- Alur request: `server/router.go` → `<pkg>/handler.go` (bind + validasi) → `<pkg>/repository.go` (Mongo) → JSON.
  Tanpa service layer; jangan menambahkannya kecuali logika bisnis bertambah.
- Satu package per resource (`entity`, `entitytype`): `model.go` (bentuk dokumen), `dto.go` (input/response +
  tag `validate`), `repository.go` (**interface** + implementasi Mongo), `handler.go`, `handler_test.go`
  (repository palsu in-memory + `httptest`).
- Dependensi antar-package lewat interface kecil yang didefinisikan di package pemakai
  (`entity.TypeChecker`, `entitytype.UsageCounter`), lalu disambungkan di `router.go`. Hindari import siklus.
- Semua error HTTP lewat `internal/httpx`: `{ "error": { code, message, fields?, details? } }`.
  Kode: `VALIDATION_ERROR`, `BAD_JSON`, `INVALID_ID`, `NOT_FOUND`, `NAME_TAKEN`, `TYPE_IN_USE`, `INTERNAL`.
  Error internal hanya di-log; klien menerima pesan umum.
- Validasi: `httpx.BindJSON` → `Normalize()` (trim) → `httpx.Validate` (tag `validate`, pesan bahasa
  Indonesia) → validasi yang butuh DB terakhir. Angka yang boleh `0` memakai pointer (`*float64`).
- Lokasi disimpan GeoJSON `[lng, lat]`; API selalu `latitude`/`longitude`. Konversi hanya di model/DTO.
- Waktu disimpan UTC, dipotong ke milidetik (presisi MongoDB).
- Komentar kode dalam bahasa Indonesia dan menjelaskan *kenapa* (user sedang belajar Go).

## 💻 Frontend (ringkas)

React 19 + Vite + TS + Tailwind v4 + Redux Toolkit + axios + react-hook-form/zod + react-leaflet.
Pola data: type → service → slice → hook; komponen hanya memakai hook. Hanya tema gelap (Midnight Vault),
semua warna dari token di `src/css/index.css`. Detail: [`frontend/CLAUDE.md`](frontend/CLAUDE.md).
**UI baru wajib mengikuti [`frontend/DESIGN_SYSTEM.md`](frontend/DESIGN_SYSTEM.md).**

## 🌐 API & deploy

- Base `/api/v1`: `entities` dan `entity-types` (CRUD), plus `GET|HEAD /healthz`. Detail di README.
- Aturan validasi FE (`frontend/src/schemas`) dan BE (`backend/internal/*/dto.go`) harus selalu sama.
  Kalau satu diubah, ubah juga yang lain beserta test-nya.
- Production: Netlify `https://pantau-map.netlify.app` (`frontend/netlify.toml`) dan Render
  `https://pantau-2am8.onrender.com` (`render.yaml`). Push ke `main` memicu deploy otomatis keduanya.
- `ALLOWED_ORIGINS` (Render) harus memuat URL Netlify. Domain Netlify juga harus terdaftar di Stadia Maps
  agar tile peta tampil.
