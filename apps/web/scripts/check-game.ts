import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import JSZip from "jszip";

import { readZipSession, ZIP_SESSION_JSON } from "../src/game/kit/zip.ts";
import { mediaKind } from "../src/game/kit/media.ts";
import { PRELOAD as INTRUSO_PRELOAD } from "../src/game/catalog/intruso/assets.ts";
import { isIntrusoSession } from "../src/game/catalog/intruso/session.ts";
import {
  CARD_COLORS,
  CARD_CROMA,
  PRELOAD as ALBUM_PRELOAD,
} from "../src/game/catalog/album/assets.ts";
import { PRELOAD as CRONOS_PRELOAD } from "../src/game/catalog/cronos/assets.ts";
import { PRELOAD as RAYA_PRELOAD } from "../src/game/catalog/tres-en-raya/assets.ts";
import { PRELOAD as RETO_PRELOAD } from "../src/game/catalog/reto-cruzado/assets.ts";
import { coursePosition } from "../src/game/catalog/reto-cruzado/courses.ts";
import { PRELOAD as VUELO_PRELOAD } from "../src/game/catalog/al-vuelo/assets.ts";
import { correctOption } from "../src/game/catalog/al-vuelo/session.ts";

import {
  DESIGN_SIZE,
  findPart,
  layerStyle,
  partOf,
  type Layer,
} from "../src/game/kit/layer.ts";
import { applyState } from "../src/game/kit/state.ts";
import { settingKey } from "../src/game/kit/use-game-setting.ts";
import { FRAMES, PRELOAD } from "../src/game/catalog/deletreo/assets.ts";
import { PRELOAD as CALCULO_PRELOAD } from "../src/game/catalog/calculo-mental/assets.ts";
import { PRELOAD as ORACION_PRELOAD } from "../src/game/catalog/arma-la-oracion/assets.ts";
import { shuffledOrder } from "../src/game/kit/shuffle.ts";
import { splitWords } from "../src/game/catalog/arma-la-oracion/words.ts";
import { PRELOAD as PALABRA_PRELOAD } from "../src/game/catalog/arma-la-palabra/assets.ts";
import { splitLetters } from "../src/game/catalog/arma-la-palabra/letters.ts";
import { PRELOAD as SABES_PRELOAD } from "../src/game/catalog/la-sabes-o-no/assets.ts";
import {
  HEARTS,
  PRELOAD as LIBRO_PRELOAD,
} from "../src/game/catalog/mi-libro-favorito/assets.ts";

// --- coordenadas ---

const centered = {
  position: { x: 0, y: 0 },
  size: { x: 1920, y: 1080 },
  pivot: { x: 0.5, y: 0.5 },
};

const full = layerStyle(centered, DESIGN_SIZE);
assert.equal(full.left, "0%");
assert.equal(full.top, "0%");
assert.equal(full.width, "100%");
assert.equal(full.height, "100%");

const upperRight = layerStyle(
  { position: { x: 480, y: 270 }, size: { x: 0, y: 0 }, pivot: { x: 0.5, y: 0.5 } },
  DESIGN_SIZE,
);
assert.equal(upperRight.left, "75%");
assert.equal(upperRight.top, "25%");

const insideParent = layerStyle(
  { position: { x: 0, y: 0 }, size: { x: 585, y: 102 }, pivot: { x: 0.5, y: 0.5 } },
  { x: 1170, y: 204 },
);
assert.equal(insideParent.width, "50%");
assert.equal(insideParent.height, "50%");

// --- applyState ---

const layout: Layer[] = [
  {
    id: "word",
    name: "Palabra",
    visible: true,
    rect: centered,
    parts: [
      { type: "spelling", word: "", revealed: 0 },
      { type: "color", value: "#000" },
    ] as Layer["parts"],
  },
];

const merged = applyState(layout, {
  word: { parts: { spelling: { word: "CASA", revealed: 2 } } },
});
assert.deepEqual(merged[0].parts[0], {
  type: "spelling",
  word: "CASA",
  revealed: 2,
});
assert.deepEqual(merged[0].parts[1], { type: "color", value: "#000" });
assert.deepEqual(
  (layout[0].parts[0] as { word: string }).word,
  "",
  "el layout original no se muta",
);
assert.equal(applyState(layout, {})[0], layout[0]);

const moved = applyState(layout, { word: { position: { x: 10, y: -20 } } });
assert.deepEqual(moved[0].rect.position, { x: 10, y: -20 });
assert.deepEqual(moved[0].rect.size, centered.size, "mover no toca el tamaño");
assert.deepEqual(layout[0].rect.position, { x: 0, y: 0 });

// --- helpers de parts ---

assert.equal(findPart(layout, "word", "spelling")?.type, "spelling");
assert.equal(findPart(layout, "nope", "color"), undefined);
assert.equal(findPart(layout, "word", "image"), undefined);
assert.equal(partOf(undefined, "color"), undefined);

// --- claves de configuración aisladas ---

assert.notEqual(
  settingKey("programa-a", "deletreo", "chroma"),
  settingKey("programa-b", "deletreo", "chroma"),
);
assert.notEqual(
  settingKey("programa-a", "deletreo", "chroma"),
  settingKey("programa-a", "album", "chroma"),
);

// --- el layout de deletreo contra lo que la lógica espera ---

const deletreo = JSON.parse(
  readFileSync("src/game/catalog/deletreo/layout.json", "utf8"),
) as Layer[];

for (const src of PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

const frame = deletreo.find((layer) => layer.id === "frame");
assert.ok(frame, "falta el layer 'frame'");

const image = partOf<{ type: "image"; src: string }>(frame, "image");
assert.ok(image, "el layer 'frame' debe llevar una part 'image' (la pisa Logic)");
assert.ok(existsSync(`public${image.src}`), `el marco no existe: ${image.src}`);
assert.equal(image.src, FRAMES.normal);

assert.ok(
  findPart(deletreo, "word", "spelling"),
  "el layer 'word' debe llevar una part 'spelling' (la pisa Logic)",
);
assert.ok(
  findPart(deletreo, "background", "color"),
  "el layer 'background' debe llevar una part 'color' (es el croma)",
);

for (const type of ["pop", "shake", "bounce", "slide"]) {
  assert.ok(partOf(frame, type), `el layer 'frame' debe llevar la part '${type}'`);
}

// bounce y slide mueven la posición LOCAL: sin padre, target {0,0} manda el
// marco al centro de la pantalla en vez de a su sitio.
assert.ok(
  frame.parentId,
  "'frame' debe colgar de un padre: los target de bounce/slide son locales",
);
const anchor = deletreo.find((layer) => layer.id === frame.parentId);
assert.ok(anchor, "el padre de 'frame' no existe en el layout");
assert.deepEqual(
  frame.rect.position,
  { x: 0, y: 0 },
  "'frame' arranca en el origen de su padre: es el 'home' al que vuelve bounce",
);

// --- el override de visible ---

const hidden = applyState(layout, { word: { visible: false } });
assert.equal(hidden[0].visible, false, "visible:false apaga el layer");
assert.equal(layout[0].visible, true, "el layout original no se muta");
assert.equal(
  applyState(layout, { word: { position: { x: 1, y: 1 } } })[0].visible,
  true,
  "un override sin visible no apaga el layer",
);

// --- el layout de calculo mental contra lo que la logica espera ---

const calculo = JSON.parse(
  readFileSync("src/game/catalog/calculo-mental/layout.json", "utf8"),
) as Layer[];

for (const src of CALCULO_PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

assert.ok(
  findPart(calculo, "background", "color"),
  "el layer 'background' debe llevar una part 'color' (es el croma)",
);

for (let i = 0; i < 4; i++) {
  const slotId = `slot-${i}`;
  const slot = calculo.find((layer) => layer.id === slotId);
  assert.ok(slot, `falta el layer '${slotId}'`);
  assert.ok(
    partOf(slot, "slot"),
    `'${slotId}' debe llevar una part 'slot' (la pisa Logic)`,
  );

  for (const type of ["pop", "shake", "bounce", "slide"]) {
    assert.ok(partOf(slot, type), `'${slotId}' debe llevar la part '${type}'`);
  }
  assert.ok(
    slot.parentId,
    `'${slotId}' debe colgar de un padre: los target de bounce/slide son locales`,
  );

  // Logic escribe el texto y prende/apaga estos dos layers por id.
  for (const id of [`${slotId}-question`, `${slotId}-answer`]) {
    const text = findPart<{ type: "text"; autoSize?: boolean; fontKey?: string }>(
      calculo,
      id,
      "text",
    );
    assert.ok(text, `'${id}' debe llevar una part 'text' (la pisa Logic)`);
    assert.equal(text.fontKey, "poppins", `'${id}' debe usar la fuente declarada`);
    const layer = calculo.find((candidate) => candidate.id === id);
    assert.equal(
      layer?.visible,
      false,
      `'${id}' arranca apagado: Logic lo prende al revelar`,
    );
  }
}

// El auto-size solo tiene sentido con un rango real; min > max o min == max lo
// vuelven un tamano fijo disfrazado.
for (const layer of calculo) {
  const text = layer.parts.find((part) => part.type === "text") as
    | { autoSize?: boolean; fontSizeMin?: number; fontSizeMax?: number }
    | undefined;
  if (!text?.autoSize) continue;
  assert.ok(
    typeof text.fontSizeMin === "number" && typeof text.fontSizeMax === "number",
    `'${layer.id}' usa autoSize sin fontSizeMin/fontSizeMax`,
  );
  assert.ok(
    text.fontSizeMin > 0 && text.fontSizeMin < text.fontSizeMax,
    `'${layer.id}': el rango de autoSize debe ser 0 < min < max`,
  );
}

console.log("game: checks ok");

// --- arma la oracion: limpieza y desorden ---

assert.deepEqual(
  splitWords("  El   perro	corre  "),
  ["El", "perro", "corre"],
  "trim, tabs y espacios de mas se colapsan",
);
assert.deepEqual(splitWords(""), [], "una oracion vacia no da palabras");
assert.deepEqual(
  splitWords("Hola​mundo raro"),
  ["Holamundo", "raro"],
  "los caracteres invisibles se caen sin partir la palabra",
);
assert.deepEqual(
  splitWords("¿Quién vino? ¡Nadie!"),
  ["¿Quién", "vino?", "¡Nadie!"],
  "tildes, ñ y signos se conservan",
);

assert.deepEqual(shuffledOrder(0, 1), []);
assert.deepEqual(shuffledOrder(1, 1), [0]);
for (let seed = 0; seed < 50; seed++) {
  for (const count of [2, 3, 7, 12]) {
    const order = shuffledOrder(count, seed);
    assert.deepEqual(
      [...order].sort((a, b) => a - b),
      Array.from({ length: count }, (_, i) => i),
      "el desorden es una permutacion: ninguna palabra se pierde ni se repite",
    );
    assert.ok(
      order.some((value, index) => value !== index),
      "el desorden nunca deja la oracion ya armada",
    );
  }
}
assert.deepEqual(
  shuffledOrder(8, 3),
  shuffledOrder(8, 3),
  "misma semilla, mismo desorden: no se rebaraja en cada render",
);

// --- el layout de arma la oracion contra lo que la logica espera ---

const oracion = JSON.parse(
  readFileSync("src/game/catalog/arma-la-oracion/layout.json", "utf8"),
) as Layer[];

for (const src of ORACION_PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

// Este juego no va sobre croma: el fondo es una part propia y la ficha no
// declara chromaLayerId (si no, el panel ofrecería un color que nadie pinta).
assert.ok(
  findPart(oracion, "background", "backdrop"),
  "el layer 'background' debe llevar la part 'backdrop'",
);
assert.equal(
  findPart(oracion, "background", "color"),
  undefined,
  "'background' no lleva croma: este juego se emite con fondo propio",
);

const board = oracion.find((layer) => layer.id === "board");
assert.ok(board, "falta el layer 'board'");
assert.ok(
  partOf(board, "sentence"),
  "'board' debe llevar una part 'sentence' (la pisa Logic)",
);
for (const type of ["pop", "shake", "bounce", "slide"]) {
  assert.ok(partOf(board, type), `'board' debe llevar la part '${type}'`);
}
assert.ok(
  board.parentId,
  "'board' debe colgar de un padre: los target de bounce/slide son locales",
);
assert.deepEqual(
  board.rect.position,
  { x: 0, y: 0 },
  "'board' arranca en el origen de su padre: es el 'home' al que vuelve bounce",
);

// --- arma la palabra: las letras de los guiones ---

assert.deepEqual(splitLetters(" casa "), ["C", "A", "S", "A"]);
assert.deepEqual(splitLetters(""), [], "una palabra vacia no da guiones");
assert.deepEqual(
  splitLetters("dos palabras"),
  [..."DOSPALABRAS"],
  "los espacios no cuentan como letra: es una sola palabra",
);
assert.deepEqual(
  splitLetters("niño"),
  ["N", "I", "Ñ", "O"],
  "la enie es una sola letra",
);
assert.deepEqual(
  splitLetters("niño"),
  ["N", "I", "Ñ", "O"],
  "una tilde combinante viaja con su letra, no ocupa un guion propio",
);
assert.equal(
  splitLetters("café").length,
  4,
  "los acentos no agregan guiones",
);

// --- el layout de arma la palabra contra lo que la logica espera ---

const palabra = JSON.parse(
  readFileSync("src/game/catalog/arma-la-palabra/layout.json", "utf8"),
) as Layer[];

for (const src of PALABRA_PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

assert.ok(
  findPart(palabra, "background", "backdrop"),
  "el layer 'background' debe llevar la part 'backdrop'",
);
assert.equal(
  findPart(palabra, "background", "color"),
  undefined,
  "'background' no lleva croma: este juego se emite con fondo propio",
);

const wordBoard = palabra.find((layer) => layer.id === "board");
assert.ok(wordBoard, "falta el layer 'board'");
const blanks = partOf<{
  type: "blanks";
  letters?: string[];
  order?: number[];
  revealed?: number;
}>(wordBoard, "blanks");
assert.ok(blanks, "'board' debe llevar una part 'blanks' (la pisa Logic)");
// Logic pisa las tres: sin 'order' en el layout, applyState fusiona un campo que
// la vista lee para repartir el pozo de letras y el pozo sale vacio.
for (const field of ["letters", "order", "revealed"] as const) {
  assert.ok(
    blanks[field] !== undefined,
    `la part 'blanks' debe declarar '${field}'`,
  );
}
for (const type of ["pop", "shake", "bounce", "slide"]) {
  assert.ok(partOf(wordBoard, type), `'board' debe llevar la part '${type}'`);
}
assert.ok(
  wordBoard.parentId,
  "'board' debe colgar de un padre: los target de bounce/slide son locales",
);
assert.deepEqual(
  wordBoard.rect.position,
  { x: 0, y: 0 },
  "'board' arranca en el origen de su padre: es el 'home' al que vuelve bounce",
);

// --- el layout de la sabes o no contra lo que la logica espera ---

const sabes = JSON.parse(
  readFileSync("src/game/catalog/la-sabes-o-no/layout.json", "utf8"),
) as Layer[];

for (const src of SABES_PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

// El fondo es video, no croma: preloadMedia no lo calienta, asi que el unico
// aviso de que la ruta esta rota seria un rectangulo negro al aire.
const sabesVideo = findPart<{ type: "video"; src: string }>(
  sabes,
  "background",
  "video",
);
assert.ok(sabesVideo, "'background' debe llevar una part 'video'");
assert.ok(
  existsSync(`public${sabesVideo.src}`),
  `el video de fondo no existe: ${sabesVideo.src}`,
);

// La part 'mask' recorta usando el src de la part 'image' del mismo layer: sin
// esa image no recorta nada y el croma desborda el marco, sin error en consola.
const sabesMask = sabes.find((layer) => layer.id === "mask");
assert.ok(sabesMask, "falta el layer 'mask'");
assert.ok(partOf(sabesMask, "mask"), "'mask' debe llevar la part 'mask'");
assert.ok(
  partOf<{ type: "image"; src: string }>(sabesMask, "image")?.src,
  "'mask' debe llevar una part 'image': es la que da la forma del recorte",
);

const sabesCroma = sabes.find((layer) => layer.id === "croma");
assert.ok(sabesCroma, "falta el layer 'croma'");
assert.ok(partOf(sabesCroma, "color"), "'croma' debe llevar una part 'color'");
assert.equal(
  sabesCroma.parentId,
  "mask",
  "'croma' cuelga de 'mask': es lo que lo recorta a la forma del marco",
);

assert.ok(
  findPart(sabes, "question-text", "text"),
  "'question-text' debe llevar una part 'text' (la pisa Logic)",
);

for (let option = 0; option < 2; option++) {
  for (const mark of ["normal", "correct", "incorrect"]) {
    const frameId = `option-${option}-frame-${mark}`;
    const frameLayer = sabes.find((layer) => layer.id === frameId);
    assert.ok(frameLayer, `falta el layer '${frameId}' (lo prende/apaga Logic)`);
    const marco = partOf<{ type: "image"; src: string }>(frameLayer, "image");
    assert.ok(marco, `'${frameId}' debe llevar una part 'image'`);
    assert.ok(
      SABES_PRELOAD.includes(marco.src),
      `'${frameId}' se intercambia en vivo: su marco debe estar en PRELOAD`,
    );
    assert.equal(
      frameLayer.visible,
      mark === "normal",
      `'${frameId}' arranca ${mark === "normal" ? "prendido" : "apagado"}`,
    );

    const textoId = `option-${option}-text-${mark}`;
    const texto = findPart<{ type: "text"; fontKey?: string }>(
      sabes,
      textoId,
      "text",
    );
    assert.ok(texto, `'${textoId}' debe llevar una part 'text' (la pisa Logic)`);
    assert.equal(
      texto.fontKey,
      "jetBrainsMono",
      `'${textoId}' debe usar la fuente declarada en la ficha`,
    );
  }
}

console.log("la sabes o no: checks ok");

// --- el layout de mi libro favorito contra lo que la logica espera ---

const libro = JSON.parse(
  readFileSync("src/game/catalog/mi-libro-favorito/layout.json", "utf8"),
) as Layer[];

for (const src of LIBRO_PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

assert.ok(
  findPart(libro, "background", "color"),
  "el layer 'background' debe llevar una part 'color' (es el croma)",
);

// Logic escribe el texto y anima el marco por estos dos ids.
assert.ok(
  findPart(libro, "question-text", "text"),
  "'question-text' debe llevar una part 'text' (la pisa Logic)",
);
const questionFrame = libro.find((layer) => layer.id === "question-frame");
assert.ok(questionFrame, "falta el layer 'question-frame'");
for (const type of ["pop", "shake", "bounce", "slide"]) {
  assert.ok(
    partOf(questionFrame, type),
    `'question-frame' debe llevar la part '${type}'`,
  );
}
// El marco arranca fuera de cuadro y entra con 'bounce' (target {0,0}); si el
// layout lo pusiera en su sitio, el juego abriria con la pregunta al aire.
assert.ok(
  questionFrame.parentId,
  "'question-frame' debe colgar de un padre: los target de bounce/slide son locales",
);
assert.deepEqual(
  partOf<{ type: "bounce"; target: { x: number; y: number } }>(
    questionFrame,
    "bounce",
  )?.target,
  { x: 0, y: 0 },
  "'question-frame' vuelve al origen de su padre cuando entra",
);
assert.deepEqual(
  questionFrame.rect.position,
  partOf<{ type: "slide"; target: { x: number; y: number } }>(
    questionFrame,
    "slide",
  )?.target,
  "'question-frame' arranca donde lo deja 'slide': fuera de cuadro",
);

for (let side = 0; side < 2; side++) {
  const name = ["left", "right"][side];

  const content = libro.find((layer) => layer.id === `content-${name}`);
  assert.ok(content, `falta el layer 'content-${name}'`);
  for (const type of ["bounce", "slide"]) {
    assert.ok(
      partOf(content, type),
      `'content-${name}' debe llevar la part '${type}'`,
    );
  }
  assert.ok(
    findPart(libro, `name-text-${name}`, "text"),
    `'name-text-${name}' debe llevar una part 'text' (la pisa Logic)`,
  );

  // Los corazones entran deslizandose desde fuera de su caja: sin la part
  // 'mask' en el contenedor se los ve viajar por encima del banner.
  const lives = libro.find((layer) => layer.id === `lives-${name}`);
  assert.ok(lives, `falta el layer 'lives-${name}'`);
  assert.ok(
    partOf(lives, "mask"),
    `'lives-${name}' debe llevar la part 'mask': es lo que recorta la entrada`,
  );
  assert.equal(
    partOf<{ type: "image" }>(lives, "image"),
    undefined,
    `'lives-${name}' recorta a su rect, sin silueta: no lleva part 'image'`,
  );

  for (let i = 0; i < 5; i++) {
    const slot = libro.find((layer) => layer.id === `heart-slot-${name}-${i}`);
    assert.ok(slot, `falta el layer 'heart-slot-${name}-${i}'`);
    assert.equal(
      slot.parentId,
      `lives-${name}`,
      `'heart-slot-${name}-${i}' cuelga del contenedor que lo recorta`,
    );

    const rootId = `heart-root-${name}-${i}`;
    const root = libro.find((layer) => layer.id === rootId);
    assert.ok(root, `falta el layer '${rootId}'`);
    assert.equal(root.parentId, slot.id, `'${rootId}' cuelga de su casilla`);
    for (const type of ["bounce", "blink"]) {
      assert.ok(partOf(root, type), `'${rootId}' debe llevar la part '${type}'`);
    }
    assert.ok(
      root.rect.position.y < 0,
      `'${rootId}' arranca fuera de la caja: Logic lo hace entrar con 'bounce'`,
    );

    // Logic intercambia estos dos al quitar una vida; los dos van en PRELOAD o
    // el corazon roto parpadea la primera vez, al aire.
    for (const [kind, src] of [
      ["full", HEARTS.full],
      ["broken", HEARTS.broken],
    ] as const) {
      const id = `heart-${kind}-${name}-${i}`;
      const image = findPart<{ type: "image"; src: string }>(libro, id, "image");
      assert.ok(image, `'${id}' debe llevar una part 'image'`);
      assert.equal(image.src, src, `'${id}' debe usar el corazon ${kind}`);
      const layer = libro.find((candidate) => candidate.id === id);
      assert.equal(
        layer?.parentId,
        rootId,
        `'${id}' cuelga del root que lo anima`,
      );
      assert.equal(
        layer?.visible,
        kind === "full",
        `'${id}' arranca ${kind === "full" ? "prendido" : "apagado"}`,
      );
    }
  }
}

console.log("mi libro favorito: checks ok");

// --- la sesion ZIP ---

// readZipSession devuelve Blobs y NO object URLs a proposito: la sesion es la
// unica que crea las URLs, asi que un paquete que no pase el type-guard del
// juego no deja nada que revocar. Es tambien lo que lo hace testeable en node,
// donde URL.createObjectURL no existe.
{
  const zip = new JSZip();
  zip.file(ZIP_SESSION_JSON, JSON.stringify({ rounds: [{ imagePath: "images/T1.png" }] }));
  zip.file("images/T1.png", Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  zip.file("images/T2.jpg", Buffer.from([0xff, 0xd8, 0xff]));

  const bundle = await zip.generateAsync({ type: "blob" });
  const file = new File([bundle], "session.zip", { type: "application/zip" });

  const { data, images } = await readZipSession(file);
  assert.deepEqual(
    (data as { rounds: { imagePath: string }[] }).rounds[0].imagePath,
    "images/T1.png",
    "el JSON del paquete sale parseado",
  );
  assert.deepEqual(
    Object.keys(images).sort(),
    ["images/T1.png", "images/T2.jpg"],
    "las imagenes se indexan por la misma ruta que guarda el JSON",
  );
  assert.equal(
    images[ZIP_SESSION_JSON],
    undefined,
    "el propio sessionData.json no entra como imagen",
  );
  assert.equal(await images["images/T1.png"].arrayBuffer().then((b) => b.byteLength), 4);

  // El blob que devuelve JSZip viene con type "" y una blob: URL sin MIME no
  // decodifica: no hay sniffing de contenido, el tipo sale del Blob. Sin esto
  // decode() falla y la foto no aparece, al aire.
  assert.equal(images["images/T1.png"].type, "image/png");
  assert.equal(images["images/T2.jpg"].type, "image/jpeg");

  const sinJson = new JSZip();
  sinJson.file("images/T1.png", Buffer.from([0x89]));
  const roto = new File([await sinJson.generateAsync({ type: "blob" })], "roto.zip");
  await assert.rejects(
    () => readZipSession(roto),
    /sessionData\.json/,
    "un paquete sin sessionData.json falla con un mensaje que lo nombra",
  );
}

console.log("sesion zip: checks ok");

// --- a que rama de precarga va cada asset ---

// El bug que motivo [[RM-086]]: un .mp4 caia en la rama de imagen
// (new Image().src = "…mp4"), fallaba en silencio y nadie esperaba nada.
assert.equal(mediaKind("/x/background-blue.mp4"), "video");
assert.equal(mediaKind("/x/clip.webm"), "video");
assert.equal(mediaKind("/x/correct.mp3"), "audio");
assert.equal(mediaKind("/x/correct.WAV"), "audio", "la extension no distingue mayusculas");
assert.equal(mediaKind("/x/main-frame.png"), "image");
// Las imagenes de la sesion llegan como blob: y no tienen extension: van a
// decode(), que es la rama correcta.
assert.equal(mediaKind("blob:http://localhost/9f2c-1"), "image");

// Todo lo que declara un juego en PRELOAD tiene que caer en una rama que exista.
for (const src of [
  ...PRELOAD,
  ...CALCULO_PRELOAD,
  ...ORACION_PRELOAD,
  ...PALABRA_PRELOAD,
  ...SABES_PRELOAD,
  ...LIBRO_PRELOAD,
  ...INTRUSO_PRELOAD,
  ...VUELO_PRELOAD,
]) {
  assert.ok(
    ["audio", "video", "image"].includes(mediaKind(src)),
    `asset sin rama de precarga: ${src}`,
  );
}

console.log("precarga: checks ok");

// --- el layout de intruso contra lo que la logica espera ---

const intruso = JSON.parse(
  readFileSync("src/game/catalog/intruso/layout.json", "utf8"),
) as Layer[];

for (const src of INTRUSO_PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

// Este juego no va sobre croma: el fondo es video y el hueco del marco lo llena
// la foto de la sesion. Si el layout trajera un layer de color, la ficha
// tendria que declarar chromaLayerId o el panel ofreceria un color que nadie
// pinta.
assert.equal(
  intruso.find((layer) => layer.parts.some((part) => part.type === "color")),
  undefined,
  "intruso no lleva croma: el fondo es video y el hueco lo llena la foto",
);

// El unico src vacio del layout: lo llena Logic con la imagen de la sesion.
const picture = findPart<{ type: "image"; src: string }>(
  intruso,
  "picture",
  "image",
);
assert.ok(picture, "'picture' debe llevar una part 'image' (la pisa Logic)");
assert.equal(
  picture.src,
  "",
  "'picture' arranca vacia: la foto llega con la sesion, no con el deploy",
);

// La foto se recorta con la silueta del marco, que no se dibuja.
const intrusoMask = intruso.find((layer) => layer.id === "mask");
assert.ok(intrusoMask, "falta el layer 'mask'");
assert.ok(partOf(intrusoMask, "mask"), "'mask' debe llevar la part 'mask'");
assert.ok(
  partOf<{ type: "image"; src: string }>(intrusoMask, "image")?.src,
  "'mask' debe llevar una part 'image': es la que da la forma del recorte",
);
assert.equal(
  intruso.find((layer) => layer.id === "picture")?.parentId,
  "mask",
  "'picture' cuelga de 'mask': es lo que la recorta",
);

for (let option = 0; option < 4; option++) {
  assert.ok(
    findPart(intruso, `option-${option}-text`, "text"),
    `'option-${option}-text' debe llevar una part 'text' (la pisa Logic)`,
  );
  for (const mark of ["normal", "correct", "incorrect"]) {
    const id = `option-${option}-frame-${mark}`;
    const layer = intruso.find((candidate) => candidate.id === id);
    assert.ok(layer, `falta el layer '${id}' (lo prende/apaga Logic)`);
    const image = partOf<{ type: "image"; src: string }>(layer, "image");
    assert.ok(image, `'${id}' debe llevar una part 'image'`);
    assert.ok(
      INTRUSO_PRELOAD.includes(image.src),
      `'${id}' se intercambia en vivo: su marco debe estar en PRELOAD`,
    );
    assert.equal(
      layer.visible,
      mark === "normal",
      `'${id}' arranca ${mark === "normal" ? "prendido" : "apagado"}`,
    );
  }
}

// --- intruso nivel 2 ---

const intrusoLevel1 = intruso.find((layer) => layer.id === "level-1");
const intrusoLevel2 = intruso.find((layer) => layer.id === "level-2");
assert.ok(intrusoLevel1, "falta el contenedor 'level-1'");
assert.ok(intrusoLevel2, "falta el contenedor 'level-2'");
assert.equal(intrusoLevel1.visible, true, "'level-1' arranca prendido");
assert.equal(intrusoLevel2.visible, false, "'level-2' arranca apagado");
for (const id of ["main-frame", "options"]) {
  assert.equal(
    intruso.find((layer) => layer.id === id)?.parentId,
    "level-1",
    `'${id}' cuelga de 'level-1': es lo que apaga el nivel entero de una`,
  );
}

const INTRUSO_COLORS = ["red", "green", "yellow", "blue"];

for (let card = 0; card < 4; card++) {
  const id = `photo-${card}`;
  assert.equal(
    intruso.find((layer) => layer.id === id)?.parentId,
    "photos",
    `'${id}' cuelga de 'photos'`,
  );

  const color = findPart<{ type: "image"; src: string }>(
    intruso,
    `${id}-color`,
    "image",
  );
  assert.ok(color, `'${id}-color' debe llevar una part 'image'`);
  assert.ok(
    color.src.endsWith(`/color/${INTRUSO_COLORS[card]}.png`),
    `'${id}-color' va en ${INTRUSO_COLORS[card]}: es el orden del array colors[] de Unity`,
  );

  const cardMask = intruso.find((layer) => layer.id === `${id}-mask`);
  assert.ok(cardMask, `falta el layer '${id}-mask'`);
  assert.ok(partOf(cardMask, "mask"), `'${id}-mask' debe llevar la part 'mask'`);
  assert.ok(
    partOf<{ type: "image"; src: string }>(cardMask, "image")?.src,
    `'${id}-mask' debe llevar una part 'image': es la forma del recorte`,
  );

  const cardPicture = findPart<{ type: "image"; src: string; fit?: string }>(
    intruso,
    `${id}-picture`,
    "image",
  );
  assert.ok(cardPicture, `'${id}-picture' debe llevar una part 'image'`);
  assert.equal(cardPicture.src, "", `'${id}-picture' arranca sin src`);
  assert.equal(
    cardPicture.fit,
    "cover",
    `'${id}-picture' va en 'cover': el recorte 3:4 del colector llena el hueco sin franjas`,
  );

  const cardText = findPart<{ type: "text"; fontKey?: string }>(
    intruso,
    `${id}-text`,
    "text",
  );
  assert.ok(cardText, `'${id}-text' debe llevar una part 'text' (la pisa Logic)`);
  assert.equal(
    cardText.fontKey,
    "geniusTechno",
    `'${id}-text' usa la fuente que declara la ficha`,
  );

  for (const state of ["normal", "correct", "incorrect"]) {
    const frameId = `${id}-frame-${state}`;
    const frame = intruso.find((layer) => layer.id === frameId);
    assert.ok(frame, `falta el layer '${frameId}' (lo prende/apaga Logic)`);
    const image = partOf<{ type: "image"; src: string }>(frame, "image");
    assert.ok(image, `'${frameId}' debe llevar una part 'image'`);
    assert.ok(
      INTRUSO_PRELOAD.includes(image.src),
      `'${frameId}' se intercambia en vivo al validar: debe estar en PRELOAD`,
    );
    assert.equal(
      frame.visible,
      state === "normal",
      `'${frameId}' arranca ${state === "normal" ? "prendido" : "apagado"}`,
    );
  }
}

// --- los dos niveles son independientes ---

const intrusoText = {
  imagePath: "images/T1.png",
  answerIndex: 0,
  choices: ["a", "b", "c", "d"],
};
const intrusoPhoto = {
  description: "ctx",
  answerIndex: 1,
  choices: [0, 1, 2, 3].map((i) => ({
    label: `L${i}`,
    imagePath: `images/P1_I${i}.png`,
  })),
};

const intrusoAccepts: [string, unknown][] = [
  ["ambos niveles", { textRounds: [intrusoText], photoRounds: [intrusoPhoto] }],
  ["solo nivel 1", { textRounds: [intrusoText], photoRounds: [] }],
  ["solo nivel 2", { textRounds: [], photoRounds: [intrusoPhoto] }],
  ["los dos vacios", { textRounds: [], photoRounds: [] }],
  [
    "nivel 1 con 3 opciones",
    { textRounds: [{ ...intrusoText, choices: ["a", "b", "c"] }], photoRounds: [] },
  ],
  [
    "nivel 2 con 2 fotos",
    {
      textRounds: [],
      photoRounds: [{ ...intrusoPhoto, choices: intrusoPhoto.choices.slice(0, 2) }],
    },
  ],
];

for (const [name, data] of intrusoAccepts) {
  assert.ok(isIntrusoSession(data), `el guard debe aceptar: ${name}`);
}

const intrusoRejects: [string, unknown][] = [
  ["falta photoRounds", { textRounds: [intrusoText] }],
  ["falta textRounds", { photoRounds: [intrusoPhoto] }],
  [
    "nivel 1 con 5 opciones",
    {
      textRounds: [{ ...intrusoText, choices: ["a", "b", "c", "d", "e"] }],
      photoRounds: [],
    },
  ],
  [
    "foto sin label",
    { textRounds: [], photoRounds: [{ ...intrusoPhoto, choices: [{ imagePath: "x" }] }] },
  ],
  ["otro juego", { groups: [] }],
];

for (const [name, data] of intrusoRejects) {
  assert.ok(!isIntrusoSession(data), `el guard debe rechazar: ${name}`);
}

console.log("intruso: checks ok");

// --- el layout de al vuelo contra lo que la logica espera ---

const vuelo = JSON.parse(
  readFileSync("src/game/catalog/al-vuelo/layout.json", "utf8"),
) as Layer[];

for (const src of VUELO_PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

assert.ok(
  findPart(vuelo, "background", "color"),
  "el layer 'background' debe llevar una part 'color' (es el croma)",
);
assert.ok(
  findPart(vuelo, "question-text", "text"),
  "'question-text' debe llevar una part 'text' (la pisa Logic)",
);

// El colector permite guardar una pregunta sin respuesta marcada (answer: null).
// Sin el -1, `answer ? 0 : 1` daria "No" por correcta y saldria asi al aire.
assert.equal(correctOption({ question: "x", answer: true }), 0);
assert.equal(correctOption({ question: "x", answer: false }), 1);
assert.equal(
  correctOption({ question: "x", answer: null }),
  -1,
  "sin respuesta marcada no hay opcion correcta: no se marca ninguna",
);

// Las dos opciones son fijas (SI / NO) y viven en el layout: Logic no las pisa,
// asi que si alguna quedara vacia el juego saldria sin etiquetas.
for (let option = 0; option < 2; option++) {
  const label = findPart<{ type: "text"; text: string }>(
    vuelo,
    `option-${option}-text`,
    "text",
  );
  assert.ok(label, `'option-${option}-text' debe llevar una part 'text'`);
  assert.ok(
    label.text.trim().length > 0,
    `'option-${option}-text' es fija y debe traer su etiqueta en el layout`,
  );

  for (const mark of ["normal", "correct", "incorrect"]) {
    const id = `option-${option}-frame-${mark}`;
    const layer = vuelo.find((candidate) => candidate.id === id);
    assert.ok(layer, `falta el layer '${id}' (lo prende/apaga Logic)`);
    const image = partOf<{ type: "image"; src: string }>(layer, "image");
    assert.ok(image, `'${id}' debe llevar una part 'image'`);
    assert.ok(
      VUELO_PRELOAD.includes(image.src),
      `'${id}' se intercambia en vivo: su marco debe estar en PRELOAD`,
    );
    assert.equal(
      layer.visible,
      mark === "normal",
      `'${id}' arranca ${mark === "normal" ? "prendido" : "apagado"}`,
    );
  }
}

console.log("al vuelo: checks ok");

// --- imagenes espejadas ---

// El layout trae `flipX` desde Games y la vista lo aplica con scaleX(-1). Es
// data que viaja callada: si una conversion la pierde o la vista deja de
// leerla, el marco sale al derecho y solo se nota mirandolo.
const flipped: [Layer[], string, boolean][] = [
  [vuelo, "option-0-frame-normal", false],
  [vuelo, "option-1-frame-normal", true],
  [vuelo, "option-1-frame-correct", true],
  [vuelo, "option-1-frame-incorrect", true],
  [libro, "name-frame-left", false],
  [libro, "name-frame-right", true],
];

for (const [layout, id, expected] of flipped) {
  const image = findPart<{ type: "image"; flipX?: boolean }>(
    layout,
    id,
    "image",
  );
  assert.ok(image, `falta la part 'image' de '${id}'`);
  assert.equal(
    image.flipX === true,
    expected,
    expected
      ? `'${id}' va espejado: es el mismo asset que su par, dado vuelta`
      : `'${id}' NO va espejado`,
  );
}

console.log("espejado: checks ok");

// --- el layout de album contra lo que la logica espera ---

const album = JSON.parse(
  readFileSync("src/game/catalog/album/layout.json", "utf8"),
) as Layer[];

const albumLayer = (id: string) => album.find((layer) => layer.id === id);

for (const src of ALBUM_PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

// El fondo es video, no croma: si la ruta se rompe el aviso es un rectangulo
// negro al aire, sin error en consola.
const albumVideo = findPart<{ type: "video"; src: string }>(
  album,
  "background",
  "video",
);
assert.ok(albumVideo, "'background' debe llevar una part 'video'");
assert.ok(
  existsSync(`public${albumVideo.src}`),
  `el video de fondo no existe: ${albumVideo.src}`,
);

// Logic arranca en la pantalla de temas y enciende 'gameplay' al entrar a las
// cartas. Si el layout arrancara al reves, el juego abriria con las cartas.
assert.equal(albumLayer("themes")?.visible, true, "'themes' arranca prendido");
assert.equal(
  albumLayer("gameplay")?.visible,
  false,
  "'gameplay' arranca apagado: lo enciende Logic",
);

assert.ok(
  findPart(album, "round-title", "text"),
  "'round-title' debe llevar una part 'text' (la pisa Logic)",
);

for (let theme = 0; theme < 6; theme++) {
  for (const state of ["normal", "locked"]) {
    const id = `theme-${theme}-${state}`;
    const layer = albumLayer(id);
    assert.ok(layer, `falta el layer '${id}' (lo prende/apaga Logic)`);
    const image = partOf<{ type: "image"; src: string; filter?: string }>(
      layer,
      "image",
    );
    assert.ok(image, `'${id}' debe llevar una part 'image'`);
    assert.ok(
      ALBUM_PRELOAD.includes(image.src),
      `'${id}' sale al aire: su grafica debe estar en PRELOAD`,
    );
    // El tema bloqueado es el MISMO asset atenuado con `filter`. Si el campo se
    // pierde en una conversion, bloquear un tema no se nota en pantalla.
    assert.equal(
      image.filter,
      state === "locked" ? "brightness(48%)" : undefined,
      `'${id}' ${state === "locked" ? "va atenuado con filter" : "no lleva filter"}`,
    );
    assert.ok(
      findPart(album, `${id}-title`, "text"),
      `'${id}-title' debe llevar una part 'text' (la pisa Logic)`,
    );
  }
  // Solo el tema normal flota; el bloqueado se queda quieto.
  assert.ok(
    partOf(albumLayer(`theme-${theme}-normal`), "float"),
    `'theme-${theme}-normal' debe llevar la part 'float'`,
  );
}

for (let card = 0; card < 5; card++) {
  const id = `card-${card}`;
  const layer = albumLayer(id);
  assert.ok(layer, `falta el layer '${id}'`);
  // El volteo anima la carta entera: 'flip' va en el padre, no en cada cara.
  // Puesto en una cara, la otra no gira y el cambio se ve de golpe.
  for (const type of ["flip", "float", "holo"]) {
    assert.ok(partOf(layer, type), `'${id}' debe llevar la part '${type}'`);
  }

  for (const face of ["back", "front"]) {
    const faceId = `${id}-${face}`;
    const faceLayer = albumLayer(faceId);
    assert.ok(faceLayer, `falta el layer '${faceId}' (lo prende/apaga Logic)`);
    assert.equal(
      faceLayer.parentId,
      id,
      `'${faceId}' cuelga de '${id}': es lo que hace que 'flip' las voltee juntas`,
    );
    assert.equal(
      faceLayer.visible,
      face === "back",
      `'${faceId}' arranca ${face === "back" ? "prendido" : "apagado"}`,
    );

    const bg = findPart<{ type: "image"; src: string }>(
      album,
      `${faceId}-bg`,
      "image",
    );
    assert.ok(bg, `'${faceId}-bg' debe llevar una part 'image'`);
    // Logic cambia este fondo por ronda (un color por tema) y por la carta
    // croma: los 7 se intercambian en vivo y tienen que estar precargados.
    assert.ok(
      [...CARD_COLORS, CARD_CROMA].includes(bg.src),
      `'${faceId}-bg' debe arrancar con una de las cartas del juego`,
    );
  }

  assert.ok(
    findPart(album, `${id}-question`, "text"),
    `'${id}-question' debe llevar una part 'text' (la pisa Logic)`,
  );

  // La part 'mask' recorta con el src de la part 'image' hermana: sin esa
  // image la foto desborda la carta, sin error en consola.
  const photo = albumLayer(`${id}-photo`);
  assert.ok(photo, `falta el layer '${id}-photo'`);
  assert.ok(partOf(photo, "mask"), `'${id}-photo' debe llevar la part 'mask'`);
  assert.ok(
    partOf<{ type: "image"; src: string }>(photo, "image")?.src,
    `'${id}-photo' debe llevar una part 'image': es la forma del recorte`,
  );
  assert.equal(
    photo.visible,
    false,
    `'${id}-photo' arranca apagado: la carta abre con la pregunta`,
  );

  const color = albumLayer(`${id}-photo-color`);
  assert.ok(color, `falta el layer '${id}-photo-color'`);
  assert.ok(partOf(color, "image"), `'${id}-photo-color' debe llevar 'image'`);
  // Los destellos los enciende Logic solo en la carta croma.
  assert.ok(
    partOf(color, "sparkles"),
    `'${id}-photo-color' debe llevar la part 'sparkles'`,
  );

  // Es la MISMA foto que la de color, en gris por `filter`. Si el campo se
  // pierde, marcar error muestra la foto a color y parece que acerto.
  const gray = findPart<{ type: "image"; filter?: string }>(
    album,
    `${id}-photo-gray`,
    "image",
  );
  assert.ok(gray, `'${id}-photo-gray' debe llevar una part 'image'`);
  assert.equal(
    gray.filter,
    "grayscale(1)",
    `'${id}-photo-gray' va en gris con filter`,
  );
}

// Las fuentes se resuelven por clave contra el FontRegistry de la ficha: una
// clave que la ficha no declare cae al font por defecto, sin error.
const albumFonts = new Set(
  album.flatMap((layer) =>
    layer.parts
      .map((part) => (part as { fontKey?: string }).fontKey)
      .filter((key): key is string => Boolean(key)),
  ),
);
assert.deepEqual(
  [...albumFonts].sort(),
  ["geniusTechno", "jetBrainsMono", "retroGaming"],
  "las claves de fuente del layout son las que declara la ficha",
);

console.log("album: checks ok");

// --- el layout de cronos contra lo que la logica y el drag esperan ---

const cronos = JSON.parse(
  readFileSync("src/game/catalog/cronos/layout.json", "utf8"),
) as Layer[];

const cronosLayer = (id: string) => cronos.find((layer) => layer.id === id);

for (const src of CRONOS_PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

const cronosVideo = findPart<{ type: "video"; src: string }>(
  cronos,
  "background",
  "video",
);
assert.ok(cronosVideo, "'background' debe llevar una part 'video'");
assert.ok(
  existsSync(`public${cronosVideo.src}`),
  `el video de fondo no existe: ${cronosVideo.src}`,
);

assert.ok(
  findPart(cronos, "title", "text"),
  "'title' debe llevar una part 'text' (la pisa Logic)",
);

// El cronometro lee su duracion del layout. Sin la part, Logic cae al default de
// 30 s y el reloj sale con un tiempo que nadie configuro.
const cronosTimer = findPart<{ type: "timer"; duration: number }>(
  cronos,
  "timer",
  "timer",
);
assert.ok(cronosTimer, "'timer' debe llevar una part 'timer' con su duracion");
assert.ok(
  cronosTimer.duration > 0,
  "la duracion del cronometro debe ser mayor que cero",
);
assert.ok(
  findPart(cronos, "timer", "text"),
  "'timer' debe llevar tambien una part 'text': es donde se pinta la cuenta",
);

for (let slot = 0; slot < 5; slot++) {
  // --- la zona de soltado ---
  const zoneId = `zone-${slot}-target`;
  const zone = cronosLayer(zoneId);
  // El drag encuentra la zona por este id exacto (/^zone-\d+-target$/) via
  // elementsFromPoint. Si el layout la renombrara, soltar devolveria la carta a
  // casa siempre, sin un error en consola.
  assert.ok(zone, `falta el layer '${zoneId}' (lo busca la part 'drag')`);
  assert.ok(partOf(zone, "image"), `'${zoneId}' debe llevar una part 'image'`);

  assert.ok(
    findPart(cronos, `zone-${slot}-date`, "text"),
    `'zone-${slot}-date' debe llevar una part 'text' (la pisa Logic)`,
  );

  for (const mark of ["normal", "correct", "incorrect"]) {
    const id = `zone-${slot}-point-${mark}`;
    const layer = cronosLayer(id);
    assert.ok(layer, `falta el layer '${id}' (lo prende/apaga Logic)`);
    const image = partOf<{ type: "image"; src: string }>(layer, "image");
    assert.ok(image, `'${id}' debe llevar una part 'image'`);
    assert.ok(
      CRONOS_PRELOAD.includes(image.src),
      `'${id}' se intercambia en vivo al validar: debe estar en PRELOAD`,
    );
    assert.equal(
      layer.visible,
      mark === "normal",
      `'${id}' arranca ${mark === "normal" ? "prendido" : "apagado"}`,
    );
  }

  // --- la carta ---
  const cardId = `card-${slot}`;
  const card = cronosLayer(cardId);
  assert.ok(card, `falta el layer '${cardId}'`);
  // Sin la part 'drag' la carta se ve perfecta y no se puede arrastrar.
  assert.ok(partOf(card, "drag"), `'${cardId}' debe llevar la part 'drag'`);
  assert.equal(
    card.visible,
    false,
    `'${cardId}' arranca apagado: lo revela la tecla A`,
  );
  // El drag devuelve la carta a `rect.position`, que es LOCAL a su padre. Si la
  // jerarquia se aplanara, soltar fuera de una zona la mandaria al centro de la
  // pantalla en vez de a su hueco.
  assert.equal(
    card.parentId,
    `slot-${slot}`,
    `'${cardId}' cuelga de 'slot-${slot}': su casa es una posicion local`,
  );

  // La part 'mask' recorta con el src de la part 'image' hermana; sin esa image
  // la foto de la sesion desborda la carta.
  const mask = cronosLayer(`${cardId}-mask`);
  assert.ok(mask, `falta el layer '${cardId}-mask'`);
  assert.ok(partOf(mask, "mask"), `'${cardId}-mask' debe llevar la part 'mask'`);
  assert.ok(
    partOf<{ type: "image"; src: string }>(mask, "image")?.src,
    `'${cardId}-mask' debe llevar una part 'image': es la forma del recorte`,
  );

  assert.ok(
    findPart(cronos, `${cardId}-photo`, "image"),
    `'${cardId}-photo' debe llevar una part 'image' (la pisa Logic)`,
  );
  assert.ok(
    findPart(cronos, `${cardId}-title`, "text"),
    `'${cardId}-title' debe llevar una part 'text' (la pisa Logic)`,
  );
}

// Ningun id quedo en UUID tras la conversion: los slugs son lo que hace legibles
// a Logic y a estos checks.
for (const layer of cronos) {
  assert.ok(
    !/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(layer.id),
    `'${layer.id}' sigue siendo un UUID de Games`,
  );
}

const cronosFonts = new Set(
  cronos.flatMap((layer) =>
    layer.parts
      .map((part) => (part as { fontKey?: string }).fontKey)
      .filter((key): key is string => Boolean(key)),
  ),
);
assert.deepEqual(
  [...cronosFonts],
  ["geniusTechno"],
  "las claves de fuente del layout son las que declara la ficha",
);

console.log("cronos: checks ok");

// --- el layout de tres en raya contra lo que la logica y el clic esperan ---

const raya = JSON.parse(
  readFileSync("src/game/catalog/tres-en-raya/layout.json", "utf8"),
) as Layer[];

const rayaLayer = (id: string) => raya.find((layer) => layer.id === id);

for (const src of RAYA_PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

const rayaVideo = findPart<{ type: "video"; src: string }>(
  raya,
  "background",
  "video",
);
assert.ok(rayaVideo, "'background' debe llevar una part 'video'");
assert.ok(
  existsSync(`public${rayaVideo.src}`),
  `el video de fondo no existe: ${rayaVideo.src}`,
);

// El orden de esta lista ES el contrato: Logic indexa 0-2 filas, 3-5 columnas,
// 6 la diagonal 0-4-8 y 7 la 2-4-6, igual que los hijos de "Lines" en Unity.
// Reordenarlas enciende la linea equivocada, y en pantalla parece plausible.
const RAYA_LINES = [
  "line-row-0",
  "line-row-1",
  "line-row-2",
  "line-column-0",
  "line-column-1",
  "line-column-2",
  "line-diagonal-0",
  "line-diagonal-1",
];

for (const id of RAYA_LINES) {
  const layer = rayaLayer(id);
  assert.ok(layer, `falta el layer '${id}' (lo enciende Logic al validar)`);
  const image = partOf<{ type: "image"; src: string; flipX?: boolean }>(
    layer,
    "image",
  );
  assert.ok(image, `'${id}' debe llevar una part 'image'`);
  assert.ok(
    RAYA_PRELOAD.includes(image.src),
    `'${id}' aparece en vivo al validar: debe estar en PRELOAD`,
  );
  assert.equal(layer.visible, false, `'${id}' arranca apagado`);
}

// Las dos diagonales comparten el mismo PNG; la 0-4-8 va espejada. Si se pierde
// el flipX, las dos apuntan al mismo lado y una marca la casilla que no es.
assert.equal(
  findPart<{ type: "image"; flipX?: boolean }>(raya, "line-diagonal-0", "image")
    ?.flipX,
  true,
  "'line-diagonal-0' va espejada (era el eulerHint 180 del prefab)",
);
assert.ok(
  !findPart<{ type: "image"; flipX?: boolean }>(raya, "line-diagonal-1", "image")
    ?.flipX,
  "'line-diagonal-1' NO va espejada",
);

const RAYA_COLUMN_X = [-514, 0, 514];
const RAYA_ROW_Y = [299, 0, -299];

for (let i = 0; i < 9; i++) {
  const id = `card-${i}`;
  const card = rayaLayer(id);
  assert.ok(card, `falta el layer '${id}'`);
  // Sin 'click' la carta se ve perfecta y no responde; sin 'flip' no gira.
  // Ninguna de las dos ausencias deja rastro en consola.
  assert.ok(partOf(card, "click"), `'${id}' debe llevar la part 'click'`);
  assert.ok(partOf(card, "flip"), `'${id}' debe llevar la part 'flip'`);
  assert.deepEqual(
    card.rect.position,
    { x: RAYA_COLUMN_X[i % 3], y: RAYA_ROW_Y[Math.floor(i / 3)] },
    `'${id}' va en la celda ${i} leyendo el tablero por filas`,
  );

  // La validacion asume que la casilla i muestra el numero i+1: es el mapa
  // mental del operador cuando canta "la 5".
  const number = findPart<{ type: "image"; src: string }>(
    raya,
    `${id}-number`,
    "image",
  );
  assert.ok(number, `'${id}-number' debe llevar una part 'image'`);
  assert.ok(
    number.src.endsWith(`/numbers/${i + 1}.png`),
    `'${id}-number' debe mostrar el ${i + 1}, no ${number.src.split("/").pop()}`,
  );

  for (const [suffix, visible] of [
    ["back", true],
    ["front", false],
    ["number", true],
    ["cross", false],
    ["circle", false],
  ] as const) {
    const layer = rayaLayer(`${id}-${suffix}`);
    assert.ok(layer, `falta el layer '${id}-${suffix}'`);
    assert.equal(
      layer.visible,
      visible,
      `'${id}-${suffix}' arranca ${visible ? "prendido" : "apagado"}`,
    );
  }

  // 'flip' anima la carta entera: las dos caras cuelgan de ella. Aplanarlas
  // dejaria una cara girando y la otra quieta.
  for (const face of ["back", "front"]) {
    assert.equal(
      rayaLayer(`${id}-${face}`)?.parentId,
      id,
      `'${id}-${face}' cuelga de '${id}': es lo que hace que giren juntas`,
    );
  }

  assert.ok(
    findPart(raya, `${id}-text`, "text"),
    `'${id}-text' debe llevar una part 'text' (la pisa Logic)`,
  );
}

const rayaFonts = new Set(
  raya.flatMap((layer) =>
    layer.parts
      .map((part) => (part as { fontKey?: string }).fontKey)
      .filter((key): key is string => Boolean(key)),
  ),
);
assert.deepEqual(
  [...rayaFonts],
  ["jetBrainsMono"],
  "las claves de fuente del layout son las que declara la ficha",
);

console.log("tres en raya: checks ok");

// --- el layout de galeria de fotos contra lo que la logica espera ---

const galeria = JSON.parse(
  readFileSync("src/game/catalog/galeria-fotos/layout.json", "utf8"),
) as Layer[];

const galeriaVideo = findPart<{ type: "video"; src: string }>(
  galeria,
  "background",
  "video",
);
assert.ok(galeriaVideo, "'background' debe llevar una part 'video'");
assert.ok(
  existsSync(`public${galeriaVideo.src}`),
  `el video de fondo no existe: ${galeriaVideo.src}`,
);

const galeriaTop = galeria.filter((layer) => !layer.parentId);
assert.deepEqual(
  galeriaTop.map((layer) => layer.id),
  ["background", "photo"],
  "'background' va antes que 'photo': GameShell pinta en orden y el ultimo queda arriba",
);
for (const layer of galeriaTop) {
  assert.equal(layer.visible, true, `'${layer.id}' arranca prendido`);
}

const galeriaPhoto = findPart<{ type: "image"; src: string; fit?: string }>(
  galeria,
  "photo",
  "image",
);
assert.ok(galeriaPhoto, "'photo' debe llevar una part 'image' (la pisa Logic)");
// Con 'fill' la foto se estira a 16:9 y sale deformada al aire, que es un error
// que se ve plausible: la imagen aparece, solo que mal.
assert.equal(
  galeriaPhoto.fit,
  "contain",
  "'photo' va en 'contain': la foto calza por alto o por ancho, sin deformarse",
);
assert.equal(
  galeriaPhoto.src,
  "",
  "'photo' arranca sin src: la foto la pone Logic desde la sesion",
);

// La ficha no declara fuentes. Una clave de fuente en el layout caeria al font
// por defecto sin avisar.
assert.equal(
  galeria.flatMap((layer) =>
    layer.parts.filter((part) => (part as { fontKey?: string }).fontKey),
  ).length,
  0,
  "el layout no usa fuentes: la ficha no declara ninguna",
);

console.log("galeria de fotos: checks ok");

// --- el layout de reto cruzado contra lo que la logica espera ---

const reto = JSON.parse(
  readFileSync("src/game/catalog/reto-cruzado/layout.json", "utf8"),
) as Layer[];

const retoLayer = (id: string) => reto.find((layer) => layer.id === id);

for (const src of RETO_PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

const retoVideo = findPart<{ type: "video"; src: string }>(reto, "background", "video");
assert.ok(retoVideo, "'background' debe llevar una part 'video'");
assert.ok(existsSync(`public${retoVideo.src}`), `el video de fondo no existe: ${retoVideo.src}`);

// Los cinco niveles son paneles excluyentes. El 0 es el que arranca, como el
// SetActiveOnlyPanel(0) del motor de Unity.
for (let level = 0; level <= 4; level++) {
  const layer = retoLayer(`level-${level}`);
  assert.ok(layer, `falta el contenedor 'level-${level}'`);
  assert.equal(layer.visible, level === 0, `'level-${level}' arranca ${level === 0 ? "prendido" : "apagado"}`);
}

for (let i = 0; i < 20; i++) {
  const course = retoLayer(`course-${i}`);
  assert.ok(course, `falta el layer 'course-${i}'`);
  assert.equal(course.visible, false, `'course-${i}' arranca apagado`);
  // Sin 'blink' tachar un curso no se ve y no hay error en consola.
  assert.ok(partOf(course, "blink"), `'course-${i}' debe llevar la part 'blink'`);
  assert.ok(findPart(reto, `course-${i}-text`, "text"), `'course-${i}-text' debe llevar 'text'`);
  assert.equal(retoLayer(`course-${i}-frame`)?.visible, true, `'course-${i}-frame' arranca prendido`);
  assert.equal(retoLayer(`course-${i}-frame-locked`)?.visible, false, `'course-${i}-frame-locked' arranca apagado`);
}

// El reparto lo calcula Logic imitando los layout groups de Unity: filas de 4,
// centradas en los dos ejes, y una fila incompleta se centra sola.
assert.deepEqual(coursePosition(0, 1), { x: 0, y: 0 }, "un curso queda centrado");
assert.deepEqual([0, 1, 2].map((i) => coursePosition(i, 3).x), [-450, 0, 450], "tres cursos se centran");
assert.deepEqual([0, 1, 2, 3].map((i) => coursePosition(i, 4).x), [-675, -225, 225, 675], "cuatro llenan la fila");
assert.deepEqual([coursePosition(0, 6).y, coursePosition(4, 6).y], [77, -77], "seis cursos dan dos filas simetricas");
assert.deepEqual([coursePosition(4, 6).x, coursePosition(5, 6).x], [-225, 225], "la fila incompleta se centra");
assert.equal(coursePosition(0, 20).y - coursePosition(4, 20).y, 154, "entre filas hay 142 de alto mas 12 de gap");

const RETO_MARKS = ["red", "green", "yellow", "blue"];
const RETO_CELLS: [number, number, number[][]][] = [
  [1, 2, [[-384.5, 0], [384.5, 0]]],
  [2, 4, [[-386.25, 100], [386.25, 100], [-386.25, -100], [386.25, -100]]],
];

for (const [level, count, cells] of RETO_CELLS) {
  assert.ok(findPart(reto, `level-${level}-question`, "text"), `'level-${level}-question' debe llevar 'text'`);
  assert.equal(
    reto.filter((l) => l.parentId === `level-${level}-options`).length,
    count,
    `el nivel ${level} tiene ${count} opciones`,
  );

  for (let i = 0; i < count; i++) {
    const id = `level-${level}-option-${i}`;
    // La rejilla de Unity se horneo aqui; si estas posiciones cambian, las
    // opciones dejan de caer donde el marco de fondo las espera.
    assert.deepEqual(retoLayer(id)?.rect.position, { x: cells[i][0], y: cells[i][1] }, `'${id}' va en la celda ${i}`);
    assert.ok(findPart(reto, `${id}-text`, "text"), `'${id}-text' debe llevar 'text'`);

    const mark = findPart<{ type: "image"; src: string }>(reto, `${id}-mark`, "image");
    assert.ok(mark?.src.endsWith(`/colors/${RETO_MARKS[i]}.png`), `'${id}-mark' va en ${RETO_MARKS[i]}`);

    const side = i % 2 === 0 ? "left" : "right";
    for (const state of ["frame", "frame-correct", "frame-incorrect"]) {
      const frame = retoLayer(`${id}-${state}`);
      assert.ok(frame, `falta el layer '${id}-${state}'`);
      const image = partOf<{ type: "image"; src: string }>(frame, "image");
      assert.ok(image, `'${id}-${state}' debe llevar una part 'image'`);
      assert.ok(RETO_PRELOAD.includes(image.src), `'${id}-${state}' se intercambia en vivo: debe estar en PRELOAD`);
      assert.equal(frame.visible, state === "frame", `'${id}-${state}' arranca ${state === "frame" ? "prendido" : "apagado"}`);
      // Izquierda y derecha no son la misma grafica: el marco esta recortado
      // hacia su lado y confundirlas se ve al aire.
      assert.ok(image.src.includes(`/${side}-frame`), `'${id}-${state}' usa la grafica ${side}`);
    }
  }
}

for (const side of ["left", "right"] as const) {
  for (let i = 0; i < 3; i++) {
    const id = `level-3-${side}-${i}`;
    assert.ok(findPart(reto, `${id}-text`, "text"), `'${id}-text' debe llevar 'text'`);
    // El conector mide este layer en el DOM para saber de donde sale la linea;
    // sin el no dibuja nada y no avisa.
    assert.ok(retoLayer(`${id}-point`), `falta el layer '${id}-point'`);
    for (const state of ["frame", "frame-correct", "frame-incorrect"]) {
      const frame = retoLayer(`${id}-${state}`);
      assert.ok(frame, `falta el layer '${id}-${state}'`);
      assert.equal(frame.visible, state === "frame", `'${id}-${state}' arranca ${state === "frame" ? "prendido" : "apagado"}`);
    }
  }
}

// Los puntos se miran de frente: si se espejan mal, las lineas salen por detras
// de los marcos y cruzan la pantalla.
assert.ok(retoLayer("level-3-left-0-point")!.rect.position.x > 0, "el punto izquierdo mira a la derecha");
assert.ok(retoLayer("level-3-right-0-point")!.rect.position.x < 0, "el punto derecho mira a la izquierda");

for (let i = 0; i < 3; i++) {
  const connector = retoLayer(`level-3-connector-${i}`);
  assert.ok(connector, `falta el layer 'level-3-connector-${i}'`);
  assert.ok(partOf(connector, "connector"), `'level-3-connector-${i}' debe llevar la part 'connector'`);
  // La part mide contra su propia caja: si no ocupara la pantalla entera, las
  // lineas saldrian desplazadas.
  assert.deepEqual(connector.rect.size, { x: 1920, y: 1080 }, `'level-3-connector-${i}' ocupa la pantalla`);
}

const retoMain = retoLayer("level-4-main");
assert.ok(retoMain, "falta el layer 'level-4-main'");
for (const type of ["shake", "pop"]) {
  assert.ok(partOf(retoMain, type), `'level-4-main' debe llevar la part '${type}'`);
}
assert.equal(retoLayer("level-4-answer")?.visible, false, "'level-4-answer' arranca apagado: lo revela la M");
for (const id of ["level-4-question-text", "level-4-answer-text"]) {
  assert.ok(findPart(reto, id, "text"), `'${id}' debe llevar una part 'text'`);
}

const retoFonts = new Set(
  reto.flatMap((l) => l.parts.map((p) => (p as { fontKey?: string }).fontKey).filter((k): k is string => Boolean(k))),
);
assert.deepEqual([...retoFonts], ["jetBrainsMono"], "las claves de fuente son las que declara la ficha");

console.log("reto cruzado: checks ok");
