"use client";

import type { ImageSlot, QuickImage } from "@/collector/kit";
import {
  AddRowButton,
  GroupColumn,
  GroupFooter,
  QuickImages,
  RowsContainer,
  hasImage,
} from "@/collector/kit";
import { Row } from "./Row";
import { MAX_CAPACITY } from "./schema";

interface ColumnProps {
  index: number;
  photos: ImageSlot[];
  onPhotoChange: (photoId: string, file: File, url: string) => void;
  onAddPhoto: () => void;
  onRemovePhoto: (photoId: string) => void;
  onRemoveColumn: () => void;
  onQuickImages: (images: QuickImage[]) => void;
}

export function Column({
  index,
  photos,
  onPhotoChange,
  onAddPhoto,
  onRemovePhoto,
  onRemoveColumn,
  onQuickImages,
}: ColumnProps) {
  return (
    <GroupColumn
      index={index}
      label="Grupo"
      onRemove={onRemoveColumn}
      currentCapacity={photos.length}
      maxCapacity={MAX_CAPACITY}
    >
      <RowsContainer>
        {photos.map((photo, photoIndex) => (
          <Row
            key={photo.id}
            index={photoIndex}
            imageUrl={photo.url}
            onImageChange={(file, url) => onPhotoChange(photo.id, file, url)}
            onRemove={() => onRemovePhoto(photo.id)}
          />
        ))}
      </RowsContainer>

      <AddRowButton
        onClick={() => {
          if (photos.length >= MAX_CAPACITY) return;
          onAddPhoto();
        }}
        label="Agregar foto"
      />

      <GroupFooter>
        <QuickImages
          onLoad={onQuickImages}
          max={MAX_CAPACITY - photos.filter(hasImage).length}
          className="w-full"
        />
      </GroupFooter>
    </GroupColumn>
  );
}
