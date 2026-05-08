import type { VideoItem } from '@/types'

export async function getMockMovies(): Promise<VideoItem[]> {
  const mockData: VideoItem[] = [
    {
      id: '1',
      title: '热辣滚烫',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20comedy%20drama%20movie%20poster%20woman%20boxing%20inspirational&image_size=portrait_4_3',
      year: '2024',
      type: 'movie',
      rating: 8.5,
      description: '一个关于自我成长和突破的温暖故事，讲述女主角从低谷中崛起的励志历程',
      categories: ['剧情', '喜剧'],
      regions: ['中国大陆']
    },
    {
      id: '2',
      title: '第二十条',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20legal%20drama%20courtroom%20movie%20poster%20justice&image_size=portrait_4_3',
      year: '2024',
      type: 'movie',
      rating: 8.2,
      description: '根据真实案件改编的法律题材影片，探讨正当防卫的边界与人性的复杂',
      categories: ['剧情', '法律'],
      regions: ['中国大陆']
    },
    {
      id: '3',
      title: '飞驰人生2',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20racing%20comedy%20movie%20poster%20car%20speed%20competition&image_size=portrait_4_3',
      year: '2024',
      type: 'movie',
      rating: 7.8,
      description: '赛车手重返赛场的热血故事，充满激情与欢笑',
      categories: ['喜剧', '运动'],
      regions: ['中国大陆']
    },
    {
      id: '4',
      title: '封神第二部',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20fantasy%20epic%20movie%20poster%20mythology%20gods%20battle&image_size=portrait_4_3',
      year: '2024',
      type: 'movie',
      rating: 8.0,
      description: '中国神话史诗巨制，展现商周交替时期的宏大战争',
      categories: ['奇幻', '动作'],
      regions: ['中国大陆']
    },
    {
      id: '5',
      title: '红海行动2',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20military%20action%20movie%20poster%20navy%20special%20forces&image_size=portrait_4_3',
      year: '2025',
      type: 'movie',
      rating: 8.3,
      description: '中国海军特种部队海外救援行动，紧张刺激的军事动作大片',
      categories: ['动作', '战争'],
      regions: ['中国大陆']
    },
    {
      id: '6',
      title: '流浪地球3',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20sci-fi%20movie%20poster%20space%20earth%20planet%20journey&image_size=portrait_4_3',
      year: '2027',
      type: 'movie',
      rating: 8.8,
      description: '人类带着地球踏上新的征程，探索宇宙的未知奥秘',
      categories: ['科幻', '冒险'],
      regions: ['中国大陆']
    },
    {
      id: '7',
      title: '长津湖',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20war%20movie%20poster%20Korean%20War%20snow%20soldiers%20heroic&image_size=portrait_4_3',
      year: '2021',
      type: 'movie',
      rating: 9.3,
      description: '抗美援朝战争史诗，展现志愿军战士的英勇无畏',
      categories: ['战争', '历史'],
      regions: ['中国大陆']
    },
    {
      id: '8',
      title: '满江红',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20historical%20thriller%20movie%20poster%20ancient%20China%20mystery&image_size=portrait_4_3',
      year: '2023',
      type: 'movie',
      rating: 8.5,
      description: '南宋年间的悬疑迷局，层层反转的精彩故事',
      categories: ['悬疑', '历史'],
      regions: ['中国大陆']
    }
  ]
  return mockData
}

export async function getMockTvShows(): Promise<VideoItem[]> {
  const mockData: VideoItem[] = [
    {
      id: 'tv1',
      title: '繁花',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20TV%20drama%20poster%201990s%20Shanghai%20business%20success%20story&image_size=portrait_4_3',
      year: '2023',
      type: 'tv',
      rating: 9.2,
      description: '90年代上海商业传奇，讲述小人物的奋斗与成长',
      categories: ['剧情', '年代'],
      regions: ['中国大陆']
    },
    {
      id: 'tv2',
      title: '三体',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20sci-fi%20TV%20series%20poster%20Three%20Body%20Problem%20universe%20space&image_size=portrait_4_3',
      year: '2023',
      type: 'tv',
      rating: 9.4,
      description: '根据刘慈欣同名小说改编，展现宇宙文明的宏大史诗',
      categories: ['科幻', '剧情'],
      regions: ['中国大陆']
    },
    {
      id: 'tv3',
      title: '狂飙',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20crime%20drama%20TV%20poster%20police%20undercover%20gangster%20war&image_size=portrait_4_3',
      year: '2023',
      type: 'tv',
      rating: 9.1,
      description: '扫黑除恶题材力作，展现正义与邪恶的激烈交锋',
      categories: ['犯罪', '剧情'],
      regions: ['中国大陆']
    },
    {
      id: 'tv4',
      title: '庆余年 第二季',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20historical%20fantasy%20TV%20drama%20poster%20ancient%20royal%20palace&image_size=portrait_4_3',
      year: '2024',
      type: 'tv',
      rating: 8.8,
      description: '范闲继续传奇人生，权谋斗争更加精彩',
      categories: ['古装', '奇幻'],
      regions: ['中国大陆']
    },
    {
      id: 'tv5',
      title: '人世间',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20family%20drama%20TV%20series%20poster%20life%20story%20emotion%20family&image_size=portrait_4_3',
      year: '2022',
      type: 'tv',
      rating: 9.0,
      description: '普通家庭五十年变迁史，感人至深的年代大剧',
      categories: ['家庭', '年代'],
      regions: ['中国大陆']
    },
    {
      id: 'tv6',
      title: '觉醒年代',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20historical%20drama%20TV%20poster%20revolution%201919%20intellectuals&image_size=portrait_4_3',
      year: '2021',
      type: 'tv',
      rating: 9.3,
      description: '新文化运动历史剧，展现百年前思想启蒙的光辉历程',
      categories: ['历史', '剧情'],
      regions: ['中国大陆']
    },
    {
      id: 'tv7',
      title: '琅琊榜',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20ancient%20costume%20TV%20drama%20poster%20sword%20hero%20strategy&image_size=portrait_4_3',
      year: '2015',
      type: 'tv',
      rating: 9.4,
      description: '古风权谋巨制，梅长苏的复仇与救赎之路',
      categories: ['古装', '权谋'],
      regions: ['中国大陆']
    },
    {
      id: 'tv8',
      title: '甄嬛传',
      cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Chinese%20imperial%20harem%20TV%20drama%20poster%20ancient%20palace%20beauty%20intrigue&image_size=portrait_4_3',
      year: '2011',
      type: 'tv',
      rating: 9.2,
      description: '清代宫廷剧经典，展现后宫女子的命运沉浮',
      categories: ['古装', '宫斗'],
      regions: ['中国大陆']
    }
  ]
  return mockData
}

export async function getTrendingMovies(): Promise<VideoItem[]> {
  return getMockMovies()
}

export async function getTrendingTv(): Promise<VideoItem[]> {
  return getMockTvShows()
}

export async function getPopularMovies(): Promise<VideoItem[]> {
  return getMockMovies()
}

export async function getPopularTv(): Promise<VideoItem[]> {
  return getMockTvShows()
}

export async function searchMovies(query: string): Promise<VideoItem[]> {
  const movies = await getMockMovies()
  return movies.filter(m => m.title.includes(query))
}

export async function searchTv(query: string): Promise<VideoItem[]> {
  const tv = await getMockTvShows()
  return tv.filter(t => t.title.includes(query))
}

export async function searchMulti(query: string): Promise<VideoItem[]> {
  const [movies, tv] = await Promise.all([
    searchMovies(query),
    searchTv(query)
  ])
  return [...movies, ...tv]
}

export async function getMovieDetail(id: string): Promise<VideoItem | null> {
  const movies = await getMockMovies()
  return movies.find(m => m.id === id) || null
}

export async function getTvDetail(id: string): Promise<VideoItem | null> {
  const tv = await getMockTvShows()
  return tv.find(t => t.id === id) || null
}

export async function getCategories(): Promise<any[]> {
  return [
    { id: '1', name: '全部', icon: '🎬' },
    { id: '2', name: '动作', icon: '💥' },
    { id: '3', name: '喜剧', icon: '😄' },
    { id: '4', name: '剧情', icon: '📖' },
    { id: '5', name: '科幻', icon: '🚀' },
    { id: '6', name: '爱情', icon: '❤️' },
    { id: '7', name: '悬疑', icon: '🔍' },
    { id: '8', name: '战争', icon: '⚔️' }
  ]
}

export async function getBannerData(): Promise<any[]> {
  const movies = await getTrendingMovies()
  return movies.slice(0, 5).map(item => ({
    id: item.id,
    title: item.title,
    cover: item.cover,
    description: item.description || '精彩影视推荐'
  }))
}

export async function getHomeData(): Promise<{
  banner: any[]
  topMovies: VideoItem[]
  topTV: VideoItem[]
  categories: any[]
}> {
  const [banner, movies, tv, categories] = await Promise.all([
    getBannerData(),
    getTrendingMovies(),
    getTrendingTv(),
    getCategories()
  ])

  return {
    banner,
    topMovies: movies.slice(0, 8),
    topTV: tv.slice(0, 8),
    categories
  }
}

export async function getAllVideos(): Promise<VideoItem[]> {
  const [movies, tv] = await Promise.all([
    getPopularMovies(),
    getPopularTv()
  ])
  return [...movies, ...tv]
}
