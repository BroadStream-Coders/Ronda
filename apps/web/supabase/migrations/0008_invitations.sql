-- RM-006: invitaciones por email. Pre-asignar acceso a un programa usando el email
-- como llave, antes de que la persona se registre. No se envía correo real: la
-- invitación se activa sola en el primer login. Se conserva como historial (claimed_at).

-- 1. Invitaciones. Una fila pendiente = claimed_at nulo; tomada = con fecha.
create table if not exists public.invitations (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  program_id uuid not null references public.programs (id) on delete cascade,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  unique (email, program_id)
);

alter table public.invitations enable row level security;

-- Solo el admin lee y elimina. El insert y la conversión van por funciones.
create policy "invitations_read_admin"
  on public.invitations
  for select
  to authenticated
  using (public.is_platform_admin());

create policy "invitations_delete_admin"
  on public.invitations
  for delete
  to authenticated
  using (public.is_platform_admin());

-- 2. Invitar por email, con dedupe. Devuelve el caso ocurrido.
create or replace function public.invite_to_program(
  target_email text,
  target_program uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(target_email));
  existing_user_id uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  select id into existing_user_id
  from auth.users
  where lower(email) = normalized_email
  limit 1;

  if existing_user_id is not null then
    if exists (
      select 1 from public.memberships m
      where m.user_id = existing_user_id and m.program_id = target_program
    ) then
      return 'already_member';
    end if;

    insert into public.memberships (user_id, program_id)
    values (existing_user_id, target_program)
    on conflict do nothing;
    return 'granted';
  end if;

  if exists (
    select 1 from public.invitations i
    where i.email = normalized_email
      and i.program_id = target_program
      and i.claimed_at is null
  ) then
    return 'already_pending';
  end if;

  insert into public.invitations (email, program_id)
  values (normalized_email, target_program)
  on conflict (email, program_id) do nothing;
  return 'pending';
end;
$$;

-- 3. Al iniciar sesión, el usuario reclama sus invitaciones pendientes.
--    Inserta las membresías y marca las invitaciones como tomadas (no las borra).
create or replace function public.claim_pending_invitations()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_email text;
begin
  select lower(email) into current_email
  from auth.users
  where id = auth.uid();

  if current_email is null then
    return;
  end if;

  insert into public.memberships (user_id, program_id)
  select auth.uid(), i.program_id
  from public.invitations i
  where i.email = current_email and i.claimed_at is null
  on conflict do nothing;

  update public.invitations
  set claimed_at = now()
  where email = current_email and claimed_at is null;
end;
$$;
