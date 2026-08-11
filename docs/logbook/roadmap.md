# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**
- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-021] Sistema de imágenes (crop + carga zip)
- **Objetivo:** portar de Studio el sistema de imágenes: `ImagePicker` + recorte
  (`ImageCropperDialog`, `use-image-picker`, `cropImage`) y la carga de bundles
  (`loadZipFile`, diferida en RM-016), al kit del colector. Prerequisito de los
  colectores con fotos. Adaptar a base-nova.
- **Hecho cuando:** un colector puede subir/recortar una imagen y guardar/cargar
  un zip (json + imágenes) con round-trip real.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-024] Colector La Sabes o No
- **Objetivo:** portar el colector a `catalog/la-sabes-o-no/`. Sin imágenes ni pestañas.
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar json) y es asignable.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-025] Colector Mi Libro Favorito
- **Objetivo:** portar el colector a `catalog/mi-libro-favorito/`. Sin imágenes ni pestañas.
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar json) y es asignable.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-026] Colector Busca el Logo
- **Objetivo:** portar el colector a `catalog/busca-logo/`. Sin imágenes ni pestañas.
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar json) y es asignable.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-027] Colector Operaciones Combinadas
- **Objetivo:** portar el colector a `catalog/operaciones-combinadas/`. Sin imágenes ni pestañas.
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar json) y es asignable.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-028] Colector De Par en Par
- **Objetivo:** portar el colector a `catalog/de-par-en-par/`. Usa **pestañas** (RM-019, ya listo).
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar json) y es asignable.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-029] Colector Reto Cruzado
- **Objetivo:** portar el colector a `catalog/reto-cruzado/`. Usa **pestañas** (RM-019, ya listo).
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar json) y es asignable.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-030] Colector Álbum
- **Objetivo:** portar el colector a `catalog/album/`. Usa **imágenes** → depende de RM-021.
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar zip con imágenes) y es asignable.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-031] Colector Galería de Fotos
- **Objetivo:** portar el colector a `catalog/galeria-fotos/`. Usa **imágenes** → depende de RM-021.
- **Hecho cuando:** funciona dentro de un programa (editar + guardar/cargar zip con imágenes) y es asignable.
- **Fecha:** 2026-08-10 · **Estado:** Abierto

## [RM-032] Colector Cronos
- **Objetivo:** portar el colector a `catalog/cronos/`. Usa **imágenes** → depende de RM-021.
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
