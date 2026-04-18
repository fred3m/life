import { CELL_SIZE_BASE, type Viewport } from './types';

export function cellSize(vp: Viewport): number {
  return CELL_SIZE_BASE * vp.zoom;
}

export function screenToGrid(vp: Viewport, sx: number, sy: number): [number, number] {
  const cs = cellSize(vp);
  return [Math.floor((sx - vp.offsetX) / cs), Math.floor((sy - vp.offsetY) / cs)];
}

export function gridToScreen(vp: Viewport, gx: number, gy: number): [number, number] {
  const cs = cellSize(vp);
  return [gx * cs + vp.offsetX, gy * cs + vp.offsetY];
}

export function zoomAt(vp: Viewport, mx: number, my: number, factor: number): Viewport {
  const oldZoom = vp.zoom;
  const nextZoom = Math.max(0.05, Math.min(20, oldZoom * factor));
  const ratio = nextZoom / oldZoom;
  return {
    zoom: nextZoom,
    offsetX: mx - (mx - vp.offsetX) * ratio,
    offsetY: my - (my - vp.offsetY) * ratio,
  };
}
