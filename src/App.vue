<script setup>
import { RouterView } from "vue-router";
</script>

<template class="body">
  <div class="h-full w-full">
    <RouterView />
  </div>
</template>

<style scoped>
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.body {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
