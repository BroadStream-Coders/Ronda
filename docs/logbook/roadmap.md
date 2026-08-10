# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-007] Ruteo post-login por membresía
- **Objetivo:** al entrar, rutear según membresía: 0 programas → pantalla "tu cuenta aún no tiene programas asignados" con acción de agendar reunión (mailto o form simple); 1+ → dashboard con selección de programa; al elegir uno, entra a su espacio. Depende de RM-004 y RM-005.
- **Hecho cuando:** los tres casos (0 / 1 / varios programas) funcionan y el selector de programa opera.
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-009] Modelo de juego/sesión
- **Objetivo:** modelar `games` y `sessions` con `program_id` + RLS, el dominio real de los juegos, heredando el aislamiento por programa. Depende de RM-005.
- **Hecho cuando:** tablas creadas con RLS que respeta el aislamiento por programa (verificado).
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-014] Eliminar usuarios desde el admin (borrado limpio)
- **Objetivo:** en `/admin/users`, poder eliminar un usuario por completo; sus accesos se borran de forma limpia. `auth.users` no es borrable desde el cliente, así que una función `SECURITY DEFINER` `admin_delete_user(user_id)` (gated por `is_platform_admin()`) borra el usuario; sus `memberships` y su fila en `platform_admins` se van solas por el `on delete cascade` hacia `auth.users`. Considerar además limpiar sus `invitations` (van por email, no por FK) e **impedir que un admin se borre a sí mismo**. Depende de RM-013.
- **Hecho cuando:** el admin borra un usuario desde la UI (con confirmación) y desaparece junto con todos sus accesos; no puede borrarse a sí mismo.
- **Fecha:** 2026-08-10 · **Estado:** Abierto
