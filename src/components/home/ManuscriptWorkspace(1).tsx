/**
 * ManuscriptWorkspace.tsx
 * ---------------------------------------------------------
 * A two-column workspace where users paste manuscript text,
 * choose a journal template and citation style, see live preview, and export.
 * Now integrates with a global store to apply presets from the Journal Directory.
 */

import React from 'react'
import TemplatePicker, { JournalTemplateKey, CitationStyle } from './TemplatePicker'
import PreviewPane, { PreviewStyle } from './PreviewPane'
import { useWorkspaceStore } from '@/store/workspace'

/** UI components (shadcn UI if available; otherwise fallback) */
let Textarea: React.ComponentType<React.TextareaHTMLAttributes<HTMLTextAreaElement>>
let Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>
let Input: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>

try {
  // @ts-ignore - dynamic imports if shadcn UI exists
  Textarea = require('../ui/textarea').Textarea
  // @ts-ignore
  Button = require('../ui/button').Button
  // @ts-ignore
  Input = require('../ui/input').Input
} catch {
  /** Fallback UI components with accessible styles */
  Textarea = (props) => (
    <textarea
      {...props}
      className={
        'min-h-[220px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ' +
        (props.className ?? '')
      }
    />
  )
  Button = (props) => (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 ' +
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

/**
 * getDefaultsForTemplate
 * Maps journal template to reasonable defaults for preview styling.
 */
function getDefaultsForTemplate(t: JournalTemplateKey): { style: CitationStyle; preview: Partial<PreviewStyle> } {
  switch (t) {
    case 'ieee':
      return { style: 'ieee', preview: { fontFamily: 'Times New Roman', fontSize: 11, lineHeight: 1.15, justify: false } }
    case 'acm':
      return { style: 'acm', preview: { fontFamily: 'Times New Roman', fontSize: 9, lineHeight: 1.1, justify: true } }
    case 'nature':
      return { style: 'nature' as CitationStyle, preview: { fontFamily: 'Georgia', fontSize: 12, lineHeight: 1.5, justify: true } }
    case 'elsevier':
      return { style: 'apa', preview: { fontFamily: 'Times New Roman', fontSize: 12, lineHeight: 2, justify: true } }
    case 'springer':
      return { style: 'chicago', preview: { fontFamily: 'Times New Roman', fontSize: 10, lineHeight: 1.2, justify: true } }
    case 'plos':
      return { style: 'plos', preview: { fontFamily: 'Arial', fontSize: 11, lineHeight: 1.5, justify: false } }
    default:
      return { style: 'apa', preview: { fontFamily: 'Times New Roman', fontSize: 12, lineHeight: 2, justify: true } }
  }
}

/**
 * formatToParagraphs
 * Splits raw text into paragraphs by blank lines.
 */
function formatToParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean)
}

/**
 * serializePreviewDocument
 * Creates a simple HTML document string for print/export based on the preview styles.
 */
function serializePreviewDocument(htmlInner: string, style: PreviewStyle): string {
  const { fontFamily, fontSize, lineHeight, margin, justify, firstLineIndent } = style
  const textAlign = justify ? 'justify' : 'left'
  const indent = firstLineIndent ? `text-indent: ${firstLineIndent};` : ''
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Formatted Manuscript</title>
    <style>
      @page { margin: ${margin}; }
      body {
        margin: ${margin};
        font-family: ${fontFamily}, serif;
        font-size: ${fontSize}pt;
        line-height: ${lineHeight};
        color: #0a0a0a;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .paper {
        max-width: 800px;
        margin: 0 auto;
      }
      .paper p {
        text-align: ${textAlign};
        ${indent}
        margin: 0 0 12pt 0;
      }
      .paper h1, .paper h2, .paper h3 {
        margin: 0 0 10pt 0;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="paper">${htmlInner}</div>
  </body>
</html>`
}

/**
 * ManuscriptWorkspace
 * Provides text input, template selection, formatting controls, preview, and export actions.
 * Reacts to presets from the directory via Zustand store.
 */
export default function ManuscriptWorkspace() {
  const [rawText, setRawText] = React.useState<string>('')
  const [journal, setJournal] = React.useState<JournalTemplateKey>('nature')
  const [style, setStyle] = React.useState<CitationStyle>(getDefaultsForTemplate('nature').style)
  const [journalLabel, setJournalLabel] = React.useState<string | undefined>(undefined)

  const defaultPreview = getDefaultsForTemplate('nature').preview
  const [previewStyle, setPreviewStyle] = React.useState<PreviewStyle>({
    fontFamily: defaultPreview.fontFamily || 'Times New Roman',
    fontSize: defaultPreview.fontSize || 12,
    lineHeight: defaultPreview.lineHeight || 1.5,
    margin: '2.54cm',
    justify: defaultPreview.justify ?? true,
    firstLineIndent: '1.27cm',
  })

  const previewRef = React.useRef<HTMLDivElement>(null)

  // Listen to directory presets
  const incomingPreset = useWorkspaceStore((s) => s.incomingPreset)
  const presetCounter = useWorkspaceStore((s) => s.presetCounter)

  React.useEffect(() => {
    if (!incomingPreset) return
    // Switch to "custom" label for directory-driven presets
    setJournal('custom')
    if (incomingPreset.citationStyle) setStyle(incomingPreset.citationStyle)
    if (incomingPreset.preset) {
      // no-op (kept for compatibility)
    }
    if (incomingPreset.preview) {
      setPreviewStyle((prev) => ({ ...prev, ...incomingPreset.preview }))
    }
    setJournalLabel(incomingPreset.journalLabel)
  }, [incomingPreset, presetCounter])

  /** Applies template defaults when journal changes (TemplatePicker path). */
  const handleJournalChange = (j: JournalTemplateKey) => {
    setJournal(j)
    const d = getDefaultsForTemplate(j)
    setStyle(d.style)
    setPreviewStyle((prev) => ({ ...prev, ...d.preview }))
    setJournalLabel(undefined)
  }

  /** Handles export to print (PDF via browser print). */
  const handlePrint = () => {
    if (!previewRef.current) return
    const html = serializePreviewDocument(previewRef.current.innerHTML, previewStyle)
    const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => {
      w.print()
    }, 200)
  }

  /** Handles export to HTML file. */
  const handleDownloadHTML = () => {
    if (!previewRef.current) return
    const html = serializePreviewDocument(previewRef.current.innerHTML, previewStyle)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted-manuscript.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Listen to incoming text from pipeline and inject into editor
  const incomingText = useWorkspaceStore((s) => s.incomingText)
  const textCounter = useWorkspaceStore((s) => s.textCounter)

  React.useEffect(() => {
    if (incomingText) setRawText(incomingText)
  }, [incomingText, textCounter])

  const paragraphs = formatToParagraphs(rawText)

  return (
    <section id="workspace" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100">Çalışma Alanı</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Input and quick tips */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="manuscript" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Metin Girişi
            </label>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Boş satır ile paragrafları ayırın</div>
          </div>

          {Textarea ? (
            <Textarea
              id="manuscript"
              placeholder="Makale metnini buraya yapıştırın..."
              className="mt-3"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Yazı Tipi</label>
              {Input ? (
                <Input
                  value={previewStyle.fontFamily}
                  onChange={(e) => setPreviewStyle((p) => ({ ...p, fontFamily: e.target.value }))}
                  placeholder="Times New Roman"
                />
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Punto (pt)</label>
              {Input ? (
                <Input
                  type="number"
                  min={8}
                  max={18}
                  value={previewStyle.fontSize}
                  onChange={(e) => setPreviewStyle((p) => ({ ...p, fontSize: Number(e.target.value || 12) }))}
                />
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Satır Aralığı</label>
              {Input ? (
                <Input
                  type="number"
                  step="0.05"
                  min={1}
                  max={3}
                  value={previewStyle.lineHeight}
                  onChange={(e) => setPreviewStyle((p) => ({ ...p, lineHeight: Number(e.target.value || 1.5) }))}
                />
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Kenar Boşluğu</label>
              {Input ? (
                <Input
                  value={previewStyle.margin}
                  onChange={(e) => setPreviewStyle((p) => ({ ...p, margin: e.target.value }))}
                  placeholder="2.54cm"
                />
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={previewStyle.justify}
                onChange={(e) => setPreviewStyle((p) => ({ ...p, justify: e.target.checked }))}
              />
              İki yana yasla
            </label>

            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={!!previewStyle.firstLineIndent}
                onChange={(e) => setPreviewStyle((p) => ({ ...p, firstLineIndent: e.target.checked ? '1.27cm' : '' }))}
              />
              İlk satır girinti
            </label>
          </div>
        </div>

        {/* Right: Template picker + Preview + Export */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <TemplatePicker value={{ journal, style }} onJournalChange={handleJournalChange} onStyleChange={setStyle} />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Önizleme</h3>
              <div className="flex gap-2">
                {Button ? (
                  <Button onClick={handlePrint} className="whitespace-nowrap">
                    Yazdır / PDF
                  </Button>
                ) : null}
                {Button ? (
                  <Button onClick={handleDownloadHTML} className="whitespace-nowrap">
                    HTML İndir
                  </Button>
                ) : null}
              </div>
            </div>

            <PreviewPane
              ref={previewRef}
              paragraphs={paragraphs}
              style={previewStyle}
              meta={{
                journal,
                citationStyle: style,
                journalLabel,
              }}
            />

            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              Not: Bu demo tarayıcı içinde çalışır. Gerçek dergi şablonları ve kaynakça dönüştürme için
              sunucu/servis entegrasyonu önerilir.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
