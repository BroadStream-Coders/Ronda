import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { DESIGN_SIZE, findPart, layerStyle, type Layer } from "../src/game/kit/layer.ts";
import { applyState } from "../src/game/kit/state.ts";
import { settingKey } from "../src/game/kit/use-game-setting.ts";
import { FRAMES, PRELOAD } from "../src/game/catalog/deletreo/assets.ts";

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
  {
    position: { x: 480, y: 270 },
    size: { x: 0, y: 0 },
    pivot: { x: 0.5, y: 0.5 },
  },
  DESIGN_SIZE,
);
assert.equal(upperRight.left, "75%");
assert.equal(upperRight.top, "25%");

const insideParent = layerStyle(
  {
    position: { x: 0, y: 0 },
    size: { x: 585, y: 102 },
    pivot: { x: 0.5, y: 0.5 },
  },
  { x: 1170, y: 204 },
);
assert.equal(insideParent.width, "50%");
assert.equal(insideParent.height, "50%");

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
  word: { spelling: { word: "CASA", revealed: 2 } },
});
assert.deepEqual(merged[0].parts[0], {
  type: "spelling",
  word: "CASA",
  revealed: 2,
});
assert.deepEqual(merged[0].parts[1], { type: "color", value: "#000" });
assert.equal(layout[0].parts[0], layout[0].parts[0]);
assert.deepEqual(
  (layout[0].parts[0] as { word: string }).word,
  "",
  "el layout original no se muta",
);
assert.equal(applyState(layout, {})[0], layout[0]);

const chroma = findPart<{ type: "color"; value: string }>(
  layout,
  "word",
  "color",
);
assert.equal(chroma?.value, "#000");
assert.equal(findPart(layout, "word", "spelling")?.type, "spelling");
assert.equal(findPart(layout, "nope", "color"), undefined);
assert.equal(findPart(layout, "word", "image"), undefined);

assert.notEqual(
  settingKey("programa-a", "deletreo", "chroma"),
  settingKey("programa-b", "deletreo", "chroma"),
);
assert.notEqual(
  settingKey("programa-a", "deletreo", "chroma"),
  settingKey("programa-a", "album", "chroma"),
);

const deletreo = JSON.parse(
  readFileSync("src/game/catalog/deletreo/layout.json", "utf8"),
) as Layer[];

for (const src of PRELOAD) {
  assert.ok(existsSync(`public${src}`), `asset declarado que no existe: ${src}`);
}

const frame = findPart<{ type: "image"; src: string }>(
  deletreo,
  "frame",
  "image",
);
assert.ok(frame, "el layer 'frame' debe llevar una part 'image' (la pisa Logic)");
assert.ok(
  existsSync(`public${frame.src}`),
  `el marco del layout no existe: ${frame.src}`,
);
assert.equal(frame.src, FRAMES.normal);

assert.ok(
  findPart(deletreo, "word", "spelling"),
  "el layer 'word' debe llevar una part 'spelling' (la pisa Logic)",
);
assert.ok(
  findPart(deletreo, "background", "color"),
  "el layer 'background' debe llevar una part 'color' (es el croma)",
);

console.log("game: checks ok");
