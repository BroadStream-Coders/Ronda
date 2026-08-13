# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-037] Estructurar el sistema de juegos
- **Objetivo:** montar el apartado de **juegos** como servicio propio del programa,
  al lado del de colectores: dónde vive el código (`src/game/` con su kit y su
  catálogo), cómo se registra y se asigna cada juego a un programa, y cómo entra
  en la navegación del programa. Es la base sobre la que se traen los juegos uno a
  uno ([[RM-038]]); no incluye portar ninguno.
- **Hecho cuando:** existe la estructura (kit + catálogo + registro + asignación) y
  la ruta del programa lista los juegos asignados, aunque el catálogo esté vacío.
- **Fecha:** 2026-08-13 · **Estado:** Abierto

## [RM-038] Importar los juegos desde el proyecto Games
- **Objetivo:** traer a Ronda los juegos del proyecto **Games** (no Studio), uno por
  uno, sobre la estructura de RM-037 — el mismo método que se usó con los 13
  colectores. Primer paso: inventariar qué juegos existen en Games y con qué
  sistemas se arman, para partirlo en tareas por juego.
- **Hecho cuando:** existe el listado de juegos con su estado, y cada juego
  importado corre dentro de un programa y es asignable.
- **Fecha:** 2026-08-13 · **Estado:** Abierto

## [RM-039] Esquemas de datos centralizados (colector ↔ juego)
- **Objetivo:** que el contrato de datos de cada juego se defina **una sola vez** y
  lo compartan las dos puntas: el colector que lo produce y el juego que lo consume.
  Hoy cada contrato vive dentro de `collector/catalog/<slug>/schema.ts` y, cuando
  entren los juegos, se duplicaría del otro lado. Ya no hay Unity en el medio: las
  dos puntas son código de Ronda, así que el esquema puede ser una fuente única y
  tipada en vez de un documento.
- **Hecho cuando:** cada juego tiene un único módulo de esquema importado por su
  colector y por su juego; ningún contrato está definido dos veces.
- **Fecha:** 2026-08-13 · **Estado:** Abierto

## [RM-040] Sistema de storage para colectores y juegos
- **Objetivo:** que lo que se llena en el colector viva en la nube y no solo en un
  archivo local: datos en la base (por programa, detrás de `src/data/` y con RLS) e
  imágenes en storage, de modo que el juego pueda leer lo mismo que produjo el
  colector. Cubre a todos los juegos, no a uno. Hoy el colector es efímero: el
  estado vive en memoria y el guardado descarga un archivo — si ese archivo se
  pierde, el juego se rehace a mano. Es la diferencia entre una herramienta y un
  servicio. La forma real de `data` ya se puede modelar con los 13 colectores
  portados a la vista, en vez de adivinarla con uno solo.
- **A tener en cuenta:** hay que **limitar el peso de las imágenes** antes de
  subirlas (redimensionar y/o comprimir del lado del cliente, y rechazar lo que
  pase de cierto tamaño). Estamos en el tier gratuito de Supabase, donde lo que se
  acaba primero no es el almacenamiento sino la **transferencia**: cada vez que un
  juego abre su sesión se vuelve a descargar todo el paquete de imágenes.
- **Hecho cuando:** un colector guarda en la nube, el juego correspondiente lee esos
  datos e imágenes, y existe un tope de peso aplicado en la subida.
- **Fecha:** 2026-08-13 · **Estado:** Abierto (promovido desde WL-004, que se retira)

## [RM-041] Servicio de consulta en tablet para conductores
- **Objetivo:** un tercer servicio del programa, junto a colectores y juegos: que el
  conductor abra Ronda en una tablet durante el programa y consulte los datos que se
  cargaron por el colector (leer, no editar). Tiene lógica propia — vista pensada
  para tablet, acceso por rol dentro del programa y qué se muestra de cada juego —
  que se desmenuza cuando toque la tarea.
- **Hecho cuando:** un conductor con acceso al programa entra desde una tablet y ve
  los datos del juego cargado, legibles en pantalla táctil.
- **Fecha:** 2026-08-13 · **Estado:** Abierto

## [RM-042] Centralizar la limpieza de datos (trim)
- **Objetivo:** que todos los colectores apliquen trim (espacios accidentales al
  inicio o al final) desde un punto compartido, no repetido a mano en cada
  `schema.ts`. Hoy es inconsistente: trimean Reto Cruzado, Intruso, Tres en Raya,
  La Sabes o No, Al Vuelo, Cálculo Mental, Cronos, Álbum, Galería de Fotos y
  Operaciones Combinadas; no trimean Deletreo, Mi Libro Favorito, Busca el Logo ni
  De Par en Par.
- **Decisión abierta (opciones a evaluar):** (1) al exportar, con un deep-trim en
  los helpers de persistencia — cubre todo sin tocar colectores, pero lo que se ve
  puede diferir de lo que se guarda; (2) al escribir, con trim en los puntos de
  entrada (carga de archivo, llenado rápido, `onBlur` de los inputs) — lo que se ve
  es lo que se guarda, pero son varios puntos; (3) al validar ([[RM-034]]), que el
  espacio sobrante se reporte — visible pero con fricción.
- **Hecho cuando:** existe un único mecanismo compartido, lo usan todos los
  colectores incluido el llenado rápido, y se retiró el trim manual duplicado.
- **Fecha:** 2026-08-13 · **Estado:** Abierto

## [RM-043] De Par en Par al ImagePicker del kit (sin recorte)
- **Objetivo:** que las cartas de De Par en Par usen el `ImagePicker` compartido en
  vez del picker propio que arrastró del original (`<input type="file">` + `<img>`
  con `eslint-disable`, y su propio botón de borrar). Es el único colector del
  catálogo fuera del sistema de imágenes.
- **Sin recorte por ahora:** se monta **sin** la prop `crop` — Más Conectados pidió
  expresamente que el recorte no se aplique todavía. Puede activarse más adelante,
  y con el picker compartido eso será agregar una prop.
- **Hecho cuando:** las cartas usan `ImagePicker`, el zip sigue guardando y cargando
  igual, y no queda código de subida de imágenes propio en el colector.
- **Fecha:** 2026-08-13 · **Estado:** Abierto
