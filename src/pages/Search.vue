<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { searchVideos } from '@/api/video'
import VideoCard from '@/components/VideoCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { VideoItem } from '@/types'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const keyword = ref('')
const videos = ref<VideoItem[]>([])
const loading = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const searchCache = ref<Map<string, VideoItem[]>>(new Map())



async function doSearch(kw: string) {
  if (!kw.trim() || !appStore.activeLine) return

  const trimmedKw = kw.trim()
  const cacheKey = `${appStore.activeLineId}_${trimmedKw}`
  
  if (searchCache.value.has(cacheKey)) {
    videos.value = searchCache.value.get(cacheKey)!
    loading.value = false
    return
  }

  loading.value = true
  keyword.value = trimmedKw

  try {
    const result = await searchVideos(trimmedKw, appStore.activeLine)
    const results = result.list
    videos.value = results
    searchCache.value.set(cacheKey, results)
    
    if (searchCache.value.size > 20) {
      const firstKey = searchCache.value.keys().next().value
      if (firstKey) {
        searchCache.value.delete(firstKey)
      }
    }
  } catch (e) {
    videos.value = []
  } finally {
    loading.value = false
  }
}

function debouncedSearch(kw: string) {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    doSearch(kw)
  }, 300)
}

function handleVideoClick(item: VideoItem) {
  if (item.id) {
    router.push({ name: 'play', params: { id: item.id } })
  }
}

function handleSearch(kw: string) {
  router.push({ name: 'search', query: { q: kw } })
}

onMounted(() => {
  const q = route.query.q as string
  if (q) {
    doSearch(q)
  }
})

watch(() => route.query.q, (newQ) => {
  if (newQ) {
    debouncedSearch(newQ as string)
  }
})

watch(() => appStore.activeLineId, () => {
  const q = route.query.q as string
  if (q) {
    doSearch(q)
  }
})

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <div class="min-h-screen bg-dark pt-20 sm:pt-24 pb-12">
    <div class="max-w-7xl mx-auto px-2 sm:px-4">
      <div class="max-w-xl mx-auto mb-6 sm:mb-8">
        <SearchBar @search="handleSearch" />
      </div>

      <h1 class="text-lg sm:text-xl md:text-2xl font-bold font-display text-white mb-6 sm:mb-8">
        <span v-if="keyword || route.query.q">
          搜索结果："<span class="text-primary">{{ keyword || route.query.q }}</span>"
        </span>
        <span v-else>找片</span>
      </h1>

      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
        <div v-for="i in 12" :key="i" class="animate-pulse">
          <div class="aspect-[2/3] rounded-lg bg-dark-card"></div>
          <div class="mt-2 sm:mt-3 h-3 sm:h-4 bg-gray-800 rounded w-3/4"></div>
          <div class="mt-1 sm:mt-2 h-2 sm:h-3 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>

      <div v-else-if="videos.length === 0" class="text-center py-16 sm:py-20">
        <div class="max-w-md mx-auto">
          <svg class="w-16 h-16 sm:w-20 sm:h-20 text-gray-700 mx-auto mb-4 sm:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 class="text-lg sm:text-xl font-bold text-white mb-2">
            {{ keyword || route.query.q ? '没找到相关内容' : '发现你的下一部好片' }}
          </h2>
          <p class="text-gray-500 mb-6 text-sm sm:text-base">
            {{ keyword || route.query.q ? '试试其他关键词，发现更多精彩' : '搜索你想看的...' }}
          </p>
          <SearchBar @search="handleSearch" class="max-w-xs sm:max-w-sm mx-auto" />
        </div>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
        <VideoCard
          v-for="item in videos"
          :key="item.id"
          :item="item"
          @click="handleVideoClick"
        />
      </div>
    </div>
  </div>
</template>
