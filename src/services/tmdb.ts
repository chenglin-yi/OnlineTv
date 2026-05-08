import axios from 'axios'
import type { VideoItem } from '@/types'

const TMDB_API_KEY = import.meta.env.TMDB_API_KEY || 'your_tmdb_api_key'
const TMDB_BASE_URL = import.meta.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = import.meta.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p'

const http = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 15000,
  params: {
    api_key: TMDB_API_KEY,
    language: 'zh-CN'
  }
})

export interface TmdbMovie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string
  backdrop_path: string
  release_date: string
  vote_average: number
  genre_ids: number[]
  media_type?: string
}

export interface TmdbTv {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string
  backdrop_path: string
  first_air_date: string
  vote_average: number
  genre_ids: number[]
  media_type?: string
  number_of_seasons: number
}

export interface TmdbGenre {
  id: number
  name: string
}

const genreMap: Record<number, string> = {
  28: '动作',
  12: '冒险',
  16: '动画',
  35: '喜剧',
  80: '犯罪',
  99: '纪录',
  18: '剧情',
  10751: '家庭',
  14: '奇幻',
  36: '历史',
  27: '恐怖',
  10402: '音乐',
  9648: '悬疑',
  10749: '爱情',
  878: '科幻',
  10770: '电视电影',
  53: '惊悚',
  10752: '战争',
  37: '西部'
}

function transformMovieToVideoItem(movie: TmdbMovie): VideoItem {
  return {
    id: movie.id.toString(),
    title: movie.title || movie.original_title,
    cover: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path}` : '',
    year: movie.release_date?.split('-')[0] || '',
    type: 'movie',
    rating: movie.vote_average,
    description: movie.overview || '',
    categories: movie.genre_ids.map(id => genreMap[id] || '其他').slice(0, 2),
    regions: []
  }
}

function transformTvToVideoItem(tv: TmdbTv): VideoItem {
  return {
    id: tv.id.toString(),
    title: tv.name || tv.original_name,
    cover: tv.poster_path ? `${TMDB_IMAGE_BASE_URL}/w342${tv.poster_path}` : '',
    year: tv.first_air_date?.split('-')[0] || '',
    type: 'tv',
    rating: tv.vote_average,
    description: tv.overview || '',
    categories: tv.genre_ids.map(id => genreMap[id] || '其他').slice(0, 2),
    regions: []
  }
}

export async function getTrendingMovies(): Promise<VideoItem[]> {
  try {
    const response = await http.get('/trending/movie/week')
    return response.data.results.map((movie: TmdbMovie) => transformMovieToVideoItem(movie))
  } catch (error) {
    console.error('[TMDB] Failed to fetch trending movies:', error)
    return []
  }
}

export async function getTrendingTv(): Promise<VideoItem[]> {
  try {
    const response = await http.get('/trending/tv/week')
    return response.data.results.map((tv: TmdbTv) => transformTvToVideoItem(tv))
  } catch (error) {
    console.error('[TMDB] Failed to fetch trending TV:', error)
    return []
  }
}

export async function getPopularMovies(): Promise<VideoItem[]> {
  try {
    const response = await http.get('/movie/popular')
    return response.data.results.map((movie: TmdbMovie) => transformMovieToVideoItem(movie))
  } catch (error) {
    console.error('[TMDB] Failed to fetch popular movies:', error)
    return []
  }
}

export async function getPopularTv(): Promise<VideoItem[]> {
  try {
    const response = await http.get('/tv/popular')
    return response.data.results.map((tv: TmdbTv) => transformTvToVideoItem(tv))
  } catch (error) {
    console.error('[TMDB] Failed to fetch popular TV:', error)
    return []
  }
}

export async function getTopRatedMovies(): Promise<VideoItem[]> {
  try {
    const response = await http.get('/movie/top_rated')
    return response.data.results.map((movie: TmdbMovie) => transformMovieToVideoItem(movie))
  } catch (error) {
    console.error('[TMDB] Failed to fetch top rated movies:', error)
    return []
  }
}

export async function getTopRatedTv(): Promise<VideoItem[]> {
  try {
    const response = await http.get('/tv/top_rated')
    return response.data.results.map((tv: TmdbTv) => transformTvToVideoItem(tv))
  } catch (error) {
    console.error('[TMDB] Failed to fetch top rated TV:', error)
    return []
  }
}

export async function getNowPlayingMovies(): Promise<VideoItem[]> {
  try {
    const response = await http.get('/movie/now_playing')
    return response.data.results.map((movie: TmdbMovie) => transformMovieToVideoItem(movie))
  } catch (error) {
    console.error('[TMDB] Failed to fetch now playing movies:', error)
    return []
  }
}

export async function searchMovies(query: string): Promise<VideoItem[]> {
  try {
    const response = await http.get('/search/movie', {
      params: { query }
    })
    return response.data.results.map((movie: TmdbMovie) => transformMovieToVideoItem(movie))
  } catch (error) {
    console.error('[TMDB] Failed to search movies:', error)
    return []
  }
}

export async function searchTv(query: string): Promise<VideoItem[]> {
  try {
    const response = await http.get('/search/tv', {
      params: { query }
    })
    return response.data.results.map((tv: TmdbTv) => transformTvToVideoItem(tv))
  } catch (error) {
    console.error('[TMDB] Failed to search TV:', error)
    return []
  }
}

export async function searchMulti(query: string): Promise<VideoItem[]> {
  try {
    const response = await http.get('/search/multi', {
      params: { query }
    })
    return response.data.results.map((item: TmdbMovie | TmdbTv) => {
      if (item.media_type === 'tv' || 'number_of_seasons' in item) {
        return transformTvToVideoItem(item as TmdbTv)
      }
      return transformMovieToVideoItem(item as TmdbMovie)
    })
  } catch (error) {
    console.error('[TMDB] Failed to search multi:', error)
    return []
  }
}

export async function getMovieDetail(id: string): Promise<VideoItem | null> {
  try {
    const response = await http.get(`/movie/${id}`)
    return transformMovieToVideoItem(response.data)
  } catch (error) {
    console.error('[TMDB] Failed to get movie detail:', error)
    return null
  }
}

export async function getTvDetail(id: string): Promise<VideoItem | null> {
  try {
    const response = await http.get(`/tv/${id}`)
    return transformTvToVideoItem(response.data)
  } catch (error) {
    console.error('[TMDB] Failed to get TV detail:', error)
    return null
  }
}

export async function getGenres(): Promise<TmdbGenre[]> {
  try {
    const response = await http.get('/genre/movie/list')
    return response.data.genres
  } catch (error) {
    console.error('[TMDB] Failed to get genres:', error)
    return []
  }
}

export async function getBannerData(): Promise<any[]> {
  try {
    const [movies, tv] = await Promise.all([
      getTrendingMovies(),
      getTrendingTv()
    ])
    const combined = [...movies.slice(0, 3), ...tv.slice(0, 2)]
    return combined.map(item => ({
      id: item.id,
      title: item.title,
      cover: item.cover.replace('/w342', '/w1280'),
      description: item.description.slice(0, 50) + '...'
    }))
  } catch (error) {
    console.error('[TMDB] Failed to get banner data:', error)
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
    const [banner, trendingMovies, trendingTv, genres] = await Promise.all([
      getBannerData(),
      getTrendingMovies(),
      getTrendingTv(),
      getGenres()
    ])

    const categories = genres.map(g => ({
      id: g.id.toString(),
      name: g.name,
      icon: '🎬'
    }))

    return {
      banner,
      topMovies: trendingMovies.slice(0, 8),
      topTV: trendingTv.slice(0, 8),
      categories
    }
  } catch (error) {
    console.error('[TMDB] Failed to get home data:', error)
    return { banner: [], topMovies: [], topTV: [], categories: [] }
  }
}

export async function getAllVideos(): Promise<VideoItem[]> {
  try {
    const [movies, tv] = await Promise.all([
      getPopularMovies(),
      getPopularTv()
    ])
    return [...movies, ...tv]
  } catch (error) {
    console.error('[TMDB] Failed to get all videos:', error)
    return []
  }
}
