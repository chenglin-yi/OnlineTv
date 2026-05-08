import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/proxy-hongniu': {
        target: 'https://www.hongniuzy2.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-hongniu/, '')
      },
      '/proxy-mtzy': {
        target: 'https://www.mtzy.me',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-mtzy/, '')
      },
      '/proxy-liangzi': {
        target: 'https://cj.lziapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-liangzi/, '')
      },
      '/liangzi-img': {
        target: 'https://img.lzzyimg.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/liangzi-img\//, '')
      },
      '/proxy-feifan': {
        target: 'https://api.ffzyapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-feifan/, '')
      },
      '/proxy-wolong': {
        target: 'https://collect.wolongzyw.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-wolong/, '')
      },
      '/wolong-img': {
        target: 'https://imgwolong.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wolong-img\//, '')
      },
      '/proxy-douban': {
        target: 'https://caiji.dbzy5.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-douban/, '')
      },
      '/api': {
        target: 'https://jikefuye.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/geek': {
        target: 'https://jikefuye.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geek/, '')
      },
      '/douban': {
        target: 'https://movie.douban.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/douban/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://movie.douban.com/'
        }
      },
      '/douban-img': {
        target: 'https://img1.doubanio.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/douban-img/, '')
      },
      '/vod-api': {
        target: 'https://cj2.ffzyapi.com/api.php/provide/vod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vod-api/, '')
      },
      '/vod-img': {
        target: 'https://img.ffzy888.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vod-img/, '')
      },
      '/video-proxy': {
        target: 'https://vip.ffzy-play6.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/video-proxy/, '')
      },
      '/svip-video': {
        target: 'https://svipsvip.ffzyread1.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/svip-video/, '')
      },
      '/ffzy-video': {
        target: 'https://vip.ffzy-play1.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ffzy-video/, '')
      },
      '/ffzy-plays': {
        target: 'https://vip.ffzy-plays.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ffzy-plays/, '')
      },
      '/ffzy-online5': {
        target: 'https://svipsvip.ffzy-online5.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ffzy-online5/, '')
      },
      '/api-douban': {
        target: 'https://caiji.dbzy5.com/api.php/provide/vod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-douban/, '')
      },
      '/douban-img2': {
        target: 'https://dbzy5.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/douban-img2/, ''),
        https: false
      },
      '/api-maotai': {
        target: 'https://caiji.mtzy.me/api.php/provide/vod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-maotai/, '')
      },
      '/maotai-img': {
        target: 'https://pic.5k5z.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/maotai-img\//, '')
      },
      '/api-hongniu': {
        target: 'https://caiji.hongniuziyuan.com/api.php/provide/vod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-hongniu/, '')
      },
      '/hongniu-img': {
        target: 'https://pic.hongniuzy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hongniu-img\//, '')
      },
      '/tvbox': {
        target: 'https://jikefuye.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tvbox/, '')
      },
      '/dytt': {
        target: 'https://dyttzyw.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dytt/, '')
      }
    }
  }
})