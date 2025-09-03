/**
 * PaymentCheckout.tsx
 * ---------------------------------------------------------
 * Lets the customer enter pricing, opt-in for plagiarism report and translation,
 * and finalize the order by sending a WhatsApp message to the business.
 */

import React from 'react'
import type { CitationStyle, JournalTemplateKey } from '@/components/home/TemplatePicker'
import { useOrdersStore } from '@/store/orders'

/** Button fallback (shadcn if available else basic) */
let Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>
let Input: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>

try {
  // @ts-ignore
  Button = require('../ui/button').Button
  // @ts-ignore
  Input = require('../ui/input').Input
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
  Input = (props) => (
    <input
      {...props}
      className={
        'h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ' +
        (props.className ?? '')
      }
    />
  )
}

/** Props to compute final message and create order */
export interface PaymentCheckoutProps {
  customerName?: string
  customerEmail?: string
  journal: JournalTemplateKey
  citationStyle: CitationStyle
  basePrice: number
  onBasePrice: (v: number) => void
  plagiarismRequested: boolean
  onPlagiarism: (v: boolean) => void
  /** Plagiarism fee constant (default 500) */
  plagiarismFee?: number
  manuscriptFile?: File | null
  templatePlacement: boolean
  templateFile?: File | null

  /** Translation add-on (fixed 500 TL by default) */
  translationRequested: boolean
  onTranslation: (v: boolean) => void
  translationFee?: number
}

/**
 * PaymentCheckout
 * Calculates totals and triggers WhatsApp "click to chat" with a pre-filled message.
 */
export default function PaymentCheckout({
  customerName,
  customerEmail,
  journal,
  citationStyle,
  basePrice,
  onBasePrice,
  plagiarismRequested,
  onPlagiarism,
  plagiarismFee = 500,
  manuscriptFile,
  templatePlacement,
  templateFile,
  translationRequested,
  onTranslation,
  translationFee = 500,
}: PaymentCheckoutProps) {
  const addOrder = useOrdersStore((s) => s.addOrder)

  /** Creates an in-memory file reference */
  const toRef = (f: File | null | undefined) =>
    f
      ? {
          name: f.name,
          size: f.size,
          type: f.type,
        }
      : undefined

  // Total = base + plagiarism (+500 if selected) + translation (+500 if selected)
  const total =
    Math.max(0, basePrice) +
    (plagiarismRequested ? plagiarismFee : 0) +
    (translationRequested ? translationFee : 0)

  /** Composes order + opens WhatsApp with encoded message */
  const handlePay = () => {
    const id = String(Date.now())
    const order = {
      id,
      customerName,
      customerEmail,
      manuscript: toRef(manuscriptFile),
      placeIntoTemplate: templatePlacement,
      templateFile: toRef(templateFile),
      journal,
      citationStyle,
      basePrice: Math.max(0, basePrice),
      translationRequested,
      translationFee,
      plagiarismRequested,
      plagiarismFee,
      totalPrice: total,
      createdAt: new Date().toISOString(),
      status: 'created' as const,
    }
    addOrder(order)

    // WhatsApp message (use international format without leading 0: +90 501 135 49 77)
    const phone = '905011354977'
    const lines = [
      `Yeni Sipariş #${id}`,
      `Müşteri: ${customerName || '-'} (${customerEmail || '-'})`,
      `Dergi/Şablon: ${journal.toUpperCase()} • Atıf: ${citationStyle.toUpperCase()}`,
      `Makale: ${manuscriptFile ? manuscriptFile.name : '-'}`,
      `Şablona Yerleştirme: ${templatePlacement ? 'Evet' : 'Hayır'}`,
      templateFile ? `Şablon Dosyası: ${templateFile.name}` : undefined,
      `Hizmet Bedeli: ${Math.max(0, basePrice)} TL`,
      `İntihal Raporu: ${plagiarismRequested ? `Evet (+${plagiarismFee} TL)` : 'Hayır'}`,
      `Çeviri/Dil Düzenleme: ${translationRequested ? `Evet (+${translationFee} TL)` : 'Hayır'}`,
      `Toplam: ${total} TL`,
    ].filter(Boolean)

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Ad Soyad (isteğe bağlı)</label>
          <Input
            placeholder="Ad Soyad"
            defaultValue={customerName}
            onChange={(e) => {
              /* parent keeps it if needed */
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">E-posta (isteğe bağlı)</label>
          <Input
            type="email"
            placeholder="E-posta"
            defaultValue={customerEmail}
            onChange={(e) => {
              /* parent keeps it if needed */
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Hizmet Bedeli (TL)</label>
          <Input
            type="number"
            min={0}
            step="50"
            value={isNaN(basePrice) ? 0 : basePrice}
            onChange={(e) => onBasePrice(Number(e.target.value || 0))}
            placeholder="Örn. 1500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Ek Hizmet</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
              <input
                type="checkbox"
                checked={plagiarismRequested}
                onChange={(e) => onPlagiarism(e.target.checked)}
                className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
              />
              İntihal Raporu ekle (+{plagiarismFee} TL)
            </label>

            <label className="flex items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
              <input
                type="checkbox"
                checked={translationRequested}
                onChange={(e) => onTranslation(e.target.checked)}
                className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
              />
              Çeviri/Dil Düzenleme ekle (+{translationFee} TL)
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div className="text-neutral-700 dark:text-neutral-300">Ara Toplam</div>
          <div className="font-semibold text-neutral-900 dark:text-neutral-100">{Math.max(0, basePrice)} TL</div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-neutral-700 dark:text-neutral-300">İntihal Raporu</div>
          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
            {plagiarismRequested ? `+${plagiarismFee} TL` : '—'}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-neutral-700 dark:text-neutral-300">Çeviri/Dil Düzenleme</div>
          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
            {translationRequested ? `+${translationFee} TL` : '—'}
          </div>
        </div>
        <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800" />
        <div className="flex items-center justify-between">
          <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">Toplam</div>
          <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">{total} TL</div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handlePay} className="whitespace-nowrap">
          Ödeme Yap (WhatsApp)
        </Button>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Not: Bu buton, sipariş detaylarını WhatsApp üzerinden iletmek için yeni bir sekme açar. Gerçek ödeme altyapısı
        (kredi kartı vb.) eklemek isterseniz, iyzico/Iyzico, PayTR veya Stripe gibi servislerle entegrasyon yapılabilir.
      </p>
    </div>
  )
}
