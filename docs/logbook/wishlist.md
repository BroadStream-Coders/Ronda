# Wishlist

Ideas: quizá nunca. Código `WL-###` (nunca se reutiliza). Si una idea se
compromete, se promueve a `roadmap.md` (RM) conservando la razón; el código WL
se retira de aquí.

**Formato de cada entrada:**
- **Idea:** qué se quiere.
- **Por qué / valor:** qué aportaría.
- **Fecha.**

---

## [WL-011] Presupuesto de memoria del juego (`useMemoryBudget`)
- **Idea:** portar de Games el diagnóstico que mide cuánta memoria consume el juego
  en el navegador del estudio. Quedó fuera del reparto de [[RM-038]] a propósito:
  no lo necesita ningún juego para funcionar.
- **Por qué / valor:** serviría el día que una emisión larga con imágenes ([[RM-061]])
  se ponga lenta y no se sepa si es fuga de blobs, re-renders o el navegador. Hoy no
  hay síntoma, así que puede no volver nunca — y si vuelve, quizá convenga medirlo con
  las herramientas del navegador en vez de código propio.
- **Fecha:** 2026-08-20.

## [WL-010] Flyout en el rail contraído de la barra lateral
- **Idea:** que en la barra contraída el ícono del servicio abra un submenú a la
  derecha con sus juegos (reusando el `DropdownMenu` ya instalado), en vez de
  listarlos como íconos apilados debajo. Era la opción 2 de [[RM-051]]; se dejó
  fuera porque el acordeón + scroll por rama ya resuelve el problema de espacio.
- **Por qué / valor:** hoy el rail contraído muestra una columna de íconos sin
  etiqueta, que hay que distinguir por tooltip uno por uno. El flyout los muestra
  con nombre y deja el rail en 3 íconos fijos.
- **Fecha:** 2026-08-20.

## [WL-009] El croma configurado se guarda en la base
- **Idea:** que el color del croma de cada juego ([[RM-056]]) viva en Supabase por
  programa + juego, en vez de solo en el `localStorage` de la máquina del estudio.
- **Por qué / valor:** hoy el ajuste vive en el navegador de esa máquina. Si se
  reinstala, se cambia de equipo o se opera desde otro lado, los colores vuelven al
  del layout y hay que volver a elegirlos uno por uno — y el croma es justo el dato
  que no se puede tener mal al aire. Guardado en la base, el operador lo configura
  una vez y lo encuentra en cualquier máquina.
- **A tener en cuenta:** `localStorage` sigue siendo la verdad para operar, porque la
  pantalla de emisión no puede depender de la red; la base sería respaldo y
  sincronización, no la fuente en el momento del aire.
- **Fecha:** 2026-08-20

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

## [WL-005] Validaciones propias de Operaciones Combinadas
- **Idea:** dos chequeos que hoy no existen, sobre el sistema de validación
  ([[RM-034]]): (1) **aritmética** — que cada operación cuadre respecto a su forma
  `operandoA operador operandoB = resultado`; (2) **secuencias completas** — que
  ningún `sequence.values` quede con length ≠ 5 o sin el `"="` y/o el resultado.
  Ambos reportan dónde está el problema antes de guardar.
- **Por qué / valor:** es el único colector donde el dato puede estar *mal* y no
  solo incompleto: una operación que no cuadra se ve bien en pantalla y recién falla
  al aire. Va detrás de RM-034 porque reusa su `validate` y su diálogo.
- **Fecha:** 2026-08-13 (venía del roadmap de Studio, RM-011 y RM-012)

## [WL-006] Reordenar filas por drag & drop dentro de una columna
- **Idea:** poder arrastrar una fila dentro de su columna para cambiarle el orden,
  en el kit Lego — es decir, en todos los colectores que usan columnas y filas, no
  en uno solo. Camino sugerido: `@dnd-kit` (sortable) en vez de programar el
  arrastre a mano; el orden persistido ya es el orden del array de la columna.
- **Por qué / valor:** hoy la única forma de cambiar el orden es reescribir el
  contenido de las filas a mano. En algunos juegos el orden además *es* el dato
  (Cronos: la línea de tiempo es la respuesta), así que ahí deja de ser comodidad.
- **Fecha:** 2026-08-13 (venía del roadmap de Studio, RM-016, acotado a Cronos)

## [WL-007] Llenado rápido desde el portapapeles con un solo botón
- **Idea:** un botón en el llenado rápido que lea el portapapeles
  (`navigator.clipboard.readText()`) y ejecute el llenado de una, sin pegar en el
  textarea ni enviar aparte. Reusa el parseo actual; hay que contemplar el permiso
  de portapapeles del navegador.
- **Por qué / valor:** `QuickLoad` es del kit, así que un botón mejora de golpe a
  los 11 colectores que lo usan. El flujo real es copiar de Excel y pegar: hoy son
  tres pasos (copiar, pegar, enviar) donde puede ser uno.
- **Fecha:** 2026-08-13 (venía del roadmap de Studio, RM-017, acotado a Cronos)

## [WL-008] Llenado rápido de imágenes
- **Idea:** el equivalente del llenado rápido pero para fotos: elegir varias
  imágenes de una y que se repartan en orden entre los espacios de la columna, en
  vez de subirlas de a una. A definir al empezar: si el orden lo da el nombre del
  archivo o el de selección, y qué pasa si sobran o faltan respecto a los espacios.
- **Por qué / valor:** los colectores de imágenes son los más lentos de llenar —
  Álbum, Cronos, Galería de Fotos e Intruso piden entre 4 y 30 fotos por columna,
  todas de a un clic. Es el mismo ahorro que dio el llenado rápido para texto.
- **Fecha:** 2026-08-13
