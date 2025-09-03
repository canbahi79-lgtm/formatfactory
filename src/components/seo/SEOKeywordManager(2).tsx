/**
 * SEOKeywordManager.tsx
 * ---------------------------------------------------------
 * UI for adding/importing SEO keywords, toggling robots index, and generating robots.txt / sitemap.xml content.
 * This helps operators maintain on-page SEO within a SPA environment.
 */

import React from 'react'
import { useSEOStore } from '@/store/seo'

let Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>
let Input: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>

try {
  // @ts-ignore
  Button = require('../ui/button').Button
  // @ts-ignore
  Input = require('../ui/input').Input
} catch {
  Button = (props) => (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 ' +
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

/** Copies given text into clipboard with user feedback */
function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => alert('Panoya kopyalandı. Sunucunuza dosya olarak ekleyin.'))
    .catch(() => alert('Panoya kopyalanamadı.'))
}

/**
 * Generates a minimal robots.txt content.
 */
function makeRobotsTxt(allowIndex: boolean) {
  return [
    'User-agent: *',
    allowIndex ? 'Disallow:' : 'Disallow: /',
    'Sitemap: https://example.com/sitemap.xml',
    '',
  ].join('\n')
}

/**
 * Generates a minimal sitemap.xml (single-page hash router limitations apply).
 * Replace example URLs with your deployed URLs (prefer non-hash routes on production).
 */
function makeSitemapXml() {
  const base = 'https://example.com/'
  const now = new Date().toISOString()
  // You can extend this list as needed
  const urls = [base, base + '#/']
  const items = urls
    .map(
      (u) => `
  <url>
    <loc>${u}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`.trim()
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`
}

/**
 * SEOKeywordManager
 * Lets operators manage keywords and export robots/sitemap boilerplate.
 */
export default function SEOKeywordManager() {
  const { keywords, addKeyword, importKeywords, allowIndex, setAllowIndex } = useSEOStore()
  const [input, setInput] = React.useState('')

  const fileRef = React.useRef<HTMLInputElement>(null)
  const handlePick = () => fileRef.current?.click()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const text = await f.text()
      const json = JSON.parse(text)
      if (Array.isArray(json)) {
        importKeywords(json.map((x) => String(x)))
        alert(`İçe aktarıldı: ${json.length} anahtar kelime.`)
      } else if (Array.isArray(json.keywords)) {
        importKeywords(json.keywords.map((x: unknown) => String(x)))
        alert(`İçe aktarıldı: ${json.keywords.length} anahtar kelime.`)
      } else {
        alert('Geçersiz JSON biçimi. Dizi veya { keywords: [] } bekleniyor.')
      }
    } catch {
      alert('Geçersiz JSON.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">SEO Ayarları</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Anahtar kelimeleri yönetin, robots.txt ve sitemap.xml üretin. Üretilen dosyaları canlı sunucunuza ekleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Keywords box */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Anahtar Kelime Ekle
          </label>
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="örn: dergipark yazım kuralları" />
            <Button
              onClick={() => {
                if (input.trim()) {
                  addKeyword(input)
                  setInput('')
                }
              }}
            >
              Ekle
            </Button>
            <Button onClick={handlePick} title="JSON içe aktar">JSON İçe Aktar</Button>
            <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} className="hidden" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
              >
                {k}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
              <input
                type="checkbox"
                checked={allowIndex}
                onChange={(e) => setAllowIndex(e.target.checked)}
                className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
              />
              Arama motorları indekslesin (robots: index, follow)
            </label>
          </div>
        </div>

        {/* Robots/Sitemap */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">robots.txt ve sitemap.xml</h3>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            Bu içerikleri panoya kopyalayıp sunucunuzda gerçek dosya olarak barındırın.
          </p>

          <div className="mt-3 flex gap-2">
            <Button onClick={() => copyToClipboard(makeRobotsTxt(allowIndex))}>robots.txt Kopyala</Button>
            <Button onClick={() => copyToClipboard(makeSitemapXml())}>sitemap.xml Kopyala</Button>
          </div>
        </div>
      </div>
    </section>
  )
}