/**
 * IntelligentFormatterSection.tsx
 * ---------------------------------------------------------
 * "Akıllı Biçimlendirici" bölümü:
 * - Yüklenen yönerge/şablon dosyalarından (opsiyonel) otomatik algılama
 * - Dergi dizininden tahmin (yerel örneklerle)
 * - Algılanan atıf stili + önizleme değerlerinin net gösterimi
 * - "Çalışma Alanına Uygula" butonu
 * - Sunucu tarafı dönüştürme (kuyruk + Puppeteer PDF), ilerleme ve indirme linkleri
 */

import React from 'react'
import { useAIPipelineStore } from '@/store/aiPipeline'
import { baseJournalEntries } from '@/data/journals'
import { useWorkspaceStore } from '@/store/workspace'
import TemplateMapping, { type TemplateData } from '@/components/home/TemplateMapping'
import { parseManuscript } from '@/lib/parsers'
import { createConvertJob, getJobStatus } from '@/services/api'
import { Wand2, FileText, Rocket } from 'lucide-react'

/** UI fallbacks (shadcn varsa onu, yoksa basit stiller) */
let Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>
let Select: React.ComponentType<React.SelectHTMLAttributes<HTMLSelectElement>>
try {
  // @ts-ignore
  Button = require('@/components/ui/button').Button
  Select = (props) => (
    <select
      {...props}
      className={
        'h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ' +
        (props.className ?? '')
      }
    />
  )
} catch {
  Button = (props) => (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 ' +
        (props.className ?? '')
      }
    />
  )
  Select = (props) => (
    <select
      {...props}
      className={
        'h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ' +
        (props.className ?? '')
      }
    />
  )
}

/**
 * buildPrintableHtml
 * Creates a simple HTML preview for print/PDF. Client-side only (the server uses its own builder).
 */
function buildPrintableHtml(paragraphs: string[], preview: Partial<{ fontFamily: string; fontSize: number; lineHeight: number; justify: boolean; firstLineIndent: string; margin: string }>) {
  const {
    fontFamily = 'Times New Roman',
    fontSize = 12,
    lineHeight = 1.5,
    justify = true,
    firstLineIndent = '1.27cm',
    margin = '2.54cm',
  } = preview || {}
  const textAlign = justify ? 'justify' : 'left'
  const indent = firstLineIndent ? `text-indent:${firstLineIndent};` : ''
  const inner = paragraphs.map((p) => `<p>${p.replace(/</g, '&lt;')}</p>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
@page{margin:${margin}}
body{margin:${margin};font-family:${fontFamily},serif;font-size:${fontSize}pt;line-height:${lineHeight};color:#0a0a0a;}
.paper p{text-align:${textAlign};${indent}margin:0 0 12pt 0;}
</style></head><body><div class="paper">${inner}</div></body></html>`
}

/**
 * IntelligentFormatterSection
 * Highlights the detection flow and provides server-side conversion.
 */
export default function IntelligentFormatterSection() {
  const pipeline = useAIPipelineStore()
  const applyPreset = useWorkspaceStore((s) => s.applyPreset)

  // Local UI state
  const [selectedJournalId, setSelectedJournalId] = React.useState<string>('')
  const [mapping, setMapping] = React.useState<TemplateData>({
    title: '',
    authors: '',
    abstract: '',
    affiliations: '',
    keywords: '',
    tables: '',
    figures: '',
    content: '',
    custom: {},
  })

  // Server job state
  const [processing, setProcessing] = React.useState(false)
  const [jobId, setJobId] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState<number>(0)
  const [docxUrl, setDocxUrl] = React.useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  // Auto-detect when guideline or template file meta changes
  React.useEffect(() => {
    if (pipeline.guidelineFile || pipeline.templateFile) {
      pipeline.detectFromUploads()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline.guidelineFile, pipeline.templateFile])

  const detection = pipeline.detection

  /** Apply current detection as workspace preset. */
  const handleApplyPreset = () => {
    if (!detection) return
    applyPreset({
      citationStyle: detection.citationStyle,
      preview: detection.preview,
      journalLabel: detection.journalLabel || 'Custom (detected)',
    })
    // Smooth scroll to workspace
    const el = document.getElementById('workspace')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /** Detect from selected journal in local examples. */
  const handleDetectFromJournal = () => {
    if (!selectedJournalId) return
    pipeline.selectJournalById(selectedJournalId)
    pipeline.detectFromKnown()
  }

  /** Detect using guideline/template filenames. */
  const handleDetectFromUploads = () => {
    pipeline.detectFromUploads()
  }

  /** Server-side conversion job: parse manuscript locally for now to get contentText. */
  const handleServerConvert = async () => {
    try {
      setProcessing(true)
      setErrorMsg(null)
      setDocxUrl(null)
      setPdfUrl(null)
      setProgress(0)
      setJobId(null)

      // We require manuscript to generate "contentText"
      const manuscriptFile: File | undefined = (window as any).__lastUploadedManuscriptFile__ // fallback if needed
      // Better: encourage flow from UploadSection via store meta; we can't read File from store, so parse client-side if a user re-uploads here
      if (!manuscriptFile) {
        throw new Error('Önce makaleyi yükleyin (Yükleme bölümünde).')
      }
      const parsed = await parseManuscript(manuscriptFile)
      const contentText = parsed.paragraphs.join('\n\n')

      // Flatten mapping (merge custom fields)
      const mappingPayload: Record<string, unknown> = {
        title: mapping.title,
        authors: mapping.authors,
        abstract: mapping.abstract,
        affiliations: mapping.affiliations,
        keywords: mapping.keywords,
        tables: mapping.tables,
        figures: mapping.figures,
        content: contentText,
        ...(mapping.custom || {}),
      }

      const templateUrl = undefined // If you host a template and want to inject, set its absolute URL

      const { jobId } = await createConvertJob({
        contentText,
        mapping: mappingPayload,
        templateUrl,
      })
      setJobId(jobId)

      const timer = setInterval(async () => {
        try {
          const st = await getJobStatus(jobId)
          setProgress(st.progress || 0)
          if (st.status === 'succeeded') {
            setDocxUrl(st.docxUrl || null)
            setPdfUrl(st.pdfUrl || null)
            clearInterval(timer)
            setProcessing(false)
          } else if (st.status === 'failed') {
            setErrorMsg(st.error || 'Dönüştürme başarısız.')
            clearInterval(timer)
            setProcessing(false)
          }
        } catch {
          // ignore, keep polling
        }
      }, 2000)
    } catch (e: any) {
      setErrorMsg(e?.message || 'Sunucu dönüştürme başlatılamadı.')
      setProcessing(false)
    }
  }

  return (
    <section id="ai-intel" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-black/5 p-2 text-black dark:bg-white/10 dark:text-white">
          <Wand2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Akıllı Biçimlendirici</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Yüklediğiniz yönerge/şablon dosyasına göre otomatik algıla; ardından çalışma alanına uygula. İsterseniz sunucu tarafında DOCX+PDF üret.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Detection flow */}
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-500" />
            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              Yüklenenler: Makale {pipeline.manuscript ? '✓' : '—'} • Yönerge {pipeline.guidelineFile ? '✓' : '—'} • Şablon {pipeline.templateFile ? '✓' : '—'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Dizinden Dergi Seç (örnekler)</label>
              <Select value={selectedJournalId} onChange={(e) => setSelectedJournalId(e.target.value)}>
                <option value="">Seçiniz…</option>
                {baseJournalEntries.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleDetectFromJournal} disabled={!selectedJournalId}>
                Dizinden Algıla
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleDetectFromUploads} disabled={!pipeline.guidelineFile && !pipeline.templateFile}>
              Yönerge/Şablondan Algıla
            </Button>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Yükleme bölümünde dosya seçtiyseniz otomatik de çalışır.</div>
          </div>

          {detection ? (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
              <div className="mb-1 font-semibold">Algılandı</div>
              <div>Atıf: {detection.citationStyle.toUpperCase()}</div>
              <div className="mt-1">
                <div className="text-xs opacity-90">Önizleme</div>
                <ul className="ml-4 list-disc">
                  <li>Yazı tipi: {detection.preview.fontFamily || 'Times New Roman'}</li>
                  <li>Punto: {detection.preview.fontSize || 12} pt</li>
                  <li>Satır aralığı: {detection.preview.lineHeight || 1.5}</li>
                  <li>Hizalama: {detection.preview.justify ? 'İki yana' : 'Sola'}</li>
                  <li>İlk satır girinti: {detection.preview.firstLineIndent ? detection.preview.firstLineIndent : '—'}</li>
                  <li>Kenar boşluğu: {detection.preview.margin || '2.54cm'}</li>
                </ul>
              </div>
              <div className="mt-3">
                <Button onClick={handleApplyPreset}>Çalışma Alanına Uygula</Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
              Henüz algılama yok. Dergi seçip “Dizinden Algıla” veya yönerge/şablon yükleyip “Yönerge/Şablondan Algıla” butonunu kullanın.
            </div>
          )}

          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-2 flex items-center gap-2">
              <Rocket className="h-4 w-4 text-neutral-500" />
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Sunucu Tarafında Dönüştür (Kuyruk + PDF)</div>
            </div>
            <p className="mb-3 text-xs text-neutral-600 dark:text-neutral-400">
              Bu işlem DOCX ve gerçek PDF üretmek için sunucudaki kuyruğu kullanır. Backend URL’i yapılandırılmış olmalıdır.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleServerConvert} disabled={processing}>
                {processing && jobId ? `Dönüştürülüyor… %${Math.round(progress)}` : 'Sunucuda Dönüştür'}
              </Button>
              {docxUrl ? (
                <a href={docxUrl} target="_blank" rel="noreferrer" className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800">
                  DOCX İndir
                </a>
              ) : null}
              {pdfUrl ? (
                <a href={pdfUrl} target="_blank" rel="noreferrer" className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800">
                  PDF İndir
                </a>
              ) : null}
              {errorMsg ? <div className="text-xs text-rose-600 dark:text-rose-400">{errorMsg}</div> : null}
            </div>
          </div>
        </div>

        {/* Right: Template mapping form */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Şablon Alan Eşleme</h3>
          <TemplateMapping
            contentText={mapping.content}
            onChange={(data) => setMapping(data)}
          />
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Şablonda değişkenler {`{title} {authors} {abstract} {affiliations} {keywords} {tables} {figures} {content}`} ve özel alanlar için {'{alanAdı}'} şeklinde olmalıdır.
          </p>
        </div>
      </div>
    </section>
  )
}
