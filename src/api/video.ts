import axios from 'axios'
import type { LineConfig, VideoItem, VideoSource, VideoEpisode, VideoPlaySource } from '@/types'

const http = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.warn('[VibeLume] Request timed out')
    }
    return Promise.reject(error)
  }
)

export async function testLineApi(line: LineConfig): Promise<boolean> {
  try {
    const testUrl = `${line.apiUrl}?ac=detail&limit=1&h=168`
    console.log(`[VibeLume] Testing line: ${line.name} (${testUrl})`)

    const response = await http.get(testUrl, {
      timeout: 8000,
      validateStatus: () => true
    })

    const isOnline = response.status === 200 && response.data && typeof response.data === 'object'
    console.log(`[VibeLume] Line ${line.name} is ${isOnline ? 'online' : 'offline'}`)
    return isOnline
  } catch (error: any) {
    console.error(`[VibeLume] Test failed for ${line.name}:`, error?.message || error)
    return false
  }
}

export async function getHomeList(line: LineConfig): Promise<VideoItem[]> {
  try {
    const apiUrl = `${line.apiUrl}?ac=detail&limit=48&h=168`
    console.log(`[VibeLume] Fetching home list from: ${line.name}`)

    const response = await http.get(apiUrl)
    const data = response.data

    if (data?.list && Array.isArray(data.list)) {
      console.log(`[VibeLume] Found ${data.list.length} items`)
      const items = data.list.map((item: any) => transformMaccmsItem(item, line))

      const itemsWithoutCovers = items.filter((item: VideoItem) => !item.cover)
      if (itemsWithoutCovers.length > 0) {
        console.log(`[VibeLume] ${itemsWithoutCovers.length} items missing covers, trying batch detail fetch`)
        await fetchMissingCovers(items, line)
      }

      return items
    }

    return []
  } catch (error: any) {
    console.error(`[VibeLume] Get home list failed for ${line.name}:`, error?.message || error)
    return []
  }
}

async function fetchMissingCovers(items: VideoItem[], line: LineConfig): Promise<void> {
  try {
    const ids = items.filter(i => !i.cover).map(i => i.id).join(',')
    const detailUrl = `${line.apiUrl}?ac=detail&ids=${ids}`

    const response = await http.get(detailUrl)
    const data = response.data

    if (data?.list && Array.isArray(data.list)) {
      for (const detailItem of data.list) {
        const item = items.find((i: VideoItem) => i.id === String(detailItem.vod_id))
        if (item) {
          let cover = detailItem.vod_pic || detailItem.pic || detailItem.vod_pic_thumb || ''
          cover = fixCoverUrl(cover, line)
          if (cover) {
            item.cover = cover
          }
        }
      }
    }
  } catch (error) {
    console.warn(`[VibeLume] Failed to fetch covers:`, error)
  }
}

export async function searchVideos(keyword: string, line: LineConfig): Promise<{ list: VideoItem[] }> {
  try {
    const apiUrl = `${line.apiUrl}?ac=detail&wd=${encodeURIComponent(keyword)}&limit=30&h=168`
    console.log(`[VibeLume] Searching for: ${keyword} on ${line.name}`)

    const response = await http.get(apiUrl)
    const data = response.data

    if (data?.list && Array.isArray(data.list)) {
      return {
      list: data.list.map((item: any) => transformMaccmsItem(item, line))
    }
    }

    return { list: [] }
  } catch (error: any) {
    console.error(`[VibeLume] Search failed for ${line.name}:`, error?.message || error)
    return { list: [] }
  }
}

export async function getVideoDetail(id: string, line: LineConfig): Promise<{ item: VideoItem; sources: VideoSource[]; playSources: VideoPlaySource[] } | null> {
  try {
    const apiUrl = `${line.apiUrl}?ac=detail&ids=${id}`
    console.log(`[VibeLume] Fetching detail for id: ${id} from ${line.name}`)

    const response = await http.get(apiUrl)
    const data = response.data

    if (data?.list && Array.isArray(data.list) && data.list.length > 0) {
      const rawItem = data.list[0]
      const videoItem = transformMaccmsItem(rawItem, line)
      const sources = parseMaccmsPlayUrl(rawItem.vod_play_url, rawItem.vod_down_url, rawItem.vod_play_from)

      const playSources: VideoPlaySource[] = []
      if (rawItem.vod_play_url) {
        const playUrlGroups = rawItem.vod_play_url.split('$$$')
        const fromNames = rawItem.vod_play_from ? rawItem.vod_play_from.split(',') : []

        playUrlGroups.forEach((group: string, groupIdx: number) => {
          const sourceName = fromNames[groupIdx] || `线路${groupIdx + 1}`
          const episodes: VideoEpisode[] = []

          let epParts: string[] = []
          if (group.includes('$$')) {
            epParts = group.split('$$').filter(Boolean)
          } else {
            epParts = group.split('#').filter(Boolean)
          }

          epParts.forEach((ep: string, idx: number) => {
            let url = ''
            let name = `第${idx + 1}集`

            const dollarIdx = ep.indexOf('$')
            if (dollarIdx > 0) {
              name = ep.substring(0, dollarIdx).trim() || name
              url = ep.substring(dollarIdx + 1).trim()
            } else {
              url = ep.trim()
            }

            if (url && url.startsWith('http')) {
              episodes.push({
                id: `ep-${groupIdx}-${idx}`,
                name: name,
                url: url
              })
            }
          })

          if (episodes.length > 0) {
            playSources.push({
              id: `play-source-${groupIdx}`,
              name: sourceName,
              episodes
            })
          }
        })
      }

      return { item: videoItem, sources, playSources }
    }

    return null
  } catch (error: any) {
    console.error(`[VibeLume] Get detail failed for ${line.name}:`, error?.message || error)
    return null
  }
}

function parseMaccmsPlayUrl(playUrl: string, downUrl?: string, playFrom?: string): VideoSource[] {
  const sources: VideoSource[] = []

  if (!playUrl) {
    if (downUrl) {
      return parseMaccmsPlayUrl(downUrl, undefined, playFrom)
    }
    return []
  }

  const lineGroups = playUrl.split('$$$')
  const fromNames = playFrom ? playFrom.split(',') : []

  for (let i = 0; i < lineGroups.length; i++) {
    const group = lineGroups[i]
    const parts = group.split('$$')
    const sourceName = fromNames[i] || `线路${i + 1}`

    for (let j = 0; j < parts.length; j++) {
      let url = parts[j].trim()
      if (!url || !url.startsWith('http')) {
        if (url.includes('$') && !url.startsWith('$')) {
          const nameUrlParts = url.split('$')
          url = nameUrlParts[nameUrlParts.length - 1].trim()
        } else {
          continue
        }
      }

      if (url.startsWith('http')) {
        sources.push({
          id: `source-${i}-${j}`,
          name: parts.length > 1 ? `${sourceName} ${j + 1}` : sourceName,
          url: url,
          quality: 'unknown'
        })
      }
    }
  }

  return sources.length > 0 ? sources : []
}

function fixCoverUrl(cover: string, line: LineConfig): string {
  if (!cover) return ''

  let url = cover.replace(/\\/g, '')

  if (line.imgProxy) {
    if (line.imgProxy.startsWith('http')) {
      const match = line.imgProxy.match(/^https?:\/\/[^/]+/)
      if (match && url.includes(match[1])) {
        return line.imgProxy + url.split(match[1])[1]
      }
      if (url.includes('http')) {
        return url.replace('http://', 'https://')
      }
      return url
    }

    const imgProxyMap: Record<string, string> = {
      'img.ffzy888.com': '/vod-img',
      'dbzy5.com': '/douban-img2',
      'mtzy.me': '/maotai-img',
      'pic.5k5z.cn': '/maotai-img',
      'hongniuziyuan.com': '/hongniu-img',
      'pic.hongniuzy.com': '/hongniu-img',
      'cn.hongniuzy.com': '/hongniu-img'
    }

    for (const [domain, proxy] of Object.entries(imgProxyMap)) {
      if (url.includes(domain)) {
        const pathAfterDomain = url.split(domain)[1]
        return `${proxy}${pathAfterDomain}`
      }
    }
  }

  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }

  if (url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('//')) {
    return 'https:' + url
  }

  if (url.startsWith('/')) {
    const match = line.apiUrl.match(/^https?:\/\/[^/]+/)
    if (match) {
      return match[0] + url
    }
  }

  return url
}

function transformMaccmsItem(raw: any, line?: LineConfig): VideoItem {
  const typeName = raw.vod_type || raw.type_name || ''
  const categoryNames = typeName.split('|').filter(Boolean)

  let type: 'movie' | 'tv' = 'movie'
  const isTV = categoryNames.some((cat: string) =>
    cat.includes('剧') || cat.includes('连续剧') || cat.includes('综艺')
  )
  const isAnime = categoryNames.some((cat: string) =>
    cat.includes('动漫') || cat.includes('动画')
  )

  if (isTV || isAnime) {
    type = 'tv'
  }

  let rating = 0
  const doubanScore = raw.vod_douban_score || ''
  const score = raw.vod_score || raw.score || raw.rating || ''
  const remarks = raw.vod_remarks || ''

  if (doubanScore) {
    rating = parseFloat(doubanScore) || 0
  } else if (score && !remarks.includes('集')) {
    rating = parseFloat(score.replace(/[^0-9.]/g, '')) || 0
  } else if (remarks && !remarks.includes('集') && !remarks.includes('期')) {
    rating = parseFloat(remarks.replace(/[^0-9.]/g, '')) || 0
  }

  let cover = raw.vod_pic || raw.pic || raw.cover || raw.thumb || raw.vod_pic_thumb || ''
  if (line) {
    cover = fixCoverUrl(cover, line)
  }

  if (!cover) {
    cover = `https://picsum.photos/300/450?random=${raw.vod_id || Math.random()}`
  }

  const playSources: VideoPlaySource[] = []
  if (raw.vod_play_url) {
    const playUrlGroups = raw.vod_play_url.split('$$$')
    playUrlGroups.forEach((group: string, groupIdx: number) => {
      const parts = group.split('$$')
      if (parts.length >= 2) {
        const sourceName = parts[0].trim()
        const episodes: VideoEpisode[] = []

        parts.slice(1).forEach((url: string, idx: number) => {
          if (url && url.startsWith('http')) {
            episodes.push({
              id: `ep-${groupIdx}-${idx}`,
              name: `第${idx + 1}集`,
              url: url.trim()
            })
          }
        })

        if (episodes.length > 0) {
          playSources.push({
            id: `play-source-${groupIdx}`,
            name: sourceName,
            episodes
          })
        }
      }
    })
  }

  return {
    id: String(raw.vod_id || raw.id || Math.random().toString(36)),
    title: raw.vod_name || raw.name || raw.title || '未知标题',
    cover: cover,
    year: raw.vod_year || raw.year || '',
    type: type,
    rating: rating,
    description: raw.vod_content || raw.description || raw.intro || raw.vod_blurb || '',
    categories: categoryNames.length > 0 ? categoryNames : [],
    regions: raw.vod_area ? raw.vod_area.split('|').filter(Boolean) : [],
    playUrl: raw.vod_play_url ? raw.vod_play_url.split('$$$')[0]?.split('$$')[1] : undefined,
    sources: playSources.length > 0 ? playSources : undefined
  }
}

export async function testAllLines(lines: LineConfig[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>()

  const promises = lines.map(async (line) => {
    const isOnline = await testLineApi(line)
    results.set(line.id, isOnline)
  })

  await Promise.all(promises)
  return results
}
