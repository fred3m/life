import type { CellKey } from './types';
import { keyOf, parseKey } from './cells';

export function neighborCount(cells: ReadonlySet<CellKey>): Map<CellKey, number> {
  const counts = new Map<CellKey, number>();
  for (const key of cells) {
    const [x, y] = parseKey(key);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nk = keyOf(x + dx, y + dy);
        counts.set(nk, (counts.get(nk) ?? 0) + 1);
      }
    }
  }
  return counts;
}

export function step(cells: ReadonlySet<CellKey>): Set<CellKey> {
  const counts = neighborCount(cells);
  const next = new Set<CellKey>();
  for (const [key, count] of counts) {
    if (count === 3 || (count === 2 && cells.has(key))) {
      next.add(key);
    }
  }
  return next;
}
