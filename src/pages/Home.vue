<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getHomeList } from '@/api/video'
import Carousel from '@/components/Carousel.vue'
import VideoCard from '@/components/VideoCard.vue'
import type { VideoItem } from '@/types'

function addOrganizationSchema() {
  const existingScript = document.querySelector('script#schema-organization')
  if (existingScript) return
  
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VibeLume",
    "description": "沉浸光影，自在观影。提供最新电影、热门剧集、精彩动漫在线观看服务。",
    "url": "https://vibelume.com",
    "logo": "/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@vibelume.com"
    }
  })
  
  const script = document.createElement('script')
  script.id = 'schema-organization'
  script.type = 'application/ld+json'
  script.textContent = schema
  document.head.appendChild(script)
}

const router = useRouter()
const appStore = useAppStore()

const loading = ref(true)
const error = ref('')
const banner = ref<any[]>([])
const topMovies = ref<VideoItem[]>([])
const topTV = ref<VideoItem[]>([])
const topAnime = ref<VideoItem[]>([])

const CACHE_KEY_PREFIX = 'vibetv_home_'

async function loadHomeData() {
  loading.value = true
  error.value = ''
  topMovies.value = []
  topTV.value = []
  topAnime.value = []

  try {
    const cacheKey = CACHE_KEY_PREFIX + appStore.activeLineId
    const cachedData = localStorage.getItem(cacheKey)
    if (cachedData) {
      const parsed = JSON.parse(cachedData)
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        topMovies.value = parsed.data
        loading.value = false
        return
      }
    }

    if (!appStore.activeLine) {
      error.value = '未选择数据源'
      loading.value = false
      return
    }

    const data = await getHomeList(appStore.activeLine)
    
    if (data && data.length > 0) {
      topMovies.value = data.filter((item: VideoItem) => item.type === 'movie').slice(0, 12)
      topTV.value = data.filter((item: VideoItem) => item.type === 'tv').slice(0, 12)
      topAnime.value = data.filter((item: VideoItem) => 
        item.categories?.some(cat => cat.includes('动漫') || cat.includes('动画')) || 
        item.title.includes('动漫') || item.title.includes('动画')
      ).slice(0, 12)
      
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data
      }))

      if (data.length >= 5) {
        banner.value = data.slice(0, 5).map((item: VideoItem) => ({
          id: item.id,
          title: item.title,
          cover: item.cover,
          description: item.description?.slice(0, 50) || ''
        }))
      }
    } else {
      error.value = '暂无数据，请稍后重试'
    }
  } catch (e) {
    error.value = '加载失败，请检查网络连接'
    console.error('Home data load error:', e)
  } finally {
    loading.value = false
  }
}

function handleVideoClick(item: VideoItem) {
  if (item.id) {
    router.push({ name: 'play', params: { id: item.id } })
  }
}

watch(() => appStore.activeLineId, () => {
  loadHomeData()
})

onMounted(() => {
  addOrganizationSchema()
  loadHomeData()
})
</script>

<template>
  <div class="min-h-screen bg-dark">
    <section v-if="loading" class="py-24" role="status" aria-label="加载中">
      <div class="max-w-7xl mx-auto px-4">
        <div class="animate-pulse">
          <div class="aspect-video rounded-lg bg-dark-card mb-8"></div>
          
          <div class="space-y-6">
            <div>
              <div class="h-8 bg-gray-800 rounded w-48 mb-4"></div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <div v-for="i in 12" :key="i" class="animate-pulse">
                  <div class="aspect-[2/3] rounded-lg bg-dark-card"></div>
                  <div class="mt-3 h-4 bg-gray-800 rounded w-3/4"></div>
                  <div class="mt-2 h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="error" class="py-24 text-center">
      <div class="max-w-7xl mx-auto px-4">
        <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-gray-400 mb-6">{{ error }}</div>
        <button
          class="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all hover:scale-105"
          @click="loadHomeData"
        >
          重试
        </button>
      </div>
    </section>

    <section v-else class="pb-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="mb-8 pt-24">
          <Carousel :banners="banner" />
        </div>

        <section class="mb-10">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-1 h-6 bg-primary rounded-full"></div>
              <h2 class="text-xl md:text-2xl font-bold font-display text-white">精彩影视</h2>
            </div>
            <button 
              class="text-sm text-gray-400 hover:text-primary transition-colors hidden sm:block"
              @click="router.push({ name: 'search', query: { q: '' } })"
            >
              更多推荐 →
            </button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <VideoCard
              v-for="item in topMovies"
              :key="item.id"
              :item="item"
              @click="handleVideoClick"
            />
          </div>
        </section>

        <section v-if="topTV.length > 0" class="mb-10">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-1 h-6 bg-secondary rounded-full"></div>
              <h2 class="text-xl md:text-2xl font-bold font-display text-white">热播剧集</h2>
            </div>
            <button 
              class="text-sm text-gray-400 hover:text-primary transition-colors hidden sm:block"
              @click="router.push({ name: 'search', query: { q: '电视剧' } })"
            >
              更多推荐 →
            </button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <VideoCard
              v-for="item in topTV"
              :key="item.id"
              :item="item"
              @click="handleVideoClick"
            />
          </div>
        </section>

        <section v-if="topAnime.length > 0" class="mb-10">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h2 class="text-xl md:text-2xl font-bold font-display text-white">动漫专区</h2>
            </div>
            <button 
              class="text-sm text-gray-400 hover:text-primary transition-colors hidden sm:block"
              @click="router.push({ name: 'search', query: { q: '动漫' } })"
            >
              更多推荐 →
            </button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <VideoCard
              v-for="item in topAnime"
              :key="item.id"
              :item="item"
              @click="handleVideoClick"
            />
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
