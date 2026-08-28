import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import JSZip from "jszip";

import { readZipSession, ZIP_SESSION_JSON } from "../src/game/kit/zip.ts";
import { mediaKind } from "../src/game/kit/media.ts";
import { PRELOAD as INTRUSO_PRELOAD } from "../src/game/catalog/intruso/assets.ts";
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
