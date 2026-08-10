-- RM-012: el admin puede editar y eliminar programas desde la app.
-- (Crear ya estaba habilitado en RM-011 con `programs_insert_admin`.)

create policy "programs_update_admin"
  on public.programs
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "programs_delete_admin"
  on public.programs
  for delete
  to authenticated
  using (public.is_platform_admin());
