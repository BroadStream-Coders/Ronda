# Migración Unity → Ronda

Guía operativa para replicar en Ronda un juego que existe en **Unity**
(`../TvPeru-QGEM-ManagedGames`).

> **Antes de empezar: ¿el juego ya existe en Games?** Si sí, **no uses esta guía** —
> el trabajo pesado (conversión de prefab, horneado de layouts, conversión de texto)
> ya está hecho ahí. Usá [`migracion-games.md`](migracion-games.md), que es un
> renombrado mecánico. Esta guía es para juegos que **solo** existen en Unity.

> **Contexto clave:** Ronda *reemplaza* a Unity. Los prefabs son insumo de una sola
> dirección — después de la migración, cualquier ajuste (posición, cronómetro,
> color) se hace acá, nunca en Unity. Por eso los prefabs **no se commitean**:
> Esteban los sube a `docs/referencia/unity/<juego>/`, se hace la conversión, y él
> los borra cuando termina.

Leé también §2 de [`migracion-games.md`](migracion-games.md): el vocabulario de Ronda
no es el de Unity y no se vuelve atrás. Acá **no hay editor, ni inspector, ni
jerarquía, ni modo play**. Son juegos en navegador.

---

## Flujo por juego

1. Esteban sube a `docs/referencia/unity/<juego>/` el `.prefab` + los `.meta` de las
   imágenes (solo el `.meta` hace falta: da el GUID para mapear sprites; los PNG
   salen de `Assets/_Project/Games/<Juego>/Graphics/`).
2. Convertir el prefab a `layout.json` (secciones siguientes). Generarlo con un
   script Node desechable en el scratchpad (`JSON.stringify(layout, null, 2)`), no a
   mano: los juegos tienen ~30 layers repetitivos.
3. Traer los assets según §5 de [`migracion-games.md`](migracion-games.md).
   **Preguntar siempre de dónde salen**: si el juego también pasó por Games, los
   originales están en el bucket de Games y los de Unity pueden estar viejos.
4. **Preguntar siempre por el fondo.** El prefab casi nunca lo trae: en Unity el
   fondo lo ponía el switcher, no el juego. Hay dos caminos y **no se adivina** —
   croma (la ficha declara `chromaLayerId` y aparece el panel de color) o video
   propio (`shared/video/`, y entonces la ficha **no** declara croma).
5. Validar con `pnpm build` (**nunca** `pnpm dev`) y esperar el visto bueno visual de
   Esteban comparando contra Unity.
6. Cablear la funcionalidad: `Logic.tsx` + carga de sesión.

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
- Objetos vacíos e inactivos sin hijos (p. ej. "Void") se omiten.

---

## Animaciones

Los scripts de Unity mapean así:

| Unity | Ronda | ¿Está en el kit? |
|---|---|---|
| `UIBounceMove` | part `bounce` | sí |
| `UISlide` | part `slide` | sí |
| pop / escala al revelar | part `pop` | sí |
| shake al error | part `shake` | sí |
| `UIBlinkPulse` | part `blink` (triggers `blink` + `blinkSettle`) | no |
| flip de cartas | part `flip` (triggers `flipHide` + `flipShow`) | no |
| float / shimmer / holo / sparkles | parts homónimas | no |

Las que faltan se portan desde
`../TvPeru-QGEM-Games/src/components/shared/engine/animations/useGameObjectAnimations.ts`
**quitando la compuerta `useSceneViewMode() === "game"`** — sin ella, los triggers no
se registran nunca y el juego se ve perfecto sin animar, sin error en consola.

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
- **No hay `page.tsx` por juego**: la ruta es genérica
  (`programs/[slug]/games/[gameId]`). El `meta` se registra en `catalog/metas.ts` y
  el juego se carga con un `import()` dinámico desde `catalog/GameMount.tsx`.
- Las reglas de la lógica (estado local vs compartido, nada de `setState` en efectos,
  depender de `loadedAt`, sembrar lo aleatorio) están en §6 de
  [`migracion-games.md`](migracion-games.md). **Leerlas antes de escribir el
  `Logic.tsx`**: el linter de React rechaza los patrones que Games usaba.

### Clic y arrastre

Un juego de Unity que se opera con mouse necesita, además del cursor, una part que
capture el puntero. Ya hay dos escritas de las que copiar:
`catalog/tres-en-raya/parts/click.tsx` (avisa qué layer se clicó) y
`catalog/cronos/parts/drag.tsx` (arrastre con snap a zona). Las dos se localizan con
`closest("[data-layer-id]")` sobre el atributo que emite `LayerView`, y **le hablan a
la lógica por callback, no por store**: un store obligaría a reaccionar con un
`setState` dentro de un efecto, que es justo lo que el linter rechaza.

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

**Atajo que conviene evaluar antes:** en Ronda el colector y el juego comparten app y
bucket, así que `downloadCollectorData(programId, collectorId, "zip")`
(`src/data/collector-storage.ts`) devuelve un `File` ya armado — el mismo tipo que da
el input de archivo. La carga desde la nube engancha sin rediseñar nada.

---

## Gotchas conocidos

- **Recargar la sesión con el mismo nombre de archivo** no dispara nada si dependés
  de `fileName`. Depender siempre de `loadedAt`.
- **El `m_fontSize` del prefab es resultado del auto-size**, no la fuente base.
- **Prefabs con `m_IsActive: 0`** guardan la posición *oculta*: eso es el diseño
  correcto, no un error a corregir.
- Todo lo que se dibuja dentro del Stage se mide en `cqw`/`cqh`/`cqi`, **nunca** en
  `vw`/`rem`/`px`.
