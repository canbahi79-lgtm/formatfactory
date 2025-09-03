/**
 * HeroSection.tsx
 * ---------------------------------------------------------
 * A prominent hero section introducing the AI-powered journal formatting tool.
 * Provides quick actions to start formatting and explore features.
 */

import React from 'react'

/**
 * Button component reference. Uses shadcn UI if available, otherwise falls back.
 */
let Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>

try {
  // @ts-ignore - dynamic require pattern for environments without type resolution here.
  Button = require('../ui/button').Button
} catch {
  /**
   * Fallback Button
   * Minimal, accessible button with good contrast.
   */
  Button = (props) => (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-md bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 ' +
        (props.className ?? '')
      }
    />
  )
}

/**
 * HeroSection
 * Presents headline, subtext, and primary actions.
 */
export default function HeroSection() {
  return (
    <header className="relative overflow-hidden border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://pub-cdn.sider.ai/u/U024HZ0OZEV/web-coder/68b5d45a7b28bae4984d7674/resource/d941c713-5eba-4c17-bd42-f60eb367d57b.jpg"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-neutral-900 dark:via-neutral-900/70" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-5xl">
            Yapay zekâ destekli dergi formatlama
          </h1>
          <p className="mt-4 text-lg text-neutral-700 dark:text-neutral-300">
            Makalenizi yükleyin veya metni yapıştırın, dergi şablonunu seçin, tek tıkla düzenli bir taslağa kavuşun.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {Button ? (
              <Button
                onClick={() => {
                  const el = document.getElementById('workspace')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Düzenlemeye Başla
              </Button>
            ) : null}

            <a
              href="#features"
              className="text-sm font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-100"
            >
              Özellikleri Gör
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
