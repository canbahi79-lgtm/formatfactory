/**
 * JournalRulesSection.tsx
 * ---------------------------------------------------------
 * Dergi yazım kurallarını alfabetik ve arama ile filtrelenebilir şekilde listeler.
 * Veri kaynağı önceliği:
 * 1) Kullanıcı JSON içe aktarma (localStorage 'journalUserImport')
 * 2) Backend /api/journals (opsiyonel zenginleştirme: ?augment=1)
 * 3) Offline örnek veri (src/data/offline/dergipark-sample.json)
 * 4) Yerel temel veri (baseJournalEntries)
 *
 * Ekstra:
 * - JSON içe aktarma düğmesi (normalizeImportedEntries ile)
 * - Yenile (backend'ten tekrar dene)
 * - "Zenginleştir (SerpAPI)" anahtarı (augment toggle)
 * - Kaynak rozeti (Backend / Offline / Yerel / Kullanıcı JSON)
 * - Filtreleri sıfırla
 */

import React from 'react'
import { fetchDergiparkJournals } from '@/services/scraperApi'
import {
  baseJournalEntries,
  type JournalDirectoryEntry,
  normalizeImportedEntries,
} from '@/data/journals'
import { useWorkspaceStore } from '@/store/workspace'
import { BookOpen, ExternalLink, Search, RefreshCw, Upload, Eraser, Sparkles } from 'lucide-react'
// @ts-ignore - JSON import (esbuild)
import offlineSample from '@/data/offline/dergipark-sample.json'

/** Lightweight Button/Input fallbacks (shadcn varsa otomatik kullanılır) */
let Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>
let Input: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>
try {
  // @ts-ignore
  Button = require('@/components/ui/button').Button
  // @ts-ignore
  Input = require('@/components/ui/input').Input
} catch {
  Button = (props) => (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 ' +
        (props.className ?? '')
      }
    />
  )
  Input = (props) => (
    <input
      {...props}
      className={
        'h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ' +
        (props.className ?? '')
      }
    />
  )
}

/** Türk alfabesi + '#' */
const LETTERS = [
  'All',' #','A','B','C','Ç','D','E','F','G','Ğ','H','I','İ','J','K','L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z',
] as const
type LetterFilter = typeof LETTERS[number]

/** Kullanılan veri kaynağı etiketi */
type SourceTag = 'user-json' | 'backend' | 'offline' | 'local-base'

/** İlk harfi TR locale ile döndürür */
function toInitialTR(name: string): string {
  const trimmed = (name || '').trim()
  if (!trimmed) return '#'
  const first = trimmed[0]
  const up = first.toLocaleUpperCase('tr-TR')
  if (/[0-9]/.test(up)) return '#'
  return up
}

/** TR locale sıralama */
function sortTR(a: JournalDirectoryEntry, b: JournalDirectoryEntry): number {
  try {
    return a.name.localeCompare(b.name, 'tr-TR', { sensitivity: 'base' })
  } catch {
    return a.name.localeCompare(b.name)
  }
}

/**
 * JournalRulesSection
 * Alfabetik filtre + arama + detay + preset uygula + augment toggle
 */
export default function JournalRulesSection() {
  const [loading, setLoading] = React.useState<boolean>(true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [items, setItems] = React.useState<JournalDirectoryEntry[]>([])
  const [source, setSource] = React.useState<SourceTag>('local-base')

  const [selectedId, setSelectedId] = React.useState<string>('')
  const [query, setQuery] = React.useState<string>('')
  const [letter, setLetter] = React.useState<LetterFilter>('All')

  // Augmentation toggle (persist)
  const [augment, setAugment] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('journalAugment') === '1'
    } catch { return false }
  })
  React.useEffect(() => {
    try {
      localStorage.setItem('journalAugment', augment ? '1' : '0')
    } catch {}
  }, [augment])

  const applyPreset = useWorkspaceStore((s) => s.applyPreset)

  /** İlk yüklemede: user-json > backend (augment opsiyonel) > offline > local-base */
  React.useEffect(() => {
    let cancelled = false
    async function loadAll() {
      setLoading(true)
      setErrorMsg(null)

      // 1) Kullanıcı içe aktarması (localStorage)
      try {
        const raw = localStorage.getItem('journalUserImport')
        if (raw) {
          const parsed = JSON.parse(raw)
          const norm = normalizeImportedEntries(parsed)
          if (!cancelled && norm.length > 0) {
            const data = norm.slice().sort(sortTR)
            setItems(data)
            setSource('user-json')
            setLoading(false)
            return
          }
        }
      } catch {}

      // 2) Backend
      try {
        const remote = await fetchDergiparkJournals(augment)
        if (!cancelled && Array.isArray(remote) && remote.length > 0) {
          const data = remote.slice().sort(sortTR)
          setItems(data as JournalDirectoryEntry[])
          setSource('backend')
          setLoading(false)
          return
        }
      } catch (e: any) {
        if (!cancelled) setErrorMsg('Backend erişimi başarısız.')
      }

      // 3) Offline örnek
      try {
        const offline = normalizeImportedEntries(offlineSample)
        if (!cancelled && offline.length > 0) {
          const data = offline.slice().sort(sortTR)
          setItems(data)
          setSource('offline')
          setLoading(false)
          return
        }
      } catch {}

      // 4) Yerel temel
      if (!cancelled) {
        const data = (baseJournalEntries as JournalDirectoryEntry[]).slice().sort(sortTR)
        setItems(data)
        setSource('local-base')
        setLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [augment])

  /** Filtrelenmiş liste */
  const filtered = React.useMemo(() => {
    let list = items
    if (letter !== 'All') {
      list = list.filter((it) => toInitialTR(it.name) === letter)
    }
    const q = query.trim().toLocaleLowerCase('tr-TR')
    if (q) {
      list = list.filter((it) => {
        const hay = (it.name + ' ' + (it.description ?? '') + ' ' + (it.badges ?? []).join(' ')).toLocaleLowerCase('tr-TR')
        return hay.includes(q)
      })
    }
    return list
  }, [items, letter, query])

  const selected = React.useMemo(() => items.find((x) => x.id === selectedId), [items, selectedId])

  /** Preset uygula */
  const handleApply = () => {
    if (!selected) return
    applyPreset({
      citationStyle: selected.preset.citationStyle,
      preview: selected.preset.preview,
      journalLabel: (selected as any).preset?.journalLabel || selected.name,
    })
    const el = document.getElementById('workspace')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /** Backend yenile (augment'a göre) */
  const handleRefresh = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const remote = await fetchDergiparkJournals(augment)
      if (remote.length > 0) {
        const data = remote.slice().sort(sortTR)
        setItems(data as JournalDirectoryEntry[])
        setSource('backend')
      } else {
        setErrorMsg('Backend yanıtı boş. Offline veya yerel veriye dönüldü.')
      }
    } catch (e: any) {
      setErrorMsg('Backend erişimi başarısız. Offline veya yerel veriye dönüldü.')
    } finally {
      setLoading(false)
    }
  }

  /** JSON içe aktar */
  const fileRef = React.useRef<HTMLInputElement>(null)
  const openImport = () => fileRef.current?.click()
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const text = await f.text()
      const parsed = JSON.parse(text)
      const norm = normalizeImportedEntries(parsed)
      if (norm.length === 0) {
        setErrorMsg('İçe aktarılan JSON uygun formatta değil veya boş.')
        return
      }
      const data = norm.slice().sort(sortTR)
      setItems(data)
      setSource('user-json')
      localStorage.setItem('journalUserImport', JSON.stringify(norm))
      setSelectedId('')
      setLetter('All')
      setQuery('')
    } catch {
      setErrorMsg('JSON okunamadı.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  /** Kullanıcı içe aktarımını temizle */
  const clearUserImport = () => {
    localStorage.removeItem('journalUserImport')
    setSelectedId('')
    setLetter('All')
    setQuery('')
    ;(async () => { await handleRefresh() })()
  }

  /** Filtreleri sıfırla */
  const resetFilters = () => {
    setLetter('All')
    setQuery('')
  }

  return (
    <section aria-labelledby="rules-title" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-black/5 p-2 text-black dark:bg-white/10 dark:text-white">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between w-full gap-3">
          <div>
            <h2 id="journal-directory-title" className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Yazım Kuralları ve Şablonlar (DergiPark)
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Alfabetik harfe göre filtreleyin, arayın ve yazım kurallarını görüntüleyin. İsterseniz preset’i Çalışma Alanına uygulayın.
            </p>
          </div>
          {/* Source badge + actions */}
          <div className="flex items-center gap-2">
            <span
              className={
                'rounded-full px-2.5 py-1 text-xs font-medium ' +
                (source === 'backend'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : source === 'offline'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : source === 'user-json'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                  : 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100')
              }
              title="Veri kaynağı"
            >
              Kaynak: {source === 'backend' ? 'Backend' : source === 'offline' ? 'Offline' : source === 'user-json' ? 'Kullanıcı JSON' : 'Yerel'}
            </span>

            <label className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
              <Sparkles className="h-4 w-4" />
              <span>Zenginleştir (SerpAPI)</span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
                checked={augment}
                onChange={(e) => setAugment(e.target.checked)}
                title="Google sonuçlarıyla eksik kuralları zenginleştir (backend + SERPAPI_KEY gerekir)"
              />
            </label>

            <Button onClick={handleRefresh} title="Backend’ten yeniden yükle">
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenile
            </Button>
            <Button onClick={openImport} title="JSON ile içe aktar">
              <Upload className="mr-2 h-4 w-4" />
              JSON İçe Aktar
            </Button>
            {source === 'user-json' ? (
              <Button onClick={clearUserImport} title="Kullanıcı içe aktarmasını temizle">
                <Eraser className="mr-2 h-4 w-4" />
                Temizle
              </Button>
            ) : null}
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {/* Toolbar: Search + Letters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara: dergi adı, etiket..."
              aria-label="Dergi ara"
              className="pl-8"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto py-1">
              {(['All','#','A','B','C','Ç','D','E','F','G','Ğ','H','I','İ','J','K','L','M','N','O','Ö','P','R','S','Ş','T','U','Ü','V','Y','Z'] as const).map((L) => (
                <button
                  key={L}
                  onClick={() => setLetter(L as LetterFilter)}
                  className={
                    'inline-flex min-w-[2.25rem] items-center justify-center rounded-md px-2 py-1 text-sm transition ' +
                    (letter === L
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                      : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100')
                  }
                  aria-pressed={letter === L}
                >
                  {L}
                </button>
              ))}
            </div>
            <div>
              <Button onClick={resetFilters} title="Filtreleri sıfırla">
                <Eraser className="mr-2 h-4 w-4" />
                Sıfırla
              </Button>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading ? (
          <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
            Liste yükleniyor…
          </div>
        ) : errorMsg ? (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
            {errorMsg}
          </div>
        ) : null}

        {/* Selector + Apply */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Dergi Seç (alfabetik)</label>
            <select
              value={filtered.length > 0 ? selectedId : ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              aria-label="Dergi seç"
            >
              <option value="" disabled>
                {filtered.length > 0 ? 'Bir dergi seçin…' : 'Sonuç yok'}
              </option>
              {filtered.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name}
                </option>
              ))}
            </select>

            <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Toplam: {filtered.length} kayıt</div>

            <div className="mt-3">
              <Button onClick={handleApply} disabled={!selectedId}>
                Preset Uygula
              </Button>
            </div>
          </div>

          {/* Details panel */}
          <div className="sm:col-span-2">
            {!selected ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Henüz bir dergi seçilmedi. Harf filtresi ve arama ile daraltın, ardından listeden seçin.
              </p>
            ) : (
              <div className="space-y-3">
                {(selected as any).sourceUrl ? (
                  <a
                    href={(selected as any).sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm text-neutral-700 underline-offset-4 hover:underline dark:text-neutral-300"
                  >
                    Resmi Rehber
                    <ExternalLink className="ml-1 h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}

                {(selected as any).templateDocxUrl ? (
                  <a
                    href={(selected as any).templateDocxUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md bg-neutral-200 px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                  >
                    Şablon (DOCX)
                  </a>
                ) : (
                  <span className="text-xs text-neutral-500 dark:text-neutral-500">Şablon bağlantısı yok</span>
                )}

                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">
                  <div className="font-medium">Yazım Kuralları</div>
                  {(selected as any).instructionsHtml ? (
                    <div
                      className="prose prose-sm prose-neutral dark:prose-invert mt-1 max-w-none"
                      dangerouslySetInnerHTML={{ __html: (selected as any).instructionsHtml }}
                    />
                  ) : (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Kural metni bulunamadı. Backend veya JSON içe aktarım ile ekleyebilirsiniz.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          Not: Tarama işlemi CORS/robots nedeniyle frontend’te çalışmaz. Sunucunuzda <code>/api/journals</code> endpoint’ini sağlayın. 
          Zenginleştirme anahtarı açıksa istekler <code>?augment=1</code> ile yapılır (SERPAPI_KEY gerekir).
        </p>
      </div>
    </section>
  )
}
