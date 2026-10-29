-- ============================================================
-- BRAVON WEB APP — SUPABASE DATABASE SCHEMA
-- ============================================================
-- Execute this SQL script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. ORDERS TABLE
create table if not exists public.orders (
  id text primary key, -- Stripe checkout session id or order id (e.g. cs_...)
  payment_intent_id text,
  customer_email text not null,
  customer_name text,
  shipping jsonb,
  items jsonb not null default '[]'::jsonb,
  amount_total numeric not null,
  currency text not null default 'USD',
  payment_status text not null default 'paid',
  fulfillment_status text not null default 'unfulfilled',
  tracking_number text,
  tracking_carrier text,
  created_at timestamptz not null default now()
);

-- Index orders by email and fulfillment status for fast querying
create index if not exists idx_orders_customer_email on public.orders (customer_email);
create index if not exists idx_orders_fulfillment_status on public.orders (fulfillment_status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- 2. CLAIMS TABLE (WARRANTY & RETURNS)
create table if not exists public.claims (
  id text primary key, -- e.g. "RMA-2026-1048"
  order_id text not null,
  customer_email text not null,
  customer_name text,
  customer_phone text,
  claim_type text not null, -- 'return' | 'warranty' | 'return_30d' | 'warranty_2yr' | 'doa'
  reason text not null,
  description text not null,
  serial_number text,
  purchase_date text,
  preferred_resolution text,
  photo_url text,
  status text not null default 'pending', -- 'pending' | 'approved' | 'inspecting' | 'replaced' | 'refunded' | 'rejected'
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_claims_order_id on public.claims (order_id);
create index if not exists idx_claims_customer_email on public.claims (customer_email);
create index if not exists idx_claims_status on public.claims (status);

-- 3. REVIEWS TABLE
create table if not exists public.reviews (
  id text primary key,
  author text not null,
  role text,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text not null,
  comment text not null,
  date text not null,
  verified boolean not null default false,
  helpful_count integer not null default 0,
  status text not null default 'approved', -- 'approved' | 'pending' | 'rejected'
  is_featured boolean not null default false,
  variant_purchased text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_status on public.reviews (status);
create index if not exists idx_reviews_rating on public.reviews (rating desc);

-- 4. SITE CONFIGURATION TABLE
create table if not exists public.site_config (
  id text primary key default 'current',
  config jsonb not null,
  updated_at timestamptz not null default now()
);

-- 5. ADMIN AUTH & AUDIT TABLE
create table if not exists public.admin_auth (
  id text primary key default 'primary',
  password_hash text,
  salt text,
  two_factor_enabled boolean not null default false,
  two_factor_secret text,
  backup_codes jsonb not null default '[]'::jsonb,
  session_max_age_days integer not null default 7,
  security_logs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
alter table public.orders enable row level security;
alter table public.claims enable row level security;
alter table public.reviews enable row level security;
alter table public.site_config enable row level security;
alter table public.admin_auth enable row level security;

-- Policies for public customer read access where applicable:
-- Public can read approved reviews
create policy "Allow public to read approved reviews"
  on public.reviews for select
  using (status = 'approved');

-- Public can read site config
create policy "Allow public to read site config"
  on public.site_config for select
  using (true);

-- Allow backend service role (SUPABASE_SERVICE_ROLE_KEY) full access to all tables
create policy "Allow service role full access to orders"
  on public.orders for all
  using (auth.role() = 'service_role');

create policy "Allow service role full access to claims"
  on public.claims for all
  using (auth.role() = 'service_role');

create policy "Allow service role full access to reviews"
  on public.reviews for all
  using (auth.role() = 'service_role');

create policy "Allow service role full access to site_config"
  on public.site_config for all
  using (auth.role() = 'service_role');

create policy "Allow service role full access to admin_auth"
  on public.admin_auth for all
  using (auth.role() = 'service_role');

