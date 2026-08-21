import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

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
