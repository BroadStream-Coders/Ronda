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
import { RetoCruzadoLogic } from "./Logic";
import { PRELOAD } from "./assets";
import { ConnectorView, type ConnectorPart } from "./parts/connector";
import { isRetoCruzadoSession } from "./session";

export const retoCruzado: GameType = {
  meta,
  layout: layout as Layer[],
  preload: PRELOAD,
  fonts: { jetBrainsMono },
  parts: { connector: partView<ConnectorPart>(ConnectorView) },
  logic: RetoCruzadoLogic,
  load: async (file) => {
    const data = await loadJsonFile<unknown>(file);
    if (!isRetoCruzadoSession(data)) {
      throw new Error("El archivo no tiene el formato de Reto Cruzado.");
    }
    await useGameSession.getState().setSession(data, file.name);
  },
};
