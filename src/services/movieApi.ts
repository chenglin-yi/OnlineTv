import axios from 'axios'
import type { VideoItem, SearchResult, VideoEpisode, VideoPlaySource } from '@/types'

export interface VideoSource {
  id: string
  name: string
  apiPath: string
  imgPath: string
  imgReplace: string
}

export const VIDEO_SOURCES: VideoSource[] = [
  { id: 'feifan', name: '非凡资源', apiPath: '/vod-api', imgPath: '/vod-img', imgReplace: 'https://img.ffzy888.com' },
  { id: 'douban', name: '豆瓣资源', apiPath: '/api-douban', imgPath: '/douban-img2', imgReplace: 'https://dbzy5.com' },
  { id: 'maotai', name: '茅台资源', apiPath: '/api-maotai', imgPath: '/maotai-img', imgReplace: 'https://mtzy.me' },
  { id: 'hongniu', name: '红牛资源', apiPath: '/api-hongniu', imgPath: '/hongniu-img', imgReplace: 'https://hongniuziyuan.com' }
]

let currentSource = VIDEO_SOURCES[0]

export function setVideoSource(sourceId: string) {
  const source = VIDEO_SOURCES.find(s => s.id === sourceId)
  if (source) {
    currentSource = source
    localStorage.setItem('videoSource', sourceId)
  }
}

export function getVideoSource(): VideoSource {
  const saved = localStorage.getItem('videoSource')
  if (saved) {
    const source = VIDEO_SOURCES.find(s => s.id === saved)
    if (source) currentSource = source
  }
  return currentSource
}

interface ApiResponse {
  code: number
  msg: string
  page: string
  pagecount: number
  limit: number
  total: number
  list?: ApiVideo[]
  class?: { type_id: number; type_name: string }[]
}

interface ApiVideo {
  vod_id: number
  vod_name: string
  vod_pic: string
  vod_actor: string
  vod_director: string
  vod_blurb: string
  vod_remarks: string
  vod_pubdate: string
  vod_area: string
  vod_year: string
  vod_class: string
  type_id: number
  type_name: string
  vod_play_from: string
  vod_play_url: string
  vod_score: string
  vod_douban_score?: string
}

export function parsePlayUrl(playUrl: string): VideoPlaySource[] {
  if (!playUrl) return []
  
  const sources: VideoPlaySource[] = []
  const playUrlParts = playUrl.split('$$$')
  
  playUrlParts.forEach((urlPart, index) => {
    if (!urlPart) return
    
    const episodes: VideoEpisode[] = []
    const episodeParts = urlPart.split('#')
    
    episodeParts.forEach((episodePart, epIndex) => {
      if (!episodePart) return
      
      if (episodePart.includes('$')) {
        const [name, url] = episodePart.split('$')
        if (name && url) {
          episodes.push({
            id: String(epIndex),
            name: name.trim(),
            url: url.trim()
          })
        }
      } else {
        episodes.push({
          id: String(epIndex),
          name: `第${epIndex + 1}集`,
          url: episodePart.trim()
        })
      }
    })
    
    if (episodes.length > 0) {
      sources.push({
        id: String(index),
        name: `线路${index + 1}`,
        episodes
      })
    }
  })
  
  return sources.length > 0 ? sources : []
}

function transformVideo(apiVideo: ApiVideo, source: VideoSource): VideoItem {
  let videoUrl = ''
  let playFrom = 'feifan'
  let sources: VideoPlaySource[] = []
  
  if (apiVideo.vod_play_url) {
    sources = parsePlayUrl(apiVideo.vod_play_url)
    
    if (sources.length > 0 && sources[0].episodes.length > 0) {
      videoUrl = sources[0].episodes[0].url
    }
  }
  
  if (apiVideo.vod_play_from) {
    const fromParts = apiVideo.vod_play_from.split('$$$')
    fromParts.forEach((from, index) => {
      if (sources[index]) {
        sources[index].name = from.trim() || sources[index].name
      }
    })
    playFrom = fromParts[0] || 'feifan'
  }

  let cover = (apiVideo.vod_pic || '').replace(/\\/g, '')
  if (cover.includes(source.imgReplace)) {
    cover = cover.replace(source.imgReplace, source.imgPath)
  } else if (cover.startsWith('http')) {
    cover = source.imgPath + '/' + cover.split('/').pop()
  }

  const episodes = sources.length > 0 ? sources[0].episodes : []

  return {
    id: String(apiVideo.vod_id),
    title: apiVideo.vod_name || '',
    cover,
    year: apiVideo.vod_year || apiVideo.vod_pubdate?.split('-')[0] || '',
    type: apiVideo.type_id <= 4 ? (apiVideo.type_id === 2 ? 'tv' : 'movie') : 
          apiVideo.vod_class?.includes('剧') ? 'tv' : 'movie',
    rating: (() => {
      const doubanScore = apiVideo.vod_douban_score || ''
      const score = apiVideo.vod_score || ''
      const remarks = apiVideo.vod_remarks || ''
      if (doubanScore) {
        return parseFloat(doubanScore) || 0
      }
      if (score && !remarks.includes('集')) {
        return parseFloat(score) || 0
      }
      if (remarks && !remarks.includes('集') && !remarks.includes('期')) {
        return parseFloat(remarks) || 0
      }
      return 0
    })(),
    description: apiVideo.vod_blurb?.replace(/　/g, '').trim() || '',
    categories: apiVideo.vod_class?.split(',').filter(Boolean) || [],
    regions: [apiVideo.vod_area].filter(Boolean),
    playUrl: videoUrl,
    playFrom,
    sources,
    episodes
  }
}

export async function getMovieList(typeId: number = 1, _page: number = 1, _limit: number = 20): Promise<{ list: VideoItem[], total: number, page: number, pageCount: number }> {
  const source = getVideoSource()
  try {
    const response = await axios.get<ApiResponse>(source.apiPath, {
      params: { ac: 'detail', h: 168, t: typeId },
      timeout: 15000
    })
    
    if (response.data.code === 1 && response.data.list) {
      return {
        list: response.data.list.map(v => transformVideo(v, source)),
        total: response.data.total,
        page: parseInt(response.data.page),
        pageCount: response.data.pagecount
      }
    }
    return { list: [], total: 0, page: 1, pageCount: 0 }
  } catch (error) {
    console.error('获取影片列表失败:', error)
    return { list: [], total: 0, page: 1, pageCount: 0 }
  }
}

export async function getTvList(page: number = 1, limit: number = 20): Promise<{ list: VideoItem[], total: number, page: number, pageCount: number }> {
  return getMovieList(2, page, limit)
}

export async function getVarietyList(page: number = 1, limit: number = 20): Promise<{ list: VideoItem[], total: number, page: number, pageCount: number }> {
  return getMovieList(3, page, limit)
}

export async function getAnimeList(page: number = 1, limit: number = 20): Promise<{ list: VideoItem[], total: number, page: number, pageCount: number }> {
  return getMovieList(4, page, limit)
}

export async function getMovieDetail(id: string): Promise<VideoItem | null> {
  const source = getVideoSource()
  try {
    const response = await axios.get<ApiResponse>(source.apiPath, {
      params: { ac: 'detail', ids: id },
      timeout: 15000
    })
    
    if (response.data.code === 1 && response.data.list && response.data.list.length > 0) {
      return transformVideo(response.data.list[0], source)
    }
    return null
  } catch (error) {
    console.error('获取影片详情失败:', error)
    return null
  }
}

export async function searchVideos(keyword: string, page: number = 1): Promise<SearchResult> {
  const source = getVideoSource()
  try {
    const response = await axios.get<ApiResponse>(source.apiPath, {
      params: { ac: 'detail', wd: keyword, pg: page },
      timeout: 15000
    })
    
    if (response.data.code === 1 && response.data.list) {
      return {
        list: response.data.list.map(v => transformVideo(v, source)),
        total: response.data.total,
        page: parseInt(response.data.page),
        pageSize: 20
      }
    }
    return { list: [], total: 0, page: 1, pageSize: 20 }
  } catch (error) {
    console.error('搜索失败:', error)
    return { list: [], total: 0, page: 1, pageSize: 20 }
  }
}

async function fetchPages(pages: number[]): Promise<ApiVideo[]> {
  const source = getVideoSource()
  const responses = await Promise.all(
    pages.map(pg => axios.get<ApiResponse>(source.apiPath, { params: { ac: 'detail', h: 168, pg } }))
  )
  return responses.flatMap(r => r.data.list || [])
}

export async function getMoviesAndBanner(): Promise<{ banner: any[], topMovies: VideoItem[] } | null> {
  const source = getVideoSource()
  try {
    const allList = await fetchPages([1, 2])
    const movies = allList
      .filter(v => !(v.type_name?.includes('剧') || v.vod_class?.includes('剧') ||
        v.type_name?.includes('动漫') || v.type_name?.includes('动画') ||
        v.vod_class?.includes('动漫') || v.vod_class?.includes('动画') || v.type_id === 2))
      .map(v => transformVideo(v, source))

    return {
      banner: movies.slice(0, 5).map(item => ({
        id: item.id,
        title: item.title,
        cover: item.cover,
        description: item.description?.slice(0, 50) || ''
      })),
      topMovies: movies.slice(0, 12)
    }
  } catch (error) {
    console.error('获取电影数据失败:', error)
    return null
  }
}

export async function getTVShows(): Promise<VideoItem[] | null> {
  const source = getVideoSource()
  try {
    const allList = await fetchPages([1, 2])
    const tvs = allList
      .filter(v => v.type_name?.includes('剧') || v.vod_class?.includes('剧') || v.type_id === 2)
      .map(v => transformVideo(v, source))
    return tvs.slice(0, 12)
  } catch (error) {
    console.error('获取电视剧数据失败:', error)
    return null
  }
}

export async function getAnimes(): Promise<VideoItem[] | null> {
  const source = getVideoSource()
  try {
    const allList = await fetchPages([1, 2])
    const animes = allList
      .filter(v => v.type_name?.includes('动漫') || v.type_name?.includes('动画') ||
        v.vod_class?.includes('动漫') || v.vod_class?.includes('动画'))
      .map(v => transformVideo(v, source))
    return animes.slice(0, 12)
  } catch (error) {
    console.error('获取动漫数据失败:', error)
    return null
  }
}

export async function parseVideoUrl(originalUrl: string): Promise<string> {
  if (!originalUrl) return ''
  
  try {
    const parseApis = [
      `https://www.mbbcc.icu/?url=${encodeURIComponent(originalUrl)}`,
      `https://t1.qlplayer.cyou/player/?url=${encodeURIComponent(originalUrl)}`
    ]
    
    for (const api of parseApis) {
      try {
        await fetch(api, { method: 'HEAD', mode: 'no-cors' })
        return api
      } catch {
        continue
      }
    }
  } catch (e) {
    console.error('解析视频失败:', e)
  }
  
  return originalUrl
}
