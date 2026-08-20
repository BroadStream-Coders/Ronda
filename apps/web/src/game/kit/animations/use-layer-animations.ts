"use client";

import { useCallback, useEffect, useRef } from "react";
import { animate, type AnimationPlaybackControls } from "motion";

import { partOf, type Layer, type Vec2 } from "../layer";
import { useAnimations } from "./context";
import type { BouncePart, PopPart, ShakePart, SlidePart } from "./parts";

const lerp = (from: Vec2, to: Vec2, t: number): Vec2 => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
});

function easeOutBounce(t: number): number {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
}

export function useLayerAnimations(
  layer: Layer,
  onPosition?: (layerId: string, position: Vec2) => void,
): (node: HTMLDivElement | null) => void {
  const pop = partOf<PopPart>(layer, "pop");
  const shake = partOf<ShakePart>(layer, "shake");
  const bounce = partOf<BouncePart>(layer, "bounce");
  const slide = partOf<SlidePart>(layer, "slide");

  const { register, unregister } = useAnimations();
  const id = layer.id;

  const hasPop = !!pop;
  const popScale = pop?.scale ?? 1.1;
  const popDuration = pop?.duration ?? 0.3;

  const hasShake = !!shake;
  const shakeAmplitude = shake?.amplitude ?? 2;
  const shakeCount = shake?.shakes ?? 3;
  const shakeDuration = shake?.duration ?? 0.4;

  const hasBounce = !!bounce;
  const travelSpeed = bounce?.travelSpeed ?? 1800;
  const bounceAmplitude = bounce?.bounceAmplitude ?? 40;
  const bounceDuration = bounce?.bounceDuration ?? 0.4;
  const bounceX = bounce?.target.x ?? 0;
  const bounceY = bounce?.target.y ?? 0;

  const hasSlide = !!slide;
  const slideSpeed = slide?.speed ?? 1800;
  const slideX = slide?.target.x ?? 0;
  const slideY = slide?.target.y ?? 0;

  const elRef = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<AnimationPlaybackControls | null>(null);
  const shakeRef = useRef<AnimationPlaybackControls | null>(null);
  const moveRef = useRef<{
    seq: number;
    controls: AnimationPlaybackControls | null;
  }>({ seq: 0, controls: null });

  const posRef = useRef<Vec2>(layer.rect.position);
  useEffect(() => {
    posRef.current = layer.rect.position;
  });

  const cancelMove = useCallback(() => {
    moveRef.current.seq++;
    moveRef.current.controls?.stop();
    moveRef.current.controls = null;
  }, []);

  useEffect(() => {
    if (!hasPop) return;
    const run = async () => {
      const element = elRef.current;
      if (!element || popScale <= 0 || popDuration <= 0) return;
      popRef.current?.cancel();
      const controls = animate(
        element,
        { scale: [1, popScale, 1] },
        { duration: popDuration, ease: ["backOut", "easeOut"] },
      );
      popRef.current = controls;
      try {
        await controls;
      } catch {
        return;
      }
      if (popRef.current === controls) element.style.transform = "";
    };
    register(id, "pop", run);
    return () => unregister(id, "pop");
  }, [id, hasPop, popScale, popDuration, register, unregister]);

  useEffect(() => {
    if (!hasShake) return;
    const run = async () => {
      const element = elRef.current;
      if (!element || shakeCount <= 0 || shakeDuration <= 0) return;
      if (shakeAmplitude <= 0) return;
      shakeRef.current?.cancel();
      const steps: number[] = [0];
      for (let i = 0; i < shakeCount * 2; i++) {
        steps.push(i % 2 === 0 ? shakeAmplitude : -shakeAmplitude);
      }
      steps.push(0);
      const controls = animate(
        element,
        { x: steps.map((value) => `${value}%`) },
        { duration: shakeDuration, ease: "linear" },
      );
      shakeRef.current = controls;
      try {
        await controls;
      } catch {
        return;
      }
      if (shakeRef.current === controls) element.style.transform = "";
    };
    register(id, "shake", run);
    return () => unregister(id, "shake");
  }, [
    id,
    hasShake,
    shakeAmplitude,
    shakeCount,
    shakeDuration,
    register,
    unregister,
  ]);

  useEffect(() => {
    if (!hasBounce) return;
    const run = async () => {
      cancelMove();
      const seq = moveRef.current.seq;
      const from = posRef.current;
      const to = { x: bounceX, y: bounceY };
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      if (distance < 0.001) {
        onPosition?.(id, to);
        return;
      }
      const direction = {
        x: (to.x - from.x) / distance,
        y: (to.y - from.y) / distance,
      };
      const overshoot = {
        x: to.x + direction.x * bounceAmplitude,
        y: to.y + direction.y * bounceAmplitude,
      };
      const travel = animate(0, 1, {
        duration:
          Math.hypot(overshoot.x - from.x, overshoot.y - from.y) / travelSpeed,
        ease: "easeOut",
        onUpdate: (t) => onPosition?.(id, lerp(from, overshoot, t)),
      });
      moveRef.current.controls = travel;
      await travel;
      if (moveRef.current.seq !== seq) return;
      const settle = animate(0, 1, {
        duration: bounceDuration,
        ease: easeOutBounce,
        onUpdate: (t) => onPosition?.(id, lerp(overshoot, to, t)),
      });
      moveRef.current.controls = settle;
      await settle;
    };
    register(id, "bounce", run);
    return () => unregister(id, "bounce");
  }, [
    id,
    hasBounce,
    travelSpeed,
    bounceAmplitude,
    bounceDuration,
    bounceX,
    bounceY,
    cancelMove,
    onPosition,
    register,
    unregister,
  ]);

  useEffect(() => {
    if (!hasSlide) return;
    const run = async () => {
      cancelMove();
      const from = posRef.current;
      const to = { x: slideX, y: slideY };
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      if (distance < 0.001 || slideSpeed <= 0) {
        onPosition?.(id, to);
        return;
      }
      const controls = animate(0, 1, {
        duration: distance / slideSpeed,
        ease: "easeInOut",
        onUpdate: (t) => onPosition?.(id, lerp(from, to, t)),
      });
      moveRef.current.controls = controls;
      await controls;
    };
    register(id, "slide", run);
    return () => unregister(id, "slide");
  }, [
    id,
    hasSlide,
    slideSpeed,
    slideX,
    slideY,
    cancelMove,
    onPosition,
    register,
    unregister,
  ]);

  useEffect(
    () => () => {
      popRef.current?.cancel();
      shakeRef.current?.cancel();
      cancelMove();
    },
    [cancelMove],
  );

  return useCallback((node: HTMLDivElement | null) => {
    elRef.current = node;
  }, []);
}
