import { useGameSession, type GameType, type Layer } from "@/game/kit";
import { geniusTechno } from "@/programs/que-gane-el-mejor/fonts/genius-techno";
import { loadJsonFile } from "@/helpers/persistence";
import layout from "./layout.json";
import { meta } from "./meta";
import { AlVueloLogic } from "./Logic";
import { PRELOAD } from "./assets";
import { isAlVueloSession } from "./session";

export const alVuelo: GameType = {
  meta,
  layout: layout as Layer[],
  chromaLayerId: "background",
  preload: PRELOAD,
  fonts: { geniusTechno },
  logic: AlVueloLogic,
  load: async (file) => {
    const data = await loadJsonFile<unknown>(file);
    if (!isAlVueloSession(data)) {
      throw new Error("El archivo no tiene el formato de Al Vuelo.");
    }
    await useGameSession.getState().setSession(data, file.name);
  },
};
