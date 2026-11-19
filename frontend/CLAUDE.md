# CLAUDE.md

Pantau (frontend): React 19 + Vite + TypeScript + Tailwind CSS v4 + Redux Toolkit.
Satu halaman peta untuk melihat dan mengelola entitas berlokasi. Backend Go ada di `../backend`.

## Commands

- `yarn dev`: dev server di http://localhost:5173
- `yarn build`: type-check (`tsc -b`) + build ke `dist/`
- `yarn preview`: menjalankan hasil build
- `yarn lint`: ESLint
- `yarn format` / `yarn format:check`: Prettier
- `yarn test` / `yarn test:watch`: Vitest

## Batasan

Kecuali user menyuruhnya secara eksplisit di chat (izin per perintah, bukan izin umum):

- ❌ Menjalankan dev server / preview: `yarn dev`, `yarn preview`, `vite`.
- ❌ Deploy: `netlify deploy`, push ke hosting apa pun.
- ❌ `git commit` / `git push`.

Boleh tanpa izin: membuat/mengedit file, `yarn add`, `yarn lint`, `yarn build`, `yarn test`, `yarn format`.

## Arsitektur

```
src/
├── app/            AppRouter (lazy + retryImport), ErrorBoundary, pages/MapPage
├── components/     generik, atomic design
│   ├── atoms/      Button, IconButton, Chip, StatusMark, StatusBadge, Eyebrow
│   └── molecules/  LoadingScreen, SearchField, EmptyState
├── layouts/map/    komponen milik halaman peta (TopBar, StatusSummary, EntityFilters,
│                   EntityList, EntityDetail, MapStage, SidePanel, MobileSheet, …)
├── constants/      routes, app, entity-status, entity-icons, storage-keys
├── css/index.css   Tailwind v4 + token tema Midnight Vault
├── hooks/          use-entities, use-entity-types, use-map-filters, use-selected-entity
├── redux/          store (persist whitelist kosong), slices: entity, entityType, mapUi
├── services/       http-client (axios), entity.service, entity-type.service
├── types/          api, entity, entity-type, map-ui
└── utils/          cn, format, entity-filter (+ __tests__)
```

- **API:** `VITE_API_BASE_URL` (lihat `.env.example`), mis. `https://pantau-2am8.onrender.com/api/v1`.
  Respons sukses `{ data }` / `{ data, total }`; error `{ error: { code, message, fields?, details? } }`.
  `getApiErrorMessage`, `getApiFieldErrors` (untuk memetakan error BE ke input form),
  `getApiErrorCode` ada di `services/http-client.ts`. Error dari service membawa error axios di `cause`.
- **Koordinat:** API memakai `latitude`/`longitude` eksplisit (Leaflet memakai `[lat, lng]`).
- **Render free tidur** setelah ±15 menit: request pertama bisa ±30–60 detik (timeout axios 90 detik).
- **CORS:** backend hanya mengizinkan origin di env `ALLOWED_ORIGINS` (dev `http://localhost:5173`
  - URL Netlify). Tidak ada header `Authorization` karena tanpa auth.
- **Peta:** react-leaflet + tile Stadia Alidade Smooth Dark (`constants/map.ts`). Marker = `L.divIcon`
  dengan kelas `.pantau-marker--<status>` di `css/index.css` (jangan set `position` di kelas itu, Leaflet
  memakai `position: absolute`). Fit/fly helper di `utils/map.ts` memperhitungkan bottom sheet mobile.
  Overlay di atas peta butuh `z-[1000]` karena pane Leaflet memakai z-index 400–700.
- **Filter daftar** disaring di browser (`utils/entity-filter.ts`); data kecil, jadi tidak perlu request ulang.
- Responsif: desktop `lg` ke atas (top bar · sidebar · peta · panel kanan), di bawahnya peta penuh + bottom sheet.

## Konvensi

- Komponen: atomic design, `Folder/index.tsx`, named export, varian `Record<Union, string>` + `cn()`.
- Warna hanya dari token semantik di `src/css/index.css`; tanpa hex inline, tanpa `dark:`.
  Aplikasi **hanya punya tema gelap** (Midnight Vault), jadi tidak ada ThemeToggle.
- Aturan desain:
  1. Tombol putih terisi (`Button variant="primary"`) maksimal satu per layar.
  2. Serif (`font-serif`, Playfair Display) hanya untuk teks ≥ 28px: judul, nama entitas, angka ringkasan.
  3. Copper (`text-copper`, komponen `Eyebrow`) hanya untuk eyebrow kategori.
  4. Tanpa bayangan: pisahkan dengan tingkat permukaan (`bg` → `surface` → `surface-2`) + garis 1px.
  5. Tombol/input/tag = pill (`rounded-control`), kartu = `rounded-card` (10px), textarea = `rounded-area` (16px).
  6. Status selalu warna + bentuk + teks (`StatusMark` + label), tidak pernah warna saja.
- Ikon `lucide-react`; ikon jenis entitas dipetakan di `constants/entity-icons.ts`. Import internal pakai `@/`.
- Penamaan: hook `use-xxx.ts`, service `xxx.service.ts` (objek `xxxService`), tipe `xxx.types.ts`,
  slice `redux/slices/<x>Slice/index.ts`, route di `ROUTES` (`constants/routes.ts`).
- Fitur ber-data: type → service → slice → hook; komponen hanya pakai hook, tidak memanggil service/dispatch langsung.
- Redux persist whitelist kosong (tidak ada auth); data selalu diambil ulang dari API.
- Form: `react-hook-form` + `zod`, schema di `schemas/<entity>.schema.ts`, pesan error berbahasa Indonesia,
  aturan sama dengan validasi backend.
- Test: Vitest + Testing Library, file di `__tests__/` di sebelah kodenya, import `describe/it/expect` dari `vitest`.
- TypeScript dipatok `~6.0` karena typescript-eslint belum mendukung TS 7.
