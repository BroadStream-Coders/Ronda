"use client";

const AUDIO = /\.(mp3|ogg|wav|m4a)$/i;
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

export type MediaKind = "audio" | "video" | "image";

export function mediaKind(src: string): MediaKind {
  if (AUDIO.test(src)) return "audio";
  if (VIDEO.test(src)) return "video";
  return "image";
}

const objectUrls = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();
const audioCache = new Map<string, HTMLAudioElement>();

export function resolveMedia(src: string): string {
  return objectUrls.get(src) ?? src;
}

async function fetchBlobUrl(src: string): Promise<string> {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`No se pudo descargar ${src} (${response.status})`);
  }
  const url = URL.createObjectURL(await response.blob());
  objectUrls.set(src, url);
  return url;
}

function blobUrl(src: string): Promise<string> {
  let pending = inflight.get(src);
  if (!pending) {
    pending = fetchBlobUrl(src);
    pending.catch(() => inflight.delete(src));
    inflight.set(src, pending);
  }
  return pending;
}

function audioFor(src: string): HTMLAudioElement {
  const url = resolveMedia(src);
  let audio = audioCache.get(url);
  if (!audio) {
    audio = new Audio(url);
    audio.preload = "auto";
    audioCache.set(url, audio);
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

async function load(src: string): Promise<void> {
  const url = await blobUrl(src);
  switch (mediaKind(src)) {
    case "audio":
      return whenPlayable(audioFor(src));
    case "video": {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.src = url;
      return whenPlayable(video);
    }
    default:
      return decodeImage(url);
  }
}

export async function preloadMedia(sources: string[]): Promise<void> {
  const results = await Promise.allSettled(sources.map(load));
  const failed = sources.filter((_, index) => results[index].status === "rejected");
  if (failed.length > 0) {
    console.warn("[game] assets sin precargar, dependen de la red:", failed);
  }
}
