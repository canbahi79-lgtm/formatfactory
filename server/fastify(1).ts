/**
 * server/fastify.ts
 * ---------------------------------------------------------
 * Fastify API server with:
 * - CORS
 * - Multipart uploads to ./uploads
 * - Static file serving via GET /files/:name
 * - BullMQ queue for conversion jobs (DOCX + Puppeteer PDF)
 * - /api/jobs/convert and /api/jobs/status/:id
 * - /api/journals (scraper) + optional SerpAPI augmentation via ?augment=1
 * - /api/ai-tools (cron-aggregated list)
 *
 * Environment variables:
 * - PORT=3000
 * - HOST=0.0.0.0
 * - BASE_PUBLIC_URL=https://api.example.com (used to build absolute file URLs)
 * - REDIS_URL=redis://:password@host:port
 * - SERPAPI_KEY=... (optional, enables Google results augmentation)
 *
 * Notes:
 * - Uses writeFileSync for portability (no Bun dependency).
 * - Puppeteer can be started with --no-sandbox if PUPPETEER_NO_SANDBOX=1 is set.
 */

import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, basename } from 'path'
import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq'
import IORedis from 'ioredis'
import { scrapeAllJournals } from './scraper'

// DOCX generation
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

// Puppeteer for real PDF output
import puppeteer from 'puppeteer'

// Basic config
const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || '0.0.0.0'
const BASE_PUBLIC_URL = process.env.BASE_PUBLIC_URL || `http://localhost:${PORT}`
const SERPAPI_KEY = process.env.SERPAPI_KEY || ''

const UPLOAD_DIR = process.env.FILES_DIR || join(process.cwd(), 'uploads')
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true })
const OUT_DIR = join(UPLOAD_DIR, 'out')
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

// Fastify app
const app = Fastify({ logger: true })
await app.register(cors, { origin: true })
await app.register(multipart)

// Health check
app.get('/api/health', async () => ({
  ok: true,
  basePublicUrl: BASE_PUBLIC_URL,
  serpapiEnabled: Boolean(SERPAPI_KEY),
  time: new Date().toISOString(),
}))

// Simple file server (not optimized, but fine for demo)
app.get('/files/:name', async (req, reply) => {
  const name = (req.params as any).name
  const filePath = join(UPLOAD_DIR, name)
  try {
    const data = readFileSync(filePath)
    return reply.type('application/octet-stream').send(data)
  } catch {
    // maybe it's in out/
    try {
      const data = readFileSync(join(OUT_DIR, name))
      return reply.type('application/octet-stream').send(data)
    } catch {
      return reply.status(404).send({ error: 'not_found' })
    }
  }
})

// Upload endpoint (multipart)
app.post('/api/upload', async (req, reply) => {
  const mp = await req.file()
  if (!mp) return reply.status(400).send({ error: 'no_file' })
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${mp.filename}`
  const dest = join(UPLOAD_DIR, id)
  await new Promise<void>((res, rej) => {
    const ws = createWriteStream(dest)
    mp.file.pipe(ws)
    ws.on('finish', () => res())
    ws.on('error', (e) => rej(e))
  })
  return reply.send({
    id,
    url: `${BASE_PUBLIC_URL}/files/${encodeURIComponent(basename(dest))}`,
    name: mp.filename,
    size: (mp.file as any).truncated ? undefined : (mp.file as any).bytesRead,
    type: mp.mimetype,
  })
})

// Redis + Queue
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const connection = new IORedis(redisUrl)
const queueName = 'convert'
const queue = new Queue(queueName, { connection })
const queueEvents = new QueueEvents(queueName, { connection })

/**
 * Returns printable HTML from plain text content.
 */
function buildPrintableHtml(contentText: string) {
  const paragraphs = contentText.split(/\n\s*\n/g).map((p) => p.trim()).filter(Boolean)
  const inner = paragraphs.map((p) => `<p>${p.replace(/</g, '&lt;')}</p>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
  @page{margin:2.54cm}
  body{margin:2.54cm;font-family:"Times New Roman",serif;font-size:12pt;line-height:1.5;color:#0a0a0a}
  .paper p{text-align:justify;margin:0 0 12pt 0;text-indent:1.27cm}
  </style></head><body><div class="paper">${inner}</div></body></html>`
}

/**
 * Puppeteer launcher with optional --no-sandbox for restricted environments.
 */
async function launchBrowser() {
  const noSandbox = process.env.PUPPETEER_NO_SANDBOX === '1'
  const browser = await puppeteer.launch({
    headless: true,
    args: noSandbox ? ['--no-sandbox', '--disable-setuid-sandbox'] : undefined,
  } as any)
  return browser
}

// Worker to create DOCX and PDF
const worker = new Worker<{ contentText: string; mapping?: Record<string, any>; templateUrl?: string }>(
  queueName,
  async (job) => {
    const { contentText, mapping = {}, templateUrl } = job.data
    const jobId = job.id
    const baseName = `job-${jobId}`
    const outDocxPath = join(OUT_DIR, `${baseName}.docx`)
    const outPdfPath = join(OUT_DIR, `${baseName}.pdf`)

    // DOCX
    let docxBlobBytes: Uint8Array
    if (templateUrl) {
      // Fetch template from URL
      const resp = await fetch(templateUrl)
      if (!resp.ok) throw new Error('template fetch failed')
      const ab = await resp.arrayBuffer()
      const zip = new PizZip(ab)
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
      doc.setData({ content: contentText, ...mapping })
      doc.render()
      const out = doc.getZip().generate({ type: 'uint8array' })
      docxBlobBytes = out
    } else {
      // Plain DOCX from content text
      const paragraphs = contentText.split(/\n\s*\n/g).map((p) => p.trim()).filter(Boolean)
      const runs = paragraphs.map(
        (p) =>
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: p, font: 'Times New Roman', size: 24 /* 12pt */ })],
          }),
      )
      const doc = new Document({
        sections: [{ properties: {}, children: runs.length ? runs : [new Paragraph('')] }],
      })
      const blob = await Packer.toBuffer(doc)
      docxBlobBytes = new Uint8Array(blob)
    }

    // Save DOCX (portable)
    writeFileSync(outDocxPath, Buffer.from(docxBlobBytes))

    // PDF via Puppeteer
    const browser = await launchBrowser()
    try {
      const page = await browser.newPage()
      const html = buildPrintableHtml(contentText)
      await page.setContent(html, { waitUntil: 'domcontentloaded' })
      const pdf = await page.pdf({ format: 'A4', printBackground: true })
      writeFileSync(outPdfPath, pdf)
    } finally {
      await browser.close()
    }

    const docxUrl = `${BASE_PUBLIC_URL}/files/${encodeURIComponent(basename(outDocxPath))}`
    const pdfUrl = `${BASE_PUBLIC_URL}/files/${encodeURIComponent(basename(outPdfPath))}`
    return { docxUrl, pdfUrl }
  },
  { connection },
)

worker.on('completed', (job, ret) => {
  app.log.info({ jobId: job.id, ret }, 'job completed')
})
worker.on('failed', (job, err) => {
  app.log.error({ jobId: job?.id, err }, 'job failed')
})

// Create convert job
app.post('/api/jobs/convert', async (req, reply) => {
  const body = (req.body || {}) as { contentText?: string; mapping?: Record<string, unknown>; templateUrl?: string }
  if (!body.contentText || typeof body.contentText !== 'string') {
    return reply.status(400).send({ error: 'contentText required' })
  }
  const job = await queue.add(
    'convert',
    { contentText: body.contentText, mapping: body.mapping || {}, templateUrl: body.templateUrl },
    { removeOnComplete: 100, removeOnFail: 100 } as JobsOptions,
  )
  return reply.send({ jobId: job.id })
})

app.get('/api/jobs/status/:id', async (req, reply) => {
  const id = (req.params as any).id
  const job = await queue.getJob(id)
  if (!job) return reply.status(404).send({ jobId: id, status: 'failed', progress: 0, error: 'not_found' })
  const state = await job.getState()
  const progress = (job.progress as number) || 0
  if (state === 'completed') {
    const ret = job.returnvalue as any
    return reply.send({ jobId: id, status: 'succeeded', progress: 100, ...ret })
  }
  if (state === 'failed') {
    return reply.send({ jobId: id, status: 'failed', progress: 0, error: job.failedReason || 'failed' })
  }
  return reply.send({ jobId: id, status: state === 'waiting' ? 'queued' : 'processing', progress })
})

/**
 * Lightweight HTML extraction from a remote page.
 * Note: For production, sanitize content server-side if needed.
 */
async function fetchPageHtml(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JournalBot/1.0)' } as any })
    if (!res.ok) return undefined
    const text = await res.text()
    // Quick sanity check to avoid empty boilerplate
    if (text && text.length > 500) return text
  } catch {
    // ignore
  }
  return undefined
}

/**
 * Tries to augment journals that lack instructionsHtml using SerpAPI Google search.
 * - Only runs if SERPAPI_KEY is present.
 * - For each journal without instructionsHtml, searches "<name> yazım kuralları".
 * - Fetches the first viable result's HTML as instructionsHtml.
 */
async function augmentWithSerpAPI(items: any[]): Promise<any[]> {
  if (!SERPAPI_KEY) return items
  const out = [...items]
  for (let i = 0; i < out.length; i++) {
    const j = out[i] || {}
    if ((j.instructionsHtml && String(j.instructionsHtml).trim().length > 200) || !j.name) continue

    const query = `${j.name} yazım kuralları`
    try {
      const url =
        `https://serpapi.com/search.json?engine=google&hl=tr&gl=tr&num=5&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}`
      const res = await fetch(url)
      if (!res.ok) continue
      const json: any = await res.json()
      const candidates: string[] = []
      const organic: any[] = Array.isArray(json.organic_results) ? json.organic_results : []
      for (const r of organic) {
        const link = r?.link as string | undefined
        if (!link) continue
        // Prefer official-looking or guideline keywords
        const lower = link.toLowerCase()
        const isGuidelines = /guideline|yazar|author|kurall|rules|instructions|submission/.test(lower)
        if (isGuidelines) candidates.push(link)
        else candidates.push(link)
      }
      // Fallback to search metadata if no organic
      if (candidates.length === 0 && json?.search_metadata?.google_url) {
        candidates.push(json.search_metadata.google_url)
      }

      // Try fetching the first viable candidate
      for (const cand of candidates.slice(0, 3)) {
        const html = await fetchPageHtml(cand)
        if (html) {
          j.instructionsHtml = html
          // Basic preset heuristic (keep existing if present)
          j.preset = j.preset || {
            citationStyle: 'apa',
            preview: {
              fontFamily: 'Times New Roman',
              fontSize: 12,
              lineHeight: 1.5,
              justify: true,
              firstLineIndent: '1.27cm',
              margin: '2.54cm',
            },
          }
          break
        }
      }
    } catch {
      // ignore and continue
    }
    // Be nice with rate limits
    await new Promise((r) => setTimeout(r, 200))
  }
  return out
}

// Scraper API (reused) + optional augmentation
let journalsCache: { at: number; items: any[] } = { at: 0, items: [] }
app.get('/api/journals', async (req, reply) => {
  const now = Date.now()
  const augment = (req.query as any)?.augment === '1' || (req.query as any)?.augment === 'true'
  const cacheValid = journalsCache.items.length > 0 && now - journalsCache.at < 12 * 60 * 60 * 1000

  if (cacheValid && !augment) {
    return reply.send(journalsCache.items)
  }

  try {
    const items = await scrapeAllJournals()
    journalsCache = { at: now, items }

    // Augment if requested and SERPAPI_KEY is present
    if (augment && SERPAPI_KEY) {
      const augmented = await augmentWithSerpAPI(items)
      return reply.send(augmented)
    }

    return reply.send(items)
  } catch (e) {
    req.log.error(e)
    return reply.status(500).send({ error: 'scrape_failed' })
  }
})

// AI tools cron aggregator
let aiToolsCache: { at: number; items: any[] } = { at: 0, items: [] }
/** Tries to aggregate AI tools from curated sources; can be expanded later. */
async function refreshAITools() {
  const defaults = [
    { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com/', category: 'Chat', tags: ['nlp', 'qa'] },
    { id: 'claude', name: 'Claude', url: 'https://claude.ai', category: 'Chat', tags: ['nlp', 'qa'] },
    { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai', category: 'Search', tags: ['web', 'qa'] },
    { id: 'gemini', name: 'Google Gemini', url: 'https://gemini.google.com', category: 'Chat' },
    { id: 'huggingface-spaces', name: 'Hugging Face Spaces', url: 'https://huggingface.co/spaces', category: 'Models', tags: ['demo'] },
  ]
  const merged = defaults
  aiToolsCache = { at: Date.now(), items: merged }
}
setInterval(refreshAITools, 6 * 60 * 60 * 1000)
await refreshAITools()

// Start server
app.listen({ port: PORT, host: HOST }).then(() => {
  app.log.info(`API listening on ${BASE_PUBLIC_URL}`)
  if (!process.env.BASE_PUBLIC_URL) {
    app.log.warn('BASE_PUBLIC_URL not set; using default http://localhost:3000')
  }
  if (!SERPAPI_KEY) {
    app.log.info('SERPAPI_KEY not set; /api/journals?augment=1 will be skipped.')
  }
})
