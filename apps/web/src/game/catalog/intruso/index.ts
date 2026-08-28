import {
  readZipSession,
  useGameSession,
  type GameType,
  type Layer,
} from "@/game/kit";
import { geniusTechno } from "@/programs/que-gane-el-mejor/fonts/genius-techno";
import layout from "./layout.json";
import { meta } from "./meta";
import { IntrusoLogic } from "./Logic";
import { PRELOAD } from "./assets";
import { isIntrusoSession } from "./session";

export const intruso: GameType = {
  meta,
  layout: layout as Layer[],
  preload: PRELOAD,
  fonts: { geniusTechno },
  logic: IntrusoLogic,
  load: async (file) => {
    const { data, images } = await readZipSession(file);
    if (!isIntrusoSession(data)) {
      throw new Error("El paquete no tiene el formato de Intruso.");
    }
    await useGameSession.getState().setSession(data, file.name, images);
  },
};
