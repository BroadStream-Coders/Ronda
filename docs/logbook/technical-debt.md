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

## [TD-001] Logos de clientes servidos sin optimizar (`unoptimized`)
- **Ubicación:** `apps/web/src/app/page.tsx` (los `<Image>` de la sección "Clientes al aire")
- **Riesgo:** 2/10
- **Problema:** Los 3 logos de clientes usan la prop `unoptimized`, saltándose el optimizador de `next/image`. Se puso así porque en dev, al reemplazar un archivo dejando el mismo nombre/ruta, el optimizador seguía sirviendo la versión vieja cacheada (`.next/dev/cache/images`, indexada por URL, no por contenido) y ni el hard-refresh lo corregía. Con `unoptimized` la imagen se sirve tal cual desde `/public` y el reemplazo se ve al instante.
- **Impacto futuro:** Sin optimizar no hay conversión a webp ni resize; con logos actuales (~50KB) es imperceptible, pero con imágenes finales/más pesadas suma peso innecesario en producción.
- **A corregir cuando:** se desplieguen las imágenes finales — quitar `unoptimized` y dejar que `next/image` las optimice. La caché rancia solo afecta a dev; cada `pnpm build` regenera desde cero.
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [TD-009] El resto de la app nunca se revisó en modo oscuro
- **Ubicación:** `apps/web/src/app/layout.tsx` (`ThemeProvider`) + páginas de `/admin` y `/programs`
- **Riesgo:** 3/10
- **Problema:** Con RM-035 entró `next-themes` y un toggle claro/oscuro en la landing. El `.dark` se aplica a `<html>`, así que admin, dashboard y colectores también cambian de tema, pero se diseñaron solo en claro y nunca se miraron en oscuro. Por eso quedó `defaultTheme="light"` con `enableSystem={false}`: nadie cae en oscuro sin pedirlo.
- **Impacto futuro:** Si alguien activa el toggle y navega al panel puede encontrar contrastes rotos o superficies planas. Al activar `enableSystem` sin revisar, le pasaría a todos los usuarios con el SO en oscuro.
- **A corregir cuando:** se revisen admin/programs/colectores en oscuro; recién ahí considerar `enableSystem`.
- **Fecha:** 2026-08-11 · **Estado:** Abierto

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

## [TD-006] Los colectores de un programa se asignan por `slug` (mutable)
- **Ubicación:** `apps/web/src/collector/catalog/assignments.ts:1` (y sus dos consumidores: `app/programs/[slug]/collectors/page.tsx:33` y `.../[collectorId]/page.tsx:25`)
- **Riesgo:** 5/10
- **Problema:** El mapa programa→colectores está keyed por `slug`, pero el slug se recalcula desde el nombre en cada edición (`updateProgram` en `data/programs.ts:70`). Si un admin renombra un programa desde `/admin/programs/[id]`, el slug cambia y la entrada de `assignments` deja de matchear: los colectores desaparecen de la lista y la ruta directa al colector devuelve 404, sin error ni aviso. El identificador estable es `program.id` (uuid), que ya está disponible en ambas páginas vía `getProgramBySlug`.
- **Impacto futuro:** Pérdida silenciosa de acceso a los juegos de un cliente por una acción legítima del admin, y solo se recupera tocando código y redesplegando. Empeora conforme haya más programas y colectores.
- **Fecha:** 2026-08-11 · **Estado:** Abierto

## [TD-005] Guard de membresía usa la lista de programas como proxy
- **Ubicación:** `apps/web/src/data/supabase/middleware.ts` (bloque que redirige a `/` al usuario sin programa)
- **Riesgo:** 2/10
- **Problema:** El guard decide "tiene programa" consultando `programs` con RLS (reusa el aislamiento existente en vez de un RPC nuevo). Como el admin bypassea RLS y ve todos los programas, pasa el guard sin lógica extra — salvo si la base no tiene ningún programa: ahí el admin que visite `/programs` es devuelto al home. `/admin` no se ve afectado porque retorna antes.
- **Impacto futuro:** Solo molesta en una base recién instalada y el admin siempre tiene `/admin` a mano. Si el caso llega a estorbar, la salida es chequear `is_platform_admin()` en el guard, a costa de un RPC por request.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

