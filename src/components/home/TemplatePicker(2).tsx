/**
 * TemplatePicker.tsx
 * ---------------------------------------------------------
 * Journal template and citation style selector. Emits chosen values to parent.
 */

import React from 'react'

/** Available journal template identifiers. */
export type JournalTemplateKey = 'nature' | 'ieee' | 'acm' | 'elsevier' | 'springer' | 'plos' | 'custom'
/** Supported citation style identifiers. */
export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'ieee' | 'acm' | 'plos'

/**
 * Props for TemplatePicker component.
 */
interface TemplatePickerProps {
  /** Currently selected values */
  value: { journal: JournalTemplateKey; style: CitationStyle }
  /** When journal template changes */
  onJournalChange: (j: JournalTemplateKey) => void
  /** When citation style changes */
  onStyleChange: (s: CitationStyle) => void
}

/**
 * TemplatePicker
 * Renders dropdowns for journal and citation styles.
 */
export default function TemplatePicker({ value, onJournalChange, onStyleChange }: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Dergi Şablonu</label>
        <select
          className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          value={value.journal}
          onChange={(e) => onJournalChange(e.target.value as JournalTemplateKey)}
        >
          <option value="nature">Nature</option>
          <option value="ieee">IEEE</option>
          <option value="acm">ACM</option>
          <option value="elsevier">Elsevier</option>
          <option value="springer">Springer</option>
          <option value="plos">PLOS ONE</option>
          <option value="custom">Özel</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Atıf Biçimi</label>
        <select
          className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          value={value.style}
          onChange={(e) => onStyleChange(e.target.value as CitationStyle)}
        >
          <option value="apa">APA</option>
          <option value="mla">MLA</option>
          <option value="chicago">Chicago</option>
          <option value="ieee">IEEE</option>
          <option value="acm">ACM</option>
          <option value="plos">PLOS</option>
        </select>
      </div>

      <div className="sm:col-span-2 text-xs text-neutral-500 dark:text-neutral-400">
        Seçilen dergiye uygun varsayılan punto, satır aralığı ve hizalama otomatik ayarlanır.
      </div>
    </div>
  )
}
