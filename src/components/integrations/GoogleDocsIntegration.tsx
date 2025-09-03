/**
 * GoogleDocsIntegration.tsx
 * ---------------------------------------------------------
 * Google Docs entegrasyonu bileşeni. OAuth ile bağlantı ve senkronizasyon.
 */

import React from 'react'
import { FileText, Download, Upload, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react'

/** GoogleDocsIntegration: Google Docs entegrasyon kartı */
export default function GoogleDocsIntegration() {
  const [isConnected, setIsConnected] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [documents, setDocuments] = React.useState<Array<{
    id: string
    name: string
    lastModified: string
  }>>([])

  const handleConnect = () => {
    setLoading(true)
    // Simüle edilmiş OAuth bağlantısı
    setTimeout(() => {
      setIsConnected(true)
      setDocuments([
        { id: '1', name: 'Makale Taslağı.docx', lastModified: '2024-01-15' },
        { id: '2', name: 'Akademik Makale.docx', lastModified: '2024-01-10' },
      ])
      setLoading(false)
    }, 1500)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setDocuments([])
  }

  const handleSync = (docId: string) => {
    // Belge senkronizasyonu simülasyonu
    alert(`Belge ${docId} senkronize ediliyor...`)
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Google Docs</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Google Docs belgelerinizle senkronize çalışın
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
              Bağlı
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              Bağlı Değil
            </span>
          )}
        </div>
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Not:</strong> Google Docs entegrasyonu için Google OAuth kimlik doğrulaması gerekir.
                Bu demo amaçlıdır.
              </div>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Bağlanıyor...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Google Docs ile Bağlan
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Belgeleriniz
            </h4>
            <button
              onClick={handleDisconnect}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Bağlantıyı Kes
            </button>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-md border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {doc.name}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      Son düzenleme: {doc.lastModified}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSync(doc.id)}
                    className="rounded-md bg-neutral-100 p-1.5 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    title="Senkronize et"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => alert(`İndiriliyor: ${doc.name}`)}
                    className="rounded-md bg-neutral-100 p-1.5 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    title="İndir"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800">
              <Upload className="mr-2 h-4 w-4" />
              Yükle
            </button>
            <button className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <ExternalLink className="mr-2 h-4 w-4" />
              Google Docs Aç
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
