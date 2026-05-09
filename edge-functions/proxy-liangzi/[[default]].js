const TARGET = 'https://cj.lziapi.com'

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const targetPath = url.pathname.replace('/proxy-liangzi', '') + url.search
  const targetUrl = TARGET + targetPath

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': TARGET + '/'
      }
    })

    const body = await response.text()
    const contentType = response.headers.get('Content-Type') || 'application/json'

    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ code: -1, msg: 'Proxy error: ' + String(error) }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}