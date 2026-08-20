import { DESIGN_SIZE, layerStyle, type Layer, type Vec2 } from "./layer";
import { usePartRegistry } from "./part-context";

interface LayerViewProps {
  layer: Layer;
  all: Layer[];
  parentSize?: Vec2;
}

export function LayerView({
  layer,
  all,
  parentSize = DESIGN_SIZE,
}: LayerViewProps) {
  const registry = usePartRegistry();
  const children = all.filter((candidate) => candidate.parentId === layer.id);

  return (
    <div className="absolute" style={layerStyle(layer.rect, parentSize)}>
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
          />
        ) : null,
      )}
    </div>
  );
}
