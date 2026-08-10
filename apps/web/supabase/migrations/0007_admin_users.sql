-- RM-013: gestión de usuarios desde el dashboard admin.

-- 1. Listar usuarios registrados. auth.users no es legible desde el cliente,
--    así que una función SECURITY DEFINER lo expone SOLO a admins (el WHERE
--    devuelve vacío para cualquier no-admin).
create or replace function public.admin_list_users()
returns table (id uuid, email text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select u.id, u.email::text, u.created_at
  from auth.users u
  where public.is_platform_admin()
  order by u.created_at;
$$;

-- 2. El admin puede leer, asignar y quitar membresías de cualquiera.
--    (La policy `memberships_read_own` sigue existiendo; las SELECT se combinan con OR.)
create policy "memberships_read_admin"
  on public.memberships
  for select
  to authenticated
  using (public.is_platform_admin());

create policy "memberships_insert_admin"
  on public.memberships
  for insert
  to authenticated
  with check (public.is_platform_admin());

create policy "memberships_delete_admin"
  on public.memberships
  for delete
  to authenticated
  using (public.is_platform_admin());
