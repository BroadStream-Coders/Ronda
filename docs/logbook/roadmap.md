# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

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
que ya se aplicó con las animaciones, que entraron de a una con el juego que las
pedía. Hacerlas sueltas
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
  1. **El orden de portado.** Cerraron todos los de solo texto — Cálculo Mental
     ([[RM-063]]), La Sabes o No ([[RM-064]]), Mi Libro Favorito ([[RM-066]]) y Al
     Vuelo ([[RM-065]]) — y con ellos entró casi todo lo que bloqueaba al resto.
     También el primero con imágenes de sesión, Intruso ([[RM-067]]), y Álbum
     ([[RM-068]]), que trajo el grupo de animaciones que compartía con Cronos y el
     `flip` que esperaban Busca Logo y De Par en Par. También Cronos ([[RM-069]]), que trajo el drag & drop, el cronómetro y el
     cursor visible. Y Busca Logo ([[RM-070]]), que iba al final por el miedo al
     rendimiento con 202 layers — resultó infundado, porque anima con `flip` y no
     con `bounce`/`slide`. Queda Operaciones Combinadas aparte, porque del otro
     lado es un prototipo.
  2. **~~La ficha debe declarar su colector.~~ Ya no hace falta.** Existía por un
     solo caso: el colector `si-o-no` alimentaba al juego **Al Vuelo**. Ese colector
     se renombró a `al-vuelo` ([[TD-108]], con migración del bucket), así que **hoy
     todos los pares comparten slug** y asumirlo es correcto. Si algún día vuelve a
     aparecer un par desalineado, la salida es un campo en `GameType` — pero no se
     construye por adelantado para nadie.
  3. **`scripts/check-game.ts` crece con el catálogo.** Hoy valida coordenadas,
     `applyState`, `settingKey` y los assets de Deletreo — o sea, solo el juego que
     ya está. Cada juego que entra deja acá lo que podría romperse en silencio: rutas
     de assets que no existen, layers referenciados por la lógica que el layout no
     tiene, parts sin vista registrada.
  4. **Fuera del inventario de Games quedan los que solo existen en Unity**, que se
     migran con [`docs/migracion-unity.md`](../migracion-unity.md): De Par en Par
     ([[RM-073]]), Tres en Raya ([[RM-106]]) y Galería de Fotos ([[RM-108]]), estos
     dos últimos ya cerrados. Unity tiene más juegos
     sin migrar que ni Games ni este roadmap contemplan todavía.
- **Hecho cuando:** cierran las tareas por juego y las tres piezas de arriba están
  hechas; los 10 juegos de Games más De Par en Par corren dentro de un programa y
  son asignables.
- **Fecha:** 2026-08-13 · **Estado:** En progreso (2026-08-20)

## [RM-071] Portar Operaciones Combinadas
- **Objetivo:** traer el juego de Games. Colector: `operaciones-combinadas`
  (operaciones en un tablero tipo crucigrama). **Del otro lado es un prototipo**, no
  un juego terminado: la primera parte de la tarea es decidir qué se porta y qué se
  completa acá.
- **Depende de:** nada nuevo — la part `text` ya entró con [[RM-063]].
- **Hecho cuando:** corre dentro de un programa, es asignable y consume el archivo
  que produce su colector.
- **Fecha:** 2026-08-20 · **Estado:** Abierto

## [RM-110] El panel Splash de Reto Cruzado
- **Objetivo:** cablear el sexto panel del juego (`PageDown`), que en Unity es un
  **video** y en Ronda quedó vacío al cerrar [[RM-109]].
- **Qué falta:** el `.mp4`. El original vive en Unity sin convertir; va con la receta
  de `CLAUDE.md` — H.264, `crf 18`, `preset slow`, 1080p, sin pista de audio — y se
  guarda en `public/programs/que-gane-el-mejor/shared/video/` si lo comparten varios
  juegos, o en el del juego si no.
- **Lo que ya está:** el resto del panel. Solo hay que añadir el layer con la part
  `video`, meterlo en `PRELOAD` y darle su tecla en `Logic.tsx`, que ya conmuta los
  otros cinco.
- **Hecho cuando:** `PageDown` muestra el video y el juego sigue teniendo los cinco
  niveles anteriores intactos.
- **Fecha:** 2026-09-01 · **Estado:** Abierto

## [RM-073] Migrar De Par en Par desde Unity
- **Objetivo:** traer el juego de memoria con pares de cartas. **No existe en Games**,
  así que la fuente es el proyecto **Unity** (`TvPeru-QGEM-ManagedGames`) y la guía es
  [`docs/migracion-unity.md`](../migracion-unity.md), no la de Games. Colector:
  `de-par-en-par`, asignado hoy a **Más Conectados** (su único programa).
- **Lo que ya define el colector:** cada carta es imagen, texto o ambos
  (`CardMode`), y la sesión trae las imágenes por nombre de archivo
  (`pictureFile`) más el orden del tablero (`answer`) — o sea, sesión ZIP, no JSON
  suelto.
- **Alcance: solo el tablero de 20 cartas (10 pares).** El colector ofrece cuatro
  conteos (8/10/12/15), pero en Unity **solo el de 10 pares está terminado con la
  gráfica actual**: es el único activo, el único que usa `Graphic New/` y el único
  con los números en TMP. Los de 16, 24 y 30 siguen apuntando a las gráficas viejas
  (`Graphic/Board 24|30/`, números como PNG) y el de 16 tiene celdas cuadradas de
  290×290 contra una carta de 360×250. Los otros tres conteos no se portan.
- **Depende de:** nada. La animación **flip** entró con [[RM-068]] y el cursor
  visible con [[RM-081]]. El ZIP y los blobs entraron con [[RM-061]]; la part `text`
  de las cartas de texto, con [[RM-063]]. **No pide `drag`:** en Unity cada carta es
  un `Button`, se clickea, no se arrastra — la promoción de la part `drag` de Cronos
  al kit sigue esperando a otro juego.
- **Ojo:** [[TD-013]] es del **colector** (anchos fijos por cantidad de pares), no
  del juego — no se cierra con esta tarea.
- **Hecho cuando:** corre dentro de Más Conectados, es asignable y consume la sesión
  que produce su colector, imágenes incluidas.
- **Fecha:** 2026-08-20 · **Estado:** En progreso (2026-09-08)

---

## [RM-107] Avisar cuando un archivo no encaja, en juego y colector
- **Objetivo:** que cargar un archivo con la estructura equivocada produzca un aviso
  **explícito y legible** en los dos servicios, en vez de fallar en silencio.
- **Hoy no es el mismo fallo en cada punta:**
  - **Juego:** `GameTopbar` sí atrapa el error y lo pinta, pero en una línea de la
    barra superior y con `truncate` — el mensaje se corta y pasa desapercibido.
  - **Colector:** no muestra nada. Es [[TD-114]]: `catch {}` vacío y guards
    superficiales que dejan pasar el archivo equivocado.
- **Qué toca:** el `catch` de los 16 colectores, el aviso del `GameTopbar`, y decidir
  dónde vive el aviso compartido. **Con el diálogo del proyecto**
  (`src/components/confirm-dialog.tsx`, Base UI), nunca `alert()` nativo.
- **Ojo:** el mensaje tiene que decir *qué* no encaja, no solo que algo falló. Un
  "estructura no válida" a secas no le dice al productor que su archivo es de una
  versión anterior del juego.
- **Hecho cuando:** cargar un archivo del juego equivocado, o de una versión vieja,
  lo dice claro en el colector y en el juego.
- **Fecha:** 2026-08-30 · **Estado:** Abierto

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
