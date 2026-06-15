'use client'

import { PantryItem } from '@/lib/types'

const CATEGORY_ICONS: Record<string, string> = {
  heladera: '🧊',
  freezer: '❄️',
  verduras: '🥦',
  despensa: '🫙',
}

interface PantryListProps {
  items: PantryItem[]
  onRemove: (id: string) => void
}

export default function PantryList({ items, onRemove }: PantryListProps) {
  async function remove(id: string) {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.from('pantry_items').delete().eq('id', id)
    onRemove(id)
  }

  const grouped = items.reduce((acc: Record<string, PantryItem[]>, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🛒</p>
        <p className="text-zinc-400 text-sm">Tu despensa está vacía</p>
        <p className="text-zinc-600 text-xs mt-1">Agregá lo que tenés en tu cocina</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat}>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            {CATEGORY_ICONS[cat]} {cat}
          </p>
          <div className="space-y-1">
            {catItems.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3 group"
              >
                <span className="text-white text-sm capitalize">{item.name}</span>
                <button
                  onClick={() => remove(item.id)}
                  className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
