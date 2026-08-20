"use client";

import { useLayerAnimations } from "./animations/use-layer-animations";
import { DESIGN_SIZE, layerStyle, type Layer, type Vec2 } from "./layer";
import { usePartRegistry } from "./part-context";

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

  return (
    <div className="absolute" style={layerStyle(layer.rect, parentSize)}>
      <div ref={animationRef} className="absolute inset-0">
        {layer.parts.map((part, index) => {
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
