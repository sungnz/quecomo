import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json({ error: 'No se recibió foto' }, { status: 400 })
    }

    const mediaType = SUPPORTED_TYPES.includes(file.type)
      ? file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      : 'image/jpeg'

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `Mirá esta foto de una heladera, despensa o alimentos y listame todos los ingredientes o alimentos que ves.

Responde ÚNICAMENTE con un JSON válido:
{
  "ingredientes": [
    { "nombre": "nombre del ingrediente en español", "categoria": "heladera|freezer|despensa|verduras" }
  ]
}

Sé específico (ej: "queso cremoso" en vez de "queso"). No incluyas objetos que no sean alimentos. Solo el JSON.`,
            },
          ],
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Error al procesar imagen' }, { status: 500 })
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'No se detectaron ingredientes' }, { status: 400 })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (err) {
    console.error('parse-photo error:', err)
    return NextResponse.json({ error: 'Error al analizar la foto. Intentá con otra imagen.' }, { status: 500 })
  }
}
