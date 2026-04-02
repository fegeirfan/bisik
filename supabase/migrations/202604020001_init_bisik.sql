create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.personas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '🫂',
  description text not null default '',
  prompt_override text,
  tone text not null default 'supportive',
  tone_modifier numeric(3,2) not null default 0.65 check (tone_modifier >= 0 and tone_modifier <= 1),
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  selected_persona_id uuid references public.personas(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  persona_id uuid references public.personas(id) on delete set null,
  title text,
  content text not null check (char_length(trim(content)) > 0),
  mood text not null check (mood in ('happy', 'neutral', 'sad', 'tired', 'frustrated')),
  tag text,
  insight text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.refined_journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diary_entry_id uuid not null unique references public.diary_entries(id) on delete cascade,
  title text,
  content text not null,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists personas_owner_idx on public.personas(owner_id);
create index if not exists diary_entries_user_created_idx on public.diary_entries(user_id, created_at desc);
create index if not exists refined_journals_user_created_idx on public.refined_journals(user_id, created_at desc);

drop trigger if exists personas_set_updated_at on public.personas;
create trigger personas_set_updated_at
before update on public.personas
for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists diary_entries_set_updated_at on public.diary_entries;
create trigger diary_entries_set_updated_at
before update on public.diary_entries
for each row execute procedure public.set_updated_at();

drop trigger if exists refined_journals_set_updated_at on public.refined_journals;
create trigger refined_journals_set_updated_at
before update on public.refined_journals
for each row execute procedure public.set_updated_at();

insert into public.personas (slug, name, icon, description, tags, is_system, status, tone)
values
  ('friend', 'Teman', '🫂', 'Hangat, suportif, dan mendengarkan.', '["tone: santai", "empati tinggi", "default"]'::jsonb, true, 'active', 'warm'),
  ('mentor', 'Mentor', '🧠', 'Membantu menata pikiran dengan tenang.', '["tone: logis", "insight", "structured"]'::jsonb, true, 'active', 'analytical'),
  ('reflector', 'Reflector', '🪞', 'Mengajak melihat pola dan makna.', '["tone: netral", "mirror", "minimal"]'::jsonb, true, 'active', 'reflective')
on conflict (slug) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_persona uuid;
begin
  select id into default_persona from public.personas where slug = 'friend' limit 1;

  insert into public.profiles (id, email, display_name, selected_persona_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    default_persona
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.personas enable row level security;
alter table public.profiles enable row level security;
alter table public.diary_entries enable row level security;
alter table public.refined_journals enable row level security;

drop policy if exists "public can read active system personas" on public.personas;
create policy "public can read active system personas"
on public.personas
for select
using (is_system = true and status = 'active');

drop policy if exists "authenticated can manage owned personas" on public.personas;
create policy "authenticated can manage owned personas"
on public.personas
for all
to authenticated
using (owner_id = auth.uid() or (is_system = true and status = 'active'))
with check (owner_id = auth.uid());

drop policy if exists "users can view own profile" on public.profiles;
create policy "users can view own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "users can manage own diary entries" on public.diary_entries;
create policy "users can manage own diary entries"
on public.diary_entries
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "users can manage own refined journals" on public.refined_journals;
create policy "users can manage own refined journals"
on public.refined_journals
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
