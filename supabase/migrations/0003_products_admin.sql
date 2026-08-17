-- Styled.ke — admin write access to the product catalogue + seed data
-- Run this in the Supabase SQL editor after 0001_init.sql and 0002_hero_slides.sql.
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / CREATE OR REPLACE.

-- ─── Admin write policies (0001_init.sql only granted public SELECT) ───
drop policy if exists "Admins can view all products" on products;
create policy "Admins can view all products" on products
  for select using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
drop policy if exists "Admins can insert products" on products;
create policy "Admins can insert products" on products
  for insert with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
drop policy if exists "Admins can update products" on products;
create policy "Admins can update products" on products
  for update using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
drop policy if exists "Admins can delete products" on products;
create policy "Admins can delete products" on products
  for delete using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can insert product images" on product_images;
create policy "Admins can insert product images" on product_images
  for insert with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
drop policy if exists "Admins can update product images" on product_images;
create policy "Admins can update product images" on product_images
  for update using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
drop policy if exists "Admins can delete product images" on product_images;
create policy "Admins can delete product images" on product_images
  for delete using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can insert product variants" on product_variants;
create policy "Admins can insert product variants" on product_variants
  for insert with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
drop policy if exists "Admins can update product variants" on product_variants;
create policy "Admins can update product variants" on product_variants
  for update using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
drop policy if exists "Admins can delete product variants" on product_variants;
create policy "Admins can delete product variants" on product_variants
  for delete using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

drop policy if exists "Admins can insert categories" on categories;
create policy "Admins can insert categories" on categories
  for insert with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
drop policy if exists "Admins can update categories" on categories;
create policy "Admins can update categories" on categories
  for update using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

-- ─── Storage: product-images bucket admin write policies ───────────
-- (0001_init.sql created the bucket as public but never added object
-- policies, so admin uploads were being rejected by the default-deny rule.)
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
drop policy if exists "Admins can update product images storage" on storage.objects;
create policy "Admins can update product images storage" on storage.objects
  for update using (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
drop policy if exists "Admins can delete product images storage" on storage.objects;
create policy "Admins can delete product images storage" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );

-- ─── Seed: Clothing category ────────────────────────────────────────
insert into categories (name, slug, description, image_url, display_order)
select 'Clothing', 'clothing', 'Dresses & tops — all KES 1,500', '/images/IMG_ORANGE.jpg', 1
where not exists (select 1 from categories where slug = 'clothing');

-- ─── Seed: starting catalogue (only runs once, on an empty table) ──
do $$
declare
  clothing_id uuid;
  new_id uuid;
begin
  if exists (select 1 from products) then
    return; -- catalogue already has real data — never overwrite it
  end if;

  select id into clothing_id from categories where slug = 'clothing';

  -- Abstract Kaftan Top – Orange/Red
  insert into products (name, slug, description, category_id, price, stock_quantity, low_stock_threshold, badge, sku, is_featured)
  values ('Abstract Kaftan Top – Orange/Red', 'abstract-kaftan-top-orange-red',
    'Bold abstract print kaftan top in vibrant orange, red and pink. Flowy, flattering, and incredibly comfortable. Pairs perfectly with leggings or wide-leg pants. One size fits most.',
    clothing_id, 1500, 8, 5, 'NEW', 'SK-CL-001', true)
  returning id into new_id;
  insert into product_images (product_id, image_url, is_primary, display_order) values
    (new_id, '/images/IMG_ORANGE.jpg', true, 1),
    (new_id, '/images/IMG_BLUE.jpg', false, 2);
  insert into product_variants (product_id, name) values (new_id, 'Orange / Red'), (new_id, 'Blue / White');

  -- Abstract Kaftan Top – Blue/White
  insert into products (name, slug, description, category_id, price, stock_quantity, low_stock_threshold, badge, sku, is_featured)
  values ('Abstract Kaftan Top – Blue/White', 'abstract-kaftan-top-blue-white',
    'Cool-toned abstract print kaftan top in ocean blues and white. The same flattering flowy cut — perfect for the office or a casual day out. One size fits most.',
    clothing_id, 1500, 6, 5, 'NEW', 'SK-CL-002', true)
  returning id into new_id;
  insert into product_images (product_id, image_url, is_primary, display_order) values
    (new_id, '/images/IMG_BLUE.jpg', true, 1),
    (new_id, '/images/IMG_ORANGE.jpg', false, 2);
  insert into product_variants (product_id, name) values (new_id, 'Blue / White'), (new_id, 'Orange / Red');

  -- Pleated Chiffon Dress – Black
  insert into products (name, slug, description, category_id, price, stock_quantity, low_stock_threshold, badge, sku, is_featured)
  values ('Pleated Chiffon Dress – Black', 'pleated-chiffon-dress-black',
    'Elegant pleated chiffon two-layer dress in classic black. Bat-wing sleeves, cascading layered skirt — effortlessly chic for events, church, or dinner.',
    clothing_id, 1500, 4, 5, 'NEW', 'SK-CL-003', true)
  returning id into new_id;
  insert into product_images (product_id, image_url, is_primary, display_order) values
    (new_id, '/images/IMG_BLACK.jpg', true, 1),
    (new_id, '/images/IMG_PURPLE.jpg', false, 2);
  insert into product_variants (product_id, name) values (new_id, 'Black'), (new_id, 'Purple');

  -- Pleated Chiffon Dress – Purple
  insert into products (name, slug, description, category_id, price, stock_quantity, low_stock_threshold, badge, sku, is_featured)
  values ('Pleated Chiffon Dress – Purple', 'pleated-chiffon-dress-purple',
    'Make a statement in this gorgeous purple pleated chiffon dress. The rich amethyst colour and flattering layered silhouette command attention at any occasion.',
    clothing_id, 1500, 3, 5, 'NEW', 'SK-CL-004', true)
  returning id into new_id;
  insert into product_images (product_id, image_url, is_primary, display_order) values
    (new_id, '/images/IMG_PURPLE.jpg', true, 1),
    (new_id, '/images/IMG_BLACK.jpg', false, 2);
  insert into product_variants (product_id, name) values (new_id, 'Purple'), (new_id, 'Black');

  -- Feather Print Belted Midi Dress
  insert into products (name, slug, description, category_id, price, stock_quantity, low_stock_threshold, badge, sku, is_featured)
  values ('Feather Print Belted Midi Dress', 'feather-print-belted-midi-dress',
    'Sophisticated steel-blue feather print midi dress with button detail and matching belt. Long bishop sleeves add elegance. Perfect for formal occasions and professional settings.',
    clothing_id, 1500, 5, 5, 'NEW', 'SK-CL-005', true)
  returning id into new_id;
  insert into product_images (product_id, image_url, is_primary, display_order) values
    (new_id, '/images/IMG_GREY.jpg', true, 1);

  -- Marble Print Midi Dress
  insert into products (name, slug, description, category_id, price, stock_quantity, low_stock_threshold, badge, sku, is_featured)
  values ('Marble Print Midi Dress', 'marble-print-midi-dress',
    'Stunning marble print midi dress in navy, brown and white. Three-quarter puff sleeves with a full A-line skirt. Eye-catching, elegant and effortlessly unique.',
    clothing_id, 1500, 7, 5, 'NEW', 'SK-CL-006', true)
  returning id into new_id;
  insert into product_images (product_id, image_url, is_primary, display_order) values
    (new_id, '/images/IMG_MARBLE.jpg', true, 1);

  -- Belted Maxi Dress – Beige
  insert into products (name, slug, description, category_id, price, stock_quantity, low_stock_threshold, badge, sku, is_featured)
  values ('Belted Maxi Dress – Beige', 'belted-maxi-dress-beige',
    'Classic belted maxi dress in warm beige with striped belt and collar detail. Long flowing silhouette, gold button accents. Sophisticated and versatile for any occasion.',
    clothing_id, 1500, 5, 5, 'NEW', 'SK-CL-007', true)
  returning id into new_id;
  insert into product_images (product_id, image_url, is_primary, display_order) values
    (new_id, '/images/IMG_BEIGE.jpg', true, 1);
end $$;

-- ─── Fix: earlier hero_slides seed referenced .png files that have since
-- been re-encoded as smaller .jpg files — repoint any rows still pointing
-- at the old filenames (harmless no-op if you seeded after this change).
update hero_slides set image_url = '/images/hero/hero-1.jpg' where image_url = '/images/hero/hero-1.png';
update hero_slides set image_url = '/images/hero/hero-2.jpg' where image_url = '/images/hero/hero-2.png';
update hero_slides set image_url = '/images/hero/hero-3.jpg' where image_url = '/images/hero/hero-3.png';
