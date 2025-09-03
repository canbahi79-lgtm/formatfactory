/**
 * CitationFormatter.tsx
 * ---------------------------------------------------------
 * Alıntı formatlama bileşeni. Farklı citation stillerini uygular.
 */

import React from 'react'
import { useReferencesStore } from '@/store/references'
import { BookOpen, Copy, Check } from 'lucide-react'

/** CitationFormatter: Alıntı formatlama */
export default function CitationFormatter() {
  const { references } = useReferencesStore()
  const [selectedStyle, setSelectedStyle] = React.useState<'apa' | 'mla' | 'chicago' | 'ieee'>('apa')
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const formatAPA = (ref: any): string => {
    const { author, year, title, type, journal, publisher, pages } = ref
    
    switch (type) {
      case 'book':
        return `${author} (${year}). ${title}. ${publisher}.`
      case 'article':
        return `${author} (${year}). ${title}. ${journal}, ${pages}.`
      case 'chapter':
        return `${author} (${year}). ${title}. In ${publisher}, ${pages}.`
      case 'thesis':
        return `${author} (${year}). ${title}. [Unpublished thesis].`
      case 'web':
        return `${author} (${year}). ${title}. Retrieved from [URL]`
      default:
        return `${author} (${year}). ${title}.`
    }
  }

  const formatMLA = (ref: any): string => {
    const { author, year, title, type, journal, publisher, pages } = ref
    
    switch (type) {
      case 'book':
        return `${author}. ${title}. ${publisher}, ${year}.`
      case 'article':
        return `${author}. "${title}." ${journal}, ${year}, pp. ${pages}.`
      case 'chapter':
        return `${author}. "${title}." ${publisher}, ${year}, pp. ${pages}.`
      case 'thesis':
        return `${author}. "${title}." Diss. ${year}.`
      case 'web':
        return `${author}. "${title}." Web. ${new Date().getFullYear()}.`
      default:
        return `${author}. "${title}." ${year}.`
    }
  }

  const formatChicago = (ref: any): string => {
    const { author, year, title, type, journal, publisher, pages } = ref
    
    switch (type) {
      case 'book':
        return `${author}. ${title}. ${city}: ${publisher}, ${year}.`
      case 'article':
        return `${author}. "${title}." ${journal} ${year}: ${pages}.`
      case 'chapter':
        return `${author}. "${title}." In ${title}, edited by Editor, ${pages}. ${city}: ${publisher}, ${year}.`
      case 'thesis':
        return `${author}. "${title}." PhD diss., ${university}, ${year}.`
      case 'web':
        return `${author}. "${title}." Last modified ${date}. Accessed ${accessDate}. ${url}.`
      default:
        return `${author}. ${title}. ${year}.`
    }
  }

  const formatIEEE = (ref: any): string => {
    const { author, year, title, type, journal, publisher, pages, url } = ref
    
    switch (type) {
      case 'book':
        return `[1] ${author}, ${title}. ${city}: ${publisher}, ${year}.`
      case 'article':
        return `[1] ${author}, "${title}," ${journal}, vol. X, no. X, pp. ${pages}, ${year}.`
      case 'chapter':
        return `[1] ${author}, "${title}," in ${title}, ${city}: ${publisher}, ${year}, pp. ${pages}.`
      case 'thesis':
        return `[1] ${author}, "${title}," Ph.D. dissertation, ${university}, ${city}, ${year}.`
      case 'web':
        return `[1] ${author}, "${title}." ${site}. [Online]. Available: ${url}.`
      default:
        return `[1] ${author}, ${title}, ${year}.`
    }
  }

  const formatReference = (ref: any) => {
    switch (selectedStyle) {
      case 'apa':
        return formatAPA(ref)
      case 'mla':
        return formatMLA(ref)
      case 'chicago':
        return formatChicago(ref)
      case 'ieee':
        return formatIEEE(ref)
      default:
        return formatAPA(ref)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (references.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <BookOpen className="mx-auto h-12 w-12 text-neutral-400" />
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Formatlanacak kaynakça bulunamadı.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Alıntı Formatı
        </h3>
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value as any)}
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="apa">APA</option>
          <option value="mla">MLA</option>
          <option value="chicago">Chicago</option>
          <option value="ieee">IEEE</option>
        </select>
      </div>

      <div className="space-y-3">
        {references.map((ref, index) => {
          const formatted = formatReference(ref)
          const citationId = `${selectedStyle}-${ref.id}`
          
          return (
            <div
              key={ref.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                    {formatted}
                  </p>
                  <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    [{index + 1}]
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(formatted, citationId)}
                  className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  title="Kopyala"
                >
                  {copiedId === citationId ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
        <strong>Not:</strong> Bu formatlar temel kurallara göredir. Tam uyumluluk için derginin resmi yazım kurallarına başvurun.
      </div>
    </div>
  )
}