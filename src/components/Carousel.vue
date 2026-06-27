<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

interface BannerItem {
  id: string
  title: string
  cover: string
  description: string
  playUrl?: string
}

const props = defineProps<{
  banners: BannerItem[]
}>()

const router = useRouter()
const currentIndex = ref(0)
const isHovering = ref(false)
let timer: ReturnType<typeof setInterval> | null = null
const loadedImages = ref<Set<string>>(new Set())
const imageErrors = ref<Set<string>>(new Set())

function nextSlide() {
  if (!isHovering.value && props.banners.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % props.banners.length
  }
}

function goToSlide(index: number) {
  currentIndex.value = index
}

function handleBannerClick(item: BannerItem) {
  router.push({ name: 'play', params: { id: item.id } })
}

function handleImageLoad(url: string) {
  loadedImages.value.add(url)
}

function handleImageError(url: string) {
  imageErrors.value.add(url)
  loadedImages.value.add(url)
}

watch(() => props.banners, () => {
  currentIndex.value = 0
  loadedImages.value.clear()
  imageErrors.value.clear()
})

onMounted(() => {
  timer = setInterval(nextSlide, 6000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-lg"
    :class="banners.length > 0 ? 'aspect-video' : 'aspect-video bg-dark-card'"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <template v-if="banners.length > 0">
      <div
        class="flex transition-transform duration-700 ease-out h-full"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="min-w-full h-full relative cursor-pointer group"
          @click="handleBannerClick(banner)"
        >
          <div v-if="!loadedImages.has(banner.cover) && !imageErrors.has(banner.cover)" class="absolute inset-0 bg-dark-card animate-pulse flex items-center justify-center z-10">
            <svg class="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <img
            :src="banner.cover"
            :alt="banner.title"
            class="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            :class="{ 
              'opacity-0': !loadedImages.has(banner.cover) && !imageErrors.has(banner.cover), 
              'opacity-100': loadedImages.has(banner.cover) 
            }"
            @load="handleImageLoad(banner.cover)"
            @error="handleImageError(banner.cover)"
            loading="lazy"
          />
          
          <div v-if="imageErrors.has(banner.cover)" class="absolute inset-0 bg-dark-card flex items-center justify-center">
            <svg class="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div class="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent">
            <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10 lg:p-14">
              <div class="max-w-2xl">
                <h2 class="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-5xl font-bold font-display text-white mb-2 sm:mb-4">
                  {{ banner.title }}
                </h2>
                <p class="text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 opacity-90">
                  {{ banner.description }}
                </p>
                <button
                  class="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30 text-sm sm:text-base"
                >
                  <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>立即观看</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex gap-2">
        <button
          v-for="(_, index) in banners"
          :key="index"
          class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300"
          :class="index === currentIndex ? 'bg-white w-4 sm:w-6' : 'bg-white/40 hover:bg-white/70'"
          @click="goToSlide(index)"
        ></button>
      </div>

      <button
        class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all hover:scale-110 z-20 cursor-pointer"
        @click="goToSlide(currentIndex === 0 ? banners.length - 1 : currentIndex - 1)"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all hover:scale-110 z-20 cursor-pointer"
        @click="goToSlide((currentIndex + 1) % banners.length)"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </template>

    <template v-else>
      <div class="w-full h-full flex items-center justify-center">
        <div class="text-center">
          <svg class="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-500">精彩内容即将上线</p>
        </div>
      </div>
    </template>
  </div>
</template>
