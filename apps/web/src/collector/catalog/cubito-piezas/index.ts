import { Puzzle } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const cubitoPiezas: CollectorType = {
  meta: {
    id: "cubito-piezas",
    name: "Cubito Piezas",
    description: "Preguntas que destapan una imagen",
    icon: Puzzle,
  },
  Editor,
};
