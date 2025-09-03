/**
 * seo.ts
 * ---------------------------------------------------------
 * Global SEO store: site meta, keywords list, and helpers to update them.
 * This enables SEOHead to inject dynamic meta tags, and SEOKeywordManager to manage keywords.
 */

import { create } from 'zustand'

/** SEO state shape */
interface SEOState {
  /** Base site title */
  title: string
  /** Meta description */
  description: string
  /** Meta keywords */
  keywords: string[]
  /** Whether robots should index/follow */
  allowIndex: boolean

  /** Update functions */
  setTitle: (t: string) => void
  setDescription: (d: string) => void
  setKeywords: (k: string[]) => void
  addKeyword: (k: string) => void
  importKeywords: (incoming: string[]) => void
  setAllowIndex: (v: boolean) => void
}

/**
 * useSEOStore
 * Zustand store to keep SEO state centralized.
 */
export const useSEOStore = create<SEOState>((set, get) => ({
  title: 'AI Journal Formatter – Dergi Şablonları ve Yazım Kuralları',
  description:
    'Makalenizi yükleyin, dergi şablonu ve yazım biçimini seçin, tek tıkla düzenleyin. DergiPark ve uluslararası şablon desteği.',
  keywords: [
    'DergiPark',
    'yazım kuralları',
    'akademik yazım',
    'APA',
    'MLA',
    'Chicago',
    'IEEE',
    'şablon',
    'formatlama',
    'intihal raporu',
    'akademik düzenleme',
    'makale formatı',
  ],
  allowIndex: true,

  setTitle: (t) => set({ title: t }),
  setDescription: (d) => set({ description: d }),
  setKeywords: (k) => set({ keywords: k.map((x) => x.trim()).filter(Boolean) }),
  addKeyword: (k) => {
    const kw = k.trim()
    if (!kw) return
    const { keywords } = get()
    if (keywords.includes(kw)) return
    set({ keywords: [...keywords, kw] })
  },
  importKeywords: (incoming) => {
    const cur = new Set(get().keywords)
    for (const k of incoming) {
      const s = String(k || '').trim()
      if (s) cur.add(s)
    }
    set({ keywords: Array.from(cur) })
  },
  setAllowIndex: (v) => set({ allowIndex: v }),
}))