import { readFileSync, writeFileSync } from "node:fs";

interface SceneObject {
  id: string;
  name: string;
  active?: boolean;
  parentId?: string;
  transform: Record<string, unknown>;
  components: Record<string, unknown>[];
}

interface Recipe {
  scene: string;
  out: string;
  ids?: Record<string, string>;
  drop?: string[];
  assets?: Record<string, string>;
  sources?: Record<string, string>;
}

const BUSCA_LOGO = "/programs/que-gane-el-mejor/games/busca-logo/level-2";

const RECIPES: Record<string, Recipe> = {
  "busca-logo": {
    scene: "../../../TvPeru-QGEM-Games/src/app/workspaces/busca-logo/scene.json",
    out: "src/game/catalog/busca-logo/layout.json",
    ids: {
      level2: "level-2",
      level0: "level-0",
      "level0-message": "level-0-message",
    },
    drop: ["controller", "card"],
    assets: {
      cardNormal: `${BUSCA_LOGO}/normal.png`,
      cardSelected: `${BUSCA_LOGO}/selected.png`,
      cardLocked: `${BUSCA_LOGO}/locked.png`,
      cardEmpty: `${BUSCA_LOGO}/empty.png`,
      cardWithLogo: `${BUSCA_LOGO}/with-logo.png`,
    },
    sources: {
      background:
        "/programs/que-gane-el-mejor/shared/video/background-blue.mp4",
    },
  },
};

function convertPart(
  part: Record<string, unknown>,
  layerId: string,
  recipe: Recipe,
): Record<string, unknown> {
  const next: Record<string, unknown> = {};
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

  const layout = scene.map((object) => {
    const id = rename(object.id)!;
    const parts = object.components
      .filter((part) => !dropped.has(part.type as string))
      .map((part) => convertPart(part, object.id, recipe));
    const parentId = rename(object.parentId);
    return {
      id,
      name: object.name,
      visible: object.active !== false,
      rect: object.transform,
      parts,
      ...(parentId ? { parentId } : {}),
    };
  });

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
