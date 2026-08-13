"use client";

import type { ImageSlot } from "@/collector/kit";
import {
  AddRowButton,
  GroupColumn,
  RowsContainer,
  TitleInput,
} from "@/collector/kit";
import { Row } from "./Row";
import { MAX_CAPACITY } from "./schema";

interface ColumnProps {
  index: number;
  title: string;
  photos: ImageSlot[];
  onTitleChange: (value: string) => void;
  onPhotoChange: (photoId: string, file: File, url: string) => void;
  onAddPhoto: () => void;
  onRemovePhoto: (photoId: string) => void;
  onRemoveColumn: () => void;
}

export function Column({
  index,
  title,
  photos,
  onTitleChange,
  onPhotoChange,
  onAddPhoto,
  onRemovePhoto,
  onRemoveColumn,
}: ColumnProps) {
  return (
    <GroupColumn
      index={index}
      onRemove={onRemoveColumn}
      currentCapacity={photos.length}
      maxCapacity={MAX_CAPACITY}
    >
      <TitleInput
        value={title}
        onChange={onTitleChange}
        placeholder="Nombre del grupo..."
      />

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
    </GroupColumn>
  );
}
