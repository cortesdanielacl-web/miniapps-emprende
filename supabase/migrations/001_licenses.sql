-- Licencias MiniApps Emprende
-- Preparado para Supabase. Aún no conectado al runtime (store en memoria).

create type public.license_status as enum (
  'pending',
  'active',
  'inactive',
  'expired'
);

create type public.license_type as enum (
  'individual',
  'lifetime'
);

create type public.license_source as enum (
  'manual',
  'admin',
  'transbank'
);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  status public.license_status not null default 'pending',
  type public.license_type not null default 'individual',
  source public.license_source not null default 'manual',
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  expires_at timestamptz,
  payment_reference text,
  unique (user_id, product_id)
);

create index if not exists licenses_user_id_idx on public.licenses (user_id);
create index if not exists licenses_product_id_idx on public.licenses (product_id);
create index if not exists licenses_status_idx on public.licenses (status);

alter table public.licenses enable row level security;

-- El usuario solo lee sus propias licencias.
create policy "Users can read own licenses"
  on public.licenses
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Escrituras solo vía service role / admin (sin policy de insert/update para authenticated).
