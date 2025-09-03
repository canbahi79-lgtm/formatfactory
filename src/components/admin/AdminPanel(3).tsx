/**
 * AdminPanel.tsx
 * ---------------------------------------------------------
 * In-session admin area to monitor orders, see plagiarism requests,
 * and upload plagiarism results (percentage + optional report file).
 */

import React from 'react'
import { useOrdersStore, type Order } from '@/store/orders'
import { ShieldAlert } from 'lucide-react'

/** UI fallbacks */
let Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>
let Input: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>

try {
  // @ts-ignore
  Button = require('../ui/button').Button
  // @ts-ignore
  Input = require('../ui/input').Input
} catch {
  Button = (props) => (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 ' +
        (props.className ?? '')
      }
    />
  )
  Input = (props) => (
    <input
      {...props}
      className={
        'h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ' +
        (props.className ?? '')
      }
    />
  )
}

/** Single row editor for plagiarism results */
function PlagiarismEditor({ order }: { order: Order }) {
  const update = useOrdersStore((s) => s.updateOrder)
  const [percent, setPercent] = React.useState<number | ''>(order.plagiarismPercent ?? '')
  const [file, setFile] = React.useState<File | null>(null)

  const handleSave = () => {
    update(order.id, {
      plagiarismPercent: typeof percent === 'number' ? percent : undefined,
      plagiarismReport: file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        : undefined,
    })
    setFile(null)
    alert('İntihal sonucu güncellendi.')
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div>
        <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">İntihal %</label>
        <Input
          type="number"
          min={0}
          max={100}
          value={percent}
          onChange={(e) => setPercent(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Örn. 12"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-neutral-600 dark:text-neutral-400">Rapor Dosyası (opsiyonel)</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full cursor-pointer rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>
      <div className="sm:col-span-3 flex justify-end">
        <Button onClick={handleSave}>Kaydet</Button>
      </div>
    </div>
  )
}

/**
 * AdminPanel
 * Shows the latest orders and highlights plagiarism requests.
 */
export default function AdminPanel() {
  const orders = useOrdersStore((s) => s.orders)

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-black/5 p-2 text-black dark:bg-white/10 dark:text-white">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Admin Paneli</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Siparişleri görüntüleyin. İntihal raporu istenenleri işaretli görün ve sonuçları yükleyin.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          Henüz sipariş yok.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold">#{o.id}</span> • {new Date(o.createdAt).toLocaleString('tr-TR')} •{' '}
                  {o.journal.toUpperCase()} / {o.citationStyle.toUpperCase()}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Toplam: <span className="font-semibold">{o.totalPrice} TL</span>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                <div className="text-neutral-600 dark:text-neutral-400">
                  Müşteri: {o.customerName || '-'} ({o.customerEmail || '-'})
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  Makale: {o.manuscript ? o.manuscript.name : '-'}
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  Şablona Yerleştirme: {o.placeIntoTemplate ? 'Evet' : 'Hayır'}
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  Şablon Dosyası: {o.templateFile ? o.templateFile.name : '-'}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {o.plagiarismRequested ? (
                  <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                    İntihal raporu İSTENİYOR
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
                    İntihal raporu yok
                  </span>
                )}
                {typeof o.plagiarismPercent === 'number' ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                    Sonuç: %{o.plagiarismPercent}
                  </span>
                ) : null}
                {o.plagiarismReport ? (
                  <span className="inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
                    Rapor: {o.plagiarismReport.name}
                  </span>
                ) : null}
              </div>

              {o.plagiarismRequested ? <PlagiarismEditor order={o} /> : null}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
