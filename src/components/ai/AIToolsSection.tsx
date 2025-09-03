/**
 * AIToolsSection.tsx
 * ---------------------------------------------------------
 * Curated list of free AI tools with search and JSON import. Operators can extend the list.
 */

import React from 'react'
import { ExternalLink, PlusCircle, Search } from 'lucide-react'

type Tool = {
  id: string
  name: string
  url: string
  category: string
  description?: string
  tags?: string[]
}

const defaultTools: Tool[] = [
  { id: 'chatgpt', name: 'ChatGPT (Free tier)', url: 'https://chat.openai.com/', category: 'Chat', tags: ['nlp', 'qa'] },
  { id: 'claude', name: 'Claude (Free tier)', url: 'https://claude.ai', category: 'Chat', tags: ['nlp', 'qa'] },
  { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai', category: 'Search', tags: ['web', 'qa'] },
  { id: 'gemini', name: 'Google Gemini', url: 'https://gemini.google.com', category: 'Chat', tags: ['nlp'] },
  { id: 'notebooklm', name: 'NotebookLM', url: 'https://notebooklm.google/', category: 'RAG', tags: ['notes', 'rag'] },
  { id: 'github-copilot', name: 'GitHub Copilot (Free for students)', url: 'https://github.com/features/copilot', category: 'Code', tags: ['coding'] },
  { id: 'replicate', name: 'Replicate', url: 'https://replicate.com/', category: 'Models', tags: ['image', 'video', 'api'] },
  { id: 'huggingface', name: 'Hugging Face Spaces', url: 'https://huggingface.co/spaces', category: 'Models', tags: ['demo', 'community'] },
  { id: 'leonardo', name: 'Leonardo AI', url: 'https://leonardo.ai', category: 'Image', tags: ['image'] },
  { id: 'ideogram', name: 'Ideogram', url: 'https://ideogram.ai', category: 'Image', tags: ['image', 'text2image'] },
]

/** Validate imported JSON */
function normalize(raw: unknown): Tool[] {
  if (!Array.isArray(raw)) return []
  const list: Tool[] = []
  for (const it of raw) {
    try {
      const id = String(it.id || it.name || '').toLowerCase().replace(/\s+/g, '-')
      const name = String(it.name || '')
      const url = String(it.url || '')
      const category = String(it.category || 'Other')
      const description = it.description ? String(it.description) : undefined
      const tags = Array.isArray(it.tags) ? it.tags.map((x: any) => String(x)) : undefined
      if (!id || !name || !url) continue
      list.push({ id, name, url, category, description, tags })
    } catch {}
  }
  return list
}

/**
 * AIToolsSection
 * Lists tools; allows importing more by JSON. Operators can "not miss any" by periodically importing from curated feeds.
 */
export default function AIToolsSection() {
  const [items, setItems] = React.useState<Tool[]>(defaultTools)
  const [q, setQ] = React.useState('')
  const [cat, setCat] = React.useState<string>('All')
  const fileRef = React.useRef<HTMLInputElement>(null)

  const cats = React.useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.category)))], [items])

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase()
    return items.filter((t) => {
      const catOk = cat === 'All' || t.category === cat
      if (!query) return catOk
      const hay = (t.name + ' ' + (t.description || '') + ' ' + (t.tags || []).join(' ')).toLowerCase()
      return catOk && hay.includes(query)
    })
  }, [items, q, cat])

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const text = await f.text()
      const json = JSON.parse(text)
      const list = normalize(json)
      if (list.length === 0) {
        alert('Geçerli araç bulunamadı.')
      } else {
        setItems((prev) => {
          const map = new Map(prev.map((i) => [i.id, i]))
          for (const t of list) map.set(t.id, t)
          return Array.from(map.values())
        })
        alert(`İçe aktarıldı: ${list.length} araç`)
      }
    } catch {
      alert('Geçersiz JSON.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <section id="ai-tools" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">AI Araçları</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Ücretsiz ve eklenebilir araçlar. JSON ile içe aktararak listeyi genişletebilirsiniz.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ara: araç adı, etiket..."
              className="h-10 w-full rounded-md border border-neutral-300 bg-white pl-8 pr-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            JSON İçe Aktar <PlusCircle className="ml-2 h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            Sonuç yok.
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{t.name}</div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.description || '—'}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
                  {t.category}
                </span>
                {(t.tags || []).map((x) => (
                  <span
                    key={x}
                    className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  >
                    {x}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <a
                  href={t.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm text-neutral-700 underline-offset-4 hover:underline dark:text-neutral-300"
                >
                  Ziyaret et <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
