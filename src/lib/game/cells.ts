import type { CellKey } from './types';

export function keyOf(x: number, y: number): CellKey {
  return x + ',' + y;
}

export function parseKey(key: CellKey): [number, number] {
  const i = key.indexOf(',');
  return [Number(key.slice(0, i)), Number(key.slice(i + 1))];
}
