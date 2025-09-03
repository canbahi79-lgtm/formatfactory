/**
 * PreviewPane.tsx
 * ---------------------------------------------------------
 * Renders a paper-like preview of formatted paragraphs according to the provided styles.
 */

import React from 'react'
import type { JournalTemplateKey, CitationStyle } from './TemplatePicker'

/** Controls the visual style of the preview paper. */
export interface PreviewStyle {
  /** Font family name, e.g., 'Times New Roman' */
  fontFamily: string
  /** Font size in pt */
  fontSize: number
  /** Line height factor */
  lineHeight: number
  /** CSS margin for print/page */
  margin: string
  /** Justify paragraphs */
  justify: boolean
  /** First-line indent (e.g., '1.27cm'), empty for none */
  firstLineIndent?: string
}

interface PreviewPaneProps {
  /** Paragraphs to render */
  paragraphs: string[]
  /** Styling controls */
  style: PreviewStyle
  /** Small metadata shown in header */
  meta: {
    journal: JournalTemplateKey
    citationStyle: CitationStyle
    /** Optional human-readable journal label from directory presets */
    journalLabel?: string
  }
}

/**
 * PreviewPane
 * A forwardRef component that exposes the rendered HTML to parent for export.
 */
const PreviewPane = React.forwardRef<HTMLDivElement, PreviewPaneProps>(function PreviewPane(
  { paragraphs, style, meta },
  ref
) {
  const { fontFamily, fontSize, lineHeight, justify, firstLineIndent } = style
  const textAlign = justify ? 'justify' : 'left'
  const journalName = meta.journalLabel ? meta.journalLabel : meta.journal.toUpperCase()

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          Dergi: <strong>{journalName}</strong> • Atıf: <strong>{meta.citationStyle.toUpperCase()}</strong>
        </div>
      </div>

      <div
        ref={ref}
        className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
      >
        {/* Paper body */}
        <div
          className="mx-auto min-h-[240px] max-w-[800px] p-6 sm:p-8"
          style={{
            fontFamily,
            fontSize: `${fontSize}pt`,
            lineHeight,
            color: '#0a0a0a',
          }}
        >
          {paragraphs.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Önizleme için sol tarafa metin ekleyin.</p>
          ) : (
            paragraphs.map((p, i) => (
              <p
                key={i}
                style={{
                  textAlign,
                  textIndent: firstLineIndent || undefined,
                  margin: '0 0 12pt 0',
                }}
              >
                {p}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  )
})

export default PreviewPane
export type { PreviewStyle }
