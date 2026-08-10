# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-005] Modelo de acceso: tenant + membership + RLS
- **Objetivo:** tablas `tenant` y `membership(user_id, tenant_id, role)` con RLS *default-deny*: un usuario solo ve los programas donde tiene membresía; solo el admin de plataforma crea programas. Incluye el helper `is_platform_admin()` y su bypass en las políticas (se escriben una sola vez, por eso va aquí). Depende de RM-003.
- **Hecho cuando:** tablas + RLS activas y verificadas: usuario sin membresía no ve nada; con membresía ve solo su(s) programa(s); un no-admin no puede crear programas; el admin ve todo.
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-006] Invitaciones por email
- **Objetivo:** asignar acceso a un programa por email *antes* de que la persona se registre; en su primer login con Google, la invitación pendiente se convierte en membresía. Depende de RM-005.
- **Hecho cuando:** se puede crear una invitación (email + programa + rol) y, tras el primer login de ese email, queda con la membresía correspondiente.
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-007] Ruteo post-login por membresía
- **Objetivo:** al entrar, rutear según membresía: 0 programas → pantalla "tu cuenta aún no tiene programas asignados" con acción de agendar reunión (mailto o form simple); 1+ → dashboard con selección de programa; al elegir uno, entra a su espacio. Depende de RM-004 y RM-005.
- **Hecho cuando:** los tres casos (0 / 1 / varios programas) funcionan y el selector de programa opera.
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-008] Consola maestra (admin)
- **Objetivo:** herramienta del usuario maestro para crear programas, asignar/quitar miembros y navegar todos los programas (cross-tenant). Depende de RM-005 (y RM-006 para invitar por email).
- **Hecho cuando:** el admin puede crear un programa, asignar/retirar un usuario y abrir cualquier programa existente.
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-009] Modelo de juego/sesión
- **Objetivo:** modelar `juego` y `sesion` con `tenant_id` + RLS, el dominio real de los juegos, heredando el aislamiento por programa. Depende de RM-005.
- **Hecho cuando:** tablas creadas con RLS que respeta el aislamiento por programa (verificado).
- **Fecha:** 2026-08-06 · **Estado:** Abierto
