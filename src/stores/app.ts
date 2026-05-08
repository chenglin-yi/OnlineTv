import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LineConfig } from '@/types'

export const useAppStore = defineStore('app', () => {
  const lines = ref<LineConfig[]>([
    {
      id: 'hongniu',
      name: '红牛资源',
      apiUrl: 'https://www.hongniuzy2.com/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: 'https://pic.hongniuzy.com',
      videoProxy: ''
    },
    {
      id: 'mtzy',
      name: '馒头资源',
      apiUrl: 'https://www.mtzy.me/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: 'https://pic.5k5z.cn',
      videoProxy: ''
    },
    {
      id: 'liangzi',
      name: '量子资源',
      apiUrl: 'https://cj.lziapi.com/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: 'https://img.lzzyimg.com',
      videoProxy: ''
    },
    {
      id: 'feifan',
      name: '非凡资源',
      apiUrl: 'https://api.ffzyapi.com/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: 'https://img.ffzy888.com',
      videoProxy: ''
    },
    {
      id: 'wolong',
      name: '卧龙资源',
      apiUrl: 'https://collect.wolongzyw.com/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: 'https://imgwolong.com',
      videoProxy: ''
    },
    {
      id: 'douban',
      name: '豆瓣资源',
      apiUrl: 'https://caiji.dbzy5.com/api.php/provide/vod/',
      status: 'online',
      type: 'maccms',
      imgProxy: 'https://dbzy5.com',
      videoProxy: ''
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
