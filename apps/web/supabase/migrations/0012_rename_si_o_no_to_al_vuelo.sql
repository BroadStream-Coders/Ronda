-- TD-108: el colector "Al Vuelo" arrastraba su slug viejo, `si-o-no`.
--
-- El slug es parte de la ruta del bucket
-- (collector-data/<program_id>/<collector_id>/…), así que renombrarlo en código
-- deja huérfano lo ya subido: el host y el juego siguen buscando en la carpeta
-- vieja y no encuentran nada. Esto mueve los objetos.
--
-- Las policies de 0011 no se tocan: miran solo la PRIMERA carpeta de la ruta
-- (el uuid del programa), no el colector.
--
-- Es idempotente: al correr de nuevo ya no queda ningún `/si-o-no/`.

do $$
declare
  tokens_generated text;
begin
  select is_generated
    into tokens_generated
    from information_schema.columns
   where table_schema = 'storage'
     and table_name = 'objects'
     and column_name = 'path_tokens';

  update storage.objects
     set name = replace(name, '/si-o-no/', '/al-vuelo/')
   where bucket_id = 'collector-data'
     and name like '%/si-o-no/%';

  -- path_tokens suele ser columna generada a partir de `name`, y entonces se
  -- actualiza sola; si en esta instancia no lo es, hay que rehacerla a mano o
  -- las rutas quedan a medio renombrar.
  if tokens_generated = 'NEVER' then
    update storage.objects
       set path_tokens = string_to_array(name, '/')
     where bucket_id = 'collector-data'
       and name like '%/al-vuelo/%';
  end if;
end $$;
