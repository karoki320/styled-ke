-- Styled.ke — tag POS sales with which physical branch made them.
-- Run this in the Supabase SQL editor after 0006_pos_sales.sql.
-- Safe to re-run: IF NOT EXISTS guards every statement.
--
-- Two branches for now (Ufundi, Thogoto) but kept as a plain text column
-- rather than a check constraint or lookup table — matches how every other
-- enum-like column in this schema works (payment_method, status, source),
-- and means adding branch #3 later is a code change in
-- lib/pos-branches.ts, not another migration.

alter table pos_sales add column if not exists branch text not null default 'Ufundi';

comment on column pos_sales.branch is
  'Which physical till made the sale. Valid values are whatever lib/pos-branches.ts (POS_BRANCHES) currently lists — not DB-enforced by design, see migration comment.';
