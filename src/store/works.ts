/**
 * works.ts
 * ---------------------------------------------------------
 * Çalışmalar yönetimi state management. Zustand store.
 */

import { create } from 'zustand'

/** Work interface */
export interface Work {
  id: string
  title: string
  content: string
  journal?: string
  status: 'draft' | 'submitted' | 'published'
  createdAt: string
  updatedAt: string
}

/** Works state shape */
interface WorksState {
  works: Work[]
  
  /** Actions */
  addWork: (work: Work) => void
  updateWork: (id: string, data: Partial<Work>) => void
  deleteWork: (id: string) => void
  clearAll: () => void
}

/**
 * useWorksStore
 * Zustand store for managing user's works/manuscripts.
 */
export const useWorksStore = create<WorksState>((set) => ({
  works: [],
  
  addWork: (work) => set((s) => ({ works: [work, ...s.works] })),
  
  updateWork: (id, data) =>
    set((s) => ({
      works: s.works.map((w) => (w.id === id ? { ...w, ...data } : w)),
    })),
  
  deleteWork: (id) =>
    set((s) => ({ works: s.works.filter((w) => w.id !== id) })),
  
  clearAll: () => set({ works: [] }),
}))