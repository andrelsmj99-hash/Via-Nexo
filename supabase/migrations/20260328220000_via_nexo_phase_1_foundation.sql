create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'user_role'
  ) then
    create type public.user_role as enum ('citizen', 'moderator', 'admin');
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'report_category'
  ) then
    create type public.report_category as enum (
      'pothole',
      'irregular_patch',
      'unpaved_road',
      'flooding',
      'construction',
      'poor_signage'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'report_status'
  ) then
    create type public.report_status as enum (
      'pending',
      'under_review',
      'confirmed',
      'resolved',
      'archived'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'report_severity'
  ) then
    create type public.report_severity as enum (
      'low',
      'medium',
      'high',
      'critical'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'moderation_action'
  ) then
    create type public.moderation_action as enum (
      'approve',
      'reject',
      'resolve',
      'archive',
      'reopen'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'citizen',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint neighborhoods_name_city_key unique (name, city)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.users (id) on delete set null,
  title text not null,
  description text not null,
  category public.report_category not null,
  status public.report_status not null default 'pending',
  severity public.report_severity not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  address text null,
  street_name text null,
  neighborhood_id uuid null references public.neighborhoods (id) on delete set null,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint reports_latitude_check check (latitude between -90 and 90),
  constraint reports_longitude_check check (longitude between -180 and 180)
);

create table if not exists public.report_images (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.report_confirmations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint report_confirmations_report_id_user_id_key unique (report_id, user_id)
);

create table if not exists public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  moderator_id uuid not null references public.users (id) on delete restrict,
  action public.moderation_action not null,
  notes text null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists reports_status_idx
  on public.reports (status);

create index if not exists reports_category_idx
  on public.reports (category);

create index if not exists reports_neighborhood_id_idx
  on public.reports (neighborhood_id);

create index if not exists reports_created_at_idx
  on public.reports (created_at desc);

create index if not exists report_images_report_id_idx
  on public.report_images (report_id);

create index if not exists report_confirmations_report_id_idx
  on public.report_confirmations (report_id);

create index if not exists moderation_logs_report_id_idx
  on public.moderation_logs (report_id);

drop trigger if exists set_reports_updated_at on public.reports;

create trigger set_reports_updated_at
before update on public.reports
for each row
execute function public.set_updated_at();

-- Keep the bucket private; file access is handled by trusted Route Handlers.
insert into storage.buckets (
  id,
  name,
  "public",
  file_size_limit,
  allowed_mime_types
)
values (
  'report-images',
  'report-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  name = excluded.name,
  "public" = excluded."public",
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
