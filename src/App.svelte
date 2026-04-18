<script lang="ts">
  import Sidebar from './lib/components/Sidebar.svelte';
  import Controls from './lib/components/Controls.svelte';
  import Canvas from './lib/components/Canvas.svelte';
</script>

<Sidebar />
<main class="main">
  <Controls />
  <Canvas />
</main>

<style>
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
