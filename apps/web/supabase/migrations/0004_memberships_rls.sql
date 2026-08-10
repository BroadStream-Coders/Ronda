-- RM-005: acceso por membresía. RLS default-deny: un usuario solo ve los programas
-- donde tiene una fila en `memberships`. Otorgar/quitar acceso = editar filas en el
-- Table Editor (sin SQL ni migración). Reemplaza el "todos ven todo" de RM-010.

-- 1. Tabla de membresías (usuario <-> programa).
create table if not exists public.memberships (
  user_id    uuid not null references auth.users (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, program_id)
);

alter table public.memberships enable row level security;

-- Cada usuario ve solo sus propias membresías.
create policy "memberships_read_own"
  on public.memberships
  for select
  to authenticated
  using (user_id = auth.uid());

-- 2. Helper anti-recursión: SECURITY DEFINER salta RLS al checar la membresía,
--    así la policy de `programs` puede consultar `memberships` sin recursión.
create or replace function public.is_member(target_program uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.memberships m
    where m.program_id = target_program
      and m.user_id = auth.uid()
  );
$$;

-- 3. Reemplazar "todos los autenticados ven todo" por "solo mis programas".
drop policy if exists "programas_authenticated_read_all" on public.programs;

create policy "programs_read_member"
  on public.programs
  for select
  to authenticated
  using (public.is_member(id));
