import {
  readZipSession,
  useGameSession,
  type GameType,
  type Layer,
} from "@/game/kit";
import layout from "./layout.json";
import { meta } from "./meta";
import { GaleriaFotosLogic } from "./Logic";
import { isGaleriaFotosSession } from "./session";

export const galeriaFotos: GameType = {
  meta,
  layout: layout as Layer[],
  images: true,
  logic: GaleriaFotosLogic,
  load: async (file) => {
    const { data, images } = await readZipSession(file);
    if (!isGaleriaFotosSession(data)) {
      throw new Error("El paquete no tiene el formato de Galería de Fotos.");
    }
    await useGameSession.getState().setSession(data, file.name, images);
  },
};
