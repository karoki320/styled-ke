-- Styled.ke — mobile-friendly focal point for hero images
-- Run this in the Supabase SQL editor after 0002_hero_slides.sql.
-- Safe to re-run.
--
-- Why: hero photos are wide desktop-style compositions (garment off to one
-- side, lots of empty background). On a narrow phone screen the carousel
-- crops in tight and a fixed center-crop can cut the garment out of frame
-- entirely. focal_x lets each slide say where its subject actually is
-- (0 = far left, 50 = center, 100 = far right) so the crop always keeps it
-- in view, on any screen size.

alter table hero_slides add column if not exists focal_x int not null default 50;
alter table hero_slides drop constraint if exists hero_slides_focal_x_check;
alter table hero_slides add constraint hero_slides_focal_x_check check (focal_x >= 0 and focal_x <= 100);

-- Correct focal point for the 3 seeded launch photos (only touches rows
-- that still have the seed's original image path — safe no-op otherwise).
update hero_slides set focal_x = 25 where image_url = '/images/hero/hero-1.jpg'; -- dress sits left-of-frame
update hero_slides set focal_x = 50 where image_url = '/images/hero/hero-2.jpg'; -- flat-lay spans the width
update hero_slides set focal_x = 78 where image_url = '/images/hero/hero-3.jpg'; -- dress sits right-of-frame
