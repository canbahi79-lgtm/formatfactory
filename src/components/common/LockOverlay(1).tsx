/**
 * LockOverlay.tsx
 * ---------------------------------------------------------
 * Üye olmadan işlem yapılamaz uyarısı + giriş çağrısı.
 */

import React from 'react'
import { useAuthStore } from '@/store/auth'
import { Lock } from 'lucide-react'

/** LockOverlay: Bölüm üzerine konan yarı saydam katman ve CTA */
export default function LockOverlay({ message = 'Bu bölümü kullanmak için giriş yapın.' }: { message?: string }) {
  const setAuthModal = useAuthStore((s) => s.setAuthModal)
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 p-4 backdrop-blur-sm dark:bg-neutral-900/70">
      <div className="flex max-w-md flex-col items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="rounded-full bg-black/5 p-2 text-black dark:bg-white/10 dark:text-white">
          <Lock className="h-5 w-5" />
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{message}</p>
        <button
          onClick={() => setAuthModal(true)}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Giriş Yap / Üye Ol
        </button>
      </div>
    </div>
  )
}