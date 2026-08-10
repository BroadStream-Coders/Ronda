# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-016] Guardado local de archivo (json/zip)
- **Objetivo:** portar desde Studio los helpers de persistencia de archivo
  (`saveAsJson`/`loadJsonFile` con validador opcional, `saveAsZip`/`loadZipFile`),
  para descargar y volver a cargar la data de un colector como archivo. Base de
  Deletreo (usa json).
- **Hecho cuando:** los helpers existen en Ronda y hay un round-trip real:
  descargar un json y volver a cargarlo restaura la data.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-017] Sistema Lego (columnas/filas)
- **Objetivo:** portar el esqueleto de los colectores tipo lista: componentes
  `group-column/*`, el hook de estado `use-workspace-groups` y el pegado desde
  Excel (`parseExcelPaste`/`getColumnData`).
- **Hecho cuando:** se renderiza una grilla de grupos/filas editable (agregar/
  quitar grupos y filas) y el llenado rápido (pegar de Excel) funciona.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-018] Colector Deletreo
- **Objetivo:** primer colector en Ronda, dentro del espacio de un programa. Edita
  rondas de palabras con Lego (RM-017) y exporta/carga json con el guardado local
  (RM-016). Save/load inline, sin topbar compartido ni validación por ahora.
  Depende de RM-016 y RM-017.
- **Hecho cuando:** desde un programa se abre Deletreo, se editan rondas de
  palabras, se exporta a json y se recarga desde json.
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
