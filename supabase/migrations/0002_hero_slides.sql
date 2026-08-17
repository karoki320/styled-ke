-- Styled.ke — hero carousel slides (admin-managed homepage banner)
-- Run this in the Supabase SQL editor after 0001_init.sql.
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / CREATE OR REPLACE.

create table if not exists hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  headline text,
  subtext text,
  cta_label text,
  cta_href text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table hero_slides enable row level security;

-- Anyone (including signed-out shoppers) can see active slides — this is
-- what the public homepage carousel reads.
drop policy if exists "Public can view active hero slides" on hero_slides;
create policy "Public can view active hero slides" on hero_slides
  for select using (is_active = true);

-- Admins can see everything, including inactive/draft slides, in the admin panel.
drop policy if exists "Admins can view all hero slides" on hero_slides;
create policy "Admins can view all hero slides" on hero_slides
  for select using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can insert hero slides" on hero_slides;
create policy "Admins can insert hero slides" on hero_slides
  for insert with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can update hero slides" on hero_slides;
create policy "Admins can update hero slides" on hero_slides
  for update using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can delete hero slides" on hero_slides;
create policy "Admins can delete hero slides" on hero_slides
  for delete using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

-- ─── Storage bucket for hero images ────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('hero-images', 'hero-images', true)
  on conflict (id) do nothing;

drop policy if exists "Public can view hero images" on storage.objects;
create policy "Public can view hero images" on storage.objects
  for select using (bucket_id = 'hero-images');

drop policy if exists "Admins can upload hero images" on storage.objects;
create policy "Admins can upload hero images" on storage.objects
  for insert with check (
    bucket_id = 'hero-images'
    and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can update hero images" on storage.objects;
create policy "Admins can update hero images" on storage.objects
  for update using (
    bucket_id = 'hero-images'
    and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can delete hero images" on storage.objects;
create policy "Admins can delete hero images" on storage.objects
  for delete using (
    bucket_id = 'hero-images'
    and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

-- Seed with the new no-model product shots so the carousel isn't empty on
-- first deploy — edit/replace these from the admin panel any time.
insert into hero_slides (image_url, headline, subtext, cta_label, cta_href, sort_order)
select * from (values
  ('/images/hero/hero-1.jpg', 'Pleated Chiffon Dress', 'KES 1,500', 'SHOP NOW', '/shop', 1),
  ('/images/hero/hero-2.jpg', 'New Arrivals', 'All KES 1,500', 'SHOP NOW', '/shop', 2),
  ('/images/hero/hero-3.jpg', 'Marble Print Midi', 'Nationwide Delivery', 'SHOP NOW', '/shop', 3)
) as seed(image_url, headline, subtext, cta_label, cta_href, sort_order)
where not exists (select 1 from hero_slides);
