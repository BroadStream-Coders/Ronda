# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-018] Deletreo — primer colector + catálogo
- **Objetivo:** estrenar el catálogo con Deletreo como primer tipo. Crea
  `src/collector/catalog/` — `registry.ts` (id → { meta, Editor }) y
  `assignments.ts` (programSlug → [collectorId], en código) — y una ruta delgada
  `/programs/[slug]/collectors/[collectorId]` que valida membresía + asignación y
  renderiza el Editor del registry. Deletreo edita rondas de palabras con el kit
  Lego y usa el topbar (RM-020) para guardar/cargar json local; las sesiones en
  nube quedan para RM-009. Depende de RM-016, RM-017, RM-020.
- **Hecho cuando:** desde un programa con Deletreo asignado se entra a
  `/programs/[slug]/collectors/deletreo`, se editan rondas, se exporta/carga json;
  un programa sin ese colector (o un no-miembro) no puede entrar.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-009] Modelo de juego/sesión
- **Objetivo:** modelar `games` y `sessions` con `program_id` + RLS, el dominio real de los juegos, heredando el aislamiento por programa. Depende de RM-005.
- **Hecho cuando:** tablas creadas con RLS que respeta el aislamiento por programa (verificado).
- **Fecha:** 2026-08-06 · **Estado:** Abierto

## [RM-015] Pantalla de colectores del programa
- **Objetivo:** dentro del espacio de un programa (`/programs/[slug]`), la
  pantalla que lista sus colectores y da entrada a cada uno. Un programa **puede**
  tener colectores: cero es un caso normal y necesita su estado vacío, no un
  error. Cada colector es distinto y propio de su programa — no son filas de una
  misma plantilla, sino herramientas hechas a medida (Deletreo es la primera,
  RM-018), así que la pantalla lista lo que ese programa tiene y nada más.
  Es la entrada donde aterrizan los colectores; hoy su lugar es la tarjeta
  placeholder "Juegos" del dashboard del programa.
- **Decisión pendiente al empezar:** de dónde sale qué colectores tiene cada
  programa. Registro en código (mapa programa → colectores, ya que cada colector
  es código a medida y no existe sin él) o tabla en base con asignación desde el
  admin. Lo primero es más barato y alcanza mientras los colectores se escriban
  a mano; lo segundo recién se justifica si se asignan sin tocar código.
- **Hecho cuando:** un programa con colectores los lista y se puede entrar a uno;
  un programa sin colectores muestra el estado vacío. El aislamiento por programa
  se respeta: nadie ve los colectores de un programa donde no es miembro.
- **Fecha:** 2026-08-10 · **Estado:** Abierto
