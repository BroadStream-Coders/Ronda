import { useGameSession, type GameType, type Layer } from "@/game/kit";
import { jetBrainsMono } from "@/programs/que-gane-el-mejor/fonts/jetbrains-mono";
import { loadJsonFile } from "@/helpers/persistence";
import layout from "./layout.json";
import { meta } from "./meta";
import { LaSabesLogic } from "./Logic";
import { PRELOAD } from "./assets";
import { isLaSabesSession } from "./session";

export const laSabesONo: GameType = {
  meta,
  layout: layout as Layer[],
  chromaLayerId: "croma",
  preload: PRELOAD,
  fonts: { jetBrainsMono },
  logic: LaSabesLogic,
  load: async (file) => {
    const data = await loadJsonFile<unknown>(file);
    if (!isLaSabesSession(data)) {
      throw new Error("El archivo no tiene el formato de La Sabes o No.");
    }
    useGameSession.getState().setSession(data, file.name);
  },
};
