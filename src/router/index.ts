import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/pages/Home.vue'
import Search from '@/pages/Search.vue'
import Play from '@/pages/Play.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'VibeLume - 沉浸光影，自在观影',
      description: '提供最新电影、热门剧集、精彩动漫在线观看服务，高清画质，流畅播放体验。',
      keywords: '电影,电视剧,动漫,在线观看,影视,视频,VibeLume'
    }
  },
  {
    path: '/search',
    name: 'search',
    component: Search,
    meta: {
      title: '搜索 - VibeLume',
      description: '搜索你想看的电影、电视剧、动漫，发现更多精彩内容。',
      keywords: '搜索,电影搜索,电视剧搜索,动漫搜索'
    }
  },
  {
    path: '/play/:id',
    name: 'play',
    component: Play,
    meta: {
      title: '播放 - VibeLume',
      description: '在线观看高清电影、热门剧集、精彩动漫。',
      keywords: '在线播放,电影播放,电视剧播放,动漫播放'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _, next) => {
  const title = to.meta.title as string || 'VibeLume - 沉浸光影，自在观影'
  const description = to.meta.description as string || '提供最新电影、热门剧集、精彩动漫在线观看服务。'
  const keywords = to.meta.keywords as string || '电影,电视剧,动漫,在线观看'
  
  document.title = title
  
  const descMeta = document.querySelector('meta[name="description"]')
  if (descMeta) {
    descMeta.setAttribute('content', description)
  }
  
  const keywordsMeta = document.querySelector('meta[name="keywords"]')
  if (keywordsMeta) {
    keywordsMeta.setAttribute('content', keywords)
  }
  
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (ogTitle) {
    ogTitle.setAttribute('content', title)
  }
  
  const ogDesc = document.querySelector('meta[property="og:description"]')
  if (ogDesc) {
    ogDesc.setAttribute('content', description)
  }
  
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')
  if (twitterTitle) {
    twitterTitle.setAttribute('content', title)
  }
  
  const twitterDesc = document.querySelector('meta[name="twitter:description"]')
  if (twitterDesc) {
    twitterDesc.setAttribute('content', description)
  }
  
  next()
})

export default router
