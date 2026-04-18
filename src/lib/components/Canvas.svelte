<script lang="ts">
  import { onMount } from 'svelte';
  import { store } from '../state/gameStore.svelte';
  import { render } from '../render/canvasRenderer';
  import { screenToGrid } from '../game/viewport';
  import type { Tool } from '../game/types';

  let wrapEl: HTMLDivElement;
  let canvasEl: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  let isPanning = false;
  let isDrawing = false;
  let isSelecting = false;
  let panStartX = 0;
  let panStartY = 0;
  let panOriginX = 0;
  let panOriginY = 0;

  function resize() {
    if (!canvasEl || !wrapEl) return;
    canvasEl.width = wrapEl.clientWidth;
    canvasEl.height = wrapEl.clientHeight;
  }

  onMount(() => {
    ctx = canvasEl.getContext('2d');
    resize();
    store.setViewport({
      zoom: 1,
      offsetX: canvasEl.width / 2,
      offsetY: canvasEl.height / 2,
    });

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrapEl);

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        store.undo();
        return;
      }
      if ((mod && e.shiftKey && e.key.toLowerCase() === 'z') || (mod && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        store.redo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'c') {
        if (store.session.selection) {
          e.preventDefault();
          store.copySelection();
        }
        return;
      }
      if (mod && e.key.toLowerCase() === 'v') {
        if (store.session.clipboard) {
          e.preventDefault();
          store.enterPasteMode();
        }
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.session.selection) {
          e.preventDefault();
          store.deleteSelection();
        }
        return;
      }
      if (e.key === 'Escape') {
        if (store.session.activeTool === 'paste' || store.session.activeTool === 'pattern') {
          store.setTool('draw');
        } else if (store.session.selection || store.session.selectionDraft) {
          store.clearSelection();
        }
        return;
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      ro.disconnect();
      window.removeEventListener('keydown', onKey);
    };
  });

  $effect(() => {
    if (!ctx) return;
    const session = store.session;
    const tool: Tool = session.activeTool;
    let ghostPattern = null;
    if (!session.playing) {
      if (tool === 'pattern' && session.activePattern) {
        ghostPattern = session.activePattern;
      } else if (tool === 'paste' && session.clipboard) {
        ghostPattern = session.clipboard.pattern;
      }
    }
    render(ctx, {
      cells: store.cells,
      viewport: session.viewport,
      ghostPattern,
      ghostOriginX: session.mouseGridX,
      ghostOriginY: session.mouseGridY,
      selection: session.selection,
      selectionDraft: session.selectionDraft,
    });
  });

  $effect(() => {
    if (!store.session.playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (ts: number) => {
      const interval = 1000 / store.session.speed;
      if (ts - last >= interval) {
        store.tickOnce();
        last = ts;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

  function mousePos(e: MouseEvent): [number, number] {
    const rect = canvasEl.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function onMouseDown(e: MouseEvent) {
    if (store.session.playing) return;
    const [mx, my] = mousePos(e);
    const [gx, gy] = screenToGrid(store.session.viewport, mx, my);

    const wantsPan =
      e.button === 1 ||
      (e.button === 0 && e.shiftKey) ||
      (e.button === 0 && store.session.activeTool === 'move');

    if (wantsPan) {
      e.preventDefault();
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      panOriginX = store.session.viewport.offsetX;
      panOriginY = store.session.viewport.offsetY;
      return;
    }

    if (e.button !== 0) return;

    const tool = store.session.activeTool;
    if (tool === 'pattern') {
      store.placePatternAt(gx, gy);
      return;
    }
    if (tool === 'paste') {
      store.pasteAt(gx, gy);
      store.setTool('draw');
      return;
    }
    if (tool === 'select') {
      isSelecting = true;
      store.beginSelectionDrag(gx, gy);
      return;
    }
    // draw or erase
    isDrawing = true;
    store.beginStroke(gx, gy, tool === 'erase' ? 'erase' : 'draw');
  }

  function onMouseMove(e: MouseEvent) {
    const [mx, my] = mousePos(e);
    const [gx, gy] = screenToGrid(store.session.viewport, mx, my);
    store.setMouseGrid(gx, gy);

    if (isPanning) {
      store.setViewport({
        zoom: store.session.viewport.zoom,
        offsetX: panOriginX + (e.clientX - panStartX),
        offsetY: panOriginY + (e.clientY - panStartY),
      });
      return;
    }
    if (isDrawing && !store.session.playing) {
      store.extendStroke(gx, gy);
      return;
    }
    if (isSelecting && !store.session.playing) {
      store.extendSelectionDrag(gx, gy);
      return;
    }
  }

  function endInteraction() {
    if (isDrawing) store.endStroke();
    if (isSelecting) store.endSelectionDrag();
    isPanning = false;
    isDrawing = false;
    isSelecting = false;
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const [mx, my] = mousePos(e);
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    store.zoomAt(mx, my, factor);
  }

  function cursorFor(tool: Tool, playing: boolean, panning: boolean): string {
    if (playing) return 'default';
    if (panning) return 'grabbing';
    if (tool === 'move') return 'grab';
    if (tool === 'erase') return 'pointer';
    if (tool === 'select') return 'crosshair';
    return 'crosshair';
  }

  let cursor = $derived(
    cursorFor(store.session.activeTool, store.session.playing, isPanning),
  );
</script>

<div
  bind:this={wrapEl}
  class="canvas-wrap"
  style:cursor={cursor}
  onmousedown={onMouseDown}
  onmousemove={onMouseMove}
  onmouseup={endInteraction}
  onmouseleave={endInteraction}
  onwheel={onWheel}
  role="presentation"
>
  <canvas bind:this={canvasEl}></canvas>
</div>

<style>
  .canvas-wrap {
    flex: 1;
    overflow: hidden;
    position: relative;
  }
  canvas {
    display: block;
  }
</style>
