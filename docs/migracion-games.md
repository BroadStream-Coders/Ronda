# Migración QGEM Games → Ronda

Guía operativa para traer a Ronda los juegos que ya corren en el proyecto
**TvPeru-QGEM-Games** (repo hermano, `../TvPeru-QGEM-Games`). Documenta el proceso
probado con **Deletreo**, el primer juego portado completo.

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
│   ├── state.ts                         #   applyState + useGameState
│   ├── session.ts                       #   useGameSession
│   ├── game.ts                          #   el contrato GameType
│   ├── media.ts                         #   playSound + preloadMedia
│   ├── use-game-keys.ts                 #   mapa de teclas
│   ├── use-game-setting.ts              #   preferencias en localStorage
│   ├── parts/                           #   parts nativas: color, image
│   └── animations/                      #   context + parts + use-layer-animations
├── fonts/                               # tipografías COMPARTIDAS, woff2
│   └── genius-techno.ts + .woff2        #   un módulo por tipografía
└── catalog/
    ├── registry.ts                      #   id → GameType
    ├── assignments.ts                   #   qué juegos ve cada programa
    ├── GameMount.tsx                    #   puente servidor → cliente
    └── deletreo/                        #   ← el juego de referencia
        ├── index.ts                     #   la ficha
        ├── layout.json                  #   los layers
        ├── assets.ts                    #   rutas de imágenes y sonidos
        ├── session.ts                   #   tipo + type-guard del JSON
        ├── Logic.tsx                    #   la lógica de show
        └── parts/spelling.tsx           #   parts propias del juego
```

La ficha que declara un juego (`kit/game.ts`):

```ts
interface GameType {
  meta: { id, name, description?, icon }   // espeja CollectorMeta
  layout: Layer[]                          // el layout.json importado
  parts?: PartRegistry                     // las parts propias del juego
  logic?: ComponentType                    // la lógica (devuelve null)
  chromaLayerId?: string                   // qué layer lleva el croma
  preload?: string[]                       // assets a calentar al montar
  load: (file: File) => Promise<void>      // parsea, valida y hace setSession
}
```

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
5. **Portar el behavior → `Logic.tsx`** (§6).
6. **Registrar y asignar**: `catalog/registry.ts` + `catalog/assignments.ts`.
7. **Validar**: `pnpm build` (nunca `pnpm dev` — lo levanta Esteban), `pnpm lint`,
   `pnpm check`. Extender `scripts/check-game.ts` con lo que el juego nuevo pueda
   romper en silencio.
8. **Logbook**: avance en RM-038, deuda nueva en `technical-debt.md`.

---

## 5. Assets — la regla dura

**Assets de juego = código. Datos de sesión = archivo o storage.** Marcos, fuentes y
sonidos son parte del juego: cambian con un deploy. Lo que produce el colector cambia
cada día. Son dos cosas y van a dos lugares.

- **Imágenes y audio** → `public/games/<juego>/` y `public/games/shared/`. Los sirve
  el CDN de Vercel sin configurar nada. **Nunca a Supabase Storage** — ese bucket es
  para el colector.
- **Fuentes** → `src/game/fonts/`, **compartidas**, un módulo por tipografía, en
  **woff2**. Van en `src/` y no en `public/` porque `next/font/local` necesita
  importarlas, y a cambio emite el `<link rel="preload">` y el hash solo.
  **Nunca una copia por juego**: son 4 tipografías para 9 juegos y GeniusTechno sola
  va en 7.
- **Los originales están en el proyecto Unity**, no en el repo de Games:
  `../TvPeru-QGEM-ManagedGames/Assets/_Project/` — `Games/<Juego>/Graphics/`,
  `MediaLibrary/Sounds/`, `MediaLibrary/Fonts/Originals/`. Games los servía desde un
  bucket público de Supabase; esa vía queda retirada.
- **Convertir TTF a woff2**: `pnpm dlx ttf2woff2 < fuente.ttf > fuente.woff2`
  (lee stdin, no acepta `--help`). Ahorra ~70%. Verificar la firma del resultado:
  los primeros 4 bytes deben ser `wOF2`.
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
- Los efectos que quedan solo **escriben al store** (`patch`, `setPosition`), que es
  para lo que sirven.
- Sonidos y animaciones se disparan **en los handlers de tecla**, no en efectos.

Teclas convenidas (`use-game-keys.ts`): `0-9` índice directo (Shift +10, Alt +20),
numpad `0-9` → `onNavigate`, `N`/`B` siguiente/anterior, `Q/W/E/R` → `onOption(0-3)`,
`V` → `onValidate`, `M` → `onShowAnswer`, `F` → `onMarkError`, `E` → `onInteract`,
`C` → `onClear`, flechas, y el bloque Ins/Home/PgUp/Supr/Fin/PgDn.

---

## 7. Animaciones

Son **parts sin vista**: el layer las declara como data y no dibujan nada.
`useLayerAnimations` las lee del propio layer, registra un trigger por
`(layerId, tipo)` y la lógica las dispara con `play(layerId, "pop")`.

Portadas: **pop, shake, bounce, slide**. Faltan flip, float, blink, sparkles,
shimmer y holo — cada una llega con el juego que la pida.

**`bounce` y `slide` mueven la posición LOCAL**, relativa al padre. Los `target` se
copian tal cual desde Games/Unity: son posiciones absolutas en coordenadas del padre,
no offsets, y no hay "home" implícito. Por eso el layer animado **cuelga de un ancla**
que le fija el origen; aplanar esa jerarquía manda el objeto al centro de la pantalla.

**Techo conocido:** `bounce` y `slide` escriben la posición en `useGameState` en cada
frame, así que hay un re-render de React por frame. Con pocos layers no se nota (y en
Games era igual), pero Busca Logo tiene 202 layers. Si ahí se arrastra, la salida es
animar el transform del DOM en vez de la posición del estado.

---

## 8. Trampas que ya nos costaron — leer antes de portar

- **La compuerta del viewMode.** En Games, `useGameObjectAnimations` registra sus
  triggers solo si `useSceneViewMode() === "game"`; existía para que el panel Scene
  del editor no pisara al panel Game. En Ronda no hay viewMode: **hay que quitarla**.
  Copiada tal cual, no se registra nada — el juego se ve perfecto y no anima jamás,
  sin un error en consola. Aplica a las 6 animaciones que faltan.
- **`"use client"` y el grafo del servidor.** Una función llamada en el ámbito de
  módulo (como `partView`) no puede vivir en un archivo `"use client"`: la ruta
  servidor que arma la lista de juegos lo evalúa y el build falla. Los tipos y las
  funciones puras van en un módulo normal; el contexto de React, en uno cliente.
- **Escribir un ref durante el render** está prohibido por el linter (Games lo hace
  en `useGameObjectAnimations`). Pasarlo a un efecto sin deps, como ya hace
  `useGameKeys` con sus handlers.
- **`next/font` atribuye la fuente por grafo de módulos, no por uso real.** Un barril
  que instancie varias tipografías las precarga todas en cualquier ruta que lo toque.
  Por eso: **un módulo por tipografía**. (Efecto lateral conocido: la ruta que lista
  los juegos importa el catálogo entero — ver TD-021.)
- **Un input controlado de texto no se puede escribir** si el valor solo se comitea
  cuando es válido (un hex a medio teclear se revierte). Usar no controlado con
  `key={valor}`.
- **El Stage es un container-query context.** Todo lo que se dibuja adentro se mide
  en `cqw`/`cqh`/`cqi`, **nunca** en `vw`/`rem`/`px`. Es lo único que hace que la
  vista en ventana y en pantalla completa sean idénticas.

---

## 9. Lo que el kit todavía NO tiene

Antes de portar un juego, verificar si necesita algo de esto — si sí, **entra con ese
juego**:

| Falta | Lo necesita |
|---|---|
| Part `text` (con auto-size estilo TMP) | casi todos los juegos con texto libre |
| Parts `video`, `videoControl`, `mask` | mask lo usa Intruso |
| Animaciones flip, float, blink, sparkles, shimmer, holo | Busca Logo (flip), Álbum, Cronos |
| Override de `visible` en `useGameState` | juegos con frames de estado (normal/correcto/incorrecto como layers hermanos que se prenden y apagan) |
| Sesión **ZIP** + ciclo de vida de blobs (`dispose`) | Álbum, Cronos, Intruso, De Par en Par, Galería de Fotos |
| Presupuesto de memoria (`useMemoryBudget`) | diagnóstico; puede no volver nunca |
| Carga desde la nube (`downloadCollectorData`) | engancha sin rediseño: devuelve un `File`, igual que el input |
| `playStagger` (animar en cascada) | Busca Logo |

---

## 10. Estado

**Portado:** Deletreo (layout, teclas, carga local, croma configurable, gráfica,
sonidos, animaciones).

**Inventario de Games (10 juegos + sandbox):** deletreo ✅, cálculo mental, intruso,
álbum, la sabes o no, al vuelo, busca logo, mi libro favorito, cronos, operaciones
combinadas (prototipo).

**Ojo con los nombres:** el colector `si-o-no` alimenta al juego **Al Vuelo**. No
todos los pares comparten slug — por eso la ficha puede declarar su colector en vez
de asumir que coincide.

**Sin juego del otro lado** (tienen colector en Ronda pero no existen en Games, así
que se **construyen**, no se portan): `de-par-en-par`, `reto-cruzado`,
`galeria-fotos`, `tres-en-raya`.

El avance vive en **RM-038** (`docs/logbook/roadmap.md`).
