import { useGameSession, type GameType, type Layer } from "@/game/kit";
import { loadJsonFile } from "@/helpers/persistence";
import { geniusTechno } from "@/programs/que-gane-el-mejor/fonts/genius-techno";
import layout from "./layout.json";
import { meta } from "./meta";
import { isBuscaLogoSession } from "./session";

export const buscaLogo: GameType = {
  meta,
  layout: layout as Layer[],
  pointer: true,
  fonts: { geniusTechno },
  load: async (file) => {
    const data = await loadJsonFile<unknown>(file);
    if (!isBuscaLogoSession(data)) {
      throw new Error("El archivo no tiene el formato de Busca el Logo.");
    }
    await useGameSession.getState().setSession(data, file.name);
  },
};
