
/**
 * JournalDirectory.tsx
 * ---------------------------------------------------------
 * Dergi şablon dizini bileşeni. Backend'den veri çeker, TR alfabesi sıralar,
 * arama ve filtreleme özellikleri sunar. Seçilen derginin preset'ini
 * çalışma alanına uygular.
 */

import React, { useState, useEffect } from 'react'
import { BookOpen, ExternalLink, Search, RefreshCw, Upload, Eraser } from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspace'

// Türk alfabesi harfleri
const TURKISH_ALPHABET = ['All', 'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'] as const

type TurkishLetter = typeof TURKISH_ALPHABET[number]

// Dergi veri tipi
interface JournalData {
  id: string
  name: string
  region: 'tr' | 'intl'
  description?: string
  badges?: string[]
  sourceUrl?: string
  preset: {
    citationStyle: 'apa' | 'mla' | 'chicago' | 'ieee' | 'acm' | 'plos'
    preview: {
      fontFamily?: string
      fontSize?: number
      lineHeight?: number
      justify?: boolean
      firstLineIndent?: string
      margin?: string
    }
  }
}

/**
 * JournalDirectory bileşeni
 */
export default function JournalDirectory() {
  const [journals, setJournals] = useState<JournalData[]>([])
  const [filteredJournals, setFilteredJournals] = useState<JournalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<TurkishLetter>('All')
  const [selectedJournal, setSelectedJournal] = useState<JournalData | null>(null)
  
  const applyPreset = useWorkspaceStore((s) => s.applyPreset)

  // Backend'den dergi verilerini çek
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/journals')
        if (!response.ok) {
          throw new Error('Dergi verileri yüklenemedi')
        }
        const data = await response.json()
        setJournals(data)
        setFilteredJournals(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
      } finally {
        setLoading(false)
      }
    }

    fetchJournals()
  }, [])

  // Arama ve filtreleme
  useEffect(() => {
    let filtered = journals

    // Harf filtresi
    if (selectedLetter !== 'All') {
      filtered = filtered.filter(journal => {
        const firstChar = journal.name.charAt(0).toLocaleUpperCase('tr-TR')
        return firstChar === selectedLetter
      })
    }

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(journal => 
        journal.name.toLowerCase().includes(query) ||
        journal.description?.toLowerCase().includes(query) ||
        journal.badges?.some(badge => badge.toLowerCase().includes(query))
      )
    }

    setFilteredJournals(filtered)
  }, [journals, searchQuery, selectedLetter])

  // TR alfabesine göre sıralama
  const sortedJournals = [...filteredJournals].sort((a, b) => 
    a.name.localeCompare(b.name, 'tr-TR')
  )

  // Preset uygulama
  const handleApplyPreset = (journal: JournalData) => {
    applyPreset({
      citationStyle: journal.preset.citationStyle,
      preview: journal.preset.preview,
      journalLabel: journal.name,
    })
    
    // Çalışma alanına scroll et
    const workspaceElement = document.getElementById('workspace')
    if (workspaceElement) {
      workspaceElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Yenile
  const handleRefresh = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/journals')
      if (!response.ok) {
        throw new Error('Dergi verileri yüklenemedi')
      }
      const data = await response.json()
      setJournals(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Dergiler yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
        <div className="font-medium">Hata</div>
        <div>{error}</div>
        <button
          onClick={handleRefresh}
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
        >
          <RefreshCw className="h-4 w-4" />
          Yeniden Dene
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Arama ve Filtreler */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Dergi ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white pl-10 pr-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </button>
        </div>
      </div>

      {/* Harf Filtreleri */}
      <div className="flex items-center justify-between">
        <div className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto py-1">
          {TURKISH_ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`inline-flex min-w-[2.25rem] items-center justify-center rounded-md px-2 py-1 text-sm transition ${
                selectedLetter === letter
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100'
              }`}
              aria-pressed={selectedLetter === letter}
            >
              {letter}
            </button>
          ))}
        </div>
        
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {filteredJournals.length} dergi bulundu
        </div>
      </div>

      {/* Dergi Listesi */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedJournals.map((journal) => (
          <div
            key={journal.id}
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {journal.name}
                  </h3>
                  {journal.description && (
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {journal.description}
                    </p>
                  )}
                  
                  {journal.badges && journal.badges.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {journal.badges.map((badge) => (
                        <span
                          key={badge}
                          className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {journal.sourceUrl && (
                  <a
                    href={journal.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                    aria-label="Dergi sitesini aç"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {journal.region === 'tr' ? 'Türkçe' : 'Uluslararası'}
                </div>
                
                <button
                  onClick={() => handleApplyPreset(journal)}
                  className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Preset Uygula
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJournals.length === 0 && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
          <BookOpen className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-2">Arama kriterlerinize uygun dergi bulunamadı.</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedLetter('All')
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            <Eraser className="h-4 w-4" />
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  )
}
