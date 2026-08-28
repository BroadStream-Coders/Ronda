"use client";

import { useLayerAnimations } from "./animations/use-layer-animations";
import { DESIGN_SIZE, layerStyle, partOf, type Layer, type Vec2 } from "./layer";
import { usePartRegistry } from "./part-context";
import { maskStyle, type ImagePart, type MaskPart } from "./parts";

interface LayerViewProps {
  layer: Layer;
  all: Layer[];
  parentSize?: Vec2;
  onPosition?: (layerId: string, position: Vec2) => void;
}

export function LayerView({
  layer,
  all,
  parentSize = DESIGN_SIZE,
  onPosition,
}: LayerViewProps) {
  const registry = usePartRegistry();
  const animationRef = useLayerAnimations(layer, onPosition);
  const children = all.filter((candidate) => candidate.parentId === layer.id);

  const mask = partOf<MaskPart>(layer, "mask");
  const maskImage = mask ? partOf<ImagePart>(layer, "image") : undefined;

  return (
    <div className="absolute" style={layerStyle(layer.rect, parentSize)}>
      <div
        ref={animationRef}
        className="absolute inset-0"
        style={
          mask
            ? maskImage?.src
              ? maskStyle(maskImage.src, maskImage.fit)
              : { overflow: "hidden" }
            : undefined
        }
      >
        {layer.parts.map((part, index) => {
          if (part === maskImage && mask?.showImage === false) return null;
          const View = registry[part.type];
          return View ? <View key={index} part={part} /> : null;
        })}
        {children.map((child) =>
          child.visible ? (
            <LayerView
              key={child.id}
              layer={child}
              all={all}
              parentSize={layer.rect.size}
              onPosition={onPosition}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}
