// Central API helper for the VisionCross Flask backend.
// The backend authenticates via an HTTP-only cookie named `token`, so every
// request must send credentials. The base URL is configurable so the frontend
// can point at a deployed backend instead of localhost.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:5000'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function parse(res) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { message: text }
  }
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
  })
  const data = await parse(res)
  if (!res.ok) throw new ApiError(res.status, data?.message || 'Request failed')
  return data
}

export async function apiJson(path, method, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await parse(res)
  if (!res.ok) throw new ApiError(res.status, data?.message || 'Request failed')
  return data
}

export async function apiForm(path, form) {
  // Do not set Content-Type manually — the browser sets the multipart boundary.
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })
  const data = await parse(res)
  if (!res.ok) throw new ApiError(res.status, data?.message || 'Request failed')
  return data
}
