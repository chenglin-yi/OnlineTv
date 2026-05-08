import axios from 'axios'
import type { VideoItem } from '@/types'

const DOUBAN_BASE_URL = '/douban'

const http = axios.create({
  baseURL: DOUBAN_BASE_URL,
  timeout: 15000
})

export interface DoubanSearchItem {
  id: string
  title: string
  rate: string
  cover: string
  cover_x: number
  cover_y: number
  is_new: boolean
  episodes_info: string
  types: string[]
  regions: string[]
  year: string
}

function proxyImageUrl(url: string): string {
  if (!url) return ''
  const imageHosts = ['https://img3.doubanio.com', 'https://img1.doubanio.com', 'https://img9.doubanio.com']
  for (const host of imageHosts) {
    if (url.startsWith(host)) {
      return url.replace(host, '/douban-img')
    }
  }
  return url
}

function transformToVideoItem(item: DoubanSearchItem): VideoItem {
  return {
    id: item.id,
    title: item.title || '未知标题',
    cover: proxyImageUrl(item.cover) || '',
    year: item.year || '',
    type: item.episodes_info ? 'tv' : 'movie',
    rating: parseFloat(item.rate) || 0,
    description: '',
    categories: (item.types || []).slice(0, 2),
    regions: (item.regions || []).slice(0, 1)
  }
}

export async function getInTheaters(): Promise<VideoItem[]> {
  try {
    const response = await http.get('/j/search_subjects', {
      params: {
        type: 'movie',
        tag: '热映',
        page_limit: 20,
        page_start: 0
      }
    })
    return response.data.subjects.map((item: DoubanSearchItem) => transformToVideoItem(item))
  } catch (error) {
    console.error('[Douban] Failed to fetch in theaters:', error)
    return []
  }
}

export async function getComingSoon(): Promise<VideoItem[]> {
  try {
    const response = await http.get('/j/search_subjects', {
      params: {
        type: 'movie',
        tag: '即将上映',
        page_limit: 20,
        page_start: 0
      }
    })
    return response.data.subjects.map((item: DoubanSearchItem) => transformToVideoItem(item))
  } catch (error) {
    console.error('[Douban] Failed to fetch coming soon:', error)
    return []
  }
}

export async function getTop250(): Promise<VideoItem[]> {
  try {
    const response = await http.get('/j/search_subjects', {
      params: {
        type: 'movie',
        tag: '豆瓣高分',
        page_limit: 25,
        page_start: 0
      }
    })
    return response.data.subjects.map((item: DoubanSearchItem) => transformToVideoItem(item))
  } catch (error) {
    console.error('[Douban] Failed to fetch top 250:', error)
    return []
  }
}

export async function getPopularTv(): Promise<VideoItem[]> {
  try {
    const response = await http.get('/j/search_subjects', {
      params: {
        type: 'tv',
        tag: '热门',
        page_limit: 20,
        page_start: 0
      }
    })
    return response.data.subjects.map((item: DoubanSearchItem) => transformToVideoItem(item))
  } catch (error) {
    console.error('[Douban] Failed to fetch popular TV:', error)
    return []
  }
}

export async function searchMovies(query: string): Promise<VideoItem[]> {
  try {
    const response = await http.get('/j/search_subjects', {
      params: {
        type: 'movie',
        tag: '',
        page_limit: 20,
        page_start: 0,
        q: query
      }
    })
    return response.data.subjects.map((item: DoubanSearchItem) => transformToVideoItem(item))
  } catch (error) {
    console.error('[Douban] Failed to search movies:', error)
    return []
  }
}

export async function searchTv(query: string): Promise<VideoItem[]> {
  try {
    const response = await http.get('/j/search_subjects', {
      params: {
        type: 'tv',
        tag: '',
        page_limit: 20,
        page_start: 0,
        q: query
      }
    })
    return response.data.subjects.map((item: DoubanSearchItem) => transformToVideoItem(item))
  } catch (error) {
    console.error('[Douban] Failed to search TV:', error)
    return []
  }
}

export async function searchMulti(query: string): Promise<VideoItem[]> {
  try {
    const [movies, tv] = await Promise.all([
      searchMovies(query),
      searchTv(query)
    ])
    return [...movies, ...tv].slice(0, 20)
  } catch (error) {
    console.error('[Douban] Failed to search multi:', error)
    return []
  }
}

export async function getMovieDetail(id: string): Promise<VideoItem | null> {
  try {
    const response = await http.get(`/subject/${id}`)
    const html = response.data
    const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)
    if (match) {
      try {
        const data = JSON.parse(match[1])
        return {
          id: id,
          title: data.name || '',
          cover: data.image || '',
          year: data.datePublished?.split('-')[0] || '',
          type: 'movie',
          rating: parseFloat(data.aggregateRating?.ratingValue || '0'),
          description: data.description || '',
          categories: data.genre || [],
          regions: []
        }
      } catch (e) {
        console.error('[Douban] Failed to parse detail:', e)
      }
    }
    return null
  } catch (error) {
    console.error('[Douban] Failed to get movie detail:', error)
    return null
  }
}

export async function getTvDetail(id: string): Promise<VideoItem | null> {
  try {
    const response = await http.get(`/subject/${id}`)
    const html = response.data
    const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)
    if (match) {
      try {
        const data = JSON.parse(match[1])
        return {
          id: id,
          title: data.name || '',
          cover: data.image || '',
          year: data.datePublished?.split('-')[0] || '',
          type: 'tv',
          rating: parseFloat(data.aggregateRating?.ratingValue || '0'),
          description: data.description || '',
          categories: data.genre || [],
          regions: []
        }
      } catch (e) {
        console.error('[Douban] Failed to parse detail:', e)
      }
    }
    return null
  } catch (error) {
    console.error('[Douban] Failed to get TV detail:', error)
    return null
  }
}

export async function getCategories(): Promise<any[]> {
  try {
    const response = await http.get('/j/search_tags', {
      params: {
        type: 'movie'
      }
    })
    return response.data.tags.map((tag: string) => ({
      id: tag,
      name: tag,
      icon: '🎬'
    }))
  } catch (error) {
    console.error('[Douban] Failed to get categories:', error)
    return []
  }
}

export async function getBannerData(): Promise<any[]> {
  try {
    const [movies] = await Promise.all([
      getInTheaters()
    ])
    return movies.slice(0, 5).map(item => ({
      id: item.id,
      title: item.title,
      cover: proxyImageUrl(item.cover.replace('/s_ratio_poster/', '/l_ratio_poster/')),
      description: '精彩影视推荐'
    }))
  } catch (error) {
    console.error('[Douban] Failed to get banner data:', error)
    return []
  }
}

export async function getHomeData(): Promise<{
  banner: any[]
  topMovies: VideoItem[]
  topTV: VideoItem[]
  categories: any[]
}> {
  try {
    const [banner, movies, tv, categories] = await Promise.all([
      getBannerData(),
      getInTheaters(),
      getPopularTv(),
      getCategories()
    ])

    return {
      banner,
      topMovies: movies.slice(0, 8),
      topTV: tv.slice(0, 8),
      categories: categories.slice(0, 8)
    }
  } catch (error) {
    console.error('[Douban] Failed to get home data:', error)
    return { banner: [], topMovies: [], topTV: [], categories: [] }
  }
}

export async function getAllVideos(): Promise<VideoItem[]> {
  try {
    const [movies, tv] = await Promise.all([
      getTop250(),
      getPopularTv()
    ])
    return [...movies, ...tv]
  } catch (error) {
    console.error('[Douban] Failed to get all videos:', error)
    return []
  }
}
