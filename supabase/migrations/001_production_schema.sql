create extension if not exists pg_cron with schema extensions;

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
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

insert into public.site_config (id, content) values ('primary', '{}'::jsonb) on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.user_data enable row level security;
alter table public.site_config enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = 'user');
create policy "user_data_own_all" on public.user_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "site_config_public_read" on public.site_config for select using (true);
create policy "site_config_admin_insert" on public.site_config for insert with check (public.is_admin());
create policy "site_config_admin_update" on public.site_config for update using (public.is_admin()) with check (public.is_admin());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name) values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', ''));
  insert into public.user_data (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.delete_expired_user_data() returns void language sql security definer set search_path = public as $$
  delete from public.user_data where expires_at < now();
$$;

select cron.schedule('delete-expired-course-data', '15 3 * * *', $$select public.delete_expired_user_data();$$)
where not exists (select 1 from cron.job where jobname = 'delete-expired-course-data');

