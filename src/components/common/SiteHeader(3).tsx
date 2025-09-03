/**
 * SiteHeader.tsx
 * ---------------------------------------------------------
 * Basit, profesyonel bir üst navigasyon barı. Bölüm anchor'larına hızlı erişim.
 */

import React from 'react'
import { BookOpen, FileText, Wand2, User, Save, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

/** SiteHeader: üst bar ve anchor linkler */
export default function SiteHeader() {
  const { currentUser, isLoggedIn, signOut, setAuthModal } = useAuthStore()

  const links = [
    { id: 'directory', label: 'Dizin', href: '#journal-directory-title' },
    { id: 'ai', label: 'Akıllı Biçimlendirici', href: '#ai-intel' },
    { id: 'workspace', label: 'Çalışma Alanı', href: '#workspace' },
    { id: 'references', label: 'Referanslar', href: '#references' },
    { id: 'integrations', label: 'Entegrasyonlar', href: '#integrations' },
    { id: 'checkout', label: 'Ödeme', href: '#payment' },
    { id: 'blog', label: 'Blog', href: '#blog-title' },
  ]

  return (
    <div className="sticky top-0 z-30 w-full border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <div className="rounded-md bg-neutral-900 p-1.5 text-white dark:bg-neutral-100 dark:text-neutral-900">
            <Wand2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">AI Journal Formatter</span>
        </a>

        <nav className="hidden gap-4 md:flex">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.href}
              className="text-sm text-neutral-700 underline-offset-4 hover:underline dark:text-neutral-300"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <a
                href="#works"
                className="inline-flex items-center rounded-md bg-neutral-200 px-3 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                title="Çalışmalarım"
              >
                <Save className="mr-1 h-4 w-4" />
                Çalışmalarım
              </a>
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700">
                  <User className="h-4 w-4" />
                  {currentUser?.name || 'Kullanıcı'}
                </button>
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-neutral-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all dark:border-neutral-800 dark:bg-neutral-900">
                  <a
                    href="#profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <Settings className="h-4 w-4" />
                    Profil
                  </a>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => setAuthModal(true)}
              className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
            >
              <User className="mr-1 h-4 w-4" />
              Giriş Yap
            </button>
          )}
          <a
            href="#journal-directory-title"
            className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
            title="Dergi Dizini"
          >
            <BookOpen className="mr-1 h-4 w-4" />
            Dizin
          </a>
          <a
            href="#ai-intel"
            className="inline-flex items-center rounded-md bg-neutral-200 px-3 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
            title="Akıllı"
          >
            <FileText className="mr-1 h-4 w-4" />
            Akıllı
          </a>
        </div>
      </div>
    </div>
  )
}
