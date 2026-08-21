# Changelog

Registro permanente de todo el trabajo terminado. Indexado por código de tarea
(`TD-`, `RM-`, `WL-`). Orden inverso: lo más nuevo arriba.

**Formato de cada entrada:**

```
## [CÓDIGO] Título (YYYY-MM-DD HH:MM)
Resumen en ≤2 líneas de lo que se hizo.
```

---

## [TD-083] Las tarjetas de programas recortaban el arte del landing (2026-08-21 12:10)
La caja de la imagen era `h-[150px]` fija contra archivos de 400x460: con `object-cover` se veía una franja del centro. Ahora la caja lleva `aspect-[20/23]`, la proporción real de los archivos, así que la tarjeta crece y el arte entra completo, sin franjas ni recorte.

## [TD-082] La vuelta del login aterrizaba fuera del dominio de producción (2026-08-21 11:40)
`/auth/callback` armaba el redirect con el `origin` de `request.url`, que detrás del proxy de Vercel es el host interno del deploy; ahora usa `x-forwarded-host` cuando corre en producción y deja el `origin` para local.
El disparador real del bug —volver a `localhost` tras el login en producción— **no vive en el repo**: es la *Site URL* del proyecto en Supabase y su lista de *Redirect URLs*. Si la URL que manda `signInWithOAuth` no está permitida, Supabase la descarta y usa la Site URL; con `localhost` ahí, todo login de producción cae en local.

## [RM-080] Arma la Palabra reparte las letras, y los dos fondos pasan a claro (2026-08-21 11:05)
Debajo de los guiones va ahora el **pozo de letras** desordenadas; al revelar (flecha derecha, E o **M** para toda la palabra) la ficha vuela del pozo a su guion — mismo `layoutId` de `motion` en los dos sitios, así que el vuelo lo calcula solo. El desorden usa la misma permutación sembrada que Arma la Oración, que por eso subió a `kit/shuffle.ts`.
Los fondos dejaron de ser oscuros: `backdrop` arranca en blanco con halos pastel y viñeta suave, y las fichas se invirtieron a tarjeta blanca con texto pizarra (la armada sigue en violeta, la colocada en verde azulado). **El fondo del juego no depende del tema claro/oscuro de la app** — el Stage pinta su propia gráfica; lo único que sigue negro es la caja alrededor del 16:9 en la vista en ventana.

## [RM-077] Juego Arma la Palabra — guiones estilo ahorcado (2026-08-21 10:18)
Un guion por letra: la letra cae sobre su guion al revelarse (flecha derecha o E, una a una; **M** completa la palabra) y el guion pasa de blanco tenue a dorado con glow; el guion que sigue late para marcar dónde va la próxima. Fuente GeniusTechno, misma familia de teclas que [[RM-075]]: numpad ronda, dígitos palabra, N/B mover, C reiniciar, F error, flechas arriba/abajo bounce/slide.
`splitLetters` corta con `Intl.Segmenter` en grafemas, no en code points: la ñ y una tilde combinante ocupan **un** guion, no dos — la trampa que un `split("")` no ve. La part `backdrop` subió al kit ([[RM-078]]) y este juego la usa con su propia paleta (verde-azulado y ámbar). **Gráfica provisional en CSS** — la del diseñador entra con [[RM-079]].

## [RM-078] La part backdrop sube al kit (2026-08-21 10:18)
El fondo que estrenó Arma la Oración pasó de `catalog/arma-la-oracion/parts/` a `kit/parts/backdrop.tsx` y entró a `NATIVE_PARTS` en cuanto lo pidió el segundo juego. La geometría de los tres halos queda fija; lo que el layout declara son los colores (`from`/`mid`/`to` + `halos`), así que cada juego tiene su identidad sin duplicar el componente.

## [RM-075] Juego Arma la Oración — primer juego que no viene de un port (2026-08-21 09:32)
Dos estados sobre el mismo stage: la oración en pedazos (fichas desordenadas, con inclinación y desnivel deterministas) y, con **M**, las palabras volando a su sitio en orden + sonido de correcto y `pop`. Teclas: numpad = ronda, dígitos = oración, N/B mover, M armar, C volver a desordenar, F error, flechas para bounce/slide.
La limpieza del texto vive acá y no en el colector ([[RM-074]]): `splitWords` colapsa espacios y tira los invisibles (`\p{C}`) conservando tildes, ñ y signos; el desorden es una permutación sembrada por (ronda, oración), así que no se rebaraja en cada render ni deja la oración ya armada. **Sin croma**: el juego se emite con fondo propio (part `backdrop`, degradado y tres halos que respiran), así que la ficha no declara `chromaLayerId` y no aparece el panel de color. Gráfica provisional en CSS — la del diseñador entra con [[RM-076]].

## [RM-074] Colectores Arma la Palabra y Arma la Oración (2026-08-21 08:45)
Dos colectores nuevos para Más Conectados, calcados de Deletreo: rondas con lista de palabras (`groups[].words`) y de oraciones (`groups[].sentences`), ambos con QuickLoad, validación e indicador de largo.
El dato se guarda crudo (la palabra u oración como string); el trim, la limpieza de caracteres y el separado en letras/palabras los hace el juego al leerlo — ver [[RM-042]].

## [RM-063] Portar Cálculo Mental — y con él tres piezas de kit (2026-08-20 15:04)
El juego (14 layers, part `slot`, lógica de teclas, gráfica de los originales de Unity) más las tres piezas que estrena, todas en `kit/` y no en su carpeta: la part **`text` con auto-size** (búsqueda binaria de 12 pasos, `ResizeObserver` y re-medición en `document.fonts.ready` — sin eso mide con la tipografía de reemplazo), el **override de `visible`** en `applyState` y **`playStagger`**. Las tres salieron del port, no de un diseño nuevo.
La fuente se resuelve **por clave contra las que declara la ficha** (`fonts` en `GameType` + `FontRegistryProvider`), no contra un registro central, que metería las 4 tipografías en toda ruta que dibuje texto — lo mismo que costó [[TD-021]]. Poppins entra por `next/font/google` en vez de convertir el TTF: mismo woff2 autohospedado y con preload, sin binario en el repo. `check-game.ts` cubre assets inexistentes, layers que la lógica referencia por id, que las preguntas arranquen apagadas y que ningún `autoSize` tenga rango inválido. El auto-size ya traía `fontSizeMin`, así que el tope de largo en el colector no hizo falta: validado al aire con enunciados reales.

## [RM-058] Portar Deletreo — primer juego completo (2026-08-20 13:52)
Layout, lógica de teclas, carga de archivo local, croma configurable ([[RM-056]]), gráfica real (marcos normal/error, GeniusTechno, sonidos) y animaciones (pop al revelar, shake al error, bounce/slide en las flechas). Los assets salieron de los originales del proyecto **Unity** (`ManagedGames/Assets/_Project/`), no del bucket de Games.
Del sistema de animaciones entraron solo 4 — pop, shake, bounce y slide, las que este juego usa; flip, float, blink, sparkles, shimmer y holo llegan con el juego que las pida. Código asignado al partir [[RM-038]] en una tarea por juego: el trabajo se había hecho dentro de RM-037/RM-038 sin código propio.

## [RM-051] Cómo escala el árbol de la barra lateral al sumar Juegos (2026-08-20 13:34)
Juegos cuelga sus juegos asignados igual que Colectores, con acordeón (una rama abierta a la vez)
y scroll propio en la rama: las tres filas de servicio ya no se van de pantalla, sin números mágicos.

## [TD-021] La ruta que lista los juegos importa el catálogo entero (2026-08-20 13:34)
Se separó el `meta` de la ficha (`catalog/metas.ts` + `<juego>/meta.ts`) y `GameMount` carga el juego
con `import()` dinámico; `genius_techno.woff2` ya solo se precarga en `games/[gameId]`.

## [RM-057] Guías de migración a Ronda (2026-08-20 11:09)
`docs/migracion-games.md` (desde el proyecto Games) y `docs/migracion-unity.md` (desde Unity, adaptada de la de Games). Registran la decisión de traer solo el runtime, la tabla de vocabulario que despega el sistema de Unity, el procedimiento paso a paso, la regla de assets y las trampas que ya costaron caro — la compuerta del viewMode, `partView` en un módulo cliente, el ref escrito en render, el preload de `next/font` por grafo de módulos y los target locales de bounce/slide.
Cada una lleva su lista de **lo que el kit todavía no tiene** (part `text`, `mask`, 6 animaciones, override de `visible`, sesión ZIP) para que una sesión nueva sepa qué entra con qué juego. Enlazadas desde `CLAUDE.md` y el README.

## [RM-056] Barra de configuración del juego — color del croma (2026-08-20 09:57)
Panel plegable al lado del stage (mismo lenguaje que la barra izquierda: botón redondo al borde, `w-60`/`w-12`, estado recordado) con el color del croma, que se aplica por `patch` sobre el layer que la ficha declara en `chromaLayerId` (en Deletreo, `background`). Persiste en `localStorage` bajo `ronda_game:<programId>:<gameId>:chroma` vía `useSyncExternalStore` — sin desajuste de hidratación y sin `setState` en efectos. El juego que no declara `chromaLayerId` no muestra panel. Arranca contraído —la configuración se toca de vez en cuando y el stage se queda con el espacio—, y contraído deja a la vista el color actual como pastilla, que además expande al hacer clic.
**El croma es por juego y por programa, aislado a propósito:** el director de cámaras compone cada juego por separado y suele tener un color ya keyeado para cada uno, así que cambiar todos de golpe le rompería la composición. Guardarlo en la base queda en [[WL-009]]. El límite se mantiene: el operador cambia valores declarados por el autor, nunca la estructura.

## [RM-037] Estructura del sistema de juegos (2026-08-20 08:54)
`src/game/` con la misma forma que `src/collector/`: `kit/` (Stage con fullscreen, modelo de layers, LayerView, registro de parts, estado de juego, sesión, teclas) y `catalog/` (registro + asignación por programa + un juego). Rutas `programs/[slug]/games` y `.../games/[gameId]`, y "Juegos · Pronto" pasa a enlace real cuando el programa tiene juegos asignados.
Se decidió traer **solo el runtime** de Games: fuera dockview, inspectores, `useSceneEditor`, play mode y undo — se caen 5 dependencias y no entra ninguna nueva. El vocabulario se despega de Unity (`GameObject`→`Layer`, `components[]`→`parts[]`, `transform`→`rect`, `behavior`→`logic`, `mergeRuntime`→`applyState`) porque esto son juegos en navegador; el editor se queda en Games como herramienta de autoría.

## [RM-054] Speed Insights (2026-08-17 14:04)
`@vercel/speed-insights` con `<SpeedInsights />` en el layout raíz, al lado del `<Analytics />` de [[RM-052]]. Queda en toda la app y no solo en la landing: hoy el tráfico es de desarrollo, y si la cuota del plan gratuito aprieta se acota después — mover el componente a la landing es una línea.

## [RM-052] Vercel Analytics (2026-08-17 14:00)
`@vercel/analytics` con `<Analytics />` en el layout raíz: una línea, cubre toda la app y las rutas dinámicas se agrupan solas por el patrón (`/programs/[slug]/...`). Speed Insights queda fuera — es otro paquete con su propia cuota de eventos, y en el tier gratuito conviene gastarla en tráfico, no en métricas de rendimiento.

## [RM-046] Storage en la nube para los colectores con imágenes (2026-08-16 20:36)
Los 5 de zip (Álbum, Cronos, De Par en Par, Galería de Fotos, Intruso) suben y bajan de la nube: cada imagen es un objeto suelto en `<program_id>/<collector_id>/images/G1_I1.ext`, con **las mismas rutas relativas que ya usaba el zip**, así que el json no cambió. Al bajar, la capa de datos rearma un zip en memoria y se lo pasa al `onLoad` que cada colector ya tenía — cero lógica de carga nueva en los colectores, y de paso muere el riesgo del zip sin `File` que estaba anotado: los slots vuelven con archivo real. La subida borra las imágenes que dejaron de estar referenciadas, y el listado pagina (el `list()` de Supabase corta en 100 y Galería puede pasarse con 4 columnas). El tope de peso queda en [[RM-047]].

## [RM-040] Storage en la nube para los colectores json (2026-08-16 18:45)
Bucket privado `collector-data` con un archivo por programa+colector (`<program_id>/<collector_id>/session.json`), aislado por `is_member()` sobre `storage.objects` (migración `0011`). **Sin tabla**: mientras sea un documento sin historial no hay nada que consultar; la ruta usa el uuid y no el slug, por lo mismo que TD-006. `src/data/collector-storage.ts` (subir/bajar) y el topbar pasa a botones con desplegable al estilo Studio — Guardar/Cargar siguen siendo locales, la nube va en el desplegable, sin "datos de ejemplo". Cada colector json expone su `getData`; la validación corre también antes de subir, y bajar de la nube pide confirmación porque pisa la pantalla. Los 5 colectores de zip quedan igual que antes (siguen en [[RM-046]]).

## [RM-045] Sistema único de imágenes en los cinco colectores (2026-08-14 12:55)
`kit/images/slot.ts` con los helpers compartidos (`emptyImageSlot`, `hasImage`, `setSlotImage`, `clearSlotImage`, `releaseSlots`, `createImagePacker`, `readImageSlot`): Cronos y De Par en Par pasan a `ImageSlot`, los cinco colectores comparten convención de rutas (`images/G1_I1.ext`), un solo criterio de "hay imagen" y la limpieza de object URLs centralizada — Cronos, que no revocaba ninguna, deja de filtrar. Se fueron ~150 líneas de bucles de zip duplicados. Los zips viejos siguen cargando: la ruta viaja dentro del json.

## [RM-043] De Par en Par al ImagePicker del kit (2026-08-14 12:55)
Las cartas usan el `ImagePicker` compartido en vez del picker propio (`<input type="file">` + `<img>`), **sin recorte** por pedido de Más Conectados. El kit ganó dos props para poder absorberlo: `fill` (ocupa el alto del padre en vez de forzar cuadrado) y `onClear` (botón de eliminar). De paso se corrigió que el picker no limpiaba su vista previa cuando el padre borraba la imagen.

## [RM-044] Validación cableada en el resto de los colectores (2026-08-13 11:55)
`validate` propio en los 12 colectores que faltaban, portado del de Studio y adaptado a los tipos del port; cada uno vive como función pura en su `schema.ts` y se pasa por `setHeader`. **Reto Cruzado queda sin validación** (tampoco la tenía en Studio) y el de **Intruso cubre solo el Nivel 1**, ambas decisiones tomadas a propósito. Galería de Fotos y Álbum usan el título del grupo en la ruta cuando existe, en vez de "Grupo N" a secas.

## [RM-034] Sistema de validación (pre-guardado) (2026-08-13 11:47)
`kit/validation/` (helpers `ValidationIssue`/`isBlank`/`formatPath` + `ValidationDialog`) exportado desde el kit, campo opcional `validate` en el store del header y compuerta en `CollectorTopbar`: si `validate()` devuelve problemas, el diálogo bloquea el guardado listando dónde está cada uno, con "Guardar de todos modos". Es opt-in — el colector que no pasa `validate` guarda directo. Estrenado en Deletreo (palabras vacías → "Ronda 1 · Palabra 3"); los otros 13 colectores todavía no definen el suyo.

## [RM-036] Colector Tres en Raya (2026-08-13 11:28)
Portado a `catalog/tres-en-raya/` (Editor/Column/Row/schema): rondas de 9 casillas fijas con pregunta y respuesta, llenado rápido de 2 columnas, export json (`groups[].questions[]`). Solo usa Lego — ni imágenes ni pestañas. Registrado y asignado a QGEM; con esto el catálogo queda con los 14 juegos de Studio.

## [RM-031] Colector Galería de Fotos (2026-08-13 08:29)
Portado a `catalog/galeria-fotos/` (Editor/Column/Row/schema): grupos con título y hasta 30 fotos cada uno (solo imagen, sin texto), formato zip con `groups[].items[].imagePath` (`images/G1_I1.ext`). Los títulos, que en Studio vivían en un array paralelo a los grupos, ahora son parte de la columna. Registrado y asignado a QGEM.

## [RM-033] Colector Intruso (2026-08-13 08:20)
Portado a `catalog/intruso/` (Editor/Level1/Level2/Card/schema): dos niveles en pestañas — imagen única con recorte 21:9 + hasta 4 opciones de texto, y contexto + hasta 4 fotos con recorte 3:4, con un solo intruso marcado por ronda; formato zip (`textRounds`/`photoRounds`). El emoji del botón de intruso se reemplazó por el ícono Target. Registrado y asignado a QGEM.

## [RM-029] Colector Reto Cruzado (2026-08-12 19:45)
Portado a `catalog/reto-cruzado/` (Editor/Columns/Rows/Level0/schema): cinco niveles en pestañas — lista de valores (máx. 20), preguntas L/R, opción múltiple A-D, tres pares por fila y pregunta/respuesta, cada uno con su llenado rápido; export json con las cinco secciones. Los refs imperativos de Studio se reemplazaron por estado en el Editor y una grilla genérica `Columns<T>` para los niveles 1-4. Registrado y asignado a QGEM.

## [RM-028] Colector De Par en Par (2026-08-12 17:34)
Portado a `catalog/de-par-en-par/` (Editor/Tab1/Tab2/schema): juego de memoria con pestañas — "Recolector" (config de N pares, cada carta imagen/texto/ambos, imágenes inline) y "Tablero" (ordenar/intercambiar/aleatorizar), formato zip. Primer colector con **pestañas** en producción. Asignado a **Más Conectados** (no QGEM).

## [RM-027] Colector Operaciones Combinadas (2026-08-12 17:29)
Portado a `catalog/operaciones-combinadas/` (Editor/Sidebar/Grid/List/schema): rondas→tableros, grid 11×11 con colocación de operaciones (clic para ubicar con preview al hover, doble clic para ocultar), extracción tipo crucigrama del pegado, export json. No es Lego (layout propio, mucha lógica). Adaptado `success→emerald`, emoji→Lightbulb, "Board"→"Tablero". Registrado y asignado a QGEM.

## [RM-032] Colector Cronos (2026-08-12 17:22)
Portado a `catalog/cronos/` (Editor/Column/Row/schema): columnas (título aparte) con 5 eventos (fecha, título e imagen con **recorte 1:1** vía `ImagePicker crop`), llenado rápido, formato zip. Estrena el crop dialog. Registrado y asignado a QGEM.

## [RM-030] Colector Álbum (2026-08-12 15:39)
Portado a `catalog/album/` (Editor/Column/Card/schema): columnas con título + 5 cartas (pregunta + toggle Croma + `ImagePicker`), llenado rápido de preguntas, formato **zip** (json + imágenes empaquetadas). Estrena el sistema de imágenes. Registrado y asignado a QGEM.

## [RM-021] Sistema de imágenes (crop + carga zip) (2026-08-12 15:39)
`src/collector/kit/images/` (ImagePicker + ImageCropperDialog + use-image-picker + crop-image) exportado desde el kit, `loadZipFile` en persistence, tipo `ImageSlot` compartido. Deps: react-easy-crop + shadcn dialog/slider. Verificado end-to-end vía Álbum (upload + zip round-trip); el recorte se ejercita cuando llegue un colector con `crop`.

## [RM-026] Colector Busca el Logo (2026-08-12 15:10)
Portado a `catalog/busca-logo/` (Editor + BoardsSidebar/Grid/ControlsSidebar/schema): tableros con grid clicable de casillas, tamaño (4x3/5x4/6x5), llenado aleatorio, export `boards` con `logoPositions`. No es Lego (layout propio). Agregado el `select` de shadcn; emojis (⭐/💡) reemplazados por íconos lucide (Star/Lightbulb) por la regla de no-emojis, y "Board"→"Tablero". Registrado y asignado a QGEM.

## [RM-025] Colector Mi Libro Favorito (2026-08-12 14:48)
Portado a `catalog/mi-libro-favorito/` (Editor/Column/Row/Players/schema): panel lateral fijo de 2 equipos + rondas (grupos) con filas pregunta/respuesta, llenado rápido, export con `players` (maxHealth 3) + `groups.slots`. Registrado y asignado a QGEM.

## [RM-024] Colector La Sabes o No (2026-08-12 14:43)
Portado a `catalog/la-sabes-o-no/` (Editor/Column/Row/schema): grupos con título + filas (pregunta + dos respuestas L/R con botón para marcar la correcta), llenado rápido (reparte L/R al azar), export a `options` + `correctIndex`. Registrado y asignado a QGEM.

## [TD-011] Botones que renderizan enlaces sin `nativeButton={false}` (2026-08-12 14:27)
`nativeButton={false}` en los seis `Button` de Base UI que renderizan un `<a>` o un `<Link>`: los cinco CTA de la landing y el "Responder" del panel de consultas. Son navegaciones, así que el elemento correcto es el enlace; lo que faltaba era declarárselo a la librería. Verificado: consola limpia.
Se descartó centralizarlo en `button.tsx` inspeccionando `render.type`: menos código, pero lógica frágil por inferencia.

## [TD-006] Los colectores de un programa se asignan por `slug` (mutable) (2026-08-12 13:44)
`assignments.ts` pasa a keyearse por `program.id` (uuid inmutable) en vez de `slug`, con el nombre del programa como dato para que el archivo siga siendo legible sin comentarios; los dos call sites usan `program.id`, que ya tenían en scope.
De paso, Deletreo quedó asignado también a Más Conectados: el catálogo se comparte por tipo de juego y el aislamiento se verificó en la UI (cada programa ve solo lo suyo). El disparador real era más angosto de lo registrado — el form de admin reenvía el slug, había que editarlo a mano.

## [RM-053] Panel de admin al lenguaje visual nuevo (2026-08-17 13:02)
Las 5 pantallas (programas, usuarios, invitaciones, mensajes, editar programa) pasan al shell del espacio de trabajo: lateral fija de 240px con el logo en vez del ícono `Radio`, cabecera de página compartida (`AdminPage`/`AdminEmpty`), tarjetas y estados vacíos con el estilo del resto, y barra compacta con íconos en móvil. El menú de cuenta se extrajo a `account-menu.tsx` y ahora lo comparten admin y workspace, así que el selector de tema también está en admin.

## [TD-019] El panel de admin nunca se revisó en modo oscuro (2026-08-17 13:02)
Cerrado por [[RM-053]]: se retiraron los colores y superficies que no salían de tokens, y la marca quedó consistente con el resto de la app.

## [TD-018] `admin-placeholder.tsx` quedó sin usos (2026-08-17 13:02)
Archivo eliminado dentro de [[RM-053]].

## [RM-050] Árbol de colectores en la barra lateral (2026-08-17 12:05)
El editor de colector entró al shell `(workspace)`, así que la barra lateral está en todas las pantallas del programa. Bajo "Colectores" cuelga el árbol de juegos asignados (con su ícono, activo resaltado, y visible también como rail cuando está contraída). El botón de contraer pasó al borde derecho a la altura de la cabecera y la elección se recuerda en cookie. Se quitó el "Volver" del topbar, que la lateral ya cubre.

## [RM-049] Espacio de trabajo del programa con barra lateral (2026-08-17 09:25)
Nuevo shell `(workspace)` para el dashboard y la lista de colectores: barra lateral colapsable (240px / 64px) con navegación, cuenta al pie y selector de tema (claro / oscuro / el del sistema) en su menú. La lista de colectores pasó a ancho de trabajo con tarjetas nuevas. El editor de colector queda fuera del grupo, a pantalla completa.

## [TD-009] El resto de la app nunca se revisó en modo oscuro (2026-08-17 09:25)
Cerrado parcialmente por [[RM-049]]: el tema ahora se elige desde la cuenta y `enableSystem` quedó activo, con `defaultTheme="light"` para que nadie caiga en oscuro sin pedirlo. Falta revisar `/admin` en oscuro.

## [TD-017] Los arquetipos de barra lateral y tablero quedaron fuera del rediseño (2026-08-17 09:13)
Busca el Logo y Operaciones Combinadas migrados al lenguaje del kit con un primitivo nuevo (`Panel`, `PanelList`, `PanelCount`, `PanelHint`): cabeceras de 48px, listas de tableros/rondas unificadas, celdas sin transform ni anillos, y los verdes fuera de paleta cambiados por `primary`/`accent`.

## [RM-048] Rediseño del kit del colector (2026-08-17 09:06)
Kit rediseñado y aplicado a los 14 colectores: topbar de 56px con estado de guardado ("sin guardar / guardado hace X / en la nube"), columnas y filas con densidad nueva (primitivo `GroupRow` + `rowFieldClass`), pegado desde planilla promovido a acción explícita, pestañas de nivel horizontales en vez de texto rotado, y sistema de avisos propio (`NoticeStack`).

## [TD-016] Los 14 colectores avisan errores con `alert()` nativo (2026-08-17 09:06)
Resuelto dentro de [[RM-048]]: las 34 llamadas a `alert()` pasaron a `notifyError()` del nuevo sistema de avisos, con mensajes reescritos en lenguaje de producción.

## [TD-004] Los CTA "Empezar" del home no hacen nada (2026-08-11 15:46)
Resuelto dentro de [[RM-035]]: la landing nueva no tiene botones muertos — "Pedir una reunión" y "Solicitar reunión" anclan a `#contacto`, "Ver qué hacemos" a `#servicios`, y el bloque de contacto resuelve según sesión (formulario, "Ir al panel" o login con Google).

## [RM-035] Identidad visual + landing rediseñada (2026-08-11 15:46)
Nueva paleta (primary verde petróleo, accent terracota, neutrales cálidos) en `globals.css` para `:root` y `.dark`, tipografías Newsreader + Libre Franklin, logo propio (`ronda-logo.tsx` + `app/icon.svg`) y landing reescrita desde el diseño de Claude Design (hero, clientes, servicios, cómo funciona, nosotros, contacto). Se agregó `next-themes` con toggle claro/oscuro (default claro, sin `enableSystem`).

## [RM-023] Colector Al Vuelo — sí/no (2026-08-11 10:11)
Portado a `catalog/si-o-no/` (Editor/Column/Row/schema): grupos con título + filas (pregunta en textarea + botones Sí/No), llenado rápido, export a `true/false/null`. Agregado el componente `textarea` de shadcn. Nombre visible "Al Vuelo" (id interno `si-o-no`), ícono ⚡ y descripciones por colector en la lista.

## [RM-022] Colector Cálculo Mental (2026-08-11 10:02)
Portado a `catalog/calculo-mental/` (Editor/Column/Board/Slot/schema): grupos → tableros → 4 casillas Q/A, capacidad, llenado rápido por pares de filas, guardar/cargar json. Registrado y asignado a que-gane-el-mejor. De paso: la tarjeta del dashboard pasa a "Colector" y "Sesiones en vivo" a "Juegos (Pronto)".

## [RM-015] Pantalla de colectores del programa (2026-08-10 22:51)
`catalog/assignments.ts` (programSlug → [collectorId], en código; Deletreo → que-gane-el-mejor) + rutas `/programs/[slug]/collectors` (lista con estado vacío) y `/collectors/[collectorId]` (Editor + topbar con Volver). Aislamiento por RLS del programa + assignments; la tarjeta "Juegos" del dashboard ya linkea; `/testing` eliminado.

## [RM-018] Deletreo — primer colector + catálogo (2026-08-10 22:37)
Catálogo en `src/collector/catalog/`: `registry.ts` (id → { meta, Editor }) y `deletreo/` (Editor con el kit Lego + topbar json + schema/type-guard), con archivos internos genéricos (Editor/Column/Row/schema). `/testing` solo lo renderiza desde el registry. `assignments.ts` + ruta real del programa quedan para RM-015.

## [RM-020] Topbar del colector (handshake) (2026-08-10 22:02)
Store `use-workspace-header` (zustand) + `CollectorTopbar` con botones Cargar/Guardar en `src/collector/topbar/`. Versión lean del topbar de Studio (sin dropdowns de nube ni validación). Demostrado en `/testing`.

## [RM-019] Sistema de pestañas (LevelTabs) (2026-08-10 22:02)
`LevelTabs` portado a `src/collector/level-tabs.tsx` (todos los niveles montados, pestañas verticales a la derecha). Demostrado en `/testing` con 2 niveles, cada uno con su grilla Lego.

## [RM-017] Sistema Lego (columnas/filas) (2026-08-10 22:02)
Kit Lego portado de Studio y empaquetado en `src/collector/lego/` (layout + components + hook `use-workspace-groups` + `data-processing` + barrel). Adaptado a base-nova (brand→primary, scroll-area de base-nova). Demostrado en `/testing`.

## [RM-016] Guardado local de archivo (json/zip) (2026-08-10 17:45)
Helpers `saveAsJson` / `loadJsonFile` (validador opcional) y `saveAsZip` (JSZip) en `src/helpers/persistence.ts`, portados de Studio. Página scratch `/testing` (textarea → json / zip) confirma el guardado a mano. `loadZipFile` se difiere hasta el primer colector con imágenes.

## [RM-007] Usuario sin programa: encerrado en el home + consulta (2026-08-10 17:15)
Sin membresía, el usuario solo puede estar en `/`: guard en el proxy (chequeo optimista) más `redirect` en `/programs`, que es el autoritativo según los docs de Next 16. En el home, botón "Ir al panel" o "Consultar" según el caso; el formulario guarda en `inquiries` (RLS: inserta solo el propio, lee solo el admin) y se ve en `/admin` → Mensajes con badge de no leídas. Migración `0010`.

## [RM-014] Eliminar usuarios desde el admin (borrado limpio) (2026-08-10 13:59)
Botón "Eliminar" por usuario en `/admin/users` vía `admin_delete_user()` (SECURITY DEFINER, solo admin): borra de `auth.users` (memberships y platform_admins cascadean), limpia sus invitations por email, e impide el auto-borrado (guard en función + badge "Tú" en la UI). Migración `0009`.

## [RM-006] Invitaciones por email (2026-08-10 13:36)
Apartado "Invitaciones" en `/admin`: pre-asignar acceso por email (sin correo real). `invite_to_program()` deduplica (ya-miembro / registrado→inmediato / ya-pendiente / nuevo→pendiente); `claim_pending_invitations()` en el login convierte pendientes en membresías y las marca `claimed_at` (quedan como historial "tomada"). Migración `0008`.

## [TD-003] Cerrar sesión regresa al home (2026-08-10 12:09)
`signOut()` ahora navega a `/` (`window.location.href`), recargando fresco sin sesión y limpiando el estado/cache del cliente.

## [TD-002] Protección de `/admin` en el middleware (2026-08-10 12:07)
Guard de `/admin/*` en el middleware: sin sesión → `/`, con sesión pero no admin → `/programs`. Corre antes del render e intercepta navegaciones de cliente, cerrando el hueco del router cache; el guard del layout queda como segunda barrera.

## [RM-013] Dashboard admin: gestión de usuarios (2026-08-10 12:01)
Apartado "Usuarios" en `/admin`: lista de personas registradas (función `admin_list_users()` SECURITY DEFINER que lee `auth.users`, solo admins) y asignar/quitar acceso a programas por usuario. Migración `0007` agrega la función y policies admin en `memberships`.

## [RM-012] Dashboard admin: gestión de programas (2026-08-10 11:38)
CRUD de programas en `/admin`: listar, crear (nombre → slug automático), editar (`/admin/programs/[id]`) y eliminar (con confirmación), vía server actions y RLS solo-admin. Migración `0006` agrega policies UPDATE/DELETE.

## [RM-008] Dashboard del admin: shell + ruteo (2026-08-10 11:27)
Ruta `/admin` protegida por `is_platform_admin()`, con barra lateral (slots placeholder Programas / Usuarios / Invitaciones) y guard en el layout. Al iniciar sesión, el admin cae en `/admin`; el resto en `/programs`. Sin features aún (van en RM-012/013/006).

## [RM-011] Rol de plataforma (super admin), a nivel de datos (2026-08-10 11:09)
Tabla `platform_admins` + helper `is_platform_admin()` (SECURITY DEFINER); bypass en RLS de `programs` (admin ve todo) y policy de INSERT solo-admin. Se marca admin insertando el `user_id` (soporta varios).

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
