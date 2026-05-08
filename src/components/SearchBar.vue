<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  search: [keyword: string]
}>()

const keyword = ref('')
const isFocused = ref(false)

function handleSubmit() {
  if (keyword.value.trim()) {
    emit('search', keyword.value.trim())
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="relative w-full">
    <div
      class="relative flex items-center bg-dark-card border-2 rounded-lg transition-all duration-200"
      :class="isFocused ? 'border-primary shadow-lg shadow-primary/20' : 'border-gray-700 hover:border-gray-600'"
    >
      <svg
        class="absolute left-3 w-5 h-5 text-gray-500 transition-colors"
        :class="isFocused ? 'text-primary' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索你想看的..."
        class="w-full bg-transparent pl-10 pr-12 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <button
        type="submit"
        class="absolute right-2 p-1.5 rounded-lg hover:bg-dark-hover transition-colors"
      >
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  </form>
</template>
