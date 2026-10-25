# Pisang Ijo — Next.js + Bootstrap

Hasil konversi proyek UTS (Express + HTML/jQuery) ke **Next.js 16 (App Router, TypeScript)** memakai template dosen,
dengan **Bootstrap 5** (via `react-bootstrap`: Navbar/Collapse, Modal, Accordion, Carousel, Dropdown, Tab/Nav, Form, Table, Badge, Alert).

## Menjalankan

```bash
npm install
npm run dev          # http://localhost:3000
```

`.env.local` sudah berisi `SESSION_SECRET`. Untuk produksi: `npm run build && npm start`.

### Akun admin
Database `data/app.db` adalah database dari versi Express, jadi akun admin lamamu tetap berlaku.
Untuk membuat akun baru: `npm run seed`, lalu login di `/admin/login`.
(Alternatif: isi `ADMIN_USERNAME` dan `ADMIN_PASSWORD` di `.env.local`, akun dibuat/disinkronkan saat server mulai.)

## Struktur

| Folder | Isi |
|---|---|
| `app/page.tsx`, `app/wishlist`, `app/register-toko`, `app/toko-dashboard`, `app/admin` | Halaman (pengganti file `.html` lama) |
| `app/api/**/route.ts` | API (pengganti `routes/*.js` Express) |
| `app/uploads/[...path]` | Menyajikan gambar upload |
| `components/` | Komponen React (header, kartu, modal, form admin, dst) |
| `lib/` | Database SQLite (better-sqlite3), session, guard auth, upload, helper |
| `data/` | `app.db` + `uploads/` (gambar) |

## Deploy (Railway)
Data (database + gambar) disimpan di `DATA_DIR` (default `./data`). Supaya tidak hilang tiap deploy,
pasang **Volume** di Railway lalu set `DATA_DIR` ke path volume tersebut. Set juga `SESSION_SECRET` dan `COOKIE_SECURE=true`.
