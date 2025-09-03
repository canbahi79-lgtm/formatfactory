/**
 * journals.ts
 * ---------------------------------------------------------
 * Static journal template dataset and types. Designed to be extended via JSON import.
 * Provides a curated set of TR (DergiPark/TR Dizin style) and international examples.
 */

import type { CitationStyle } from '@/components/home/TemplatePicker'
import type { PreviewStyle } from '@/components/home/PreviewPane'

/**
 * Region classification for templates.
 */
export type JournalRegion = 'tr' | 'intl'

/**
 * Minimal template preset that can be applied to the workspace.
 */
export interface TemplatePreset {
  /** Suggested citation style */
  citationStyle: CitationStyle
  /** Preview overrides (font, size, etc.) */
  preview: Partial<PreviewStyle>
  /** Optional human-readable label for journal (shown in preview meta) */
  journalLabel?: string
}

/**
 * A directory entry representing a journal or a platform guideline.
 */
export interface JournalDirectoryEntry {
  id: string
  name: string
  region: JournalRegion
  description?: string
  /** Tags or quick hints (e.g., "DergiPark", "TR Dizin", "IEEE") */
  badges?: string[]
  /** Source documentation link */
  sourceUrl?: string
  /** Recommended preset for quick apply */
  preset: TemplatePreset
}

/**
 * Base templates bundled with app. You can extend this by importing JSON in the directory UI.
 * NOTE: These presets are reasonable approximations for demo purposes; verify with official guides.
 */
export const baseJournalEntries: JournalDirectoryEntry[] = [
  // Türkiye / DergiPark style examples (generic)
  {
    id: 'dergipark-generic',
    name: 'DergiPark (Genel Yaklaşım)',
    region: 'tr',
    badges: ['DergiPark', 'TR'],
    sourceUrl: 'https://dergipark.org.tr/',
    description:
      'Genel DergiPark dergi rehberlerine uygun, Times New Roman, 12 pt, 1.5–2 satır aralığı ile tipik bir akademik düzen.',
    instructionsHtml:
      '<ul><li>Yazı tipi: Times New Roman</li><li>Punto: 12 pt</li><li>Satır aralığı: 1.5–2</li><li>İki yana yaslı</li></ul>',
    templateDocxUrl: undefined,
    preset: {
      citationStyle: 'apa',
      journalLabel: 'DergiPark (Genel)',
      preview: {
        fontFamily: 'Times New Roman',
        fontSize: 12,
        lineHeight: 1.5,
        justify: true,
        firstLineIndent: '1.27cm',
        margin: '2.54cm',
      },
    },
  },
  {
    id: 'tr-dizin-generic',
    name: 'TR Dizin (Genel Kurallar)',
    region: 'tr',
    badges: ['TR Dizin', 'TR'],
    sourceUrl: 'https://trdizin.gov.tr/',
    description:
      'TR Dizin kapsamındaki dergilerde sık görülen metin özellikleri: Times 12 pt, 1.5 satır aralığı, iki yana yaslı.',
    preset: {
      citationStyle: 'apa',
      journalLabel: 'TR Dizin (Genel)',
      preview: {
        fontFamily: 'Times New Roman',
        fontSize: 12,
        lineHeight: 1.5,
        justify: true,
        firstLineIndent: '1.27cm',
        margin: '2.54cm',
      },
    },
  },

  // International popular templates
  {
    id: 'ieee-standard',
    name: 'IEEE Standard',
    region: 'intl',
    badges: ['IEEE', 'International'],
    sourceUrl: 'https://journals.ieeeauthorcenter.ieee.org/',
    description: 'IEEE makale formatına uygun tipik ayarlar. Numerik atıf (köşeli parantez).',
    preset: {
      citationStyle: 'ieee',
      journalLabel: 'IEEE',
      preview: {
        fontFamily: 'Times New Roman',
        fontSize: 10,
        lineHeight: 1.15,
        justify: false,
        firstLineIndent: '',
        margin: '2cm',
      },
    },
  },
  {
    id: 'acm-sigconf',
    name: 'ACM SIGCONF (approx.)',
    region: 'intl',
    badges: ['ACM', 'International'],
    sourceUrl: 'https://www.acm.org/publications/taps/word-template-workflow',
    description: 'ACM SIGCONF tabanlı bir ön ayar (yaklaşık).',
    preset: {
      citationStyle: 'acm',
      journalLabel: 'ACM (SIGCONF)',
      preview: {
        fontFamily: 'Times New Roman',
        fontSize: 9,
        lineHeight: 1.1,
        justify: true,
        firstLineIndent: '',
        margin: '2cm',
      },
    },
  },
  {
    id: 'elsevier-generic',
    name: 'Elsevier (Generic)',
    region: 'intl',
    badges: ['Elsevier', 'International'],
    sourceUrl: 'https://www.elsevier.com/authors/policies-and-guidelines',
    description: 'Elsevier dergilerinde yaygın Times 12 pt, çift aralık yaklaşımı.',
    preset: {
      citationStyle: 'apa',
      journalLabel: 'Elsevier',
      preview: {
        fontFamily: 'Times New Roman',
        fontSize: 12,
        lineHeight: 2,
        justify: true,
        firstLineIndent: '1.27cm',
        margin: '2.54cm',
      },
    },
  },
  {
    id: 'springer-nature-generic',
    name: 'Springer Nature (Generic)',
    region: 'intl',
    badges: ['Springer', 'International'],
    sourceUrl: 'https://www.springer.com/gp/authors-editors',
    description: 'Springer Nature genel yazım rehberine yakın ayarlar.',
    preset: {
      citationStyle: 'chicago',
      journalLabel: 'Springer Nature',
      preview: {
        fontFamily: 'Times New Roman',
        fontSize: 10,
        lineHeight: 1.2,
        justify: true,
        firstLineIndent: '1cm',
        margin: '2.54cm',
      },
    },
  },
  {
    id: 'plos-one',
    name: 'PLOS ONE (approx.)',
    region: 'intl',
    badges: ['PLOS', 'International'],
    sourceUrl: 'https://journals.plos.org/plosone/s/submission-guidelines',
    description: 'PLOS ONE için okuyabilirlik odaklı ayarlar (yaklaşık).',
    preset: {
      citationStyle: 'plos',
      journalLabel: 'PLOS ONE',
      preview: {
        fontFamily: 'Arial',
        fontSize: 11,
        lineHeight: 1.5,
        justify: false,
        firstLineIndent: '',
        margin: '2.54cm',
      },
    },
  },
]

/**
 * Validates and normalizes external entries imported from JSON.
 */
export function normalizeImportedEntries(raw: unknown): JournalDirectoryEntry[] {
  if (!Array.isArray(raw)) return []
  const safe: JournalDirectoryEntry[] = []
  for (const item of raw) {
    try {
      const id = String(item.id ?? '')
      const name = String(item.name ?? '')
      const region = (item.region === 'tr' ? 'tr' : item.region === 'intl' ? 'intl' : 'intl') as JournalRegion
      const preset = item.preset ?? {}
      const citationStyle = String(preset.citationStyle ?? 'apa') as CitationStyle
      const preview = preset.preview ?? {}
      const journalLabel = preset.journalLabel ? String(preset.journalLabel) : undefined

      if (!id || !name) continue

      const entry: JournalDirectoryEntry = {
        id,
        name,
        region,
        badges: Array.isArray(item.badges) ? item.badges.map((b: unknown) => String(b)) : [],
        sourceUrl: item.sourceUrl ? String(item.sourceUrl) : undefined,
        description: item.description ? String(item.description) : undefined,
        preset: {
          citationStyle,
          journalLabel,
          preview: {
            fontFamily: typeof preview.fontFamily === 'string' ? preview.fontFamily : undefined,
            fontSize: typeof preview.fontSize === 'number' ? preview.fontSize : undefined,
            lineHeight: typeof preview.lineHeight === 'number' ? preview.lineHeight : undefined,
            justify: typeof preview.justify === 'boolean' ? preview.justify : undefined,
            firstLineIndent: typeof preview.firstLineIndent === 'string' ? preview.firstLineIndent : undefined,
            margin: typeof preview.margin === 'string' ? preview.margin : undefined,
          },
        },
      }
      safe.push(entry)
    } catch {
      // Skip invalid item
    }
  }
  return safe
}
