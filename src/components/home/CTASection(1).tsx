/**
 * CTASection.tsx
 * ---------------------------------------------------------
 * A call-to-action section with an email input and button to encourage users to start or try the product.
 * Uses shadcn UI Button and Input if available; falls back to basic styles visually aligned with Tailwind.
 */

import React from 'react'
import { ArrowRight } from 'lucide-react'

// Try to import shadcn UI. If your project doesn't have these, you can replace with native inputs and buttons.
let Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>> | null = null
let Input: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>> | null = null

try {
  // Relative paths based on typical shadcn structure: src/components/ui
  // If your alias config differs, adjust accordingly.
  // @ts-ignore - dynamic import pattern for environments without type resolution here.
  Button = require('../ui/button').Button
  // @ts-ignore
  Input = require('../ui/input').Input
} catch {
  // Fallback: lightweight components matching minimal interface
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
        'flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-400 ' +
        (props.className ?? '')
      }
    />
  )
}

/**
 * CTASection
 * Collects an email and provides a clear primary action. This is presentational;
 * wire the onSubmit handler from the parent page if needed.
 */
export default function CTASection() {
  /** Handles mock submit. Replace with real submission logic via props or context. */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = (data.get('email') as string)?.trim()
    if (email) {
      // In a real app, you'd trigger a request or navigate
      // Keeping console for developer feedback
      console.log('CTA submit email:', email)
      alert('Thanks! We will keep you posted.')
      e.currentTarget.reset()
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 shadow-sm dark:border-neutral-800 dark:from-neutral-950 dark:to-neutral-900">
        <div className="grid gap-0 md:grid-cols-2">
          {/* Visual side */}
          <div className="relative hidden md:block">
            <img
              src="https://pub-cdn.sider.ai/u/U024HZ0OZEV/web-coder/68b5d45a7b28bae4984d7674/resource/73ca7e91-ff12-4bc0-95de-2d241af6af62.jpg"
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Content side */}
          <div className="flex flex-col justify-center gap-6 p-8 sm:p-10">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Ready to format perfectly?
              </h3>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                Join writers who trust our tools for spotless citations and professional layouts.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              {Input ? (
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  aria-label="Email address"
                  className="w-full sm:flex-1"
                />
              ) : null}

              {Button ? (
                <Button type="submit" className="w-full whitespace-nowrap sm:w-auto">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              ) : null}
            </form>

            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
