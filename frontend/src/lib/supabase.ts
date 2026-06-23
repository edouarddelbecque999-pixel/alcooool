import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export type DrinkType = 'beer' | 'wine' | 'cocktail' | 'spirit' | 'water'

export interface Drink {
  id: string
  user_id: string
  type: DrinkType
  name: string
  volume_ml: number
  alcohol_pct: number
  created_at: string
  xp: number
}

export interface UserProfile {
  id: string
  weight_kg: number | null
  sex: 'male' | 'female' | null
  age: number | null
  xp_total: number
  level: number
}

export interface BACReading {
  bac: number
  sober_in_hours: number
  level: 'safe' | 'warning' | 'danger'
}

// Widmark BAC calculation
export function calculateBAC(
  drinks: Drink[],
  weightKg: number,
  sex: 'male' | 'female',
  resetAt?: string
): BACReading {
  if (!weightKg || !sex) {
    return { bac: 0, sober_in_hours: 0, level: 'safe' }
  }

  const now = Date.now()
  const resetTime = resetAt ? new Date(resetAt).getTime() : 0

  // Filter drinks after reset
  const relevantDrinks = drinks.filter(d => new Date(d.created_at).getTime() > resetTime)

  // Calculate total alcohol in grams
  let totalAlcoholGrams = 0
  for (const drink of relevantDrinks) {
    const alcoholGrams = (drink.volume_ml * drink.alcohol_pct / 100) * 0.789 // ethanol density
    totalAlcoholGrams += alcoholGrams
  }

  // Widmark formula
  const r = sex === 'male' ? 0.68 : 0.55 // body water ratio
  let bac = (totalAlcoholGrams / (weightKg * 1000 * r)) * 100 // in g/L

  // Apply decay (0.15 g/L per hour)
  for (const drink of relevantDrinks) {
    const hoursSinceDrink = (now - new Date(drink.created_at).getTime()) / (1000 * 60 * 60)
    bac = Math.max(0, bac - (0.15 * hoursSinceDrink * (totalAlcoholGrams > 0 ? 1 : 0)))
  }

  // Recalculate with proper decay
  let alcoholRemaining = 0
  for (const drink of relevantDrinks) {
    const hoursSinceDrink = (now - new Date(drink.created_at).getTime()) / (1000 * 60 * 60)
    const alcoholGrams = (drink.volume_ml * drink.alcohol_pct / 100) * 0.789
    const decayed = 0.15 * (weightKg * 1000 * r) / 100 * hoursSinceDrink
    alcoholRemaining += Math.max(0, alcoholGrams - decayed)
  }

  bac = Math.max(0, (alcoholRemaining / (weightKg * 1000 * r)) * 100)
  const soberInHours = bac > 0 ? bac / 0.15 : 0

  const level: 'safe' | 'warning' | 'danger' = bac < 0.2 ? 'safe' : bac < 0.5 ? 'warning' : 'danger'

  return {
    bac: Math.round(bac * 100) / 100,
    sober_in_hours: Math.round(soberInHours * 10) / 10,
    level
  }
}

export function calculateXP(type: DrinkType): number {
  const xpMap: Record<DrinkType, number> = {
    spirit: 20,
    cocktail: 15,
    wine: 12,
    beer: 10,
    water: 5
  }
  return xpMap[type]
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 100) + 1
}
