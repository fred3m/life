<script lang="ts">
  import { builtinRegistry } from '../game/registry';
  import PatternNode from './PatternNode.svelte';
</script>

<div class="pattern-list">
  <PatternNode node={builtinRegistry.root} depth={0} />
</div>

<style>
  .pattern-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  .pattern-list::-webkit-scrollbar {
    width: 6px;
  }
  .pattern-list::-webkit-scrollbar-track {
    background: #16213e;
  }
  .pattern-list::-webkit-scrollbar-thumb {
    background: #0f3460;
    border-radius: 3px;
  }
</style>
