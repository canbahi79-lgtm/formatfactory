/**
 * AIServiceCheckout.tsx
 * ---------------------------------------------------------
 * Minimal WhatsApp-based checkout for the AI Grammar Service (fixed price).
 * Creates an order in the local store and opens a WhatsApp prefilled message.
 */

import React from 'react'
import { useOrdersStore } from '@/store/orders'
import type { CitationStyle, JournalTemplateKey } from '@/components/home/TemplatePicker'

let Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>
let Input: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>
try {
  // @ts-ignore
  Button = require('@/components/ui/button').Button
  // @ts-ignore
  Input = require('@/components/ui/input').Input
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

interface AIServiceCheckoutProps {
  /** Display label for service */
  serviceLabel: string
  /** Fixed price in TRY (e.g., 300) */
  fixedPrice: number
  /** Selected journal and style for context */
  journal: JournalTemplateKey
  citationStyle: CitationStyle
}

export default function AIServiceCheckout({ serviceLabel, fixedPrice, journal, citationStyle }: AIServiceCheckoutProps) {
  const addOrder = useOrdersStore((s) => s.addOrder)
  const [customerName, setCustomerName] = React.useState('')
  const [customerEmail, setCustomerEmail] = React.useState('')

  const handlePay = () => {
    const id = String(Date.now())
    addOrder({
      id,
      customerName,
      customerEmail,
      manuscript: undefined,
      placeIntoTemplate: false,
      templateFile: undefined,
      journal,
      citationStyle,
      basePrice: fixedPrice,
      plagiarismRequested: false,
      plagiarismFee: 0,
      totalPrice: fixedPrice,
      createdAt: new Date().toISOString(),
      status: 'created',
    })

    const phone = '905011354977' // +90 501 135 49 77
    const lines = [
      `Yeni Sipariş #${id}`,
      `Hizmet: ${serviceLabel} (${fixedPrice} TL)`,
      `Müşteri: ${customerName || '-'} (${customerEmail || '-'})`,
      `Dergi/Şablon: ${journal.toUpperCase()} • Atıf: ${citationStyle.toUpperCase()}`,
      `Toplam: ${fixedPrice} TL`,
    ]
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Ad Soyad (isteğe bağlı)</label>
          <Input placeholder="Ad Soyad" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">E-posta (isteğe bağlı)</label>
          <Input type="email" placeholder="E-posta" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="text-neutral-700 dark:text-neutral-300">Hizmet Bedeli</div>
        <div className="font-semibold text-neutral-900 dark:text-neutral-100">{fixedPrice} TL</div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handlePay}>Ödeme Yap (WhatsApp)</Button>
      </div>
    </div>
  )
}
