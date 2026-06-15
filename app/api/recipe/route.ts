import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: items } = await supabase
    .from('pantry_items')
    .select('name, category')
    .eq('user_id', user.id)

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Tu despensa está vacía. Agregá ingredientes primero.' }, { status: 400 })
  }

  const ingredientesPorCategoria = items.reduce((acc: Record<string, string[]>, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item.name)
    return acc
  }, {})

  const listaIngredientes = Object.entries(ingredientesPorCategoria)
    .map(([cat, names]) => `${cat}: ${names.join(', ')}`)
    .join('\n')

  const semilla = Math.random().toString(36).slice(2, 8)

  const prompt = `Sos un experto en cocina casera argentina. (semilla aleatoria: ${semilla})

=== GLOSARIO ARGENTINO (MUY IMPORTANTE) ===
- Milanesa: carne (res, pollo o cerdo) pasada por huevo y pan rallado, frita o al horno. NO es solo carne sin empanar.
- Milanesa napolitana: milanesa con salsa de tomate, jamón y queso derretido encima, gratinada.
- Asado/costillar/vacío/tira de asado: cortes de carne vacuna para parrilla o cacerola.
- Empanadas: masa rellena y sellada, se fríen o se hornean. El relleno clásico es carne picada con cebolla, huevo duro y aceitunas.
- Empanadas de sartén: empanadas que se hacen en sartén con un poco de aceite, sin horno.
- Pastel de papa: carne picada sazonada cubierta con puré de papa, se gratina en horno.
- Tarta: masa rellena abierta (sin tapa o con tapa). Relleno típico: verduras (acelga, espinaca, zapallito) con queso y huevo.
- Revuelto gramajo: papas fritas en bastones con jamón o carne, huevo revuelto, todo mezclado.
- Locro: guiso espeso de maíz blanco, porotos, zapallo y carne (cerdo, chorizo, mondongo).
- Carbonada: guiso de carne con arroz, papa, choclo y zapallo.
- Puchero: hervido de carne con verduras (papa, zanahoria, choclo, zapallo).
- Fideos con tuco: fideos con salsa de tomate casera con carne picada.
- Fideos con manteca y queso: fideos cocidos con manteca y queso rallado, lo más simple.
- Arroz con leche: postre, no plato principal.
- Tortilla española: huevo batido con papa cocida en rodajas, se hace en sartén vuelta y vuelta.
- Suprema de pollo: pechuga de pollo entera, puede ser a la plancha, al horno o empanada.
- Matambre: corte de carne vacuna fino, se rellena y se arolla (matambre arrollado) o se hace a la plancha.
- Vitel toné: matambre o peceto frío con salsa de atún y anchoas (plato de fiesta, difícil sin esos ingredientes).
- Guiso de lentejas: lentejas con verduras, chorizo colorado, panceta.
- Sopa de verduras: caldo con zanahoria, papa, apio, puerro, fideos o arroz.
- Cazuela de pollo: pollo troceado cocinado en salsa con verduras.
- Churrasco: bife fino de res a la plancha o parrilla, se come con guarnición (papa, ensalada).

=== INGREDIENTES QUE TENGO ===
${listaIngredientes}

=== TU TAREA ===
Elegí UNA sola receta argentina casera, fácil, sabrosa y que pueda hacerse en menos de 40 minutos usando principalmente lo que tengo. Variá entre distintos tipos de platos (no siempre lo mismo). Usá el glosario para describir los pasos correctamente según la cocina argentina real.

Responde ÚNICAMENTE con un JSON válido:
{
  "nombre": "nombre real de la receta argentina",
  "tiempo": "XX minutos",
  "ingredientesUsados": ["ingrediente 1", "ingrediente 2"],
  "ingredientesFaltantes": ["solo si falta algo muy básico como sal, aceite o pan rallado"],
  "pasos": [
    "Paso 1 detallado con técnica argentina correcta",
    "Paso 2",
    "Paso 3"
  ],
  "tip": "consejo corto y útil (opcional)"
}

Solo el JSON, sin texto adicional.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    temperature: 1,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Error al generar receta' }, { status: 500 })
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Error al procesar receta' }, { status: 500 })
  }

  const recipe = JSON.parse(jsonMatch[0])
  return NextResponse.json(recipe)
}
