/**
 * PaymentFlowSection.tsx
 * ---------------------------------------------------------
 * A complete customer flow:
 * - Upload manuscript (PDF/Word)
 * - Choose formatting style (reuses TemplatePicker)
 * - Optional: place into template and upload template file
 * - Set price, add plagiarism report, see total
 * - Pay: opens WhatsApp with details and creates an order in store
 */

import React from 'react'
import TemplatePicker, { type CitationStyle, type JournalTemplateKey } from '@/components/home/TemplatePicker'
import ManuscriptUpload from './ManuscriptUpload'
import TemplatePlacementOption from './TemplatePlacementOption'
import PaymentCheckout from './PaymentCheckout'
import { FileText } from 'lucide-react'

/**
 * PaymentFlowSection
 * Packs the end-to-end service + checkout in a single section.
 */
export default function PaymentFlowSection() {
  const [manuscript, setManuscript] = React.useState<File | null>(null)
  const [placeIntoTemplate, setPlaceIntoTemplate] = React.useState(false)
  const [templateFile, setTemplateFile] = React.useState<File | null>(null)

  const [journal, setJournal] = React.useState<JournalTemplateKey>('nature')
  const [citationStyle, setCitationStyle] = React.useState<CitationStyle>('apa')

  const [basePrice, setBasePrice] = React.useState<number>(0)
  const [plagiarismRequested, setPlagiarismRequested] = React.useState<boolean>(false)

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-black/5 p-2 text-black dark:bg-white/10 dark:text-white">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Profesyonel Hizmet ve Ödeme</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Makalenizi yükleyin, yazım biçimini seçin, isterseniz şablona yerleştirin ve ödemeyi tamamlayın.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <ManuscriptUpload file={manuscript} onChange={setManuscript} />

          <div className="mt-6">
            <TemplatePlacementOption
              enabled={placeIntoTemplate}
              onToggle={setPlaceIntoTemplate}
              templateFile={templateFile}
              onTemplateFile={setTemplateFile}
            />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4">
            <TemplatePicker
              value={{ journal, style: citationStyle }}
              onJournalChange={setJournal}
              onStyleChange={setCitationStyle}
            />
          </div>

          <PaymentCheckout
            journal={journal}
            citationStyle={citationStyle}
            basePrice={basePrice}
            onBasePrice={setBasePrice}
            plagiarismRequested={plagiarismRequested}
            onPlagiarism={setPlagiarismRequested}
            plagiarismFee={250}
            manuscriptFile={manuscript}
            templatePlacement={placeIntoTemplate}
            templateFile={templateFile}
          />
        </div>
      </div>
    </section>
  )
}
