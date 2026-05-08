const PROXY_CONFIG = [
  { path: '/proxy-hongniu', target: 'https://www.hongniuzy2.com' },
  { path: '/proxy-mtzy', target: 'https://www.mtzy.me' },
  { path: '/proxy-liangzi', target: 'https://cj.lziapi.com' },
  { path: '/proxy-feifan', target: 'https://api.ffzyapi.com' },
  { path: '/proxy-wolong', target: 'https://collect.wolongzyw.com' },
  { path: '/proxy-douban', target: 'https://caiji.dbzy5.com' },
]

const IMG_PROXY_CONFIG = [
  { path: '/hongniu-img', target: 'https://pic.hongniuzy.com' },
  { path: '/maotai-img', target: 'https://pic.5k5z.cn' },
  { path: '/liangzi-img', target: 'https://img.lzzyimg.com' },
  { path: '/vod-img', target: 'https://img.ffzy888.com' },
  { path: '/wolong-img', target: 'https://imgwolong.com' },
  { path: '/douban-img2', target: 'https://dbzy5.com' },
]

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      })
    }

    for (const config of PROXY_CONFIG) {
      if (pathname.startsWith(config.path)) {
        const targetPath = pathname.replace(config.path, '') + url.search
        const targetUrl = config.target + targetPath

        try {
          const response = await fetch(targetUrl, {
            method: request.method,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
              'Referer': config.target + '/'
            },
            redirect: 'follow'
          })

          const contentType = response.headers.get('Content-Type') || 'application/json'
          const body = await response.text()

          const headers = new Headers()
          headers.set('Content-Type', contentType)
          headers.set('Access-Control-Allow-Origin', '*')
          headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
          headers.set('Access-Control-Allow-Headers', 'Content-Type')
          headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')

          return new Response(body, {
            status: response.status,
            headers
          })
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Proxy failed', message: String(error) }), {
            status: 502,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          })
        }
      }
    }

    for (const config of IMG_PROXY_CONFIG) {
      if (pathname.startsWith(config.path)) {
        const targetPath = pathname.replace(config.path, '') + url.search
        const targetUrl = config.target + targetPath

        try {
          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': config.target + '/'
            },
            redirect: 'follow'
          })

          const headers = new Headers(response.headers)
          headers.set('Access-Control-Allow-Origin', '*')
          headers.set('Cache-Control', 'public, max-age=86400')

          return new Response(response.body, {
            status: response.status,
            headers
          })
        } catch (error) {
          return new Response('Image not found', { status: 404 })
        }
      }
    }

    return env.ASSETS.fetch(request)
  }
}
