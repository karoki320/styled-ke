-- Styled.ke — persisted POS sales, with real sequential receipt numbers.
-- Run this in the Supabase SQL editor after 0005_announcements.sql.
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / CREATE OR REPLACE.
--
-- Why this exists: the POS previously generated a random order number
-- client-side on every sale (#SK-1234-ish) and never saved anything —
-- fine for handing a customer a slip, useless for reconciling against
-- M-Pesa statements or bookkeeping later, since two sales could collide
-- on the same number and nothing was recorded to check against anyway.
-- sale_number is a real Postgres identity column, so it counts up
-- atomically (SK-000001, SK-000002, ...) even with concurrent tills, and
-- the full sale (items, totals, payment method) is stored so the number
-- actually refers to something.

create table if not exists pos_sales (
  id uuid primary key default gen_random_uuid(),
  sale_number integer generated always as identity,
  items jsonb not null,
  subtotal numeric not null,
  discount numeric not null default 0,
  total numeric not null,
  payment_method text not null,
  amount_received numeric,
  change_amount numeric,
  customer_phone text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table pos_sales enable row level security;

-- Admin-only in both directions — this is internal till data, never
-- exposed to storefront visitors (unlike products/hero/announcements).
drop policy if exists "Admins can view pos_sales" on pos_sales;
create policy "Admins can view pos_sales" on pos_sales
  for select using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can insert pos_sales" on pos_sales;
create policy "Admins can insert pos_sales" on pos_sales
  for insert with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
