import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LineConfig } from '@/types'

export const useAppStore = defineStore('app', () => {
  const lines = ref<LineConfig[]>([
    {
      id: 'hongniu',
      name: '红牛资源',
      apiUrl: '/proxy-hongniu/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: '/hongniu-img',
      videoProxy: '/video-proxy'
    },
    {
      id: 'mtzy',
      name: '馒头资源',
      apiUrl: '/proxy-mtzy/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: '/maotai-img',
      videoProxy: '/video-proxy'
    },
    {
      id: 'liangzi',
      name: '量子资源',
      apiUrl: '/proxy-liangzi/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: '/liangzi-img',
      videoProxy: '/video-proxy'
    },
    {
      id: 'feifan',
      name: '非凡资源',
      apiUrl: '/proxy-feifan/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: '/vod-img',
      videoProxy: '/video-proxy'
    },
    {
      id: 'wolong',
      name: '卧龙资源',
      apiUrl: '/proxy-wolong/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: '/wolong-img',
      videoProxy: '/video-proxy'
    },
    {
      id: 'douban',
      name: '豆瓣资源',
      apiUrl: '/proxy-douban/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: '',
      videoProxy: '/video-proxy'
    }
  ])

  const activeLineId = ref<string | null>('hongniu')

  const activeLine = computed(() => {
    return lines.value.find(line => line.id === activeLineId.value) || null
  })

  function setActiveLine(lineId: string) {
    activeLineId.value = lineId
  }

  function updateLineStatus(lineId: string, status: 'online' | 'offline') {
    const line = lines.value.find(l => l.id === lineId)
    if (line) {
      line.status = status
      line.lastTest = new Date().toISOString()
    }
  }

  return {
    lines,
    activeLineId,
    activeLine,
    setActiveLine,
    updateLineStatus
  }
})
