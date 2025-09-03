/**
 * ReferencesManager.tsx
 * ---------------------------------------------------------
 * Kaynakça yönetimi bileşeni. Alıntı ekleme, düzenleme, formatlama ve dışa aktarma.
 */

import React from 'react'
import { useReferencesStore } from '@/store/references'
import { BookOpen, Plus, Edit, Trash2, Download, FileText } from 'lucide-react'

/** Reference interface */
interface Reference {
  id: string
  type: 'book' | 'article' | 'chapter' | 'thesis' | 'web'
  title: string
  author: string
  year: string
  publisher?: string
  journal?: string
  pages?: string
  url?: string
  doi?: string
}

/** ReferencesManager: Kaynakça yönetimi */
export default function ReferencesManager() {
  const { references, addReference, updateReference, deleteReference } = useReferencesStore()
  const [isAdding, setIsAdding] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<Partial<Reference>>({
    type: 'article',
    title: '',
    author: '',
    year: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.author || !formData.year) return

    if (editingId) {
      updateReference(editingId, formData as Reference)
      setEditingId(null)
    } else {
      addReference({
        id: Date.now().toString(),
        ...formData as Reference,
      } as Reference)
    }

    setFormData({ type: 'article', title: '', author: '', year: '' })
    setIsAdding(false)
  }

  const handleEdit = (ref: Reference) => {
    setFormData(ref)
    setEditingId(ref.id)
    setIsAdding(true)
  }

  const handleCancel = () => {
    setFormData({ type: 'article', title: '', author: '', year: '' })
    setIsAdding(false)
    setEditingId(null)
  }

  const formatReference = (ref: Reference): string => {
    const { author, year, title, type, journal, publisher, pages, url, doi } = ref
    
    switch (type) {
      case 'book':
        return `${author} (${year}). ${title}. ${publisher}.`
      case 'article':
        return `${author} (${year}). ${title}. ${journal}, ${pages}.`
      case 'chapter':
        return `${author} (${year}). ${title}. In: ${publisher}, ${pages}.`
      case 'thesis':
        return `${author} (${year}). ${title}. [Thesis].`
      case 'web':
        return `${author} (${year}). ${title}. Available from: ${url}`
      default:
        return `${author} (${year}). ${title}.`
    }
  }

  return (
    <section id="references" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-black/5 p-2 text-black dark:bg-white/10 dark:text-white">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Referans Yönetimi
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Kaynakçanızı yönetin, farklı formatlara göre dışa aktarın.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol: Form */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {editingId ? 'Kaynakça Düzenle' : 'Yeni Kaynakça Ekle'}
              </h3>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  <Plus className="h-4 w-4" />
                  Ekle
                </button>
              )}
            </div>

            {isAdding && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Tür
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Reference['type'] })}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  >
                    <option value="article">Makale</option>
                    <option value="book">Kitap</option>
                    <option value="chapter">Kitap Bölümü</option>
                    <option value="thesis">Tez</option>
                    <option value="web">Web Sayfası</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Yazar(lar) *
                  </label>
                  <input
                    type="text"
                    value={formData.author || ''}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    placeholder="Örn: Smith, J."
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Yıl *
                  </label>
                  <input
                    type="text"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    placeholder="2024"
                    required
                  />
                </div>

                {formData.type === 'article' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Dergi
                    </label>
                    <input
                      type="text"
                      value={formData.journal || ''}
                      onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                      className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                )}

                {formData.type === 'book' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Yayıncı
                    </label>
                    <input
                      type="text"
                      value={formData.publisher || ''}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                )}

                {(formData.type === 'article' || formData.type === 'chapter') && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Sayfalar
                    </label>
                    <input
                      type="text"
                      value={formData.pages || ''}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      placeholder="125-140"
                    />
                  </div>
                )}

                {formData.type === 'web' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      URL
                    </label>
                    <input
                      type="url"
                      value={formData.url || ''}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    {editingId ? 'Güncelle' : 'Ekle'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
                  >
                    İptal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sağ: Liste */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Kaynakça Listesi ({references.length})
              </h3>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800">
                  <Download className="h-4 w-4" />
                  Dışa Aktar
                </button>
              </div>
            </div>

            {references.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-neutral-400" />
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  Henüz kaynakça eklenmemiş.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {references.map((ref) => (
                  <div
                    key={ref.id}
                    className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-neutral-900 dark:text-neutral-100">
                          {formatReference(ref)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
                            {ref.type === 'article' && 'Makale'}
                            {ref.type === 'book' && 'Kitap'}
                            {ref.type === 'chapter' && 'Bölüm'}
                            {ref.type === 'thesis' && 'Tez'}
                            {ref.type === 'web' && 'Web'}
                          </span>
                          {ref.doi && (
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              DOI: {ref.doi}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(ref)}
                          className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteReference(ref.id)}
                          className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}