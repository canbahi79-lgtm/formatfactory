/**
 * UploadSection.tsx
 * ---------------------------------------------------------
 * Makale ve Şablon yüklemeyi tek bir yerde toplar.
 * - Sol: Makale yükleme (PDF/DOC/DOCX) + opsiyonel Yazım Kuralları yükleme
 * - Sağ: "Şablona yerleştir" + Şablon (DOC/DOCX)
 * - Giriş zorunlu + sorumluluk reddi onayları yoksa inputlar devre dışı.
 * - AIPipeline store ile meta senkronizasyonu yapar (Akıllı Biçimlendirici için).
 */

import React from 'react'
import ManuscriptUpload from '@/components/payment/ManuscriptUpload'
import TemplatePlacementOption from '@/components/payment/TemplatePlacementOption'
import LockOverlay from '@/components/common/LockOverlay'
import DisclaimerConsent from '@/components/common/DisclaimerConsent'
import { useAuthStore } from '@/store/auth'
import { useAIPipelineStore } from '@/store/aiPipeline'

/**
 * UploadSection
 * Makale + Şablon yükleme bölümü (yan yana). İsteğe bağlı yönerge dosyası da alır.
 */
export default function UploadSection() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn())

  // Local files
  const [manuscript, setManuscript] = React.useState<File | null>(null)
  const [placeIntoTemplate, setPlaceIntoTemplate] = React.useState(false)
  const [templateFile, setTemplateFile] = React.useState<File | null>(null)

  // Optional: author guidelines
  const [guidelineConsent, setGuidelineConsent] = React.useState(false)
  const [guidelineFile, setGuidelineFile] = React.useState<File | null>(null)

  // Pipeline sync (store holds meta for cross-sections)
  const pipeline = useAIPipelineStore()

  React.useEffect(() => {
    pipeline.setManuscript(manuscript)
  }, [manuscript])

  React.useEffect(() => {
    pipeline.setTemplate(templateFile)
  }, [templateFile])

  React.useEffect(() => {
    pipeline.setGuideline(guidelineFile)
  }, [guidelineFile])

  return (
    <section id="upload" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Makale ve Şablon Yükleme</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Makalenizi yükleyin; isterseniz şablon ve yazım kuralları dosyasını ekleyin. Giriş ve sorumluluk onayı zorunludur.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2">
        {!isLoggedIn ? <LockOverlay message="Yükleme yapabilmek için lütfen giriş yapın." /> : null}

        {/* Left: Manuscript + Guidelines */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <ManuscriptUpload file={manuscript} onChange={setManuscript} />

          {/* Optional Guidelines */}
          <div className="mt-6">
            <label className="mb-1 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Yazım Kuralları (PDF/Word) – opsiyonel
            </label>

            <DisclaimerConsent checked={guidelineConsent} onChange={setGuidelineConsent} compact />

            <input
              type="file"
              disabled={!guidelineConsent}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setGuidelineFile(e.target.files?.[0] ?? null)}
              className={
                'mt-2 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ' +
                (!guidelineConsent ? 'cursor-not-allowed opacity-70' : 'cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-800')
              }
              aria-label="Yazım kuralları dosyası seç"
            />

            {guidelineFile ? (
              <div className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
                <div className="font-medium">Yazım Kuralları</div>
                <div>Ad: {guidelineFile.name}</div>
                <div>Boyut: {(guidelineFile.size / 1024).toFixed(1)} KB</div>
                <div>Tür: {guidelineFile.type || 'Bilinmiyor'}</div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Template placement */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <TemplatePlacementOption
            enabled={placeIntoTemplate}
            onToggle={setPlaceIntoTemplate}
            templateFile={templateFile}
            onTemplateFile={setTemplateFile}
          />
          <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
            Not: Şablon dosyanızdaki değişkenler {'{title} {authors} {abstract} {content}'} olarak adlandırılmalıdır.
          </p>
        </div>
      </div>
    </section>
  )
}
