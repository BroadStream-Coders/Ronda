import { Sigma } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const operacionesCombinadas: CollectorType = {
  meta: {
    id: "operaciones-combinadas",
    name: "Operaciones Combinadas",
    description: "Operaciones colocadas en un tablero tipo crucigrama",
    icon: Sigma,
  },
  Editor,
};
