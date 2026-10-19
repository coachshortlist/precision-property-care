-- Precision Property Care: database setup.
-- Paste this whole file into Supabase > SQL Editor > New query, change the email on the last line, then click Run.
-- Safe to run more than once.

-- Who can open the lead dashboard
create table if not exists public.admins (
  email text primary key
);

-- Every enquiry from the website, plus leads added by hand
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  mobile text not null,
  email text,
  postcode text,
  service text,
  size text,
  extras text[] not null default '{}',
  budget text,
  timeframe text,
  notes text,
  via text,                 -- Price estimator, Contact form, Added by hand
  source text,              -- google, facebook, instagram, direct, phone, whatsapp...
  utm jsonb,
  referrer text,
  landing_page text,
  est_low numeric,
  est_high numeric,
  stage text not null default 'New' check (stage in ('New','Contacted','Site visit','Quote sent','Won','Lost')),
  final_value numeric,
  photos text[] not null default '{}',
  edit_token uuid not null default gen_random_uuid()   -- lets the visitor add photos to their own enquiry, nothing else
);
create index if not exists leads_created_idx on public.leads (created_at desc);

-- Anonymous website activity: visits and button taps. No personal details.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type text not null,
  source text,
  page text,
  service text
);
create index if not exists events_created_idx on public.events (created_at desc);

-- Security: nobody can read anything unless they are signed in AND listed in admins.
-- The website itself saves enquiries through a server function, never directly from the browser.
alter table public.admins enable row level security;
alter table public.leads  enable row level security;
alter table public.events enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admins read leads"   on public.leads;
drop policy if exists "admins add leads"    on public.leads;
drop policy if exists "admins edit leads"   on public.leads;
drop policy if exists "admins delete leads" on public.leads;
drop policy if exists "admins read events"  on public.events;
create policy "admins read leads"   on public.leads  for select to authenticated using (public.is_admin());
create policy "admins add leads"    on public.leads  for insert to authenticated with check (public.is_admin());
create policy "admins edit leads"   on public.leads  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete leads" on public.leads  for delete to authenticated using (public.is_admin());
create policy "admins read events"  on public.events for select to authenticated using (public.is_admin());

-- Private storage for customers' photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lead-photos', 'lead-photos', false, 15728640, array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do nothing;

drop policy if exists "admins view lead photos"   on storage.objects;
drop policy if exists "admins delete lead photos" on storage.objects;
create policy "admins view lead photos"   on storage.objects for select to authenticated using (bucket_id = 'lead-photos' and public.is_admin());
create policy "admins delete lead photos" on storage.objects for delete to authenticated using (bucket_id = 'lead-photos' and public.is_admin());

-- CHANGE THIS to the email address that should be able to log in to the dashboard.
-- Add more lines like it for anyone else who needs access.
insert into public.admins (email) values ('change-me@example.com') on conflict do nothing;
