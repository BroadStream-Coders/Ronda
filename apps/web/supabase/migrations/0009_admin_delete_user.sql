-- RM-014: eliminar un usuario por completo desde el admin, con borrado limpio.
-- auth.users no es borrable desde el cliente; esta función SECURITY DEFINER lo hace,
-- solo para admins. memberships y platform_admins se van por `on delete cascade`;
-- las invitations (van por email, no por FK) se limpian aquí a mano.

create or replace function public.admin_delete_user(target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_email text;
begin
  if not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  if target_user = auth.uid() then
    raise exception 'cannot delete yourself';
  end if;

  select lower(email) into target_email
  from auth.users
  where id = target_user;

  if target_email is not null then
    delete from public.invitations where lower(email) = target_email;
  end if;

  delete from auth.users where id = target_user;
end;
$$;
