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

## [RM-047] Límite de peso de las imágenes antes de subir
- **Objetivo:** que ninguna imagen entre al bucket sin pasar por un tope:
  redimensionar y/o comprimir del lado del cliente, y rechazar lo que se pase.
  Quedó fuera de [[RM-046]] a propósito, que subió las imágenes tal cual llegan.
- **Por qué importa:** en el tier gratuito lo que se acaba primero no es el
  almacenamiento sino la **transferencia**, y hoy cada apertura del colector baja
  el paquete completo de imágenes. Cuando entren los juegos ([[RM-038]]) y la
  tablet ([[RM-041]]) el mismo paquete se baja varias veces más por emisión.
- **Dónde engancha:** el recorte ya pasa por canvas (`kit/images/crop-image.ts`),
  así que hay dónde redimensionar sin agregar dependencias; y la subida es un solo
  punto (`data/collector-storage.ts`), no cinco.
- **Hecho cuando:** hay un tope aplicado en la subida, con aviso claro al usuario
  cuando una imagen no entra, y una medición de cuánto pesa hoy una sesión típica.
- **Fecha:** 2026-08-16 · **Estado:** Abierto

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

## [RM-051] Cómo escala el árbol de la barra lateral al sumar Juegos
- **Objetivo:** decidir e implementar cómo se comporta la navegación de la barra
  lateral cuando Juegos ([[RM-037]], [[RM-038]]) deje de ser "Pronto" y cuelgue su
  propia lista. Hoy Colectores cuelga los juegos asignados del programa; si Juegos
  hace lo mismo, la barra llega a ~28 ítems.
- **Decidido — la estructura se mantiene por servicio, no por juego:** se evaluó
  invertir el eje (`Deletreo → [Cargar, Emitir]`) para tener una sola lista, y se
  **descartó**. Los roles están separados en la práctica: quien llena colectores
  no toca emisión y quien emite no llena. Agrupar por juego le cobraría un clic
  extra a todos, en cada entrada, para llegar a la única pantalla que sí usan.
- **Decisión abierta (elegir al construir Juegos):** (1) **acordeón** — una sola
  rama abierta a la vez; abrir Juegos cierra Colectores; barato, sin cambios de
  rutas, tope de ~15 ítems visibles; (2) **flyout en el rail** — contraída, el
  ícono del servicio abre un submenú a la derecha con sus juegos en vez de
  listarlos en la columna, así el rail se queda en 3 íconos; se puede armar
  reusando el `DropdownMenu` que ya está en el proyecto.
- **A considerar aparte:** pasando los ~20 ítems, un buscador o paleta de comandos
  gana a cualquier árbol, y sirve para las dos opciones.
- **Hecho cuando:** con Juegos activo y sus juegos colgando, se llega a cualquier
  colector sin hacer scroll en la barra, ni contraída ni expandida.
- **Fecha:** 2026-08-17 · **Estado:** Abierto

## [RM-054] Speed Insights
- **Objetivo:** sumar `@vercel/speed-insights` con `<SpeedInsights />` en el layout
  raíz, misma mecánica que Analytics ([[RM-052]]): paquete + una línea + activarlo
  en el panel de Vercel. Mide Web Vitals reales (LCP, CLS, INP) de visitantes.
- **Lo que hay que mirar antes:** en el plan gratuito trae su propia cuota de
  eventos, separada de la de Analytics. Confirmar el tope vigente en el panel antes
  de dejarlo prendido, y si el tráfico del colector se lo come, limitarlo a la
  landing en vez de ponerlo en el layout raíz.
- **Hecho cuando:** el panel de Vercel muestra Web Vitals de producción y se
  verificó que la cuota aguanta el tráfico real.
- **Fecha:** 2026-08-17 · **Estado:** Abierto

