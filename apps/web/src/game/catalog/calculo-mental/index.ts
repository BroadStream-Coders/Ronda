import { partView, useGameSession, type GameType, type Layer } from "@/game/kit";
import { poppins } from "@/game/fonts/poppins";
import { loadJsonFile } from "@/helpers/persistence";
import layout from "./layout.json";
import { meta } from "./meta";
import { CalculoMentalLogic } from "./Logic";
import { SlotView, type SlotPart } from "./parts/slot";
import { PRELOAD } from "./assets";
import { isCalculoSession } from "./session";

export const calculoMental: GameType = {
  meta,
  layout: layout as Layer[],
  chromaLayerId: "background",
  preload: PRELOAD,
  parts: { slot: partView<SlotPart>(SlotView) },
  fonts: { poppins },
  logic: CalculoMentalLogic,
  load: async (file) => {
    const data = await loadJsonFile<unknown>(file);
    if (!isCalculoSession(data)) {
      throw new Error("El archivo no tiene el formato de Cálculo Mental.");
    }
    useGameSession.getState().setSession(data, file.name);
  },
};
