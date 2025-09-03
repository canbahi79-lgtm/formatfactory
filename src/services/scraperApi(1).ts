/**
 * scraperApi.ts
 * ---------------------------------------------------------
 * Backend scraper API client. Fetches journal list (with instructions & templates)
 * from your server. Falls back to local base entries on error.
 */

import type { JournalDirectoryEntry } from '@/data/journals'
import { apiUrl } from '@/services/config'

/**
 * Fetches journals from backend. Endpoint example: GET /api/journals
 * Returns normalized list compatible with JournalDirectoryEntry.
 * @param augment When true, appends ?augment=1 to request (if backend supports SerpAPI enrichment).
 */
export async function fetchDergiparkJournals(augment: boolean = false): Promise<JournalDirectoryEntry[]> {
  const q = augment ? '?augment=1' : ''
  try {
    const res = await fetch(apiUrl(`/api/journals${q}`), { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error('bad status')
    const json = await res.json()
    if (Array.isArray(json)) return json as JournalDirectoryEntry[]
    if (Array.isArray((json as any).items)) return (json as any).items as JournalDirectoryEntry[]
    return []
  } catch {
    return []
  }
}
