-- Migration: standalone PostgreSQL compatibility
-- Removes Supabase-specific dependencies (auth.users FK, storage.buckets)
-- and adds password_hash for NextAuth CredentialsProvider

-- Drop the existing users table (cascade) and recreate without auth.users FK
alter table public.users
  drop constraint if exists users_pkey cascade;

-- Recreate PK as self-managed UUID (gen_random_uuid instead of auth.users ref)
alter table public.users
  alter column id set default gen_random_uuid();

alter table public.users
  add primary key (id);

-- Add password_hash column for NextAuth CredentialsProvider
alter table public.users
  add column if not exists password_hash text not null default '';

-- Remove the default placeholder once column exists
alter table public.users
  alter column password_hash drop default;
