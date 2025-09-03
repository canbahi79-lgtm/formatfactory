/**
 * UserProfile.tsx
 * ---------------------------------------------------------
 * Kullanıcı profili yönetimi bileşeni. Zustand store ile entegre çalışır.
 */

import React from 'react'
import { useAuthStore } from '@/store/auth'
import { User, Mail, Calendar, Edit, Save, X } from 'lucide-react'

/** UserProfile: Kullanıcı profili düzenleme ve gösterme */
export default function UserProfile() {
  const { currentUser, updateUserProfile } = useAuthStore()
  const [isEditing, setIsEditing] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
  })
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateUserProfile(formData)
      setMessage('Profil güncellendi')
      setIsEditing(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(err.message || 'Güncelleme başarısız')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      bio: currentUser?.bio || '',
    })
    setIsEditing(false)
  }

  if (!currentUser) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <User className="mx-auto h-12 w-12 text-neutral-400" />
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Giriş yapmadınız. Lütfen giriş yapın.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Kullanıcı Profili
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-md bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
            >
              <Edit className="h-4 w-4" />
              Düzenle
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {message && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Ad Soyad
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-neutral-900 dark:text-neutral-100">
                <User className="h-4 w-4 text-neutral-500" />
                {currentUser.name}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              E-posta
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-neutral-900 dark:text-neutral-100">
                <Mail className="h-4 w-4 text-neutral-500" />
                {currentUser.email}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Kayıt Tarihi
            </label>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Calendar className="h-4 w-4" />
              {new Date(currentUser.createdAt).toLocaleDateString('tr-TR')}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                placeholder="Kendinizden bahsedin..."
              />
            ) : (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {currentUser.bio || 'Bio bilgisi girilmemiş.'}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {loading ? 'Kaydediliyor...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="mr-2 h-4 w-4" />
                İptal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
