-- RM-040 (parte 1): guardado en la nube del colector, solo formato json.
-- Un archivo por programa + colector, en un bucket privado:
--   collector-data/<program_id>/<collector_id>/session.json
--
-- No hay tabla: mientras sea un documento por colector y sin historial, no hay
-- nada que consultar, solo un archivo que se sobrescribe. La tabla entra cuando
-- haga falta preguntar algo sobre los datos (historial, publicados, búsqueda).
--
-- El aislamiento reusa is_member(): la primera carpeta de la ruta es el uuid del
-- programa. Va el uuid y no el slug porque el slug cambia (ver TD-006).

insert into storage.buckets (id, name, public)
values ('collector-data', 'collector-data', false)
on conflict (id) do nothing;

-- Devuelve false si la primera carpeta no es un uuid, para que una ruta rara no
-- reviente la policy con un error de casteo.
create or replace function public.is_collector_path_member(object_name text)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  folder text;
begin
  folder := (storage.foldername(object_name))[1];

  if folder is null or folder !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;

  return public.is_member(folder::uuid);
end;
$$;

create policy "collector_data_read"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'collector-data'
    and public.is_collector_path_member(name)
  );

create policy "collector_data_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'collector-data'
    and public.is_collector_path_member(name)
  );

create policy "collector_data_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'collector-data'
    and public.is_collector_path_member(name)
  )
  with check (
    bucket_id = 'collector-data'
    and public.is_collector_path_member(name)
  );

create policy "collector_data_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'collector-data'
    and public.is_collector_path_member(name)
  );
