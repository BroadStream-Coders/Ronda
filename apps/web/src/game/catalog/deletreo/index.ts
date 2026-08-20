import { SpellCheck } from "lucide-react";

import { partView, useGameSession, type GameType, type Layer } from "@/game/kit";
import { loadJsonFile } from "@/helpers/persistence";
import layout from "./layout.json";
import { DeletreoLogic } from "./Logic";
import { SpellingView, type SpellingPart } from "./parts/spelling";
import { isDeletreoSession } from "./session";

export const deletreo: GameType = {
  meta: {
    id: "deletreo",
    name: "Deletreo",
    description: "Palabras para deletrear, por rondas",
    icon: SpellCheck,
  },
  layout: layout as Layer[],
  chromaLayerId: "background",
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
