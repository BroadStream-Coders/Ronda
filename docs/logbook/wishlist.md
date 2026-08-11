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

## [WL-003] Aviso por correo de consultas nuevas
- **Idea:** que llegue un correo a la bandeja del admin cuando entra una consulta
  nueva desde el home (RM-007), en vez de depender de entrar al panel a mirarlas.
  Vía a evaluar: Resend desde una server action, o un trigger en Supabase.
  A verificar antes de empezar: Resend permite enviar desde su dominio de pruebas
  hacia la propia dirección de la cuenta sin verificar dominio propio — si sigue
  siendo así, esto no necesita dominio ni costo.
- **Por qué / valor:** hoy el aviso es el badge de no leídas en `/admin`, que solo
  se ve al entrar al panel. Mientras el formulario siga detrás del login de Google
  el volumen es bajo y el badge alcanza; si alguna vez se abre a cualquier
  visitante ([[WL-002]]), el correo pasa de cómodo a necesario, porque ahí sí
  escribe gente que no está en la base.
- **Fecha:** 2026-08-10 (era RM-015, bajado a wishlist por no ser prioritario)

## [WL-002] Formulario de contacto abierto (sin login)
- **Idea:** que cualquier visitante de la landing pueda escribir sin iniciar sesión
  con Google, poniendo su correo a mano. Hoy (RM-007) el formulario solo aparece
  para el usuario logueado sin programa.
- **Por qué / valor:** el público de la landing es justo quien todavía no tiene
  cuenta; obligar al login con Google es fricción que puede costar consultas de
  gente que solo quería preguntar. Es el comportamiento normal de un "escríbenos".
- **A tener en cuenta:** hoy el login con Google hace de captcha — es lo que
  permite no tener widget anti-bot, ni rate limit, ni el correo del admin
  expuesto en el HTML. Abrirlo reintroduce ese frente: haría falta captcha
  (Turnstile o similar) o límite por IP para que un bot no llene la tabla
  `inquiries` y consuma el tier gratuito de Supabase.
- **Fecha:** 2026-08-10

## [WL-004] Guardar en la nube lo que se llena en el colector
- **Idea:** persistir el contenido del colector en la base en vez de que el único
  destino sea un archivo local. Una tabla `games (program_id, collector_id, data
  jsonb)` con RLS vía `is_member()`, detrás de `src/data/`, para que el trabajo
  sobreviva a cerrar la pestaña y se pueda retomar desde otra máquina.
- **Por qué / valor:** hoy el colector es efímero — el estado vive en memoria y
  `saveAsJson` descarga un archivo; si ese archivo se pierde, el juego se rehace a
  mano. Es la diferencia entre una herramienta y un servicio.
- **Por qué no ahora:** el flujo de archivo local ya cubre la operación real
  (se llena, se descarga, se lleva al aire) y conviene modelar `data` cuando haya
  varios colectores portados (RM-022 … RM-033) y se vea qué forma toma de verdad
  en cada uno, en vez de adivinarla con uno solo.
- **Fecha:** 2026-08-11 (era la mitad `games` de RM-009; la mitad `sessions` se descartó)
