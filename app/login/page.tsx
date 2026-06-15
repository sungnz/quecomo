'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function loginWithEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setSent(true)
    setLoading(false)
  }

  async function loginWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🥗</div>
          <h1 className="text-3xl font-bold text-white">¿Qué Como?</h1>
          <p className="text-zinc-400 mt-2 text-sm">Una receta con lo que tenés en tu heladera</p>
        </div>

        {sent ? (
          <div className="text-center bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <div className="text-3xl mb-3">📬</div>
            <p className="text-white font-semibold">Revisá tu mail</p>
            <p className="text-zinc-400 text-sm mt-2">Te mandamos un link mágico a <span className="text-green-400">{email}</span></p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={loginWithGoogle}
              className="w-full bg-white text-zinc-900 font-semibold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-100 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Entrar con Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-zinc-500 text-xs">o con email</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <form onSubmit={loginWithEmail} className="space-y-3">
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-2xl py-3.5 px-4 focus:outline-none focus:border-green-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition-colors"
              >
                {loading ? 'Enviando...' : 'Recibir link de acceso'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-zinc-600 text-xs mt-8">
          Sin contraseñas. Sin vueltas.
        </p>
      </div>
    </div>
  )
}
