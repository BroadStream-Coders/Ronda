import { Shuffle } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const retoCruzado: CollectorType = {
  meta: {
    id: "reto-cruzado",
    name: "Reto Cruzado",
    description: "Cinco niveles: valores, opciones, pares y respuesta",
    icon: Shuffle,
  },
  Editor,
};
