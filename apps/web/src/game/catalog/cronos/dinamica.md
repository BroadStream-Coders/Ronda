# Cronos — dinámica

> Dinámica del juego, traída desde Games con el port ([[RM-069]]). Insumo para diseñar
> animaciones/transiciones y para modificarlo sin re-explicarlo. Vive junto
> al juego: al revisar/borrar la carpeta, la dinámica va con él.

## Concepto

Juego de **línea de tiempo**: el participante debe ordenar cronológicamente un
conjunto de hechos históricos. En pantalla se ven las **fechas ya colocadas en
orden** (arriba) y las **cartas mezcladas** (abajo, cada una con imagen y
nombre del hecho); se gana colocando cada carta en la fecha que le corresponde.
El acierto es **todo o nada**: solo cuenta si las cinco quedan bien.

## Pantallas / estados

Una sola pantalla (el tablero), que atraviesa tres estados:

1. **Presentación** — se ven el **título general** de la ronda y las **fechas**
   en sus zonas (en orden cronológico). Las cartas (`card-N`) están
   ocultas. Los huecos (`slot-N`, marco + letra) sí se ven abajo.
2. **Juego** — tras la tecla **A** aparecen las cartas sobre sus huecos y (en el
   vivo) arranca el cronómetro. El operador arrastra cada carta a una zona (`zone-N-target`).
3. **Revelación** — tras la tecla **V**, cada zona muestra su punto
   `correct`/`incorrect` (reemplazando `normal`) y suena el veredicto.

Cada hueco lleva una **letra** (A, B, C…). Es una **ayuda opcional** para
que el participante conteste más rápido ("la C va en 1533"); está pensada así,
aunque no siempre se usa al aire.

Objetos que "viven" entre estados (candidatos a transición): las **cartas**
(aparecen en el paso 2 y se desplazan durante el juego) y los **puntos**
(`normal` → `correct`/`incorrect` en la revelación).

## Flujo del segmento al aire

Por cada ronda (una línea de tiempo):

1. **Presentación.** El conductor lee el título general y las fechas que se ven
   en el tablero. Las cartas aún no están.
2. El operador presiona **A**: aparecen las cartas mezcladas y **corre el
   tiempo (máx. 30 s)**. Es la fase tensa: el participante piensa el orden
   contra el reloj.
3. En algún momento el participante dice **"Stop"**: el cronómetro se detiene y
   entonces enuncia su respuesta (el orden) con relativa calma.
4. El operador hace el **drag & drop** colocando cada carta en la zona según
   lo que dijo el participante.
5. El operador presiona **V**: se valida. Si está **bien**, se celebra el
   acierto. Si está **mal**, el operador **corrige en el momento** (arrastra las
   cartas a su lugar) para **mostrar la respuesta correcta**.
6. Se pasa a la **siguiente línea de tiempo** (ronda).

## Controles del operador

| Tecla            | Acción                              | Qué debe verse/sentirse                                                                                 |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **A**            | Revelar cartas y arrancar el reloj  | Las cartas aparecen listas sobre sus huecos y el cronómetro arranca desde su duración; empieza la fase de presión. |
| **Arrastrar**    | Colocar una carta en una zona    | La carta va al frente mientras se mueve; snap al centro de la zona; si suelta fuera o en zona ocupada, regresa a su origen. |
| **V**            | Validar el orden                    | Cada zona pinta Correct/Incorrect; suena correcto **solo si las 5 aciertan**. **Es EL momento.**        |
| **T**            | Pausar/reanudar el cronómetro       | El "Stop" del participante: el reloj se congela y el sonido de conteo se corta. Al reanudar, el sonido vuelve sincronizado con lo que queda. |
| **C**            | Ocultar/resetear el tablero         | Cartas de vuelta a casa, puntos a `normal` (para rehacer: C y luego A).                                    |
| **N / B**        | Ronda siguiente / anterior          | Cambia de línea de tiempo; vuelve al estado de presentación.                                             |
| **Números** (fila/numpad) | Saltar a una ronda         | Ídem, salto directo (0 = primera).                                                                       |

La **respuesta es implícita**: la fecha de cada item define su posición
cronológica, así que la carta correcta de cada zona se deduce del orden
(`order` en `Logic.tsx`, sembrado con `shuffledOrder`). No se guarda una clave de respuesta aparte.

## Beats emocionales

- **Tensión:** la fase con el reloj corriendo (paso 2–3). El participante contra
  el tiempo; el "Stop" es el pico de esa tensión.
- **EL momento — la validación (V):** el veredicto Correct/Incorrect por zona +
  sonido. Aquí debe vivir la mejor animación: la revelación del orden.
- **Celebración:** cuando las cinco aciertan. El premio emocional del juego es
  clavar el orden completo (todo o nada).
- **Error → corrección:** si falla, el operador acomoda a mano para mostrar la
  respuesta correcta; ese "así era" también merece leerse con claridad.

## Ritmo

Dos fases contrastantes por ronda: una **tensa y acelerada** (reloj, máx. 30 s)
y una **pausada** (el participante enuncia con calma, luego la validación). El
loop principal = una línea de tiempo por ronda; se encadenan varias rondas
(cada `group` de la sesión es una ronda). La sesión de referencia trae 2 rondas
de 5 hechos cada una.

## Feel y referencias

Cada juego tiene su propio feel (principio del proyecto). Cronos vive de su
**contraste de dos tiempos**:

- **Fase de reloj:** tensa, competitiva. Presión, urgencia, foco en las cartas.
- **Fase de revelación:** celebratoria en el acierto. El clímax es ver el orden
  correcto confirmarse.

Tono general **histórico** (fechas, hechos), pero al servicio de la competencia:
no solemne por solemne, sino tenso y con recompensa clara al acertar.

**Cronómetro:** vive dentro del display (imagen `stopwatch` + texto `timer`).
Arranca con **A** junto con las cartas, se pausa con **T** (el "Stop") y se
resetea con **C**; su duración es la part `timer` del layout (~20-30 s). En los
últimos 5 s entra el clip `countdown5`, que se corta si el operador pausa.

Referencia base: el prefab original de Unity del que se migró. **Las gráficas salen
del bucket de Games, no de Unity** — ver `docs/migracion-games.md`.
