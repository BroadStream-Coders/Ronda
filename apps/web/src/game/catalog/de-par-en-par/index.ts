import {
  readZipSession,
  useGameSession,
  type GameType,
  type Layer,
} from "@/game/kit";
import { geniusTechno } from "@/programs/que-gane-el-mejor/fonts/genius-techno";
import { poppins } from "@/programs/que-gane-el-mejor/fonts/poppins";
import layout from "./layout.json";
import { meta } from "./meta";
import { PRELOAD } from "./assets";
import { DeParEnParLogic } from "./Logic";
import { isDeParEnParSession } from "./session";

export const deParEnPar: GameType = {
  meta,
  layout: layout as Layer[],
  images: true,
  pointer: true,
  preload: PRELOAD,
  fonts: { geniusTechno, poppins },
  logic: DeParEnParLogic,
  load: async (file) => {
    const { data, images } = await readZipSession(file);
    if (!isDeParEnParSession(data)) {
      throw new Error("El paquete no tiene el formato de De Par en Par.");
    }
    await useGameSession.getState().setSession(data, file.name, images);
  },
};
