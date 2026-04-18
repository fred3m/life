<script lang="ts">
  import { store } from '../state/gameStore.svelte';
  import type { RegistryNode } from '../game/registry';
  import Self from './PatternNode.svelte';

  let { node, depth = 0 }: { node: RegistryNode; depth?: number } = $props();
  let open = $state(false);

  function pickPattern() {
    if (node.kind !== 'pattern') return;
    store.setPattern(node.data, node.name);
  }
</script>

{#if node.kind === 'folder'}
  <div class="category">
    {#if node.name}
      <button
        type="button"
        class="category-header"
        class:open
        onclick={() => (open = !open)}
      >
        <span class="arrow">▶</span>{node.name}
      </button>
    {/if}
    {#if open || !node.name}
      <div class="category-items" class:root={!node.name} style:--indent="{depth * 12}px">
        {#each node.children as child (child.name)}
          <Self node={child} depth={depth + 1} />
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <button
    type="button"
    class="pattern-btn"
    class:active={store.session.activePatternName === node.name &&
      store.session.activeTool === 'pattern'}
    onclick={pickPattern}
  >
    {node.name}
  </button>
{/if}

<style>
  .category {
    margin-bottom: 4px;
  }
  .category-header {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 6px 8px;
    background: #0f3460;
    border: none;
    color: inherit;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    user-select: none;
    text-align: left;
    font-family: inherit;
  }
  .category-header:hover {
    background: #1a4a7a;
  }
  .category-header .arrow {
    margin-right: 8px;
    transition: transform 0.15s;
    font-size: 10px;
    display: inline-block;
  }
  .category-header.open .arrow {
    transform: rotate(90deg);
  }
  .category-items {
    padding: 4px 0 4px 16px;
  }
  .category-items.root {
    padding-left: 0;
  }
  .pattern-btn {
    display: block;
    width: 100%;
    padding: 5px 10px;
    margin-bottom: 2px;
    background: transparent;
    color: #c0c0c0;
    border: 1px solid transparent;
    border-radius: 3px;
    cursor: pointer;
    text-align: left;
    font-size: 12px;
    font-family: inherit;
  }
  .pattern-btn:hover {
    background: #1a4a7a;
    color: #fff;
  }
  .pattern-btn.active {
    border-color: #e94560;
    color: #e94560;
  }
</style>
