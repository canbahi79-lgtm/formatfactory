/**
 * WorksManager.tsx
 * ---------------------------------------------------------
 * Çalışmalar yönetimi bileşeni. Makale taslaklarını kaydetme, düzenleme ve yönetme.
 */

import React from 'react'
import { useWorksStore } from '@/store/works'
import { useAuthStore } from '@/store/auth'
import { FileText, Plus, Edit, Trash2, Download, Eye, Calendar } from 'lucide-react'
import LockOverlay from '@/components/common/LockOverlay'

/** Work interface */
interface Work {
  id: string
  title: string
  content: string
  journal?: string
  status: 'draft' | 'submitted' | 'published'
  createdAt: string
  updatedAt: string
}

/** WorksManager: Çalışmalar yönetimi */
export default function WorksManager() {
  const { works, addWork, updateWork, deleteWork } = useWorksStore()
  const { isLoggedIn } = useAuthStore()
  const [isAdding, setIsAdding] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<Partial<Work>>({
    title: '',
    content: '',
    journal: '',
    status: 'draft',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) return

    const now = new Date().toISOString()
    if (editingId) {
      updateWork(editingId, {
        ...formData,
        updatedAt: now,
      } as Work)
      setEditingId(null)
    } else {
      addWork({
        id: Date.now().toString(),
        ...formData,
        createdAt: now,
        updatedAt: now,
      } as Work)
    }

    setFormData({ title: '', content: '', journal: '', status: 'draft' })
    setIsAdding(false)
  }

  const handleEdit = (work: Work) => {
    setFormData(work)
    setEditingId(work.id)
    setIsAdding(true)
  }

  const handleCancel = () => {
    setFormData({ title: '', content: '', journal: '', status: 'draft' })
    setIsAdding(false)
    setEditingId(null)
  }

  const getStatusColor = (status: Work['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'published':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
    }
  }

  const getStatusText = (status: Work['status']) => {
    switch (status) {
      case 'draft':
        return 'Taslak'
      case 'submitted':
        return 'Gönderildi'
      case 'published':
        return 'Yayınlandı'
      default:
        return status
    }
  }

  return (
    <section id="works" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-black/5 p-2 text-black dark:bg-white/10 dark:text-white">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Çalışmalarım
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Makale taslaklarınızı kaydedin, düzenleyin ve yönetin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol: Form */}
        <div className="lg:col-span-1">
          <div className="relative rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {!isLoggedIn && <LockOverlay message="Çalışmalarınızı yönetmek için giriş yapın." />}

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {editingId ? 'Çalışma Düzenle' : 'Yeni Çalışma'}
              </h3>
              {!isAdding && isLoggedIn && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  <Plus className="h-4 w-4" />
                  Ekle
                </button>
              )}
            </div>

            {isAdding && isLoggedIn && (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    İçerik *
                  </label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="min-h-[120px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Hedef Dergi
                  </label>
                  <input
                    type="text"
                    value={formData.journal || ''}
                    onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    placeholder="Dergi adı"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Work['status'] })}
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  >
                    <option value="draft">Taslak</option>
                    <option value="submitted">Gönderildi</option>
                    <option value="published">Yayınlandı</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    {editingId ? 'Güncelle' : 'Kaydet'}
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
                Çalışmalarım ({works.length})
              </h3>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800">
                  <Download className="h-4 w-4" />
                  Dışa Aktar
                </button>
              </div>
            </div>

            {works.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-neutral-400" />
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  {isLoggedIn ? 'Henüz çalışma eklenmemiş.' : 'Çalışmalarınızı görmek için giriş yapın.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {works.map((work) => (
                  <div
                    key={work.id}
                    className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                          {work.title}
                        </h4>
                        {work.journal && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Hedef: {work.journal}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(work.status)}`}>
                            {getStatusText(work.status)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <Calendar className="h-3 w-3" />
                            {new Date(work.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                          {work.content}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(work)}
                          className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => alert(`İçerik görüntüleniyor: ${work.title}`)}
                          className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteWork(work.id)}
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