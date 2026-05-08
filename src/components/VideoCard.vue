<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { VideoItem } from '@/types'

const props = defineProps<{
  item: VideoItem
}>()

defineEmits<{
  click: [item: VideoItem]
}>()

const isLoaded = ref(false)
const hasError = ref(false)
const observer = ref<IntersectionObserver | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)

const typeLabel = computed(() => props.item.type === 'tv' ? '剧集' : '电影')

const imageAlt = computed(() => {
  const categories = props.item.categories?.join('、') || ''
  return `${props.item.title} - ${typeLabel.value}${categories ? ' - ' + categories : ''} - ${props.item.year || ''}`.trim()
})

function handleImageLoad() {
  isLoaded.value = true
}

function handleImageError() {
  hasError.value = true
  isLoaded.value = true
}

onMounted(() => {
  if (props.item.cover) {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imageRef.value && !isLoaded.value) {
            imageRef.value.src = props.item.cover
            observer.value?.disconnect()
          }
        })
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    )
    if (imageRef.value) {
      observer.value.observe(imageRef.value)
    }
  }
})

onUnmounted(() => {
  observer.value?.disconnect()
})
</script>

<template>
  <article class="group cursor-pointer" role="article" aria-label="视频卡片" @click="$emit('click', item)">
    <div class="relative aspect-[2/3] rounded-lg overflow-hidden bg-dark-card">
      <div v-if="!isLoaded" class="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center" role="status" aria-label="加载中">
        <svg class="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <img
        v-if="item.cover"
        ref="imageRef"
        :data-src="item.cover"
        :alt="imageAlt"
        class="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
        :class="{ 'opacity-0': !isLoaded || hasError, 'opacity-100': isLoaded && !hasError }"
        @load="handleImageLoad"
        @error="handleImageError"
        loading="lazy"
      />
      
      <div v-if="hasError" class="absolute inset-0 flex items-center justify-center bg-dark-card" role="img" :aria-label="imageAlt">
        <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
        <div class="absolute bottom-2 left-2 right-2 text-center">
          <p class="text-xs text-gray-500 line-clamp-1">{{ item.title }}</p>
        </div>
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <svg class="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="absolute top-2 left-2">
        <span class="px-2 py-0.5 rounded text-xs font-bold bg-primary text-white" role="tag">
          {{ typeLabel }}
        </span>
      </div>
      
      <div v-if="item.rating > 0" class="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 text-secondary text-xs font-medium" role="note">
        <span aria-hidden="true">⭐</span>
        <span>{{ item.rating.toFixed(1) }}</span>
      </div>

      <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p class="text-xs text-gray-300 line-clamp-2" aria-label="简介">{{ item.description }}</p>
      </div>
    </div>
    
    <div class="mt-3">
      <h3 class="font-medium text-white text-sm line-clamp-1 group-hover:text-primary transition-colors" aria-label="标题：{{ item.title }}">
        {{ item.title }}
      </h3>
      <p class="text-gray-500 text-xs mt-1 flex items-center gap-2" aria-label="信息：{{ item.year }} {{ item.categories?.[0] }}">
        <span>{{ item.year }}</span>
        <span v-if="item.categories?.length" class="text-gray-600" aria-hidden="true">·</span>
        <span v-if="item.categories?.length">{{ item.categories[0] }}</span>
      </p>
    </div>
  </article>
</template>
