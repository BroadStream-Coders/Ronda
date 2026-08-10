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

## [RM-009] Modelo de juego/sesión
- **Objetivo:** modelar `games` y `sessions` con `program_id` + RLS, el dominio real de los juegos, heredando el aislamiento por programa. Depende de RM-005.
- **Hecho cuando:** tablas creadas con RLS que respeta el aislamiento por programa (verificado).
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-012] Dashboard admin: gestión de programas
- **Objetivo:** en el apartado "Programas" de `/admin`, crear un programa (nombre → slug), listarlos, editarlos (`/admin/programs/[id]`) y eliminarlos. Reemplaza el placeholder "Pronto" de RM-008. Depende de RM-008.
- **Hecho cuando:** el admin crea, edita y elimina un programa desde la UI y la lista se actualiza.
- **Fecha:** 2026-08-10 · **Estado:** En progreso (2026-08-10)

## [RM-013] Dashboard admin: gestión de usuarios
- **Objetivo:** en el apartado "Usuarios" de `/admin`, listar las personas registradas y ver/gestionar a qué programas tienen acceso. Reemplaza el placeholder "Pronto" de RM-008. Depende de RM-008.
- **Hecho cuando:** el admin ve la lista de usuarios y su acceso a programas desde la UI.
- **Fecha:** 2026-08-10 · **Estado:** Abierto
