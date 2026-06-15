'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PantryItem, Recipe } from '@/lib/types'
import PantryList from '@/components/PantryList'
import AddIngredients from '@/components/AddIngredients'
import RecipeCard from '@/components/RecipeCard'
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<PantryItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loadingRecipe, setLoadingRecipe] = useState(false)
  const [error, setError] = useState('')
  const supabaseRef = useRef<SupabaseClient | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  useEffect(() => {
    if (!user) return
    getSupabase()
      .from('pantry_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data ?? []))
  }, [user])

  async function getRecipe() {
    setLoadingRecipe(true)
    setError('')
    try {
      const res = await fetch('/api/recipe', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al generar receta')
      } else {
        setRecipe(data)
      }
    } catch {
      setError('Algo salió mal. Intentá de nuevo.')
    }
    setLoadingRecipe(false)
  }

  async function signOut() {
    await getSupabase().auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 pb-32">
        <header className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-white font-bold text-xl">¿Qué Como?</h1>
            <p className="text-zinc-500 text-xs mt-0.5">{items.length} ingrediente{items.length !== 1 ? 's' : ''} en tu cocina</p>
          </div>
          <button onClick={signOut} className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </header>

        <PantryList
          items={items}
          onRemove={id => setItems(prev => prev.filter(i => i.id !== id))}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-900 px-4 py-4">
        <div className="max-w-lg mx-auto space-y-3">
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setShowAdd(true)}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Agregar
            </button>
            <button
              onClick={getRecipe}
              disabled={loadingRecipe || items.length === 0}
              className="flex-[2] bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              {loadingRecipe ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Pensando...
                </>
              ) : (
                '¿Qué como hoy?'
              )}
            </button>
          </div>
        </div>
      </div>

      {showAdd && user && (
        <AddIngredients
          userId={user.id}
          onAdded={newItems => {
            setItems(prev => [...newItems, ...prev])
            setShowAdd(false)
          }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {recipe && (
        <RecipeCard recipe={recipe} onClose={() => setRecipe(null)} />
      )}
    </div>
  )
}
