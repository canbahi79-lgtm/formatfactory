/**
 * SEOHead.tsx
 * ---------------------------------------------------------
 * Injects SEO-related tags into document head: title, description, keywords, robots, canonical,
 * and a basic JSON-LD Website schema. React Helmet is not used (not preinstalled), so we manage head manually.
 */

import React from 'react'
import { useSEOStore } from '@/store/seo'

/** Ensures a unique meta tag exists or is updated */
function upsertMeta(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Ensures or updates the canonical link */
function upsertCanonical(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

/** Inserts or replaces a JSON-LD script by id */
function upsertJsonLd(id: string, json: object) {
  let script = document.getElementById(id) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(json)
}

/**
 * SEOHead
 * Listens to store changes and updates document head meta.
 */
export default function SEOHead() {
  const { title, description, keywords, allowIndex } = useSEOStore()

  React.useEffect(() => {
    // Title
    document.title = title

    // Meta tags
    upsertMeta('description', description)
    upsertMeta('keywords', keywords.join(', '))
    upsertMeta('robots', allowIndex ? 'index, follow' : 'noindex, nofollow')

    // Canonical (hash router warning, but still set)
    const url = window.location.href
    upsertCanonical(url)

    // Basic Website JSON-LD
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: title,
      url: url,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${url}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }
    upsertJsonLd('jsonld-website', jsonLd)
  }, [title, description, keywords, allowIndex])

  return null
}