-- Improve display_name population for OAuth providers (e.g. Google)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_persona uuid;
  next_display_name text;
begin
  select id into default_persona from public.personas where slug = 'friend' limit 1;

  next_display_name :=
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    );

  insert into public.profiles (id, email, display_name, selected_persona_id)
  values (
    new.id,
    new.email,
    next_display_name,
    default_persona
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

