import { Grid2x2 } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const deParEnPar: CollectorType = {
  meta: {
    id: "de-par-en-par",
    name: "De Par en Par",
    description: "Juego de memoria con pares de cartas",
    icon: Grid2x2,
  },
  Editor,
};
