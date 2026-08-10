-- RM-010: tabla `tenant` (programa). Aislamiento real por membresía llega en RM-005.
-- ponytail: RLS = "cualquier autenticado ve todo". El scoping por membresía es RM-005.

create table if not exists public.tenant (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.tenant enable row level security;

create policy "tenant_authenticated_read_all"
  on public.tenant
  for select
  to authenticated
  using (true);

-- Seed: agrega/edita programas a mano aquí (o por INSERT en el SQL editor).
insert into public.tenant (name, slug) values
  ('Programa Demo', 'demo'),
  ('Segundo Programa', 'segundo')
on conflict (slug) do nothing;
