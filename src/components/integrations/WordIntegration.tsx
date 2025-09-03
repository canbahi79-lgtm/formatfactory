/**
 * WordIntegration.tsx
 * ---------------------------------------------------------
 * Microsoft Word entegrasyonu bileşeni. Dosya yükleme ve şablon uygulama.
 */

import React from 'react'
import { FileText, Download, Upload, RefreshCw, File, AlertCircle } from 'lucide-react'

/** WordIntegration: Microsoft Word entegrasyon kartı */
export default function WordIntegration() {
  const [loading, setLoading] = React.useState(false)
  const [recentFiles, setRecentFiles] = React.useState<Array<{
    id: string
    name: string
    size: string
    lastModified: string
  }>>([
    { id: '1', name: 'Makale_v1.docx', size: '245 KB', lastModified: '2024-01-15' },
    { id: '2', name: 'Taslak_Makale.docx', size: '189 KB', lastModified: '2024-01-12' },
  ])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLoading(true)
      // Simüle edilmiş yükleme
      setTimeout(() => {
        setRecentFiles(prev => [
          {
            id: String(Date.now()),
            name: file.name,
            size: `${(file.size / 1024).toFixed(0)} KB`,
            lastModified: new Date().toLocaleDateString('tr-TR'),
          },
          ...prev,
        ])
        setLoading(false)
        alert(`${file.name} yüklendi`)
      }, 1000)
    }
  }

  const handleApplyTemplate = (fileId: string) => {
    alert(`Şablon uygulanıyor: ${fileId}`)
  }

  const handleDownload = (fileId: string) => {
    alert(`İndiriliyor: ${fileId}`)
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Microsoft Word</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Word belgelerinizi yükleyin ve şablonları uygulayın
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Not:</strong> Word entegrasyonu için Microsoft Office API veya COM otomasyonu gerekir.
              Bu demo amaçlıdır.
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Word Belgesi Yükle
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept=".doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400">
                <Upload className="h-4 w-4" />
                {loading ? 'Yükleniyor...' : 'DOC/DOCX Seç'}
              </div>
            </label>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Son Dosyalar
          </h4>
          <div className="space-y-2">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-md border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-3">
                  <File className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {file.name}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      {file.size} • {file.lastModified}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApplyTemplate(file.id)}
                    className="rounded-md bg-neutral-100 p-1.5 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    title="Şablon uygula"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(file.id)}
                    className="rounded-md bg-neutral-100 p-1.5 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    title="İndir"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800">
            <File className="mr-2 h-4 w-4" />
            Yeni Belge Oluştur
          </button>
          <button className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <FileText className="mr-2 h-4 w-4" />
            Word Aç
          </button>
        </div>
      </div>
    </div>
  )
}
