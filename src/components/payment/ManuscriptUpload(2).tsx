/**
 * ManuscriptUpload.tsx
 * ---------------------------------------------------------
 * Allows customers to upload their manuscript as Word or PDF.
 * Shows a small file summary after selection.
 */

import React from 'react'
import DisclaimerConsent from '@/components/common/DisclaimerConsent'

/** Props for ManuscriptUpload */
export interface ManuscriptUploadProps {
  /** Current selected file (state lifted up) */
  file: File | null
  /** When user selects a manuscript file */
  onChange: (file: File | null) => void
}

/**
 * ManuscriptUpload
 * File input for DOCX or PDF manuscripts with a small summary view.
 */
export default function ManuscriptUpload({ file, onChange }: ManuscriptUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  /** Handles file selection and validation of file type */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    if (!f) {
      onChange(null)
      return
    }
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowed.includes(f.type)) {
      alert('Lütfen PDF veya Word (DOC/DOCX) dosyası yükleyin.')
      e.target.value = ''
      onChange(null)
      return
    }
    onChange(f)
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
        Makale Yükle (PDF / Word)
      </label>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFile}
        className="block w-full cursor-pointer rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        aria-label="Makale dosyası seç"
      />

      {file ? (
        <div className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
          <div className="font-medium">Seçilen dosya</div>
          <div>Ad: {file.name}</div>
          <div>Boyut: {(file.size / 1024).toFixed(1)} KB</div>
          <div>Tür: {file.type || 'Bilinmiyor'}</div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Henüz dosya seçilmedi.</p>
      )}
    </div>
  )
}
