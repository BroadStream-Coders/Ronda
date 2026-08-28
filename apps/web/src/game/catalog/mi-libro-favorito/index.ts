import { useGameSession, type GameType, type Layer } from "@/game/kit";
import { geniusTechno } from "@/programs/que-gane-el-mejor/fonts/genius-techno";
import { loadJsonFile } from "@/helpers/persistence";
import layout from "./layout.json";
import { meta } from "./meta";
import { MiLibroFavoritoLogic } from "./Logic";
import { PRELOAD } from "./assets";
import { isMiLibroSession } from "./session";

export const miLibroFavorito: GameType = {
  meta,
  layout: layout as Layer[],
  chromaLayerId: "background",
  preload: PRELOAD,
  fonts: { geniusTechno },
  logic: MiLibroFavoritoLogic,
  load: async (file) => {
    const data = await loadJsonFile<unknown>(file);
    if (!isMiLibroSession(data)) {
      throw new Error("El archivo no tiene el formato de Mi Libro Favorito.");
    }
    await useGameSession.getState().setSession(data, file.name);
  },
};
