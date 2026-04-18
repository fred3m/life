<script lang="ts">
  import ToolButtons from './ToolButtons.svelte';
  import PatternList from './PatternList.svelte';
</script>

<aside class="sidebar">
  <h2>Tools & Patterns</h2>
  <ToolButtons />
  <PatternList />
</aside>

<style>
  .sidebar {
    width: 280px;
    min-width: 280px;
    background: #16213e;
    border-right: 1px solid #0f3460;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  h2 {
    padding: 16px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #e94560;
    border-bottom: 1px solid #0f3460;
    flex-shrink: 0;
    margin: 0;
    font-weight: 600;
  }
</style>
