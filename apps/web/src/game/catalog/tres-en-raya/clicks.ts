type Listener = (layerId: string) => void;

let listener: Listener | null = null;

export const clicks = {
  listen: (fn: Listener | null) => {
    listener = fn;
  },
  emit: (layerId: string) => listener?.(layerId),
};
