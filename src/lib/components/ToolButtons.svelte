<script lang="ts">
  import { store } from '../state/gameStore.svelte';
  import type { Tool } from '../game/types';

  const tools: { id: Tool; label: string }[] = [
    { id: 'draw', label: '✎ Draw / Toggle Cells' },
    { id: 'erase', label: '✗ Eraser' },
    { id: 'move', label: '✥ Move / Pan' },
    { id: 'select', label: '▭ Select' },
  ];

  function pick(t: Tool) {
    store.setTool(t);
    store.clearSelection();
  }
</script>

<div class="tools">
  {#each tools as t (t.id)}
    <button
      type="button"
      class="tool-btn"
      class:active={store.session.activeTool === t.id}
      onclick={() => pick(t.id)}
    >
      {t.label}
    </button>
  {/each}
</div>

<style>
  .tools {
    padding: 8px;
    border-bottom: 1px solid #0f3460;
    flex-shrink: 0;
  }
  .tool-btn {
    display: block;
    width: 100%;
    padding: 8px 12px;
    margin-bottom: 4px;
    background: #0f3460;
    color: #e0e0e0;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
    font-size: 13px;
    font-family: inherit;
  }
  .tool-btn:hover {
    background: #1a4a7a;
  }
  .tool-btn.active {
    border-color: #e94560;
    background: #1a4a7a;
  }
</style>
