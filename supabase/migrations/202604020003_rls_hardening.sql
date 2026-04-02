-- RLS hardening for production:
-- - prevent deleting system personas via overly-broad "for all" policy
-- - allow authenticated users to read their own personas

-- Personas: replace overly permissive policies
drop policy if exists "authenticated can manage owned personas" on public.personas;
drop policy if exists "admins can manage personas" on public.personas;

drop policy if exists "authenticated can read own personas" on public.personas;
create policy "authenticated can read own personas"
on public.personas
for select
to authenticated
using (
  (is_system = true and status = 'active')
  or owner_id = auth.uid()
);

drop policy if exists "authenticated can create owned personas" on public.personas;
create policy "authenticated can create owned personas"
on public.personas
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "authenticated can update owned personas" on public.personas;
create policy "authenticated can update owned personas"
on public.personas
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "authenticated can delete owned personas" on public.personas;
create policy "authenticated can delete owned personas"
on public.personas
for delete
to authenticated
using (owner_id = auth.uid());

-- Admin personas: allow admin to edit personas, but never delete system personas.
drop policy if exists "admins can update personas" on public.personas;
create policy "admins can update personas"
on public.personas
for update
to authenticated
using (
  exists (
    select 1 from public.profiles as me
    where me.id = auth.uid()
      and me.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1 from public.profiles as me
    where me.id = auth.uid()
      and me.role in ('admin', 'super_admin')
  )
);

drop policy if exists "admins can delete non-system personas" on public.personas;
create policy "admins can delete non-system personas"
on public.personas
for delete
to authenticated
using (
  is_system = false
  and exists (
    select 1 from public.profiles as me
    where me.id = auth.uid()
      and me.role in ('admin', 'super_admin')
  )
);

