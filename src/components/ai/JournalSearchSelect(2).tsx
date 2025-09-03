/**
 * JournalSearchSelect.tsx
 * ---------------------------------------------------------
 * Lightweight searchable select over baseJournalEntries.
 * Emits selected journal id (or null).
 */

import React from 'react'
import { baseJournalEntries, type JournalDirectoryEntry } from '@/data/journals'

/** Props for JournalSearchSelect */
interface JournalSearchSelectProps {
  value: string | null
  onChange: (id: string | null) => void
}

/**
 * JournalSearchSelect
 * Search by name/badges/desc, pick entry, or clear selection.
 */
export default function JournalSearchSelect({ value, onChange }: JournalSearchSelectProps) {
  const [q, setQ] = React.useState('')

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return baseJournalEntries
    return baseJournalEntries.filter((e: JournalDirectoryEntry) => {
      const hay = (e.name + ' ' + (e.description || '') + ' ' + (e.badges || []).join(' ')).toLowerCase()
      return hay.includes(query)
    })
  }, [q])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Dergi ara..."
          className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          aria-label="Dergi ara"
        />
        <button
          onClick={() => {
            setQ('')
            onChange(null)
          }}
          className="shrink-0 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          title="Seçimi temizle"
        >
          Temizle
        </button>
      </div>

      <div className="max-h-56 overflow-auto rounded-md border border-neutral-200 dark:border-neutral-800">
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {filtered.map((e) => (
            <li key={e.id}>
              <button
                onClick={() => onChange(e.id)}
                className={
                  'flex w-full items-start gap-3 p-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ' +
                  (value === e.id ? 'bg-neutral-50 dark:bg-neutral-800/50' : '')
                }
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{e.name}</div>
                  {e.description ? (
                    <div className="mt-0.5 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">{e.description}</div>
                  ) : null}
                  {e.badges && e.badges.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {e.badges.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}