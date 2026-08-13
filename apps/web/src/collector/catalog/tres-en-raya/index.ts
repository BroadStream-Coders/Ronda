import { Grid3x3 } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const tresEnRaya: CollectorType = {
  meta: {
    id: "tres-en-raya",
    name: "Tres en Raya",
    description: "Rondas de nueve casillas con pregunta y respuesta",
    icon: Grid3x3,
  },
  Editor,
};
