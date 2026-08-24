# CLAUDE.md

Guía para Claude Code en este repositorio.

## Qué es Ronda

Plataforma **multi-tenant** para crear y emitir juegos interactivos para programas
de TV en vivo. Cada programa (cliente) es un *tenant* aislado. Nombre provisional.
Ver [README.md](README.md) para el panorama y `docs/logbook/` para el estado.

## Estructura

- `apps/web/` — app **Next.js autónoma** y único deployable (en Vercel se apunta
  aquí). Tiene su propio lockfile y `node_modules`; **NO es un monorepo pnpm**.
- `docs/` — material de referencia. **Para portar un juego, leer primero
  [`docs/migracion-games.md`](docs/migracion-games.md)** (desde el proyecto Games) o
  [`docs/migracion-unity.md`](docs/migracion-unity.md) (desde Unity, si el juego no
  existe en Games).
- `docs/logbook/` — seguimiento del proyecto (ver abajo).
- `LICENSE` — software propietario, todos los derechos reservados. El repo es
  público solo por requisitos de hosting.

## Comandos (dentro de `apps/web`)

- `pnpm build` — build de producción; **es la forma de validar** (corre el
  type-check de Next). `pnpm lint` solo revisa estilo, no tipos.
- **No levantar el dev server** (`pnpm dev`); la validación se hace con `build`.

## Stack

- Next.js 16 + React 19 (App Router, `src/`)
- Tailwind CSS v4 + shadcn/ui (estilo `base-nova`, primitivos Base UI, íconos lucide)
- TypeScript (strict), pnpm
- Supabase (planeado): datos, auth con Google, storage

## Convenciones y arquitectura

- **Acceso a datos aislado:** todo lo que hable con Supabase vive tras una única
  capa (`src/data/`), para poder reemplazar Supabase por una API propia en el
  futuro sin tocar el resto de la app. (Aún no existe; se crea con RM-003.)
- **Multi-tenant:** el aislamiento vive en la base con `program_id` + políticas RLS,
  no en infraestructura separada. Modelo: `programs → memberships → games → sessions`.
  (El *tenant* es el programa; en código usamos siempre `program`, nunca `tenant` ni
  `project`.)
- **Servicios por programa:** qué servicios tiene contratado cada programa se declara
  **solo** en `src/data/program-services.ts` (`collectors`, `games`, `host`). Regla:
  **clave presente = contratado** (aunque la lista esté vacía → estado vacío legítimo);
  **clave ausente = el servicio no existe para ese programa** — no se pinta en el
  sidebar ni en el dashboard, y su segmento de ruta responde 404 (`hasService` en el
  `layout.tsx` del servicio). Nada de teasers tipo "Pronto": un programa no se entera
  de los servicios que no tiene. El mapa va indexado por uuid del programa (no por
  slug: el slug se recalcula al renombrar); el campo `name` es solo para leerlo a ojo.
  Cuando la asignación la maneje el panel de admin, este módulo pasa a leer una tabla
  `program_services` sin mover los call sites.
- **Juegos — no es Unity.** `src/game/` es el segundo servicio, con la misma forma
  que `src/collector/`: `kit/` (el sistema) + `catalog/` (un juego por carpeta con
  su ficha `GameType`). Vino del proyecto **Games**, que sí era un mini-editor estilo
  Unity, pero acá entra **solo lo que corre en pantalla**: no hay editor, ni inspector,
  ni jerarquía, ni modo play. Son juegos en navegador. El vocabulario lo refleja y no
  se vuelve atrás:

  | Games (Unity) | Ronda |
  |---|---|
  | `GameObject` | `Layer` |
  | `components[]` | `parts[]` |
  | `transform` / `RectTransform` | `rect` |
  | `Scene` (el lienzo) | `Stage` |
  | `behavior` | `logic` |
  | `mergeRuntime(design, runtime)` | `applyState(layout, state)` |
  | `scene.json` | `layout.json` |

  El modelo: **un layout de layers; cada layer tiene un rect y unas parts**. El
  `layout.json` es data — da igual si lo generó un editor, Unity o la mano. La lógica
  del juego escribe en `useGameState` y `applyState` lo fusiona sobre el layout al
  renderizar; el layout nunca se muta.

  **Antes de portar un juego, leer [`docs/migracion-games.md`](docs/migracion-games.md).**
  Ahí están el procedimiento, las trampas que ya costaron caro y la lista de lo que el
  kit todavía no tiene.

- **Host — la vista del conductor.** `src/host/` es el tercer servicio, con la misma
  forma que los otros dos: `kit/` (`HostShell`, que carga y muestra estados) +
  `catalog/` (`views.ts`, una vista por juego). Es **solo lectura y solo JSON**: lee
  el `session.json` que dejó el colector en el bucket (`loadCollectorSession`) y no
  baja imágenes. Cada vista valida con el guard `isData` del colector correspondiente
  — el contrato del archivo es del colector, no se duplica el tipo. Corre fuera del
  route group `(workspace)`: sin sidebar y sin vuelta al espacio de trabajo.
- **Assets de juego = código, datos de sesión = archivo/storage.** Marcos, fuentes y
  sonidos son parte del juego: los sirve el CDN de Vercel y cambian con un deploy. **No
  van a Supabase Storage** — ese bucket es para lo que produce el colector y cambia cada
  día. Los originales de los juegos portados están en el proyecto Unity
  (`TvPeru-QGEM-ManagedGames/Assets/_Project/`), no en el repo de Games.

- **Los assets se agrupan por programa, no por juego.** Imágenes y audio viven en
  `public/programs/<programa>/games/<juego>/`, y lo que comparten varios juegos **del
  mismo programa** en `public/programs/<programa>/shared/`, separado por medio:
  `shared/audio/` y `shared/video/`. Las fuentes son la excepción
  de ubicación: van en `src/programs/<programa>/fonts/`, un módulo por tipografía, porque
  `next/font/local` necesita importarlas y así emite el preload y el hash solo; se guardan
  en **woff2**, no ttf (pesa un 70% menos). **Nada cruza programas**: si dos programas
  usan la misma tipografía o el mismo sonido, **se duplica el archivo a propósito** — es
  lo que permite borrar todo lo de un programa sin tocar a los demás, y no cuesta nada en
  runtime porque nadie carga la página del otro. `<programa>` es un slug fijo en código
  (`que-gane-el-mejor`, `mas-conectados`), no el uuid ni el slug de la BD: estos assets
  cambian con un deploy, así que renombrar el programa no mueve carpetas.
  `public/clients/` queda fuera de esto — es marketing de la landing, propiedad de la
  plataforma.

- **Video: H.264 en `.mp4`, y no se busca el archivo más chico.** Los juegos precargan
  sus assets antes de salir al aire, así que el peso deja de ser la restricción; lo que
  importa es que **ningún frame falle en vivo**. Por eso H.264 y no VP9/AV1: es el único
  con decodificación por hardware garantizada en cualquier máquina, y el programa puede
  emitirse desde un equipo que hoy no conocemos. Receta: `libx264 -crf 18 -preset slow
  -profile:v high -level 4.0 -pix_fmt yuv420p -movflags +faststart -an`, a la resolución
  exacta de emisión (1080p) y **sin pista de audio** — un fondo no la necesita y el
  navegador exige `muted` para autoplay igual. CRF 18 y no más alto porque estos fondos
  son degradados suaves, donde el riesgo real es el **banding**, que ninguna métrica
  automática detecta: se valida a ojo en el monitor de emisión.

- **Las animaciones son parts sin vista.** Un layer declara `pop`, `shake`, `bounce` o
  `slide` en sus `parts[]` como data; no dibujan nada. `useLayerAnimations` las lee del
  propio layer, registra un trigger por `(layerId, tipo)` y la lógica del juego las
  dispara con `play(layerId, "pop")`. **`bounce` y `slide` mueven la posición local**,
  relativa al padre — por eso el layer animado cuelga de un ancla que le fija el "home";
  aplanarlo manda el objeto al centro de la pantalla.

- **El Stage es un container-query context.** Todo lo que se dibuja adentro se mide en
  `cqw`/`cqh`/`cqi`, **nunca** en `vw`/`rem`/`px`. Es lo que hace que la vista en
  ventana y en pantalla completa sean idénticas; usar unidades de viewport rompe eso.

- **Sin comentarios en el código** salvo que se pidan; la deuda técnica se registra
  en `docs/logbook/technical-debt.md`, nunca como comentario.
- **Idioma — regla dura:** todo lo que el usuario **no ve** va en **inglés** (tablas
  en plural: `programs`, `memberships`; columnas, funciones, tipos, variables, rutas).
  Todo lo que el usuario **sí ve** (textos de UI) va en **español**. No mezclar.

## Next.js 16 — ojo

Esta versión trae breaking changes respecto a versiones previas (APIs,
convenciones, estructura). Ante dudas, consultar los docs de la versión instalada
en `apps/web/node_modules/next/dist/docs/` antes de escribir código Next-específico.

## Logbook (`docs/logbook/`)

Trabajo comprometido en `roadmap.md` (`RM-###`), deuda en `technical-debt.md`
(`TD-###`), ideas en `wishlist.md` (`WL-###`), terminado en `changelog.md`. Al
empezar una tarea se marca `En progreso`; al terminar se mueve al `changelog`
conservando su código. Los códigos nunca se reutilizan.
