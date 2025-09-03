/**
 * AcademicFormattingSection.tsx
 * ---------------------------------------------------------
 * A marketing section that showcases supported academic formatting styles (APA, MLA, Chicago)
 * with concise descriptions and visual cards. Uses Tailwind for styling and subtle interactions.
 */

import React from 'react'
import { BookOpen, Quote, PenLine, CheckCircle2 } from 'lucide-react'

/**
 * CardProps
 * Describes props for the FormatCard component.
 */
interface CardProps {
  /** Title of the formatting style (e.g., APA) */
  title: string
  /** Short description for the style */
  description: string
  /** Bullet points highlighting key features */
  bullets: string[]
  /** Icon component from lucide-react */
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  /** Accent color classes for borders/background highlights */
  accentClass: string
}

/**
 * FormatCard
 * Reusable card for displaying a single academic formatting style.
 */
function FormatCard({ title, description, bullets, Icon, accentClass }: CardProps) {
  return (
    <div
      className={`group relative rounded-xl border bg-white/80 dark:bg-neutral-900/80 ${accentClass} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1`}
    >
      {/* Subtle accent background blob */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-black/5 dark:bg-white/5 blur-2xl" />
      </div>

      <div className="flex items-start gap-4">
        <div className="shrink-0 rounded-lg bg-black/5 p-2 text-black dark:bg-white/10 dark:text-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {bullets.map((point, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * AcademicFormattingSection
 * Main section that aggregates multiple FormatCard instances.
 */
export default function AcademicFormattingSection() {
  const cards: CardProps[] = [
    {
      title: 'APA (7th Edition)',
      description: 'In-text citations, reference pages, DOIs, and consistent author-date formatting.',
      bullets: ['Auto references', 'Hanging indents', 'Proper DOIs/URLs'],
      Icon: BookOpen,
      accentClass: 'border-neutral-200 dark:border-neutral-800',
    },
    {
      title: 'MLA (9th Edition)',
      description: 'Author-page citations, Works Cited, and strict capitalization rules for titles.',
      bullets: ['Author-page style', 'Title case rules', 'Works Cited'],
      Icon: Quote,
      accentClass: 'border-neutral-200 dark:border-neutral-800',
    },
    {
      title: 'Chicago/Turabian',
      description: 'Notes and bibliography or author-date with precise footnote/endnote handling.',
      bullets: ['Footnotes & endnotes', 'Bibliography formatting', 'Author–date option'],
      Icon: PenLine,
      accentClass: 'border-neutral-200 dark:border-neutral-800',
    },
  ]

  return (
    <section
      aria-labelledby="academic-formatting-title"
      className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
    >
      {/* Decorative image header for visual interest */}
      <div className="mb-8 overflow-hidden rounded-xl">
        <img
          src="https://pub-cdn.sider.ai/u/U024HZ0OZEV/web-coder/68b5d45a7b28bae4984d7674/resource/c318ef57-3e2c-4111-8e40-90be842febb6.jpg"
          alt=""
          className="h-40 w-full object-cover"
        />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <h2 id="academic-formatting-title" className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Academic formatting made simple
        </h2>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          Apply APA, MLA, or Chicago styles with confidence—citations, references, and layout handled with best practices.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <FormatCard key={c.title} {...c} />
        ))}
      </div>
    </section>
  )
}
