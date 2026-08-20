"use client";

const AUDIO = /\.(mp3|ogg|wav|m4a)$/i;

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

export function preloadMedia(sources: string[]) {
  for (const src of sources) {
    if (AUDIO.test(src)) {
      audioFor(src).load();
    } else {
      const image = new Image();
      image.src = src;
    }
  }
}
