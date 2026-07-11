const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const API_V1 = '/api/v1'
const TOKEN_KEY = 'mr_access_token'
const REFRESH_KEY = 'mr_refresh_token'

// Timeouts per endpoint (ms)
const TIMEOUT_DEFAULT = 30000
const TIMEOUT_LONG = 90000   // analyze / chat can take longer

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}
export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// Avoid firing multiple refresh requests at once
let refreshing = false
let refreshWaiters = []

async function doRefresh() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(`${API_BASE_URL}${API_V1}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error('Refresh failed')
    const data = await res.json()
    setToken(data.access_token)
    setRefreshToken(data.refresh_token)
    return data.access_token
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

async function refreshAndRetry(path, options, auth) {
  if (refreshing) {
    await new Promise((resolve) => refreshWaiters.push(resolve))
  } else {
    refreshing = true
    refreshWaiters = []
    try {
      await doRefresh()
    } catch (e) {
      refreshWaiters.forEach((r) => r())
      refreshWaiters = []
      refreshing = false
      clearToken()
      throw e
    }
    refreshWaiters.forEach((r) => r())
    refreshWaiters = []
    refreshing = false
  }
  // Re-run the original request once with the new token
  return request(path, options, auth)
}

async function request(path, options, auth = false, timeout = TIMEOUT_DEFAULT) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...options, signal: controller.signal })
    clearTimeout(timer)
    if (res.status === 401 && auth) {
      return refreshAndRetry(path, options, auth)
    }
    if (!res.ok) {
      let message = `Erreur ${res.status}`
      try {
        const data = await res.json()
        if (data?.detail) {
          message =
            typeof data.detail === 'string'
              ? data.detail
              : JSON.stringify(data.detail)
        }
      } catch {
        /* ignore parse errors */
      }
      throw new Error(message)
    }
    if (res.status === 204) return null
    return res.json()
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') {
      throw new Error('La requête a pris trop de temps. Vérifiez que le backend est démarré et que les clés API sont configurées.')
    }
    throw err
  }
}

export async function apiGet(path, { auth = false, timeout } = {}) {
  const headers = {}
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  return request(path, { method: 'GET', headers }, auth, timeout)
}

export async function apiPost(path, body, { auth = false, timeout } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  return request(
    path,
    { method: 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body) },
    auth,
    timeout,
  )
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(email, password) {
  const data = await apiPost(`${API_V1}/auth/login`, { email, password })
  setToken(data.access_token)
  setRefreshToken(data.refresh_token)
  return data
}

export async function register(name, email, password) {
  const data = await apiPost(`${API_V1}/auth/register`, { name, email, password })
  setToken(data.access_token)
  setRefreshToken(data.refresh_token)
  return data
}

export async function logout() {
  try {
    await apiPost(`${API_V1}/auth/logout`, {})
  } catch {
    /* ignore network errors on logout */
  }
  clearToken()
}

// ---------------------------------------------------------------------------
// Brand flow (UI1 -> UI2/UI3)
// ---------------------------------------------------------------------------

export async function describeBrand(description) {
  return apiPost(`${API_V1}/brands/describe`, { description }, { auth: true, timeout: TIMEOUT_LONG })
}

export async function confirmBrand(payload) {
  return apiPost(`${API_V1}/brands/confirm`, payload, { auth: true })
}

// ---------------------------------------------------------------------------
// Market research (step 2): 5 web searches + LLM report
// ---------------------------------------------------------------------------

export async function analyzeBrand(brandId) {
  return apiPost(`${API_V1}/responses/analyze/${brandId}`, {}, { auth: true, timeout: TIMEOUT_LONG })
}

export async function getReport(brandId) {
  return apiGet(`${API_V1}/responses/report/${brandId}`, { auth: true })
}

// ---------------------------------------------------------------------------
// Chat (RAG assistant) — ask a question about a brand's report
// ---------------------------------------------------------------------------

export async function askBrand(brandId, question) {
  return apiPost(`${API_V1}/chat/${brandId}`, { question }, { auth: true, timeout: TIMEOUT_LONG })
}

export { API_BASE_URL }
