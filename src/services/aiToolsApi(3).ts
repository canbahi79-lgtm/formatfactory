/**
 * aiToolsApi.ts
 * ---------------------------------------------------------
 * Fetches aggregated AI tools from backend cron.
 */

import { apiUrl } from '@/services/config'

export interface AITool {
  id: string
  name: string
  url: string
  category: string
  description?: string
  tags?: string[]
}

/** Returns an array of tools from /api/ai-tools or [] on error. */
export async function fetchAggregatedAITools(): Promise<AITool[]> {
  try {
    const res = await fetch(apiUrl('/api/ai-tools'), { headers: { Accept: 'application/json' } })
    if (!res.ok) return []
    const data = await res.json()
    if (Array.isArray(data)) return data as AITool[]
    return []
  } catch {
    return []
  }
}
