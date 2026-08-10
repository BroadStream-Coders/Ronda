-- RM-007: consultas enviadas desde el home por usuarios sin programa.
-- Solo pueden escribir usuarios autenticados: el login de Google hace de captcha,
-- así que no hay endpoint anónimo ni correo del admin expuesto en el HTML.

-- El remitente se guarda desnormalizado (email/name) para que la consulta
-- sobreviva al borrado del usuario: el lead no se pierde.
create table if not exists public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete set null,
  email      text not null,
  name       text,
  subject    text not null,
  message    text not null,
  created_at timestamptz not null default now(),
  read_at    timestamptz
);

alter table public.inquiries enable row level security;

-- Cada quien inserta solo la suya (user_id null no pasa el check).
create policy "inquiries_insert_own"
  on public.inquiries
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Solo el admin lee, marca como leídas y elimina.
create policy "inquiries_read_admin"
  on public.inquiries
  for select
  to authenticated
  using (public.is_platform_admin());

create policy "inquiries_update_admin"
  on public.inquiries
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "inquiries_delete_admin"
  on public.inquiries
  for delete
  to authenticated
  using (public.is_platform_admin());
