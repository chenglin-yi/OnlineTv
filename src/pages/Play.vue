<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getVideoDetail } from '@/api/video'
import Hls from 'hls.js'
import type { VideoItem, VideoEpisode, VideoPlaySource, VideoSource } from '@/types'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const videoItem = ref<VideoItem | null>(null)
const videoSources = ref<VideoSource[]>([])
const loading = ref(true)
const error = ref('')
const videoUrl = ref('')
const currentEpisodeIndex = ref(0)
const currentSourceIndex = ref(0)
const playMode = ref<'inline' | 'external'>('inline')
const showEpisodePanel = ref(false)
const showSourcePanel = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(80)
const isFullscreen = ref(false)
const showControls = ref(true)
const hoverTimeout = ref<number | null>(null)
const hlsInstance = ref<Hls | null>(null)

function loadHls(url: string) {
  const videoEl = videoRef.value
  if (!videoEl) {
    console.warn('[HLS] Video element not ready, retry in 500ms')
    setTimeout(() => loadHls(url), 500)
    return
  }
  
  if (hlsInstance.value) {
    hlsInstance.value.destroy()
    hlsInstance.value = null
  }
  
  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
    })
    hls.loadSource(url)
    hls.attachMedia(videoEl)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('[HLS] Manifest parsed')
    })
    hls.on(Hls.Events.ERROR, (_event, data) => {
      console.error('[HLS] Error:', data)
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('[HLS] Network error, try to recover')
            if (url.includes('/share/')) {
              error.value = '该视频需要在新窗口播放'
            }
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('[HLS] Media error, try to recover')
            hls.recoverMediaError()
            break
          default:
            console.error('[HLS] Fatal error, cannot recover')
            if (url.includes('/share/')) {
              error.value = '该视频请尝试点击"新窗口播放"'
            }
            hls.destroy()
            break
        }
      }
    })
    hlsInstance.value = hls
  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    videoEl.src = url
  }
}

function destroyHls() {
  if (hlsInstance.value) {
    hlsInstance.value.destroy()
    hlsInstance.value = null
  }
}

function updateSchemaOrg() {
  if (!videoItem.value) return
  
  const existingScript = document.querySelector('script#schema-video')
  if (existingScript) {
    existingScript.remove()
  }
  
  const item = videoItem.value
  const videoType = item.type === 'tv' ? 'TVSeries' : 'Movie'
  
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": videoType,
    "name": item.title,
    "description": item.description,
    "image": item.cover,
    "thumbnailUrl": item.cover,
    "dateCreated": item.year ? `${item.year}-01-01` : undefined,
    "genre": item.categories,
    "contentRating": "TV-14",
    "duration": "PT1H30M",
    "isFamilyFriendly": true,
    "productionCompany": {
      "@type": "Organization",
      "name": "VibeLume"
    }
  }
  
  if (item.rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": item.rating.toFixed(1),
      "bestRating": "10",
      "ratingCount": "100"
    }
  }
  
  Object.keys(schema).forEach(key => {
    if (schema[key] === undefined || schema[key] === null || 
        (Array.isArray(schema[key]) && (schema[key] as unknown[]).length === 0)) {
      delete schema[key]
    }
  })
  
  const script = document.createElement('script')
  script.id = 'schema-video'
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

function updateMetaTags() {
  if (!videoItem.value) return
  
  const item = videoItem.value
  const title = `${item.title} - VibeLume`
  const description = item.description || '在线观看高清影视内容'
  
  document.title = title
  
  const descMeta = document.querySelector('meta[name="description"]')
  if (descMeta) descMeta.setAttribute('content', description)
  
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (ogTitle) ogTitle.setAttribute('content', title)
  
  const ogDesc = document.querySelector('meta[property="og:description"]')
  if (ogDesc) ogDesc.setAttribute('content', description)
  
  const ogImage = document.querySelector('meta[property="og:image"]')
  if (ogImage && item.cover) ogImage.setAttribute('content', item.cover)
  
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')
  if (twitterTitle) twitterTitle.setAttribute('content', title)
  
  const twitterDesc = document.querySelector('meta[name="twitter:description"]')
  if (twitterDesc) twitterDesc.setAttribute('content', description)
}

const currentSource = computed<VideoPlaySource | null>(() => {
  if (!videoItem.value?.sources || videoItem.value.sources.length === 0) return null
  return videoItem.value.sources[currentSourceIndex.value]
})
const currentEpisode = computed<VideoEpisode | null>(() => {
 if (!currentSource.value?.episodes || currentSource.value.episodes.length === 0)
 return null;
 return currentSource.value.episodes[currentEpisodeIndex.value];
});

async function parseVideoUrl(url: string, videoProxy?: string): Promise<string> {
  if (!url) return ''
  
  if (url.includes('/share/') && videoProxy && videoProxy.startsWith('/')) {
    return `${videoProxy}${url}`
  }
  
  if (url.startsWith('https://')) {
    return url
  }
  
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }
  
  if (videoProxy && videoProxy.startsWith('/')) {
    return `${videoProxy}${url}`
  }
  
  const parseUrl = `https://www.mbbcc.icu/?url=${encodeURIComponent(url)}`
  return parseUrl
}

async function loadVideo() {
  const id = route.params.id as string
  if (!id) {
    error.value = '缺少视频ID'
    loading.value = false
    return
  }

  if (!appStore.activeLine) {
    error.value = '未选择数据源'
    loading.value = false
    return
  }

loading.value = true
  error.value = ''
  try {
    const result = await getVideoDetail(id, appStore.activeLine)
    if (result) {
      videoItem.value = result.item
      videoSources.value = result.sources as any
      
      const sourcesData = result.playSources || []
      console.log('[Play] playSources:', sourcesData)
      ;(videoItem.value as any).sources = [{ id: 'combined', name: '全部集数', episodes: sourcesData.flatMap(ps => ps.episodes) }]
      
const urlSources = result.sources as any[]
        if (urlSources.length > 0) {
          const m3u8Url = urlSources.find((s: any) => s.url && s.url.includes('.m3u8'))
          const firstUrlSource = m3u8Url || urlSources[0]
          if (firstUrlSource.url) {
            console.log('[loadVideo] firstSource URL:', firstUrlSource.url)
            videoUrl.value = await parseVideoUrl(firstUrlSource.url, appStore.activeLine?.videoProxy)
            console.log('[loadVideo] parsed URL:', videoUrl.value)
          }

        if (videoUrl.value) {
          if (videoUrl.value.includes('.m3u8') || videoUrl.value.includes('/share/')) {
            setTimeout(() => loadHls(videoUrl.value), 100)
          }
        }
      }

      updateMetaTags()
      updateSchemaOrg()
    } else {
      error.value = '未找到该视频'
    }
  } catch (e) {
    error.value = '加载视频信息失败'
    console.error('Load video error:', e)
  } finally {
    loading.value = false
  }
}

async function selectEpisode(index: number) {
  if (!currentSource.value?.episodes) return
  const episode = currentSource.value.episodes[index]
  if (!episode) return
  currentEpisodeIndex.value = index
  const episodeUrl = episode.url
  const videoProxy = appStore.activeLine?.videoProxy
  console.log('[selectEpisode] episode URL:', episodeUrl)
  console.log('[selectEpisode] videoProxy:', videoProxy)
  videoUrl.value = await parseVideoUrl(episodeUrl, videoProxy)
  console.log('[selectEpisode] parsed URL:', videoUrl.value)
  showEpisodePanel.value = false
  showControls.value = true
  error.value = ''
  destroyHls()
  if (videoUrl.value.includes('.m3u8') || videoUrl.value.includes('/share/')) {
    setTimeout(() => loadHls(videoUrl.value), 200)
  } else if (videoRef.value) {
    videoRef.value.src = videoUrl.value
    videoRef.value.load()
  }
}
function handleSelectEpisode(index: number) {
  selectEpisode(index)
}
async function selectSource(index: number) {
  if (!videoItem.value?.sources)
    return;
  currentSourceIndex.value = index;
  currentEpisodeIndex.value = 0;
  if (videoItem.value.sources[index].episodes.length > 0) {
    const episodeUrl = videoItem.value.sources[index].episodes[0].url;
    videoUrl.value = await parseVideoUrl(episodeUrl, appStore.activeLine?.videoProxy);
  }
  showSourcePanel.value = false;
  if (videoUrl.value.includes('.m3u8') || videoUrl.value.includes('/share/')) {
    destroyHls();
    setTimeout(() => loadHls(videoUrl.value), 100);
  } else if (videoRef.value) {
    videoRef.value.src = videoUrl.value;
    videoRef.value.load();
  }
}
function openInNewWindow() {
 if (videoUrl.value) {
 let url = videoUrl.value;
 if (url.startsWith('/video-proxy')) {
 url = `https://vip.ffzy-play6.com${url.replace('/video-proxy', '')}`;
 }
 else if (url.startsWith('/svip-video')) {
 url = `https://svipsvip.ffzyread1.com${url.replace('/svip-video', '')}`;
 }
 else if (url.startsWith('/ffzy-video')) {
 url = `https://vip.ffzy-play1.com${url.replace('/ffzy-video', '')}`;
 }
 else if (url.startsWith('https://www.mbbcc.icu')) {
 const originalUrl = decodeURIComponent(url.split('url=')[1] || '')
 if (originalUrl) {
 url = originalUrl
 }
 }
 window.open(url, '_blank');
 }
}
function togglePlay() {
 if (videoRef.value) {
 if (videoRef.value.paused) {
 videoRef.value.play();
 isPlaying.value = true;
 }
 else {
 videoRef.value.pause();
 isPlaying.value = false;
 }
 }
}
function toggleFullscreen() {
 const container = document.querySelector('.video-container');
 if (!container)
 return;
 if (!document.fullscreenElement) {
 container.requestFullscreen();
 isFullscreen.value = true;
 }
 else {
 document.exitFullscreen();
 isFullscreen.value = false;
 }
}
function toggleMute() {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted
  }
}
function toggleEpisodePanel() {
  showEpisodePanel.value = !showEpisodePanel.value
}
function toggleSourcePanel() {
  showSourcePanel.value = !showSourcePanel.value
}
function updateProgress(event: Event) {
 const target = event.target as HTMLVideoElement;
 currentTime.value = target.currentTime;
}
function updateDuration(event: Event) {
 const target = event.target as HTMLVideoElement;
 duration.value = target.duration;
}
function seekTo(event: Event) {
 const target = event.target as HTMLInputElement;
 const time = parseFloat(target.value);
 if (videoRef.value) {
 videoRef.value.currentTime = time;
 }
}
function updateVolume(event: Event) {
 const target = event.target as HTMLInputElement;
 const vol = parseFloat(target.value);
 volume.value = vol;
 if (videoRef.value) {
 videoRef.value.volume = vol / 100;
 }
}
function formatTime(seconds: number): string {
 const mins = Math.floor(seconds / 60);
 const secs = Math.floor(seconds % 60);
 return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
function handleMouseMove() {
  showControls.value = true
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value)
  }
  hoverTimeout.value = window.setTimeout(() => {
    if (isPlaying.value && !showEpisodePanel.value && !showSourcePanel.value) {
      showControls.value = false
    }
  }, 3000)
}
function goBack() {
  router.back()
}
watch(() => route.params, () => {
  loadVideo()
})
onMounted(() => {
  loadVideo()
})
onUnmounted(() => {
  destroyHls()
})
</script>

<template>
  <div class="min-h-screen bg-dark">
    <div class="fixed top-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur-md border-b border-gray-800" role="banner" aria-label="顶部导航栏">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="hidden sm:inline">返回</span>
        </button>
        <h1 class="text-lg font-bold text-white truncate max-w-md">
          {{ videoItem?.title || '加载中...' }}
        </h1>
        <div class="w-20"></div>
      </div>
    </div>

    <div class="pt-14">
      <div v-if="loading" class="flex items-center justify-center py-32">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span class="text-gray-400 mt-4">加载中...</span>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-32">
        <svg class="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-red-400 text-lg mb-4">{{ error }}</div>
        <button
          class="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all hover:scale-105"
          @click="loadVideo"
        >
          重新加载
        </button>
      </div>

      <div v-else-if="videoItem" class="animate-fade-in">
        <div class="relative video-container" @mousemove="handleMouseMove">
          <div class="absolute inset-0 bg-black">
            <video
              ref="videoRef"
              crossorigin="anonymous"
              class="w-full h-full"
              @timeupdate="updateProgress"
              @loadedmetadata="updateDuration"
              @play="isPlaying = true"
              @pause="isPlaying = false"
              @ended="isPlaying = false"
            ></video>
          </div>

          <div
            class="absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-300"
            :class="{ 'opacity-0': videoUrl && !showControls, 'opacity-100': !videoUrl || showControls }"
          >
            <template v-if="videoUrl">
              <button
                @click="togglePlay"
                class="group relative w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-all hover:scale-110"
              >
                <svg v-if="!isPlaying" class="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <svg v-else class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              </button>
            </template>
            <template v-else>
              <div class="text-center">
                <svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-xl font-bold text-white mb-2">{{ videoItem.title }}</h2>
                <p class="text-gray-400">该资源暂不可用</p>
              </div>
            </template>
          </div>

          <div
            v-if="videoUrl"
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300"
            :class="{ 'opacity-0': !showControls && isPlaying, 'opacity-100': showControls || !isPlaying }"
          >
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <input
                  type="range"
                  :value="currentTime"
                  :max="duration || 100"
                  @input="seekTo"
                  class="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
                />
              </div>
              <span class="text-white text-sm min-w-[80px] text-right">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
              </span>
            </div>
            
            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center gap-3">
                <button
                  @click="togglePlay"
                  class="text-white hover:text-primary transition-colors"
                >
                  <svg v-if="!isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                </button>
                
                <div class="flex items-center gap-2 group">
                  <button
                    @click="toggleMute"
                    class="text-white hover:text-primary transition-colors"
                  >
                    <svg v-if="volume > 0" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89 1.19 5 3.65 5 6.71s-2.11 5.52-5 6.71v2.06c4.01-1.29 7-4.91 7-9.77s-2.99-8.48-7-9.77z"/>
                    </svg>
                    <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.86-3.95-8.87-8.87-9.79V3.5c0 .54.23 1.04.61 1.42l1.41 1.41C15.62 6.58 17 8.82 17 12zm0 0c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM3 9v6h4l5 5V4L7 9H3z"/>
                    </svg>
                  </button>
                  <input
                    type="range"
                    :value="volume"
                    max="100"
                    @input="updateVolume"
                    class="w-16 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider hidden group-hover:block"
                  />
                </div>
                
                <button
                  @click="toggleFullscreen"
                  class="text-white hover:text-primary transition-colors"
                >
                  <svg v-if="!isFullscreen" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                  <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  </svg>
                </button>
              </div>
              
              <div class="flex items-center gap-3">
                <div class="relative">
                  <button
                    @click.stop="toggleSourcePanel"
                    class="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
                  >
                    {{ currentSource?.name || '线路' }}
                  </button>
                  <div
                    v-if="showSourcePanel && videoItem.sources && videoItem.sources.length > 0"
                    class="absolute bottom-full right-0 mb-2 w-32 bg-gray-900 rounded-lg shadow-xl overflow-hidden z-50"
                  >
                    <button
                      v-for="(source, index) in videoItem.sources"
                      :key="source.id"
                      @click.stop="selectSource(index)"
                      class="w-full px-4 py-2 text-left text-white hover:bg-primary/20 transition-colors text-sm"
                      :class="{ 'bg-primary/30': index === currentSourceIndex }"
                    >
                      {{ source.name }}
                    </button>
                  </div>
                </div>
                
                <div class="relative">
                  <button
                    @click.stop="toggleEpisodePanel"
                    class="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
                  >
                    {{ currentEpisode?.name || '集数' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="showEpisodePanel"
          class="fixed inset-0 bg-black/80 z-50 flex items-end"
          @click="showEpisodePanel = false"
        >
          <div
            class="w-full bg-gray-900 rounded-t-lg max-h-[70vh] overflow-y-auto"
            @click.stop
          >
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700 sticky top-0 bg-gray-900">
              <h3 class="text-white font-medium">选集</h3>
              <button
                @click="showEpisodePanel = false"
                class="text-gray-400 hover:text-white transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-4">
              <div v-if="currentSource?.episodes?.length" class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                <button
                  v-for="(episode, index) in currentSource.episodes"
                  :key="episode.id"
                  @click="handleSelectEpisode(index); showEpisodePanel = false"
                  class="px-2 py-2 text-center text-white hover:bg-primary/30 transition-colors text-sm rounded"
                  :class="{ 'bg-primary': index === currentEpisodeIndex }"
                >
                  {{ episode.name }}
                </button>
              </div>
              <div v-else class="text-gray-500 text-center py-8">
                暂无集数
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
              <div class="bg-dark-card rounded-lg p-6 mb-6">
                <div class="flex flex-wrap gap-4 mb-4">
                  <button
                    v-if="videoUrl"
                    @click="playMode = 'inline'"
                    class="px-6 py-2 rounded-lg font-medium transition-all"
                    :class="playMode === 'inline' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'"
                  >
                    本站播放
                  </button>
                  <button
                    v-if="videoUrl"
                    @click="playMode = 'external'; openInNewWindow()"
                    class="px-6 py-2 rounded-lg font-medium transition-all"
                    :class="playMode === 'external' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'"
                  >
                    新窗口播放
                  </button>
                </div>
                
                <h1 class="text-2xl font-bold font-display text-white mb-4">
                  {{ videoItem.title }}
                </h1>
                
                <div class="flex flex-wrap gap-2 mb-4">
                  <span v-if="videoItem.year" class="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300">
                    {{ videoItem.year }}
                  </span>
                  <span
                    v-if="videoItem.type === 'tv'"
                    class="px-3 py-1 bg-primary/20 rounded text-sm text-primary font-medium"
                  >
                    剧集
                  </span>
                  <span
                    v-else
                    class="px-3 py-1 bg-secondary/20 rounded text-sm text-secondary font-medium"
                  >
                    电影
                  </span>
                  <span
                    v-for="cat in videoItem.categories"
                    :key="cat"
                    class="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300"
                  >
                    {{ cat }}
                  </span>
                </div>

                <div v-if="videoItem.rating > 0" class="flex items-center gap-2 mb-4">
                  <div class="flex items-center">
                    <svg class="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span class="text-white font-bold text-lg ml-1">{{ videoItem.rating.toFixed(1) }}</span>
                  </div>
                  <span class="text-gray-500 text-sm">/ 10</span>
                </div>

                <div v-if="videoItem.regions?.length" class="mb-4 text-sm">
                  <span class="text-gray-500">地区：</span>
                  <span class="text-gray-300">{{ videoItem.regions.join(', ') }}</span>
                </div>

                <div v-if="videoItem.description" class="text-gray-300 leading-relaxed bg-dark-hover rounded-lg p-4">
                  <span class="text-gray-500">简介：</span>
                  {{ videoItem.description }}
                </div>
              </div>
            </div>

            <div class="lg:col-span-1">
              <div class="bg-dark-card rounded-lg p-6 sticky top-24">
                <img
                  v-if="videoItem.cover"
                  :src="videoItem.cover"
                  :alt="videoItem.title"
                  class="w-full aspect-[2/3] object-cover rounded-lg mb-4"
                />
                
                <div v-if="currentSource?.episodes && currentSource.episodes.length > 1" class="mb-4">
                  <h3 class="text-white font-medium mb-3 flex items-center justify-between">
                    <span>集数选择</span>
                    <span class="text-gray-500 text-sm">共{{ currentSource.episodes.length }}集</span>
                  </h3>
                  <div class="grid grid-cols-5 gap-2">
                    <button
                      v-for="(episode, index) in currentSource.episodes.slice(0, 20)"
                      :key="episode.id"
                      @click="selectEpisode(index)"
                      class="aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all"
                      :class="index === currentEpisodeIndex 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'"
                    >
                      {{ episode.name.replace('第', '').replace('集', '') }}
                    </button>
                  </div>
                  <button
                    v-if="currentSource.episodes.length > 20"
                    @click="showEpisodePanel = true"
                    class="w-full mt-2 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    查看更多集数 →
                  </button>
                </div>

                <div v-if="videoItem.sources && videoItem.sources.length > 1" class="mb-4">
                  <h3 class="text-white font-medium mb-3">线路选择</h3>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="(source, index) in videoItem.sources"
                      :key="source.id"
                      @click="selectSource(index)"
                      class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      :class="index === currentSourceIndex 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'"
                    >
                      {{ source.name }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ef4444;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ef4444;
  cursor: pointer;
  border: none;
}

.video-container {
  aspect-ratio: 16 / 9;
}

.video-container:fullscreen {
  aspect-ratio: unset;
}
</style>