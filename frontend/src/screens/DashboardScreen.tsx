import { useState, useEffect } from 'react'
import { supabase, calculateBAC, type Drink, type DrinkType, calculateXP, getLevelFromXP } from '../lib/supabase'
import { Beer, Wine, GlassWater, Droplets, Car, Plus } from 'lucide-react'

const quickAddDrinks: { type: DrinkType; name: string; icon: typeof Beer; volume: number; alcohol: number }[] = [
  { type: 'beer', name: 'Biere', icon: Beer, volume: 500, alcohol: 5 },
  { type: 'wine', name: 'Vin', icon: Wine, volume: 150, alcohol: 12 },
  { type: 'cocktail', name: 'Cocktail', icon: GlassWater, volume: 200, alcohol: 15 },
  { type: 'spirit', name: 'Spiritueux', icon: Droplets, volume: 50, alcohol: 40 },
]

export default function DashboardScreen() {
  const [drinks, setDrinks] = useState<Drink[]>([])
  const [profile, setProfile] = useState<{ weight_kg: number | null; sex: 'male' | 'female' | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingDrink, setAddingDrink] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [drinksResult, profileResult] = await Promise.all([
      supabase.from('drinks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('weight_kg, sex').eq('id', user.id).single()
    ])

    if (drinksResult.data) setDrinks(drinksResult.data)
    if (profileResult.data) setProfile(profileResult.data)
    setLoading(false)
  }

  const bacReading = calculateBAC(
    drinks,
    profile?.weight_kg || 70,
    profile?.sex || 'male'
  )

  const addDrink = async (type: DrinkType, name: string, volume: number, alcohol: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setAddingDrink(true)
    const xp = calculateXP(type)

    const { error } = await supabase.from('drinks').insert({
      user_id: user.id,
      type,
      name,
      volume_ml: volume,
      alcohol_pct: alcohol,
      xp
    })

    if (!error) {
      await loadData()
    }
    setAddingDrink(false)
    setShowAddModal(false)
  }

  const getBacColor = () => {
    switch (bacReading.level) {
      case 'safe': return 'text-success'
      case 'warning': return 'text-warning'
      case 'danger': return 'text-error'
    }
  }

  const getBacBgColor = () => {
    switch (bacReading.level) {
      case 'safe': return 'bg-success'
      case 'warning': return 'bg-warning'
      case 'danger': return 'bg-error'
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="h-full relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/9807251/pexels-photo-9807251.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-surface to-surface" />

      {/* Content */}
      <div className="relative h-full flex flex-col px-6 py-8">
        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-on-surface-secondary text-sm">Votre taux actuel</p>
        </div>

        {/* BAC Gauge */}
        <div className="flex-1 flex flex-col items-center justify-start pt-4">
          <div className="relative w-56 h-56">
            {/* Circular progress background */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-surface-tertiary"
              />
              {/* Progress track */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(bacReading.bac / 2, 1) * 283} 283`}
                className={getBacColor()}
                style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${getBacColor()}`}>
                {bacReading.bac.toFixed(2)}
              </span>
              <span className="text-on-surface-secondary text-sm mt-1">g/L</span>
            </div>
          </div>

          {/* Sober time */}
          {bacReading.bac > 0 && (
            <div className="mt-6 text-center">
              <p className="text-on-surface-secondary text-sm">Repos dans</p>
              <p className="text-xl font-semibold text-on-surface">
                {Math.floor(bacReading.sober_in_hours)}h {Math.round((bacReading.sober_in_hours % 1) * 60)}m
              </p>
            </div>
          )}

          {/* Level indicator */}
          <div className={`mt-4 px-4 py-2 rounded-full ${getBacBgColor()} bg-opacity-20`}>
            <span className={`text-sm font-medium ${getBacColor()}`}>
              {bacReading.level === 'safe' ? 'OK pour conduire' : bacReading.level === 'warning' ? 'Attention' : 'Interdit de conduire'}
            </span>
          </div>
        </div>

        {/* Quick Add Grid */}
        <div className="mt-8">
          <p className="text-on-surface-secondary text-sm mb-3">Ajouter rapidement</p>
          <div className="grid grid-cols-4 gap-3">
            {quickAddDrinks.map((drink) => {
              const Icon = drink.icon
              return (
                <button
                  key={drink.type}
                  onClick={() => addDrink(drink.type, drink.name, drink.volume, drink.alcohol)}
                  disabled={addingDrink}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-brand-tertiary hover:bg-brand-tertiary/80 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Icon className="w-6 h-6 text-on-brand-tertiary" />
                  <span className="text-xs text-on-brand-tertiary font-medium">{drink.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Add custom drink button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 w-full py-3 flex items-center justify-center gap-2 rounded-lg border border-border text-on-surface-secondary hover:bg-surface-secondary transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter une boisson</span>
        </button>

        {/* Hydration reminder */}
        <div className="mt-6 p-4 rounded-lg glass border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-on-surface font-medium">Hydratation</p>
              <p className="text-on-surface-secondary text-sm">Pensez a boire de l'eau!</p>
            </div>
          </div>
        </div>

        {/* Safe Ride FAB */}
        <button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-brand flex items-center justify-center shadow-lg hover:bg-brand-secondary transition-colors z-40">
          <Car className="w-6 h-6 text-on-brand" />
        </button>

        {/* Disclaimer */}
        <p className="mt-4 text-center text-xs text-on-surface-secondary">
          Estimations indicatives. Ne remplacent jamais un ethylotest homologue.
        </p>
      </div>

      {/* Add Drink Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-lg bg-surface-secondary rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Ajouter une boisson</h2>
            <div className="space-y-3">
              {quickAddDrinks.map((drink) => {
                const Icon = drink.icon
                return (
                  <button
                    key={drink.type}
                    onClick={() => addDrink(drink.type, drink.name, drink.volume, drink.alcohol)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg bg-surface-tertiary hover:bg-brand-tertiary/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-tertiary flex items-center justify-center">
                      <Icon className="w-6 h-6 text-on-brand-tertiary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{drink.name}</p>
                      <p className="text-sm text-on-surface-secondary">{drink.volume}ml - {drink.alcohol}%</p>
                    </div>
                    <Plus className="w-5 h-5 text-on-surface-secondary" />
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 w-full py-3 text-center text-on-surface-secondary hover:text-on-surface transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
