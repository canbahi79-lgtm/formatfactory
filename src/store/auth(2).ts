/**
 * auth.ts
 * ---------------------------------------------------------
 * Basit üyelik ve yetkilendirme store'u.
 * - LocalStorage kalıcılığı
 * - Admin ön tanımlı kullanıcı (mail/şifre)
 * - Auth modal kontrolü
 */

import { create } from 'zustand'

/** Kullanıcı rolü */
export type UserRole = 'user' | 'admin'

/** Uygulama içinde kullanılan kullanıcı modeli (demo amaçlı) */
export interface User {
  id: string
  email: string
  name?: string
  /** Demo için düz metin şifre. Gerçekte asla düz metin tutmayın. */
  password: string
  role: UserRole
}

/** Auth store state/aksiyonları */
interface AuthState {
  currentUser: User | null
  users: User[]
  authModalOpen: boolean
  /** Aç/kapat */
  setAuthModal: (open: boolean) => void
  /** Üye ol (basit doğrulama) */
  signUp: (email: string, password: string, name?: string) => { ok: boolean; message?: string }
  /** Giriş yap */
  signIn: (email: string, password: string) => { ok: boolean; message?: string }
  /** Çıkış yap */
  signOut: () => void
  /** Yardımcılar */
  isLoggedIn: () => boolean
  isAdmin: () => boolean
}

/** LocalStorage anahtarı */
const KEY = 'auth-demo-state-v1'

/** Başlangıç kullanıcıları: admin sabit */
const defaultUsers: User[] = [
  {
    id: 'admin-1',
    email: 'canbahi79@gmail.com',
    password: '201456',
    name: 'Admin',
    role: 'admin',
  },
]

/** LocalStorage'dan oku */
function load(): { currentUser: User | null; users: User[] } {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { currentUser: null, users: defaultUsers }
    const parsed = JSON.parse(raw)
    return {
      currentUser: parsed.currentUser ?? null,
      users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : defaultUsers,
    }
  } catch {
    return { currentUser: null, users: defaultUsers }
  }
}

/** LocalStorage'a yaz */
function save(state: { currentUser: User | null; users: User[] }) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initial = typeof window !== 'undefined' ? load() : { currentUser: null, users: defaultUsers }

  return {
    currentUser: initial.currentUser,
    users: initial.users,
    authModalOpen: false,

    setAuthModal: (open) => set({ authModalOpen: open }),

    signUp: (email, password, name) => {
      const emailNorm = String(email || '').trim().toLowerCase()
      const pwd = String(password || '')
      if (!emailNorm || !pwd) return { ok: false, message: 'E-posta ve şifre zorunludur.' }
      const exists = get().users.some((u) => u.email.toLowerCase() === emailNorm)
      if (exists) return { ok: false, message: 'Bu e-posta zaten kayıtlı.' }
      const user: User = { id: String(Date.now()), email: emailNorm, password: pwd, name, role: 'user' }
      const users = [...get().users, user]
      const currentUser = user
      set({ users, currentUser })
      save({ users, currentUser })
      return { ok: true }
    },

    signIn: (email, password) => {
      const emailNorm = String(email || '').trim().toLowerCase()
      const pwd = String(password || '')
      const user = get().users.find((u) => u.email.toLowerCase() === emailNorm && u.password === pwd) || null
      if (!user) return { ok: false, message: 'Geçersiz e-posta/şifre.' }
      set({ currentUser: user })
      save({ users: get().users, currentUser: user })
      return { ok: true }
    },

    signOut: () => {
      set({ currentUser: null })
      save({ users: get().users, currentUser: null })
    },

    isLoggedIn: () => !!get().currentUser,
    isAdmin: () => get().currentUser?.role === 'admin',
  }
})