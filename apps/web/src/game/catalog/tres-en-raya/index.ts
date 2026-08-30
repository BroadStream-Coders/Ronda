import {
  partView,
  useGameSession,
  type GameType,
  type Layer,
} from "@/game/kit";
import { loadJsonFile } from "@/helpers/persistence";
import { jetBrainsMono } from "@/programs/que-gane-el-mejor/fonts/jetbrains-mono";
import layout from "./layout.json";
import { meta } from "./meta";
import { PRELOAD } from "./assets";
import { ClickView, type ClickPart } from "./parts/click";
import { isTresEnRayaSession } from "./session";

export const tresEnRaya: GameType = {
  meta,
  layout: layout as Layer[],
  pointer: true,
  preload: PRELOAD,
  fonts: { jetBrainsMono },
  parts: { click: partView<ClickPart>(ClickView) },
  load: async (file) => {
    const data = await loadJsonFile<unknown>(file);
    if (!isTresEnRayaSession(data)) {
      throw new Error("El archivo no tiene el formato de Tres en Raya.");
    }
    await useGameSession.getState().setSession(data, file.name);
  },
};
