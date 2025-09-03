/**
 * aiPipeline.ts
 * ---------------------------------------------------------
 * Client-side pipeline state for "intelligent formatting":
 * - Upload manuscript (PDF/DOC/DOCX)
 * - Pick known journal OR upload guideline/template files
 * - Heuristic rules detection (fallback without heavy parsers)
 * - Apply detected preset to the ManuscriptWorkspace (via store)
 *
 * NOTE:
 * Real parsing/AI requires server or extra libs (mammoth/pdfjs/docx). This store
 * keeps a minimal, extensible model for later integrations.
 */

import { create } from 'zustand'
import type { JournalDirectoryEntry } from '@/data/journals'
import { baseJournalEntries } from '@/data/journals'
import type { CitationStyle } from '@/components/home/TemplatePicker'
import type { PreviewStyle } from '@/components/home/PreviewPane'

/** Minimal file meta kept in memory for UI summaries */
export interface FileMeta {
  name: string
  size: number
  type: string
}

/** Heuristic detection result summarizing rules + preview overrides */
export interface DetectionResult {
  citationStyle: CitationStyle
  preview: Partial<PreviewStyle>
  journalLabel?: string
  reason?: string
}

/** Pipeline state shape */
interface AIPipelineState {
  /** Uploaded manuscript file (Word/PDF) */
  manuscript?: FileMeta | null

  /** Journal picked by the user (if from our directory) */
  selectedJournalId: string | null
  selectedJournal?: JournalDirectoryEntry | null

  /** If journal is not found, user uploads these optionally */
  guidelineFile?: FileMeta | null
  templateFile?: FileMeta | null

  /** Detection output (either from known journal or heuristics) */
  detection?: DetectionResult | null
  confirmed: boolean
  processed: boolean

  /** Actions */
  setManuscript: (f: File | null) => void
  selectJournalById: (id: string | null) => void
  setGuideline: (f: File | null) => void
  setTemplate: (f: File | null) => void
  detectFromKnown: () => void
  detectFromUploads: () => void
  confirm: (v: boolean) => void
  reset: () => void
}

/**
 * guessStyleFromName
 * A very lightweight heuristic to guess citation style from file names.
 */
function guessStyleFromName(name: string): CitationStyle {
  const n = name.toLowerCase()
  if (n.includes('ieee')) return 'ieee'
  if (n.includes('acm')) return 'acm'
  if (n.includes('plos')) return 'plos'
  if (n.includes('chicago') || n.includes('turabian')) return 'chicago'
  if (n.includes('mla')) return 'mla'
  // default
  return 'apa'
}

/**
 * defaultPreviewForStyle
 * Provides a reasonable preview baseline for each style (can be refined later).
 */
function defaultPreviewForStyle(style: CitationStyle): Partial<PreviewStyle> {
  switch (style) {
    case 'ieee':
      return { fontFamily: 'Times New Roman', fontSize: 10, lineHeight: 1.15, justify: false, firstLineIndent: '', margin: '2cm' }
    case 'acm':
      return { fontFamily: 'Times New Roman', fontSize: 9, lineHeight: 1.1, justify: true, firstLineIndent: '', margin: '2cm' }
    case 'plos':
      return { fontFamily: 'Arial', fontSize: 11, lineHeight: 1.5, justify: false, firstLineIndent: '', margin: '2.54cm' }
    case 'chicago':
      return { fontFamily: 'Times New Roman', fontSize: 12, lineHeight: 1.5, justify: true, firstLineIndent: '1.27cm', margin: '2.54cm' }
    case 'mla':
      return { fontFamily: 'Times New Roman', fontSize: 12, lineHeight: 2, justify: true, firstLineIndent: '1.27cm', margin: '2.54cm' }
    case 'apa':
    default:
      return { fontFamily: 'Times New Roman', fontSize: 12, lineHeight: 2, justify: true, firstLineIndent: '1.27cm', margin: '2.54cm' }
  }
}

/**
 * toMeta
 * Converts a File into a small in-memory meta for UI.
 */
function toMeta(f: File | null): FileMeta | null {
  return f ? { name: f.name, size: f.size, type: f.type } : null
}

/**
 * useAIPipelineStore
 * Keeps light-weight pipeline state and detection logic.
 */
export const useAIPipelineStore = create<AIPipelineState>((set, get) => ({
  manuscript: null,

  selectedJournalId: null,
  selectedJournal: null,

  guidelineFile: null,
  templateFile: null,

  detection: null,
  confirmed: false,
  processed: false,

  setManuscript: (f) => set({ manuscript: toMeta(f), processed: false }),
  selectJournalById: (id) => {
    if (!id) {
      set({ selectedJournalId: null, selectedJournal: null, detection: null, confirmed: false, processed: false })
      return
    }
    const entry = baseJournalEntries.find((e) => e.id === id) || null
    set({
      selectedJournalId: id,
      selectedJournal: entry,
      detection: null,
      confirmed: false,
      processed: false,
    })
  },
  setGuideline: (f) => set({ guidelineFile: toMeta(f), processed: false }),
  setTemplate: (f) => set({ templateFile: toMeta(f), processed: false }),

  detectFromKnown: () => {
    const entry = get().selectedJournal
    if (!entry) return
    set({
      detection: {
        citationStyle: entry.preset.citationStyle,
        preview: entry.preset.preview,
        journalLabel: entry.preset.journalLabel || entry.name,
        reason: 'Detected from built-in directory preset.',
      },
      confirmed: false,
      processed: false,
    })
  },

  detectFromUploads: () => {
    const g = get().guidelineFile
    const t = get().templateFile
    // Guess style from guideline or template file names
    const style = guessStyleFromName((g?.name || '') + ' ' + (t?.name || ''))
    const preview = defaultPreviewForStyle(style)
    set({
      detection: {
        citationStyle: style,
        preview,
        journalLabel: 'Custom (uploaded guideline/template)',
        reason: 'Heuristic from uploaded file names. Refine with real parsers later.',
      },
      confirmed: false,
      processed: false,
    })
  },

  confirm: (v) => set({ confirmed: v }),
  reset: () =>
    set({
      manuscript: null,
      selectedJournalId: null,
      selectedJournal: null,
      guidelineFile: null,
      templateFile: null,
      detection: null,
      confirmed: false,
      processed: false,
    }),
}))