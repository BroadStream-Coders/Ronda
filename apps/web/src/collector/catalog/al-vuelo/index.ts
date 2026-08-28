import { Zap } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const alVuelo: CollectorType = {
  meta: {
    id: "al-vuelo",
    name: "Al Vuelo",
    description: "Preguntas rápidas de sí o no",
    icon: Zap,
  },
  Editor,
};
