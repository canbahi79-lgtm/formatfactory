/**
 * Home.tsx
 * Application landing page with hero, quick entrances, features and preview.
 * - No route changes: sections are navigated via hash anchors.
 * - Tailwind-based styling with accessible contrasts and semantic structure.
 */

import React from 'react'
import {
  Wand2,
  BookText,
  FileText,
  FileSearch,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react'

/** Section: semantic container with max-width constraint */
function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string
  title?: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="w-full">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        {title && (
          <header className="mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-slate-600">{subtitle}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}

/** FeatureCard: small informative card with icon + title + description */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  )
}

/** EntranceCard: clickable card to jump to page sections via hash anchors */
function EntranceCard({
  href,
  title,
  description,
  icon,
}: {
  href: string
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
      aria-label={title}
    >
      <div className="rounded-lg bg-slate-900 p-2 text-white group-hover:bg-indigo-600 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <ArrowRight className="size-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        </div>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </a>
  )
}

/** Divider: subtle horizontal separator */
function Divider() {
  return <hr className="my-10 border-slate-200" />
}

/** HomePage: main landing composed of hero, entrances, features and a preview */
export default function Home() {
  const entrances = [
    {
      href: '#workspace',
      title: 'Akıllı Biçimlendirici',
      description: 'Word/PDF’yi şablona göre biçimlendirin, kaynakça ve başlıkları düzenleyin.',
      icon: <Wand2 className="size-5" />,
    },
    {
      href: '#directory',
      title: 'Dergi Şablon Dizini',
      description: 'Dergileri alfabetik filtreleyin, kuralları görün ve preset’i uygulayın.',
      icon: <BookText className="size-5" />,
    },
    {
      href: '#rules',
      title: 'Yazım Kuralları',
      description: 'Dergi bazlı yazım ve biçim kurallarını kontrollü şekilde uygulayın.',
      icon: <FileText className="size-5" />,
    },
    {
      href: '#ai-tools',
      title: 'AI Araçları',
      description: 'Dilbilgisi düzeltme, özet çıkarma ve dergi uyum analizleri.',
      icon: <Sparkles className="size-5" />,
    },
  ]

  const features = [
    {
      icon: <FileSearch className="size-5" />,
      title: 'Hızlı Kurallar',
      description: 'Başlık seviyeleri, satır aralığı, tablo/şekil yerleşimi ve referans biçimi.',
    },
    {
      icon: <Search className="size-5" />,
      title: 'Dergi Eşleştirme',
      description: 'Konunuza uygun dergileri etiketlerle bulun, template’i tek tıkla uygulayın.',
    },
    {
      icon: <Wand2 className="size-5" />,
      title: 'Akıllı Dönüştürme',
      description: 'DOCX/PDF metnini şablona dönüştürürken yapıyı korur, stil bozulmaz.',
    },
    {
      icon: <Sparkles className="size-5" />,
      title: 'AI Yardımı',
      description: 'Dil parlatma, kısaltma/açıklama önerileri ve özet oluşturma.',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_80%_-10%,rgba(79,70,229,0.15),transparent)]" />
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-12 md:py-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                AI Journal Formatter
              </h1>
              <p className="mt-4 text-slate-600">
                Dergi şablonlarına uyumlu akademik biçimlendirme, akıllı kurallar ve AI destekli düzenleme.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#workspace"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-indigo-700 transition-colors"
                >
                  <Wand2 className="size-4" />
                  Başla: Biçimlendir
                </a>
                <a
                  href="#directory"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-900 hover:border-indigo-400 hover:text-indigo-700 transition-colors bg-white"
                >
                  <BookText className="size-4" />
                  Dergi Dizini
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Smart placeholder image per spec */}
                <img
                  src="https://pub-cdn.sider.ai/u/U024HZ0OZEV/web-coder/68b5d45a7b28bae4984d7674/resource/71414bd2-b66b-476e-b40e-7c9dea7b6cb4.jpg"
                  alt="Uygulama önizleme"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-indigo-200/40 blur-2xl" />
            </div>
          </div>
        </div>
      </div>

      <Section
        title="Hızlı Girişler"
        subtitle="En çok kullanılan modüllere tek tıkla ulaşın."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {entrances.map((e) => (
            <EntranceCard
              key={e.title}
              href={e.href}
              title={e.title}
              description={e.description}
              icon={e.icon}
            />
          ))}
        </div>
      </Section>

      <Divider />

      <Section
        id="features"
        title="Öne Çıkan Özellikler"
        subtitle="Dergi uyumu, otomatik biçimlendirme ve AI yardımı bir arada."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((f) => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              description={f.description}
            />
          ))}
        </div>
      </Section>

      <Divider />

      {/* Teaser sections with anchors (no routing change) */}
      <Section
        id="workspace"
        title="Çalışma Alanı"
        subtitle="Belgenizi yükleyin ve seçtiğiniz dergi şablonuna göre otomatik biçimlendirin."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">Biçimlendirme Akışı</h3>
            <ul className="mt-2 list-disc pl-5 text-slate-600">
              <li>DOCX/PDF içe aktar</li>
              <li>Hedef dergi şablonu seç</li>
              <li>Başlıklar, referanslar, tablo/şekil ve stiller</li>
              <li>Önizle ve dışa aktar</li>
            </ul>
            <a href="#ai-tools" className="mt-4 inline-flex items-center gap-2 text-indigo-700 hover:underline">
              AI yardımı ile hızlandır <ArrowRight className="size-4" />
            </a>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <img
              src="https://pub-cdn.sider.ai/u/U024HZ0OZEV/web-coder/68b5d45a7b28bae4984d7674/resource/ccd8a6cf-6afc-48f9-8d24-fa1c93c405e7.jpg"
              alt="Biçimlendirme önizleme"
              className="h-64 w-full rounded-lg object-cover"
            />
          </div>
        </div>
      </Section>

      <Divider />

      <Section
        id="directory"
        title="Dergi Şablon Dizini"
        subtitle="Alfabetik filtre, arama ve yazım kuralları. Preset’i çalışma alanına uygulayın."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-slate-600">
              Dergileri ada veya etikete göre bulun. TR alfabesine göre sıralı filtre. Kurallar ve şablon bilgilerini görün.
            </p>
            <div className="mt-4 flex gap-3">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                <Search className="size-3" /> Ara
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                #TR-alfabesi
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                Preset
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <img
              src="https://pub-cdn.sider.ai/u/U024HZ0OZEV/web-coder/68b5d45a7b28bae4984d7674/resource/260ef91f-a7b0-498e-950d-4974e8fc3575.jpg"
              alt="Dergi dizini önizleme"
              className="h-64 w-full rounded-lg object-cover"
            />
          </div>
        </div>
      </Section>

      <Divider />

      <Section
        id="rules"
        title="Yazım Kuralları"
        subtitle="Başlık seviyeleri, biçim kuralları, kaynakça stili ve makale şablonları."
      >
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-slate-600">
            DergiPark ve diğer dizinler için kuralları derleyin, tek tıkla uygulayın. CORS/robots kısıtlarını aşmak için sunucu tarafı proxy veya /api/journals kullanın.
          </p>
        </div>
      </Section>

      <Divider />

      <Section
        id="ai-tools"
        title="AI Araçları"
        subtitle="Dil parlatma, özet, başlık/özet uyum kontrolü ve dergi eşleştirme."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FeatureCard
            icon={<Sparkles className="size-5" />}
            title="Dilbilgisi ve Stil"
            description="Cümle akışı, akademik ton ve terminoloji tutarlılığı."
          />
          <FeatureCard
            icon={<Wand2 className="size-5" />}
            title="Otomatik Özet"
            description="Bölüm bazlı kısa özetler ve dergiye uygun uzunluk önerileri."
          />
        </div>
      </Section>

      <footer className="mx-auto mt-12 w-full max-w-6xl px-4 md:px-6 pb-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Not: Tarama işlemi CORS/robots nedeniyle frontend’te kısıtlı olabilir. Sunucunuzda /api/journals endpoint’i ile sağlayın.
        </div>
      </footer>
    </main>
  )
}
