'use client'

import { Recipe } from '@/lib/types'

interface RecipeCardProps {
  recipe: Recipe
  onClose: () => void
}

export default function RecipeCard({ recipe, onClose }: RecipeCardProps) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 px-6 pt-6 pb-4 border-b border-zinc-800 rounded-t-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-1">Tu receta de hoy</p>
              <h2 className="text-white text-xl font-bold leading-tight">{recipe.nombre}</h2>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              ⏱ {recipe.tiempo}
            </span>
            <span className="bg-green-950 text-green-400 text-xs px-3 py-1 rounded-full">
              Con lo que tenés
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div>
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Ingredientes que usás</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.ingredientesUsados.map((ing, i) => (
                <span key={i} className="bg-zinc-800 text-zinc-200 text-sm px-3 py-1 rounded-full">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {recipe.ingredientesFaltantes && recipe.ingredientesFaltantes.length > 0 && (
            <div>
              <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Puede que necesites</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredientesFaltantes.map((ing, i) => (
                  <span key={i} className="border border-zinc-700 text-zinc-400 text-sm px-3 py-1 rounded-full">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Cómo hacerlo</h3>
            <ol className="space-y-3">
              {recipe.pasos.map((paso, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-zinc-300 text-sm leading-relaxed">{paso}</p>
                </li>
              ))}
            </ol>
          </div>

          {recipe.tip && (
            <div className="bg-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">💡 Tip</p>
              <p className="text-zinc-200 text-sm">{recipe.tip}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-8">
          <button
            onClick={onClose}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3.5 rounded-2xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
