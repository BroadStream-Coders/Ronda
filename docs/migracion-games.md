# Migración QGEM Games → Ronda

Guía operativa para traer a Ronda un juego que ya corre en el proyecto
**TvPeru-QGEM-Games** (repo hermano, `../TvPeru-QGEM-Games`).

Para juegos que **solo existen en Unity** y nunca pasaron por Games, la guía es
[`migracion-unity.md`](migracion-unity.md). Las dos comparten el destino: un
`layout.json` de layers y una lógica.

---

## 1. La decisión que gobierna todo: solo el runtime

Games es un **mini-editor estilo Unity**: paneles acoplables (dockview), jerarquía,
inspector, gestos de arrastre, undo, modo play. Ronda **no trae nada de eso**.

El editor no se borra: **queda en Games como herramienta de autoría**. Se abre para
componer una escena, se exporta, y el artefacto que cruza a Ronda es el JSON. Ronda
no sabe de dónde salió ese archivo — puede haberlo generado el editor, un script, o
Unity — y eso es precisamente la ventaja de que el layout sea data y no código.

Lo que **no** cruza nunca: `EditorLayout`, dockview, `Hierarchy`, todos los
`*Inspector.tsx`, `SchemaInspector`, `useSceneEditor`, `use-play-mode`,
`use-editor-store`, `ViewModeTabs`, `SceneViewMode`, `SceneCanvas`, `AssetBrowser`,
undo/redo. Con eso se caen 5 dependencias (`dockview-react`, `react-moveable`,
`react-selecto`, `react-infinite-viewer`, `zundo`).

Todo el sistema de juegos de Ronda agrega **una sola dependencia**: `motion`.

---

## 2. Vocabulario — no se vuelve atrás

Esto no es cosmético: los nombres *son* el modelo mental. Si el código dice
`GameObject` y `components[]`, en tres semanas alguien pregunta dónde está el
Inspector. Esto son **juegos en navegador**, no un motor.

| Games (Unity) | Ronda |
|---|---|
| `GameObject` | `Layer` |
| `components[]` | `parts[]` |
| `transform` / `RectTransform` | `rect` |
| `Scene` (el lienzo) | `Stage` |
| `behavior` | `logic` |
| `useSceneRuntime` | `useGameState` |
| `mergeRuntime(design, runtime)` | `applyState(layout, state)` |
| `scene.json` | `layout.json` |
| `GameDefinition` | `GameType` (la ficha) |
| `componentRegistry` | `PartRegistry` (`type → view`, nada más) |

El modelo en una frase: **un layout de layers; cada layer tiene un rect y unas
parts**. La lógica escribe en `useGameState` y `applyState` fusiona ese estado sobre
el layout al renderizar. **El layout nunca se muta.**

---

## 3. Estructura

Espeja `src/collector/`: el sistema en `kit/`, las implementaciones en `catalog/`.

```
src/game/
├── kit/                                 # el sistema, compartido
│   ├── Stage.tsx                        #   lienzo 16:9 + fullscreen
│   ├── GameShell.tsx                    #   providers + topbar + stage + panel
│   ├── GameTopbar.tsx                   #   carga de archivo
│   ├── GameConfig.tsx                   #   panel plegable de configuración
│   ├── LayerView.tsx                    #   render recursivo del árbol
│   ├── layer.ts                         #   modelo + layerStyle + partOf/findPart
│   ├── registry.ts / part-context.tsx   #   type → view (+ su contexto)
│   ├── font-context.tsx                 #   clave → fuente que declara la ficha
│   ├── state.ts                         #   applyState + useGameState
│   ├── session.ts                       #   useGameSession
│   ├── game.ts                          #   el contrato GameType
│   ├── media.ts                         #   playSound + preloadMedia
│   ├── shuffle.ts                       #   shuffledOrder: permutación sembrada
│   ├── use-game-keys.ts                 #   mapa de teclas
│   ├── use-game-setting.ts              #   preferencias en localStorage
│   ├── parts/                           #   parts nativas (ver §9)
│   └── animations/                      #   context + parts + use-layer-animations
└── catalog/
    ├── metas.ts                         #   id → GameMeta (plano, sin la ficha)
    ├── assignments.ts                   #   qué juegos ve cada programa
    ├── GameMount.tsx                    #   puente servidor → cliente + import() por juego
    └── <juego>/
        ├── meta.ts                      #   nombre, descripción, ícono
        ├── index.ts                     #   la ficha
        ├── layout.json                  #   los layers
        ├── assets.ts                    #   rutas de imágenes y sonidos
        ├── session.ts                   #   tipo + type-guard del JSON
        ├── Logic.tsx                    #   la lógica de show
        └── parts/                       #   parts propias del juego
```

La ficha que declara un juego (`kit/game.ts`):

```ts
interface GameType {
  meta: GameMeta                           // espeja CollectorMeta
  layout: Layer[]                          // el layout.json importado
  parts?: PartRegistry                     // las parts propias del juego
  fonts?: FontRegistry                     // clave → fuente, para la part `text`
  logic?: ComponentType                    // la lógica (devuelve null)
  chromaLayerId?: string                   // qué layer lleva el croma
  preload?: string[]                       // assets a calentar al montar
  load: (file: File) => Promise<void>      // parsea, valida y hace setSession
}
```

`chromaLayerId` es **opcional a propósito**: un juego que se emite con fondo propio
(la part `backdrop`) no lo declara, y entonces no aparece el panel de color.

---

## 4. Procedimiento por juego

1. **Leer el juego en Games**: `src/app/workspaces/<juego>/` — `scene.json`,
   `<Juego>Behavior.tsx`, `assets.ts`, `constants.ts`, `components/`.
2. **Convertir `scene.json` → `layout.json`.** Es un renombrado mecánico de campos
   (`transform`→`rect`, `components`→`parts`, `active`→`visible`). Con juegos de
   muchos layers, hacerlo con un script Node desechable en el scratchpad, no a mano.
3. **Traer los assets** (§5) y ajustar las rutas del layout.
4. **Traer las parts propias** del juego a `catalog/<juego>/parts/`, **sin sus
   Inspectors**. Una part es `{ modelo, vista }`; si no dibuja, no lleva vista.
   Si la part sirve a más de un juego, va al `kit/` y no a la carpeta del juego.
5. **Portar el behavior → `Logic.tsx`** (§6).
6. **Registrar y asignar**: el `meta` en `catalog/metas.ts`, el `import()` del juego
   en `catalog/GameMount.tsx`, y el programa en `catalog/assignments.ts`.
   **El meta va en su propio módulo** (`<juego>/meta.ts`), separado de la ficha: la
   barra lateral y la lista solo importan metas, y meterlo en `index.ts` arrastraría
   el `layout.json` y las fuentes de todos los juegos a todas las rutas del
   workspace.
7. **Validar**: `pnpm build` (nunca `pnpm dev` — el servidor lo levanta Esteban),
   `pnpm lint`, `pnpm check`. Extender `scripts/check-game.ts` con lo que el juego
   nuevo pueda romper en silencio: rutas de assets que no existen, parts que la
   lógica pisa y el layout no tiene, jerarquías que las animaciones necesitan.

---

## 5. Assets — la regla dura

**Assets de juego = código. Datos de sesión = archivo o storage.** Marcos, fuentes y
sonidos son parte del juego: cambian con un deploy. Lo que produce el colector cambia
cada día. Son dos cosas y van a dos lugares.

**Y todo se agrupa por programa, no por juego.** Nada de un programa es alcanzable
desde otro: si dos programas usan el mismo archivo, **se duplica a propósito**. Es lo
que permite borrar todo lo de un programa sin tocar a los demás.

- **Imágenes, audio y video** → `public/programs/<programa>/games/<juego>/`, y lo que
  comparten varios juegos **del mismo programa** en `public/programs/<programa>/shared/`,
  separado por medio (`shared/audio/`, `shared/video/`). Los sirve el CDN de Vercel sin
  configurar nada. **Nunca a Supabase Storage** — ese bucket es para el colector.
- **El video va en H.264/`.mp4`**, no en VP9 ni AV1: la receta y el porqué están en
  `CLAUDE.md`. Resumen: se emite en vivo desde una máquina que puede cambiar, así que
  manda la decodificación por hardware garantizada, no el tamaño del archivo.
- **Fuentes** → `src/programs/<programa>/fonts/`, un módulo por tipografía. Van en
  `src/` y no en `public/` porque `next/font` necesita importarlas, y a cambio emite
  el `<link rel="preload">` y el hash solo. Una tipografía que usen dos programas se
  copia en los dos: son ~40 KB en el repo y cero en runtime, porque `next/font/local`
  hashea por módulo y ningún programa carga la página del otro.
- **Un módulo por tipografía, nunca un barril con todas.** `next/font` atribuye la
  fuente por **grafo de módulos**, no por uso real: un barril que instancie varias
  las precarga todas en cualquier ruta que lo toque.
- **Los originales salen del bucket de Games, no de Unity.** Un juego que pasó por
  Games trae sus gráficas ahí, en las rutas que ya declara su `assets.ts`:

  ```
  https://spvkliavubwmkvjtpvod.supabase.co/storage/v1/object/public/assets/<path>
  ```

  El repo de Games no las versiona (su `public/` solo tiene el favicon), así que se
  bajan del bucket. **Unity puede tener una versión vieja de la misma gráfica** y no
  hay forma de notarlo mirando los nombres: en Cronos, `block.png` y `frame.png` eran
  446×310 apaisados contra un layer 304×313 vertical, y las letras 146×166 contra un
  `letter` de 116×32. Las del bucket cuadran píxel a píxel con el rect de su layer —
  **esa es la comprobación**: si el aspecto del archivo no coincide con el del layer,
  la gráfica no es la que el juego usa.

  Los **sonidos y las tipografías** están en el mismo bucket (`shared/audio/`,
  `shared/fonts/`); los originales de las fuentes también en
  `../TvPeru-QGEM-ManagedGames/Assets/_Project/MediaLibrary/Fonts/Originals/`.
- **Antes de convertir un TTF, mirar si la tipografía es de Google.** Si lo es, va
  con `next/font/google` y no hay nada que convertir ni ningún binario que entre al
  repo: Next la descarga en el build, la autohospeda en woff2, la subseteliza y
  emite el preload igual que con `local`. El módulo por tipografía se mantiene; lo
  único que cambia es de dónde sale el archivo.
- **Convertir TTF a woff2** — solo para las que no están en Google:
  `pnpm dlx ttf2woff2 < fuente.ttf > fuente.woff2` (lee stdin, no acepta `--help`).
  Ahorra ~70%. Verificar la firma del resultado: los primeros 4 bytes deben ser
  `wOF2`.
- Todo lo que la lógica intercambia en vivo (marco normal↔error) va en `preload`,
  o la primera vez que aparece parpadea **al aire**.

---

## 6. La lógica (`Logic.tsx`)

Devuelve `null` y opera por hooks. Reglas:

- **Al estado compartido va solo lo que se dibuja.** Índices de ronda, contadores y
  banderas viven en estado local de React. `useGameState` es para lo que una part
  tiene que mostrar.
- **Nunca `setState` dentro de un `useEffect`** — el linter de React lo rechaza y
  tiene razón. Para "resetear cuando cambia la sesión", ajustar el estado **durante
  el render** comparando contra `loadedAt`:

  ```tsx
  const [cursor, setCursor] = useState(START);
  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });
  ```

  Los reset que dependen de una acción van **en el handler**, no en un efecto.
- **Depender de `loadedAt`, nunca de `fileName`**: recargar el mismo archivo tiene
  que reiniciar el juego.
- Los efectos que quedan solo **escriben al store** (`patch`, `setPosition`,
  `setVisible`), que es para lo que sirven.
- Sonidos y animaciones se disparan **en los handlers de tecla**, no en efectos.
- **Lo aleatorio se siembra.** Para barajar (opciones, fichas, posiciones) usar
  `shuffledOrder(count, seed)` con una semilla derivada de los índices de la ronda,
  no `Math.random()`: si no, la baraja cambia en cada render y el resultado puede
  salir ya ordenado.

Teclas convenidas (`use-game-keys.ts`): `0-9` índice directo (Shift +10, Alt +20),
numpad `0-9` → `onNavigate`, `N`/`B` siguiente/anterior, `Q/W/E/R` → `onOption(0-3)`,
`V` → `onValidate`, `M` → `onShowAnswer`, `F` → `onMarkError`, `E` → `onInteract`,
`C` → `onClear`, flechas, y el bloque Ins/Home/PgUp/Supr/Fin/PgDn.

---

## 7. Animaciones

Son **parts sin vista**: el layer las declara como data y no dibujan nada.
`useLayerAnimations` las lee del propio layer, registra un trigger por
`(layerId, tipo)` y la lógica las dispara con `play(layerId, "pop")`. Para animar
varios layers en cascada hay `playStagger(ids, tipo, stepMs)`.

**`bounce` y `slide` mueven la posición LOCAL**, relativa al padre. Los `target` se
copian tal cual desde Games/Unity: son posiciones absolutas en coordenadas del padre,
no offsets, y no hay "home" implícito. Por eso el layer animado **cuelga de un ancla**
que le fija el origen; aplanar esa jerarquía manda el objeto al centro de la pantalla.

**Techo conocido:** `bounce` y `slide` escriben la posición en `useGameState` en cada
frame, así que hay un re-render de React por frame. Con pocos layers no se nota (y en
Games era igual), pero hay juegos con cientos de layers — Busca Logo pasa de 200. Si
ahí se arrastra, la salida es animar el transform del DOM en vez de la posición del
estado.

---

## 8. Trampas que ya costaron caro — leer antes de portar

- **La compuerta del viewMode.** En Games, `useGameObjectAnimations` registra sus
  triggers solo si `useSceneViewMode() === "game"`; existía para que el panel Scene
  del editor no pisara al panel Game. En Ronda no hay viewMode: **hay que quitarla**.
  Copiada tal cual, no se registra nada — el juego se ve perfecto y no anima jamás,
  sin un error en consola. Aplica a cada animación que se traiga.
- **`"use client"` y el grafo del servidor.** Una función llamada en el ámbito de
  módulo (como `partView`) no puede vivir en un archivo `"use client"`: la ruta
  servidor que arma la lista de juegos lo evalúa y el build falla. Los tipos y las
  funciones puras van en un módulo normal; el contexto de React, en uno cliente.
- **Escribir un ref durante el render** está prohibido por el linter (Games lo hace
  en `useGameObjectAnimations`). Pasarlo a un efecto sin deps, como ya hace
  `useGameKeys` con sus handlers.
- **Un input controlado de texto no se puede escribir** si el valor solo se comitea
  cuando es válido (un hex a medio teclear se revierte). Usar no controlado con
  `key={valor}`.
- **El juego se carga con `import()` dinámico**, así que entre el clic y el primer
  render hay un hueco sin nada en pantalla. Si el juego que estás portando pesa
  (layouts grandes, muchos assets), el hueco se nota.
- **El Stage es un container-query context.** Todo lo que se dibuja adentro se mide
  en `cqw`/`cqh`/`cqi`, **nunca** en `vw`/`rem`/`px`. Es lo único que hace que la
  vista en ventana y en pantalla completa sean idénticas.

---

## 9. Qué tiene el kit y qué no

**Ya está, no lo reconstruyas:**

| Pieza | Qué cubre |
|---|---|
| Parts `color`, `image`, `text`, `backdrop`, `video` | `image` soporta `flipX` (espeja con `scaleX(-1)`, para el asset que se reusa dado vuelta) y `filter` (cualquier filtro CSS: `grayscale(1)`, `brightness(48%)`, para el mismo asset en otro estado); `text` trae auto-size; `backdrop` es un fondo propio (degradado + halos) para juegos que no salen sobre croma; `video` se reproduce solo, en bucle y mudo |
| Part `mask` | modificador a nivel de layer: recorta el layer entero (parts y descendientes) con la silueta del `src` de su part `image` hermana — y **sin** esa image recorta al rect, que es como se tapa lo que entra deslizándose desde fuera de una caja |
| Animaciones por trigger: `pop`, `shake`, `bounce`, `slide`, `blink`, `flip` | más `play` y `playStagger` para dispararlas. `blink` registra dos triggers: `blink` (pulso + parpadeos) y `blinkSettle` (el golpecito de después del cambio); `flip` registra `flipHide` (0→90°) y `flipShow` (90°→0), y la lógica cambia de cara entre los dos |
| Animaciones **ambiente**: `float`, `sparkles` | no se disparan: arrancan al montar y se limpian al desmontar, así que **no llaman a `register`**. `float` va en bucle infinito y desincroniza con `phase`; `sparkles` se prende y apaga por `enabled`, que la lógica escribe con `patch` — el efecto se reinicia solo porque `applyState` devuelve una part nueva |
| Parts `holo` y `shimmer` | **no son animaciones**: son parts con vista que dibujan un overlay en CSS. `holo` se apaga con `enabled`; `shimmer` genera su `@keyframes` porque los porcentajes dependen de `sweep`/`period` |
| `useGameState` | pisa parts, `position` y `visible` |
| `shuffledOrder` | permutación sembrada y determinista |
| Fuentes | `FontRegistry` en la ficha; `next/font` local o de Google |
| `playSound` / `preloadMedia` | `preloadMedia` es **bloqueante**: devuelve una promesa que resuelve con todo decodificado (`decode()` para imágenes, `canplaythrough` para audio y video) y `GameShell` no monta la lógica hasta entonces. Declarar un asset en `preload` es lo que lo mete en esa espera |
| Sesión **ZIP** | `readZipSession(file)` saca el `sessionData.json` y las imágenes del paquete que arma el colector. Devuelve **Blobs**, no URLs: las object URL las crea `setSession` y las revoca sola al reemplazar la sesión o desmontar el juego, así que un paquete que no pase el type-guard no deja nada colgando. El juego las lee de `useGameSession().images`, indexadas por la **misma ruta** que guarda el JSON (`images/T1.png`) |
| `Stage` | 16:9, fullscreen, container-query |
| `GameConfig` | panel plegable; hoy solo el color del croma |
| `useGameKeys` / `useGameSetting` | teclas de show; preferencias en localStorage. El mapa distingue Shift para las acciones en masa (`Shift+U` → `onInteractAll`, `Shift+I` → `onShowAnswerAll`), que es el seguro contra el dedo gordo en vivo |

**Todavía no está.** Cada pieza entra con el primer juego que la pida, pero **se
escribe en `kit/`, no en la carpeta del juego**:

| Falta | Lo necesita |
|---|---|
| Part `videoControl` | pausar o reanudar un video desde la lógica |
| Presupuesto de memoria | diagnóstico; puede no volver nunca |
| Carga desde la nube | engancha sin rediseño: `downloadCollectorData` devuelve un `File`, igual que el input de archivo |
| Texto con formato (superíndices, fracciones) | notación matemática real; hoy la part `text` es una cadena plana |
| Cursor visible en pantalla completa | hoy se oculta siempre; los juegos que se operan con mouse lo necesitan |

---

## 10. Qué guía usar

- **El juego existe en Games** → esta guía. Es el camino corto: la conversión del
  prefab, el horneado de los layouts y la conversión de texto ya están hechas del
  otro lado.
- **El juego solo existe en Unity** → [`migracion-unity.md`](migracion-unity.md).
- **El juego no existe en ninguno de los dos** → no es una migración: es un juego
  nuevo. Igual se construye sobre el mismo kit y con las mismas reglas de §5 a §9.

**Los nombres alinean:** cada juego usa el colector con **su mismo slug**. Hubo una
excepción —el colector `si-o-no` alimentando al juego **Al Vuelo**— y se cerró
renombrándolo a `al-vuelo`, con migración de las rutas del bucket. Si alguna vez
vuelve a aparecer un par desalineado, se resuelve con un campo en `GameType`, no con
un caso especial escrito a mano en el juego.
