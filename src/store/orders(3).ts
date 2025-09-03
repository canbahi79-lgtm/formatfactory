/**
 * orders.ts
 * ---------------------------------------------------------
 * Keeps customer orders in a client-side Zustand store.
 * Each order represents a service request created from the payment flow.
 */

import { create } from 'zustand'
import type { CitationStyle, JournalTemplateKey } from '@/components/home/TemplatePicker'

/** Order status lifecycle */
export type OrderStatus = 'created' | 'paid' | 'cancelled'

/** Minimal attachment reference kept in memory */
export interface UploadedFileRef {
  /** Original filename */
  name: string
  /** File size in bytes */
  size: number
  /** MIME type */
  type: string
}

/** An order created by the customer through the checkout flow */
export interface Order {
  /** Unique order id (timestamp-based) */
  id: string
  /** Customer display name (optional) */
  customerName?: string
  /** Customer email (optional) */
  customerEmail?: string

  /** Manuscript file info (Word/PDF) */
  manuscript?: UploadedFileRef
  /** Whether the customer requested placing the manuscript into a template */
  placeIntoTemplate: boolean
  /** Optional template file to place into */
  templateFile?: UploadedFileRef

  /** Selected journal + style at the time of order */
  journal: JournalTemplateKey
  citationStyle: CitationStyle

  /** Pricing details (in TRY) */
  basePrice: number
  plagiarismRequested: boolean
  plagiarismFee: number
  totalPrice: number

  /** When the order was created */
  createdAt: string
  /** Current status */
  status: OrderStatus

  /** Admin-only fields */
  plagiarismPercent?: number
  plagiarismReport?: UploadedFileRef
}

/** Store shape */
interface OrdersState {
  orders: Order[]
  addOrder: (o: Order) => void
  updateOrder: (id: string, patch: Partial<Order>) => void
  clearAll: () => void
}

/**
 * useOrdersStore
 * Zustand store for CRUD operations on orders.
 */
export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
  updateOrder: (id, patch) =>
    set((s) => ({
      orders: s.orders.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    })),
  clearAll: () => set({ orders: [] }),
}))
