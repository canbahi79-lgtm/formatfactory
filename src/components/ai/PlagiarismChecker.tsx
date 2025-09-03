/**
 * PlagiarismChecker.tsx
 * ---------------------------------------------------------
 * Intihal kontrolü bölümü: metin yükleme, analiz ve sonuç gösterimi.
 */

import React from 'react'
import { Search, FileText, AlertTriangle, CheckCircle, Upload } from 'lucide-react'

/** PlagiarismChecker: Intihal kontrolü bileşeni */
export default function PlagiarismChecker() {
  const [text, setText] = React.useState('')
  const [file, setFile] = React.useState<File | null>(null)
  const [analyzing, setAnalyzing] = React.useState(false)
  const [result, setResult] = React.useState<{
    score: number
    status: 'clean' | 'warning' | 'plagiarized'
    sources?: Array<{ url: string; similarity: number }>
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      // Dosya içeriğini oku (gerçek uygulamada backend'e gönderilir)
      const reader = new FileReader()
      reader.onload = (e) => {
        setText(e.target?.result as string)
      }
      reader.readAsText(f)
    }
  }

  const handleAnalyze = () => {
    if (!text.trim()) return

    setAnalyzing(true)
    // Simüle edilmiş analiz (gerçek uygulamada API çağrısı yapılır)
    setTimeout(() => {
      const score = Math.random() * 100
      let status: 'clean' | 'warning' | 'plagiarized' = 'clean'
      if (score > 70) status = 'plagiarized'
      else if (score > 30) status = 'warning'

      setResult({
        score,
        status,
        sources: status !== 'clean' ? [
          { url: 'https://example.com/source1', similarity: Math.round(score * 0.8) },
          { url: 'https://example.com/source2', similarity: Math.round(score * 0.6) },
        ] : undefined,
      })
      setAnalyzing(false)
    }, 2000)
  }

  return (
    <section id="plagiarism" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-black/5 p-2 text-black dark:bg-white/10 dark:text-white">
          <Search className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Intihal Kontrolü</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Metninizi veya dosyanızı yükleyerek intihal oranı kontrol edin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sol: Giriş */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Metin Girin veya Dosya Yükleyin
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Kontrol edilecek metni buraya yapıştırın..."
              className="min-h-[200px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Veya Dosya Yükle (TXT, DOC, DOCX, PDF)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400">
                  <Upload className="h-4 w-4" />
                  Dosya Seç
                </div>
              </label>
              {file && (
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  {file.name}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || analyzing}
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {analyzing ? 'Analiz Ediliyor...' : 'Intihal Kontrolü Yap'}
          </button>
        </div>

        {/* Sağ: Sonuç */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Sonuçlar
          </h3>

          {!result ? (
            <div className="flex h-64 items-center justify-center text-center text-neutral-500 dark:text-neutral-400">
              <div>
                <FileText className="mx-auto h-12 w-12" />
                <p className="mt-2">Henüz analiz yapılmadı</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-4 dark:bg-neutral-950">
                <div className="flex items-center gap-3">
                  {result.status === 'clean' && <CheckCircle className="h-6 w-6 text-emerald-600" />}
                  {result.status === 'warning' && <AlertTriangle className="h-6 w-6 text-amber-600" />}
                  {result.status === 'plagiarized' && <AlertTriangle className="h-6 w-6 text-rose-600" />}
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {result.status === 'clean' && 'Temiz'}
                      {result.status === 'warning' && 'Düşük Benzerlik'}
                      {result.status === 'plagiarized' && 'Yüksek Benzerlik'}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Benzerlik Oranı: {result.score.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {result.sources && result.sources.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Benzer Kaynaklar
                  </h4>
                  <div className="space-y-2">
                    {result.sources.map((source, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {source.url}
                        </a>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          %{source.similarity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                <strong>Not:</strong> Bu bir demo sonuçtur. Gerçek intihal kontrolü için profesyonel servisler
                kullanılmalıdır.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
