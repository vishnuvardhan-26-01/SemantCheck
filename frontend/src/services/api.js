// Central API configuration. Override the backend URL with VITE_API_BASE_URL
// in a .env file; by default requests go to the same origin so the Vite dev
// proxy (see vite.config.js) forwards /api to the FastAPI backend.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(path, options) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, options)
  } catch {
    throw new Error(
      'Cannot reach the analysis server. Make sure the backend is running on port 8000.'
    )
  }

  if (!response.ok) {
    let detail = `Request failed (HTTP ${response.status})`
    try {
      const body = await response.json()
      if (body?.detail) detail = body.detail
    } catch {
      // non-JSON error body: keep the generic message
    }
    throw new Error(detail)
  }
  return response.json()
}

/**
 * Analyze two documents. `payloadA`/`payloadB` are either
 * { type: 'file', file } or { type: 'text', text }.
 */
export async function analyzeDocuments(payloadA, payloadB) {
  const form = new FormData()

  for (const [suffix, payload] of [['a', payloadA], ['b', payloadB]]) {
    if (payload.type === 'file') {
      form.append(`file_${suffix}`, payload.file)
    } else {
      form.append(`text_${suffix}`, payload.text)
    }
  }

  return request('/api/analyze', { method: 'POST', body: form })
}

/** Extract raw text from a single uploaded file (preview helper). */
export async function extractText(file) {
  const form = new FormData()
  form.append('file', file)
  return request('/api/extract-text', { method: 'POST', body: form })
}

/** Backend health check, used to warn early if the model is unavailable. */
export async function getHealth() {
  return request('/api/health', { method: 'GET' })
}
