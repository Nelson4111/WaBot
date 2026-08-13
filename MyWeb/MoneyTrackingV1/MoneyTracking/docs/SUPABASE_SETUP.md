# Supabase Setup Guide

Dokumen ini menjelaskan langkah-langkah profesional untuk menghubungkan MoneyTracking V1 ke Supabase saat frontend UI/UX sudah stabil.

## 1. Persiapan Project
1. Buka [Supabase Dashboard](https://supabase.com/dashboard).
2. Buat Project Baru:
   - Name: `MoneyTracking V1`
   - Database Password: (simpan dengan aman di password manager)
   - Region: Pilih yang terdekat (misal: Singapore) agar latency rendah.

## 2. Environment Variables
Buat file `.env.local` di root project Frontend:
```env
# Frontend env vars
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...

# PERINGATAN:
# JANGAN PERNAH memasukkan SUPABASE_SERVICE_ROLE_KEY di frontend!
```

## 3. Instalasi Supabase Client
```bash
npm install @supabase/supabase-js
```

Buat file `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. App will run in mock mode.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 4. Konfigurasi Authentication (Google OAuth)
1. Ke Supabase Dashboard -> Authentication -> Providers.
2. Enable **Google**.
3. Buka [Google Cloud Console](https://console.cloud.google.com/), buat kredensial OAuth 2.0.
4. Masukkan `Client ID` dan `Client Secret` dari Google ke Supabase.
5. Masukkan Callback URL Supabase (`https://<project-ref>.supabase.co/auth/v1/callback`) ke Authorized redirect URIs di Google Cloud Console.

## 5. Implementasi Schema & RLS (SQL Editor)
Eksekusi query SQL berikut di Supabase SQL Editor untuk setup awal keamanan:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Buat tabel profil
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Profil
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Trigger untuk membuat profil otomatis saat user mendaftar
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 6. Migrasi dari Mock Data ke API
Ketika aplikasi siap:
1. Hapus import data dari `src/lib/mock-data.ts`.
2. Ubah isi context/hooks untuk melakukan fetch ke Supabase.
   Contoh:
   ```typescript
   const { data, error } = await supabase
     .from('transactions')
     .select('*')
     .eq('workspace_id', activeWorkspaceId);
   ```

## 7. Security Notes
- Selalu andalkan **Row Level Security (RLS)**. Jangan memfilter data hanya di frontend.
- Validasi data tetap dilakukan di database (Constraints) meskipun form frontend sudah memvalidasi.
