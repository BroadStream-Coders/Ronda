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
- **Multi-tenant:** el aislamiento vive en la base con `programa_id` + políticas RLS,
  no en infraestructura separada. Modelo: `programa → membership → juego → sesión`.
  (El *tenant* es el programa; en código y tablas usamos siempre `programa`, nunca
  `tenant` ni `project`. Tablas en plural: `programas`, `memberships`, etc.)
- **Sin comentarios en el código** salvo que se pidan; la deuda técnica se registra
  en `docs/logbook/technical-debt.md`, nunca como comentario.
- **UI en español.**

## Next.js 16 — ojo

Esta versión trae breaking changes respecto a versiones previas (APIs,
convenciones, estructura). Ante dudas, consultar los docs de la versión instalada
en `apps/web/node_modules/next/dist/docs/` antes de escribir código Next-específico.

## Logbook (`docs/logbook/`)

Trabajo comprometido en `roadmap.md` (`RM-###`), deuda en `technical-debt.md`
(`TD-###`), ideas en `wishlist.md` (`WL-###`), terminado en `changelog.md`. Al
empezar una tarea se marca `En progreso`; al terminar se mueve al `changelog`
conservando su código. Los códigos nunca se reutilizan.
