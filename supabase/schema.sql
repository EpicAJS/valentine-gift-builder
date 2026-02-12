-- Supabase schema for Valentine Gift Builder

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  config jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.gifts enable row level security;

-- Allow anonymous inserts so the builder can save gifts
create policy "Allow anon insert gifts"
  on public.gifts
  for insert
  to anon
  with check (true);

-- Allow anonymous select by slug so recipients can view their gift
create policy "Allow anon select gifts by slug"
  on public.gifts
  for select
  to anon
  using (slug is not null);

