import { partView, useGameSession, type GameType, type Layer } from "@/game/kit";
import { loadJsonFile } from "@/helpers/persistence";
import layout from "./layout.json";
import { meta } from "./meta";
import { ArmaLaOracionLogic } from "./Logic";
import { BackdropView, type BackdropPart } from "./parts/backdrop";
import { SentenceView, type SentencePart } from "./parts/sentence";
import { PRELOAD } from "./assets";
import { isArmaOracionSession } from "./session";

export const armaLaOracion: GameType = {
  meta,
  layout: layout as Layer[],
  preload: PRELOAD,
  parts: {
    backdrop: partView<BackdropPart>(BackdropView),
    sentence: partView<SentencePart>(SentenceView),
  },
  logic: ArmaLaOracionLogic,
  load: async (file) => {
    const data = await loadJsonFile<unknown>(file);
    if (!isArmaOracionSession(data)) {
      throw new Error("El archivo no tiene el formato de Arma la Oración.");
    }
    useGameSession.getState().setSession(data, file.name);
  },
};
