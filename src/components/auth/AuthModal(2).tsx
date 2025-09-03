/**
 * AuthModal.tsx
 * ---------------------------------------------------------
 * Basit giriş / üye ol modali. (shadcn yoksa fallback stiller)
 */

import React from 'react'
import { useAuthStore } from '@/store/auth'

/** Basit modal */
function BaseModal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-300 px-2 py-1 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Kapat"
          >
            Kapat
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** AuthModal: giriş/üye ol sekmeleri */
export default function AuthModal() {
  const open = useAuthStore((s) => s.authModalOpen)
  const setOpen = useAuthStore((s) => s.setAuthModal)
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)

  const [tab, setTab] = React.useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')
  const [msg, setMsg] = React.useState<string | null>(null)

  const close = () => setOpen(false)

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    const r = signIn(email, password)
    if (!r.ok) setMsg(r.message || 'Giriş başarısız'); else close()
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    const r = signUp(email, password, name)
    if (!r.ok) setMsg(r.message || 'Kayıt başarısız'); else close()
  }

  return (
    <BaseModal open={open} onClose={close} title={tab === 'signin' ? 'Giriş Yap' : 'Üye Ol'}>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => { setTab('signin'); setMsg(null) }}
          className={'rounded-md px-3 py-1 text-sm ' + (tab === 'signin'
            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
            : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100')}
        >
          Giriş
        </button>
        <button
          onClick={() => { setTab('signup'); setMsg(null) }}
          className={'rounded-md px-3 py-1 text-sm ' + (tab === 'signup'
            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
            : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100')}
        >
          Üye Ol
        </button>
      </div>

      {msg ? <div className="mb-2 rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">{msg}</div> : null}

      <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} className="space-y-3">
        {tab === 'signup' ? (
          <div>
            <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Ad (opsiyonel)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              placeholder="Ad"
            />
          </div>
        ) : null}
        <div>
          <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">E-posta</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            placeholder="ornek@mail.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Şifre</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            placeholder="••••••••"
            minLength={4}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {tab === 'signin' ? 'Giriş Yap' : 'Üye Ol'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}