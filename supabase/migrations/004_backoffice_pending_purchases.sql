-- Backoffice V1: evoluciona pending_purchases (cliente, estados, timestamps).

-- Estado cancelada
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'pending_purchase_status'
      and e.enumlabel = 'cancelled'
  ) then
    alter type public.pending_purchase_status add value 'cancelled';
  end if;
end $$;

-- customer_name (renombra client_name si existe)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pending_purchases'
      and column_name = 'client_name'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pending_purchases'
      and column_name = 'customer_name'
  ) then
    alter table public.pending_purchases rename column client_name to customer_name;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'webpay_intents'
      and column_name = 'client_name'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'webpay_intents'
      and column_name = 'customer_name'
  ) then
    alter table public.webpay_intents rename column client_name to customer_name;
  end if;
end $$;

alter table public.pending_purchases
  add column if not exists customer_name text;

alter table public.pending_purchases
  add column if not exists updated_at timestamptz not null default now();

alter table public.pending_purchases
  add column if not exists activated_at timestamptz;

alter table public.webpay_intents
  add column if not exists customer_name text;

-- Mantener updated_at al modificar
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
