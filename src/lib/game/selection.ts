import type { CellKey, Pattern, Selection } from './types';
import { keyOf, parseKey } from './cells';

export function normalizeSelection(a: Selection): Selection {
  const x0 = Math.min(a.x0, a.x1);
  const x1 = Math.max(a.x0, a.x1);
  const y0 = Math.min(a.y0, a.y1);
  const y1 = Math.max(a.y0, a.y1);
  return { x0, y0, x1, y1 };
}

export function selectionContains(sel: Selection, x: number, y: number): boolean {
  return x >= sel.x0 && x <= sel.x1 && y >= sel.y0 && y <= sel.y1;
}

export function cellsInRect(cells: ReadonlySet<CellKey>, sel: Selection): Set<CellKey> {
  const out = new Set<CellKey>();
  for (const key of cells) {
    const [x, y] = parseKey(key);
    if (selectionContains(sel, x, y)) out.add(key);
  }
  return out;
}

export function clearRect(cells: ReadonlySet<CellKey>, sel: Selection): Set<CellKey> {
  const next = new Set<CellKey>();
  for (const key of cells) {
    const [x, y] = parseKey(key);
    if (!selectionContains(sel, x, y)) next.add(key);
  }
  return next;
}

export function extractPattern(
  cells: ReadonlySet<CellKey>,
  sel: Selection,
): { pattern: Pattern; w: number; h: number } {
  const w = sel.x1 - sel.x0 + 1;
  const h = sel.y1 - sel.y0 + 1;
  const pattern: Pattern = Array.from({ length: h }, () => Array(w).fill(0));
  for (const key of cells) {
    const [x, y] = parseKey(key);
    if (!selectionContains(sel, x, y)) continue;
    pattern[y - sel.y0][x - sel.x0] = 1;
  }
  return { pattern, w, h };
}

export function stampCells(
  cells: ReadonlySet<CellKey>,
  pattern: Pattern,
  ox: number,
  oy: number,
): Set<CellKey> {
  const next = new Set(cells);
  for (let r = 0; r < pattern.length; r++) {
    const row = pattern[r];
    for (let c = 0; c < row.length; c++) {
      if (row[c]) next.add(keyOf(ox + c, oy + r));
    }
  }
  return next;
}
