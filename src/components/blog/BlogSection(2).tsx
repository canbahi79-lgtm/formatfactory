/**
 * BlogSection.tsx
 * ---------------------------------------------------------
 * SEO-oriented blog listing with 100 programmatically generated posts.
 * Includes search and a simple modal to view content. Injects Article JSON-LD when a post is opened.
 */

import React from 'react'
import { useSEOStore } from '@/store/seo'

let Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>
let Input: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>

try {
  // @ts-ignore
  Button = require('../ui/button').Button
  // @ts-ignore
  Input = require('../ui/input').Input
} catch {
  Button = (props) => (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 ' +
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

/** Blog post type */
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  createdAt: string
  cover?: string
}

/** Generates a lorem paragraph */
function lorem(p: number) {
  const base =
    'Akademik yazımda tutarlılık, kaynakça kurallarına uyum ve dergi şablonuna uygunluk yayın sürecini hızlandırır. Yapay zeka destekli biçimlendirme araçları, araştırmacıların zaman kazanmasına yardımcı olur.'
  return Array.from({ length: p })
    .map(() => base)
    .join(' ')
}

/** Creates 100 posts with varied titles */
function generatePosts(): BlogPost[] {
  const topics = [
    'APA 7 ipuçları',
    'MLA kaynakça rehberi',
    'Chicago not-bibliyografya',
    'IEEE numaralı atıf',
    'ACM SIGCONF biçimi',
    'Elsevier teslim kontrol listesi',
    'Springer Nature yazım kuralları',
    'PLOS ONE makale yapısı',
    'DergiPark sık hatalar',
    'TR Dizin biçim önerileri',
  ]
  const list: BlogPost[] = []
  const now = Date.now()
  for (let i = 1; i <= 100; i++) {
    const t = topics[i % topics.length]
    const title = `Akademik Formatlama ${i}: ${t}`
    list.push({
      id: String(i),
      title,
      slug: `akademik-formatlama-${i}`,
      excerpt: 'Dergi formatlarına uygun yazım için kısa bir rehber ve pratik uygulama adımları.',
      content: `${lorem(2)}\n\nBaşlıklar, tablo ve şekil etiketleri, metin içi atıflar ve kaynakça düzeni üzerine pratik öneriler. ${lorem(
        2
      )}\n\nSonuç olarak, şablon seçimi ve atıf kurallarının doğru uygulanması, değerlendirme sürecini iyileştirir.`,
      createdAt: new Date(now - i * 86400000).toISOString(),
      cover: 'https://pub-cdn.sider.ai/u/U024HZ0OZEV/web-coder/68b5d45a7b28bae4984d7674/resource/83c379ce-ff44-466e-b289-fa76ffb4bb1b.jpg',
    })
  }
  return list
}

/** Upserts JSON-LD for Article when a post is open */
function upsertArticleJsonLd(post: BlogPost | null) {
  const id = 'jsonld-article'
  const existing = document.getElementById(id)
  if (!post) {
    if (existing) existing.remove()
    return
  }
  let script = existing as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    document.head.appendChild(script)
  }
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.createdAt,
    author: { '@type': 'Organization', name: 'AI Journal Formatter' },
    image: post.cover ? [post.cover] : undefined,
  }
  script.textContent = JSON.stringify(json)
}

/**
 * BlogSection
 * Lists posts and shows a modal with details.
 */
export default function BlogSection() {
  const posts = React.useMemo(() => generatePosts(), [])
  const [query, setQuery] = React.useState('')
  const [open, setOpen] = React.useState<BlogPost | null>(null)
  const setTitle = useSEOStore((s) => s.setTitle)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((p) => (p.title + ' ' + p.excerpt + ' ' + p.content).toLowerCase().includes(q))
  }, [posts, query])

  React.useEffect(() => {
    upsertArticleJsonLd(open)
    if (open) setTitle(open.title + ' | Blog')
  }, [open, setTitle])

  return (
    <section aria-labelledby="blog-title" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 id="blog-title" className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Blog
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Akademik yazım ve dergi şablonları hakkında ipuçları ve rehber içerikler.
          </p>
        </div>
        <div className="w-full max-w-sm">
          <Input placeholder="Ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <article
            key={p.id}
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            {p.cover ? <img src={p.cover} className="h-32 w-full object-cover" /> : null}
            <div className="p-4">
              <h3 className="line-clamp-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">{p.title}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">{p.excerpt}</p>
              <div className="mt-3">
                <Button onClick={() => setOpen(p)}>Oku</Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Simple modal */}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
          onClick={() => setOpen(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{open.title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {new Date(open.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <Button onClick={() => setOpen(null)}>Kapat</Button>
            </div>
            {open.cover ? <img src={open.cover} className="mt-4 h-40 w-full rounded-lg object-cover" /> : null}
            <div className="prose prose-neutral mt-4 max-w-none text-neutral-800 dark:prose-invert dark:text-neutral-200">
              {open.content.split('\n').map((para, i) => (
                <p key={i} className="mb-3">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}