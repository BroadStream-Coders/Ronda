import {
  readZipSession,
  useGameSession,
  type GameType,
  type Layer,
} from "@/game/kit";
import { candara } from "@/programs/mas-conectados/fonts/candara";
import { poppins } from "@/programs/mas-conectados/fonts/poppins";
import layout from "./layout.json";
import { meta } from "./meta";
import { DeParEnParLogic } from "./Logic";
import { isDeParEnParSession } from "./session";

export const deParEnPar: GameType = {
  meta,
  layout: layout as Layer[],
  images: true,
  pointer: true,
  fonts: { candara, poppins },
  logic: DeParEnParLogic,
  load: async (file) => {
    const { data, images } = await readZipSession(file);
    if (!isDeParEnParSession(data)) {
      throw new Error("El paquete no tiene el formato de De Par en Par.");
    }
    await useGameSession.getState().setSession(data, file.name, images);
  },
};
