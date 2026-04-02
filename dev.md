# dev.md — Catatan Pengembangan `bisik`

Dokumen ini menjelaskan kondisi project saat ini (April 2026), cara jalanin lokal, dan bagaimana integrasi Supabase + AI (Elice) + Qdrant bekerja.

## Ringkasan

`bisik` adalah aplikasi journaling SvelteKit yang punya mode **guest** (tanpa login) dan mode **authenticated** (login Google via Supabase).

- Guest: bisa buka **Home / Write / Chat**, tapi data hanya ada di memori browser (tidak tersimpan ke Supabase).
- Login Google: bisa menyimpan `diary_entries` + `refined_journals` ke Supabase, dan chat/refine menggunakan AI + retrieval memori dari Qdrant.
- Admin console: tersedia di route `/admin` dan hanya bisa diakses oleh user yang `profiles.role` = `admin` / `super_admin`.

## Tech Stack

- Frontend: SvelteKit (Svelte 5) + Vite
- Auth + Database: Supabase (Auth + Postgres + RLS)
- AI Inference: endpoint “Chat Completions” ala OpenAI (lihat `elice.md`) dengan model `openai/gpt-oss-20b`
- Vector DB / KB: Qdrant (disarankan Qdrant Cloud untuk dev jika Docker tidak jalan)

## Menjalankan Lokal

1) Install dependency:

`npm install`

2) Isi `.env` (minimal Supabase):

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

3) Jalankan:

`npm.cmd run dev`

4) Cek typecheck:

`npm.cmd run check`

## Supabase

### Migrasi Database

File migrasi ada di `supabase/migrations/`:

- `supabase/migrations/202604020001_init_bisik.sql`  
  Tabel inti: `personas`, `profiles`, `diary_entries`, `refined_journals` + trigger `set_updated_at` + trigger `handle_new_user` (buat `profiles` saat user baru).
- `supabase/migrations/202604020002_admin_console.sql`  
  Kolom admin di `profiles` (`role`, `account_status`, `last_seen_at`) + `app_settings` + policy admin.
- `supabase/migrations/202604020003_rls_hardening.sql`  
  Hardening RLS untuk `personas` (hindari policy “for all” yang terlalu longgar, dan batasi delete system persona).
- `supabase/migrations/202604020004_profile_name_oauth.sql`  
  Improve `display_name` untuk OAuth (Google) dari `raw_user_meta_data`.

### Login Google (OAuth)

App menggunakan OAuth Google via Supabase SDK:

- User app: `src/lib/components/user/UserApp.svelte`
- Admin: `src/lib/components/admin/AdminShell.svelte`
- Wrapper auth: `src/lib/supabase/auth.ts` (`loginWithGoogle`)

Yang wajib kamu set di Supabase Dashboard:

- Authentication → Providers → Google: `Client ID` + `Client Secret`
- Authentication → URL Configuration:
  - `Site URL` (contoh dev biasanya `http://localhost:5173`)
  - `Redirect URLs` yang mengizinkan callback ke domain kamu (dev + prod)

### Membuat Akun Admin

Register/login seperti biasa, lalu set role manual di Supabase Table Editor:

`update public.profiles set role = 'admin' where id = '<USER_UUID>';`

## Perilaku Aplikasi (Guest vs Auth)

### Guest

Guest bisa akses:

- Home (ringkasan dari data lokal `initialEntries`)
- Write (buat entry baru)
- Chat (jawaban “mock”/lokal untuk diskusi ringan)

Batasan guest:

- Tidak bisa akses `timeline` (nav disembunyikan saat belum login)
- Tidak ada penyimpanan ke Supabase
- “Revisi journal” untuk guest hanya hasil lokal dari `buildRefinedJournal` (`src/lib/utils/refined.ts`)

### Authenticated (Google)

Saat login, app:

- Load data dari Supabase (profiles/personas/diary/refined): `loadUserData()` di `src/lib/components/user/UserApp.svelte`
- Simpan diary ke Supabase: `createDiaryEntry()` (`src/lib/supabase/diary.ts`)
- Simpan refined journal ke Supabase: `createRefinedJournal()` (`src/lib/supabase/diary.ts`)
- Index entry ke Qdrant: request ke `POST /api/index-diary`
- Refine journal pakai AI + memori Qdrant: `POST /api/ai/refine`
- Chat pakai AI + memori Qdrant: `POST /api/ai/chat`

## AI + Qdrant Knowledgebase

### Environment Variables

Lihat template: `.env.example`

Wajib untuk AI:

- `ELICE_API_BASE_URL`
- `ELICE_API_KEY`

Catatan `ELICE_API_BASE_URL`:

- Bisa berupa URL langsung seperti `https://mlapi.run/<uuid>` (sesuai contoh `elice.md`)
- Atau base URL yang butuh `/v1/chat/completions`  
  Implementasi di `src/lib/server/elice.ts` akan mencoba beberapa kandidat URL (self-heal untuk kasus 404).

Untuk Qdrant:

- `QDRANT_URL` (Qdrant Cloud endpoint atau local)
- `QDRANT_API_KEY` (biasanya wajib di Cloud)
- `QDRANT_COLLECTION` (default: `bisik_diary`)

Kalau Qdrant belum diset, AI tetap jalan tapi tanpa retrieval (lihat `isQdrantConfigured()`).

### Endpoint API (SvelteKit server routes)

- `src/routes/api/index-diary/+server.ts`  
  Upsert point ke Qdrant (id = `diaryEntryId`). Payload menyimpan `user_id` dan potongan konten.
- `src/routes/api/ai/refine/+server.ts`  
  Refine jurnal + ringkasan, dengan “memori” hasil search Qdrant (jika login + Qdrant configured).
- `src/routes/api/ai/chat/+server.ts`  
  Chat response memakai memori Qdrant + persona info.
- `src/routes/api/ai/health/+server.ts`  
  `GET /api/ai/health` (cek config), `GET /api/ai/health?live=1` (ping Elice + ensure collection Qdrant).

### Embedding (sementara)

Saat ini vector dibuat dengan hashing sederhana (bukan embedding semantik):

- `src/lib/server/hashEmbed.ts`

Ini cukup untuk “prototype retrieval” (terutama bila konten mirip), tapi untuk kualitas retrieval yang bagus sebaiknya diganti dengan embedding model yang bener (mis. OpenAI embeddings / bge / dll).

### Qdrant Cloud: Payload Index

Qdrant Cloud sering butuh payload index untuk filter.

Project ini akan auto-create index payload:

- `user_id` (keyword)
- `diary_entry_id` (keyword)

Implementasi: `src/lib/server/qdrant.ts` (`ensureRequiredIndexes()` + retry bila dapat error “Index required”).

## Admin Console

Route:

- `/admin` → `src/routes/admin/+page.svelte`

Login:

- Google OAuth (Supabase). Setelah login, admin gate cek `profiles.role` harus `admin`/`super_admin`.

Data access:

- Menggunakan PostgREST via `supabaseRequest()` dengan token user: `src/lib/supabase/admin.ts`

## Troubleshooting

- **AI 404 Not Found**  
  Biasanya `ELICE_API_BASE_URL` salah (base vs full endpoint). Pastikan isi sesuai provider. `src/lib/server/elice.ts` sudah mencoba beberapa kandidat, tapi tetap butuh URL yang benar.

- **Qdrant 400 “Index required”**  
  Sudah ada auto-create index di `src/lib/server/qdrant.ts`. Kalau masih muncul, biasanya karena collection berbeda atau field schema tidak cocok.

- **Supabase RLS error / 401/403**  
  Pastikan request yang butuh auth selalu kirim bearer token `session.accessToken`. Untuk admin, pastikan `profiles.role` sudah di-set.

## Next Steps (saran)

- Replace `hashEmbed` dengan embedding semantik.
- Batasi guest: tambah persistence lokal (optional) atau rate-limit client untuk mencegah spam.
- Buat background indexing (queue) agar save diary tidak bergantung pada jaringan Qdrant.

