/**
 * auth.ts
 * ---------------------------------------------------------
 * Kullanıcı kimlik doğrulama state management. Zustand store.
 */

import { create } from 'zustand'

/** User interface */
interface User {
  id: string
  name: string
  email: string
  bio?: string
  createdAt: string
}

/** Auth state shape */
interface AuthState {
  /** Current user */
  currentUser: User | null
  /** Authentication state */
  isLoggedIn: boolean
  /** Modal visibility */
  isAuthModalOpen: boolean
  
  /** Actions */
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
  updateUserProfile: (data: Partial<User>) => Promise<void>
  setAuthModal: (open: boolean) => void
}

/**
 * useAuthStore
 * Zustand store for authentication state and actions.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isLoggedIn: false,
  isAuthModalOpen: false,

  login: async (email: string, password: string) => {
    // Simulate login API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'demo@example.com' && password === 'demo') {
          const user: User = {
            id: '1',
            name: 'Demo User',
            email: 'demo@example.com',
            bio: 'Demo kullanıcı',
            createdAt: new Date().toISOString(),
          }
          set({ currentUser: user, isLoggedIn: true })
          resolve()
        } else {
          reject(new Error('Geçersiz e-posta veya şifre'))
        }
      }, 1000)
    })
  },

  register: async (name: string, email: string, password: string) => {
    // Simulate register API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          const user: User = {
            id: Date.now().toString(),
            name,
            email,
            createdAt: new Date().toISOString(),
          }
          set({ currentUser: user, isLoggedIn: true })
          resolve()
        } else {
          reject(new Error('Şifre en az 6 karakter olmalı'))
        }
      }, 1000)
    })
  },

  signOut: () => {
    set({ currentUser: null, isLoggedIn: false })
  },

  updateUserProfile: async (data: Partial<User>) => {
    // Simulate update profile API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { currentUser } = get()
        if (currentUser) {
          const updatedUser = { ...currentUser, ...data }
          set({ currentUser: updatedUser })
          resolve()
        } else {
          reject(new Error('Kullanıcı bulunamadı'))
        }
      }, 500)
    })
  },

  setAuthModal: (open: boolean) => {
    set({ isAuthModalOpen: open })
  },
}))