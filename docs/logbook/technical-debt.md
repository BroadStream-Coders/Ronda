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

## [TD-012] `admin-placeholder.tsx` quedó sin usos
- **Ubicación:** `apps/web/src/components/admin-placeholder.tsx`
- **Riesgo:** 1/10
- **Problema:** El componente no se importa desde ningún lado; las páginas de admin ya tienen contenido real.
- **Impacto futuro:** Ruido: aparece en búsquedas y en cualquier refactor del panel como si fuera parte del diseño vigente.
- **Fecha:** 2026-08-17 · **Estado:** Abierto

## [TD-001] Logos de clientes servidos sin optimizar (`unoptimized`)
- **Ubicación:** `apps/web/src/app/page.tsx` (los `<Image>` de la sección "Clientes al aire")
- **Riesgo:** 2/10
- **Problema:** Los 3 logos de clientes usan la prop `unoptimized`, saltándose el optimizador de `next/image`. Se puso así porque en dev, al reemplazar un archivo dejando el mismo nombre/ruta, el optimizador seguía sirviendo la versión vieja cacheada (`.next/dev/cache/images`, indexada por URL, no por contenido) y ni el hard-refresh lo corregía. Con `unoptimized` la imagen se sirve tal cual desde `/public` y el reemplazo se ve al instante.
- **Impacto futuro:** Sin optimizar no hay conversión a webp ni resize; con logos actuales (~50KB) es imperceptible, pero con imágenes finales/más pesadas suma peso innecesario en producción.
- **A corregir cuando:** se desplieguen las imágenes finales — quitar `unoptimized` y dejar que `next/image` las optimice. La caché rancia solo afecta a dev; cada `pnpm build` regenera desde cero.
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [TD-014] El panel de admin nunca se revisó en modo oscuro
- **Ubicación:** `apps/web/src/app/admin/**`
- **Riesgo:** 3/10
- **Problema:** Con RM-037 el tema se elige desde la cuenta y `enableSystem` quedó activo, así que ahora sí es fácil terminar en oscuro. La landing y el espacio de trabajo se revisaron; las cinco pantallas de `/admin` se diseñaron solo en claro y nunca se miraron en oscuro. El sidebar de `admin/layout.tsx` además sigue con el ícono `Radio` viejo en vez del logo.
- **Impacto futuro:** Contrastes rotos o superficies planas en el panel, y una marca inconsistente con el resto de la app.
- **Fecha:** 2026-08-17 · **Estado:** Abierto

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
- **Riesgo:** 5/10
- **Problema:** El admin de plataforma **ve** todos los programas (bypass de RLS en `programs`, RM-011) y puede entrar a cualquier colector, porque la pantalla no exige membresía: le alcanza con poder leer el programa. Pero las policies del storage preguntan `is_member()`, que para un admin sin fila en `memberships` es `false`. Resultado: entra, llena el colector, y recién al subir se topa con `new row violates row-level security policy` — el error crudo de Postgres, sin traducir. Salió a la luz al estrenar RM-040; se destrabó agregando la membresía a mano, que es justo lo que el admin no debería tener que hacer.
- **Impacto futuro:** El admin no tiene el acceso irrestricto que se supone que tiene, y el desajuste es silencioso hasta que alguien pierde trabajo al guardar. Cada capa nueva con RLS por membresía (juegos, la vista de conductores) repite el mismo hueco si no se resuelve de raíz.
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

