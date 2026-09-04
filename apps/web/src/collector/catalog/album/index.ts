import { Images } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const album: CollectorType = {
  meta: {
    id: "album",
    name: "Álbum",
    description: "Fotos con pregunta por columna",
    icon: Images,
  },
  Editor,
};
