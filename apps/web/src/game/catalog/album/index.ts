import {
  readZipSession,
  useGameSession,
  type GameType,
  type Layer,
} from "@/game/kit";
import { geniusTechno } from "@/programs/que-gane-el-mejor/fonts/genius-techno";
import { jetBrainsMono } from "@/programs/que-gane-el-mejor/fonts/jetbrains-mono";
import { retroGaming } from "@/programs/que-gane-el-mejor/fonts/retro-gaming";
import layout from "./layout.json";
import { meta } from "./meta";
import { PRELOAD } from "./assets";
import { isAlbumSession } from "./session";

export const album: GameType = {
  meta,
  layout: layout as Layer[],
  images: true,
  preload: PRELOAD,
  fonts: { geniusTechno, jetBrainsMono, retroGaming },
  load: async (file) => {
    const { data, images } = await readZipSession(file);
    if (!isAlbumSession(data)) {
      throw new Error("El paquete no tiene el formato de Álbum.");
    }
    await useGameSession.getState().setSession(data, file.name, images);
  },
};
