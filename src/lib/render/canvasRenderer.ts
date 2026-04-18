import type { CellKey, Pattern, Selection, Viewport } from '../game/types';
import { parseKey } from '../game/cells';
import { cellSize, gridToScreen } from '../game/viewport';

export interface RenderInput {
  cells: ReadonlySet<CellKey>;
  viewport: Viewport;
  ghostPattern: Pattern | null;
  ghostOriginX: number;
  ghostOriginY: number;
  selection: Selection | null;
  selectionDraft: Selection | null;
}

export function render(
  ctx: CanvasRenderingContext2D,
  input: RenderInput,
): void {
  const canvas = ctx.canvas;
  const w = canvas.width;
  const h = canvas.height;
  const vp = input.viewport;
  const cs = cellSize(vp);

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, w, h);

  if (cs >= 4) {
    ctx.strokeStyle = '#1a1a3e';
    ctx.lineWidth = 1;
    const startX = vp.offsetX % cs;
    const startY = vp.offsetY % cs;
    ctx.beginPath();
    for (let x = startX; x <= w; x += cs) {
      ctx.moveTo(Math.round(x) + 0.5, 0);
      ctx.lineTo(Math.round(x) + 0.5, h);
    }
    for (let y = startY; y <= h; y += cs) {
      ctx.moveTo(0, Math.round(y) + 0.5);
      ctx.lineTo(w, Math.round(y) + 0.5);
    }
    ctx.stroke();
  }

  ctx.fillStyle = '#e94560';
  for (const key of input.cells) {
    const [cx, cy] = parseKey(key);
    const sx = cx * cs + vp.offsetX;
    const sy = cy * cs + vp.offsetY;
    if (sx + cs < 0 || sx > w || sy + cs < 0 || sy > h) continue;
    ctx.fillRect(sx + 0.5, sy + 0.5, cs - 1, cs - 1);
  }

  if (input.ghostPattern) {
    ctx.fillStyle = 'rgba(233,69,96,0.35)';
    for (let r = 0; r < input.ghostPattern.length; r++) {
      const row = input.ghostPattern[r];
      for (let c = 0; c < row.length; c++) {
        if (!row[c]) continue;
        const gx = input.ghostOriginX + c;
        const gy = input.ghostOriginY + r;
        const sx = gx * cs + vp.offsetX;
        const sy = gy * cs + vp.offsetY;
        ctx.fillRect(sx + 0.5, sy + 0.5, cs - 1, cs - 1);
      }
    }
  }

  const activeSelection = input.selectionDraft ?? input.selection;
  if (activeSelection) {
    const x0 = Math.min(activeSelection.x0, activeSelection.x1);
    const y0 = Math.min(activeSelection.y0, activeSelection.y1);
    const x1 = Math.max(activeSelection.x0, activeSelection.x1);
    const y1 = Math.max(activeSelection.y0, activeSelection.y1);
    const [sx0, sy0] = gridToScreen(vp, x0, y0);
    const [sx1, sy1] = gridToScreen(vp, x1 + 1, y1 + 1);
    ctx.save();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(
      Math.round(sx0) + 0.5,
      Math.round(sy0) + 0.5,
      Math.round(sx1 - sx0),
      Math.round(sy1 - sy0),
    );
    ctx.restore();
    ctx.fillStyle = 'rgba(224,224,224,0.08)';
    ctx.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
  }
}
