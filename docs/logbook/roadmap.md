# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-004] Login con Google
- **Objetivo:** autenticación con cuenta de Google vía Supabase Auth; al entrar, el usuario ve su espacio de trabajo (su tenant). Depende de RM-003.
- **Hecho cuando:** flujo de login con Google funcionando y sesión persistida; usuario autenticado redirigido a su workspace.
- **Fecha:** 2026-08-05 · **Estado:** Abierto

## [RM-005] Schema multi-tenant en Supabase
- **Objetivo:** modelar y crear las tablas `tenant`, `membership`, `juego`, `sesion` con `tenant_id` + políticas RLS que aíslen cada programa. Base del "cada quien su espacio". Depende de RM-003.
- **Hecho cuando:** tablas creadas con RLS activo y verificado (un usuario de un tenant no puede leer filas de otro).
- **Fecha:** 2026-08-05 · **Estado:** Abierto
