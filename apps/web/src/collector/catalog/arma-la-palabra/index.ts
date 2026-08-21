import { WholeWord } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const armaLaPalabra: CollectorType = {
  meta: {
    id: "arma-la-palabra",
    name: "Arma la Palabra",
    description: "Palabras para armar letra por letra, por rondas",
    icon: WholeWord,
  },
  Editor,
};
