/**
 * ManuscriptWorkspace.tsx
 * ---------------------------------------------------------
 * Makale çalışma alanı bileşeni. Metin düzenleme, şablon uygulama ve önizleme.
 */

import React from 'react'
import { Wand2, FileText, Download, Eye, Settings } from 'lucide-react'
import TemplatePicker, { JournalTemplateKey, CitationStyle } from '@/components/home/TemplatePicker'
import PreviewPane, { PreviewStyle } from '@/components/home/PreviewPane'

/** ManuscriptWorkspace: Makale çalışma alanı */
export default function ManuscriptWorkspace() {
  const [content, setContent] = React.useState('')
  const [journal, setJournal] = React.useState<JournalTemplateKey>('nature')
  const [style, setStyle] = React.useState<CitationStyle>('apa')
  const [showPreview, setShowPreview] = React.useState(false)

  const previewStyle: PreviewStyle = {
    fontFamily: 'Times New Roman',
    fontSize: 12,
    lineHeight: 1.5,
    margin: '2.54cm',
    justify: true,
    firstLineIndent: '1.27cm',
  }

  const paragraphs = content.split('\n\n').filter(p => p.trim())

  const handleExport = (format: 'html' | 'txt') => {
    if (format === 'html') {
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Formatted Manuscript</title>
  <style>
    body { font-family: ${previewStyle.fontFamily}; font-size: ${previewStyle.fontSize}pt; line-height: ${previewStyle.lineHeight}; margin: ${previewStyle.margin}; }
    p { text-align: ${previewStyle.justify ? 'justify' : 'left'}; text-indent: ${previewStyle.firstLineIndent}; margin-bottom: 12pt; }
  </style>
</head>
<body>
  ${paragraphs.map(p => `<p>${p}</p>`).join('\n')}
</body>
</html>`
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'manuscript.html'
      a.click()
    } else {
      const text = paragraphs.join('\n\n')
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'manuscript.txt'
      a.click()
    }
  }

  return (
    <section id="workspace" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-black/5 p-2 text-black dark:bg-white/10 dark:text-white">
          <Wand2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Çalışma Alanı
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Makalenizi düzenleyin, şablon uygulayın ve dışa aktarın.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sol: Editor */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Metin Düzenleyici
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-2 rounded-md bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Düzenle' : 'Önizle'}
                </button>
              </div>
            </div>

            {showPreview ? (
              <div className="min-h-[400px] rounded-md border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <PreviewPane
                  paragraphs={paragraphs}
                  style={previewStyle}
                  meta={{ journal, citationStyle: style }}
                />
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Makale metninizi buraya yazın veya yapıştırın. Paragrafları boş satırla ayırın..."
                className="min-h-[400px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            )}

            <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
              İpucu: Paragrafları ayırmak için boş satır kullanın.
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Dışa Aktar
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('html')}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                <Download className="h-4 w-4" />
                HTML İndir
              </button>
              <button
                onClick={() => handleExport('txt')}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                <FileText className="h-4 w-4" />
                Metin İndir
              </button>
            </div>
          </div>
        </div>

        {/* Sağ: Settings */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-neutral-600" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Biçimlendirme Ayarları
              </h3>
            </div>

            <TemplatePicker
              value={{ journal, style }}
              onJournalChange={setJournal}
              onStyleChange={setStyle}
            />

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Yazı Tipi
                </label>
                <select
                  value={previewStyle.fontFamily}
                  onChange={(e) => previewStyle.fontFamily = e.target.value}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Calibri">Calibri</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Punto Boyutu
                </label>
                <select
                  value={previewStyle.fontSize}
                  onChange={(e) => previewStyle.fontSize = Number(e.target.value)}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value="10">10 pt</option>
                  <option value="11">11 pt</option>
                  <option value="12">12 pt</option>
                  <option value="14">14 pt</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Satır Aralığı
                </label>
                <select
                  value={previewStyle.lineHeight}
                  onChange={(e) => previewStyle.lineHeight = Number(e.target.value)}
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value="1">1.0</option>
                  <option value="1.15">1.15</option>
                  <option value="1.5">1.5</option>
                  <option value="2">2.0</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={previewStyle.justify}
                    onChange={(e) => previewStyle.justify = e.target.checked}
                    className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
                  />
                  İki yana yasla
                </label>

                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={!!previewStyle.firstLineIndent}
                    onChange={(e) => previewStyle.firstLineIndent = e.target.checked ? '1.27cm' : ''}
                    className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
                  />
                  İlk satır girinti
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              İstatistikler
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-950">
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {paragraphs.length}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Paragraf
                </div>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-950">
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {content.split(/\s+/).filter(w => w).length}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Kelime
                </div>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-950">
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {content.length}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Karakter
                </div>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-950">
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {Math.round(content.length / 1800)}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Sayfa (tahmini)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}