-- Trainton auth bootstrap: profiles + personal data account
-- Apply in Supabase SQL editor or via CLI migration.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.data_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance_mb integer not null default 0 check (balance_mb >= 0),
  total_charged_mb integer not null default 0 check (total_charged_mb >= 0),
  version integer not null default 0 check (version >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.data_accounts enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "data_accounts_select_own" on public.data_accounts;
create policy "data_accounts_select_own"
  on public.data_accounts
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Do not allow authenticated clients to insert balance rows directly.
-- Arbitrary positive balances via PostgREST would bypass server credit rules.
drop policy if exists "data_accounts_insert_own" on public.data_accounts;

-- No update/delete policies for authenticated role on purpose.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'nickname',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (user_id) do nothing;

  insert into public.data_accounts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Safe bootstrap for users created before the migration/trigger existed.
-- Always inserts a zeroed row for auth.uid() only; never accepts client amounts.
create or replace function public.ensure_own_data_account()
returns public.data_accounts
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer uuid := auth.uid();
  account public.data_accounts;
begin
  if viewer is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  insert into public.data_accounts (
    user_id,
    balance_mb,
    total_charged_mb,
    version
  )
  values (viewer, 0, 0, 0)
  on conflict (user_id) do nothing;

  select *
  into account
  from public.data_accounts
  where user_id = viewer;

  return account;
end;
$$;

revoke all on function public.ensure_own_data_account() from public;
grant execute on function public.ensure_own_data_account() to authenticated;
