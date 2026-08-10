-- RM-011: rol de plataforma (super admin) a nivel de datos.
-- El admin ve todos los programas (sin membresía) y es el único que puede crearlos.

-- 1. Quiénes son admins. RLS activada SIN políticas de cliente: invisible desde la
--    app; solo gestionable por el rol de servicio (Table Editor / SQL del dashboard).
create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;

-- 2. Helper: ¿el usuario actual es admin? SECURITY DEFINER para leer platform_admins
--    saltándose RLS y evitar recursión en las políticas.
create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.platform_admins a
    where a.user_id = auth.uid()
  );
$$;

-- 3. Bypass de admin en `programs`: el admin ve todo.
drop policy if exists "programs_read_member" on public.programs;

create policy "programs_read_member_or_admin"
  on public.programs
  for select
  to authenticated
  using (public.is_member(id) or public.is_platform_admin());

-- 4. Solo el admin crea programas desde la app (el rol de servicio ignora RLS).
create policy "programs_insert_admin"
  on public.programs
  for insert
  to authenticated
  with check (public.is_platform_admin());

-- 5. Sembrarte como admin (ajusta el email si hace falta).
insert into public.platform_admins (user_id)
select id from auth.users where email = 'esteban.abanto.2709@gmail.com'
on conflict (user_id) do nothing;
