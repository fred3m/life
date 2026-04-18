export type CellKey = string;

export type Pattern = number[][];

export type Tool = 'draw' | 'erase' | 'move' | 'select' | 'pattern' | 'paste';

export interface Viewport {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface Selection {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Clipboard {
  pattern: Pattern;
  w: number;
  h: number;
}

export const CELL_SIZE_BASE = 20;
