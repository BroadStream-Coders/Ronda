-- RM-010: normalizar el nombre a plural (estándar SQL; `user` es reservado, por eso plural).
-- `tenant` -> `programas`, y fijar los nombres finales de los 2 programas.

alter table public.tenant rename to programas;

alter policy "tenant_authenticated_read_all"
  on public.programas
  rename to "programas_authenticated_read_all";

update public.programas
  set name = 'Que gane el mejor', slug = 'que-gane-el-mejor'
  where slug = 'demo';

update public.programas
  set name = 'Más Conectados', slug = 'mas-conectados'
  where slug = 'segundo';
