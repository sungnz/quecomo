export interface PantryItem {
  id: string
  user_id: string
  name: string
  category: 'heladera' | 'freezer' | 'despensa' | 'verduras'
  created_at: string
}

export interface Recipe {
  nombre: string
  tiempo: string
  ingredientesUsados: string[]
  ingredientesFaltantes: string[]
  pasos: string[]
  tip?: string
}
