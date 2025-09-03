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
  User,
  Save,
  Settings,
  LogOut,
  Link,
  FileCheck,
  Shield,
} from 'lucide-react'
import JournalDirectory from '@/components/directory/JournalDirectory'
import ManuscriptWorkspace from '@/components/workspace/ManuscriptWorkspace'
import AIToolsSection from '@/components/ai/AIToolsSection'
import ReferencesManager from '@/components/references/ReferencesManager'
import WorksManager from '@/components/works/WorksManager'
import GoogleDocsIntegration from '@/components/integrations/GoogleDocsIntegration'
import WordIntegration from '@/components/integrations/WordIntegration'
import UserProfile from '@/components/auth/UserProfile'
import PlagiarismChecker from '@/components/ai/PlagiarismChecker'
import AuthModal from '@/components/auth/AuthModal'

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
      description: 'Word/PDFyi şablona göre biçimlendirin, kaynakça ve başlıkları düzenleyin.',
      icon: <Wand2 className="size-5" />,
    },
    {
      href: '#directory',
      title: 'Dergi Şablon Dizini',
      description: 'Dergileri alfabetik filtreleyin, kuralları görün ve preseti uygulayın.',
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
      description: 'Konunuza uygun dergileri etiketlerle bulun, templatei tek tıkla uygulayın.',
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

      {/* Journal Directory Section */}
      <Section
        id="directory"
        title="Dergi Şablon Dizini"
        subtitle="Dergileri alfabetik filtreleyin, kuralları görün ve preseti uygulayın."
      >
        <JournalDirectory />
      </Section>

      {/* Manuscript Workspace Section */}
      <Section
        id="workspace"
        title="Çalışma Alanı"
        subtitle="Belgenizi yükleyin, düzenleyin ve dışa aktarın."
      >
        <ManuscriptWorkspace />
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
        <AIToolsSection />
      </Section>

      <Divider />

      {/* References Section */}
      <Section
        id="references"
        title="Referans Yönetimi"
        subtitle="Alıntı formatlama, kaynakça yönetimi ve plagiarism kontrolü."
      >
        <ReferencesManager />
      </Section>

      <Divider />

      {/* Works Section */}
      <Section
        id="works"
        title="Çalışmalarım"
        subtitle="Kayıtlı çalışmalarınızı yönetin ve düzenleyin."
      >
        <WorksManager />
      </Section>

      <Divider />

      {/* Integrations Section */}
      <Section
        id="integrations"
        title="Entegrasyonlar"
        subtitle="Google Docs, Microsoft Word ve dergi APIleri ile bağlantı."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <GoogleDocsIntegration />
          <WordIntegration />
        </div>
      </Section>

      <Divider />

      {/* User Profile Section */}
      <Section
        id="profile"
        title="Profil"
        subtitle="Kullanıcı bilgilerinizi yönetin."
      >
        <UserProfile />
      </Section>

      <Divider />

      {/* Plagiarism Checker Section */}
      <Section
        id="plagiarism"
        title="Plagiarism Kontrolü"
        subtitle="Metinlerinizi benzerlik açısından kontrol edin."
      >
        <PlagiarismChecker />
      </Section>

      <footer className="mx-auto mt-12 w-full max-w-6xl px-4 md:px-6 pb-12">
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Not: Tarama işlemi CORS/robots nedeniyle frontend'te kısıtlı olabilir. Sunucunuzda /api/journals endpoint'i ile sağlayın.
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal />
    </main>
  )
}