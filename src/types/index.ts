export interface VideoEpisode {
  id: string
  name: string
  url: string
}

export interface VideoSource {
  id: string
  name: string
  url: string
  quality: string
}

export interface VideoPlaySource {
  id: string
  name: string
  episodes: VideoEpisode[]
}

export interface VideoItem {
  id: string
  title: string
  cover: string
  year: string
  type: 'movie' | 'tv'
  rating: number
  description: string
  categories?: string[]
  regions?: string[]
  playUrl?: string
  playFrom?: string
  sources?: VideoPlaySource[]
  episodes?: VideoEpisode[]
}

export interface SearchResult {
  list: VideoItem[]
  total: number
  page: number
  pageSize: number
}

export interface LineConfig {
  id: string
  name: string
  apiUrl: string
  status: 'online' | 'offline' | 'testing'
  lastTest?: string
  type?: 'maccms' | 'tvbox' | 'other'
  imgProxy?: string
  videoProxy?: string
}

export interface LineStore {
  lines: LineConfig[]
  activeLineId: string | null
}
