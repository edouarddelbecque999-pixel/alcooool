import { useState, useEffect } from 'react'
import { supabase, type Drink, type DrinkType } from '../lib/supabase'
import { Beer, Wine, GlassWater, Droplets, Trash2 } from 'lucide-react'

const drinkIcons: Record<DrinkType, typeof Beer> = {
  beer: Beer,
  wine: Wine,
  cocktail: GlassWater,
  spirit: Droplets,
  water: Droplets
}

const drinkColors: Record<DrinkType, string> = {
  beer: 'text-yellow-500',
  wine: 'text-red-500',
  cocktail: 'text-pink-500',
  spirit: 'text-blue-500',
  water: 'text-cyan-500'
}

export default function HistoryScreen() {
  const [drinks, setDrinks] = useState<Drink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDrinks()
  }, [])

  const loadDrinks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('drinks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) setDrinks(data)
    setLoading(false)
  }

  const deleteDrink = async (id: string) => {
    await supabase.from('drinks').delete().eq('id', id)
    setDrinks(drinks.filter((d) => d.id !== id))
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return 'Il y a moins d\'1h'
    if (hours < 24) return `Il y a ${hours}h`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const groupedDrinks = drinks.reduce((acc, drink) => {
    const date = new Date(drink.created_at).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(drink)
    return acc
  }, {} as Record<string, Drink[]>)

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (drinks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
          <Beer className="w-10 h-10 text-on-surface-secondary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Aucune boisson</h2>
        <p className="text-on-surface-secondary text-center">
          Vous n'avez pas encore enregistre de boissons aujourd'hui.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Historique</h1>

      <div className="space-y-6">
        {Object.entries(groupedDrinks).map(([date, dateDrinks]) => (
          <div key={date}>
            <h2 className="text-sm text-on-surface-secondary mb-3">
              {new Date(date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </h2>
            <div className="space-y-2">
              {dateDrinks.map((drink) => {
                const Icon = drinkIcons[drink.type]
                const colorClass = drinkColors[drink.type]
                return (
                  <div
                    key={drink.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-surface-secondary border border-border"
                  >
                    <div className="w-12 h-12 rounded-lg bg-surface-tertiary flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${colorClass}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{drink.name}</p>
                      <p className="text-sm text-on-surface-secondary">
                        {drink.volume_ml}ml - {drink.alcohol_pct}% - {drink.xp} XP
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-on-surface-secondary">
                        {formatTime(drink.created_at)}
                      </p>
                      <button
                        onClick={() => deleteDrink(drink.id)}
                        className="mt-1 text-xs text-error hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
