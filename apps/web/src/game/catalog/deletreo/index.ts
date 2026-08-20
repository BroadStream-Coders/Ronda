import { partView, useGameSession, type GameType, type Layer } from "@/game/kit";
import { loadJsonFile } from "@/helpers/persistence";
import layout from "./layout.json";
import { meta } from "./meta";
import { DeletreoLogic } from "./Logic";
import { SpellingView, type SpellingPart } from "./parts/spelling";
import { PRELOAD } from "./assets";
import { isDeletreoSession } from "./session";

export const deletreo: GameType = {
  meta,
  layout: layout as Layer[],
  chromaLayerId: "background",
  preload: PRELOAD,
  parts: { spelling: partView<SpellingPart>(SpellingView) },
  logic: DeletreoLogic,
  load: async (file) => {
    const data = await loadJsonFile<unknown>(file);
    if (!isDeletreoSession(data)) {
      throw new Error("El archivo no tiene el formato de Deletreo.");
    }
    useGameSession.getState().setSession(data, file.name);
  },
};
