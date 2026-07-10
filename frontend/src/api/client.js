const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}

export { API_BASE_URL }
