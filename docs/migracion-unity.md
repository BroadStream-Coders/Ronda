# Migración Unity → Ronda

Guía operativa para replicar en Ronda un juego que existe en **Unity**
(`../TvPeru-QGEM-ManagedGames`). Adaptada de la guía equivalente del proyecto Games,
donde el proceso se probó con Cálculo Mental, Intruso, La Sabes o No, Al Vuelo,
Álbum, Mi Libro Favorito y Busca Logo.

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
4. Validar con `pnpm build` (**nunca** `pnpm dev`) y esperar el visto bueno visual de
   Esteban comparando contra Unity.
5. Cablear la funcionalidad: `Logic.tsx` + carga de sesión.
6. Logbook: avance en RM-038, deuda nueva en `technical-debt.md`.

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
  ruta en `public/games/<juego>/`.

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

Unity lo resuelve en runtime; acá se hornea. Caso usado en Intruso
(`ChildControlWidth: 0`, `ChildForceExpandWidth: 1`, padding 0):

```
sobrante = anchoContenedor − (Σ anchosHijos + spacing·(n−1))
celda    = anchoHijo + sobrante/n
offsetEnCelda = (celda − anchoHijo) · 0.5        (alignment middle-center)
izquierda_i   = i·(celda + spacing) + offsetEnCelda
centro_i (rel. al centro del padre) = izquierda_i + anchoHijo/2 − anchoContenedor/2
```

Ej. Intruso: contenedor 1617, 4 hijos de 392, spacing 10 → centros en
x = ±610.125 y ±203.375.

---

## TextMeshPro → part `text`

> ⚠️ **La part `text` todavía no existe en el kit de Ronda.** El primer juego con
> texto libre tiene que crearla en `kit/parts/text.tsx`, portándola desde
> `../TvPeru-QGEM-Games/src/components/shared/engine/components/text/` **sin su
> Inspector**. Esta tabla es el mapeo que esa part tiene que respetar.

Conversión de px a cqh: **`cqh = px ÷ 10.8`** (1080 px de alto = 100 cqh).

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
contenido. La vista tiene que usar `lineHeight: "normal"` para leer las mismas
métricas de fuente que TMP (no tocar; era la causa de textos más grandes que en
Unity).

Diferencias tipográficas residuales = archivo de fuente distinto entre el font asset
de TMP y el woff2 del catálogo, no un error de conversión.

---

## Patrones de escena

- **IDs** kebab-case predecibles (`option-0-text`, `slot-1-answer`); la lógica los
  genera con helpers en un `constants.ts`. Nombres de layers en inglés (todo lo que
  el usuario no ve va en inglés).
- **Objetos que entran a pantalla**: se diseñan en su posición **oculta** (la que
  guarda el prefab, fuera de pantalla), igual que en Unity. Los `target` de
  `UIBounceMove`/`UISlide` se copian **tal cual** al `target` de las parts
  `bounce`/`slide`: son posiciones absolutas en coordenadas **locales del padre**
  (tras la conversión de anclas), no offsets, y no hay "home" implícito.
- **Frames de estado** (normal/correcto/incorrecto): en Unity son GameObjects
  hermanos que se prenden y apagan.
  > ⚠️ **`useGameState` todavía no soporta pisar `visible`.** Hoy solo pisa parts y
  > posición. Para el primer juego con frames de estado hay dos caminos: (a) agregar
  > el override de `visible` a `LayerOverride` y `applyState` — son pocas líneas y es
  > lo fiel a Unity; o (b) si son dos estados de una misma imagen, intercambiar el
  > `src` de la part `image`, que es lo que hace Deletreo con el marco normal↔error y
  > no necesitó nada nuevo.
- **Mask de Unity** (Mask + `m_ShowMaskGraphic: 0`): en Games es la part nativa
  `mask` + una `image` con el sprite en el **mismo** layer, `showImage: false`.
  **Tampoco existe todavía en Ronda**; la trae el primer juego que la necesite
  (Intruso). Si la Image de Unity no tiene sprite, alcanza con recortar al rect
  (`overflow: hidden`).
- **Nivel como grupo**: el GameObject que en Unity tenía el script del nivel (p. ej.
  "Level 1") se convierte en un layer contenedor sin parts. En Games llevaba una part
  `controller` con el estado del juego; **en Ronda eso no hace falta** — el estado que
  no se dibuja vive en la lógica (`useState`), no en el layout.
- Objetos vacíos e inactivos sin hijos (p. ej. "Void") se omiten.

---

## Animaciones

Los scripts de Unity mapean así:

| Unity | Ronda | ¿Existe ya? |
|---|---|---|
| `UIBounceMove` | part `bounce` | ✅ |
| `UISlide` | part `slide` | ✅ |
| pop / escala al revelar | part `pop` | ✅ |
| shake al error | part `shake` | ✅ |
| `UIBlinkPulse` | part `blink` (triggers `blink` + `blinkSettle`) | ❌ |
| flip de cartas | part `flip` (triggers `flipHide` + `flipShow`) | ❌ |
| float / shimmer / holo / sparkles | parts homónimas | ❌ |

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

Espejo de `src/game/catalog/deletreo/`:

- `layout.json` — los layers. `assets.ts` — las rutas. `session.ts` — el tipo del
  JSON + su type-guard. `Logic.tsx` — la lógica. `parts/` — las parts propias.
  `index.ts` — la ficha `GameType`.
- **No hay `page.tsx` por juego**: la ruta es genérica
  (`programs/[slug]/games/[gameId]`) y monta el juego desde el registro.
- Las reglas de la lógica (estado local vs compartido, nada de `setState` en efectos,
  depender de `loadedAt`) están en §6 de
  [`migracion-games.md`](migracion-games.md). **Leerlas antes de escribir el
  `Logic.tsx`**: el linter de React rechaza los patrones que Games usaba.

### Sesión ZIP

> ⚠️ **Todavía no existe en Ronda.** `useGameSession` guarda un JSON y no maneja el
> ciclo de vida de blobs. El primer juego con imágenes de sesión (Álbum, Cronos,
> Intruso, De Par en Par, Galería de Fotos) tiene que agregarle un `dispose`.

El patrón probado en Games, para cuando toque:

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
  de `fileName`. Depender siempre de `loadedAt` (era TD-060 en Games; en Ronda,
  Deletreo ya lo hace bien).
- **El `m_fontSize` del prefab es resultado del auto-size**, no la fuente base.
- **Prefabs con `m_IsActive: 0`** guardan la posición *oculta*: eso es el diseño
  correcto, no un error a corregir.
- Todo lo que se dibuja dentro del Stage se mide en `cqw`/`cqh`/`cqi`, **nunca** en
  `vw`/`rem`/`px`.

---

## Estado

Ningún juego se migró todavía **directo desde Unity a Ronda**: Deletreo entró vía
Games. Los que ya pasaron por Games (cálculo mental, intruso, la sabes o no, al
vuelo, álbum, mi libro favorito, busca logo, cronos) conviene traerlos con
[`migracion-games.md`](migracion-games.md), no con esta guía.

Esta guía aplica a los juegos que tienen colector en Ronda pero **no existen en
Games**: `de-par-en-par`, `reto-cruzado`, `galeria-fotos`, `tres-en-raya` — y a los
niveles que en Games quedaron fuera de alcance (Intruso Nivel 2, Busca Logo Niveles 1
y 3).
