# Changelog

Registro permanente de todo el trabajo terminado. Indexado por código de tarea
(`TD-`, `RM-`, `WL-`). Orden inverso: lo más nuevo arriba.

**Formato de cada entrada:**

```
## [CÓDIGO] Título (YYYY-MM-DD HH:MM)
Resumen en ≤2 líneas de lo que se hizo.
```

---

## [RM-005] Acceso por membresía (memberships + RLS) (2026-08-10 10:57)
Tabla `memberships(user_id, program_id)` + RLS default-deny: cada usuario ve solo los programas donde tiene fila; otorgar acceso = editar filas en el Table Editor (sin SQL). Helper `is_member()` anti-recursión.
De paso: `programas` → `programs` y todo lo interno a inglés (regla de idioma en CLAUDE.md); ruta `/programs`.

## [RM-010] Programas + selección post-login (2026-08-10 10:20)
Tabla `programas` (RLS: autenticados ven todo, por ahora) tras la capa `src/data/`; migraciones versionadas en `apps/web/supabase/migrations/`.
Post-login lleva a `/programas` (lista) → `/programas/[slug]` (dashboard shell), con header de marca compartido. Aislamiento por membresía queda para RM-005.

## [RM-004] Integración con Google (login) (2026-08-10 09:20)
Login con Google vía Supabase Auth (`@supabase/ssr`): botón en el header que dispara OAuth y vuelve al home ya con sesión; callback que canjea el code, middleware que refresca la sesión y logout.
Con sesión, el header muestra el avatar de Google en un desplegable (nombre, email y "Salir").

## [RM-003] Conectar Supabase (2026-08-06 19:52)
Cliente `@supabase/ssr` de servidor tras la capa aislada `src/data/`, configurado por variables de entorno.
Endpoint `GET /api/health` verifica la conexión (`ping()`); round-trip real confirmado.

## [RM-002] Landing page informativa (2026-08-06 19:24)
Landing pública en la raíz con acento naranja de marca: hero, qué es / qué brindamos, cómo funciona, CTA y footer.
Incluye sección "Ya salieron al aire con Ronda" con 3 clientes (TV Perú) enlazando a sus páginas oficiales.

## [RM-001] Sistema de componentes UI (shadcn/ui) (2026-08-06 09:38)
shadcn/ui integrado en `apps/web` (tema base-nova): componentes button, card, badge, input, label.
Home reemplazado por un demo que los usa; build limpio.
