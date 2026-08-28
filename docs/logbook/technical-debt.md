# Technical Debt

Cosas que están **mal ahora** en el código existente. Código `TD-###` (nunca se
reutiliza). Al resolverse se mueve al `changelog.md` conservando su código.

**Formato de cada entrada:**

```markdown
## [TD-###] Título corto
- **Ubicación:** `ruta/al/archivo.ext:línea`
- **Riesgo:** N/10  (1-3 cosmético · 4-6 ralentiza/moderado · 7-9 bug latente o seguridad · 10 crítico)
- **Problema:** qué está mal, sintetizado.
- **Impacto futuro:** qué puede causar si no se atiende.
- **Fecha:** YYYY-MM-DD · **Estado:** Abierto
```

---

## [TD-110] El formateo de fecha va copiado en cuatro archivos
- **Ubicación:** `apps/web/src/game/kit/GameTopbar.tsx:41`, `apps/web/src/app/admin/inquiries/page.tsx:7`, `apps/web/src/app/admin/invitations/page.tsx:9`, `apps/web/src/app/admin/users/page.tsx:13`
- **Riesgo:** 2/10
- **Problema:** La misma función `formatDate` con `toLocaleString("es-PE", …)` está copiada cuatro veces. Ya eran tres en el admin; [[RM-062]] agregó la cuarta en el topbar del juego en vez de crear un helper, porque unificar significaba tocar tres archivos que no eran parte de la tarea.
- **Impacto futuro:** Cambiar cómo se lee una fecha (o la zona horaria, que hoy es la del navegador y en cabina puede no ser la de emisión) obliga a acordarse de cuatro lugares. Es cosmético hasta que dos pantallas muestran la misma fecha distinta.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [TD-086] La imagen que recorta el colector sale sin tope de tamaño ni de calidad
- **Ubicación:** `apps/web/src/collector/kit/images/crop-image.ts:56`
- **Riesgo:** 6/10
- **Problema:** `canvas.toBlob(cb, fileType)` va **sin el tercer argumento de calidad**
  (queda en el default del navegador, 0.92 en Chrome) y el lienzo se dimensiona con
  `canvas.width = pixelCrop.width`, o sea **los pixeles del recorte en el original**.
  Si el operador sube una foto de celular de 6000×4000 y recorta una zona grande, sale
  un JPEG de varios miles de pixeles de ancho para algo que en el Stage se dibuja a
  unos cientos.
- **Impacto futuro:** ese archivo va a Supabase Storage y lo **descarga el juego en
  vivo**. Es el único punto de todo el pipeline donde el peso de una imagen no lo
  controlamos nosotros sino quien sube la foto. Con los juegos de foto portados
  (`galeria-fotos`, `album`) esto pasa de latente a real. El arreglo son dos cosas:
  pasar calidad explícita a `toBlob` y limitar el lado mayor a lo que el Stage
  realmente dibuja.
- **Ojo:** esto **no** aplica a los assets de juego que viven en `public/` — esos son
  fijos, los controla el diseñador y hoy pesan 409 KB entre todos.
- **Fecha:** 2026-08-24 · **Estado:** Abierto

---

## [TD-084] El README describe una plataforma de un solo servicio
- **Ubicación:** `README.md:24-44`
- **Riesgo:** 3/10
- **Problema:** la sección "Servicios" solo documenta el Colector y dice que su
  guardado es un archivo local, con la nube "evaluada, no comprometida"; el guardado
  en storage ya corre (RM-040), el servicio de Juegos existe y no aparece, y "apoyo a
  conductores" sigue listado como "más adelante, no comprometido" cuando ya está en
  pie ([[RM-041]]). Tampoco menciona que qué servicios ve cada programa se declara en
  `src/data/program-services.ts` ([[RM-055]]).
- **Impacto futuro:** es la puerta de entrada del repo y hoy describe un producto más
  chico del que hay; quien llegue nuevo va a buscar en el lugar equivocado, y el
  criterio de que un programa no se entera de los servicios que no tiene no está
  escrito en ningún lado que se lea antes del código.
- **Fecha:** 2026-08-23 · **Estado:** Abierto

---

## [TD-022] El juego no avisa nada mientras carga su chunk
- **Ubicación:** `apps/web/src/game/catalog/GameMount.tsx`
- **Riesgo:** 3/10
- **Problema:** Al cerrar [[TD-021]] el juego pasó a cargarse con `import()` dinámico. Mientras baja el chunk, `GameMount` devuelve `null`: pantalla en blanco, sin esqueleto, sin spinner y sin mensaje de error si el `import()` rechaza — la promesa se descarta en silencio.
- **Impacto futuro:** Hoy es un parpadeo en la pantalla de control, previa al aire, con un solo juego liviano. Con los 10 juegos de [[RM-038]] los chunks pesan más (el `layout.json` de Busca Logo solo son 100 KB) y en la conexión del estudio el blanco dura lo suficiente para que el operador dude si hizo clic. Peor si falla la descarga: se queda en blanco para siempre, sin nada que diagnosticar.
- **Cómo cerrarlo:** un esqueleto o spinner mientras carga, y un `catch` que muestre un error accionable con opción de reintentar.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [TD-001] Logos de clientes servidos sin optimizar (`unoptimized`)
- **Ubicación:** `apps/web/src/app/page.tsx` (los `<Image>` de la sección "Clientes al aire")
- **Riesgo:** 2/10
- **Problema:** Los 3 logos de clientes usan la prop `unoptimized`, saltándose el optimizador de `next/image`. Se puso así porque en dev, al reemplazar un archivo dejando el mismo nombre/ruta, el optimizador seguía sirviendo la versión vieja cacheada (`.next/dev/cache/images`, indexada por URL, no por contenido) y ni el hard-refresh lo corregía. Con `unoptimized` la imagen se sirve tal cual desde `/public` y el reemplazo se ve al instante.
- **Impacto futuro:** Sin optimizar no hay conversión a webp ni resize; con logos actuales (~50KB) es imperceptible, pero con imágenes finales/más pesadas suma peso innecesario en producción.
- **A corregir cuando:** se desplieguen las imágenes finales — quitar `unoptimized` y dejar que `next/image` las optimice. La caché rancia solo afecta a dev; cada `pnpm build` regenera desde cero.
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [TD-010] El formulario de contacto pide menos datos que el diseño
- **Ubicación:** `apps/web/src/components/inquiry-form.tsx` + `apps/web/src/app/actions.ts:11-12` + tabla `inquiries`
- **Riesgo:** 2/10
- **Problema:** El diseño de la landing plantea nombre, programa, correo, asunto y mensaje. La implementación mantiene solo asunto + mensaje: nombre y correo salen de la sesión de Google, y **programa** simplemente no se pide ni se guarda, porque agregarlo exige migración de la tabla y cambiar la server action.
- **Impacto futuro:** Cada consulta llega sin el dato más útil para calificarla (qué programa produce quien escribe); hay que preguntarlo por correo en un ida y vuelta extra.
- **Fecha:** 2026-08-11 · **Estado:** Abierto

## [TD-008] La landing pública se cae si Supabase no responde
- **Ubicación:** `apps/web/middleware.ts:10` (el `matcher`) + `apps/web/src/data/supabase/middleware.ts:7-28`
- **Riesgo:** 6/10
- **Problema:** El matcher cubre **toda** ruta, y `updateSession()` crea el cliente de Supabase y llama `getClaims()` **antes** de mirar el pathname. En `/` eso es trabajo casi puro: el bloque de guard de la línea 48 saltea explícitamente la raíz, así que el único efecto útil en la landing es refrescar la cookie de sesión — cuyo beneficio visible es que el header muestre el avatar del usuario logueado. La landing paga una dependencia dura de Supabase por un detalle cosmético. El matcher tampoco excluye `/api`, así que `/api/health` —el endpoint hecho justo para diagnosticar el estado de Supabase (RM-003)— muere por la misma causa que debería reportar.
- **Impacto futuro:** La cara pública del producto se cae por algo que no la involucra. Los disparadores son rutinarios, no exóticos: el plan gratuito de Supabase pausa el proyecto por inactividad, se excede la cuota, o hay un incidente del proveedor. Un visitante —justo el público de la landing, que ni cuenta tiene— se encuentra un 500 y se va. Ya pasó en el primer deploy (2026-08-11): sin las variables de entorno en Vercel, se cayó el sitio entero, health incluido. El riesgo sube a 8 cuando la landing reciba tráfico real.
- **Arreglo propuesto:** `try/catch` alrededor del trabajo de auth en `updateSession`, dejando pasar las rutas públicas y manteniendo `/admin` *fail-closed* (redirect a `/`, con el guard de layout de TD-002 como segunda barrera); y excluir `/api` del matcher. No enmascara la mala configuración: sigue rompiendo fuerte donde importa, solo evita que una caída de Supabase se lleve puesto lo que no lo necesita.
- **Fecha:** 2026-08-11 · **Estado:** Abierto

## [TD-007] `middleware.ts` usa el nombre que Next 16 dejó deprecado
- **Ubicación:** `apps/web/middleware.ts:5` (el archivo y el export `middleware`)
- **Riesgo:** 3/10
- **Problema:** Next 16 renombró `middleware` → `proxy` (archivo y función) y dejó el nombre viejo como deprecado. El proyecto sigue en `middleware.ts` exportando `middleware`. Funciona hoy; la única razón válida para quedarse es usar el runtime `edge`, que acá no se usa. La migración es renombrar el archivo a `proxy.ts` y la función a `proxy`.
- **Impacto futuro:** Ahí viven el refresco de sesión de Supabase y el guard de `/admin` (TD-002). Cuando Next remueva el nombre deprecado, el archivo simplemente deja de correr: no hay error de build, la app arranca y la protección se degrada a los guards de layout/página. Falla en silencio, que es la peor forma. Además el changelog (RM-007) ya lo llama "el proxy", así que el nombre real y el documentado no coinciden.
- **Fecha:** 2026-08-11 · **Estado:** Abierto

## [TD-015] El platform admin no tiene bypass en el storage del colector
- **Ubicación:** `apps/web/supabase/migrations/0011_collector_storage.sql` (las cuatro policies) + `apps/web/src/app/programs/[slug]/collectors/[collectorId]/page.tsx`
- **Riesgo:** 7/10 (subido desde 5/10 el 2026-08-28)
- **Problema:** El admin de plataforma **ve** todos los programas (bypass de RLS en `programs`, RM-011) y puede entrar a cualquier colector, porque la pantalla no exige membresía: le alcanza con poder leer el programa. Pero las policies del storage preguntan `is_member()`, que para un admin sin fila en `memberships` es `false`. Resultado: entra, llena el colector, y recién al subir se topa con `new row violates row-level security policy` — el error crudo de Postgres, sin traducir. Salió a la luz al estrenar RM-040; se destrabó agregando la membresía a mano, que es justo lo que el admin no debería tener que hacer.
- **Hoy está tapado, no resuelto:** el único admin de la plataforma se dio de alta como miembro de los programas, así que pasa las policies y nada falla en su pantalla. El hueco sigue entero para el segundo admin, y el parche a mano no escala.
- **Impacto futuro:** El admin no tiene el acceso irrestricto que se supone que tiene, y el desajuste es silencioso hasta que alguien pierde trabajo al guardar. Cada capa nueva con RLS por membresía (juegos, la vista de conductores) repite el mismo hueco si no se resuelve de raíz.
- **Empeora con la consulta de existencia ([[RM-062]]):** el desplegable de nube pasa a pintarse solo si el `list()` del bucket devuelve algo, y ese `list()` lo filtra la misma policy. Para un admin sin membresía deja de haber error: la pantalla le dice que no hay datos en la nube cuando sí los hay. El síntoma se degrada de "revienta y me entero" a "miente en silencio".
- **Cómo cerrarlo:** dos caminos coherentes, hay que elegir uno. (1) Dar el bypass al admin también en el storage: `or public.is_platform_admin()` en las cuatro policies — mantiene la promesa de "el admin ve y hace todo" y es una migración corta. (2) Que la pantalla del colector exija membresía y no lo deje entrar, en vez de dejarlo trabajar y fallar al final. Lo que no puede quedar es lo de hoy: entra pero no puede escribir. Ver también [[TD-005]], que es el otro lado de la misma inconsistencia.
- **Fecha:** 2026-08-16 · **Estado:** Abierto

## [TD-012] Alto fijo del recortador de imágenes
- **Ubicación:** `apps/web/src/collector/kit/images/ImageCropperDialog.tsx:70`
- **Riesgo:** 4/10
- **Problema:** El área de recorte es `h-[400px]` fija. Sumando el padding del diálogo, el título, el slider de zoom y los botones, el modal pasa del alto útil de una pantalla de 720p.
- **Impacto futuro:** En laptops de baja resolución el modal se sale de la pantalla y Cancelar/Confirmar quedan fuera de vista, bloqueando el recorte. Hoy lo usan Cronos e Intruso, y sumará De Par en Par si más adelante se le activa el recorte ([[RM-043]]).
- **Fecha:** 2026-08-13 · **Estado:** Abierto

## [TD-013] Anchos máximos fijos por cantidad de pares en De Par en Par
- **Ubicación:** `apps/web/src/collector/catalog/de-par-en-par/Tab2.tsx:106-118`
- **Riesgo:** 4/10
- **Problema:** El tablero elige `max-w-[1200px]`, `[950px]`, `[1100px]` o `[1400px]` según cuántos pares haya. Son medidas afinadas a ojo para 1080p, no derivadas del espacio disponible.
- **Impacto futuro:** En resoluciones distintas el tablero se desborda o deja las cartas demasiado chicas o grandes, y cada nuevo conteo de pares pide otro número mágico.
- **Fecha:** 2026-08-13 · **Estado:** Abierto

## [TD-014] Los colectores no tienen scroll vertical en pantallas bajas
- **Ubicación:** `apps/web/src/collector/kit/lego/layout/GroupsContainer.tsx:17` (y la ruta del colector, `apps/web/src/app/programs/[slug]/collectors/[collectorId]/page.tsx:32`)
- **Riesgo:** 5/10
- **Problema:** `GroupsContainer` es `h-full overflow-y-hidden`: da scroll horizontal entre columnas, pero ninguno vertical. La columna reparte su alto entre título, filas y pie, así que en una pantalla baja las filas se comprimen o se cortan sin válvula de escape. La ruta en sí está sana (`h-dvh` + `min-h-0 flex-1`, sin números mágicos), el problema es solo del contenedor.
- **Impacto futuro:** En laptops de 720p —caso real de producción— se pierden filas o el pie con el llenado rápido queda inaccesible. No falla, solo "se ve mal", que es lo que lo hace difícil de diagnosticar.
- **Fecha:** 2026-08-13 · **Estado:** Abierto

## [TD-005] Guard de membresía usa la lista de programas como proxy
- **Ubicación:** `apps/web/src/data/supabase/middleware.ts` (bloque que redirige a `/` al usuario sin programa)
- **Riesgo:** 2/10
- **Problema:** El guard decide "tiene programa" consultando `programs` con RLS (reusa el aislamiento existente en vez de un RPC nuevo). Como el admin bypassea RLS y ve todos los programas, pasa el guard sin lógica extra — salvo si la base no tiene ningún programa: ahí el admin que visite `/programs` es devuelto al home. `/admin` no se ve afectado porque retorna antes.
- **Impacto futuro:** Solo molesta en una base recién instalada y el admin siempre tiene `/admin` a mano. Si el caso llega a estorbar, la salida es chequear `is_platform_admin()` en el guard, a costa de un RPC por request.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

