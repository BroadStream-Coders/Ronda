import { isData } from "@/collector/catalog/cubipiezas/schema";
import {
  readZipSession,
  useGameSession,
  type GameType,
  type Layer,
} from "@/game/kit";
import { poppins } from "@/programs/que-gane-el-mejor/fonts/poppins";
import layout from "./layout.json";
import { meta } from "./meta";
import { PRELOAD } from "./assets";
import { BLUR_MAX, CARD_COUNT, slotId } from "./cards";
import { CubipiezasLogic } from "./Logic";

export const cubipiezas: GameType = {
  meta,
  layout: layout as Layer[],
  images: true,
  preload: PRELOAD,
  blurMax: BLUR_MAX,
  fonts: { poppins },
  colors: [
    {
      key: "slot",
      label: "Color de las ranuras",
      layerIds: Array.from({ length: CARD_COUNT }, (_, i) => slotId(i)),
    },
  ],
  logic: CubipiezasLogic,
  load: async (file) => {
    const { data, images } = await readZipSession(file);
    if (!isData(data)) {
      throw new Error("El paquete no tiene el formato de Cubipiezas.");
    }
    await useGameSession.getState().setSession(data, file.name, images);
  },
};
