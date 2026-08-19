-- Styled.ke — announcement bar (admin-managed rotating offers/news strip)
-- Run this in the Supabase SQL editor after 0004_hero_focal_point.sql.
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / CREATE OR REPLACE.

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  link_href text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table announcements enable row level security;

-- Anyone (including signed-out shoppers) can see active announcements —
-- this is what the public site-wide top bar reads.
drop policy if exists "Public can view active announcements" on announcements;
create policy "Public can view active announcements" on announcements
  for select using (is_active = true);

-- Admins can see everything, including inactive/draft announcements.
drop policy if exists "Admins can view all announcements" on announcements;
create policy "Admins can view all announcements" on announcements
  for select using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can insert announcements" on announcements;
create policy "Admins can insert announcements" on announcements
  for insert with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can update announcements" on announcements;
create policy "Admins can update announcements" on announcements
  for update using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can delete announcements" on announcements;
create policy "Admins can delete announcements" on announcements
  for delete using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

-- Seed with the same 3 messages the bar used to hardcode, so the strip
-- isn't empty on first deploy — edit/replace/add more from the admin panel.
insert into announcements (message, link_href, sort_order)
select * from (values
  ('All clothing KES 1,500 · Nationwide delivery', '/shop', 1),
  ('Chat with us on WhatsApp: 0734 807 511', 'https://wa.me/254734807511?text=Hello!', 2),
  ('Visit us in store', null, 3)
) as seed(message, link_href, sort_order)
where not exists (select 1 from announcements);
