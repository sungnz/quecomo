'use client'

import { useState, useRef } from 'react'
import { PantryItem } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { value: 'heladera', label: '🧊 Heladera' },
  { value: 'freezer', label: '🧊 Freezer' },
  { value: 'verduras', label: '🥦 Verduras' },
  { value: 'despensa', label: '🫙 Despensa' },
] as const

interface AddIngredientsProps {
  userId: string
  onAdded: (items: PantryItem[]) => void
  onClose: () => void
}

export default function AddIngredients({ userId, onAdded, onClose }: AddIngredientsProps) {
  const [mode, setMode] = useState<'text' | 'voice' | 'photo'>('text')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<PantryItem['category']>('heladera')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [photoIngredients, setPhotoIngredients] = useState<{ nombre: string; categoria: PantryItem['category'] }[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [photoError, setPhotoError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function addSingleItem() {
    if (!name.trim()) return
    setLoading(true)
    const { data } = await supabase
      .from('pantry_items')
      .insert({ user_id: userId, name: name.trim(), category })
      .select()
      .single()
    if (data) onAdded([data])
    setName('')
    setLoading(false)
  }

  function startVoice() {
    type SpeechRecognitionCtor = new () => {
      lang: string
      continuous: boolean
      interimResults: boolean
      onstart: (() => void) | null
      onend: (() => void) | null
      onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null
      start: () => void
    }
    const SpeechRecognition = (window as unknown as { webkitSpeechRecognition: SpeechRecognitionCtor }).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Usá Chrome.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'es-AR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript
      setListening(false)
      setLoading(true)
      const parsed = text.split(/,|y /).map((s: string) => s.trim()).filter(Boolean)
      const rows = parsed.map((item: string) => ({ user_id: userId, name: item, category }))
      const { data } = await supabase.from('pantry_items').insert(rows).select()
      if (data) onAdded(data)
      setLoading(false)
    }
    recognition.start()
  }

  function convertToJpeg(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const MAX = 1200
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else { width = Math.round(width * MAX / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas vacío')), 'image/jpeg', 0.85)
      }
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      img.src = url
    })
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setPhotoError('')
    try {
      const jpeg = await convertToJpeg(file)
      const formData = new FormData()
      formData.append('photo', jpeg, 'photo.jpg')
      const res = await fetch('/api/parse-photo', { method: 'POST', body: formData })
      const text = await res.text()
      if (!text) {
        setPhotoError('No se recibió respuesta. Intentá con otra foto.')
        setLoading(false)
        return
      }
      const data = JSON.parse(text)
      if (!res.ok) {
        setPhotoError(data.error ?? 'Error al analizar la foto.')
      } else if (data.ingredientes) {
        setPhotoIngredients(data.ingredientes)
        setSelected(new Set(data.ingredientes.map((_: unknown, i: number) => i)))
      }
    } catch {
      setPhotoError('Error inesperado. Intentá con otra foto o usá texto.')
    }
    setLoading(false)
  }

  async function addSelectedPhotoItems() {
    setLoading(true)
    const toAdd = photoIngredients
      .filter((_, i) => selected.has(i))
      .map(item => ({ user_id: userId, name: item.nombre, category: item.categoria }))
    const { data } = await supabase.from('pantry_items').insert(toAdd).select()
    if (data) onAdded(data)
    setPhotoIngredients([])
    setSelected(new Set())
    setLoading(false)
  }

  function toggleSelect(i: number) {
    const next = new Set(selected)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    setSelected(next)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-zinc-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-800">
        <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Agregar ingredientes</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            {(['text', 'voice', 'photo'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setPhotoIngredients([]) }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  mode === m ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {m === 'text' ? '✏️ Escribir' : m === 'voice' ? '🎙 Voz' : '📷 Foto'}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-5">
          {mode === 'text' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="ej: huevos, milanesas, tomates..."
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSingleItem()}
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-2xl py-3 px-4 focus:outline-none focus:border-green-500 transition-colors"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      category === cat.value ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <button
                onClick={addSingleItem}
                disabled={!name.trim() || loading}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-semibold py-3.5 rounded-2xl transition-colors"
              >
                {loading ? 'Guardando...' : 'Agregar'}
              </button>
            </div>
          )}

          {mode === 'voice' && (
            <div className="text-center py-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      category === cat.value ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <button
                onClick={startVoice}
                disabled={listening || loading}
                className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl transition-all ${
                  listening ? 'bg-red-600 scale-110 animate-pulse' : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                🎙
              </button>
              <p className="text-zinc-400 text-sm">
                {listening ? 'Escuchando...' : loading ? 'Guardando...' : 'Tocá y decí tus ingredientes separados por coma'}
              </p>
            </div>
          )}

          {mode === 'photo' && photoIngredients.length === 0 && (
            <div className="text-center py-6 space-y-4">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="w-full h-32 border-2 border-dashed border-zinc-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-green-500 transition-colors"
              >
                <span className="text-4xl">{loading ? '⏳' : '📷'}</span>
                <span className="text-zinc-400 text-sm">{loading ? 'Analizando foto...' : 'Sacar o subir foto de la heladera'}</span>
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" capture="environment" className="hidden" onChange={handlePhoto} />
              {photoError && <p className="text-red-400 text-sm text-center">{photoError}</p>}
            </div>
          )}

          {mode === 'photo' && photoIngredients.length > 0 && (
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm">Seleccioná los que querés agregar:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {photoIngredients.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                      selected.has(i) ? 'bg-green-900 border border-green-600' : 'bg-zinc-800 border border-transparent'
                    }`}
                  >
                    <span className="text-white text-sm">{item.nombre}</span>
                    <span className="text-zinc-400 text-xs">{item.categoria}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={addSelectedPhotoItems}
                disabled={selected.size === 0 || loading}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-semibold py-3.5 rounded-2xl transition-colors"
              >
                {loading ? 'Guardando...' : `Agregar ${selected.size} ingrediente${selected.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
