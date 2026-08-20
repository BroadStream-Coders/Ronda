# CLAUDE.md

Guía para Claude Code en este repositorio.

## Qué es Ronda

Plataforma **multi-tenant** para crear y emitir juegos interactivos para programas
de TV en vivo. Cada programa (cliente) es un *tenant* aislado. Nombre provisional.
Ver [README.md](README.md) para el panorama y `docs/logbook/` para el estado.

## Estructura

- `apps/web/` — app **Next.js autónoma** y único deployable (en Vercel se apunta
  aquí). Tiene su propio lockfile y `node_modules`; **NO es un monorepo pnpm**.
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
