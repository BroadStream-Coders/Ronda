import { partView, useGameSession, type GameType, type Layer } from "@/game/kit";
import { loadJsonFile } from "@/helpers/persistence";
import layout from "./layout.json";
import { meta } from "./meta";
import { ArmaLaPalabraLogic } from "./Logic";
import { BlanksView, type BlanksPart } from "./parts/blanks";
import { PRELOAD } from "./assets";
import { isArmaPalabraSession } from "./session";

export const armaLaPalabra: GameType = {
  meta,
  layout: layout as Layer[],
  preload: PRELOAD,
  parts: { blanks: partView<BlanksPart>(BlanksView) },
  logic: ArmaLaPalabraLogic,
  load: async (file) => {
    const data = await loadJsonFile<unknown>(file);
    if (!isArmaPalabraSession(data)) {
      throw new Error("El archivo no tiene el formato de Arma la Palabra.");
    }
    useGameSession.getState().setSession(data, file.name);
  },
};
