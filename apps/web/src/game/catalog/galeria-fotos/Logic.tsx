"use client";

import { useEffect, useState } from "react";

import { useGameKeys, useGameSession, useGameState } from "@/game/kit";
import type { GaleriaFotosSession } from "./session";

const PHOTO_ID = "photo";

interface Cursor {
  loadedAt: number;
  group: number;
  item: number;
}

const START: Cursor = { loadedAt: 0, group: 0, item: 0 };

export function GaleriaFotosLogic() {
  const patch = useGameState((s) => s.patch);

  const session = useGameSession((s) => s.session) as GaleriaFotosSession | null;
  const images = useGameSession((s) => s.images);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);

  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const groups = session?.groups ?? [];
  const items = groups[cursor.group]?.items ?? [];
  const item = items[cursor.item];

  useEffect(() => {
    patch(PHOTO_ID, "image", {
      src: item ? (images[item.imagePath] ?? "") : "",
    });
  }, [item, images, patch]);

  const goToItem = (index: number) => {
    if (index < 0 || index >= items.length) return;
    setCursor((c) => ({ ...c, item: index }));
  };

  useGameKeys({
    onNavigate: (value) => {
      const index = value - 1;
      if (value === 0 || index >= groups.length) return;
      setCursor((c) => ({ ...c, group: index, item: 0 }));
    },
    onNumber: goToItem,
    onNext: () => goToItem(cursor.item + 1),
    onBack: () => goToItem(cursor.item - 1),
  });

  return null;
}
