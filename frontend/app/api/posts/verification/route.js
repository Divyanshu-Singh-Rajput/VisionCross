import { API_BASE } from '@/lib/api'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const cookieHeader = request.headers.get('cookie')
    const headers = {}
    if (cookieHeader) {
      headers['cookie'] = cookieHeader
    }

    const backendRes = await fetch(`${API_BASE}/posts/verification`, {
      method: 'POST',
      headers,
      body: formData,
      redirect: 'manual',
    })

    // If Flask returned a redirect (302 Found) to the destination link
    if (backendRes.status >= 300 && backendRes.status < 400) {
      const postLink = backendRes.headers.get('location')
      return Response.json({ ok: true, post_link: postLink }, { status: 200 })
    }

    const text = await backendRes.text()
    let data = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { message: text }
    }

    if (!backendRes.ok) {
      return Response.json(
        { message: data.message || 'Verification failed' },
        { status: backendRes.status }
      )
    }

    return Response.json(data, { status: 200 })
  } catch (err) {
    return Response.json(
      { message: err?.message || 'Verification service error' },
      { status: 500 }
    )
  }
}
