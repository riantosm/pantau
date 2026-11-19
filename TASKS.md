# Pantau — Rencana Kerja sampai Deploy

Cara kerja: satu tugas dikerjakan sampai selesai → kamu cek → **OK** atau **revisi** → baru lanjut ke tugas berikutnya.
Status: ⬜ belum · 🔄 sedang dikerjakan · 👀 menunggu review · ✅ OK

Deadline: ± **20 Nov 2026** (2 hari setelah soal diterima). Blueprint lengkap: [pantau_project_plan.md](pantau_project_plan.md).

| # | Tugas | Hasil yang bisa kamu cek | Butuh dari kamu | Status |
|---|-------|--------------------------|-----------------|--------|
| 0 | **Plan & desain UI/UX**: plan teknis, daftar tugas, desain di artifact dengan tema **Midnight Vault (versi terang)**: prototipe desktop interaktif, 2 layar mobile, alur → API, state & feedback, design system + token Tailwind | Baca plan, buka artifact desain (Play di artboard Desktop), setujui atau minta revisi | Review | ✅ |
| 1 | **Persiapan akun & tools**: install Go (`brew install go`), Tour of Go dasar (±1 jam), buat repo GitHub + `git init` monorepo (`backend/`, `frontend/`), cluster MongoDB Atlas M0 (Singapore), akun Render & Netlify | `go version` jalan, connection string Atlas ada di `backend/.env` | Buat akun Atlas/Render/Netlify/GitHub sendiri (aku kasih panduan langkah demi langkah) | ✅ |
| 2 | **Backend fondasi**: `go mod init`, Gin, config dari env, koneksi Mongo + index `2dsphere`, endpoint `/healthz`, CORS | `go run ./cmd/server` → `GET /healthz` balas `{"status":"ok","db":"up"}` | — | ✅ |
| 3 | **Backend CRUD + validasi**: CRUD **Jenis** (`/entity-types`, nama unik, tolak hapus jika dipakai → 409) lalu CRUD **Entitas** (`typeId` harus ada): model, DTO + tag validasi (`*float64` untuk lat/lng), repository, handler, format error tunggal, seed 3 jenis + ±12 entitas, unit test | `go test ./...` hijau, coba semua endpoint via curl/Postman termasuk input salah | Coba sendiri & tanya bagian yang belum paham | ✅ |
| 4 | **Deploy backend ke Render**: web service free (Singapore), env var, health check | `https://<service>.onrender.com/healthz` hidup, `GET /api/v1/entities` berisi data seed | Hubungkan repo GitHub di Render & isi env var | ✅ |
| 5 | **Frontend scaffold & layout**: `/init-react` (React + Vite + TS, Tailwind v4, Redux Toolkit + axios), token tema Midnight Vault dari artboard Design system (Playfair Display + Inter), layout desktop (top bar, sidebar, peta, panel) + mobile (bottom sheet) | `yarn dev` → layout sesuai desain di desktop & mobile | Jawab pertanyaan setup dari skill | ✅ |
| 6 | **Peta & lihat data**: react-leaflet + tile gelap Stadia (CARTO kini butuh API key), marker kustom (warna + bentuk per status), marker ↔ daftar ↔ panel detail tersambung, fly-to, banner server bangun, state loading/kosong/error | Marker data seed muncul, klik marker/daftar → detail terbuka | — | ✅ |
| 7 | **Tambah, ubah, hapus + validasi**: mode pilih lokasi (klik peta), form `react-hook-form` + `zod`, pin bisa digeser, error BE dipetakan ke field, dialog hapus, toast. Panel **Kelola jenis** (tambah/ubah nama + ikon, hapus nonaktif jika dipakai) | Semua alur CRUD entitas & jenis jalan; input salah ditolak FE **dan** BE (uji juga via curl) | — | ✅ |
| 8 | **Deploy frontend ke Netlify + uji E2E**: `netlify.toml`, `VITE_API_BASE_URL`, update `ALLOWED_ORIGINS` di Render, daftarkan domain Netlify di Stadia Maps | Situs live di `https://<site>.netlify.app`, CRUD jalan dari production | Hubungkan repo di Netlify & isi env var | 👀 |
| 9 | **Dokumentasi & submit**: `README.md` (cara run lokal, link demo, alasan library, workflow Agentic AI, fitur belum selesai), `CLAUDE.md`, rapikan repo | README lengkap & repo publik bisa dibuka penguji | Kirim email ke 2 alamat di PDF (kamu sendiri) | ⬜ |

Catatan:
- **Urutan prioritas:** tugas 2–4 (backend + deploy) dikerjakan lebih dulu karena Go masih baru. Kalau waktu mepet, fitur bonus di plan (bbox, docker-compose, Vitest) dilewati dan dicatat di README sebagai "belum selesai".
- Akun & API key pihak ketiga harus dibuat sendiri olehmu (aku tidak bisa mendaftar atau memasukkan kredensial). Aku akan kasih panduan langkah demi langkah di tugas yang membutuhkannya.
- Jangan commit file `.env`. Cukup `.env.example`.
- Situs production: https://pantau-map.netlify.app · API: https://pantau-2am8.onrender.com (`/healthz`, `/api/v1/...`).
- Pesan commit langsung ke isinya, tanpa prefiks "Tugas x: " (contoh: `Tambah endpoint healthz dan koneksi Mongo`). Repo: [github.com/riantosm/pantau](https://github.com/riantosm/pantau).
- Referensi desain: artifact [Pantau — UI/UX Design](https://claude.ai/artifact/PTAyQ4EPYt4tHhrVb8Pr7X) (prototipe desktop interaktif, 2 layar mobile, alur → API, state, design system).
