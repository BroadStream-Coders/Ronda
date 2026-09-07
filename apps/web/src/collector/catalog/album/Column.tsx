"use client";

import {
  GroupColumn,
  GroupFooter,
  QuickImages,
  QuickLoad,
  type QuickImage,
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
  onSetPhotoImage: (id: string, file: File, url: string) => void;
  onUpdateRound: (updates: Partial<{ context: string }>) => void;
  onQuickLoad: (data: string[][]) => void;
  onQuickImages: (images: QuickImage[]) => void;
}

export function Column({
  index,
  photos,
  context,
  onUpdatePhoto,
  onSetPhotoImage,
  onUpdateRound,
  onQuickLoad,
  onQuickImages,
}: ColumnProps) {
  return (
    <GroupColumn index={index} label="Sobre">
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
              onImageChange={(file, url) => onSetPhotoImage(photo.id, file, url)}
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
          label="Planilla"
          placeholder="Pegar preguntas (una por línea)…"
          leading={
            <QuickImages
              onLoad={onQuickImages}
              max={PHOTOS_PER_ROUND}
              label="Imágenes"
              className="flex-1"
            />
          }
        />
      </GroupFooter>
    </GroupColumn>
  );
}
