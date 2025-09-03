/**
 * WhatsappButton.tsx
 * ---------------------------------------------------------
 * Sağ altta sabit WhatsApp iletişim butonu.
 */

import React from 'react'
import { MessageCircle } from 'lucide-react'

/** WhatsappButton: fixed contact button */
export default function WhatsappButton() {
  const phone = '905011354977'
  const url = `https://wa.me/${phone}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
      title="WhatsApp ile iletişim"
    >
      <MessageCircle className="h-5 w-5" />
      İletişim
    </a>
  )
}
