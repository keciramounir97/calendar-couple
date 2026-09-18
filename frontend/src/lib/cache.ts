const KEY = 'ccache:v2'

export function readCache<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${KEY}:${name}`)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeCache(name: string, value: unknown) {
  try {
    localStorage.setItem(`${KEY}:${name}`, JSON.stringify(value))
  } catch {
    // quota or private mode
  }
}
