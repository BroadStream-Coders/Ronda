"use client";

const AUDIO = /\.(mp3|ogg|wav|m4a)$/i;
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

export type MediaKind = "audio" | "video" | "image";

export function mediaKind(src: string): MediaKind {
  if (AUDIO.test(src)) return "audio";
  if (VIDEO.test(src)) return "video";
  return "image";
}

const audioCache = new Map<string, HTMLAudioElement>();

function audioFor(src: string): HTMLAudioElement {
  let audio = audioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = "auto";
    audioCache.set(src, audio);
  }
  return audio;
}

export function playSound(src: string) {
  const audio = audioFor(src);
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

function whenPlayable(element: HTMLMediaElement): Promise<void> {
  element.load();
  if (element.readyState >= element.HAVE_ENOUGH_DATA) return Promise.resolve();
  return new Promise((resolve, reject) => {
    element.addEventListener("canplaythrough", () => resolve(), { once: true });
    element.addEventListener(
      "error",
      () => reject(new Error(`No se pudo cargar ${element.src}`)),
      { once: true },
    );
  });
}

export function decodeImage(src: string): Promise<void> {
  const image = new Image();
  image.src = src;
  return image.decode();
}

function load(src: string): Promise<void> {
  switch (mediaKind(src)) {
    case "audio":
      return whenPlayable(audioFor(src));
    case "video": {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.src = src;
      return whenPlayable(video);
    }
    default:
      return decodeImage(src);
  }
}

export async function preloadMedia(sources: string[]): Promise<void> {
  await Promise.allSettled(sources.map(load));
}
