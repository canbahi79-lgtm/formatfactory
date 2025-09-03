/**
 * server/scraper.ts
 * ---------------------------------------------------------
 * DergiPark dergi listesi ve "Yazım Kuralları" scraping (geliştirilmiş).
 * Not: Gerçek sitede anti-bot/robots ve yapı değişimleri olabilir; bakım gerekir.
 * Lütfen robots.txt ve kullanım şartlarına uyun. Üretimde uygun aralıklarla, cache ile çalıştırın.
 */

import { chromium, Browser } from 'playwright'

export interface ScrapedJournal {
  id: string
  name: string
  region: 'tr'
  sourceUrl?: string
  instructionsHtml?: string
  templateDocxUrl?: string
  preset: {
    citationStyle: 'apa' | 'mla' | 'chicago' | 'ieee' | 'acm' | 'plos'
    journalLabel?: string
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

/** Basit heuristik preset üretimi */
function guessPresetFromInstructions(html: string): ScrapedJournal['preset'] {
  const lower = (html || '').toLowerCase()
  let style: ScrapedJournal['preset']['citationStyle'] = 'apa'
  if (lower.includes('ieee')) style = 'ieee'
  else if (lower.includes('acm')) style = 'acm'
  else if (lower.includes('mla')) style = 'mla'
  else if (lower.includes('chicago') || lower.includes('turabian')) style = 'chicago'
  else if (lower.includes('plos')) style = 'plos'

  // Çok temel bir preview
  const usesTimes = lower.includes('times')
  const mentions11 = lower.includes('11')
  const mentions2 = /\b2(\.0+)?\b/.test(lower) || lower.includes('double') || lower.includes('çift')
  const mentionsJustify = lower.includes('iki yana') || lower.includes('justify')
  const mentionsIndent = lower.includes('girinti') || lower.includes('indent')

  return {
    citationStyle: style,
    journalLabel: undefined,
    preview: {
      fontFamily: usesTimes ? 'Times New Roman' : 'Arial',
      fontSize: mentions11 ? 11 : 12,
      lineHeight: mentions2 ? 2 : 1.5,
      justify: mentionsJustify,
      firstLineIndent: mentionsIndent ? '1.27cm' : '',
      margin: '2.54cm',
    },
  }
}

/** Bir sayfadaki olası içerik alanından HTML almayı dener. */
async function extractContentHtml(page: any): Promise<string | undefined> {
  const selectors = ['main', '#content', '.content', '.journal-content', '.page-content', 'article', '#page']
  for (const sel of selectors) {
    try {
      const h = await page.$(sel)
      if (h) {
        const html = await h.innerHTML()
        if (html && html.trim().length > 200) return html
      }
    } catch {}
  }
  // Son çare: body
  try {
    const body = await page.$('body')
    if (body) {
      const html = await body.innerHTML()
      if (html && html.trim().length > 200) return html
    }
  } catch {}
  return undefined
}

/** Kurallar sayfasına giden linki tahmin eder ve URL döndürür (anchor veya rota). */
async function findGuidelinesUrl(page: any): Promise<string | undefined> {
  const candidates = [
    'Yazım Kuralları',
    'Yazar Rehberi',
    'Yazar Kılavuzu',
    'Author Guidelines',
    'For Authors',
    'Instructions',
    'Submission Guidelines',
  ]
  for (const label of candidates) {
    try {
      // anchor link arama
      const anchor = await page.$(`a:has-text("${label}")`)
      if (anchor) {
        const href = await anchor.getAttribute('href')
        if (href) {
          if (href.startsWith('http')) return href
          const u = new URL(page.url())
          return `${u.origin}${href.startsWith('/') ? href : '/' + href}`
        }
      }
      // buton/menü olma ihtimali
      const btn = await page.$(`button:has-text("${label}")`)
      if (btn) {
        await btn.click().catch(() => {})
        // tıklama sonrası rota değişmiş olabilir
        await page.waitForTimeout(500)
        return page.url()
      }
    } catch {}
  }
  return undefined
}

/** Bir dergi detayından kurallar ve şablon linkini çıkarır. */
async function scrapeJournalDetail(url: string, browser: Browser): Promise<Partial<ScrapedJournal>> {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  let targetUrl = url
  try {
    const g = await findGuidelinesUrl(page)
    if (g && g !== url) {
      await page.goto(g, { waitUntil: 'domcontentloaded' })
      targetUrl = g
    }
  } catch {}

  // İçerik HTML
  let instructionsHtml: string | undefined
  try {
    instructionsHtml = await extractContentHtml(page)
  } catch {}

  // DOCX şablon linki
  let templateDocxUrl: string | undefined
  try {
    const link = await page.$('a[href$=".docx"], a[href$=".dotx"], a[href*=".docx?"], a[href*=".dotx?"]')
    if (link) {
      templateDocxUrl = await link.getAttribute('href') || undefined
      if (templateDocxUrl && templateDocxUrl.startsWith('/')) {
        const u = new URL(targetUrl)
        templateDocxUrl = `${u.origin}${templateDocxUrl}`
      }
    }
  } catch {}

  await ctx.close()
  return { instructionsHtml, templateDocxUrl }
}

/** Arama sonuçlarını sayfalayarak gez ve tüm dergi linklerini topla. */
export async function scrapeAllJournals(): Promise<ScrapedJournal[]> {
  const startUrl = 'https://dergipark.org.tr/tr/search?q=*&section=journal'
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(startUrl, { waitUntil: 'domcontentloaded' })

  const results: ScrapedJournal[] = []
  const seen = new Set<string>()
  let pageIndex = 1
  const MAX_PAGES = 200 // daha geniş kapsam için artırıldı

  while (true) {
    // Liste sayfasındaki dergi bağlantıları
    const links = await page.$$eval('a', (as) =>
      as
        .map((a) => ({ href: a.getAttribute('href') || '', text: (a.textContent || '').trim() }))
        .filter((x) => x.href && x.text && x.href.includes('/tr/pub/'))
    )

    for (const l of links) {
      const absUrl = l.href.startsWith('http') ? l.href : `https://dergipark.org.tr${l.href}`
      const id = absUrl.replace(/^https?:\/\//, '')
      if (seen.has(id)) continue
      seen.add(id)

      // Detay sayfasından kurallar ve şablon bul
      let instructionsHtml: string | undefined
      let templateDocxUrl: string | undefined
      try {
        const detail = await scrapeJournalDetail(absUrl, browser)
        instructionsHtml = detail.instructionsHtml
        templateDocxUrl = detail.templateDocxUrl
      } catch {
        // sessiz geç
      }

      const preset = instructionsHtml
        ? guessPresetFromInstructions(instructionsHtml)
        : {
            citationStyle: 'apa' as const,
            preview: {
              fontFamily: 'Times New Roman',
              fontSize: 12,
              lineHeight: 1.5,
              justify: true,
              firstLineIndent: '1.27cm',
              margin: '2.54cm',
            },
          }

      results.push({
        id,
        name: l.text,
        region: 'tr',
        sourceUrl: absUrl,
        instructionsHtml,
        templateDocxUrl,
        preset,
      })

      // nazik davran: çok hızlı tarama yapma
      await page.waitForTimeout(150)
    }

    // Sonraki sayfa?
    const next = await page.$('a[rel="next"], a:has-text("Sonraki"), a:has-text("Next")')
    if (!next) break
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), next.click()])
    pageIndex += 1
    if (pageIndex > MAX_PAGES) break
    await page.waitForTimeout(200)
  }

  await ctx.close()
  await browser.close()
  return results
}
