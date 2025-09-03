/**
 * server/scripts/scrape-save.ts
 * ---------------------------------------------------------
 * One-shot scraper runner to crawl DergiPark journals and save results into a JSON file.
 * Usage:
 *   1) npx playwright install --with-deps
 *   2) npx tsx server/scripts/scrape-save.ts
 *
 * Output:
 *   - Writes a JSON file under uploads/out/dergipark-all-YYYY-MM-DD-HH-mm.json
 *   - Logs basic statistics (count, with/without rules, with template links)
 *
 * Notes:
 *   - Respects the heuristics in server/scraper.ts to infer a basic preset.
 *   - Make sure your environment has proper dependencies for Playwright.
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

// Import the crawler from server/scraper.ts
import { scrapeAllJournals } from '../scraper'

/** Returns timestamp like 2025-09-02-12-45 */
function stamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}-${pad(d.getMinutes())}`
}

async function main() {
  const start = Date.now()
  console.log('Crawling DergiPark journals... This may take a while.')
  const items = await scrapeAllJournals()
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)

  // Ensure output directory
  const OUT_DIR = join(process.cwd(), 'uploads', 'out')
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

  const outPath = join(OUT_DIR, `dergipark-all-${stamp()}.json`)
  writeFileSync(outPath, JSON.stringify(items, null, 2), 'utf-8')

  const total = items.length
  const withRules = items.filter((x) => (x as any).instructionsHtml && String((x as any).instructionsHtml).trim().length > 0).length
  const withTemplate = items.filter((x) => (x as any).templateDocxUrl).length

  console.log('--- Done ---')
  console.log('File:', outPath)
  console.log('Total journals:', total)
  console.log('With rules (instructionsHtml):', withRules)
  console.log('With template (docx):', withTemplate)
  console.log('Elapsed:', elapsed, 'sec')
}

main().catch((e) => {
  console.error('Scrape failed:', e)
  process.exit(1)
})