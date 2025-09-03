/**
 * DisclaimerConsent.tsx
 * ---------------------------------------------------------
 * Reusable consent checkbox for liability/disclaimer acceptance.
 * Used in auth signup and all upload points. Blocks progress if not accepted.
 */

import React from 'react'

/** Props for DisclaimerConsent */
interface DisclaimerConsentProps {
  /** Controlled checked state */
  checked: boolean
  /** Change handler */
  onChange: (v: boolean) => void
  /** Optional compact mode for tighter UIs */
  compact?: boolean
}

/**
 * DisclaimerConsent
 * Shows a checkbox with a short disclaimer summary and a collapsible details block.
 */
export default function DisclaimerConsent({ checked, onChange, compact = false }: DisclaimerConsentProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <label className="flex items-start gap-2 text-sm text-neutral-800 dark:text-neutral-200">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
        />
        <span>
          Sorumluluk reddi metnini okudum ve kabul ediyorum.
          <button
            type="button"
            className="ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs text-neutral-900 underline underline-offset-4 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? 'Metni gizle' : 'Metni göster'}
          </button>
        </span>
      </label>

      {open ? (
        <div className="max-h-48 overflow-auto rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
          Bu hizmet, yüklediğiniz içeriklerin doğruluğunu ve telif durumunu sizin sorumluluğunuza bırakır. Sistem,
          yapay zeka ve kurallar seti ile biçimlendirme önerileri sunar; nihai akademik uyumluluk, atıf kuralları ve
          özgünlük denetimi kullanıcının sorumluluğundadır. İntihal raporları, talep edilen üçüncü parti araçlar veya
          yöntemlerle hazırlanır ve sadece bilgilendirme amaçlıdır. Gizli/kişisel veriler yüklenmeden önce
          anonimize edilmelidir. Hizmeti kullanarak bu şartları kabul etmiş sayılırsınız.
        </div>
      ) : null}
    </div>
  )
}
