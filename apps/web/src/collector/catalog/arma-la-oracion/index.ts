import { TextQuote } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const armaLaOracion: CollectorType = {
  meta: {
    id: "arma-la-oracion",
    name: "Arma la Oración",
    description: "Oraciones para armar palabra por palabra, por rondas",
    icon: TextQuote,
  },
  Editor,
};
