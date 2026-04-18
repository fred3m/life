<script lang="ts">
  import { store } from '../state/gameStore.svelte';
</script>

<div class="controls">
  <button type="button" class="primary" onclick={() => store.togglePlay()}>
    {store.session.playing ? '❚❚ Pause' : '▶ Play'}
  </button>
  <button type="button" onclick={() => store.stepOnce()} disabled={store.session.playing}>
    Step
  </button>
  <button type="button" onclick={() => store.clear()} disabled={store.session.playing}>
    Clear
  </button>
  <button type="button" onclick={() => store.undo()} disabled={!store.canUndo} title="Cmd/Ctrl+Z">
    ↶ Undo
  </button>
  <button type="button" onclick={() => store.redo()} disabled={!store.canRedo} title="Cmd/Ctrl+Shift+Z">
    ↷ Redo
  </button>
  <label for="speed-slider">Speed:</label>
  <input
    id="speed-slider"
    type="range"
    min="1"
    max="60"
    value={store.session.speed}
    oninput={(e) => store.setSpeed(parseInt((e.target as HTMLInputElement).value))}
  />
  <span class="speed-display">{store.session.speed} gen/s</span>
  <span class="gen-display">Gen: {store.generation}</span>
</div>

<style>
  .controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: #16213e;
    border-bottom: 1px solid #0f3460;
    flex-shrink: 0;
  }
  button {
    padding: 6px 16px;
    background: #0f3460;
    color: #e0e0e0;
    border: 1px solid #1a4a7a;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
  }
  button:hover:not(:disabled) {
    background: #1a4a7a;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  button.primary {
    background: #e94560;
    border-color: #e94560;
    color: #fff;
  }
  button.primary:hover {
    background: #c73a52;
  }
  label {
    font-size: 13px;
    color: #a0a0a0;
  }
  input[type='range'] {
    width: 120px;
    accent-color: #e94560;
  }
  .speed-display {
    font-size: 12px;
    color: #e94560;
    min-width: 50px;
  }
  .gen-display {
    font-size: 12px;
    color: #a0a0a0;
    margin-left: auto;
  }
</style>
