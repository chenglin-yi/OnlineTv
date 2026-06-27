<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { testAllLines } from '@/api'
import SearchBar from './SearchBar.vue'

const router = useRouter()
const appStore = useAppStore()
const isMenuOpen = ref(false)
const showSourceMenu = ref(false)
const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

onMounted(async () => {
  const results = await testAllLines(appStore.lines)
  results.forEach((isOnline, lineId) => {
    appStore.updateLineStatus(lineId, isOnline ? 'online' : 'offline')
  })
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleSearch(keyword: string) {
  if (keyword.trim()) {
    router.push({ name: 'search', query: { q: keyword } })
  }
}

function goHome() {
  router.push({ name: 'home' })
}

function selectLine(lineId: string) {
  appStore.setActiveLine(lineId)
  showSourceMenu.value = false
  router.push({ name: 'home' })
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="isScrolled ? 'bg-dark/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-dark via-dark/90 to-transparent'"
  >
    <div class="container mx-auto px-2 sm:px-4">
      <div class="flex items-center justify-between h-14 sm:h-16 md:h-20">
        <div class="flex items-center gap-1 sm:gap-2 md:gap-8 cursor-pointer flex-shrink-0" @click="goHome">
          <div class="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center">
            <img src="/logo.png" alt="VibeFlix" class="w-full h-full object-contain" />
          </div>
          <div class="hidden sm:block">
            <span class="text-lg sm:text-xl md:text-2xl font-bold tracking-wide" style="font-family: 'Playfair Display', serif; background: linear-gradient(135deg, #e50914 0%, #f5af19 50%, #e50914 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 30px rgba(229, 9, 20, 0.3);">
              VibeLume
            </span>
            <p class="text-xs text-gray-500 hidden lg:block">沉浸光影，自在 VibeLume</p>
          </div>
        </div>

        <nav class="hidden lg:flex items-center gap-1 flex-shrink-0">
          <button
            class="px-3 py-1.5 text-sm text-white hover:text-gray-300 transition-colors"
            @click="goHome"
          >
            发现
          </button>
          <button
            class="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            @click="router.push({ name: 'search' })"
          >
            找片
          </button>
          <div class="relative ml-4">
            <button
              class="px-3 sm:px-4 py-1.5 rounded-lg bg-dark-card text-gray-300 hover:bg-dark-hover transition-colors text-sm flex items-center gap-1"
              @click="showSourceMenu = !showSourceMenu"
            >
              <span class="truncate max-w-[80px] sm:max-w-[120px]">{{ appStore.activeLine?.name || '精选影视' }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="showSourceMenu"
              class="absolute right-0 mt-2 w-40 sm:w-44 bg-dark-card rounded-lg shadow-xl border border-gray-800 py-1 z-50 animate-scale-in"
            >
              <button
                v-for="line in appStore.lines"
                :key="line.id"
                class="w-full px-4 py-2 text-left text-gray-300 hover:bg-dark-hover transition-colors text-sm flex items-center gap-2"
                :class="{ 'text-primary': appStore.activeLineId === line.id }"
                @click="selectLine(line.id)"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="line.status === 'online' ? 'bg-green-500' : 'bg-red-500'"
                ></span>
                {{ line.name }}
              </button>
            </div>
          </div>
        </nav>

        <div class="hidden md:flex flex-1 max-w-md mx-4 sm:mx-8">
          <SearchBar @search="handleSearch" />
        </div>

        <button
          class="md:hidden p-1.5 sm:p-2 text-white hover:text-gray-300 transition-colors flex-shrink-0 z-50"
          @click="isMenuOpen = !isMenuOpen"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              v-if="!isMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div
        v-if="isMenuOpen"
        class="md:hidden py-4 border-t border-gray-800 animate-slide-up"
      >
        <div class="mb-4 px-2">
          <SearchBar @search="(kw) => { handleSearch(kw); isMenuOpen = false }" />
        </div>
        <div class="flex flex-col gap-1">
          <button
            class="text-left px-4 py-2 text-white hover:bg-dark-hover rounded-lg transition-colors"
            @click="goHome(); isMenuOpen = false"
          >
            🏠 发现
          </button>
          <button
            class="text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-dark-hover rounded-lg transition-colors"
            @click="router.push({ name: 'search' }); isMenuOpen = false"
          >
            🔍 找片
          </button>
          <div class="border-t border-gray-800 pt-3 mt-3">
            <div class="px-4 py-2 text-gray-500 text-sm mb-2">切换线路</div>
            <button
              v-for="line in appStore.lines"
              :key="line.id"
              class="w-full px-4 py-2 text-left hover:bg-dark-hover transition-colors text-sm flex items-center gap-2"
              :class="appStore.activeLineId === line.id ? 'text-primary' : 'text-gray-400'"
              @click="selectLine(line.id); isMenuOpen = false"
            >
              <span
                class="w-2 h-2 rounded-full"
                :class="line.status === 'online' ? 'bg-green-500' : 'bg-red-500'"
              ></span>
              {{ line.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
