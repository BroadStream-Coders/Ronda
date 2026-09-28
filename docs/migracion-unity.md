# Migración Unity → Ronda

Guía operativa para replicar en Ronda un juego que existe en **Unity**
(repo `TvPeru-QGEM-ManagedGames`, clonado en `../managed-games`).

> **Antes de empezar: ¿el juego ya existe en Games?** Si sí, **no uses esta guía** —
> el trabajo pesado (conversión de prefab, horneado de layouts, conversión de texto)
> ya está hecho ahí. Usá [`migracion-games.md`](migracion-games.md), que es un
> renombrado mecánico. Esta guía es para juegos que **solo** existen en Unity.

> **Contexto clave:** Ronda *reemplaza* a Unity. Los prefabs son insumo de una sola
> dirección — después de la migración, cualquier ajuste (posición, cronómetro,
> color) se hace acá, nunca en Unity. Por eso los prefabs **no se commitean**: se
> leen directo de la carpeta del juego en el repo de Unity y no se copian a Ronda.

Leé también §2 de [`migracion-games.md`](migracion-games.md): el vocabulario de Ronda
no es el de Unity y no se vuelve atrás. Acá **no hay editor, ni inspector, ni
jerarquía, ni modo play**. Son juegos en navegador.

---

## Flujo por juego

Cada paso es un commit que Esteban revisa antes de seguir.

1. Esteban pasa la ruta de la carpeta del juego:
   `../managed-games/Assets/_Project/Games/<Juego>/`. Ahí está todo: el `.prefab`
   de la escena, los prefabs anidados en `Prefabs/` (p. ej. `Card.prefab`), los
   scripts en `Scripts/` (la lógica, las teclas y el `SessionData`) y las gráficas
   en `Graphics/` con sus `.meta` (el `.meta` da el GUID para mapear sprites).
   **Leer los scripts antes de convertir**: dicen qué layers pisa la lógica y qué
   hace cada tecla.
2. Convertir el prefab a `layout.json` (secciones siguientes). Generarlo con un
   script Node desechable en el scratchpad (`JSON.stringify(layout, null, 2)`), no a
   mano: los juegos tienen ~30 layers repetitivos.
3. Traer los assets según §5 de [`migracion-games.md`](migracion-games.md).
   **Preguntar siempre de dónde salen**: si el juego también pasó por Games, los
   originales están en el bucket de Games y los de Unity pueden estar viejos. Los
   PNG se copian **tal cual**, sin recomprimir (ver §Assets).
4. **Preguntar siempre por el fondo.** Casi nunca lo trae el prefab: en Unity el
   fondo lo ponía el switcher, no el juego. Hay tres caminos y **no se adivina** —
   croma (la ficha declara `chromaLayerId` y aparece el panel de color), video
   propio (`shared/video/`, y entonces la ficha **no** declara croma), o una imagen
   de fondo que sí viene en el prefab (Cubipiezas trae su `bg.png` de 1920×1080: va
   como part `image` en el primer layer, sin croma).
5. Validar con `pnpm build` (**nunca** `pnpm dev`) y `pnpm check`, y esperar el visto
   bueno visual de Esteban comparando contra Unity.
6. Cablear la funcionalidad: `Logic.tsx` + carga de sesión.
7. Animaciones, si el juego las pide (§Animaciones). Unity suele no tener ninguna;
   se agregan en su propio paso, después de que la lógica fiel esté aprobada.
8. Documentación: lo que el juego enseñó va a esta guía, y la tarea al changelog.

---

## Leer el prefab (YAML de Unity)

- Referencia del Canvas: **1920×1080**, igual que el espacio de diseño de Ronda
  (`DESIGN_WIDTH`/`DESIGN_HEIGHT` en `kit/layer.ts`).
- El prefab es una lista de bloques `--- !u!<tipo> &<fileID>`. Los que importan:
  `GameObject` (nombre, `m_IsActive`, lista de components), `RectTransform`
  (jerarquía vía `m_Father`/`m_Children`, anclas), `MonoBehaviour` con script
  `fe87c0e1…` = **UI Image** (`m_Sprite` → GUID) y `f4688fdb…` = **TextMeshPro**.
- Prefabs grandes (~3.000 líneas) exceden el límite de una lectura: leer por chunks
  (`limit`/`offset`); la estructura es muy regular entre opciones y slots.
- **Los prefabs tienen fin de línea CRLF.** Un script que parsee el YAML con
  regex de línea (`^\s*m_Name: (.*)$`) falla en silencio: el `\r` se cuela en el
  valor o rompe el `$`. Quitar los `\r` antes de parsear.
- **Prefabs anidados.** Un bloque `--- !u!1001` (`PrefabInstance`) instancia otro
  prefab: `m_SourcePrefab` da su GUID (búscalo en los `.meta` de `Prefabs/`) y
  `m_Modifications` trae solo lo que esa instancia pisa — nombre, `m_text`,
  `m_Sprite`, anclas. El resto sale del prefab fuente. En Cubipiezas, las 8 cartas
  son instancias de `Card.prefab` que cambian solo la letra y el sprite.
- Sprites: el GUID de `m_Sprite` se busca en los `.meta` subidos → nombre del PNG →
  ruta en `public/programs/<programa>/games/<juego>/`.

---

## Conversión de coordenadas

Ronda: posición relativa al **centro del padre**, Y hacia arriba (igual que Unity),
pivots 0.5, tamaños en px de diseño. El campo es `rect`, no `transform`.

- **Ancla puntual** (`anchorMin == anchorMax = (ax, ay)`), padre de W×H:

  ```
  position.x = ax·W − W/2 + anchoredPosition.x
  position.y = ay·H − H/2 + anchoredPosition.y
  size       = sizeDelta
  ```

  Ej.: ancla top-center (0.5, 1) en padre 392×188 con ap (0, −57) → (0, 37).

- **Stretch total** (`anchorMin (0,0)`, `anchorMax (1,1)`):
  `size = tamañoPadre + sizeDelta` (sizeDelta suele ser negativo o 0),
  `position = anchoredPosition`. Un stretch con sizeDelta 0 y ap 0 es un
  pass-through: se puede aplanar (fusionar con el padre) sin perder nada — **salvo
  que ese layer sea el ancla de una animación** (ver §Animaciones).

---

## HorizontalLayoutGroup

Unity lo resuelve en runtime; acá se hornea. Caso probado
(`ChildControlWidth: 0`, `ChildForceExpandWidth: 1`, padding 0):

```
sobrante = anchoContenedor − (Σ anchosHijos + spacing·(n−1))
celda    = anchoHijo + sobrante/n
offsetEnCelda = (celda − anchoHijo) · 0.5        (alignment middle-center)
izquierda_i   = i·(celda + spacing) + offsetEnCelda
centro_i (rel. al centro del padre) = izquierda_i + anchoHijo/2 − anchoContenedor/2
```

Ej.: contenedor 1617, 4 hijos de 392, spacing 10 → centros en x = ±610.125 y
±203.375.

## GridLayoutGroup

También se hornea. El tamaño de cada hijo lo **fija la grilla** (`m_CellSize`), no
su propio `sizeDelta`: en Cubipiezas `Card.prefab` mide 352×348 y los sprites
343×349, pero en pantalla cada carta es una celda de 344×346. Caso probado
(`m_StartCorner: 0` arriba-izquierda, `m_StartAxis: 0` horizontal,
`m_Constraint: 0` flexible, spacing 0):

```
columnas = floor((anchoContenedor + spacing.x) / (celda.x + spacing.x))
col_i = i % columnas     fila_i = floor(i / columnas)
centro_i.x = −anchoContenedor/2 + celda.x/2 + col_i·(celda.x + spacing.x)
centro_i.y =  altoContenedor/2 − celda.y/2 − fila_i·(celda.y + spacing.y)
```

Con `m_ChildAlignment: 4` (middle-center) y una grilla que no llena el contenedor,
sumar el sobrante/2 a cada eje. Ej.: contenedor 1376×692, celda 344×346 → 4×2
exactas, centros en x = ±172, ±516 e y = ±173.

---

## TextMeshPro → part `text`

La part `text` del kit ya trae auto-size. Esta tabla es el mapeo que hay que
respetar al convertir; conversión de px a cqh: **`cqh = px ÷ 10.8`** (1080 px de alto
= 100 cqh).

| TMP | Ronda |
|---|---|
| `m_fontSizeBase` / `Min` / `Max` | `fontSize` / `fontSizeMin` / `fontSizeMax` (÷10.8) |
| `m_enableAutoSizing: 1` | `autoSize: true` |
| `m_fontStyle: 1` | `bold: true` |
| `m_HorizontalAlignment: 2` | `alignH: "center"` |
| `m_VerticalAlignment: 512` | `alignV: "middle"` |
| `m_margin {x:izq, y:arriba, z:der, w:abajo}` | se **hornea en el rect** del layer de texto |

Horneado de margins: `size = rect − (izq+der, arriba+abajo)`;
`offset extra = ((izq−der)/2, (abajo−arriba)/2)`. El `m_fontSize` guardado es el
*resultado* del auto-size para el contenido de muestra — no usarlo, se re-ajusta por
contenido. La vista usa `lineHeight: "normal"` para leer las mismas métricas de
fuente que TMP (no tocar; era la causa de textos más grandes que en Unity).

Diferencias tipográficas residuales = archivo de fuente distinto entre el font asset
de TMP y el del catálogo, no un error de conversión.

---

## Patrones de escena

- **Las teclas de función de Unity (F1-F9) se mapean al numpad**, que es
  `onNavigate` en `useGameKeys` — la misma convención que ya usan Álbum y Cronos
  para saltar de ronda. Los dígitos de la fila superior quedan para el índice
  dentro de la ronda (`onNumber`). En Ronda no hay teclas de función.
- **`Shift+U` y `Shift+I` (`onInteractAll` / `onShowAnswerAll`) son de depuración**,
  no de show: revelan todo el tablero de una. Van con Shift a propósito, para que
  no se disparen por error en vivo.
- **IDs** kebab-case predecibles (`option-0-text`, `slot-1-answer`); la lógica los
  genera con helpers en un `constants.ts`. Nombres de layers en inglés (todo lo que
  el usuario no ve va en inglés).
- **Objetos que entran a pantalla**: se diseñan en su posición **oculta** (la que
  guarda el prefab, fuera de pantalla), igual que en Unity. Los `target` de
  `UIBounceMove`/`UISlide` se copian **tal cual** al `target` de las parts
  `bounce`/`slide`: son posiciones absolutas en coordenadas **locales del padre**
  (tras la conversión de anclas), no offsets, y no hay "home" implícito.
- **Frames de estado** (normal/correcto/incorrecto): en Unity son GameObjects
  hermanos que se prenden y apagan. En Ronda hay dos caminos, y conviene el segundo
  cuando aplica: (a) layers hermanos con `visible`, que `useGameState` sabe pisar con
  `setVisible` — es lo fiel a Unity; o (b) si son dos estados de una misma imagen,
  un solo layer y la lógica intercambia el `src` de la part `image`, que es menos
  layers y menos estado.
- **Mask de Unity** (Mask + `m_ShowMaskGraphic: 0`): recorta a los hijos con la
  forma del sprite. **La part `mask` ya está en el kit**: recorta el layer entero con
  la silueta del `src` de su part `image` hermana, y **sin** esa image recorta al
  rect. `showImage: false` es el equivalente de `m_ShowMaskGraphic: 0`.
- **Nivel como grupo**: el GameObject que en Unity tenía el script del nivel (p. ej.
  "Level 1") se convierte en un layer contenedor sin parts. No hace falta una part
  que guarde el estado del nivel: lo que no se dibuja vive en la lógica (`useState`),
  no en el layout.
- Objetos vacíos e inactivos sin hijos (p. ej. "Void") se omiten. También los que
  quedaron a medio hacer en Unity: el layer "Blur" de Cubipiezas era un
  `RectTransform` sin componentes (el shader nunca se integró); el efecto se hizo en
  Ronda con el `filter` de la part `image`, no con un layer.
- **Un bug de Unity no se replica a ciegas: se pregunta.** Replicar "tal cual" es
  la regla, pero un script puede tener un descuido que nadie usa a propósito. En
  Cubipiezas, `Card.ResetState()` no restauraba el texto: tras M → F → E la carta
  mostraba la respuesta en vez de la pregunta. Se corrigió después de preguntarle a
  Esteban.
- **Las teclas de Unity que caen en el mapa de Ronda** (`E`, `M`, `F`, `L`, dígitos,
  F1-F9 → numpad) se mapean 1 a 1 a los handlers de `useGameKeys`. Revisar
  `MyInputs.cs` para saber si los dígitos empiezan en 0 o en 1: en
  `GetNumberAlphanumericKey` el 0 es el índice 0, igual que `onNumber`.

---

## Animaciones

Los scripts de Unity mapean así:

| Unity | Ronda |
|---|---|
| `UIBounceMove` | part `bounce` |
| `UISlide` | part `slide` |
| pop / escala al revelar | part `pop` |
| shake al error | part `shake` |
| `UIBlinkPulse` | part `blink` (triggers `blink` + `blinkSettle`) |
| flip de cartas | part `flip` (triggers `flipHide` + `flipShow`) |
| float / sparkles | parts homónimas, ambiente (no se disparan) |
| shimmer / holo | parts con vista, overlay en CSS |

**Todas ya están en el kit** (§9 de [`migracion-games.md`](migracion-games.md)). Si
alguna vez hay que traer otra desde Games
(`../games-viewer/src/components/shared/engine/animations/useGameObjectAnimations.ts`),
**quitar la compuerta `useSceneViewMode() === "game"`** — sin eso, los triggers no se
registran nunca y el juego se ve perfecto sin animar, sin error en consola.

**Un efecto de una sola vez que no existe en el kit va como part propia del juego.**
`shimmer` corre en bucle; para el brillo que cruza la carta una vez al mostrar la
respuesta, Cubipiezas tiene `parts/glint.tsx`: una animación CSS sin `infinite` en un
layer que la lógica monta con `setVisible`. Montar el layer **es** dispararla, sin
triggers ni temporizadores.

### Un layer oculto se desmonta

`LayerView` no renderiza los hijos con `visible: false`: los desmonta. Eso tiene dos
consecuencias al animar:

- **El layer pierde su transform.** Una carta que se fue con `flipHide` (queda a 90°)
  y se oculta, vuelve a montarse a 0°, no a 90°.
- **Sus triggers se registran recién después de montarse.** Un `play()` justo
  después del `setVisible(id, true)` no encuentra nada y resuelve sin animar. Esperar
  dos `requestAnimationFrame` antes de disparar (`nextFrame` en la lógica de
  Cubipiezas).

### Lo secreto no se ve mientras se anima

Si el juego esconde algo que da puntos (la imagen de Cubipiezas, la cara de una
carta), **ninguna animación puede dejarlo ver**: un `flip` deja la carta de canto,
un `shake` la corre de su celda y un `blink` la vuelve transparente. La salida es
estructural, no cuidar cada animación: detrás de cada pieza que tapa va un **layer
opaco con su mismo rect** (en Cubipiezas, `card-<n>-slot`, una part `color`) que se
oculta **solo** junto con la pieza, cuando ya se destapó. Así lo que asoma al animar
es la ranura. De paso tapa las esquinas transparentes de los PNG. `pnpm check`
verifica que cada ranura cubra exactamente su carta y sea un color opaco.

Lo mismo al cambiar de ronda: las ranuras suben **antes** de cambiar la imagen, y el
cambio (y cualquier transición del blur) pasa detrás.

**Nada flota sobre lo secreto.** Un `float` en piezas que tapan al milímetro abre
rendijas. Para que un tablero así se vea vivo en reposo, un `shimmer` que pasa por
encima, sin mover nada.

**El ancla importa.** `bounce` y `slide` mueven la posición **local**. El layer
animado tiene que colgar de un padre que le fije el origen; si se aplana esa
jerarquía, un `target` de `{0,0}` manda el objeto al centro de la pantalla en vez de
a su sitio. Por eso un stretch pass-through **no se aplana** si es el ancla de una
animación.

---

## Funcionalidad

Misma forma que cualquier juego del catálogo (§3 y §4 de
[`migracion-games.md`](migracion-games.md)):

- `meta.ts` — nombre, descripción e ícono, **en su propio módulo**, separado de la
  ficha. `index.ts` — la ficha `GameType`. `layout.json` — los layers. `assets.ts` —
  las rutas. `session.ts` — el tipo del archivo + su type-guard. `Logic.tsx` — la
  lógica. `parts/` — las parts propias.
- **Si el colector del juego ya existe en Ronda, no hay `session.ts`**: la ficha
  valida con el `isData` de `collector/catalog/<juego>/schema.ts` y la lógica usa su
  tipo `Data`. El contrato del archivo es del colector y no se duplica (como hace el
  host). Cubipiezas es el ejemplo.
- **No hay `page.tsx` por juego**: la ruta es genérica
  (`programs/[slug]/games/[gameId]`). El `meta` se registra en `catalog/metas.ts`, el
  juego se carga con un `import()` dinámico desde `catalog/GameMount.tsx`, y el
  programa lo recibe en su lista `games` de `src/data/program-services.ts`.
- Las reglas de la lógica (estado local vs compartido, nada de `setState` en efectos,
  depender de `loadedAt`, sembrar lo aleatorio) están en §6 de
  [`migracion-games.md`](migracion-games.md). **Leerlas antes de escribir el
  `Logic.tsx`**: el linter de React rechaza los patrones que Games usaba.

### Clic y arrastre

Un juego de Unity que se opera con mouse necesita, además del cursor, algo que
capture el puntero:

- **Clic o toque** → ya está en el kit: el layer declara una part `click` sin vista y
  `useLayerClick` devuelve el `layerId` tocado (§9 de
  [`migracion-games.md`](migracion-games.md)). Lo usan Tres en Raya y De Par en Par.
- **Arrastre** → `catalog/cronos/parts/drag.tsx` (arrastre con snap a zona). Se
  localiza con `closest("[data-layer-id]")` sobre el atributo que emite `LayerView`
  y **le habla a la lógica por callback, no por store**: un store obligaría a
  reaccionar con un `setState` dentro de un efecto, que es justo lo que el linter
  rechaza.

### El cursor en pantalla completa

**Resuelto** ([[RM-081]]). Un juego que se opera con mouse declara `pointer: true` en
su ficha y `Stage` deja el cursor visible en pantalla completa; los demás lo siguen
ocultando. Aparte, la tecla **P** lo alterna en cualquier juego sin que la ficha ni la
lógica participen. **Centrarlo al mostrarlo, como hacía `CursorController` en Unity,
no es posible en web**: no hay API para posicionar el puntero.

### Sesión ZIP

> **Ya está en el kit** ([[RM-061]]). `readZipSession(file)` saca el `sessionData.json`
> y las imágenes del paquete que arma el colector, y devuelve **Blobs**: las object URL
> las crea `setSession`, que además las revoca sola al reemplazar la sesión o
> desmontar el juego. El juego las lee de `useGameSession().images`, indexadas por la
> misma ruta que guarda el JSON. La ficha declara `images: true`.

El patrón de abajo es el que se usó en Games y queda como referencia de por qué el kit
hace lo que hace:

1. `loadZipFile(file)` → leer `sessionData.json` → validar con el type-guard.
   (`loadZipFile` **ya existe** en Ronda: `src/helpers/persistence.ts`.)
2. Revocar los blob URLs de la sesión anterior.
3. Por imagen: `zip.file(path)` → `Blob` con MIME por extensión →
   `URL.createObjectURL` → `img.decode()` (pre-decodificar, sin tirones en vivo).
4. `setSession(data, fileName)` con un `dispose` que revoque los blobs.

Las imágenes de sesión son **estado**, nunca layout: llegan a pantalla por el campo
`src` de la part `image`, pisado con `patch`.

**La carga desde la nube ya está:** el `GameTopbar` baja el paquete del colector con
`downloadCollectorData` (`src/data/collector-storage.ts`), que devuelve un `File` —
el mismo tipo que da el input de archivo —, así que el `load` de la ficha no cambia.

---

### Configuración y teclas de depuración

- **Un valor que hay que calibrar a ojo va al panel de configuración**, no a una
  constante que obligue a un deploy por cada prueba. La ficha lo declara y
  `GameConfig` pinta el control; la lógica lee el mismo `useGameSetting`. Hoy hay:
  croma (`chromaLayerId`), cronómetro (`timerLayerId`), blur máximo (`blurMax`) y
  colores de layers (`colors`: clave, etiqueta y los layers cuya part `color` pinta).
  Cubipiezas usa los dos últimos para el blur y el color de las ranuras.
- **`Shift+M` (`onRevealAll`) revela todo de golpe** — es de show: el concursante
  adivinó y se destapa el resto.
- **`Shift+K` (`onPeek`) es de depuración**: deja ver lo de abajo sin tocar el
  estado, y al apagarlo todo vuelve como estaba. En Cubipiezas sirve para calibrar
  el blur con el director de cámaras.

---

## Assets: se copian tal cual

Las gráficas de Unity se copian **sin recomprimir** a
`public/programs/<programa>/games/<juego>/`, con nombres en inglés
(`card-1.png` → `card-pink.png`). Aunque un fondo pese 1,6 MB:

- Antes de salir al aire el juego decodifica todo a píxeles en RAM, y ahí un
  1920×1080 ocupa ~8 MB sea PNG, WebP o AVIF. El formato solo cambia la descarga,
  que el CDN de Vercel sirve una vez y cachea.
- La compresión con pérdida mete banding en los degradados, que solo se ve en el
  monitor de emisión — el mismo motivo por el que el video va en CRF 18.
- Las piezas con transparencia (cartas, máscaras) tienen que seguir en PNG.

Una pasada sin pérdida, si algún día hace falta, se hace para todo el repo y no por
juego.

---

## Gotchas conocidos

- **Recargar la sesión con el mismo nombre de archivo** no dispara nada si dependés
  de `fileName`. Depender siempre de `loadedAt`.
- **El `m_fontSize` del prefab es resultado del auto-size**, no la fuente base.
- **Prefabs con `m_IsActive: 0`** guardan la posición *oculta*: eso es el diseño
  correcto, no un error a corregir.
- Todo lo que se dibuja dentro del Stage se mide en `cqw`/`cqh`/`cqi`, **nunca** en
  `vw`/`rem`/`px`.
