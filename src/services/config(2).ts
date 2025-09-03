/**
 * config.ts
 * ---------------------------------------------------------
 * Simple frontend config helper for building API URLs.
 * Prefers window.__BACKEND_URL__ if available, otherwise falls back to same-origin or http://localhost:3000.
 */

/** Builds absolute API URL from a path (starting with /). */
export function apiUrl(path: string): string {
  // @ts-ignore
  const win: any = typeof window !== 'undefined' ? window : {}
  const base =
    (win && win.__BACKEND_URL__) ||
    (typeof location !== 'undefined' ? `${location.protocol}//${location.hostname}:3000` : 'http://localhost:3000')
  if (!path.startsWith('/')) return base + '/' + path
  return base + path
}
