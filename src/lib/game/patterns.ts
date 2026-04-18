import type { CellKey, Pattern } from './types';
import { keyOf } from './cells';

export type { Pattern };

export function stampPattern(
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

const gosperGliderGun: Pattern = (() => {
  const g: Pattern = Array.from({ length: 9 }, () => Array(36).fill(0));
  const pts: [number, number][] = [
    [4, 0], [4, 1], [5, 0], [5, 1],
    [4, 10], [5, 10], [6, 10], [3, 11], [7, 11], [2, 12], [8, 12], [2, 13], [8, 13],
    [5, 14], [3, 15], [7, 15], [4, 16], [5, 16], [6, 16], [5, 17],
    [2, 20], [3, 20], [4, 20], [2, 21], [3, 21], [4, 21], [1, 22], [5, 22],
    [0, 24], [1, 24], [5, 24], [6, 24],
    [2, 34], [3, 34], [2, 35], [3, 35],
  ];
  pts.forEach(([r, c]) => (g[r][c] = 1));
  return g;
})();

const simkinGliderGun: Pattern = (() => {
  const g: Pattern = Array.from({ length: 21 }, () => Array(33).fill(0));
  const pts: [number, number][] = [
    [0, 0], [0, 1], [1, 0], [1, 1], [0, 7], [0, 8], [1, 7], [1, 8],
    [3, 4], [3, 5], [4, 4], [4, 5],
    [9, 22], [9, 23], [10, 21], [10, 25], [11, 21], [11, 26],
    [12, 21], [12, 22], [12, 23], [12, 27], [12, 28],
    [13, 27], [13, 28],
    [17, 20], [17, 21], [18, 20], [18, 22], [19, 20],
  ];
  pts.forEach(([r, c]) => {
    if (r < g.length && c < g[0].length) g[r][c] = 1;
  });
  return g;
})();

const pufferTrain: Pattern = (() => {
  const g: Pattern = Array.from({ length: 18 }, () => Array(5).fill(0));
  const pts: [number, number][] = [
    [0, 2], [1, 3], [2, 0], [2, 3], [3, 1], [3, 2], [3, 3],
    [5, 0], [6, 1], [6, 4], [7, 0], [8, 0], [8, 4], [9, 0], [9, 1], [9, 2], [9, 3],
    [12, 2], [13, 3], [14, 0], [14, 3], [15, 1], [15, 2], [15, 3],
  ];
  pts.forEach(([r, c]) => {
    if (r < g.length && c < g[0].length) g[r][c] = 1;
  });
  return g;
})();

export const BUILTIN_PATTERNS: Record<string, Record<string, Pattern>> = {
  'Still Lifes': {
    Block: [[1, 1], [1, 1]],
    Beehive: [[0, 1, 1, 0], [1, 0, 0, 1], [0, 1, 1, 0]],
    Loaf: [[0, 1, 1, 0], [1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 0]],
    Boat: [[1, 1, 0], [1, 0, 1], [0, 1, 0]],
    Tub: [[0, 1, 0], [1, 0, 1], [0, 1, 0]],
  },
  Oscillators: {
    Blinker: [[1, 1, 1]],
    Toad: [[0, 1, 1, 1], [1, 1, 1, 0]],
    Beacon: [[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1], [0, 0, 1, 1]],
    Pulsar: [
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    ],
    Pentadecathlon: [
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    ],
  },
  Spaceships: {
    Glider: [[0, 1, 0], [0, 0, 1], [1, 1, 1]],
    LWSS: [[0, 1, 0, 0, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
    MWSS: [
      [0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1],
      [0, 1, 1, 1, 1, 1],
    ],
    HWSS: [
      [0, 0, 1, 1, 0, 0, 0],
      [1, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [0, 1, 1, 1, 1, 1, 1],
    ],
  },
  Guns: {
    'Gosper Glider Gun': gosperGliderGun,
    'Simkin Glider Gun': simkinGliderGun,
  },
  Methuselahs: {
    'R-pentomino': [[0, 1, 1], [1, 1, 0], [0, 1, 0]],
    Diehard: [
      [0, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 1, 1, 1],
    ],
    Acorn: [
      [0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [1, 1, 0, 0, 1, 1, 1],
    ],
    'Pi-heptomino': [[1, 1, 1], [1, 0, 1], [1, 0, 1]],
    'B-heptomino': [[0, 1, 0], [1, 1, 0], [0, 1, 1], [0, 0, 1]],
  },
  Miscellaneous: {
    'Puffer Train': pufferTrain,
    'Infinite Growth 1': [[
      1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1,
      0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
    ]],
  },
};
