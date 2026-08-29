import {
  partView,
  readZipSession,
  useGameSession,
  type GameType,
  type Layer,
} from "@/game/kit";
import { geniusTechno } from "@/programs/que-gane-el-mejor/fonts/genius-techno";
import layout from "./layout.json";
import { meta } from "./meta";
import { PRELOAD } from "./assets";
import { DragView, type DragPart } from "./parts/drag";
import { isCronosSession } from "./session";

export const cronos: GameType = {
  meta,
  layout: layout as Layer[],
  images: true,
  pointer: true,
  preload: PRELOAD,
  fonts: { geniusTechno },
  parts: { drag: partView<DragPart>(DragView) },
  load: async (file) => {
    const { data, images } = await readZipSession(file);
    if (!isCronosSession(data)) {
      throw new Error("El paquete no tiene el formato de Cronos.");
    }
    await useGameSession.getState().setSession(data, file.name, images);
  },
};
