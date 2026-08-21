# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-076] Gráfica real de Arma la Oración
- **Objetivo:** reemplazar el diseño provisional en CSS de la part `sentence`
  (`src/game/catalog/arma-la-oracion/parts/sentence.tsx`) por la gráfica del
  diseñador cuando la entregue: marcos de las fichas, tipografía y el estado
  "armado", y el fondo (part `backdrop`) si el diseño trae uno.
- **Ojo con el croma:** este juego **no va sobre croma**; si la gráfica final lo
  cambia, hay que volver a declarar `chromaLayerId` en la ficha o el panel de color
  ofrece algo que nadie pinta.
- **Lo que ya está resuelto y no hay que rehacer:** los dos estados, el vuelo de las
  fichas a su sitio (layout animation de `motion`), las teclas y la limpieza del
  texto ([[RM-075]]). Lo que cambia es solo cómo se pinta cada ficha.
- **Ojo:** los assets van a `public/games/arma-la-oracion/` y las medidas dentro del
  Stage en `cqw`/`cqh`, nunca `px`.
- **Hecho cuando:** la part dibuja con los assets entregados y no queda color
  hardcodeado de relleno.
- **Fecha:** 2026-08-21 · **Estado:** Abierto

---

## [RM-055] Cómo se declara qué servicios tiene cada programa
- **Objetivo:** un solo lugar donde se declara qué servicios tiene contratado un
  programa y qué le toca de cada uno, en vez de una lista por sistema. Hoy
  `collector/catalog/assignments.ts` y `game/catalog/assignments.ts` repiten el uuid
  y el nombre del programa; con la tablet ([[RM-041]]) serían tres archivos y tres
  lugares donde olvidarse de uno.
- **Por qué es RM y no deuda:** lo de hoy funciona y es coherente — cada sistema
  autocontenido con su propia asignación. Lo que falta no es corregir un error, es
  **tomar una decisión de modelo** que recién se puede tomar bien con el tercer
  servicio a la vista: Más Conectados tiene colector y juegos; Que Gane El Mejor va
  a tener además el display en tablet.
- **Decisión abierta (elegir al construir el tercer servicio):** (1) un archivo por
  programa con `{ collectors, games, tablet }` y un getter por servicio — lo más
  corto, pero el archivo crece con cada servicio; (2) un registro de servicios donde
  cada servicio declara su catálogo y el programa solo lista qué servicios tiene más
  su selección — más indirecto, pero sumar un servicio no toca a los otros; (3)
  llevarlo a la base (`program_services`), que es donde termina cuando la asignación
  deje de estar hardcodeada y la maneje el panel de admin.
- **Hecho cuando:** dar de alta un programa o habilitarle un servicio se hace en un
  solo lugar, y los tres servicios leen de ahí.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

---

# Juegos — el núcleo del negocio

`RM-038` es el paraguas. Debajo va **un juego por tarea**: los que se portan desde
Games ([[RM-064]]–[[RM-071]]) y De Par en Par ([[RM-073]]), que no existe en Games y
se migra desde Unity.

**Lo que le falta al kit no se hace por adelantado.** Cada pieza entra con el primer
juego que la pida, escrita en `kit/` y no en la carpeta del juego — el mismo criterio
que ya se aplicó con las animaciones, de las que entraron 4 de 10. Hacerlas sueltas
significa construirlas sin nadie que las use y sin forma de validarlas: `pnpm build`
no avisa si un texto desborda su rect. La única anotada aparte es [[RM-061]],
porque la piden **varios** juegos y conviene que el primero que la traiga sepa que no
es suya.

El procedimiento, las trampas y la tabla de lo que el kit no tiene viven en
[`docs/migracion-games.md`](../migracion-games.md) — se lee antes de empezar
cualquiera de estas tareas, no se repite acá.

## [RM-038] Importar los juegos desde el proyecto Games
- **Objetivo:** el paraguas de la migración. Ya no contiene el trabajo de portar —
  eso se repartió en una tarea por juego. Lo que queda acá es lo **transversal**:
  las decisiones y las piezas que no le pertenecen a ningún juego en particular.
- **Qué queda adentro:**
  1. **El orden de portado.** Cálculo Mental ya cerró ([[RM-063]]) y con él entraron
     la part `text`, el override de `visible` y `playStagger`, que era lo que
     bloqueaba al resto. Siguen los de solo texto (La Sabes o No, Al Vuelo, Mi Libro
     Favorito), que ya los encuentran hechos; luego los que traen imágenes por
     sesión (Intruso, Álbum, Cronos), que dependen del ZIP ([[RM-061]]); Busca Logo
     al final, que es el que puede romper supuestos de rendimiento; Operaciones
     Combinadas aparte, porque del otro lado es un prototipo.
  2. **La ficha debe declarar su colector.** Hoy se asume que el slug del juego y el
     del colector coinciden, y no siempre pasa: el colector `si-o-no` es el que
     alimenta al juego **Al Vuelo** (de hecho el colector ya se llama "Al Vuelo" en
     su `meta`, solo la carpeta conserva el nombre viejo). Es un campo en `GameType`,
     no un caso especial en cada juego.
  3. **`scripts/check-game.ts` crece con el catálogo.** Hoy valida coordenadas,
     `applyState`, `settingKey` y los assets de Deletreo — o sea, solo el juego que
     ya está. Cada juego que entra deja acá lo que podría romperse en silencio: rutas
     de assets que no existen, layers referenciados por la lógica que el layout no
     tiene, parts sin vista registrada.
  4. **Fuera del inventario de Games hay uno solo: De Par en Par** ([[RM-073]]), que
     se migra desde Unity. `reto-cruzado`, `galeria-fotos` y `tres-en-raya`
     **se quedan en Unity a propósito**: se siguen emitiendo desde ahí porque no se
     pueden llevar a web. Su colector en Ronda sí sirve —alimenta al juego de
     Unity—, así que no sobra ni se retira. No son un pendiente: son el caso de
     "colector en Ronda, juego fuera de Ronda".
- **Hecho cuando:** cierran las tareas por juego y las tres piezas de arriba están
  hechas; los 10 juegos de Games más De Par en Par corren dentro de un programa y
  son asignables.
- **Fecha:** 2026-08-13 · **Estado:** En progreso (2026-08-20)

## [RM-061] Sesión ZIP y ciclo de vida de los blobs
- **Objetivo:** que un juego pueda cargar una sesión que trae imágenes, no solo JSON:
  leer el ZIP, crear las URLs de objeto y **liberarlas** al cambiar de sesión o
  desmontar. Sin el `dispose`, cada carga durante una emisión larga deja los blobs
  vivos.
- **Lo necesitan:** Intruso ([[RM-067]]), Álbum ([[RM-068]]), Cronos ([[RM-069]]) y
  De Par en Par ([[RM-073]]).
- **Hecho cuando:** `useGameSession` acepta un ZIP, expone las imágenes al juego y
  revoca las URLs al reemplazar o desmontar la sesión.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-064] Portar La Sabes o No
- **Objetivo:** traer el juego de Games. Colector: `la-sabes-o-no` (elegir la
  respuesta correcta entre dos).
- **Depende de:** nada nuevo — la part `text` ya entró con [[RM-063]].
- **Hecho cuando:** corre dentro de un programa, es asignable y consume el archivo
  que produce su colector.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-065] Portar Al Vuelo
- **Objetivo:** traer el juego de Games. Colector: **`si-o-no`** — el slug no
  coincide con el del juego, es el caso que motiva el punto 2 de [[RM-038]].
- **Depende de:** el campo de colector en la ficha ([[RM-038]]); la part `text` ya
  entró con [[RM-063]].
- **Hecho cuando:** corre dentro de un programa, es asignable y consume el archivo
  que produce `si-o-no` sin un caso especial escrito a mano.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-066] Portar Mi Libro Favorito
- **Objetivo:** traer el juego de Games. Colector: `mi-libro-favorito` (preguntas por
  ronda para dos equipos).
- **Depende de:** nada nuevo — la part `text` y el override de `visible` que pide el
  marcador por equipo ya entraron con [[RM-063]].
- **Hecho cuando:** corre dentro de un programa, es asignable y consume el archivo
  que produce su colector.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-067] Portar Intruso
- **Objetivo:** traer el juego de Games. Colector: `intruso` (encontrar el elemento
  que no encaja).
- **Depende de:** [[RM-061]] (trae imágenes) y la part `mask`, que el kit no tiene y
  entra con este juego.
- **Hecho cuando:** corre dentro de un programa, es asignable y consume la sesión que
  produce su colector, imágenes incluidas.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-068] Portar Álbum
- **Objetivo:** traer el juego de Games. Colector: `album` (fotos con pregunta por
  columna).
- **Depende de:** [[RM-061]]. Trae además animaciones que el kit no tiene (del grupo
  float / blink / sparkles / shimmer / holo); entran las que este juego use, no todas.
- **Hecho cuando:** corre dentro de un programa, es asignable y consume la sesión que
  produce su colector, imágenes incluidas.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-069] Portar Cronos
- **Objetivo:** traer el juego de Games. Colector: `cronos` (eventos con fecha,
  título e imagen).
- **Depende de:** [[RM-061]]. Mismo grupo de animaciones que
  [[RM-068]]; si Álbum va primero, acá ya están.
- **Hecho cuando:** corre dentro de un programa, es asignable y consume la sesión que
  produce su colector, imágenes incluidas.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-070] Portar Busca el Logo
- **Objetivo:** traer el juego de Games. Colector: `busca-logo` (marcar dónde van los
  logos en cada tablero). **Va último a propósito:** es el que puede romper supuestos
  que hoy no molestan.
- **Depende de:** la animación `flip`, que el kit no tiene. La part `text` y
  `playStagger` ya entraron con [[RM-063]].
- **El riesgo real — 202 layers.** `bounce` y `slide` animan la posición escribiendo
  en `useGameState` en cada frame, o sea un re-render de React por frame. Con los 4
  layers de Deletreo no se nota y en Games funcionaba igual, pero acá son 202. Si se
  arrastra, la salida es animar el transform del DOM en vez de la posición del
  estado — y esa decisión afecta al kit entero, no solo a este juego.
- **También:** su `layout.json` pesa ~100 KB, el más grande del catálogo.
- **Hecho cuando:** corre dentro de un programa, es asignable, consume el archivo de
  su colector y las animaciones van fluidas con los 202 layers en pantalla.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-071] Portar Operaciones Combinadas
- **Objetivo:** traer el juego de Games. Colector: `operaciones-combinadas`
  (operaciones en un tablero tipo crucigrama). **Del otro lado es un prototipo**, no
  un juego terminado: la primera parte de la tarea es decidir qué se porta y qué se
  completa acá.
- **Depende de:** nada nuevo — la part `text` ya entró con [[RM-063]].
- **Hecho cuando:** corre dentro de un programa, es asignable y consume el archivo
  que produce su colector.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-073] Migrar De Par en Par desde Unity
- **Objetivo:** traer el juego de memoria con pares de cartas. **No existe en Games**,
  así que la fuente es el proyecto **Unity** (`TvPeru-QGEM-ManagedGames`) y la guía es
  [`docs/migracion-unity.md`](../migracion-unity.md), no la de Games. Colector:
  `de-par-en-par`, asignado hoy a **Más Conectados** (su único programa).
- **Lo que ya define el colector:** cada carta es imagen, texto o ambos
  (`CardMode`), y la sesión trae las imágenes por nombre de archivo
  (`pictureFile`) más el orden del tablero (`answer`) — o sea, sesión ZIP, no JSON
  suelto.
- **Depende de:** [[RM-061]] (ZIP y blobs). La part `text` que usan las cartas de
  texto ya entró con [[RM-063]]. Necesita además la animación **flip** para voltear
  la carta, que el kit
  no tiene; es la misma que pide Busca Logo ([[RM-070]]), así que la trae el primero
  de los dos que se haga.
- **Ojo:** [[TD-013]] es del **colector** (anchos fijos por cantidad de pares), no
  del juego — no se cierra con esta tarea.
- **Hecho cuando:** corre dentro de Más Conectados, es asignable y consume la sesión
  que produce su colector, imágenes incluidas.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

---

## [RM-039] Esquemas de datos centralizados (colector ↔ juego)
- **Objetivo:** que el contrato de datos de cada juego se defina **una sola vez** y
  lo compartan las dos puntas: el colector que lo produce y el juego que lo consume.
  Hoy cada contrato vive dentro de `collector/catalog/<slug>/schema.ts` y, cuando
  entren los juegos, se duplicaría del otro lado. Ya no hay Unity en el medio: las
  dos puntas son código de Ronda, así que el esquema puede ser una fuente única y
  tipada en vez de un documento.
- **Cuándo conviene hacerla:** antes de portar el tercer juego. Con Deletreo solo no
  hay nada que centralizar; con nueve, el `isDeletreoSession` escrito a mano se
  repitió nueve veces.
- **Hecho cuando:** cada juego tiene un único módulo de esquema importado por su
  colector y por su juego; ningún contrato está definido dos veces.
- **Fecha:** 2026-08-13 · **Estado:** Abierto

## [RM-062] El juego lee lo que cargó el colector, sin archivo a mano
- **Objetivo:** que el operador entre al juego y los datos ya estén, en vez de tener
  que elegir un archivo local que alguien le pasó. Es el punto entero de que colector
  y juego vivan en la misma plataforma; hoy el circuito está cortado justo ahí.
- **No bloquea la migración.** Estuvo un rato listada entre las tareas previas a
  portar y no lo es: cada juego funciona con el archivo local, igual que Deletreo hoy.
  Esto es producto, no prerequisito — puede entrar antes o después de los nueve juegos
  sin frenar ninguno.
- **Por qué no es difícil:** engancha sin rediseño — la carga desde la nube devuelve
  un `File`, igual que el input de archivo, así que el `load` de cada ficha no cambia.
  Lo que falta es de dónde sacarlo: qué sesión del colector corresponde a este juego
  en este programa, que es lo que [[RM-039]] deja tipado.
- **Hecho cuando:** el juego abre con los datos de la última sesión del colector, y
  la carga de archivo local queda como salida de emergencia, no como el camino normal.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-047] Límite de peso de las imágenes antes de subir
- **Objetivo:** que ninguna imagen entre al bucket sin pasar por un tope:
  redimensionar y/o comprimir del lado del cliente, y rechazar lo que se pase.
  Quedó fuera de [[RM-046]] a propósito, que subió las imágenes tal cual llegan.
- **Por qué importa:** en el tier gratuito lo que se acaba primero no es el
  almacenamiento sino la **transferencia**, y hoy cada apertura del colector baja
  el paquete completo de imágenes. Cuando entren los juegos con imágenes
  ([[RM-067]], [[RM-068]], [[RM-069]]) y la tablet ([[RM-041]]) el mismo paquete se
  baja varias veces más por emisión.
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
