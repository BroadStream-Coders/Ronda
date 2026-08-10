# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-006] Invitaciones por email
- **Objetivo:** asignar acceso a un programa por email *antes* de que la persona se registre; en su primer login con Google, la invitación pendiente se convierte en membresía. Depende de RM-005.
- **Hecho cuando:** se puede crear una invitación (email + programa + rol) y, tras el primer login de ese email, queda con la membresía correspondiente.
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-007] Ruteo post-login por membresía
- **Objetivo:** al entrar, rutear según membresía: 0 programas → pantalla "tu cuenta aún no tiene programas asignados" con acción de agendar reunión (mailto o form simple); 1+ → dashboard con selección de programa; al elegir uno, entra a su espacio. Depende de RM-004 y RM-005.
- **Hecho cuando:** los tres casos (0 / 1 / varios programas) funcionan y el selector de programa opera.
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-008] Consola maestra (admin)
- **Objetivo:** herramienta del usuario maestro para crear programas, asignar/quitar miembros y navegar todos los programas (cross-tenant). Depende de RM-011 (bypass de admin a nivel de datos) y RM-006 (para invitar por email).
- **Hecho cuando:** el admin puede crear un programa, asignar/retirar un usuario y abrir cualquier programa existente.
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-009] Modelo de juego/sesión
- **Objetivo:** modelar `games` y `sessions` con `program_id` + RLS, el dominio real de los juegos, heredando el aislamiento por programa. Depende de RM-005.
- **Hecho cuando:** tablas creadas con RLS que respeta el aislamiento por programa (verificado).
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-011] Rol de plataforma (super admin), a nivel de datos
- **Objetivo:** helper `is_platform_admin()` (marcado vía tabla `platform_admins`) y su bypass en las políticas RLS de `programs`/`memberships` (el admin ve todo, cross-tenant), más la restricción de que solo el admin crea programas. Es la base de datos sobre la que RM-008 monta la UI. Depende de RM-005.
- **Hecho cuando:** un admin ve todos los programas sin membresía explícita; un no-admin no puede crear programas; verificado.
- **Fecha:** 2026-08-10 · **Estado:** Abierto
