import { HelpCircle } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const laSabesONo: CollectorType = {
  meta: {
    id: "la-sabes-o-no",
    name: "La Sabes o No",
    description: "Elige la respuesta correcta entre dos",
    icon: HelpCircle,
  },
  Editor,
};
