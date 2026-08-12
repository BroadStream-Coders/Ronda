# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-029] Colector Reto Cruzado
- **Objetivo:** portar el colector a `catalog/reto-cruzado/`. Usa **pestañas** (RM-019, ya listo).
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar json) y es asignable.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-031] Colector Galería de Fotos
- **Objetivo:** portar el colector a `catalog/galeria-fotos/`. Usa **imágenes** → depende de RM-021.
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar zip con imágenes) y es asignable.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-033] Colector Intruso
- **Objetivo:** portar el colector a `catalog/intruso/`. Usa **pestañas** (RM-019) + **imágenes** → depende de RM-021.
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar zip con imágenes) y es asignable.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-034] Sistema de validación (pre-guardado)
- **Objetivo:** portar de Studio el sistema de validación opt-in: helpers
  `validation.ts` (`ValidationIssue`, `isBlank`, `formatPath`), `ValidationDialog`
  (bloquea el guardado + "Guardar de todos modos") y la compuerta en el topbar/store
  (campo `validate` corrido antes de `onSave`). Cada colector define su propio
  `validate`. Sistema compartido que usan la mayoría de los colectores.
- **Hecho cuando:** Deletreo bloquea el guardado si hay palabras vacías, apuntando
  al campo (ej. "Ronda 1 · Palabra 3"), con opción de forzar el guardado.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-036] Colector Tres en Raya
- **Objetivo:** portar el colector a `catalog/tres-en-raya/` (agregado a Studio
  hace poco). Sistemas que usa (imágenes/pestañas) a confirmar al revisarlo.
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar) y es
  asignable.
- **Fecha:** 2026-08-12 · **Estado:** Abierto
