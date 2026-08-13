create extension if not exists pg_cron with schema extensions;

create schema if not exists private;
revoke all on schema private from public;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 year')
);

create table if not exists public.site_config (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.site_config (id, content)
values ('primary', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.user_data enable row level security;
alter table public.site_config enable row level security;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon, service_role;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "user_data_select_own"
on public.user_data for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "user_data_insert_own"
on public.user_data for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "user_data_update_own"
on public.user_data for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "site_config_public_read"
on public.site_config for select
to anon, authenticated
using (true);

create policy "site_config_admin_insert"
on public.site_config for insert
to authenticated
with check ((select private.is_admin()));

create policy "site_config_admin_update"
on public.site_config for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

revoke all on public.profiles, public.user_data, public.site_config from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update on public.user_data to authenticated;
grant select on public.site_config to anon, authenticated;
grant insert, update on public.site_config to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  insert into public.user_data (user_id) values (new.id);
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated, service_role;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.delete_expired_user_data()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.user_data where expires_at < now();
$$;

revoke all on function private.delete_expired_user_data() from public, anon, authenticated, service_role;

select cron.schedule(
  'delete-expired-course-data',
  '15 3 * * *',
  $$select private.delete_expired_user_data();$$
)
where not exists (
  select 1 from cron.job where jobname = 'delete-expired-course-data'
);
