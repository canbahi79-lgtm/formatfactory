/**
 * GrammarPolishSection.tsx
 * ---------------------------------------------------------
 * AI-like grammar, spelling, and style fixer for Turkish/English texts.
 * Provides a left editor, configurable fixers, journal/style selection for preview,
 * and right-side Before/After preview with export and checkout (300 TL WhatsApp order).
 */

import React from 'react'
import TemplatePicker, { type CitationStyle, type JournalTemplateKey } from '@/components/home/TemplatePicker'
import PreviewPane, { type PreviewStyle } from '@/components/home/PreviewPane'
import AIServiceCheckout from '@/components/payment/AIServiceCheckout'

/** Minimal UI fallbacks (shadcn if present) */
let Textarea: React.ComponentType<React.TextareaHTMLAttributes<HTMLTextAreaElement>>
let Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>
let Input: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>
try {
  // @ts-ignore
  Textarea = require('@/components/ui/textarea').Textarea
  // @ts-ignore
  Button = require('@/components/ui/button').Button
  // @ts-ignore
  Input = require('@/components/ui/input').Input
} catch {
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

/** Utility: split into paragraphs by blank lines. */
function toParagraphs(text: string): string[] {
  return text.replace(/\r\n/g, '\n').split(/\n\s*\n/g).map(p => p.trim()).filter(Boolean)
}

/** Utility: uppercase first letter of sentences (simple heuristic, TR locale-aware). */
function sentenceCaseTR(text: string): string {
  const parts = text.split(/([.!?]+["”']?\s+)/g) // keep delimiters
  for (let i = 0; i < parts.length; i += 2) {
    const sentence = parts[i]?.trimStart()
    if (!sentence) continue
    // Find first letter index
    const idx = sentence.search(/[A-Za-zÇĞİIÖŞÜçğıiöşü]/)
    if (idx >= 0) {
      const before = sentence.slice(0, idx)
      const ch = sentence.charAt(idx).toLocaleUpperCase('tr-TR')
      const rest = sentence.slice(idx + 1)
      parts[i] = before + ch + rest
    } else {
      parts[i] = sentence
    }
  }
  return parts.join('')
}

/** Fixer: normalize spaces (collapse multiple, trim around punctuation). */
function normalizeSpaces(text: string): { out: string; count: number } {
  let count = 0
  let out = text
  const before = out
  // Collapse multiple spaces
  out = out.replace(/[ \t]{2,}/g, (m) => {
    count++
    return ' '
  })
  // Remove spaces before punctuation
  out = out.replace(/\s+([,;:.!?])/g, (_m, p1) => {
    count++
    return p1
  })
  // Ensure single space after punctuation (except end of line)
  out = out.replace(/([,;:.!?])(?=\S)/g, (_m, p1) => {
    count++
    return p1 + ' '
  })
  // Trim trailing spaces on lines
  out = out.replace(/[ \t]+\n/g, () => {
    count++
    return '\n'
  })
  // If nothing changed, count should be 0
  if (out === before) count = 0
  return { out, count }
}

/** Fixer: smart quotes. Converts straight quotes to curly ones. */
function smartQuotes(text: string): { out: string; count: number } {
  const before = text
  let out = text
  // Double quotes
  out = out
    .replace(/(^|[\s(])"(?=\S)/g, '$1“') // opening
    .replace(/"($|[\s).,!?:;])/g, '”$1') // closing
  // Single quotes
  out = out
    .replace(/(^|[\s(])'(?=\S)/g, '$1‘')
    .replace(/'($|[\s).,!?:;])/g, '’$1')
  const count = out === before ? 0 : (out.match(/[“”‘’]/g) || []).length
  return { out, count }
}

/** Fixer: sentence case (TR). */
function sentenceCaseFix(text: string): { out: string; count: number } {
  const before = text
  const out = sentenceCaseTR(text)
  // Rough count: number of lowercase -> uppercase conversions (approx.)
  const count = out === before ? 0 : (out.match(/[.!?]\s+[A-ZÇĞİIÖŞÜ]/g) || []).length
  return { out, count }
}

/** Fixer: simple Turkish spellings map (very small curated list). */
const TR_SPELL_MAP: Array<{ from: RegExp; to: string }> = [
  { from: /\bmalesef\b/gi, to: 'maalesef' },
  { from: /\bherşey\b/gi, to: 'her şey' },
  { from: /\bbirşey\b/gi, to: 'bir şey' },
  { from: /\byada\b/gi, to: 'ya da' },
  { from: /\byanlız\b/gi, to: 'yalnız' },
  { from: /\bçoçuk\b/gi, to: 'çocuk' },
  { from: /\bşöyleki\b/gi, to: 'şöyle ki' },
  { from: /\byanısıra\b/gi, to: 'yanı sıra' },
]

function turkishSpellFix(text: string): { out: string; count: number } {
  let out = text
  let count = 0
  for (const rule of TR_SPELL_MAP) {
    out = out.replace(rule.from, (m) => {
      count++
      // Preserve case if original was capitalized
      const isCap = /^[A-ZÇĞİIÖŞÜ]/.test(m)
      return isCap ? rule.to.charAt(0).toLocaleUpperCase('tr-TR') + rule.to.slice(1) : rule.to
    })
  }
  return { out, count }
}

/** Build printable HTML (reused style) */
function serializePreviewDocument(htmlInner: string, style: PreviewStyle): string {
  const { fontFamily, fontSize, lineHeight, margin, justify, firstLineIndent } = style
  const textAlign = justify ? 'justify' : 'left'
  const indent = firstLineIndent ? `text-indent: ${firstLineIndent};` : ''
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AI Grammar Output</title>
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
      .paper { max-width: 800px; margin: 0 auto; }
      .paper p { text-align: ${textAlign}; ${indent} margin: 0 0 12pt 0; }
      .paper h1, .paper h2, .paper h3 { margin: 0 0 10pt 0; font-weight: 700; }
      .small { font-size: 10pt; color: #666; }
    </style>
  </head>
  <body>
    <div class="paper">${htmlInner}</div>
  </body>
</html>`
}

/** Component: AI Grammar Section */
export default function GrammarPolishSection() {
  const [language, setLanguage] = React.useState<'tr' | 'en'>('tr')
  const [raw, setRaw] = React.useState<string>('')

  const [journal, setJournal] = React.useState<JournalTemplateKey>('nature')
  const [style, setStyle] = React.useState<CitationStyle>('apa')

  const [previewStyle, setPreviewStyle] = React.useState<PreviewStyle>({
    fontFamily: 'Times New Roman',
    fontSize: 12,
    lineHeight: 1.5,
    margin: '2.54cm',
    justify: true,
    firstLineIndent: '1.27cm',
  })

  const [opts, setOpts] = React.useState({
    normalizeSpaces: true,
    smartQuotes: true,
    sentenceCase: true,
    spelling: true,
  })

  const [fixed, setFixed] = React.useState<string>('')
  const [summary, setSummary] = React.useState<{ [k: string]: number }>({})
  const beforeRef = React.useRef<HTMLDivElement>(null)
  const afterRef = React.useRef<HTMLDivElement>(null)

  /** Apply fixers pipeline */
  const handleFix = () => {
    let text = raw
    const s: { [k: string]: number } = {}

    if (opts.normalizeSpaces) {
      const { out, count } = normalizeSpaces(text)
      text = out
      s['Boşluk/Noktalama'] = count
    }
    if (opts.smartQuotes) {
      const { out, count } = smartQuotes(text)
      text = out
      s['Akıllı tırnak'] = count
    }
    if (opts.sentenceCase) {
      const { out, count } = sentenceCaseFix(text)
      text = out
      s['Cümle başı büyük'] = count
    }
    if (opts.spelling && language === 'tr') {
      const { out, count } = turkishSpellFix(text)
      text = out
      s['Yazım önerileri (TR)'] = count
    }

    setFixed(text)
    setSummary(s)
  }

  /** Export: print */
  const exportPrint = () => {
    if (!afterRef.current) return
    const html = serializePreviewDocument(afterRef.current.innerHTML, previewStyle)
    const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 200)
  }

  /** Export: download HTML */
  const exportHTML = () => {
    if (!afterRef.current) return
    const html = serializePreviewDocument(afterRef.current.innerHTML, previewStyle)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ai-grammar-output.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  /** Copy to clipboard */
  const copyAfter = async () => {
    try {
      await navigator.clipboard.writeText(fixed || '')
      alert('Düzeltilmiş metin kopyalandı.')
    } catch {
      alert('Kopyalama başarısız.')
    }
  }

  const paragraphsBefore = toParagraphs(raw)
  const paragraphsAfter = toParagraphs(fixed || raw)

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          AI Yazım & Dilbilgisi Kontrolü (300 TL)
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Metninizi içeri yapıştırın, düzeltmeleri uygulayın, önizleyin ve isterseniz 300 TL karşılığında profesyonel
          hizmeti WhatsApp üzerinden sipariş edin. Dergi şablonu/atıf seçimleri önizleme ve çıktı stilini etkiler.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Editor + options */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Dil</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'tr' | 'en')}
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <TemplatePicker
                value={{ journal, style }}
                onJournalChange={setJournal}
                onStyleChange={setStyle}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Yazı Tipi</label>
              <Input
                value={previewStyle.fontFamily}
                onChange={(e) => setPreviewStyle((p) => ({ ...p, fontFamily: e.target.value }))}
                placeholder="Times New Roman"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Punto (pt)</label>
              <Input
                type="number"
                min={8}
                max={18}
                value={previewStyle.fontSize}
                onChange={(e) => setPreviewStyle((p) => ({ ...p, fontSize: Number(e.target.value || 12) }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Satır Aralığı</label>
              <Input
                type="number"
                step="0.05"
                min={1}
                max={3}
                value={previewStyle.lineHeight}
                onChange={(e) => setPreviewStyle((p) => ({ ...p, lineHeight: Number(e.target.value || 1.5) }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Kenar Boşluğu</label>
              <Input
                value={previewStyle.margin}
                onChange={(e) => setPreviewStyle((p) => ({ ...p, margin: e.target.value }))}
                placeholder="2.54cm"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={opts.normalizeSpaces}
                onChange={(e) => setOpts((o) => ({ ...o, normalizeSpaces: e.target.checked }))}
              />
              Boşluk/Noktalama
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={opts.smartQuotes}
                onChange={(e) => setOpts((o) => ({ ...o, smartQuotes: e.target.checked }))}
              />
              Akıllı Tırnaklar
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={opts.sentenceCase}
                onChange={(e) => setOpts((o) => ({ ...o, sentenceCase: e.target.checked }))}
              />
              Cümle Başı Büyük
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={opts.spelling}
                onChange={(e) => setOpts((o) => ({ ...o, spelling: e.target.checked }))}
              />
              Yazım Önerileri (TR)
            </label>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-semibold text-neutral-900 dark:text-neutral-100">Metin</label>
            <Textarea
              placeholder="Metninizi buraya yapıştırın…"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Metin boş satırlarla paragraflara ayrılır. Düzeltmeler yerel olarak uygulanır.
            </div>
            <div className="flex gap-2">
              <Button onClick={handleFix}>Kontrol Et ve Düzelt</Button>
            </div>
          </div>
        </div>

        {/* Right: Before/After + export + checkout */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Öncesi / Sonrası</h3>
              <div className="flex gap-2">
                <Button onClick={copyAfter}>Sonrasını Kopyala</Button>
                <Button onClick={exportPrint}>Yazdır / PDF</Button>
                <Button onClick={exportHTML}>HTML İndir</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">Öncesi</div>
                <div ref={beforeRef}>
                  <PreviewPane
                    paragraphs={paragraphsBefore}
                    style={{ ...previewStyle }}
                    meta={{ journal, citationStyle: style }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">Sonrası</div>
                <div ref={afterRef}>
                  <PreviewPane
                    paragraphs={paragraphsAfter}
                    style={{ ...previewStyle }}
                    meta={{ journal, citationStyle: style }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">
              <div className="font-medium">Uygulanan Düzeltmeler</div>
              {Object.keys(summary).length === 0 ? (
                <div className="text-xs text-neutral-600 dark:text-neutral-400">Henüz bir düzeltme uygulanmadı.</div>
              ) : (
                <ul className="mt-1 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  {Object.entries(summary).map(([k, v]) => (
                    <li key={k} className="rounded bg-white px-2 py-1 dark:bg-neutral-900">
                      <span className="font-medium">{k}:</span> {v}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Checkout: fixed 300 TL */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Profesyonel Kontrol Siparişi (300 TL)
            </h3>
            <AIServiceCheckout
              serviceLabel="AI Yazım & Dilbilgisi Kontrolü"
              fixedPrice={300}
              journal={journal}
              citationStyle={style}
            />
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              Not: Bu servis, metin üzerinde stil ve yazım odaklı düzeltmeler uygular. Akademik uygunluk, atıf
              doğruluğu ve konu uzmanlığı gerektiren içerikler için ek danışmanlık gerekebilir.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
