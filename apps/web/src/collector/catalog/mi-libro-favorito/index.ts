import { BookOpen } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const miLibroFavorito: CollectorType = {
  meta: {
    id: "mi-libro-favorito",
    name: "Mi Libro Favorito",
    description: "Preguntas por ronda para dos equipos",
    icon: BookOpen,
  },
  Editor,
};
