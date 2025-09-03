/**
 * AIToolsSection.tsx
 * ---------------------------------------------------------
 * AI araçları bölümü: dilbilgisi düzeltme, özet çıkarma, intihal kontrolü gibi
 * özellikleri gösteren kartlar ve butonlar.
 */

import React from 'react'
import { Wand2, FileText, CheckCircle, Brain, BarChart3, Search } from 'lucide-react'
import GrammarPolishSection from './GrammarPolishSection'

/** AIToolCard: AI özellik kartı */
function AIToolCard({
  title,
  description,
  icon,
  onClick,
  disabled = false,
}: {
  title: string
  description: string
  icon: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <div className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
          {onClick && (
            <button
              onClick={onClick}
              disabled={disabled}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Kullan
              <Wand2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/** AIToolsSection: Ana AI araçları bölümü */
export default function AIToolsSection() {
  const tools = [
    {
      title: 'Dilbilgisi Düzeltme',
      description: 'Türkçe ve İngilizce metinler için dilbilgisi, noktalama ve stil düzeltmeleri.',
      icon: <CheckCircle className="h-5 w-5" />,
      onClick: () => {
        const el = document.getElementById('grammar-polish')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      },
    },
    {
      title: 'Özet Çıkarma',
      description: 'Uzun metinlerden otomatik özet oluşturma ve anahtar kelime çıkarma.',
      icon: <FileText className="h-5 w-5" />,
      disabled: true,
    },
    {
      title: 'Intihal Kontrolü',
      description: 'Metinlerinizi benzerlik açısından kontrol edin ve rapor alın.',
      icon: <Search className="h-5 w-5" />,
      onClick: () => {
        const el = document.getElementById('plagiarism')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      },
    },
    {
      title: 'Dergi Eşleştirme',
      description: 'Makalenizin konusuna uygun dergileri AI ile bulun ve öneriler alın.',
      icon: <Brain className="h-5 w-5" />,
      disabled: true,
    },
    {
      title: 'Atıf Analizi',
      description: 'Kaynakçanızın dergi standartlarına uygunluğunu analiz edin.',
      icon: <BarChart3 className="h-5 w-5" />,
      disabled: true,
    },
  ]

  return (
    <section id="ai-tools" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-black/5 p-2 text-black dark:bg-white/10 dark:text-white">
          <Wand2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">AI Araçları</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Yapay zeka destekli araçlarla akademik yazım sürecinizi hızlandırın ve kalitesini artırın.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <AIToolCard
            key={tool.title}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            onClick={tool.onClick}
            disabled={tool.disabled}
          />
        ))}
      </div>

      <div className="mt-8">
        <GrammarPolishSection />
      </div>
    </section>
  )
}
