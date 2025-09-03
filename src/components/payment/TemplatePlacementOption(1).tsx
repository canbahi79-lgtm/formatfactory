/**
 * TemplatePlacementOption.tsx
 * ---------------------------------------------------------
 * Optional toggle to place the manuscript into a provided template file.
 * When enabled, allows uploading a template (DOCX) file.
 */

import React from 'react'
import DisclaimerConsent from '@/components/common/DisclaimerConsent'

/** Props for TemplatePlacementOption */
export interface TemplatePlacementOptionProps {
  enabled: boolean
  onToggle: (v: boolean) => void
  templateFile: File | null
  onTemplateFile: (file: File | null) => void
}

/**
 * TemplatePlacementOption
 * A checkbox that reveals a template file input when active.
 */
export default function TemplatePlacementOption({
  enabled,
  onToggle,
  templateFile,
  onTemplateFile,
}: TemplatePlacementOptionProps) {
  const handleTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    if (!f) {
      onTemplateFile(null)
      return
    }
    const allowed = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowed.includes(f.type)) {
      alert('Lütfen Word şablonu (DOC/DOCX) yükleyin.')
      e.target.value = ''
      onTemplateFile(null)
      return
    }
    onTemplateFile(f)
  }

  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
        />
        Şablona yerleştir (isteğe bağlı)
      </label>

      {enabled ? (
        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Şablon Dosyası (DOC/DOCX)
          </label>
          <input
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleTemplate}
            className="block w-full cursor-pointer rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            aria-label="Şablon dosyası seç"
          />

          {templateFile ? (
            <div className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
              <div className="font-medium">Şablon</div>
              <div>Ad: {templateFile.name}</div>
              <div>Boyut: {(templateFile.size / 1024).toFixed(1)} KB</div>
              <div>Tür: {templateFile.type || 'Bilinmiyor'}</div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Henüz şablon seçilmedi.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
