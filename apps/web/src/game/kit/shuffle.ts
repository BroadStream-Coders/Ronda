export function shuffledOrder(count: number, seed: number): number[] {
  const order = Array.from({ length: count }, (_, index) => index);
  if (count < 2) return order;

  let state = (seed * 2654435761 + 0x9e3779b9) | 0;
  const random = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  if (order.every((value, index) => value === index)) {
    [order[0], order[1]] = [order[1], order[0]];
  }

  return order;
}
