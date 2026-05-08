<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 container mx-auto px-4 py-6">
      <RouterView />
    </main>
    <footer class="py-4 text-center text-gray-500 text-sm">
      <p>VibeLume - 沉浸光影，自在 VibeLume</p>
    </footer>
  </div>
</template>
