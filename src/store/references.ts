/**
 * references.ts
 * ---------------------------------------------------------
 * Kaynakça yönetimi state management. Zustand store.
 */

import { create } from 'zustand'

/** Reference interface */
export interface Reference {
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

/** References state shape */
interface ReferencesState {
  references: Reference[]
  
  /** Actions */
  addReference: (reference: Reference) => void
  updateReference: (id: string, data: Partial<Reference>) => void
  deleteReference: (id: string) => void
  clearAll: () => void
}

/**
 * useReferencesStore
 * Zustand store for managing references/citations.
 */
export const useReferencesStore = create<ReferencesState>((set) => ({
  references: [],
  
  addReference: (reference) => set((s) => ({ references: [reference, ...s.references] })),
  
  updateReference: (id, data) =>
    set((s) => ({
      references: s.references.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),
  
  deleteReference: (id) =>
    set((s) => ({ references: s.references.filter((r) => r.id !== id) })),
  
  clearAll: () => set({ references: [] }),
}))