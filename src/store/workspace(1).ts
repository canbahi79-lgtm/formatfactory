/**
 * workspace.ts
 * ---------------------------------------------------------
 * A small Zustand store that allows directory cards to push a template preset
 * to the ManuscriptWorkspace. The workspace listens and applies it.
 */

import { create } from 'zustand'
import type { TemplatePreset } from '@/data/journals'

interface WorkspaceState {
  /** Latest preset to apply */
  incomingPreset: TemplatePreset | null
  /** Monotonic counter to trigger effects */
  presetCounter: number
  /** Pushes a new preset */
  applyPreset: (preset: TemplatePreset) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  incomingPreset: null,
  presetCounter: 0,
  applyPreset: (preset) =>
    set((s) => ({
      incomingPreset: preset,
      presetCounter: s.presetCounter + 1,
    })),
}))
