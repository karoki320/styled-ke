# Styled.ke

Full-stack e-commerce platform for Styled.ke — a Nairobi fashion & fragrance
boutique. Storefront, admin dashboard, POS, and WhatsApp automation, all
backed by one Supabase database.

## What's here

The whole app runs and is fully clickable **right now, with zero
configuration** — every page uses realistic mock data (see `lib/mock-data.ts`)
so you can review the design and flows before connecting any real service.
Every integration (Supabase, Paystack, WhatsApp) is fully coded against real
APIs; it's simply inert until you add its environment variables, at which
point the relevant code path switches over automatically (see each file's
"falls back to mock" comments, e.g. `app/api/orders/route.ts`).

- **Storefront** (`app/(store)`) — homepage, shop, product detail, cart,
  4-step checkout, order tracking, account/auth.
- **Admin** (`app/(admin)/admin`) — dashboard, orders, products, customers,
  analytics, POS, WhatsApp inbox + automation builder, delivery areas,
  settings. Protected by `middleware.ts` once Supabase auth is connected.
- **API routes** (`app/api`) — Paystack initialize/verify/webhook, WhatsApp
  webhook/send, order creation.
- **Database** (`supabase/migrations/0001_init.sql`) — full schema, RLS
  policies, and storage buckets, matching `lib/supabase/types.ts`.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The admin panel is at `/admin`.

## Connecting real services

Copy `.env.example` to `.env.local` and fill in keys as you set each one up.
You don't need all of them at once — add Supabase first, then Paystack, then
WhatsApp, testing as you go.

### 1. Supabase (database, auth, storage)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `supabase/migrations/0001_init.sql`.
3. Create storage buckets `product-images` (public) and `receipts` (private)
   — the migration does this for you if you ran it via the SQL editor.
4. Copy the Project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Copy the service role key (Settings ->
   API) into `SUPABASE_SERVICE_ROLE_KEY` — keep this one secret.
5. To make yourself an admin: sign up through `/account`, then in the
   Supabase table editor add a row to `profiles` with your user's `id` and
   `is_admin = true`.

### 2. Paystack (card + M-Pesa checkout)

1. Get your keys from the
   [Paystack dashboard](https://dashboard.paystack.com/#/settings/developers).
2. Set `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
3. In the Paystack dashboard, add a webhook pointing at
   `https://yourdomain.com/api/paystack/webhook`.

### 3. WhatsApp Cloud API

1. Create a Meta app with the WhatsApp product at
   [developers.facebook.com](https://developers.facebook.com/apps).
2. Set `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_BUSINESS_ID`.
3. Pick any string for `WHATSAPP_VERIFY_TOKEN` and use the same value when
   configuring the webhook URL in the Meta dashboard:
   `https://yourdomain.com/api/whatsapp/webhook`.
4. Set `OWNER_WHATSAPP_NUMBER` so new-order alerts reach you.

### 4. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. Add every variable from `.env.example` in the Vercel project's
   Environment Variables settings.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL once you have a domain.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres,
Auth, Storage) · Paystack · Meta WhatsApp Cloud API · Zustand · Recharts.

## Design system

Colors, type, and component classes live in `tailwind.config.ts` and
`app/globals.css` (`.btn-blk`, `.btn-wa`, `.sec-title`, etc.) — matched
directly against the approved design reference.

## Business details (hard-coded, update in `lib/utils.ts` / `lib/mock-data.ts`)

- WhatsApp: +254 734 807 511
- M-Pesa Paybill: 247 247, Account: 094 903
- All clothing: KES 1,500
"# styled-ke" 
