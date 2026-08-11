# Changelog

Registro permanente de todo el trabajo terminado. Indexado por código de tarea
(`TD-`, `RM-`, `WL-`). Orden inverso: lo más nuevo arriba.

**Formato de cada entrada:**

```
## [CÓDIGO] Título (YYYY-MM-DD HH:MM)
Resumen en ≤2 líneas de lo que se hizo.
```

---

## [TD-004] Los CTA "Empezar" del home no hacen nada (2026-08-11 15:46)
Resuelto dentro de RM-035: la landing nueva no tiene botones muertos — "Pedir una reunión" y "Solicitar reunión" anclan a `#contacto`, "Ver qué hacemos" a `#servicios`, y el bloque de contacto resuelve según sesión (formulario, "Ir al panel" o login con Google).

## [RM-035] Identidad visual + landing rediseñada (2026-08-11 15:46)
Nueva paleta (primary verde petróleo, accent terracota, neutrales cálidos) en `globals.css` para `:root` y `.dark`, tipografías Newsreader + Libre Franklin, logo propio (`ronda-logo.tsx` + `app/icon.svg`) y landing reescrita desde el diseño de Claude Design (hero, clientes, servicios, cómo funciona, nosotros, contacto). Se agregó `next-themes` con toggle claro/oscuro (default claro, sin `enableSystem`).

## [RM-023] Colector Al Vuelo — sí/no (2026-08-11 10:11)
Portado a `catalog/si-o-no/` (Editor/Column/Row/schema): grupos con título + filas (pregunta en textarea + botones Sí/No), llenado rápido, export a `true/false/null`. Agregado el componente `textarea` de shadcn. Nombre visible "Al Vuelo" (id interno `si-o-no`), ícono ⚡ y descripciones por colector en la lista.

## [RM-022] Colector Cálculo Mental (2026-08-11 10:02)
Portado a `catalog/calculo-mental/` (Editor/Column/Board/Slot/schema): grupos → tableros → 4 casillas Q/A, capacidad, llenado rápido por pares de filas, guardar/cargar json. Registrado y asignado a que-gane-el-mejor. De paso: la tarjeta del dashboard pasa a "Colector" y "Sesiones en vivo" a "Juegos (Pronto)".

## [RM-015] Pantalla de colectores del programa (2026-08-10 22:51)
`catalog/assignments.ts` (programSlug → [collectorId], en código; Deletreo → que-gane-el-mejor) + rutas `/programs/[slug]/collectors` (lista con estado vacío) y `/collectors/[collectorId]` (Editor + topbar con Volver). Aislamiento por RLS del programa + assignments; la tarjeta "Juegos" del dashboard ya linkea; `/testing` eliminado.

## [RM-018] Deletreo — primer colector + catálogo (2026-08-10 22:37)
Catálogo en `src/collector/catalog/`: `registry.ts` (id → { meta, Editor }) y `deletreo/` (Editor con el kit Lego + topbar json + schema/type-guard), con archivos internos genéricos (Editor/Column/Row/schema). `/testing` solo lo renderiza desde el registry. `assignments.ts` + ruta real del programa quedan para RM-015.

## [RM-020] Topbar del colector (handshake) (2026-08-10 22:02)
Store `use-workspace-header` (zustand) + `CollectorTopbar` con botones Cargar/Guardar en `src/collector/topbar/`. Versión lean del topbar de Studio (sin dropdowns de nube ni validación). Demostrado en `/testing`.

## [RM-019] Sistema de pestañas (LevelTabs) (2026-08-10 22:02)
`LevelTabs` portado a `src/collector/level-tabs.tsx` (todos los niveles montados, pestañas verticales a la derecha). Demostrado en `/testing` con 2 niveles, cada uno con su grilla Lego.

## [RM-017] Sistema Lego (columnas/filas) (2026-08-10 22:02)
Kit Lego portado de Studio y empaquetado en `src/collector/lego/` (layout + components + hook `use-workspace-groups` + `data-processing` + barrel). Adaptado a base-nova (brand→primary, scroll-area de base-nova). Demostrado en `/testing`.

## [RM-016] Guardado local de archivo (json/zip) (2026-08-10 17:45)
Helpers `saveAsJson` / `loadJsonFile` (validador opcional) y `saveAsZip` (JSZip) en `src/helpers/persistence.ts`, portados de Studio. Página scratch `/testing` (textarea → json / zip) confirma el guardado a mano. `loadZipFile` se difiere hasta el primer colector con imágenes.

## [RM-007] Usuario sin programa: encerrado en el home + consulta (2026-08-10 17:15)
Sin membresía, el usuario solo puede estar en `/`: guard en el proxy (chequeo optimista) más `redirect` en `/programs`, que es el autoritativo según los docs de Next 16. En el home, botón "Ir al panel" o "Consultar" según el caso; el formulario guarda en `inquiries` (RLS: inserta solo el propio, lee solo el admin) y se ve en `/admin` → Mensajes con badge de no leídas. Migración `0010`.

## [RM-014] Eliminar usuarios desde el admin (borrado limpio) (2026-08-10 13:59)
Botón "Eliminar" por usuario en `/admin/users` vía `admin_delete_user()` (SECURITY DEFINER, solo admin): borra de `auth.users` (memberships y platform_admins cascadean), limpia sus invitations por email, e impide el auto-borrado (guard en función + badge "Tú" en la UI). Migración `0009`.

## [RM-006] Invitaciones por email (2026-08-10 13:36)
Apartado "Invitaciones" en `/admin`: pre-asignar acceso por email (sin correo real). `invite_to_program()` deduplica (ya-miembro / registrado→inmediato / ya-pendiente / nuevo→pendiente); `claim_pending_invitations()` en el login convierte pendientes en membresías y las marca `claimed_at` (quedan como historial "tomada"). Migración `0008`.

## [TD-003] Cerrar sesión regresa al home (2026-08-10 12:09)
`signOut()` ahora navega a `/` (`window.location.href`), recargando fresco sin sesión y limpiando el estado/cache del cliente.

## [TD-002] Protección de `/admin` en el middleware (2026-08-10 12:07)
Guard de `/admin/*` en el middleware: sin sesión → `/`, con sesión pero no admin → `/programs`. Corre antes del render e intercepta navegaciones de cliente, cerrando el hueco del router cache; el guard del layout queda como segunda barrera.

## [RM-013] Dashboard admin: gestión de usuarios (2026-08-10 12:01)
Apartado "Usuarios" en `/admin`: lista de personas registradas (función `admin_list_users()` SECURITY DEFINER que lee `auth.users`, solo admins) y asignar/quitar acceso a programas por usuario. Migración `0007` agrega la función y policies admin en `memberships`.

## [RM-012] Dashboard admin: gestión de programas (2026-08-10 11:38)
CRUD de programas en `/admin`: listar, crear (nombre → slug automático), editar (`/admin/programs/[id]`) y eliminar (con confirmación), vía server actions y RLS solo-admin. Migración `0006` agrega policies UPDATE/DELETE.

## [RM-008] Dashboard del admin: shell + ruteo (2026-08-10 11:27)
Ruta `/admin` protegida por `is_platform_admin()`, con barra lateral (slots placeholder Programas / Usuarios / Invitaciones) y guard en el layout. Al iniciar sesión, el admin cae en `/admin`; el resto en `/programs`. Sin features aún (van en RM-012/013/006).

## [RM-011] Rol de plataforma (super admin), a nivel de datos (2026-08-10 11:09)
Tabla `platform_admins` + helper `is_platform_admin()` (SECURITY DEFINER); bypass en RLS de `programs` (admin ve todo) y policy de INSERT solo-admin. Se marca admin insertando el `user_id` (soporta varios).

## [RM-005] Acceso por membresía (memberships + RLS) (2026-08-10 10:57)
Tabla `memberships(user_id, program_id)` + RLS default-deny: cada usuario ve solo los programas donde tiene fila; otorgar acceso = editar filas en el Table Editor (sin SQL). Helper `is_member()` anti-recursión.
De paso: `programas` → `programs` y todo lo interno a inglés (regla de idioma en CLAUDE.md); ruta `/programs`.

## [RM-010] Programas + selección post-login (2026-08-10 10:20)
Tabla `programas` (RLS: autenticados ven todo, por ahora) tras la capa `src/data/`; migraciones versionadas en `apps/web/supabase/migrations/`.
Post-login lleva a `/programas` (lista) → `/programas/[slug]` (dashboard shell), con header de marca compartido. Aislamiento por membresía queda para RM-005.

## [RM-004] Integración con Google (login) (2026-08-10 09:20)
Login con Google vía Supabase Auth (`@supabase/ssr`): botón en el header que dispara OAuth y vuelve al home ya con sesión; callback que canjea el code, middleware que refresca la sesión y logout.
Con sesión, el header muestra el avatar de Google en un desplegable (nombre, email y "Salir").

## [RM-003] Conectar Supabase (2026-08-06 19:52)
Cliente `@supabase/ssr` de servidor tras la capa aislada `src/data/`, configurado por variables de entorno.
Endpoint `GET /api/health` verifica la conexión (`ping()`); round-trip real confirmado.

## [RM-002] Landing page informativa (2026-08-06 19:24)
Landing pública en la raíz con acento naranja de marca: hero, qué es / qué brindamos, cómo funciona, CTA y footer.
Incluye sección "Ya salieron al aire con Ronda" con 3 clientes (TV Perú) enlazando a sus páginas oficiales.

## [RM-001] Sistema de componentes UI (shadcn/ui) (2026-08-06 09:38)
shadcn/ui integrado en `apps/web` (tema base-nova): componentes button, card, badge, input, label.
Home reemplazado por un demo que los usa; build limpio.
