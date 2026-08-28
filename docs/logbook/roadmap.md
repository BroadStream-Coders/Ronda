# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-081] El cursor en pantalla completa lo decide cada juego
- **Objetivo:** que la ficha del juego declare si el cursor se oculta al entrar en
  pantalla completa. Hoy se oculta siempre, y **De Par en Par necesita el mouse**
  para voltear cartas.
- **Lo que ya está y no hay que inventar:** `Stage` ya recibe
  `hideCursorOnFullscreen` (default `true`) — lo que falta es que `GameShell` se lo
  pase desde la ficha, o sea un campo nuevo en `GameType`
  (`src/game/kit/game.ts`) que `GameShell` (`src/game/kit/GameShell.tsx`) traduzca
  a esa prop. Ningún juego actual lo declara, así que el default no cambia para los
  que ya corren.
- **Hecho cuando:** un juego puede pedir cursor visible y los demás siguen
  ocultándolo sin tocar nada.
- **Bloquea a:** [[RM-073]] (De Par en Par desde Unity).
- **Fecha:** 2026-08-21 · **Estado:** Abierto

---

## [RM-079] Gráfica real de Arma la Palabra
- **Objetivo:** reemplazar el diseño provisional en CSS de la part `blanks`
  (`src/game/catalog/arma-la-palabra/parts/blanks.tsx`) por la gráfica del
  diseñador: casilla o guion de cada letra, tipografía y el estado revelado.
- **Lo que ya está resuelto y no hay que rehacer:** el reparto en grafemas, el
  revelado letra a letra, el latido del guion siguiente y las teclas ([[RM-077]]).
- **Ojo con el croma:** este juego **no va sobre croma**; si la gráfica final lo
  cambia, hay que declarar `chromaLayerId` en la ficha o el panel de color ofrece
  algo que nadie pinta.
- **Hecho cuando:** la part dibuja con los assets entregados y no queda color
  hardcodeado de relleno.
- **Fecha:** 2026-08-21 · **Estado:** Abierto

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
- **Ojo:** los assets van a `public/programs/mas-conectados/games/arma-la-oracion/` y
  las medidas dentro del Stage en `cqw`/`cqh`, nunca `px`.
- **Hecho cuando:** la part dibuja con los assets entregados y no queda color
  hardcodeado de relleno.
- **Fecha:** 2026-08-21 · **Estado:** Abierto

---

# Juegos — el núcleo del negocio

`RM-038` es el paraguas. Debajo va **un juego por tarea**: los que se portan desde
Games ([[RM-064]]–[[RM-071]]) y De Par en Par ([[RM-073]]), que no existe en Games y
se migra desde Unity.

**Lo que le falta al kit no se hace por adelantado.** Cada pieza entra con el primer
juego que la pida, escrita en `kit/` y no en la carpeta del juego — el mismo criterio
que ya se aplicó con las animaciones, de las que entraron 4 de 10. Hacerlas sueltas
significa construirlas sin nadie que las use y sin forma de validarlas: `pnpm build`
no avisa si un texto desborda su rect. La única que se anotó aparte fue la sesión ZIP
([[RM-061]], ya cerrada), porque la pedían **varios** juegos y no le pertenecía a
ninguno.

El procedimiento, las trampas y la tabla de lo que el kit no tiene viven en
[`docs/migracion-games.md`](../migracion-games.md) — se lee antes de empezar
cualquiera de estas tareas, no se repite acá.

## [RM-038] Importar los juegos desde el proyecto Games
- **Objetivo:** el paraguas de la migración. Ya no contiene el trabajo de portar —
  eso se repartió en una tarea por juego. Lo que queda acá es lo **transversal**:
  las decisiones y las piezas que no le pertenecen a ningún juego en particular.
- **Qué queda adentro:**
  1. **El orden de portado.** Cerraron los de solo texto — Cálculo Mental
     ([[RM-063]]), La Sabes o No ([[RM-064]]) y Mi Libro Favorito ([[RM-066]]) — y
     con ellos entró casi todo lo que bloqueaba al resto; queda Al Vuelo
     ([[RM-065]]), que espera el punto 2 de acá abajo. Siguen los que traen imágenes
     por sesión (Intruso, Álbum, Cronos), ya desbloqueados por [[RM-061]]; Busca Logo
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
     se migra desde Unity con la guía correspondiente.
- **Hecho cuando:** cierran las tareas por juego y las tres piezas de arriba están
  hechas; los 10 juegos de Games más De Par en Par corren dentro de un programa y
  son asignables.
- **Fecha:** 2026-08-13 · **Estado:** En progreso (2026-08-20)

## [RM-065] Portar Al Vuelo
- **Objetivo:** traer el juego de Games. Colector: **`si-o-no`** — el slug no
  coincide con el del juego, es el caso que motiva el punto 2 de [[RM-038]].
- **Depende de:** el campo de colector en la ficha ([[RM-038]]); la part `text` ya
  entró con [[RM-063]].
- **Hecho cuando:** corre dentro de un programa, es asignable y consume el archivo
  que produce `si-o-no` sin un caso especial escrito a mano.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-104] Nivel 2 de Intruso: las rondas de fotos
- **Objetivo:** que el juego consuma los `photoRounds` que el colector ya recolecta
  y hoy no lee nadie. Es un nivel distinto, no una variante del primero: en vez de
  una foto y cuatro textos son **cuatro fotos** con etiqueta y una descripción de
  contexto (`description`).
- **Por qué quedó fuera de [[RM-067]]:** **no existe del otro lado.** El juego en
  Games tiene solo `level1` y su type-guard ni mira `photoRounds`; la gráfica sí
  existe, pero en Unity (`Games/Intruso/Graphic/level 2/`, con su propio
  `normalFrame`, `mask` y un `pictureFrame` que el nivel 1 no usa). O sea que esto
  no es portar: es armar el nivel con la guía de Unity y el layout a mano.
- **Ojo:** el colector ya lo valida y lo empaqueta, así que el archivo que produce
  hoy ya trae los datos. La sesión ZIP y la precarga de sus imágenes están hechas
  ([[RM-061]], [[RM-086]]); lo que falta es el layout, la lógica y los assets.
- **Hecho cuando:** el conductor puede pasar a las rondas de fotos dentro del mismo
  juego y las cuatro fotos salen al aire con su marco.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-068] Portar Álbum
- **Objetivo:** traer el juego de Games. Colector: `album` (fotos con pregunta por
  columna).
- **Depende de:** las animaciones que el kit no tiene (del grupo
  float / sparkles / shimmer / holo); entran las que este juego use, no todas.
  `blink` ya entró con [[RM-066]] y el ZIP con [[RM-061]].
- **Hecho cuando:** corre dentro de un programa, es asignable y consume la sesión que
  produce su colector, imágenes incluidas.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-069] Portar Cronos
- **Objetivo:** traer el juego de Games. Colector: `cronos` (eventos con fecha,
  título e imagen).
- **Depende de:** el mismo grupo de animaciones que [[RM-068]]; si Álbum va primero,
  acá ya están. El ZIP entró con [[RM-061]].
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
- **Depende de:** la animación **flip** para voltear la carta, que el kit no tiene;
  es la misma que pide Busca Logo ([[RM-070]]), así que la trae el primero de los dos
  que se haga. Y [[RM-081]], el cursor visible. El ZIP y los blobs entraron con
  [[RM-061]]; la part `text` de las cartas de texto, con [[RM-063]].
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
  ([[RM-067]], [[RM-068]], [[RM-069]]) el mismo paquete se baja varias veces más por
  emisión. La vista del conductor no suma a esto: consume solo el `session.json`.
- **Dónde engancha:** el recorte ya pasa por canvas (`kit/images/crop-image.ts`),
  así que hay dónde redimensionar sin agregar dependencias; y la subida es un solo
  punto (`data/collector-storage.ts`), no cinco.
- **Hecho cuando:** hay un tope aplicado en la subida, con aviso claro al usuario
  cuando una imagen no entra, y una medición de cuánto pesa hoy una sesión típica.
- **Fecha:** 2026-08-16 · **Estado:** Abierto

## [RM-082] El rol de conductor dentro del programa
- **Objetivo:** distinguir *productor* de *conductor* dentro de un mismo programa.
  Hoy `memberships` solo dice quién entra, no en calidad de qué: cualquier miembro
  de un programa con el servicio `host` puede abrir la vista del conductor, y un
  conductor puede abrir el colector y los juegos.
- **Por qué quedó fuera de [[RM-041]]:** el servicio host no lo necesita para
  funcionar (la compuerta del *programa* ya está: la clave `host` en
  `src/data/program-services.ts`). Esto es la otra compuerta, la del *usuario*, y
  arrastra migración + panel de admin, que es trabajo de otra naturaleza.
- **Qué toca:** migración que agrega `role` a `memberships` (`producer` | `host`,
  default `producer`) y sus policies; el alta de miembros e invitaciones en el admin
  (`src/app/admin/users`, `src/app/admin/invitations`) para elegir rol; y el aterrizaje
  al entrar: un conductor que abre `/programs/<slug>` va derecho a
  `/programs/<slug>/host` en vez de ver el espacio de trabajo.
- **Hecho cuando:** un conductor solo puede llegar a su vista, y un productor sigue
  viendo todo lo suyo.
- **Fecha:** 2026-08-23 · **Estado:** Abierto

---

# Vista del conductor — una vista por colector

`RM-083` es el paraguas. Debajo va **un colector por tarea** ([[RM-088]]–[[RM-103]]):
**todos los colectores llevan su vista**, porque todo lo que el equipo carga alguien
lo tiene que poder leer en el estudio. Entran a pedido, una por una, no todas de
golpe.

**Seis traen imágenes** — Busca el Logo, Álbum, Cronos, Intruso, Galería de Fotos y
De Par en Par. El host hoy solo lee el `session.json`, así que esas seis esperan a
que se decida cómo se sirven las fotos; la decisión es transversal y vive en
[[RM-083]], no en cada tarea.

## [RM-083] Las vistas del conductor — lo transversal
- **Objetivo:** el paraguas del catálogo del servicio `host`. Ya no contiene el
  trabajo de escribir vistas — eso se repartió en una tarea por colector. Lo que
  queda acá es lo que no le pertenece a ninguna vista en particular.
- **Cómo entra cada una:** un archivo en `src/host/catalog/<colector>/View.tsx` que
  recibe `{ session: unknown }`, lo valida con el guard `isData` que **ya existe** en
  `src/collector/catalog/<colector>/schema.ts` (no se duplica el tipo: el contrato es
  del colector, que es quien produce el archivo) y lo pinta en lectura. Después se
  registra en `views.ts` y se agrega el id a la lista `host` del programa.
- **Sin imágenes, y eso bloquea a seis:** el host consume solo el `session.json` del
  storage. Un colector con fotos necesita antes decidir cómo se sirven (URLs
  firmadas) — no está resuelto y no se resuelve por adelantado, pero es **esta**
  tarea la que lo decide, no la del primer juego con fotos que toque.
- **La grilla es por juego:** cada vista declara sus columnas; `HostTable` no sabe de
  palabras ni de preguntas. Lo que el kit no tenga se escribe en `kit/` y no en la
  carpeta de la vista, igual que con los juegos — pero recién cuando una vista lo
  pida.
- **Hecho cuando:** cierran las tareas por colector y las fotos tienen forma de
  llegar al host.
- **Fecha:** 2026-08-23 · **Estado:** En progreso (2026-08-23)

## [RM-090] Vista de conductor de Al Vuelo
- **Objetivo:** leer en el estudio lo que carga el colector `si-o-no` — el slug del colector no coincide con el del juego.
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-092] Vista de conductor de Mi Libro Favorito
- **Objetivo:** leer en el estudio lo que carga el colector `mi-libro-favorito`.
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-093] Vista de conductor de Busca el Logo
- **Objetivo:** leer en el estudio lo que carga el colector `busca-logo`.
- **Depende de:** cómo llegan las imágenes al host — sin resolver, vive en
  [[RM-083]].
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-094] Vista de conductor de Álbum
- **Objetivo:** leer en el estudio lo que carga el colector `album`.
- **Depende de:** cómo llegan las imágenes al host — sin resolver, vive en
  [[RM-083]].
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-095] Vista de conductor de Cronos
- **Objetivo:** leer en el estudio lo que carga el colector `cronos`.
- **Depende de:** cómo llegan las imágenes al host — sin resolver, vive en
  [[RM-083]].
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-096] Vista de conductor de Operaciones Combinadas
- **Objetivo:** leer en el estudio lo que carga el colector `operaciones-combinadas`.
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-097] Vista de conductor de Reto Cruzado
- **Objetivo:** leer en el estudio lo que carga el colector `reto-cruzado`.
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-098] Vista de conductor de Intruso
- **Objetivo:** leer en el estudio lo que carga el colector `intruso`.
- **Depende de:** cómo llegan las imágenes al host — sin resolver, vive en
  [[RM-083]].
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-099] Vista de conductor de Galería de Fotos
- **Objetivo:** leer en el estudio lo que carga el colector `galeria-fotos`.
- **Depende de:** cómo llegan las imágenes al host — sin resolver, vive en
  [[RM-083]].
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-100] Vista de conductor de Tres en Raya
- **Objetivo:** leer en el estudio lo que carga el colector `tres-en-raya`.
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-101] Vista de conductor de De Par en Par
- **Objetivo:** leer en el estudio lo que carga el colector `de-par-en-par`.
- **Depende de:** cómo llegan las imágenes al host — sin resolver, vive en
  [[RM-083]].
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-102] Vista de conductor de Arma la Palabra
- **Objetivo:** leer en el estudio lo que carga el colector `arma-la-palabra`.
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

## [RM-103] Vista de conductor de Arma la Oración
- **Objetivo:** leer en el estudio lo que carga el colector `arma-la-oracion`.
- **Hecho cuando:** la vista está registrada y el conductor lee con ella una
  sesión real del programa.
- **Fecha:** 2026-08-28 · **Estado:** Abierto

---

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
