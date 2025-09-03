/**
 * TemplateMapping.tsx
 * ---------------------------------------------------------
 * Şablon alan eşleme formu: title, authors, abstract alanlarını toplayıp
 * dışarıya data nesnesi döndürür. content metni parent'tan sağlanır.
 */

import React from 'react'

export interface TemplateData {
  title: string
  authors: string
  abstract: string
  content: string
}

interface TemplateMappingProps {
  /** İçerik (paragraflar birleştirilmiş) */
  contentText: string
  onChange?: (data: TemplateData) => void
}

/** TemplateMapping: küçük bir alan eşleme formu */
function DynamicFields({
  value,
  onChange,
}: {
  value: Record<string, string>
  onChange: (v: Record<string, string>) => void
}) {
  const [k, setK] = React.useState('')
  const [v, setV] = React.useState('')

  const add = () => {
    const key = k.trim()
    if (!key) return
    onChange({ ...value, [key]: v })
    setK('')
    setV('')
  }

  const remove = (key: string) => {
    const next = { ...value }
    delete next[key]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={k}
          onChange={(e) => setK(e.target.value)}
          placeholder="alan adı (ör: keywords)"
          className="h-9 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="değer"
          className="h-9 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Ekle
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.keys(value).length === 0 ? (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Alan yok.</span>
        ) : (
          Object.entries(value).map(([key, val]) => (
            <span
              key={key}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
            >
              <strong>{key}</strong>: {val}
              <button
                type="button"
                onClick={() => remove(key)}
                className="rounded bg-neutral-200 px-1 text-[10px] text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100"
                aria-label="Sil"
              >
                Sil
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  )
}

export default function TemplateMapping({ contentText, onChange }: TemplateMappingProps) {
  const [title, setTitle] = React.useState('')
  const [authors, setAuthors] = React.useState('')
  const [abstract, setAbstract] = React.useState('')

  React.useEffect(() => {
    onChange?.({ title, authors, abstract, content: contentText })
  }, [title, authors, abstract, contentText])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Başlık (title)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Makale başlığı"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Yazarlar (authors)</label>
          <input
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="Ad Soyad; Ad Soyad"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Özet (abstract)</label>
        <textarea
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          placeholder="Kısa özet..."
          className="min-h-[80px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Not: DOCX şablonunuzdaki değişkenler {`{title} {authors} {abstract} {content}`} olarak adlandırılmalıdır.
      </p>
    </div>
  )
}