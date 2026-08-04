-- Licencias / Backoffice: compras pendientes de activación manual (post-Webpay).
-- Escrituras solo vía service role. Sin acceso público.

create type public.pending_purchase_status as enum (
  'pending',
  'activated',
  'cancelled'
);

-- Intención de pago Webpay Plus (antes del commit).
create table if not exists public.webpay_intents (
  buy_order text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  customer_name text,
  product text not null,
  amount numeric(12, 0) not null,
  created_at timestamptz not null default now()
);

create index if not exists webpay_intents_user_id_idx
  on public.webpay_intents (user_id);

alter table public.webpay_intents enable row level security;

-- Compra pendiente de activación (tras pago aprobado).
create table if not exists public.pending_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  customer_name text,
  product text not null,
  amount numeric(12, 0) not null,
  transaction_token text,
  buy_order text not null,
  payment_date timestamptz not null default now(),
  status public.pending_purchase_status not null default 'pending',
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pending_purchases_buy_order_key unique (buy_order)
);

create index if not exists pending_purchases_status_idx
  on public.pending_purchases (status);

create index if not exists pending_purchases_user_id_idx
  on public.pending_purchases (user_id);

create index if not exists pending_purchases_created_at_idx
  on public.pending_purchases (created_at desc);

alter table public.pending_purchases enable row level security;

create or replace function public.set_pending_purchases_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pending_purchases_set_updated_at on public.pending_purchases;

create trigger pending_purchases_set_updated_at
  before update on public.pending_purchases
  for each row
  execute function public.set_pending_purchases_updated_at();
