import type {
  CellKey,
  Clipboard,
  Pattern,
  Selection,
  Tool,
  Viewport,
} from '../game/types';

export interface DocState {
  cells: ReadonlySet<CellKey>;
  generation: number;
}

export interface SessionState {
  playing: boolean;
  speed: number;
  viewport: Viewport;
  activeTool: Tool;
  activePattern: Pattern | null;
  activePatternName: string | null;
  selection: Selection | null;
  selectionDraft: Selection | null;
  clipboard: Clipboard | null;
  mouseGridX: number;
  mouseGridY: number;
}
