import { Zap } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const siONo: CollectorType = {
  meta: {
    id: "si-o-no",
    name: "Al Vuelo",
    description: "Preguntas rápidas de sí o no",
    icon: Zap,
  },
  Editor,
};
