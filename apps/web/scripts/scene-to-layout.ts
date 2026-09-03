import { readFileSync, writeFileSync } from "node:fs";

interface SceneObject {
  id: string;
  name: string;
  active?: boolean;
  parentId?: string;
  transform: Record<string, unknown>;
  components: Record<string, unknown>[];
}

type Part = Record<string, unknown>;

interface OutLayer {
  id: string;
  name: string;
  visible: boolean;
  rect: Record<string, unknown>;
  parts: Part[];
  parentId?: string;
}

interface Recipe {
  scene: string;
  out: string;
  ids?: Record<string, string>;
  drop?: string[];
  replace?: Record<string, Part>;
  assets?: Record<string, string>;
  sources?: Record<string, string>;
  append?: () => OutLayer[];
}

const BUSCA_LOGO = "/programs/que-gane-el-mejor/games/busca-logo";

const CARD_SUFFIXES = [
  "",
  "-back",
  "-normal",
  "-selected",
  "-label",
  "-locked",
  "-locked-label",
  "-front",
  "-empty",
  "-logo",
];

// El 5x4 llega desde Games con los ids planos "card-N"; con tres tableros
// conviviendo cada uno necesita su prefijo.
function buscaLogoLevel2Ids(): Record<string, string> {
  const map: Record<string, string> = {
    level2: "level-2",
    level0: "level-0",
    "level0-message": "level-0-message",
  };
  for (let i = 0; i < 20; i++) {
    for (const suffix of CARD_SUFFIXES) {
      map[`card-${i}${suffix}`] = `level-2-card-${i}${suffix}`;
    }
  }
  return map;
}

// Medidas horneadas del prefab de Unity (Games/BuscaLogo/BuscaLogo.prefab).
// El contenedor de los tres niveles mide lo mismo; lo que cambia es la celda.
const LEVEL_BOX = { x: 1300, y: 1000 };
// Los marcos (normal/selected/locked) sobresalen de la celda, y la etiqueta del
// bloqueo se mete hacia adentro: son los offsets del anclaje en estirado.
const FRAME_OVERHANG = 20;
const FRAME_OFFSET_X = -2.5;
const LOCKED_LABEL_INSET = -13;
const LOCKED_LABEL_OFFSET_X = 2.5;

interface LevelBake {
  id: string;
  cell: number;
  spacing: number;
  count: number;
  letters: string;
  fontSize: number;
}

const BUSCA_LOGO_LEVELS: LevelBake[] = [
  { id: "level-1", cell: 305, spacing: 10, count: 12, letters: "ABCD", fontSize: 16.85 },
  { id: "level-3", cell: 187, spacing: 6, count: 30, letters: "ABCDEF", fontSize: 10.28 },
];

// El GridLayoutGroup de Unity con constraint Flexible, startCorner UpperLeft,
// startAxis Horizontal, childAlignment MiddleCenter y padding cero. Reproduce
// al decimal las posiciones que el prefab sí trae horneadas (niveles 1 y 2).
function unityGrid(cell: number, spacing: number, count: number) {
  const columns = Math.max(
    1,
    Math.floor((LEVEL_BOX.x + spacing + 0.001) / (cell + spacing)),
  );
  const rows = Math.ceil(count / columns);
  const spanX = columns * cell + (columns - 1) * spacing;
  const spanY = rows * cell + (rows - 1) * spacing;
  const startX = (LEVEL_BOX.x - spanX) / 2;
  const startY = (LEVEL_BOX.y - spanY) / 2;
  return {
    columns,
    rows,
    position: (index: number) => ({
      x:
        startX +
        (index % columns) * (cell + spacing) +
        cell / 2 -
        LEVEL_BOX.x / 2,
      y:
        LEVEL_BOX.y / 2 -
        (startY + Math.floor(index / columns) * (cell + spacing) + cell / 2),
    }),
  };
}

const rectOf = (
  position: { x: number; y: number },
  size: { x: number; y: number },
) => ({ position, size, pivot: { x: 0.5, y: 0.5 } });

const imagePart = (src: string): Part => ({ type: "image", fit: "fill", src });

const textPart = (text: string, fontSize: number, color: string): Part => ({
  type: "text",
  text,
  fontSize,
  autoSize: false,
  fontSizeMin: 1,
  fontSizeMax: 20,
  color,
  fontKey: "geniusTechno",
  bold: false,
  italic: false,
  underline: false,
  alignH: "center",
  alignV: "middle",
  overflow: "wrap",
});

function buildLevel(bake: LevelBake): OutLayer[] {
  const grid = unityGrid(bake.cell, bake.spacing, bake.count);
  const face = { x: bake.cell, y: bake.cell };
  const frame = { x: bake.cell + FRAME_OVERHANG, y: bake.cell };
  const lockedLabel = { x: bake.cell + LOCKED_LABEL_INSET, y: bake.cell };
  const src = (name: string) => `${BUSCA_LOGO}/${bake.id}/${name}.png`;
  const center = { x: 0, y: 0 };

  const layers: OutLayer[] = [
    {
      id: bake.id,
      name: bake.id,
      visible: false,
      rect: rectOf(center, LEVEL_BOX),
      parts: [],
    },
  ];

  for (let i = 0; i < bake.count; i++) {
    const card = `${bake.id}-card-${i}`;
    const back = `${card}-back`;
    const front = `${card}-front`;
    const locked = `${card}-locked`;
    const label = `${Math.floor(i / grid.columns) + 1}${bake.letters[i % grid.columns]}`;
    const framePosition = { x: FRAME_OFFSET_X, y: 0 };

    layers.push(
      {
        id: card,
        name: `Card ${label}`,
        visible: true,
        rect: rectOf(grid.position(i), face),
        parts: [
          { type: "flip", hideDuration: 0.25, showDuration: 0.45, perspective: 6 },
          { type: "click" },
        ],
        parentId: bake.id,
      },
      { id: back, name: "Back", visible: true, rect: rectOf(center, face), parts: [], parentId: card },
      {
        id: `${card}-normal`,
        name: "Normal",
        visible: true,
        rect: rectOf(framePosition, frame),
        parts: [imagePart(src("normal"))],
        parentId: back,
      },
      {
        id: `${card}-selected`,
        name: "Selected",
        visible: false,
        rect: rectOf(framePosition, frame),
        parts: [imagePart(src("selected"))],
        parentId: back,
      },
      {
        id: `${card}-label`,
        name: "Label",
        visible: true,
        rect: rectOf(center, face),
        parts: [textPart(label, bake.fontSize, "#ffffff")],
        parentId: back,
      },
      {
        id: locked,
        name: "Locked",
        visible: false,
        rect: rectOf(framePosition, frame),
        parts: [imagePart(src("locked"))],
        parentId: back,
      },
      {
        id: `${card}-locked-label`,
        name: "Locked Label",
        visible: true,
        rect: rectOf({ x: LOCKED_LABEL_OFFSET_X, y: 0 }, lockedLabel),
        parts: [textPart(label, bake.fontSize, "#959595")],
        parentId: locked,
      },
      { id: front, name: "Front", visible: false, rect: rectOf(center, face), parts: [], parentId: card },
      {
        id: `${card}-empty`,
        name: "Empty",
        visible: true,
        rect: rectOf(center, face),
        parts: [imagePart(src("empty"))],
        parentId: front,
      },
      {
        id: `${card}-logo`,
        name: "Logo",
        visible: false,
        rect: rectOf(center, face),
        parts: [imagePart(src("with-logo"))],
        parentId: front,
      },
    );
  }

  return layers;
}

const RECIPES: Record<string, Recipe> = {
  "busca-logo": {
    scene: "../../../TvPeru-QGEM-Games/src/app/workspaces/busca-logo/scene.json",
    out: "src/game/catalog/busca-logo/layout.json",
    ids: buscaLogoLevel2Ids(),
    drop: ["controller"],
    replace: { card: { type: "click" } },
    assets: {
      cardNormal: `${BUSCA_LOGO}/level-2/normal.png`,
      cardSelected: `${BUSCA_LOGO}/level-2/selected.png`,
      cardLocked: `${BUSCA_LOGO}/level-2/locked.png`,
      cardEmpty: `${BUSCA_LOGO}/level-2/empty.png`,
      cardWithLogo: `${BUSCA_LOGO}/level-2/with-logo.png`,
    },
    sources: {
      background:
        "/programs/que-gane-el-mejor/shared/video/background-blue.mp4",
    },
    append: () => BUSCA_LOGO_LEVELS.flatMap(buildLevel),
  },
};

function convertPart(part: Part, layerId: string, recipe: Recipe): Part {
  const next: Part = {};
  for (const [key, value] of Object.entries(part)) {
    if (key === "assetKey") {
      const src = recipe.assets?.[value as string];
      if (!src) throw new Error(`sin ruta para el assetKey "${value}"`);
      next.src = src;
    } else if (key === "fontAssetKey") {
      next.fontKey = value;
    } else if (
      (key === "letterSpacing" || key === "lineSpacing") &&
      value === 0
    ) {
      continue;
    } else {
      next[key] = value;
    }
  }
  const source = recipe.sources?.[layerId];
  if (source && !next.src) next.src = source;
  return next;
}

function convert(recipe: Recipe) {
  const scene = JSON.parse(readFileSync(recipe.scene, "utf8")) as SceneObject[];
  const rename = (id?: string) => (id ? (recipe.ids?.[id] ?? id) : undefined);
  const dropped = new Set(recipe.drop ?? []);

  const layout: OutLayer[] = scene.map((object) => {
    const parts = object.components
      .filter((part) => !dropped.has(part.type as string))
      .map((part) => {
        const swap = recipe.replace?.[part.type as string];
        return swap ?? convertPart(part, object.id, recipe);
      });
    const parentId = rename(object.parentId);
    return {
      id: rename(object.id)!,
      name: object.name,
      visible: object.active !== false,
      rect: object.transform,
      parts,
      ...(parentId ? { parentId } : {}),
    };
  });

  layout.push(...(recipe.append?.() ?? []));

  const ids = new Set<string>();
  for (const layer of layout) {
    if (ids.has(layer.id)) throw new Error(`id repetido: ${layer.id}`);
    ids.add(layer.id);
    if (layer.parentId && !layout.some((other) => other.id === layer.parentId)) {
      throw new Error(`'${layer.id}' cuelga de '${layer.parentId}', que no existe`);
    }
  }

  writeFileSync(recipe.out, `${JSON.stringify(layout, null, 1)}\n`);
  const kinds = new Set(layout.flatMap((l) => l.parts.map((p) => p.type)));
  console.log(
    `${recipe.out}: ${layout.length} layers, parts [${[...kinds].sort().join(", ")}]`,
  );
}

const name = process.argv[2];
const recipe = name ? RECIPES[name] : undefined;
if (!recipe) {
  console.error(`uso: scene-to-layout <${Object.keys(RECIPES).join("|")}>`);
  process.exit(1);
}
convert(recipe);
