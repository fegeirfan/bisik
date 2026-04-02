alter table public.profiles
  add column if not exists role text not null default 'user' check (role in ('user', 'admin', 'super_admin')),
  add column if not exists account_status text not null default 'active' check (account_status in ('active', 'suspended')),
  add column if not exists last_seen_at timestamptz;

create table if not exists public.app_settings (
  id bigint primary key,
  app_name text not null default 'bisik',
  tagline text not null default 'Ruang ceritamu yang tenang',
  system_prompt text not null default 'Kamu adalah Bisik, pendamping diary AI yang hangat, empatik, dan tidak menghakimi.',
  temperature numeric(3,2) not null default 0.7,
  max_response_length integer not null default 400,
  response_delay_ms integer not null default 1800,
  rate_limit_per_hour integer not null default 60,
  memory_hint boolean not null default true,
  mood_detection boolean not null default true,
  adaptive_tone boolean not null default false,
  night_mode_ai boolean not null default true,
  maintenance_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id)
values (1)
on conflict (id) do nothing;

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute procedure public.set_updated_at();

alter table public.app_settings enable row level security;

drop policy if exists "admins can manage app settings" on public.app_settings;
create policy "admins can manage app settings"
on public.app_settings
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
  )
);

drop policy if exists "admins can read all profiles" on public.profiles;
create policy "admins can read all profiles"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.profiles as me
    where me.id = auth.uid()
      and me.role in ('admin', 'super_admin')
  )
);

drop policy if exists "admins can update all profiles" on public.profiles;
create policy "admins can update all profiles"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.profiles as me
    where me.id = auth.uid()
      and me.role in ('admin', 'super_admin')
  )
)
with check (
  id = auth.uid()
  or exists (
    select 1 from public.profiles as me
    where me.id = auth.uid()
      and me.role in ('admin', 'super_admin')
  )
);

drop policy if exists "admins can read all diary entries" on public.diary_entries;
create policy "admins can read all diary entries"
on public.diary_entries
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles as me
    where me.id = auth.uid()
      and me.role in ('admin', 'super_admin')
  )
);

drop policy if exists "admins can read all refined journals" on public.refined_journals;
create policy "admins can read all refined journals"
on public.refined_journals
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles as me
    where me.id = auth.uid()
      and me.role in ('admin', 'super_admin')
  )
);

drop policy if exists "admins can manage personas" on public.personas;
create policy "admins can manage personas"
on public.personas
for all
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.profiles as me
    where me.id = auth.uid()
      and me.role in ('admin', 'super_admin')
  )
  or (is_system = true and status = 'active')
)
with check (
  owner_id = auth.uid()
  or exists (
    select 1 from public.profiles as me
    where me.id = auth.uid()
      and me.role in ('admin', 'super_admin')
  )
);
