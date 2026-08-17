-- Styled.ke — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / CREATE OR REPLACE.

create extension if not exists pgcrypto;

-- ─── 1. categories ──────────────────────────────────────────────
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── 2. products ────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  category_id uuid references categories(id),
  price decimal(10,2) not null,
  compare_price decimal(10,2),
  stock_quantity int default 0,
  low_stock_threshold int default 5,
  badge text,
  is_active boolean default true,
  is_featured boolean default false,
  sku text unique,
  weight_grams int,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 3. product_images ──────────────────────────────────────────
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order int default 0,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- ─── 4. product_variants ────────────────────────────────────────
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  image_url text,
  stock_quantity int default 0,
  price_modifier decimal(10,2) default 0,
  created_at timestamptz default now()
);

-- ─── 5. customers ───────────────────────────────────────────────
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  full_name text not null,
  email text,
  phone text not null,
  whatsapp_phone text,
  address_line1 text,
  address_line2 text,
  city text default 'Nairobi',
  notes text,
  total_orders int default 0,
  total_spent decimal(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 6. delivery_zones ──────────────────────────────────────────
create table if not exists delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee decimal(10,2) not null default 0,
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

-- ─── 7. orders ──────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references customers(id),
  status text default 'pending',
  source text default 'website',
  subtotal decimal(10,2) not null,
  delivery_fee decimal(10,2) default 0,
  total decimal(10,2) not null,

  delivery_method text,
  delivery_address text,
  delivery_city text,
  delivery_zone text,
  delivery_agent text,
  delivery_notes text,

  payment_method text,
  payment_status text default 'pending',
  paystack_reference text,
  mpesa_reference text,
  paid_at timestamptz,

  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 8. order_items ─────────────────────────────────────────────
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  product_name text not null,
  variant_name text,
  unit_price decimal(10,2) not null,
  quantity int not null default 1,
  subtotal decimal(10,2) not null,
  created_at timestamptz default now()
);

-- ─── 9. pos_sessions ────────────────────────────────────────────
create table if not exists pos_sessions (
  id uuid primary key default gen_random_uuid(),
  opened_by uuid references auth.users(id),
  opened_at timestamptz default now(),
  closed_at timestamptz,
  opening_float decimal(10,2) default 0,
  cash_sales decimal(10,2) default 0,
  mpesa_sales decimal(10,2) default 0,
  card_sales decimal(10,2) default 0,
  total_sales decimal(10,2) default 0,
  transaction_count int default 0,
  status text default 'open'
);

-- ─── 10. whatsapp_conversations ─────────────────────────────────
create table if not exists whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  wa_phone text not null,
  wa_contact_name text,
  status text default 'open',
  assigned_to uuid references auth.users(id),
  last_message_at timestamptz,
  unread_count int default 0,
  created_at timestamptz default now()
);

-- ─── 11. whatsapp_messages ──────────────────────────────────────
create table if not exists whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references whatsapp_conversations(id),
  wa_message_id text unique,
  direction text not null,
  message_type text default 'text',
  content text,
  media_url text,
  template_name text,
  status text default 'sent',
  is_bot boolean default false,
  created_at timestamptz default now()
);

-- ─── 12. whatsapp_templates ─────────────────────────────────────
create table if not exists whatsapp_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger text,
  content text not null,
  variables text[],
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── 13. automation_flows ───────────────────────────────────────
create table if not exists automation_flows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger_keyword text,
  response_type text,
  response_content text,
  is_active boolean default true,
  trigger_count int default 0,
  created_at timestamptz default now()
);

-- ─── 14. analytics_events ───────────────────────────────────────
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  product_id uuid references products(id),
  order_id uuid references orders(id),
  session_id text,
  created_at timestamptz default now()
);

-- ─── 15. profiles (admin/staff flag) ────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- ─── Row Level Security ─────────────────────────────────────────
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table profiles enable row level security;

-- Public (anon) read access to the storefront catalogue
drop policy if exists "Public can view active categories" on categories;
create policy "Public can view active categories" on categories
  for select using (is_active = true);

drop policy if exists "Public can view active products" on products;
create policy "Public can view active products" on products
  for select using (is_active = true);

drop policy if exists "Public can view product images" on product_images;
create policy "Public can view product images" on product_images
  for select using (true);

drop policy if exists "Public can view product variants" on product_variants;
create policy "Public can view product variants" on product_variants
  for select using (true);

-- Customers/orders: a signed-in user can only see rows tied to their own account
drop policy if exists "Users see own customer record" on customers;
create policy "Users see own customer record" on customers
  for select using (user_id = auth.uid());

drop policy if exists "Users see own orders" on orders;
create policy "Users see own orders" on orders
  for select using (customer_id in (select id from customers where user_id = auth.uid()));

drop policy if exists "Users see own order items" on order_items;
create policy "Users see own order items" on order_items
  for select using (order_id in (
      select o.id from orders o
      join customers c on c.id = o.customer_id
      where c.user_id = auth.uid()
    ));

drop policy if exists "Users see own profile" on profiles;
create policy "Users see own profile" on profiles
  for select using (id = auth.uid());

-- All writes (and admin reads of everything) go through server-side API
-- routes using the service role key, which bypasses RLS by design — do not
-- expose SUPABASE_SERVICE_ROLE_KEY to the browser.

-- ─── Storage buckets ────────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('receipts', 'receipts', false)
  on conflict (id) do nothing;

-- ─── Seed: delivery zones ───────────────────────────────────────
insert into delivery_zones (name, fee, display_order) values
  ('Westlands', 0, 1),
  ('Kilimani / Kileleshwa', 0, 2),
  ('Karen / Langata', 200, 3),
  ('Thika Road', 150, 4),
  ('Mombasa Rd', 200, 5),
  ('Outside Nairobi (courier)', 350, 6)
on conflict do nothing;
