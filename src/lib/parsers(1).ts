/**
 * parsers.ts
 * ---------------------------------------------------------
 * Client-side parsers for DOCX and PDF:
 * - DOCX: mammoth to HTML, then extract paragraphs
 * - PDF: pdfjs-dist to text, then split to paragraphs
 */

import mammoth from 'mammoth'
// pdfjs-dist v4 exports
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist'

/**
 * Initializes pdf.js worker from a public CDN.
 * In production, host your own worker for stability/version lock.
 */
function ensurePdfWorker() {
  try {
    // Set to a known CDN version; adjust if you lock a specific version.
    // You can also bundle the worker yourself and set to a local path.
    // @ts-ignore
    if (!GlobalWorkerOptions.workerSrc) {
      GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js'
    }
  } catch {
    // ignore
  }
}

/**
 * Splits raw text into paragraphs by blank lines or large gaps.
 */
export function splitToParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\u00A0/g, ' ')
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean)
}

/**
 * Extracts <p> text content from HTML string.
 */
function htmlToParagraphs(html: string): string[] {
  const container = document.createElement('div')
  container.innerHTML = html
  const ps = Array.from(container.querySelectorAll('p'))
  const paras = ps.map((p) => p.textContent?.trim() || '').filter(Boolean)
  if (paras.length > 0) return paras
  // Fallback to entire text
  const full = container.textContent || ''
  return splitToParagraphs(full)
}

/**
 * Parses a DOCX File into HTML and paragraphs.
 */
export async function parseDocxToHtmlAndParagraphs(file: File): Promise<{ html: string; paragraphs: string[] }> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  const html = result.value || ''
  const paragraphs = htmlToParagraphs(html)
  return { html, paragraphs }
}

/**
 * Parses a PDF File into paragraphs using pdfjs-dist text extraction.
 */
export async function parsePdfToParagraphs(file: File): Promise<string[]> {
  ensurePdfWorker()
  const data = new Uint8Array(await file.arrayBuffer())
  const loadingTask = getDocument({ data })
  const pdf: PDFDocumentProxy = await loadingTask.promise
  let fullText = ''
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    const strings = content.items
      // @ts-ignore - text items have 'str'
      .map((it) => (typeof it.str === 'string' ? it.str : ''))
      .filter(Boolean)
    fullText += strings.join(' ') + '\n\n'
  }
  return splitToParagraphs(fullText)
}

/**
 * Parses a manuscript file (DOCX/PDF) into paragraphs.
 * Returns best-effort paragraphs and a hint of detected type.
 */
export async function parseManuscript(file: File): Promise<{ kind: 'docx' | 'pdf'; paragraphs: string[]; html?: string }> {
  const name = file.name.toLowerCase()
  const isDocx = name.endsWith('.docx')
  const isPdf = name.endsWith('.pdf')
  if (isDocx) {
    const { html, paragraphs } = await parseDocxToHtmlAndParagraphs(file)
    return { kind: 'docx', paragraphs, html }
  }
  if (isPdf) {
    const paragraphs = await parsePdfToParagraphs(file)
    return { kind: 'pdf', paragraphs }
  }
  // Try content type fallback
  if (file.type.includes('word')) {
    const { html, paragraphs } = await parseDocxToHtmlAndParagraphs(file)
    return { kind: 'docx', paragraphs, html }
  }
  if (file.type.includes('pdf')) {
    const paragraphs = await parsePdfToParagraphs(file)
    return { kind: 'pdf', paragraphs }
  }
  // Unknown -> read as PDF for last resort
  const paragraphs = await parsePdfToParagraphs(file)
  return { kind: 'pdf', paragraphs }
}
