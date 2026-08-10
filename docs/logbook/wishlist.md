# Wishlist

Ideas: quizá nunca. Código `WL-###` (nunca se reutiliza). Si una idea se
compromete, se promueve a `roadmap.md` (RM) conservando la razón; el código WL
se retira de aquí.

**Formato de cada entrada:**
- **Idea:** qué se quiere.
- **Por qué / valor:** qué aportaría.
- **Fecha.**

---

## [WL-001] Google One Tap ("Continuar con Google" nativo)
- **Idea:** integrar el prompt nativo de Google (One Tap / FedCM) que aparece en Chrome — la tarjetita "Continuar con Google" que sale sin ir a otra página, autocompletando con la cuenta ya iniciada en el navegador. Hoy el login usa el flujo por redirección estándar (sale a Google y vuelve).
- **Por qué / valor:** login más rápido y llamativo, con menos fricción; entras casi de un clic sin salir del sitio. Requiere el SDK de Google Identity + verificar el nonce con Supabase (`signInWithIdToken`).
- **Fecha:** 2026-08-10
