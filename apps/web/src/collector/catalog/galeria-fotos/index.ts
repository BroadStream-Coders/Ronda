import { Images } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const galeriaFotos: CollectorType = {
  meta: {
    id: "galeria-fotos",
    name: "Galería de Fotos",
    description: "Grupos de fotos con título",
    icon: Images,
  },
  Editor,
};
