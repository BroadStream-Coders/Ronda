import { LetterText } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const cubiletras: CollectorType = {
  meta: {
    id: "cubiletras",
    name: "Cubiletras",
    description: "Sopa de letras con palabras en horizontal y vertical",
    icon: LetterText,
  },
  Editor,
};
