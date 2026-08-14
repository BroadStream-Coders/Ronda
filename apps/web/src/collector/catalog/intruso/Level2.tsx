"use client";

import type { Dispatch, SetStateAction } from "react";

import {
  AddRowButton,
  DescriptionInput,
  GroupColumn,
  GroupFooter,
  GroupsContainer,
  QuickLoad,
  RowsContainer,
  releaseSlots,
  setSlotImage,
} from "@/collector/kit";
import { Card } from "./Card";
import {
  MAX_PHOTOS,
  PHOTO_CROP,
  createEmptyPhoto,
  createEmptyPhotoRound,
  type Photo,
  type PhotoRoundState,
} from "./schema";

interface Level2Props {
  rounds: PhotoRoundState[];
  setRounds: Dispatch<SetStateAction<PhotoRoundState[]>>;
}

export function Level2({ rounds, setRounds }: Level2Props) {
  const updateRound = (
    roundId: string,
    updater: (round: PhotoRoundState) => PhotoRoundState,
  ) =>
    setRounds((prev) => prev.map((r) => (r.id === roundId ? updater(r) : r)));

  const addRound = () => setRounds((prev) => [...prev, createEmptyPhotoRound()]);

  const removeRound = (roundId: string) => {
    releaseSlots(rounds.find((r) => r.id === roundId)?.photos ?? []);
    setRounds((prev) => prev.filter((r) => r.id !== roundId));
  };

  const updatePhoto = (
    roundId: string,
    photoId: string,
    updates: Partial<Photo>,
  ) =>
    updateRound(roundId, (round) => ({
      ...round,
      photos: round.photos.map((photo) => {
        if (photo.id === photoId) return { ...photo, ...updates };
        return updates.isIntruso === true ? { ...photo, isIntruso: false } : photo;
      }),
    }));

  const setPhotoImage = (
    roundId: string,
    photoId: string,
    file: File,
    url: string,
  ) =>
    updateRound(roundId, (round) => ({
      ...round,
      photos: round.photos.map((photo) =>
        photo.id === photoId ? setSlotImage(photo, file, url) : photo,
      ),
    }));

  const removePhoto = (roundId: string, photoId: string) => {
    const round = rounds.find((r) => r.id === roundId);
    releaseSlots([round?.photos.find((p) => p.id === photoId)]);
    updateRound(roundId, (current) => ({
      ...current,
      photos: current.photos.filter((p) => p.id !== photoId),
    }));
  };

  const handleQuickLoad = (roundId: string, matrix: string[][]) => {
    const names: string[] = [];
    for (const row of matrix) {
      const line = row[0]?.trim() ?? "";
      if (line !== "") {
        names.push(line);
        if (names.length === MAX_PHOTOS) break;
      }
    }
    if (names.length === 0) return;
    updateRound(roundId, (round) => ({
      ...round,
      photos: round.photos.map((photo, i) => ({
        ...photo,
        name: names[i] ?? photo.name,
      })),
    }));
  };

  return (
    <GroupsContainer onAddGroup={addRound} addLabel="Agregar ronda">
      {rounds.map((round, roundIndex) => (
        <GroupColumn
          key={round.id}
          index={roundIndex + 1}
          onRemove={() => removeRound(round.id)}
          currentCapacity={round.photos.length}
          maxCapacity={MAX_PHOTOS}
        >
          <DescriptionInput
            value={round.context}
            onChange={(val) =>
              updateRound(round.id, (current) => ({ ...current, context: val }))
            }
            placeholder="Escribe el contexto para esta ronda..."
          />

          <RowsContainer>
            <div className="grid grid-cols-2 gap-3">
              {round.photos.map((photo) => (
                <Card
                  key={photo.id}
                  name={photo.name}
                  imageUrl={photo.url}
                  isIntruso={photo.isIntruso}
                  crop={PHOTO_CROP}
                  onImageChange={(file, url) =>
                    setPhotoImage(round.id, photo.id, file, url)
                  }
                  onNameChange={(name) =>
                    updatePhoto(round.id, photo.id, { name })
                  }
                  onToggleIntruso={() =>
                    updatePhoto(round.id, photo.id, { isIntruso: true })
                  }
                  onRemove={() => removePhoto(round.id, photo.id)}
                />
              ))}
            </div>
          </RowsContainer>

          <AddRowButton
            onClick={() => {
              if (round.photos.length >= MAX_PHOTOS) return;
              updateRound(round.id, (current) => ({
                ...current,
                photos: [...current.photos, createEmptyPhoto()],
              }));
            }}
            label="Agregar foto"
          />

          <GroupFooter>
            <QuickLoad
              onLoad={(matrix) => handleQuickLoad(round.id, matrix)}
              placeholder="Pegar nombres (uno por línea)…"
            />
          </GroupFooter>
        </GroupColumn>
      ))}
    </GroupsContainer>
  );
}
