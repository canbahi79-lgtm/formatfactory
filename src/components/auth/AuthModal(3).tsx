/**
 * AuthModal.tsx
 * ---------------------------------------------------------
 * Giriş/Kayıt modal bileşeni. Zustand store ile entegre çalışır.
 */

import React from 'react'
import { useAuthStore } from '@/store/auth'
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

/** AuthModal: Giriş ve kayıt modalı */
export default function AuthModal() {
  const { isAuthModalOpen, setAuthModal, login, register } = useAuthStore()
  const [mode, setMode] = React.useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password)
      } else {
        await register(formData.name, formData.email, formData.password)
      }
      setAuthModal(false)
      setFormData({ name: '', email: '', password: '' })
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </h2>
          <button
            onClick={() => setAuthModal(false)}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Ad Soyad
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-neutral-300 bg-white pl-10 pr-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="Adınız Soyadınız"
                  required
                />
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              E-posta
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white pl-10 pr-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                placeholder="ornek@email.com"
                required
              />
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white pl-10 pr-10 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                placeholder="••••••••"
                required
              />
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {loading ? 'İşleniyor...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>

          <div className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {mode === 'login' ? (
              <>
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-medium text-neutral-900 underline hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300"
                >
                  Kayıt olun
                </button>
              </>
            ) : (
              <>
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-neutral-900 underline hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300"
                >
                  Giriş yapın
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
