"use client";

import {
  GroupColumn,
  GroupFooter,
  QuickLoad,
  RowsContainer,
  TitleInput,
  type ImageSlot,
} from "@/collector/kit";
import { Card } from "./Card";
import { PHOTOS_PER_ROUND } from "./schema";

interface ColumnProps {
  index: number;
  photos: ImageSlot[];
  context: string;
  onUpdatePhoto: (id: string, updates: Partial<ImageSlot>) => void;
  onUpdateRound: (updates: Partial<{ context: string }>) => void;
  onRemoveColumn: () => void;
  onQuickLoad: (data: string[][]) => void;
}

export function Column({
  index,
  photos,
  context,
  onUpdatePhoto,
  onUpdateRound,
  onRemoveColumn,
  onQuickLoad,
}: ColumnProps) {
  return (
    <GroupColumn
      index={index}
      onRemove={onRemoveColumn}
      currentCapacity={PHOTOS_PER_ROUND}
      maxCapacity={PHOTOS_PER_ROUND}
    >
      <TitleInput
        value={context}
        onChange={(val) => onUpdateRound({ context: val })}
        placeholder="Título..."
      />

      <RowsContainer>
        <div className="flex flex-col gap-2">
          {photos.map((photo, photoIndex) => (
            <Card
              key={photo.id}
              index={photoIndex + 1}
              name={photo.name}
              imageUrl={photo.url}
              isCroma={photo.isCroma}
              onImageChange={(file, url) => onUpdatePhoto(photo.id, { file, url })}
              onNameChange={(name) => onUpdatePhoto(photo.id, { name })}
              onToggleCroma={() =>
                onUpdatePhoto(photo.id, { isCroma: !photo.isCroma })
              }
            />
          ))}
        </div>
      </RowsContainer>

      <GroupFooter>
        <QuickLoad
          onLoad={onQuickLoad}
          placeholder="Pegar preguntas (una por línea)…"
        />
      </GroupFooter>
    </GroupColumn>
  );
}
