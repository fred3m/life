import type { CellKey, Pattern, Tool, Viewport } from '../game/types';
import { keyOf } from '../game/cells';
import { step } from '../game/engine';
import { stampPattern } from '../game/patterns';
import {
  clearRect,
  extractPattern,
  normalizeSelection,
} from '../game/selection';
import { zoomAt as viewportZoomAt } from '../game/viewport';
import { History } from './history.svelte';
import type { DocState, SessionState } from './types';

const HISTORY_CAP = 100;

function initialDoc(): DocState {
  return { cells: new Set<CellKey>(), generation: 0 };
}

function initialSession(): SessionState {
  return {
    playing: false,
    speed: 10,
    viewport: { zoom: 1, offsetX: 0, offsetY: 0 },
    activeTool: 'draw',
    activePattern: null,
    activePatternName: null,
    selection: null,
    selectionDraft: null,
    clipboard: null,
    mouseGridX: 0,
    mouseGridY: 0,
  };
}

class GameStore {
  #history = new History<DocState>(initialDoc(), HISTORY_CAP);
  session = $state<SessionState>(initialSession());

  #strokeDraft: Set<CellKey> | null = null;
  #strokeNonce = $state(0);
  #drawValue: boolean | null = null;

  get cells(): ReadonlySet<CellKey> {
    this.#strokeNonce;
    return this.#strokeDraft ?? this.#history.present.cells;
  }

  get generation(): number {
    return this.#history.present.generation;
  }

  get canUndo(): boolean {
    return this.#history.canUndo && !this.session.playing;
  }

  get canRedo(): boolean {
    return this.#history.canRedo && !this.session.playing;
  }

  // ───────── Strokes (draw / erase) ─────────

  beginStroke(gx: number, gy: number, tool: 'draw' | 'erase'): void {
    if (this.session.playing) return;
    this.#strokeDraft = new Set(this.#history.present.cells);
    this.#history.beginTransaction();
    const key = keyOf(gx, gy);
    if (tool === 'erase') {
      this.#drawValue = false;
      this.#strokeDraft.delete(key);
    } else {
      this.#drawValue = !this.#strokeDraft.has(key);
      if (this.#drawValue) this.#strokeDraft.add(key);
      else this.#strokeDraft.delete(key);
    }
    this.#strokeNonce++;
  }

  extendStroke(gx: number, gy: number): void {
    if (!this.#strokeDraft || this.#drawValue === null) return;
    const key = keyOf(gx, gy);
    if (this.#drawValue) this.#strokeDraft.add(key);
    else this.#strokeDraft.delete(key);
    this.#strokeNonce++;
  }

  endStroke(): void {
    if (!this.#strokeDraft) return;
    const next: DocState = {
      cells: this.#strokeDraft,
      generation: this.#history.present.generation,
    };
    this.#strokeDraft = null;
    this.#drawValue = null;
    this.#strokeNonce++;
    this.#history.commitTransaction(next);
  }

  // ───────── Patterns & paste ─────────

  placePatternAt(gx: number, gy: number): void {
    if (this.session.playing || !this.session.activePattern) return;
    const nextCells = stampPattern(
      this.#history.present.cells,
      this.session.activePattern,
      gx,
      gy,
    );
    this.#history.commit({
      cells: nextCells,
      generation: this.#history.present.generation,
    });
  }

  pasteAt(gx: number, gy: number): void {
    if (this.session.playing || !this.session.clipboard) return;
    const nextCells = stampPattern(
      this.#history.present.cells,
      this.session.clipboard.pattern,
      gx,
      gy,
    );
    this.#history.commit({
      cells: nextCells,
      generation: this.#history.present.generation,
    });
  }

  // ───────── Selection ─────────

  beginSelectionDrag(gx: number, gy: number): void {
    if (this.session.playing) return;
    this.session.selectionDraft = { x0: gx, y0: gy, x1: gx, y1: gy };
    this.session.selection = null;
  }

  extendSelectionDrag(gx: number, gy: number): void {
    if (!this.session.selectionDraft) return;
    this.session.selectionDraft = {
      ...this.session.selectionDraft,
      x1: gx,
      y1: gy,
    };
  }

  endSelectionDrag(): void {
    if (!this.session.selectionDraft) return;
    this.session.selection = normalizeSelection(this.session.selectionDraft);
    this.session.selectionDraft = null;
  }

  clearSelection(): void {
    this.session.selection = null;
    this.session.selectionDraft = null;
  }

  copySelection(): void {
    if (!this.session.selection) return;
    const { pattern, w, h } = extractPattern(
      this.#history.present.cells,
      this.session.selection,
    );
    this.session.clipboard = { pattern, w, h };
  }

  deleteSelection(): void {
    if (this.session.playing || !this.session.selection) return;
    const nextCells = clearRect(
      this.#history.present.cells,
      this.session.selection,
    );
    this.#history.commit({
      cells: nextCells,
      generation: this.#history.present.generation,
    });
  }

  // ───────── Simulation ─────────

  clear(): void {
    if (this.session.playing) return;
    this.#history.commit({ cells: new Set(), generation: 0 });
  }

  stepOnce(): void {
    if (this.session.playing) return;
    this.#history.commit({
      cells: step(this.#history.present.cells),
      generation: this.#history.present.generation + 1,
    });
  }

  togglePlay(): void {
    if (this.session.playing) {
      this.session.playing = false;
      this.#history.commitTransaction(this.#history.present);
    } else {
      this.session.selection = null;
      this.session.selectionDraft = null;
      this.#history.beginTransaction();
      this.session.playing = true;
    }
  }

  tickOnce(): void {
    if (!this.session.playing) return;
    this.#history.setPresent({
      cells: step(this.#history.present.cells),
      generation: this.#history.present.generation + 1,
    });
  }

  // ───────── Session-only setters ─────────

  setSpeed(n: number): void {
    this.session.speed = n;
  }

  setTool(t: Tool): void {
    this.session.activeTool = t;
    if (t !== 'pattern') {
      this.session.activePattern = null;
      this.session.activePatternName = null;
    }
  }

  setPattern(p: Pattern, name: string): void {
    this.session.activePattern = p;
    this.session.activePatternName = name;
    this.session.activeTool = 'pattern';
  }

  enterPasteMode(): void {
    if (!this.session.clipboard) return;
    this.session.activePattern = null;
    this.session.activePatternName = null;
    this.session.activeTool = 'paste';
  }

  setMouseGrid(x: number, y: number): void {
    this.session.mouseGridX = x;
    this.session.mouseGridY = y;
  }

  pan(dx: number, dy: number): void {
    const vp = this.session.viewport;
    this.session.viewport = {
      zoom: vp.zoom,
      offsetX: vp.offsetX + dx,
      offsetY: vp.offsetY + dy,
    };
  }

  setViewport(vp: Viewport): void {
    this.session.viewport = vp;
  }

  zoomAt(mx: number, my: number, factor: number): void {
    this.session.viewport = viewportZoomAt(this.session.viewport, mx, my, factor);
  }

  // ───────── History ─────────

  undo(): void {
    if (this.session.playing) return;
    this.#history.undo();
  }

  redo(): void {
    if (this.session.playing) return;
    this.#history.redo();
  }
}

export const store = new GameStore();
