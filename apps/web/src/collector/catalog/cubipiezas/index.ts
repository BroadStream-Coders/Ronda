import { Puzzle } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const cubipiezas: CollectorType = {
  meta: {
    id: "cubipiezas",
    name: "Cubipiezas",
    description: "Preguntas que destapan una imagen",
    icon: Puzzle,
  },
  Editor,
};
